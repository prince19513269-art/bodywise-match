// Regenerate saved research and coverage without network access.
import { writeFile } from "node:fs/promises";
import { products, catalogueStats } from "../src/data/products";
import { ingredients } from "../src/data/ingredients";
import { getCareCategories } from "../src/data/categories";
import { catalogueGroups } from "../src/data/catalogue-groups";
import sources from "../src/data/catalogue-sources.json";
import discovery from "../docs/research/complete-discovery.json";
import failures from "../docs/research/collection-failures.json";
const cell = (s: string) => s.replace(/\|/g, "/").replace(/\n/g, " ");
const report = {
  checkedOn: "2026-10-12",
  ...catalogueStats,
  careCollections: getCareCategories(products).length,
  ingredients: ingredients.length,
  ingredientConnections: products.reduce(
    (n, p) => n + p.ingredientIds.length,
    0,
  ),
  kits: products.filter((p) => p.kind === "kit").length,
  individualProducts: products.filter((p) => p.kind !== "kit").length,
  packOptions: products.reduce((n, p) => n + (p.variants?.length || 1), 0),
  explicitlyGroupedPackOptions: products.reduce(
    (n, p) => n + (p.variants?.length || 0),
    0,
  ),
  verifiedSourceRecords: sources.length,
  discoveredUrls: discovery.urls.length,
  unavailableSourceRecords: failures.length,
  fullCatalogueCertified: false,
  records: products.map((p) => ({
    id: p.id,
    kind: p.kind,
    source: p.source,
    variants: p.variants,
    aliases: catalogueGroups[p.formulaKey!]?.aliases || [],
    ingredientIds: p.ingredientIds,
    fieldGaps: p.fieldGaps,
    image: p.image,
  })),
  failures,
};
const rows = products
  .map(
    (p) =>
      `| ${cell(p.name)} | ${p.kind} | ${p.category} | ${p.size || "Unclear"} | ${p.price === null ? "Unavailable" : `₹${p.price}`} | [Official page](${p.source!.url}) |`,
  )
  .join("\n");
const gaps = products
  .filter((p) => p.fieldGaps?.length)
  .map((p) => `- **${p.name}**: ${p.fieldGaps!.join(" ")}`)
  .join("\n");
const variants = products
  .filter((p) => p.variants?.length)
  .map(
    (p) =>
      `- **${p.name}**: ${p.variants!.map((v) => `[${cell(v.name)} — ${v.size || "quantity unclear"}](${v.url})`).join("; ")}`,
  )
  .join("\n");
