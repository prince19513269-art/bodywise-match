import test from "node:test";
import assert from "node:assert/strict";
import {
  askGeminiAssistant,
  buildSystemPrompt,
  isGeminiConfigured,
} from "../src/lib/ai";
import { products } from "../src/data/products";
import {
  retrieveRelevantCatalogue,
  formatRetrievedContextForPrompt,
} from "../src/lib/catalogue-retrieval";

test("assistant returns setup instructions when GEMINI_API_KEY is not configured", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "";

  try {
    assert.equal(isGeminiConfigured(), false);
    const result = await askGeminiAssistant({
      message: "What does niacinamide do?",
    });

    assert.equal(result.isConfigured, false);
    assert.match(result.reply, /GEMINI_API_KEY/);
    assert.match(result.reply, /\.env\.local/);
    assert.match(result.reply, /Google AI Studio/);
  } finally {
    if (originalKey !== undefined) {
      process.env.GEMINI_API_KEY = originalKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  }
});

test("system prompt embeds safety boundaries and medical disclaimers", () => {
  const prompt = buildSystemPrompt();
  assert.match(prompt, /Ask Bodywise Match/);
  assert.match(prompt, /NO MEDICAL DIAGNOSES/);
  assert.match(prompt, /NO TREATMENT GUARANTEES/);
  assert.match(prompt, /PATCH TESTING/);
  assert.match(prompt, /SUN PROTECTION/);
});

test("system prompt correctly injects selected product context", () => {
  const testProduct = products[0];
  const prompt = buildSystemPrompt({ productId: testProduct.id });

  assert.match(prompt, new RegExp(testProduct.name));
  assert.match(prompt, /SELECTED PRODUCT CONTEXT/);
  assert.match(prompt, new RegExp(testProduct.category));
});

test("system prompt injects two-product comparison context", () => {
  const p1 = products[0];
  const p2 = products[1];
  const prompt = buildSystemPrompt({ productIds: [p1.id, p2.id] });

  assert.match(prompt, /PRODUCTS TO COMPARE/);
  assert.match(prompt, new RegExp(p1.name));
  assert.match(prompt, new RegExp(p2.name));
});

test("GET /api/assistant returns configuration status", async () => {
  const { GET } = await import("../src/app/api/assistant/route");
  const res = await GET();
  assert.equal(res.status, 200);
  const data = (await res.json()) as { isConfigured: boolean };
  assert.equal(typeof data.isConfigured, "boolean");
});

test("POST /api/assistant rejects empty message", async () => {
  const { POST } = await import("../src/app/api/assistant/route");
  const req = new Request("http://localhost/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "   " }),
  });
  const res = await POST(req);
  assert.equal(res.status, 400);
});

test("POST /api/assistant processes valid message and returns 200", async () => {
  const { POST } = await import("../src/app/api/assistant/route");
  const req = new Request("http://localhost/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "What does niacinamide do?",
      context: { productId: products[0].id },
    }),
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { reply: string; isConfigured: boolean };
  assert.ok("reply" in data);
  assert.equal(typeof data.isConfigured, "boolean");
});

test("regression 1: listing five unique body-acne products retrieves distinct verified items", () => {
  const query =
    "List five Be Bodywise products for body acne from your catalogue, including their key ingredients and official product links.";
  const retrieval = retrieveRelevantCatalogue(query);

  assert.equal(retrieval.detectedConcern, "Body acne");
  assert.equal(retrieval.requestedCount, 5);
  assert.ok(
    retrieval.matchedProducts.length >= 5,
    `Expected at least 5 products, got ${retrieval.matchedProducts.length}`,
  );

  // Exactly 5 unique product IDs when taking the requested count
  const topFive = retrieval.matchedProducts.slice(0, 5);
  const uniqueIds = new Set(topFive.map((p) => p.id));
  assert.equal(uniqueIds.size, 5, "All 5 products must have unique IDs");

  // Every product must be suitable for body acne
  for (const product of topFive) {
    assert.ok(
      product.concerns.includes("Body acne"),
      `Product ${product.name} must be suitable for Body acne`,
    );
    assert.ok(product.name.length > 0);
    assert.ok(product.keyIngredients.length > 0);
  }
});

test("regression 2: all retrieved products provide verified official product URLs", () => {
  const query =
    "List five Be Bodywise products for body acne from your catalogue, including their key ingredients and official product links.";
  const retrieval = retrieveRelevantCatalogue(query);
  const topFive = retrieval.matchedProducts.slice(0, 5);

  for (const product of topFive) {
    assert.ok(
      product.source?.url,
      `Product ${product.name} must have a source URL`,
    );
    assert.match(
      product.source!.url,
      /^https:\/\/bebodywise\.com\/product\/.+/,
      `Product ${product.name} URL must be a verified official store link`,
    );
  }

  // Formatted prompt text must contain each official URL
  const formatted = formatRetrievedContextForPrompt(retrieval);
  for (const product of topFive) {
    assert.ok(
      formatted.includes(product.source!.url),
      `Retrieved context must contain official URL for ${product.name}`,
    );
  }

  // System prompt must strictly mandate using these official URLs and forbid claiming links are unavailable
  const prompt = buildSystemPrompt(query);
  assert.match(prompt, /OFFICIAL PRODUCT URLS \(MANDATORY\)/);
  assert.match(prompt, /You MUST NOT state "I cannot provide official links"/);
});

