import type { Product, ProductVariant } from "@/lib/types";
import sources from "./catalogue-sources.json";
import { catalogueReview } from "./catalogue-review";
import { catalogueGroups } from "./catalogue-groups";
import { verifiedIngredientIds } from "./ingredient-evidence";

export const catalogueCheckedOn = "2026-10-12";
export function formatCheckedOn(date: string | undefined): string {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Calcutta",
  }).format(new Date(`${date}T00:00:00Z`));
}
const sourceBySlug = new Map(sources.map((s) => [s.slug, s]));
function normalSize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/pcs|gummies|n$/g, "pieces");
}
export const products: Product[] = catalogueReview.map((review, index) => {
  const source = sourceBySlug.get(review.slug);
  if (!source || source.isRx)
    throw new Error(`Invalid verified source: ${review.slug}`);
  const kind =
    review.category === "Supplements"
      ? "supplement"
      : review.category === "Care tools"
        ? "tool"
        : source.isKit
          ? "kit"
          : "individual";
  const group = catalogueGroups[review.slug];
  const tagSize = source.sizeTags[0] || null;
  const sizeConflict = Boolean(
    tagSize &&
    source.formalSize &&
    normalSize(tagSize) !== normalSize(source.formalSize) &&
    !(
      kind === "supplement" &&
      /pcs|gummies|n$/i.test(tagSize) &&
      /\bg$/i.test(source.formalSize)
    ),
  );
  const size =
    kind === "kit"
      ? source.componentSizes.join(" + ") || null
      : sizeConflict
        ? null
        : kind === "supplement" &&
            tagSize &&
            source.formalSize &&
            /\bg$/i.test(source.formalSize)
          ? `${tagSize} · ${source.formalSize}`
          : source.formalSize || tagSize;
  const ingredients = (review.ingredients || source.keyIngredients).map((i) =>
    i.trim().replace(/:$/, ""),
  );
  // Conflicting concentration labels are retained in source evidence, never normalised into a guessed value.
  const keyIngredients = review.slug.startsWith("6-aha-bha-underarm-roll-on")
    ? ["Lactic acid", "Salicylic acid", "Kojic acid", "Mandelic acid"]
    : review.slug === "1-peptide-ceramide-moisturizer"
      ? [
          "Copper Tripeptide-1 (concentration unclear)",
          "1% D-Panthenol",
          "0.5% Ceramide Complex",
        ]
      : ingredients;
  const fieldGaps = [
    ...(review.gaps || []),
    ...(group?.note ? [group.note] : []),
    ...(review.slug.startsWith("6-aha-bha-underarm-roll-on") &&
    review.slug !== "6-aha-bha-underarm-roll-on-flora-75ml"
      ? [
          "Individual acid percentages in the highlights total more than the 6% product name; confirm the current label.",
        ]
      : []),
    ...(sizeConflict
      ? [
          `Pack size conflicts: catalogue tags say ${tagSize}; additional information says ${source.formalSize}. Check the current pack.`,
        ]
      : !size
        ? ["Pack size not verified."]
        : []),
    ...(source.price === null
      ? ["Listed price not available in the reviewed page record."]
      : []),
    ...(!(review.usage === undefined ? source.usage : review.usage)
      ? ["Usage instructions not verified."]
      : []),
    ...(!keyIngredients.length && kind !== "tool"
      ? ["Key ingredients not verified."]
      : []),
  ];
  const variants: ProductVariant[] = (group?.variants || []).map((slug) => {
    const s = sourceBySlug.get(slug)!;
    const tag = s.sizeTags[0];
    const conflict =
      tag && s.formalSize && normalSize(tag) !== normalSize(s.formalSize);
    const namedSizeConflict =
      /\(30ml\)/i.test(s.name) && s.formalSize === "50 ml";
    return {
      name: s.name,
      size: s.isKit
        ? slug === "calcium-gummies-xp"
          ? null
          : s.componentSizes.join(" + ") || null
        : conflict || namedSizeConflict
          ? null
          : s.formalSize || tag || null,
      price: s.price,
      url: s.url,
      checkedOn: s.checkedOn,
    };
  });
  const ingredientIds =
    kind === "tool"
      ? []
      : [
          ...new Set([
            ...review.ingredientIds,
            ...verifiedIngredientIds(keyIngredients, source.ingredientList),
          ]),
        ];
  return {
    id:
      review.slug === "1-salicylic-acid-body-wash-100ml"
        ? "salicylic-body-wash-100"
        : review.slug,
    formulaKey: review.slug,
    name: source.name,
    category: review.category,
    status: "verified",
    concerns: review.concerns,
    description: review.description,
    brandConcern: source.brandConcern || "",
    keyIngredients,
    ingredientIds,
    size,
    price: source.price,
    usage: review.usage === undefined ? source.usage : review.usage,
    precautions: [
      ...(review.cautions || []),
      ...(kind === "kit" && ingredientIds.includes("retinol")
        ? [
            "One component lists retinol. Avoid during pregnancy, seek guidance when breastfeeding, and use sun protection.",
          ]
        : []),
      ...((kind === "supplement" || kind === "kit") &&
      ingredientIds.includes("biotin")
        ? [
            "Oral biotin can interfere with laboratory tests. Tell your healthcare provider about supplements you take.",
          ]
        : []),
      ...(kind === "kit"
        ? [
            "Follow each component’s current directions and check the contents before ordering. A bundle does not establish that every item is suitable for you.",
          ]
        : []),
      ...(kind === "supplement" ||
      review.category === "Wellness kits" ||
      (review.category === "Hair care kits" &&
        ![
          "hair-fall-control-mini",
          "intense-dandruff-kit",
          "keratin-shampoo-with-roll-on",
        ].includes(review.slug))
        ? [
            "Follow the current serving label. Ask a healthcare professional about supplements if pregnant, breastfeeding, taking medicines or managing a health condition; do not infer need from hair or skin appearance.",
          ]
        : kind === "tool"
          ? [
              "Follow the current item’s directions and stop if use causes discomfort.",
            ]
          : [
              "General precaution: follow the current label, try a small area first, and stop if irritation develops. Individual tolerance is not established by a listed ingredient.",
            ]),
    ],
    avoidDrySkin: review.slug === "1-salicylic-acid-body-wash-100ml",
    source: {
      url: source.url,
      label: "Official Be Bodywise product page",
      checkedOn: source.checkedOn,
    },
    purchaseUrl: source.url,
    availability:
      source.outOfStock === true
        ? "Listed out of stock"
        : source.outOfStock === false
          ? "Listed in stock"
          : "Unknown",
    image: {
      src: null,
      officialSource: source.imageSource,
      permission: "pending",
      matchStatus: "unreviewed",
      alt: source.name,
    },
    ingredientEvidence: review.ingredients
      ? "Brand description"
      : source.ingredientList
        ? "Brand ingredient list"
        : "Brand highlights",
    kind,
    fragranceStatus: source.ingredientList
      ? /\b(?:perfume|fragrance|parfum)\b/i.test(source.ingredientList)
        ? "listed"
        : "not-listed"
      : "unknown",
    recommendationEligible:
      review.recommendationEligible ??
      (kind === "individual" &&
        !["Scalp serum", "Shampoo", "Conditioner", "Hair serum"].includes(
          review.category,
        )),
    fieldGaps,
    missing: [
      ...fieldGaps,
      "Photo reuse permission and visual/variant correspondence are not confirmed; a placeholder is shown.",
      "Price and stock are dated snapshots; confirm at the official store.",
    ],
    variants,
    accent: (["blue", "lilac", "sand"] as const)[index % 3],
  };
});
export const productById = new Map(products.map((p) => [p.id, p]));
export const catalogueCategories = [
  ...new Set(products.map((p) => p.category)),
];
export const catalogueConcerns = [
  ...new Set(products.flatMap((p) => p.concerns)),
];
export const catalogueStats = {
  uniqueProducts: products.length,
  categories: catalogueCategories.length,
  usableRealImages: products.filter(
    (p) =>
      p.image?.src &&
      p.image.permission === "permitted" &&
      p.image.matchStatus === "verified",
  ).length,
  productsWithUnverifiedFields: products.filter((p) => p.missing.length).length,
  productsWithCoreFieldGaps: products.filter((p) => p.fieldGaps?.length).length,
};
