// Public official HTML only. Product metadata is cached; images and reviews are not downloaded.
import { mkdir, writeFile, readFile } from "node:fs/promises";
const root = new URL("../docs/research/", import.meta.url);
await mkdir(root, { recursive: true });
const strip = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
async function page(url) {
  if (!url.startsWith("https://bebodywise.com/"))
    throw new Error("Only official URLs allowed");
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
  );
  return {
    html,
    data: match ? JSON.parse(match[1]).props?.pageProps?.pageData?.data : null,
    finalUrl: response.url,
  };
}
if (process.argv[2] === "--export") {
  const { readdir } = await import("node:fs/promises");
  const records = [];
  for (const filename of await readdir(root)) {
    if (!filename.endsWith(".json") || /sources|index|collected/.test(filename))
      continue;
    const r = JSON.parse(await readFile(new URL(filename, root), "utf8"));
    if (!r.name || !r.finalUrl) continue;
    const formal =
      r.sections?.find((s) => /products\.0.netQuantity$/.test(s.path))?.text ||
      null;
    const ownIngredientList = (r.accordions || [])
      .flatMap((a) => a.list || [])
      .find((a) => /full list of ingredients/i.test(a.title));
    const inci = ownIngredientList?.content.match(
      /Ingredient Names\s*<\/b>\s*<br\s*\/?>(?:\s*<span>)?([\s\S]*?)(?:<\/span>|<br)/i,
    )?.[1];
    records.push({
      slug: filename.replace(".json", ""),
      name: r.name,
      productId: r.productId || null,
      description: r.description || null,
      officialCategory: r.category || null,
      componentSizes: (r.sections || [])
        .filter((s) => /products\.\d+\.netQuantity$/.test(s.path))
        .map((s) => s.text),
      checkedOn: r.checkedOn,
      url: r.finalUrl,
      brandConcern: r.subtitle || r.productFor || r.concern || null,
      price: typeof r.price === "number" && r.price > 0 ? r.price : null,
      sizeTags: r.sizeTags || [],
      formalSize: formal,
      keyIngredients: r.keyIngredients || [],
      ingredientList: inci ? strip(inci) : null,
      usage: r.usage || null,
      imageSource: r.imageSource || r.heroSource || null,
      outOfStock: typeof r.outOfStock === "boolean" ? r.outOfStock : null,
      isRx: r.isRx === true,
      isKit: r.isKit === true,
    });
  }
  await writeFile(
    new URL("../src/data/catalogue-sources.json", import.meta.url),
    JSON.stringify(records, null, 2) + "\n",
  );
  console.log(
    "Exported",
    records.length,
    "source records; salicylic wash sizes remain variants.",
  );
} else if (process.argv[2] === "--index") {
  const found = new Map();
  for (const url of process.argv[3]
    ? [process.argv[3]]
    : ["https://bebodywise.com/sitemap"]) {
    try {
      const { html } = await page(url);
      for (const match of html.matchAll(
        /href="(?:https:\/\/bebodywise\.com)?(\/product\/[^"?#]+)"[^>]*>([\s\S]*?)<\/a>/g,
      )) {
        if (!/all-reviews|all-questions/.test(match[1]))
          found.set(match[1], strip(match[2]).slice(0, 160));
      }
    } catch (e) {
      console.log(url, e.message);
    }
  }
  await writeFile(
    new URL("official-index.json", root),
    JSON.stringify([...found], null, 2),
  );
  console.log(JSON.stringify([...found], null, 2));
} else {
  const urls =
    process.argv[2] === "--collect"
      ? JSON.parse(
          await readFile(
            new URL(process.argv[3] || "selected-sources.json", root),
            "utf8",
          ),
        )
      : [
          process.argv[2] ||
            "https://bebodywise.com/product/salicylic-ceramide-bodywash",
        ];
  const output = [];
  let failures = [];
  try {
    failures = JSON.parse(
      await readFile(new URL("collection-failures.json", root), "utf8"),
    );
  } catch {
    /* First collection run. */
  }
  for (let offset = 0; offset < urls.length; offset += 1) {
    await Promise.all(
      urls.slice(offset, offset + 1).map(async (url) => {
        const slug = url.split("/").pop();
        const cache = new URL(`${slug}.json`, root);
        try {
          let record;
          try {
            record = JSON.parse(await readFile(cache, "utf8"));
          } catch {
            const previousFailure = failures.find((f) => f.url === url);
            if (previousFailure && !process.argv.includes("--retry")) {
              console.log(
                JSON.stringify({
                  url,
                  error: previousFailure.error,
                  cached: true,
                }),
              );
              return;
            }
            const { data, finalUrl } = await page(url);
            const p = data?.productInfo;
            if (!p?.name || !p?.id) throw new Error("No product record");
            const sections = [];
            function walk(value, path = "") {
              if (!value || typeof value !== "object") return;
              if (
                /review|testimonial|customer|clinical|beforeAfter|story|rating/i.test(
                  path,
                )
              )
                return;
              if (value.type || value.widgetType)
                sections.push({
                  path,
                  type: value.type || value.widgetType,
                  keys: Object.keys(value),
                });
              for (const [key, v] of Object.entries(value)) {
                if (
                  typeof v === "string" &&
                  /ingredient|usage|information|quantity|patch|caution|howToUse/i.test(
                    path + "." + key,
                  )
                )
                  sections.push({ path: path + "." + key, text: strip(v) });
                else if (typeof v === "object") walk(v, path + "." + key);
              }
            }
            walk(data.widgets, "widgets");
            const accordions = (data.widgets || [])
              .filter((w) => w.type === "ACCORDION")
              .map((w) => w.widgetData);
            record = {
              url,
              finalUrl,
              checkedOn: "2026-10-12",
              name: p.name,
              productId: p.id,
              subtitle: p.subtitle,
              concern: p.concern,
              productFor: p.productFor,
              category: p.category,
              price: p.discountedPrice ?? p.actualPrice ?? null,
              sizeTags: p.tags?.filter((t) =>
                /\d.*(ml|g\b|pcs|mL|ML)/i.test(t),
              ),
              keyIngredients: p.key_ingredients,
              usageInstructions: p.usage_instructions,
              description: strip(data.description?.details?.text),
              usage: strip(data.description?.usage?.text),
              imageSource: p.prod_img,
              heroSource: data.meta?.productLdJson?.image,
              outOfStock: p.out_of_stock,
              isKit: p.is_kit,
              isRx: p.is_rx,
              accordions,
              sections,
            };
            await writeFile(cache, JSON.stringify(record, null, 2));
          }
          output.push(record);
          console.log(
            JSON.stringify({
              url: record.url,
              name: record.name,
              price: record.price,
              sizeTags: record.sizeTags,
              keyIngredients: record.keyIngredients,
            }),
          );
        } catch (e) {
          failures = failures.filter((f) => f.url !== url);
          failures.push({ url, error: e.message, checkedOn: "2026-10-12" });
          await writeFile(
            new URL("collection-failures.json", root),
            JSON.stringify(failures, null, 2),
          );
          console.log(JSON.stringify({ url, error: e.message }));
        }
      }),
    );
  }
  if (process.argv[2] === "--collect")
    await writeFile(
      new URL("collected.json", root),
      JSON.stringify(output, null, 2),
    );
}
