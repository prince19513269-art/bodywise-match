# Bodywise Match — catalogue expansion handoff

## Structure

```text
src/app/                     Next.js routes, global design system, loading/error pages
  discover/                  Five-step questionnaire and explained results
  products/                  Filterable catalogue and [id] detail routes
  ingredients/               Searchable library and [id] educational guides
  compare/                   Shared two-product comparison
  about/                     Research framing, methodology, privacy
src/components/              Shared buttons, notices, cards, shell, state provider
src/data/products.ts         Source-checked catalogue only
src/data/catalogue-sources.json Minimal official-page source snapshots
src/data/catalogue-review.ts Reviewed categories, concern mappings, descriptions, cautions
src/data/ingredient-additions.ts Additional beginner-friendly ingredient guides
src/data/fixtures/           Test-only unverified products; never used in the UI
src/data/ingredients.ts       Expandable ingredient education records with sources
src/lib/types.ts             Shared product, ingredient, answer, source contracts
src/lib/matching.ts          Pure deterministic matching and budget boundaries
src/lib/ai.ts                Future explanation provider interface; disabled
tests/matching.test.ts       Safety, boundaries, provenance, and determinism tests
```

## Completed functionality

Consumer UI refresh (12 October 2026): the existing layouts now use warm blush, peach, nude and plum colours, rounded category/product cards, soft shadows and pill controls. Six care categories are populated from the current catalogue (Face 6, Body 15, Hair 7, Underarm 2, Acne 7, Hydration 8); overlapping concern groups are intentional. The 15 product-type refinements remain available and narrow to populated types inside the selected care group. Clicking a care category clears conflicting search/concern/budget filters. Empty category groups are hidden automatically.

Product pages retain original catalogue data, official links, size variants, usage and cautions. Internal research/image notes remain in the audit/data files. `src/lib/product-copy.ts` converts actionable gaps into customer wording; important size, fragrance and concentration conflicts remain visible under “Things to keep in mind.” No unsupported sensitive-skin group is shown. Photo permission gates remain in place; placeholders now say “Ingredient spotlight.” The footer retains independent-app, non-affiliation and medical-advice disclosures.

Refresh validation: 18 tests passed; TypeScript and the production build passed (58 pages). The React memoization lint issue was fixed and the affected page/helper passed lint. Live browser checks covered all care buttons, combined search/budget filters, category pagination, size variants, comparison, ingredient search, the full onboarding journey and the fragrance caution. Desktop (1365px) and mobile (390px and 320px) were checked without horizontal page overflow. No browser console errors were captured during comparison. Screenshot: `docs/warm-catalogue-desktop.jpg`.

Homepage, navigation and footer; complete onboarding; persistent in-tab answers during internal navigation; edit/reset/back/skip; transparent results and empty states; 30-product catalogue across 15 categories with search/category/concern/budget filters; twelve-record pagination; product details and official links; 20 ingredient guides with verified product links; two-product comparison from cards or the comparison page; missing information, errors, loading and not-found states; responsive design and keyboard controls. Size-only variants count as one product. The original layout and matching architecture were preserved.

## Matching rules

1. Require a selected concern. Reject fixture records or records without a source.
2. Require exact overlap with a brand-listed concern, unless general discovery was chosen.
3. Exclude the salicylic body wash for `Often dry` because the source cautions against very dry skin. This is deliberately conservative and is not a diagnosis.
4. Apply a selected price range. Unknown prices cannot pass a specific range. Skipped/flexible budgets do not exclude them.
5. Add irritation/uncertainty cautions without asserting sensitive-skin suitability. No result score or effectiveness ranking.

₹600 belongs to the ₹300–₹600 band; the next band is >₹600 to ₹1,000. Familiarity changes no eligibility. Reasons explicitly identify brand positioning, not independently established efficacy.

## Data provenance

30 distinct products were checked against accessible official product pages on 12 October 2026. The original 100 mL salicylic body wash retains its app ID, with verified 250 mL and 375 mL size variants. The old niacinamide face-serum source now returns HTTP 410 and is excluded rather than keeping its outdated price in the verified catalogue. Other retired pages were also excluded.

Source snapshots, including exact names, listed ingredient highlights, price/stock snapshots, pack-size evidence, usage text and candidate image URLs, are in `src/data/catalogue-sources.json`. The human-reviewed category/concern interpretation is in `catalogue-review.ts`. Detailed audit and image-review URLs: `docs/CATALOGUE_AUDIT.md`.

All photos await reuse permission and visual/variant review. No branded packaging was recreated, downloaded or reused. The UI supports a permitted image plus a graceful failure fallback, but currently uses typographic placeholders. AAD/DermNet education sources and official formulation-context sources are linked in ingredient entries. Their presence is not clinical validation.

## How to run

