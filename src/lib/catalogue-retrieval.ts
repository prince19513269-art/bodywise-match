import { products, productById, catalogueConcerns } from "@/data/products";
import { ingredients } from "@/data/ingredients";
import type { Product, Ingredient, Concern } from "@/lib/types";
import { customerPrecautions, thingsToKeepInMind } from "@/lib/product-copy";

export type RetrievalOptions = {
  productId?: string;
  productIds?: [string, string];
  ingredientId?: string;
  limit?: number;
};

export type RetrievedCatalogue = {
  matchedProducts: Product[];
  totalAvailableForConcern?: number;
  detectedConcern?: Concern;
  detectedIngredients: Ingredient[];
  requestedCount?: number;
  productContext?: Product;
  comparisonContext?: [Product, Product];
};

// Word numbers mapping (e.g. "five" -> 5)
const WORD_NUMBERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

export function extractRequestedCount(query: string): number | undefined {
  const matchNum = query.match(/\b(\d+)\s+(?:distinct\s+|different\s+|unique\s+)?(?:be\s+bodywise\s+)?products?\b/i);
  if (matchNum) return parseInt(matchNum[1], 10);

  const matchWord = query.match(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:distinct\s+|different\s+|unique\s+)?(?:be\s+bodywise\s+)?products?\b/i,
  );
  if (matchWord) return WORD_NUMBERS[matchWord[1].toLowerCase()];

  return undefined;
}

export function detectConcern(query: string): Concern | undefined {
  const normalized = query.toLowerCase();

  // Explicit priority checks for multi-word or specific concerns
  if (normalized.includes("body acne") || (normalized.includes("acne") && normalized.includes("body"))) {
    return "Body acne";
  }
  if (normalized.includes("body texture") || normalized.includes("bumps") || normalized.includes("strawberry skin")) {
    return "Body texture or bumps";
  }
  if (normalized.includes("rough heel") || normalized.includes("cracked heel") || normalized.includes("feet")) {
    return "Rough heels";
  }
  if (normalized.includes("underarm odour") || normalized.includes("underarm odor") || normalized.includes("sweat")) {
    return "Underarm odour";
  }
  if (normalized.includes("underarm tone") || normalized.includes("dark underarm") || normalized.includes("underarm pigmentation")) {
    return "Underarm uneven tone";
  }
  if (normalized.includes("hair fall") || normalized.includes("hair thinning") || normalized.includes("thinning hair")) {
    return "Hair thinning";
  }
  if (normalized.includes("dandruff") || normalized.includes("flaky scalp")) {
    return "Dandruff";
  }
  if (normalized.includes("frizz") || normalized.includes("frizzy")) {
    return "Dry or frizzy hair";
  }
  if (normalized.includes("stretch mark")) {
    return "Stretch mark appearance";
  }
  if (normalized.includes("sun protection") || normalized.includes("sunscreen") || normalized.includes("spf")) {
    return "Sun protection";
  }
  if (normalized.includes("acne mark") || normalized.includes("pigmentation") || normalized.includes("dark spot") || normalized.includes("uneven tone")) {
    return "Acne marks or uneven tone";
  }
  if (normalized.includes("acne") || normalized.includes("pimple") || normalized.includes("breakout")) {
    return "Acne-prone skin";
  }
  if (normalized.includes("dry skin") || normalized.includes("dryness")) {
    return "Dryness";
  }
  if (normalized.includes("oily skin") || normalized.includes("oiliness")) {
    return "Oiliness";
  }

  // Exact match against catalogueConcerns
  for (const concern of catalogueConcerns) {
    if (normalized.includes(concern.toLowerCase())) {
      return concern;
    }
  }

  return undefined;
}

