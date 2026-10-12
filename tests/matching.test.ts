import test from "node:test";
import assert from "node:assert/strict";
import { inBudget, matchProducts } from "../src/lib/matching";
import { products } from "../src/data/products";
import { fixtureProduct } from "../src/data/fixtures/products";
import type { Answers, Product } from "../src/lib/types";
const answers: Answers = {
  concern: "Body acne",
  skin: "Often oily",
  sensitivity: "No",
  familiarity: "Beginner",
  budget: "Below ₹300",
};
test("body acne receives an explainable source-backed option", () => {
  const matches = matchProducts(answers, products);
  assert.equal(matches.length, 2);
  assert.equal(matches[0].product.id, "salicylic-body-wash-100");
  assert.match(matches[0].reasons.join(" "), /body acne/);
  assert.match(matches[0].reasons.join(" "), /149/);
});
test("dry skin excludes the body wash instead of claiming suitability", () => {
  assert.ok(
    matchProducts({ ...answers, skin: "Often dry" }, products).every(
      (m) => m.product.id !== "salicylic-body-wash-100",
    ),
  );
});
test("irritation and uncertainty add cautions without a sensitive-skin claim", () => {
  for (const sensitivity of ["Yes", "Not sure"] as const) {
    const [match] = matchProducts({ ...answers, sensitivity }, products);
    assert.ok(match.cautions.some((c) => c.includes("not confirmation")));
  }
});
test("unverified fixtures and records without a source never appear", () => {
  const unsupported: Product = { ...products[0], source: null };
  assert.deepEqual(
    matchProducts({ concern: "General skincare discovery" }, [
      fixtureProduct,
      unsupported,
    ]),
    [],
  );
});
test("no concern and uncovered concerns produce honest empty results", () => {
  assert.deepEqual(matchProducts({}, products), []);
  assert.deepEqual(matchProducts({ concern: "Dryness" }, [products[0]]), []);
  assert.deepEqual(
    matchProducts(
      { concern: "Acne-prone skin", budget: "₹600–₹1,000" },
      products,
    ),
    [],
  );
});
test("budget boundaries are explicit and non-overlapping", () => {
  assert.equal(inBudget(299, "Below ₹300"), true);
  assert.equal(inBudget(300, "Below ₹300"), false);
  assert.equal(inBudget(300, "₹300–₹600"), true);
  assert.equal(inBudget(600, "₹300–₹600"), true);
  assert.equal(inBudget(600, "₹600–₹1,000"), false);
  assert.equal(inBudget(601, "₹600–₹1,000"), true);
  assert.equal(inBudget(1000, "₹600–₹1,000"), true);
  assert.equal(inBudget(1001, "₹600–₹1,000"), false);
});
test("unknown prices cannot pass a specific budget but are allowed when skipped", () => {
  assert.equal(inBudget(null, "Below ₹300"), false);
  assert.equal(inBudget(null, undefined), true);
  const missingPrice = { ...products[0], price: null };
  assert.equal(matchProducts(answers, [missingPrice]).length, 0);
  assert.ok(
    matchProducts({ ...answers, budget: undefined }, [
      missingPrice,
    ])[0].notices.some((n) => n.includes("Price unavailable")),
  );
});
test("general discovery includes the verified catalogue without suitability scores", () => {
  const matches = matchProducts(
    { concern: "General skincare discovery" },
    products,
  );
  assert.equal(
    matches.length,
    products.filter((p) => p.recommendationEligible).length,
  );
  assert.ok(matches.every((m) => m.product.kind === "individual"));
  assert.ok(
    matches.every(
      (m) =>
        !["Scalp serum", "Shampoo", "Hair serum", "Conditioner"].includes(
          m.product.category,
        ),
    ),
  );
  assert.ok(matches.every((m) => m.reasons.length && m.notices.length));
  assert.ok(matches.every((m) => !("score" in m)));
});
test("matching is deterministic and does not mutate catalogue data", () => {
  const before = JSON.stringify(products);
  assert.deepEqual(
    matchProducts(answers, products),
    matchProducts(answers, products),
  );
  assert.equal(JSON.stringify(products), before);
});
test("catalogue identifiers, provenance, ingredient links, and prices are consistent", () => {
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  for (const p of products) {
    assert.equal(p.status, "verified");
    assert.ok(p.source?.url.startsWith("https://bebodywise.com/"));
    assert.ok(p.price === null || p.price > 0);
    assert.ok(p.missing.length > 0);
  }
});
