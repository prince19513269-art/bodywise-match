import test from "node:test";
import assert from "node:assert/strict";
import {
  products,
  catalogueStats,
  catalogueCategories,
} from "../src/data/products";
import { ingredients } from "../src/data/ingredients";
import { filterProducts } from "../src/lib/catalogue";
import sources from "../src/data/catalogue-sources.json";
import discovery from "../docs/research/complete-discovery.json";
import failures from "../docs/research/collection-failures.json";
import { catalogueGroups } from "../src/data/catalogue-groups";
import { verifiedIngredientIds } from "../src/data/ingredient-evidence";
import { getCareCategories } from "../src/data/categories";
import {
  thingsToKeepInMind,
  customerPrecautions,
} from "../src/lib/product-copy";

test("every visible care category has products and empty categories disappear", () => {
  const defaults = {
    query: "",
    category: "All categories",
    concern: "All concerns",
  };
  const categories = getCareCategories(products);
  assert.equal(categories.length, 8);
  assert.ok(products.every((p) => categories.some((c) => c.includes(p))));
  for (const c of categories) {
    assert.ok(c.count > 0);
    const selected = filterProducts(products, { ...defaults, care: c.id });
    assert.equal(selected.length, c.count);
    assert.ok(selected.every(c.includes));
  }
  assert.equal(getCareCategories([]).length, 0);
  const onlyHair = products.filter((p) => p.category === "Shampoo");
  assert.deepEqual(
    getCareCategories(onlyHair).map((c) => c.id),
    ["hair"],
  );
});
test("shopper transparency retains conflicts without exposing internal image/process notes", () => {
  for (const p of products) {
    const copy = thingsToKeepInMind(p).join(" ");
    assert.doesNotMatch(
      copy,
      /permission|prototype|verification|source record|image/i,
    );
    assert.equal(customerPrecautions(p).length, p.precautions.length);
  }
  assert.match(
    thingsToKeepInMind(
      products.find((p) => p.id === "4-aha-bha-underarm-roll-on-no-fragrance")!,
    ).join(" "),
    /fragrance/,
  );
  assert.match(
    thingsToKeepInMind(
      products.find((p) => p.id === "ultra-light-sunscreen-spf50")!,
    ).join(" "),
    /pack sizes/,
  );
});
const all = { query: "", category: "All categories", concern: "All concerns" };
test("expanded catalogue and ingredient guides have resolvable official evidence", () => {
  assert.equal(products.length, 87);
  assert.equal(ingredients.length, 42);
  assert.equal(
    new Set(products.map((p) => p.formulaKey)).size,
    products.length,
  );
  for (const p of products) {
    const source = sources.find((s) => s.slug === p.formulaKey);
    assert.ok(source);
    assert.equal(p.name, source.name);
    assert.equal(p.price, source.price);
    assert.ok(p.source?.url.startsWith("https://bebodywise.com/product/"));
    assert.equal(p.source?.checkedOn, "2026-10-12");
    for (const id of p.ingredientIds)
      assert.ok(
        ingredients.some((i) => i.id === id),
        `${p.id}: missing ${id}`,
      );
  }
  for (const i of ingredients)
    assert.ok(
      products.some((p) => p.ingredientIds.includes(i.id)),
      `${i.id} has no verified product`,
    );
});
test("size variants are grouped and not counted as unique products", () => {
  const wash = products.find((p) => p.id === "salicylic-body-wash-100")!;
  assert.equal(wash.variants?.length, 4);
  assert.deepEqual(
    wash.variants?.map((v) => v.size),
    ["100 ml", "250 ml", "375 ml", "700 ml"],
  );
  assert.equal(
    products.filter((p) =>
      p.formulaKey?.startsWith("1-salicylic-acid-body-wash"),
    ).length,
    1,
  );
});
test("conflicting sizes and unknown prices remain unavailable", () => {
  for (const slug of [
    "anti-dandruff-serum",
    "hair-fall-control-shampoo",
    "ultra-light-sunscreen-spf50",
  ]) {
    const p = products.find((p) => p.id === slug)!;
    assert.equal(p.size, null);
    assert.ok(p.fieldGaps?.some((s) => s.includes("conflicts")));
  }
  const unknown = products.filter((p) => p.price === null);
  assert.equal(unknown.length, 2);
  for (const p of unknown)
    assert.ok(!filterProducts([p], { ...all, budget: "₹300–₹600" }).length);
});
test("keyword, category, concern and budget filters combine without losing products", () => {
  assert.equal(filterProducts(products, all).length, products.length);
  const result = filterProducts(products, {
    query: "UREA",
    category: "Body lotion",
    concern: "Dryness",
    budget: "₹300–₹600",
  });
  assert.equal(result.length, 2);
  assert.ok(result.every((p) => p.ingredientIds.includes("urea")));
  assert.equal(
    filterProducts(products, { ...all, query: "not-a-real-product" }).length,
    0,
  );
  for (const category of catalogueCategories)
    assert.ok(
      filterProducts(products, { ...all, category }).every(
        (p) => p.category === category,
      ),
    );
  assert.ok(
    filterProducts(products, { ...all, concern: "Dandruff" }).length >= 2,
  );
});
test("every discovered official URL is accounted for once as a product, variant, alias or failed source", () => {
  const represented = products.flatMap((p) => {
    const group = catalogueGroups[p.formulaKey!];
    return [
      ...new Set([
        p.source!.url,
        ...(group?.variants || []).map(
          (slug) => `https://bebodywise.com/product/${slug}`,
        ),
        ...(group?.aliases || []).map(
          (slug) => `https://bebodywise.com/product/${slug}`,
        ),
      ]),
    ];
  });
  assert.equal(new Set(represented).size, represented.length);
  assert.equal(represented.length, sources.length);
  const accounted = new Set([...represented, ...failures.map((f) => f.url)]);
  assert.equal(accounted.size, discovery.urls.length);
  for (const url of discovery.urls) assert.ok(accounted.has(url), url);
  for (const p of products)
    assert.equal(
      new Set(p.variants?.map((v) => v.url)).size,
      p.variants?.length,
    );
});
test("ingredient relationships distinguish derivatives, nutrient salts and unrelated names", () => {
  assert.deepEqual(
    verifiedIngredientIds(
      [],
      "Imidazolidinyl Urea, Kojic Acid dipalmitate, Retinyl Palmitate, Biotinoyl Tripeptide-1, Zinc Oxide",
    ),
    ["kojic-acid-dipalmitate", "zinc-oxide"],
  );
  const cream = products.find((p) => p.id === "pigmentation-repair-cream")!;
  assert.ok(cream.ingredientIds.includes("kojic-acid-dipalmitate"));
  assert.ok(!cream.ingredientIds.includes("kojic-acid"));
  const testStrip = products.find(
    (p) => p.id === "water-hardness-test-strip-sample",
  )!;
  assert.equal(testStrip.usage, null);
  assert.deepEqual(testStrip.ingredientIds, []);
  assert.deepEqual(testStrip.keyIngredients, []);
});
test("unapproved image sources never become usable photographs", () => {
  assert.equal(catalogueStats.usableRealImages, 0);
  assert.ok(
    products.every((p) =>
      p.image?.officialSource?.startsWith("https://i.mscwlns.co/"),
    ),
  );
  assert.ok(
    products.every(
      (p) => p.image?.src === null && p.image.permission === "pending",
    ),
  );
  assert.ok(
    products.every((p) => p.missing.some((m) => m.includes("permission"))),
  );
});
test("fragrance and active-percentage conflicts are surfaced", () => {
  const roll = products.find(
    (p) => p.id === "4-aha-bha-underarm-roll-on-no-fragrance",
  )!;
  assert.ok(roll.precautions.some((p) => p.includes("Perfume")));
  const peptide = products.find(
    (p) => p.id === "1-peptide-ceramide-moisturizer",
  )!;
  assert.ok(peptide.fieldGaps?.some((g) => g.includes("2000 ppm")));
});
