// Read public official pages sequentially, cache discovery once, and never follow private endpoints.
import { readFile, writeFile, mkdir } from "node:fs/promises";
const root = new URL("../docs/research/", import.meta.url);
await mkdir(root, { recursive: true });
const urls = new Set();
const pages = [];
const queue = [
  "https://bebodywise.com/robots.txt",
  "https://bebodywise.com/sitemap",
  "https://bebodywise.com/shop/all",
];
const seen = new Set();
while (queue.length) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);
  const filename = new URL(
    `discovery-${new URL(url).pathname.replaceAll("/", "-").replaceAll(".", "-") || "home"}.json`,
    root,
  );
  let record;
  try {
    record = JSON.parse(await readFile(filename, "utf8"));
  } catch {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
      const rawHtml = response.ok ? await response.text() : "";
      const sanitizedHtml = rawHtml.replace(/AIza[0-9A-Za-z\-_]{25,}/g, "REDACTED_THIRD_PARTY_GOOGLE_MAPS_KEY");
      record = {
        url,
        finalUrl: response.url,
        checkedOn: "2026-10-12",
        status: response.status,
        html: sanitizedHtml,
      };
      await writeFile(filename, JSON.stringify(record, null, 2));
    } catch (e) {
      record = { url, status: "failed", error: e.message, html: "" };
    }
  }
  const html = record.html;
  for (const match of html.matchAll(
    /(?:https:\/\/bebodywise\.com)?\/product\/([a-zA-Z0-9-]+)/g,
  )) {
    if (!/all-reviews|all-questions/.test(match[1]))
      urls.add(`https://bebodywise.com/product/${match[1]}`);
  }
  // Collection links and explicitly advertised XML sitemaps, no guessed pagination.
  for (const match of html.matchAll(
    /(?:https:\/\/bebodywise\.com)?\/shop\/[a-zA-Z0-9-]+/g,
  )) {
    queue.push(
      match[0].startsWith("https")
        ? match[0]
        : `https://bebodywise.com${match[0]}`,
    );
  }
  for (const match of html.matchAll(
    /(?:Sitemap:\s*|<loc>)(https:\/\/bebodywise\.com\/[^\s<]+\.xml)/g,
  ))
    if (!match[1].includes("/blog/")) queue.push(match[1]);
  pages.push({
    url,
    finalUrl: record.finalUrl,
    status: record.status,
    products: [
      ...new Set(
        [...html.matchAll(/\/product\/([a-zA-Z0-9-]+)/g)].map((m) => m[1]),
      ),
    ].length,
  });
  console.log(JSON.stringify(pages.at(-1)));
}
await writeFile(
  new URL("complete-discovery.json", root),
  JSON.stringify(
    { checkedOn: "2026-10-12", pages, urls: [...urls].sort() },
    null,
    2,
  ),
);
await writeFile(
  new URL("complete-sources.json", root),
  JSON.stringify([...urls].sort(), null, 2),
);
console.log("Discovered official product URLs:", urls.size);
