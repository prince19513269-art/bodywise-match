import type { Product } from "@/lib/types";
// Test-only data. Never imported by the customer-facing catalogue or matching journey.
export const fixtureProduct: Product = {
  id: "fixture-moisturiser",
  name: "Development fixture — not a real product",
  category: "Moisturiser",
  status: "fixture",
  concerns: ["Dryness"],
  keyIngredients: [],
  ingredientIds: [],
  size: null,
  price: null,
  usage: null,
  precautions: [],
  source: null,
  purchaseUrl: null,
  missing: ["All product information is unverified."],
  accent: "sand",
};