Node.js 22+ and pnpm: `pnpm install`, then `pnpm dev`. Default local URL: http://127.0.0.1:3000.
No API key is required. See README for this computer’s bundled pnpm path.

## Add products

Record verified official fields in `catalogue-sources.json`, then add a reviewed entry in `catalogue-review.ts`. `products.ts` composes the records and rejects missing sources, kits and prescription records. Keep unknown prices/sizes/usage as `null`; never turn an unknown price into zero. Keep test examples in `src/data/fixtures/` with status `fixture`.

Use precise product/size variants. Do not infer product suitability from an ingredient alone. Concern mappings must have source support. Add ingredient IDs to `src/data/ingredients.ts` before linking them. Product routes and the ID lookup are generated from the catalogue; no separate route list is necessary. Search is memoized and results paginated for a 100+ record local catalogue.

## Phase 2

The 30-product expansion is implemented. Follow-up work: resolve the three size conflicts and two price gaps directly with current labels; reconcile fragrance and concentration conflicts; obtain explicit photo permission and visually review each exact product/variant before setting image permission to `permitted` and match status to `verified`. Add complete INCI lists only when checked. The optional research helper uses cached official public HTML records, bounded batches and no photo downloads; running `--export` uses cached records without network research.

## Phase 3

Implement the `ExplanationProvider` server-side, with source-grounded prompts, response validation, explicit uncertainty, rate limits, and a consent/privacy review for any user text transmitted. Use a server-only Gemini secret. Never use `NEXT_PUBLIC_` for a key. Keep rule-based discovery working during AI outages. No fake AI response exists in Phase 1.

## Remaining / known limits

- 30 products; 20 ingredients; 15 categories. Price and stock are not live. Source checking is not proof of efficacy.
- All 30 have an unverified image-permission/variant field; 13 also have additional source gaps or unresolved claims. Three sizes and two prices are unavailable.
- No medical diagnoses, routine prescription, guarantee, or sensitive-skin compatibility assessment.
- No long-term persistence: browser refresh clears answers and selection by design.
- No Gemini adapter, database, auth, payments, deployment, or analytics.
- System font stack avoids external font requests; Inter is used if installed, then Segoe UI / Arial.
- Production compilation alone does not establish production readiness.

## Validation

Catalogue expansion verification on 12 October 2026:

- 16 matching/catalogue tests passed, including uniqueness, source-backed names/prices, size grouping, ingredient links, combined filters, missing prices/sizes, and image permission gates.
- TypeScript, ESLint and production build passed; 58 pages were generated.
- HTTP smoke checks passed for the catalogue, onboarding, comparison, representative face/body/hair products and new ingredient guides; an invalid product ID returned 404.
- Existing browser-tab inspection was blocked by browser security because it was in an internal error state. No fresh browser interaction or screenshot validation is claimed for this expansion. Original Phase 1 interaction checks below are historical.
- `node node_modules/tsx/dist/cli.mjs scripts/check-catalogue-routes.ts` reruns local HTTP smoke checks; `scripts/write-catalogue-audit.ts` regenerates the audit from the reviewed local data without network access.

Commands: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
Equivalent direct runtime commands used on this computer:

```powershell
node node_modules/eslint/bin/eslint.js .
node node_modules/typescript/bin/tsc --noEmit
node node_modules/tsx/dist/cli.mjs --test tests/*.test.ts
$env:NEXT_TELEMETRY_DISABLED='1'
node node_modules/next/dist/bin/next build
```

Verification on 11 October 2026:

- TypeScript passed; ESLint passed with no warnings after fixing the PostCSS export.
- All 10 matching tests passed, covering boundary prices, unknown prices, exclusions, sensitivity cautions, fixtures, missing provenance, empty results, and determinism.
- Production build passed and generated 14 static pages. The Windows sandbox initially blocked the CSS compiler subprocess; the same build passed with the required execution permission.
- Browser checks passed: required answers, both skin questions, Back retaining selections, ingredient detour and return retaining answers, budget skip, explained body-acne result, edit answers, uncovered-concern empty state, and reset.
- Search, empty search results, combined category/concern filters, price filtering, selecting two cards, comparison table/missing size, removing and clearing selections, ingredient search, and mobile navigation were exercised.
- Desktop (1365 × 900) and mobile (390 × 844) layouts were inspected; the questionnaire was completed on mobile and checked at 320px. A comparison-table caption overflow was fixed by positioning its scroll container.
- No browser console warnings/errors were captured in the tested flows. This is targeted QA, not an exhaustive accessibility or device audit.
- Screenshots: `docs/desktop-preview.jpg` and `docs/mobile-preview.jpg`.
- Invalid product/ingredient IDs are restricted to generated catalogue routes (`dynamicParams = false`). The loading boundary is scoped to discovery rather than the root, allowing missing records to return HTTP 404 before streaming. Final HTTP checks passed for all 12 application URLs plus an invalid product URL (404).