export function retrieveRelevantCatalogue(
  query: string,
  options?: RetrievalOptions,
): RetrievedCatalogue {
  const requestedCount = extractRequestedCount(query);
  const detectedConcern = detectConcern(query);
  const normalizedQuery = query.toLowerCase();

  let productContext: Product | undefined;
  if (options?.productId) {
    productContext = productById.get(options.productId);
  }

  let comparisonContext: [Product, Product] | undefined;
  if (options?.productIds && options.productIds.length === 2) {
    const p1 = productById.get(options.productIds[0]);
    const p2 = productById.get(options.productIds[1]);
    if (p1 && p2) comparisonContext = [p1, p2];
  }

  // Detect relevant ingredients
  const detectedIngredients = ingredients.filter(
    (i) =>
      normalizedQuery.includes(i.name.toLowerCase()) ||
      normalizedQuery.includes(i.id) ||
      (options?.ingredientId && options.ingredientId === i.id),
  );

  // If a specific concern is detected, count all available items for that concern
  let totalAvailableForConcern: number | undefined;
  let concernEligibleProducts: Product[] = [];
  if (detectedConcern) {
    concernEligibleProducts = products.filter((p) =>
      p.concerns.includes(detectedConcern),
    );
    totalAvailableForConcern = concernEligibleProducts.length;
  }

  // Score products based on query relevance
  const scoredProducts = products.map((p) => {
    let score = 0;

    // Focused context match
    if (productContext && p.id === productContext.id) score += 200;
    if (comparisonContext && (p.id === comparisonContext[0].id || p.id === comparisonContext[1].id)) score += 150;

    // Detected concern match
    if (detectedConcern && p.concerns.includes(detectedConcern)) {
      score += 60;
      // Individual formulas prioritized over kits unless user explicitly asks for kit/pack
      if (p.kind === "individual" && !normalizedQuery.includes("kit") && !normalizedQuery.includes("pack")) {
        score += 20;
      }
    }

    // Name keyword match
    const pNameLower = p.name.toLowerCase();
    const queryWords = normalizedQuery
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["the", "and", "for", "from", "with", "products", "bodywise"].includes(w));

    for (const word of queryWords) {
      if (pNameLower.includes(word)) score += 15;
      if (p.category.toLowerCase().includes(word)) score += 10;
      if (p.keyIngredients.some((ki) => ki.toLowerCase().includes(word))) score += 12;
      if (p.concerns.some((c) => c.toLowerCase().includes(word))) score += 8;
    }

    // Ingredient guides match
    for (const ing of detectedIngredients) {
      if (p.ingredientIds.includes(ing.id)) score += 15;
    }

    return { product: p, score };
  });

  // Filter products with a positive score
  const candidates = scoredProducts
    .filter((sp) => sp.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((sp) => sp.product);

  // Determine limit
  const limit = options?.limit || (requestedCount ? Math.max(requestedCount, 5) : 7);

  // If a concern was detected and candidates has enough concern matches, take the concern matches
  let matchedProducts: Product[] = [];
  if (detectedConcern && concernEligibleProducts.length > 0) {
    const concernInCandidates = candidates.filter((p) =>
      p.concerns.includes(detectedConcern),
    );
    // Combine with any other concern products not in candidates
    const remainingConcern = concernEligibleProducts.filter(
      (p) => !concernInCandidates.some((c) => c.id === p.id),
    );
    matchedProducts = [...concernInCandidates, ...remainingConcern].slice(0, limit);
  } else {
    matchedProducts = candidates.slice(0, limit);
  }

  // Fallback: If no products scored (e.g. general greeting), pick 4 popular diverse products
  if (matchedProducts.length === 0 && !productContext && !comparisonContext) {
    matchedProducts = [
      productById.get("salicylic-body-wash-100"),
      productById.get("1-peptide-ceramide-moisturizer"),
      productById.get("ultra-light-sunscreen-spf50"),
      productById.get("1-zpto-anti-dandruff-shampoo"),
    ].filter((p): p is Product => Boolean(p));
  }

  return {
    matchedProducts,
    totalAvailableForConcern,
    detectedConcern,
    detectedIngredients,
    requestedCount,
    productContext,
    comparisonContext,
  };
}

