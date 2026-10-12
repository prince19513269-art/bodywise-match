import type { Ingredient } from "@/lib/types";
import { ingredientAdditions } from "./ingredient-additions";
import { catalogueIngredientGuides } from "./catalogue-ingredient-guides";
const aad = {
  url: "https://www.aad.org/public/everyday-care/skin-care-secrets/routine/facial-masks-and-skin-care",
  label: "American Academy of Dermatology — ingredient guidance",
  checkedOn: "2026-10-11",
};
export const ingredients: Ingredient[] = [
  {
    id: "salicylic-acid",
    name: "Salicylic acid",
    family: "BHA · EXFOLIATION",
    symbol: "SA",
    summary: "An exfoliant often used in products for oily or acne-prone skin.",
    what: "A beta-hydroxy acid (BHA).",
    does: "Helps exfoliate and unclog pores.",
    why: "Used in formulas aimed at oiliness and clogged pores.",
    precautions:
      "Exfoliation can cause dryness or irritation, especially when several exfoliating products are combined.",
    limits:
      "An ingredient name cannot predict your results or tolerance. It is not a guaranteed acne solution.",
    source: aad,
  },
  {
    id: "niacinamide",
    name: "Niacinamide",
    family: "VITAMIN B3 · SKIN SUPPORT",
    symbol: "B₃",
    summary: "A form of vitamin B3 used in a variety of skincare formulas.",
    what: "A form of vitamin B3.",
    does: "May help reduce the appearance of oily shine.",
    why: "Used in skincare aimed at oiliness and blemish-prone skin.",
    precautions: "Check the whole formula and stop if it irritates your skin.",
    limits:
      "It does not guarantee clear skin or make every formula suitable for sensitive skin.",
    source: aad,
  },
  {
    id: "hyaluronic-acid",
    name: "Hyaluronic acid",
    family: "HUMECTANT · HYDRATION",
    symbol: "HA",
    summary:
      "A moisture-attracting ingredient, rather than an exfoliating acid.",
    what: "A humectant: an ingredient that attracts water.",
    does: "Helps keep skin hydrated.",
    why: "Used in moisturising formulas for the face and body.",
    precautions:
      "Tolerance depends on the full product. Stop if a formula causes discomfort.",
    limits:
      "Hydration is not a treatment for every cause of dryness. Persistent symptoms need professional assessment.",
    source: {
      ...aad,
      url: "https://www.aad.org/public/everyday-care/skin-care-basics/care/winter-skin-survival-kit",
      label: "American Academy of Dermatology — winter skincare",
    },
  },
  {
    id: "glycolic-acid",
    name: "Glycolic acid",
    family: "AHA · EXFOLIATION",
    symbol: "GA",
    summary: "An exfoliating acid used in formulas focused on skin texture.",
    what: "An alpha-hydroxy acid (AHA).",
    does: "Exfoliates the skin surface.",
    why: "Used to improve the appearance of skin texture.",
    precautions:
      "Can irritate skin. Avoid layering exfoliants without guidance; follow the label and use sun protection.",
    limits: "It cannot guarantee even tone or remove every type of mark.",
    source: aad,
  },
  ...ingredientAdditions,
  ...catalogueIngredientGuides,
];
