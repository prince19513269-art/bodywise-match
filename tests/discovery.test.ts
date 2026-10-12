import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/data/products";
import { matchProducts } from "../src/lib/matching";
import {
  discoveryConcerns,
  discoveryPool,
  getDiscoveryCategories,
  selectDiscoveryCategory,
  toggleDiscoveryOption,
  validDiscoveryStep,
} from "../src/lib/discovery";
import type { Answers, Concern, DiscoveryCategory } from "../src/lib/types";
const journeys: [DiscoveryCategory, Concern][] = [
  ["face", "Acne-prone skin"],
  ["hair", "Hair thinning"],
  ["hair", "Dandruff"],
  ["body", "Body acne"],
  ["underarm", "Underarm odour"],
  ["wellness", "Nutritional support"],
  ["tools", "Scalp cleansing"],
];
for (const [category, concern] of journeys)
  test(`${category}: ${concern} returns relevant source-backed options`, () => {
    const answers: Answers = {
      discoveryCategory: category,
      selectedConcerns: [concern],
      skin: "Often oily",
      scalp: "Often dry",
      sensitivity: "Yes",
      familiarity: "Beginner",
    };
    const matches = matchProducts(answers, products);
    assert.ok(matches.length > 0);
    const pool = discoveryPool(answers, products);
    for (const match of matches) {
      assert.ok(pool.includes(match.product));
      assert.ok(match.product.concerns.includes(concern));
      assert.ok(match.product.source && match.product.usage);
      assert.ok(match.reasons.some((r) => r.includes(concern.toLowerCase())));
      assert.ok(!("score" in match));
    }
  });
test("every quiz category and goal comes from catalogue records", () => {
  assert.deepEqual(getDiscoveryCategories([]), []);
  for (const category of getDiscoveryCategories(products)) {
    const answers: Answers = { discoveryCategory: category };
    assert.ok(discoveryPool(answers, products).length);
    assert.ok(
      discoveryConcerns(answers, products).every((c) =>
        discoveryPool(answers, products).some((p) => p.concerns.includes(c)),
      ),
    );
  }
});
test("general discovery honours selected categories, goals and budget", () => {
  const answers: Answers = {
    discoveryCategory: "all",
    preferredCategories: ["hair"],
    selectedConcerns: ["Dandruff"],
    budget: "₹300–₹600",
  };
  const matches = matchProducts(answers, products);
  assert.ok(matches.length > 0);
  assert.ok(
    matches.every(
      (m) =>
        discoveryPool(answers, products).includes(m.product) &&
        m.product.concerns.includes("Dandruff") &&
        m.product.price! >= 300 &&
        m.product.price! <= 600,
    ),
  );
});
test("facial skin answers never change hair matches or imply scalp compatibility", () => {
  const base: Answers = {
    discoveryCategory: "hair",
    selectedConcerns: ["Hair thinning"],
    scalp: "Often dry",
  };
  assert.deepEqual(
    matchProducts({ ...base, skin: "Often dry" }, products),
    matchProducts({ ...base, skin: "Often oily" }, products),
  );
  assert.ok(
    matchProducts(base, products).every((m) =>
      m.cautions.some((c) => c.includes("does not establish suitability")),
    ),
  );
});
test("unsupported combinations and unverified fields have honest empty results", () => {
  assert.deepEqual(
    matchProducts(
      { discoveryCategory: "face", selectedConcerns: ["Dandruff"] },
      products,
    ),
    [],
  );
  assert.deepEqual(
    matchProducts(
      {
        discoveryCategory: "face",
        selectedConcerns: ["Acne-prone skin"],
        budget: "₹600–₹1,000",
      },
      products,
    ),
    [],
  );
  assert.deepEqual(
    matchProducts(
      {
        discoveryCategory: "tools",
        selectedConcerns: ["Water hardness testing"],
      },
      products,
    ),
    [],
  );
  const p = products.find((p) => p.category === "Underarm care")!;
  assert.deepEqual(
    matchProducts(
      {
        discoveryCategory: "underarm",
        selectedConcerns: ["Not sure"],
        fragrancePreference: "Avoid fragrance",
      },
      [
        { ...p, fragranceStatus: "listed" },
        { ...p, fragranceStatus: "unknown" },
      ],
    ),
    [],
  );
});
test("multiple goals rank overlap first, Not sure is exclusive, and category edits clear obsolete answers", () => {
  assert.deepEqual(
    toggleDiscoveryOption(["Dandruff"], "Not sure", "Not sure"),
    ["Not sure"],
  );
  assert.deepEqual(
    toggleDiscoveryOption(["Not sure"], "Dandruff", "Not sure"),
    ["Dandruff"],
  );
  const old: Answers = {
    discoveryCategory: "face",
    selectedConcerns: ["Acne-prone skin"],
    skin: "Often oily",
    productType: "Face cleanser",
    budget: "Below ₹300",
  };
  assert.equal(selectDiscoveryCategory(old, "face"), old);
  assert.deepEqual(selectDiscoveryCategory(old, "hair"), {
    discoveryCategory: "hair",
  });
  const matches = matchProducts(
    {
      discoveryCategory: "body",
      selectedConcerns: ["Dryness", "Body texture or bumps"],
    },
    products,
  );
  assert.ok(
    matches[0].product.concerns.includes("Dryness") &&
      matches[0].product.concerns.includes("Body texture or bumps"),
  );
});
test("step validation follows the active path and leaves budget optional", () => {
  assert.equal(validDiscoveryStep({}, 0), false);
  assert.equal(
    validDiscoveryStep(
      { discoveryCategory: "hair", selectedConcerns: ["Not sure"] },
      1,
    ),
    true,
  );
  assert.equal(
    validDiscoveryStep(
      { discoveryCategory: "hair", familiarity: "Beginner", sensitivity: "No" },
      2,
    ),
    false,
  );
  assert.equal(
    validDiscoveryStep(
      {
        discoveryCategory: "hair",
        scalp: "Not sure",
        familiarity: "Beginner",
        sensitivity: "No",
      },
      2,
    ),
    true,
  );
  assert.equal(
    validDiscoveryStep(
      { discoveryCategory: "wellness", familiarity: "Beginner" },
      2,
    ),
    true,
  );
  assert.equal(
    validDiscoveryStep(
      {
        discoveryCategory: "all",
        preferredCategories: ["wellness"],
        familiarity: "Beginner",
      },
      2,
    ),
    true,
  );
  assert.equal(validDiscoveryStep({}, 3), true);
});
