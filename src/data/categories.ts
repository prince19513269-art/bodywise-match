import type { Product } from "@/lib/types";
export type CareCategory = {
  id: string;
  name: string;
  description: string;
  icon: "face" | "body" | "hair" | "underarm" | "acne" | "hydration";
  includes: (product: Product) => boolean;
};
const careCategories: CareCategory[] = [
  {
    id: "face",
    name: "Face Care",
    description: "Cleansers, moisturisers & daily essentials",
    icon: "face",
    includes: (p) =>
      p.category.startsWith("Face") ||
      p.category === "Acne patches" ||
      p.category === "Brow & lash care" ||
      p.id === "lightest-mineral-sunscreen-spf50" ||
      p.id === "ultra-light-sunscreen-spf50",
  },
  {
    id: "body",
    name: "Body Care",
    description: "Everyday cleansing, softness & body care",
    icon: "body",
    includes: (p) =>
      p.category.startsWith("Body") ||
      p.category === "Foot care" ||
      p.category === "Stretch mark care" ||
      p.category === "Sun care kits" ||
      p.id === "body-sunscreen-spray-with-spf-50" ||
      p.id === "body-sunscreen-lotion-with-spf-50",
  },
  {
    id: "hair",
    name: "Hair Care",
    description: "Scalp care, shampoos & smoother lengths",
    icon: "hair",
    includes: (p) =>
      [
        "Scalp serum",
        "Shampoo",
        "Conditioner",
        "Hair serum",
        "Hair care kits",
      ].includes(p.category),
  },
  {
    id: "wellness",
    name: "Health & Wellness",
    description: "Supplement gummies & wellness bundles",
    icon: "hydration",
    includes: (p) =>
      p.category === "Supplements" || p.category === "Wellness kits",
  },
  {
    id: "tools",
    name: "Care Tools",
    description: "Grooming tools & care accessories",
    icon: "face",
    includes: (p) => p.category === "Care tools",
  },
  {
    id: "underarm",
    name: "Underarm Care",
    description: "Explore roll-ons for your underarm routine",
    icon: "underarm",
    includes: (p) => p.category === "Underarm care",
  },
  {
    id: "acne",
    name: "Acne Care",
    description: "Options for blemishes & body breakouts",
    icon: "acne",
    includes: (p) =>
      p.concerns.includes("Acne-prone skin") ||
      p.concerns.includes("Body acne"),
  },
  {
    id: "hydration",
    name: "Hydration",
    description: "Moisturising options for dry-feeling skin",
    icon: "hydration",
    includes: (p) => p.concerns.includes("Dryness"),
  },
];
// Show a category only when it contains actual catalogue records. No suitability inference.
export function getCareCategories(catalogue: readonly Product[]) {
  return careCategories
    .map((category) => ({
      ...category,
      count: catalogue.filter(category.includes).length,
    }))
    .filter((category) => category.count > 0);
}