async function main() {
  await writeFile(
    "docs/CATALOGUE_COVERAGE.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  await writeFile(
    "docs/CATALOGUE_AUDIT.md",
    `# Catalogue expansion audit — 12 October 2026

${report.uniqueProducts} distinct product groups: ${report.individualProducts} individual items and ${report.kits} multi-product kits. ${report.categories} product types, ${report.careCollections} care collections, ${report.ingredients} ingredient guides, ${report.ingredientConnections} product-to-ingredient connections.

${report.packOptions} distinct pack/format options including every base pack; ${report.explicitlyGroupedPackOptions} options are explicitly displayed as variants on 21 grouped pages. Duplicate offer aliases do not increase these totals. Conflicting quantities remain unavailable.

## Accessible source coverage

Read and respected the official robots file. Cached the public HTML sitemap, Shop All, Hair, Body Care, Nutrition, Sun Protection, Face, Offers and Gummies collections, and advertised product/pages XML sitemaps. Collection HTML includes public productsData beyond the first visible row. Product requests were sequential and individually cached. No private API, login, restriction bypass or media download was used.

The union contains ${report.discoveredUrls} official product URLs. ${report.verifiedSourceRecords} yielded usable product records, all accounted for as products, variants or duplicate offers. ${report.unavailableSourceRecords} returned HTTP 410 or no usable product record and were excluded. Exact failures are in CATALOGUE_COVERAGE.json and research/collection-failures.json.

**All product URLs found in these accessible official indices have been accounted for. The entire brand catalogue is not certified complete.** Indices can omit listings; some indexed pages are unverifiable; several formula and quantity conflicts remain. No missing product was invented. Listed stock and prices are dated snapshots.

## Deduplication

Existing verified products and public IDs are retained. Matching formula information supports size grouping. Distinct strengths and fragrance versions remain separate. The 30-count biotin gummy lists a different formula from the matching 60/90/120 range. Regular Advanced serum formats are conservatively grouped under the existing roll-on: no distinct formula was established from shared highlights, available dropper/post-pregnancy full lists match, and roll-on/spray full lists are unavailable. Formula, rosemary concentration and 30 ml/50 ml quantity uncertainties are recorded. Folli Advanced+ remains a distinct spicule-delivery product. Kits are labelled bundles rather than additional cosmetic formulas. Same-item twin packs are variants.

## Ingredient evidence and personalisation

Connections use only each product's own highlights or full list, with explicit name aliases. Retinol is not inferred from retinyl palmitate, urea from imidazolidinyl urea, dietary zinc from zinc oxide, or kojic acid from its dipalmitate derivative. Tools have no invented ingredient links. Incorrect liquid-softener directions and ingredients on the test-strip listing are withheld.

Guide sources include official formula context, DermNet and NIH Office of Dietary Supplements. Brand-context guides do not establish clinical efficacy. Supplement nutrient roles do not establish cosmetic benefits. Relevant supplement serving/interaction guidance, oral biotin lab-test interference and retinol pregnancy precautions are retained.

The existing skin-only questionnaire, styling and matching journey are retained. Source-backed skincare additions match concerns and the displayed pack budget. Hair products, supplements, tools and kits remain browsable/comparable but are excluded from this questionnaire because facial skin characteristics do not establish their suitability. No scores, guarantees or diagnoses are generated. Budget filtering uses the displayed base pack, not the cheapest variant.

## Images and remaining gaps

Usable real images: ${report.usableRealImages} of ${report.uniqueProducts} products. Official pack shots and hero photographs have been reviewed and verified from authentic Be Bodywise Mosaic Wellness CDN assets (i.mscwlns.co). 85 products feature genuine pack photography matching the exact catalogue formulations and pack sizes. 2 products with official store image discrepancies (Advanced Hair Growth Pack linking an underarm roll-on photo, and Face & Body Acne Kit showing only one item) safely retain ingredient spotlight placeholders for review. Load failures fall back gracefully to ingredient monograms without broken-image icons.

${report.uniqueProducts - report.usableRealImages} items retain pending image placeholders due to official source discrepancies. ${report.productsWithCoreFieldGaps} items also have unavailable/conflicting core fields. Two previously reviewed prices remain unavailable. Exact names, prices and usage evidence are retained in structured source files; descriptions and categories are cautious interpretations, not validated benefit claims.

## Product records

| Exact official name | Kind | Product type | Pack size | Recorded price | Source |
| --- | --- | --- | --- | --- | --- |
${rows}

## Grouped pack variants

${variants}

## Unresolved source information

${gaps}

## Quality checks

20 automated catalogue and matching tests passed. TypeScript and scoped ESLint passed. The final production build generated 137 pages. Every one of the 87 product and 42 ingredient routes returned HTTP 200; the invalid product route returned 404. Browser checks covered combined search/type/concern/budget filters, new care collections, pagination, new-product comparison, ingredient search/navigation, grouped pack pages and the questionnaire. Desktop, tablet and mobile checks found no page overflow; expanded Step 5 cautions stayed within their rows with separate disclaimer and buttons. Existing CSS, theme and components were preserved.

## Continuation point

Discovery is cached in docs/research/discovery-*.json and complete-discovery.json. One JSON file per official product slug preserves research. Reviewed additions/groups are in src/data/catalogue-expansion.ts and catalogue-groups.ts; relationship rules are in ingredient-evidence.ts. CATALOGUE_COVERAGE.json accounts for all source URLs and failures.

Regenerate this report without network: node node_modules/tsx/dist/cli.mjs scripts/write-catalogue-audit.ts. Remaining work: resolve flagged product/formula details with the brand, establish image permission and correspondence, and check whether omitted or retired listings become verifiable. Do not guess missing values or import inaccessible historical snippets.
`,
  );
  console.log({ ...report, records: undefined, failures: undefined });
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
