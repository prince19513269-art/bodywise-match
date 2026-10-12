export const concerns = [
  "Acne-prone skin",
  "Body acne",
  "Acne marks or uneven tone",
  "Oiliness",
  "Dryness",
  "General skincare discovery",
] as const;
export const skinTypes = [
  "Often oily",
  "Often dry",
  "Combination",
  "Not sure",
] as const;
export const sensitivities = ["Yes", "No", "Not sure"] as const;
export const familiarityLevels = [
  "Beginner",
  "Know a few basics",
  "Experienced",
] as const;
export const budgets = [
  "Below ₹300",
  "₹300–₹600",
  "₹600–₹1,000",
  "Flexible / just exploring",
] as const;
export type OnboardingConcern = (typeof concerns)[number];
export type Concern =
  | OnboardingConcern
  | "Body texture or bumps"
  | "Underarm odour"
  | "Underarm uneven tone"
  | "Sun protection"
  | "Hair thinning"
  | "Dandruff"
  | "Dry or frizzy hair"
  | "Damaged hair"
  | "Rough heels"
  | "Stretch mark appearance"
  | "Body massage and nourishment"
  | "Nutritional support"
  | "Sleep and relaxation"
  | "Brow and lash care"
  | "Facial grooming"
  | "Scalp cleansing"
  | "Cooling facial care"
  | "Water hardness testing";
export const categories = [
  "Face cleanser",
  "Face treatment",
  "Face moisturiser",
  "Sun protection",
  "Body wash",
  "Body lotion",
  "Body exfoliant",
  "Underarm care",
  "Scalp serum",
  "Shampoo",
  "Conditioner",
  "Hair serum",
  "Foot care",
  "Acne patches",
  "Stretch mark care",
  "Brow & lash care",
  "Body cream",
  "Supplements",
  "Care tools",
  "Hair care kits",
  "Body care kits",
  "Sun care kits",
  "Wellness kits",
] as const;
export type Answers = {
  discoveryCategory?: DiscoveryCategory;
  selectedConcerns?: (Concern | "Not sure")[];
  preferredCategories?: (DiscoveryCategory | "Not sure")[];
  scalp?: (typeof skinTypes)[number];
  productType?: string;
  fragrancePreference?: "No preference" | "Avoid fragrance" | "Not sure";
  concern?: OnboardingConcern;
  skin?: (typeof skinTypes)[number];
  sensitivity?: (typeof sensitivities)[number];
  familiarity?: (typeof familiarityLevels)[number];
  budget?: (typeof budgets)[number];
};
export type DiscoveryCategory =
  "face" | "hair" | "body" | "underarm" | "wellness" | "tools" | "all";
export type Source = { url: string; label: string; checkedOn: string };
export type Product = {
  id: string;
  name: string;
  category: (typeof categories)[number] | "Face serum" | "Moisturiser";
  status: "verified" | "fixture";
  concerns: Concern[];
  keyIngredients: string[];
  ingredientIds: string[];
  size: string | null;
  price: number | null;
  usage: string | null;
  precautions: string[];
  avoidDrySkin?: boolean;
  source: Source | null;
  purchaseUrl: string | null;
  missing: string[];
  accent: "blue" | "lilac" | "sand";
  description?: string;
  brandConcern?: string;
  formulaKey?: string;
  variants?: ProductVariant[];
  image?: {
    src: string | null;
    officialSource: string | null;
    permission: "pending" | "permitted";
    matchStatus: "unreviewed" | "verified";
    alt: string;
  };
  availability?: "Listed in stock" | "Listed out of stock" | "Unknown";
  ingredientEvidence?:
    "Brand highlights" | "Brand description" | "Brand ingredient list";
  fieldGaps?: string[];
  recommendationEligible?: boolean;
  kind?: "individual" | "kit" | "tool" | "supplement";
  fragranceStatus?: "listed" | "not-listed" | "unknown";
};
export type ProductVariant = {
  name: string;
  size: string | null;
  price: number | null;
  url: string;
  checkedOn: string;
};
export type Match = {
  product: Product;
  reasons: string[];
  cautions: string[];
  notices: string[];
};
export type Ingredient = {
  id: string;
  name: string;
  family: string;
  symbol: string;
  summary: string;
  what: string;
  does: string;
  why: string;
  precautions: string;
  limits: string;
  source: Source;
};