test("regression 3: pack-size variants are deduplicated and not counted as separate recommendations", () => {
  // Salicylic acid body wash has 100ml, 250ml, 375ml, 700ml variants
  const salicylicWash = products.find(
    (p) => p.id === "salicylic-body-wash-100",
  );
  assert.ok(salicylicWash);
  assert.ok(salicylicWash.variants && salicylicWash.variants.length > 1);

  const query = "List five Be Bodywise products for body acne";
  const retrieval = retrieveRelevantCatalogue(query);

  // Check that the body wash appears at most once in matchedProducts
  const washOccurrences = retrieval.matchedProducts.filter(
    (p) => p.id === "salicylic-body-wash-100",
  );
  assert.equal(
    washOccurrences.length,
    1,
    "Pack size variants must not produce duplicate product entries",
  );

  // Verify that the prompt context aggregates size variants under the same product
  const formatted = formatRetrievedContextForPrompt(retrieval);
  assert.match(formatted, /Size variants of this SAME product:/);

  // Verify prompt instructions explicitly forbid counting different sizes as separate items
  const prompt = buildSystemPrompt(query);
  assert.match(prompt, /DEDUPLICATION OF PACK SIZES/);
  assert.match(
    prompt,
    /You must NEVER count two different sizes of the same product as two separate recommendations/,
  );
});

test("regression 4: prevents unsupported ingredient and concentration claims", () => {
  const query =
    "List five Be Bodywise products for body acne from your catalogue, including their key ingredients and official product links.";
  const prompt = buildSystemPrompt(query);

  // Prompt must instruct strict adherence to verified records
  assert.match(prompt, /INGREDIENT & CONCENTRATION FIDELITY/);
  assert.match(
    prompt,
    /State ONLY the key ingredients and concentrations explicitly provided in the "Verified Key Ingredients" field/,
  );
  assert.match(
    prompt,
    /If no percentage is listed.*DO NOT invent or guess one/,
  );
  assert.match(
    prompt,
    /DO NOT claim ingredients are present if they are not in the verified record/,
  );
  assert.match(
    prompt,
    /SEPARATION OF VERIFIED FACTS VS EDUCATIONAL EXPLANATIONS/,
  );

  // Context must provide verified key ingredients directly from the catalogue records
  const retrieval = retrieveRelevantCatalogue(query);
  for (const product of retrieval.matchedProducts.slice(0, 5)) {
    for (const ingredient of product.keyIngredients) {
      assert.ok(typeof ingredient === "string" && ingredient.length > 0);
    }
  }
});

test("regression 5: handles fewer matching products than requested with honest count notification", () => {
  // Rough heels has only 4 matching products in the catalogue
  const query = "List five Be Bodywise products for rough heels";
  const retrieval = retrieveRelevantCatalogue(query);

  assert.equal(retrieval.detectedConcern, "Rough heels");
  assert.equal(retrieval.requestedCount, 5);
  assert.equal(retrieval.totalAvailableForConcern, 4);
  assert.equal(
    retrieval.matchedProducts.length,
    4,
    "Must not fabricate a 5th product when only 4 exist",
  );

  // Formatted prompt must include the NOTICE about fewer products than requested
  const formatted = formatRetrievedContextForPrompt(retrieval);
  assert.match(
    formatted,
    /NOTICE: User asked for 5 products, but only 4 verified products exist for this concern/,
  );
  assert.match(formatted, /You MUST list only the 4 verified products/);

  // System prompt must enforce honest counting directive
  const prompt = buildSystemPrompt(query);
  assert.match(prompt, /HONEST PRODUCT COUNTING/);
  assert.match(prompt, /NEVER fabricate products to meet a requested number/);
});

test("system prompt guides concise, friendly, beginner-friendly tone and compact product format", () => {
  const prompt = buildSystemPrompt("What does niacinamide do?");
  assert.match(prompt, /RESPONSE STYLE & PRESENTATION/);
  assert.match(prompt, /CONCISE, FRIENDLY & BEGINNER-FRIENDLY/);
  assert.match(prompt, /80–150 words/);
  assert.match(prompt, /COMPACT PRODUCT RECOMMENDATION FORMAT/);
  assert.match(prompt, /RELEVANT PRECAUTIONS ONLY/);
  assert.match(prompt, /NO RAW HEADINGS/);
});



