import type { Answers, Match, Product } from "./types";
import { discoveryLabels, discoveryPool } from "./discovery";
export function inBudget(
  price: number | null,
  budget: Answers["budget"],
): boolean {
  if (!budget || budget === "Flexible / just exploring") return true;
  if (price === null) return false;
  if (budget === "Below ₹300") return price < 300;
  if (budget === "₹300–₹600") return price >= 300 && price <= 600;
  return price > 600 && price <= 1000;
}
export function matchProducts(
  answers: Answers,
  catalogue: readonly Product[],
): Match[] {
  if (answers.discoveryCategory)
    return matchDiscoveryProducts(answers, catalogue);
  if (!answers.concern) return [];
  return catalogue
    .filter(
      (product) =>
        product.status === "verified" &&
        product.source !== null &&
        product.recommendationEligible !== false,
    )
    .filter(
      (product) =>
        answers.concern === "General skincare discovery" ||
        product.concerns.includes(answers.concern!),
    )
    .filter(
      (product) => !(answers.skin === "Often dry" && product.avoidDrySkin),
    )
    .filter((product) => inBudget(product.price, answers.budget))
    .map((product) => ({
      product,
      reasons: [
        answers.concern === "General skincare discovery"
          ? "Included from our source-checked catalogue because you chose general discovery."
          : `The brand lists this product for ${answers.concern!.toLowerCase()}.`,
        ...(answers.budget && answers.budget !== "Flexible / just exploring"
          ? [
              `Its recorded price of ₹${product.price} is within your selected budget.`,
            ]
          : []),
      ],
      cautions: [
        ...product.precautions,
        ...(answers.sensitivity === "Yes" || answers.sensitivity === "Not sure"
          ? [
              "You reported irritation or uncertainty. This is an option to research, not confirmation that your skin will tolerate it. Consider professional guidance before trying a new active.",
            ]
          : []),
        ...(answers.skin === "Not sure"
          ? [
              "Skin characteristics are uncertain; no skin-type suitability is inferred.",
            ]
          : []),
      ],
      notices: [
        ...product.missing,
        ...(product.price === null
          ? ["Price unavailable; budget suitability cannot be checked."]
          : ["Price is a recorded snapshot, not a live offer."]),
      ],
    }));
}
function matchDiscoveryProducts(
  answers: Answers,
  catalogue: readonly Product[],
): Match[] {
  if (!answers.selectedConcerns?.length) return [];
  const concerns = (answers.selectedConcerns || []).filter(
    (c) => c !== "Not sure",
  );
  const skinPath =
    answers.discoveryCategory === "face" ||
    answers.discoveryCategory === "body";
  return discoveryPool(answers, catalogue)
    .filter(
      (p) =>
        p.status === "verified" &&
        p.source !== null &&
        !!p.usage &&
        (p.kind === "tool" || p.keyIngredients.length > 0),
    )
    .filter(
      (p) => !concerns.length || concerns.some((c) => p.concerns.includes(c)),
    )
    .filter(
      (p) =>
        !answers.productType ||
        ["Any product type", "Not sure"].includes(answers.productType) ||
        p.category === answers.productType,
    )
    .filter((p) => !skinPath || answers.skin !== "Often dry" || !p.avoidDrySkin)
    .filter(
      (p) =>
        answers.fragrancePreference !== "Avoid fragrance" ||
        p.fragranceStatus === "not-listed",
    )
    .filter((p) => inBudget(p.price, answers.budget))
    .sort(
      (a, b) =>
        concerns.filter((c) => b.concerns.includes(c)).length -
        concerns.filter((c) => a.concerns.includes(c)).length,
    )
    .map((product) => ({
      product,
      reasons: [
        `Included in your ${discoveryLabels[answers.discoveryCategory!].toLowerCase()} selection.`,
        ...(concerns.length
          ? [
              `The brand positions it for ${concerns
                .filter((c) => product.concerns.includes(c))
                .join(", ")
                .toLowerCase()}.`,
            ]
          : [
              "You chose not sure, so we have kept discovery broad within your selected categories.",
            ]),
        ...(answers.productType &&
        !["Any product type", "Not sure"].includes(answers.productType)
          ? [
              `It is a ${product.category.toLowerCase()}, matching your product preference.`,
            ]
          : []),
        ...(answers.fragrancePreference === "Avoid fragrance"
          ? [
              "No fragrance was listed in the reviewed ingredient list; confirm the current label.",
            ]
          : []),
        ...(answers.budget && answers.budget !== "Flexible / just exploring"
          ? [
              `Its recorded price of ₹${product.price} is within your selected budget.`,
            ]
          : []),
      ],
      cautions: [
        ...product.precautions,
        ...(answers.sensitivity === "Yes" || answers.sensitivity === "Not sure"
          ? [
              "You reported irritation or uncertainty. This is an option to research, not confirmation that your skin or scalp will tolerate it. Consider professional guidance before trying a new active.",
            ]
          : []),
        ...(answers.discoveryCategory === "hair"
          ? [
              `Your scalp response (${answers.scalp || "not sure"}) adds context; the catalogue does not establish suitability for a particular scalp type. Facial skin preferences are not used for hair recommendations.`,
            ]
          : []),
        ...(skinPath && answers.skin
          ? [
              `Your skin response (${answers.skin}) does not establish suitability. Only recorded product guidance is used to exclude options.`,
            ]
          : []),
        ...(answers.familiarity === "Beginner"
          ? [
              "Start with the product directions and ingredient guides; this list is not advice to use all these products together.",
            ]
          : []),
      ],
      notices: [
        ...product.missing,
        product.price === null
          ? "Price unavailable; budget suitability cannot be checked."
          : "Price is a recorded snapshot, not a live offer.",
      ],
    }));
}