export function formatRetrievedContextForPrompt(
  retrieval: RetrievedCatalogue,
): string {
  const {
    matchedProducts,
    totalAvailableForConcern,
    detectedConcern,
    detectedIngredients,
    requestedCount,
    productContext,
    comparisonContext,
  } = retrieval;

  const sections: string[] = [];

  if (detectedConcern) {
    sections.push(
      `DETECTED USER CONCERN: "${detectedConcern}"\n- Total verified Be Bodywise products in catalogue for this concern: ${totalAvailableForConcern || matchedProducts.length}` +
        (requestedCount && totalAvailableForConcern !== undefined && totalAvailableForConcern < requestedCount
          ? `\n- NOTICE: User asked for ${requestedCount} products, but only ${totalAvailableForConcern} verified products exist for this concern. You MUST list only the ${totalAvailableForConcern} verified products and state that the catalogue currently has ${totalAvailableForConcern} verified options for this concern.`
          : ""),
    );
  }

  if (productContext) {
    const precautions = customerPrecautions(productContext);
    const gaps = thingsToKeepInMind(productContext);
    sections.push(
      `SELECTED PRODUCT CONTEXT (FOCUSED PRODUCT):\n` +
        `- Name: ${productContext.name}\n` +
        `- Category: ${productContext.category} (${productContext.kind})\n` +
        `- Official Link: ${productContext.source?.url || "https://bebodywise.com"}\n` +
        `- Verified Key Ingredients: ${productContext.keyIngredients.join(", ") || "None listed in highlights"}\n` +
        `- Pack Size: ${productContext.size || "Check store"} (Variants: ${(productContext.variants || []).map((v) => v.size).join(", ") || "None"})\n` +
        `- Recorded Price: ${productContext.price !== null ? `₹${productContext.price}` : "See store"}\n` +
        `- Concerns: ${productContext.concerns.join(", ")}\n` +
        `- Precautions: ${precautions.join("; ") || "Patch test recommended"}\n` +
        `- Notes: ${gaps.join("; ") || "Verified snapshot"}`,
    );
  }

  if (comparisonContext) {
    const [p1, p2] = comparisonContext;
    sections.push(
      `PRODUCTS TO COMPARE (COMPARISON):\n` +
        `1. ${p1.name} (${p1.category}) | Link: ${p1.source?.url || ""} | Ingredients: ${p1.keyIngredients.join(", ")} | Price: ${p1.price ? "₹" + p1.price : "Store"}\n` +
        `2. ${p2.name} (${p2.category}) | Link: ${p2.source?.url || ""} | Ingredients: ${p2.keyIngredients.join(", ")} | Price: ${p2.price ? "₹" + p2.price : "Store"}`,
    );
  }

  if (matchedProducts.length > 0) {
    const recordsText = matchedProducts
      .map((p, idx) => {
        const precautions = customerPrecautions(p);
        const otherSizes = (p.variants || [])
          .map((v) => v.size)
          .filter((s) => s && s !== p.size)
          .join(", ");

        return `[PRODUCT ${idx + 1}]
- Exact Name: ${p.name}
- Category: ${p.category} (Type: ${p.kind})
- Official Product Link: ${p.source?.url || "https://bebodywise.com"}
- Verified Key Ingredients: ${p.keyIngredients.join(", ") || "None listed in brand highlights"}
- Pack Size: ${p.size || "Standard pack"}${otherSizes ? ` (Size variants of this SAME product: ${otherSizes})` : ""}
- Recorded Price: ${p.price !== null ? `₹${p.price}` : "Store price"}
- Addressed Concerns: ${p.concerns.join(", ")}
- Usage: ${p.usage || "Follow label instructions"}
- Precautions: ${precautions.slice(0, 2).join("; ") || "Patch test recommended"}`;
      })
      .join("\n\n");

    sections.push(
      `VERIFIED STRUCTURED CATALOGUE RECORDS:\n(Use ONLY these verified fields for product names, ingredients, concentrations, prices, and links):\n\n${recordsText}`,
    );
  }

  if (detectedIngredients.length > 0) {
    const ingText = detectedIngredients
      .map(
        (i) =>
          `• ${i.name} (${i.family}): ${i.summary}\n  What it is: ${i.what}\n  Why used: ${i.why}\n  Precautions: ${i.precautions}`,
      )
      .join("\n\n");
    sections.push(`VERIFIED INGREDIENT GUIDES:\n${ingText}`);
  }

  return sections.join("\n\n--------------------\n\n");
}
