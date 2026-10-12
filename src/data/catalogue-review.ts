import type { Concern, Product } from "@/lib/types";
import { catalogueExpansion } from "./catalogue-expansion";
export type Review = {
  slug: string;
  category: Product["category"];
  concerns: Concern[];
  description: string;
  ingredientIds: string[];
  ingredients?: string[];
  cautions?: string[];
  gaps?: string[];
  usage?: string | null;
  recommendationEligible?: boolean;
};
// Human-reviewed interpretation of cached official pages, not automatic benefit inference.
// Titles/formulations remain distinct; size-only variants are grouped in products.ts.
export const catalogueReview: Review[] = [
  {
    slug: "1-salicylic-acid-body-wash-100ml",
    category: "Body wash",
    concerns: ["Body acne", "Body texture or bumps"],
    description:
      "A rinse-off body cleanser listed for body acne and textured skin.",
    ingredientIds: ["salicylic-acid"],
    cautions: ["Brand guidance advises against use on very dry skin."],
    gaps: [
      "Usage frequency differs across the brand page; follow the current pack label.",
    ],
  },
  {
    slug: "salicylic-ceramide-bodywash",
    category: "Body wash",
    concerns: ["Body acne", "Dryness"],
    description:
      "A dual-pump body cleanser combining exfoliating and moisturising ingredient blends.",
    ingredientIds: [
      "salicylic-acid",
      "glycerin",
      "hyaluronic-acid",
      "ceramides",
    ],
    cautions: [
      "Formulated for the body; do not substitute it for a facial cleanser.",
    ],
  },
  {
    slug: "5-aha-bha-bodywash-700ml",
    category: "Body wash",
    concerns: [
      "Body acne",
      "Body texture or bumps",
      "Acne marks or uneven tone",
    ],
    description:
      "An exfoliating body cleanser positioned for tanning, dark patches and rough texture.",
    ingredientIds: ["glycolic-acid", "lactic-acid", "salicylic-acid"],
    ingredients: ["Glycolic acid", "Lactic acid", "Salicylic acid"],
    cautions: ["Use sun protection after exfoliating."],
    gaps: [
      "Individual acid concentrations were not confirmed; 5% is the product-name blend claim.",
    ],
  },
  {
    slug: "6-aha-bha-underarm-roll-on-flora-75ml",
    category: "Underarm care",
    concerns: ["Underarm odour", "Underarm uneven tone"],
    description:
      "The Flora version of the 6% acid-blend roll-on, positioned for underarm odour and pigmentation.",
    ingredientIds: ["lactic-acid", "salicylic-acid"],
    cautions: ["For underarms; exfoliating formulas can cause irritation."],
    gaps: [
      "The individual highlighted acid percentages do not reconcile with the 6% name; confirm the current label.",
    ],
  },
  {
    slug: "body-sunscreen-lotion-with-spf-50",
    category: "Sun protection",
    concerns: ["Sun protection", "Acne marks or uneven tone"],
    description:
      "A body sunscreen lotion marketed with SPF 50+ and tan-correction positioning.",
    ingredientIds: ["niacinamide"],
    cautions: [
      "Follow the label for coverage and reapplication. No sunscreen eliminates all UV exposure.",
    ],
  },
  {
    slug: "folli-advanced-plus-hair-growth-serum",
    category: "Scalp serum",
    concerns: ["Hair thinning"],
    description:
      "A leave-in scalp roll-on with spicule delivery, distinct from the regular Advanced Hair Growth Serum.",
    ingredientIds: ["rosemary"],
    cautions: [
      "The brand specifies use for women aged 18 and above. Persistent or sudden hair loss warrants professional assessment.",
    ],
    gaps: [
      "Only selected actives were reviewed; the advertised 38% total blend was not independently verified.",
    ],
  },
  {
    slug: "1-zpto-anti-dandruff-shampoo",
    category: "Shampoo",
    concerns: ["Dandruff"],
    description:
      "A rinse-off shampoo positioned for moderate dandruff and scalp dryness.",
    ingredientIds: ["zinc-pyrithione", "salicylic-acid", "allantoin"],
    cautions: [
      "Keep away from eyes. Persistent scalp symptoms should be assessed professionally.",
    ],
  },
  {
    slug: "20-urea-lotion-xp",
    category: "Body lotion",
    concerns: ["Dryness"],
    description:
      "A 20% urea lotion marketed for dry to very dry, flaky body skin.",
    ingredientIds: ["urea", "ceramides"],
    cautions: [
      "Urea-containing products can sting damaged skin; follow the label.",
    ],
  },
  {
    slug: "anti-stretch-mark-roll-on",
    category: "Stretch mark care",
    concerns: ["Stretch mark appearance"],
    description:
      "A targeted body roll-on marketed for the appearance of stretch marks.",
    ingredientIds: [],
    ingredients: ["Regeneryl", "Striover™"],
    cautions: [
      "The brand’s stretch-mark positioning is not a guarantee of prevention or removal.",
    ],
    gaps: ["Concentrations and complete formulation were not confirmed."],
  },
  {
    slug: "acne-control-wash",
    category: "Face cleanser",
    concerns: ["Acne-prone skin", "Oiliness"],
    description:
      "A foam-based facial cleanser listed for mild, occasional acne.",
    ingredientIds: ["glycolic-acid", "salicylic-acid"],
    cautions: [
      "Brand guidance notes possible dryness and advises against combining with retinol products.",
    ],
  },
  {
    slug: "niacinamide-body-lotion",
    category: "Body lotion",
    concerns: ["Acne marks or uneven tone", "Dryness"],
    description:
      "A body lotion marketed for nourishment and the appearance of acne marks.",
    ingredientIds: ["niacinamide", "aloe-vera"],
    gaps: [
      "The image filename refers to 250 mL while the listing says 200 mL; image/variant correspondence needs review.",
    ],
  },
  {
    slug: "5-lactic-acid-body-lotion",
    category: "Body lotion",
    concerns: ["Body texture or bumps", "Dryness"],
    description:
      "An exfoliating body lotion positioned for rough texture and bumpy skin.",
    ingredientIds: ["lactic-acid", "centella-asiatica", "aloe-vera"],
    cautions: [
      "Use sun protection when following an exfoliating body-care routine.",
    ],
  },
  {
    slug: "2-salicylic-acid-face-wash",
    category: "Face cleanser",
    concerns: ["Acne-prone skin", "Oiliness"],
    description:
      "A facial cleanser listed for mild, occasional acne and oily skin.",
    ingredientIds: ["salicylic-acid", "allantoin"],
    cautions: [
      "Stop or reduce use if drying or irritation occurs; follow the label.",
    ],
  },
  {
    slug: "hair-growth-serum-roll-on",
    category: "Scalp serum",
    concerns: ["Hair thinning"],
    description:
      "The regular Advanced Hair Growth Serum in a leave-in scalp roll-on format.",
    ingredientIds: ["rosemary"],
    cautions: [
      "Apply to the scalp, not the hair lengths. Brand claims do not establish regrowth for an individual.",
    ],
  },
  {
    slug: "5-niacinamide-body-wash",
    category: "Body wash",
    concerns: ["Dryness"],
    description: "A niacinamide body cleanser listed for dull and dry skin.",
    ingredientIds: ["niacinamide", "aloe-vera"],
  },
  {
    slug: "anti-dandruff-serum",
    category: "Scalp serum",
    concerns: ["Dandruff"],
    description: "A scalp serum marketed for dandruff and scalp discomfort.",
    ingredientIds: ["zinc-pyrithione"],
    cautions: [
      "For scalp use. Keep away from eyes and follow label instructions.",
    ],
  },
  {
    slug: "deep-moisturizing-conditioner",
    category: "Conditioner",
    concerns: ["Dry or frizzy hair"],
    description:
      "A rinse-out conditioner with brand-highlighted biotin and argan oil.",
    ingredientIds: ["biotin", "argan-oil"],
    cautions: ["Apply along hair strands and ends as directed, then rinse."],
  },
  {
    slug: "hair-strengthening-serum",
    category: "Hair serum",
    concerns: ["Dry or frizzy hair", "Damaged hair"],
    description:
      "A hair-length serum positioned for dry, damaged hair and frizz reduction.",
    ingredientIds: ["argan-oil", "olive-oil"],
    cautions: [
      "Brand instructions distinguish hair-length application from scalp treatment.",
    ],
  },
  {
    slug: "hair-fall-control-shampoo",
    category: "Shampoo",
    concerns: ["Dry or frizzy hair"],
    description:
      "A keratin and biotin shampoo; the current listing positions it for dry and frizzy hair.",
    ingredientIds: ["keratin", "biotin"],
    cautions: [
      "Rinse thoroughly. A shampoo name is not evidence that it treats every cause of hair loss.",
    ],
  },
  {
    slug: "20-urea-roll-on-50ml",
    category: "Foot care",
    concerns: ["Rough heels"],
    description:
      "A foot roll-on with 20% urea and exfoliating ingredients, positioned for rough heels.",
    ingredientIds: ["urea", "lactic-acid", "olive-oil"],
    cautions: [
      "Foot use only; acidic preparations can sting cracked or irritated skin.",
    ],
  },
  {
    slug: "10-urea-lotion",
    category: "Body lotion",
    concerns: ["Dryness"],
    description:
      "A 10% urea body lotion with mango and kokum seed butter highlights.",
    ingredientIds: ["urea", "shea-butter", "glycerin", "ceramides"],
    cautions: ["The full ingredient list includes perfume."],
  },
  {
    slug: "glycolic-acid-stick",
    category: "Body exfoliant",
    concerns: ["Body texture or bumps", "Acne marks or uneven tone"],
    description:
      "A targeted exfoliating body stick marketed for pigmentation, ingrown hair and bumpy texture.",
    ingredientIds: ["glycolic-acid", "salicylic-acid", "shea-butter"],
    cautions: [
      "The brand advises starting slowly, avoiding facial use and following with sun protection.",
    ],
  },
  {
    slug: "1-peptide-ceramide-moisturizer",
    category: "Face moisturiser",
    concerns: ["Dryness"],
    description:
      "A gel-based moisturiser with copper peptide, panthenol and ceramide highlights.",
    ingredientIds: [
      "copper-peptides",
      "panthenol",
      "ceramides",
      "allantoin",
      "hyaluronic-acid",
    ],
    gaps: [
      "The peptide highlight combines 1% with 2000 ppm; the exact active concentration is unclear.",
    ],
  },
  {
    slug: "acne-spot-correction",
    category: "Face treatment",
    concerns: ["Acne-prone skin"],
    description:
      "A salicylic acid spot-treatment gel with glycolic acid and niacinamide highlights.",
    ingredientIds: ["salicylic-acid", "glycolic-acid", "niacinamide"],
    cautions: [
      "Brand guidance cautions against use with retinol-based products.",
    ],
  },
  {
    slug: "hydrocolloid-acne-pimple-patch",
    category: "Acne patches",
    concerns: ["Acne-prone skin"],
    description:
      "Hydrocolloid patches listed for covering individual active blemishes.",
    ingredientIds: [],
    cautions: [
      "The brand advises storing unused patches in their pouch. Patches do not address every cause or type of acne.",
    ],
  },
  {
    slug: "ultra-light-sunscreen-spf50",
    category: "Sun protection",
    concerns: ["Sun protection"],
    description:
      "A facial sunscreen marketed as an ultra-light SPF50+ formula.",
    ingredientIds: ["niacinamide", "centella-asiatica"],
    cautions: ["Follow the current label for application and reapplication."],
  },
  {
    slug: "4-aha-bha-underarm-roll-on-no-fragrance",
    category: "Underarm care",
    concerns: ["Underarm odour", "Underarm uneven tone"],
    description:
      "The product labelled “No Fragrance” in the 4% AHA BHA underarm range.",
    ingredientIds: ["salicylic-acid", "lactic-acid", "shea-butter", "glycerin"],
    cautions: [
      "The ingredient list includes Perfume despite the No Fragrance name. Do not assume fragrance-free suitability.",
    ],
    gaps: [
      "Product name and ingredient list disagree about fragrance; confirm the current label.",
    ],
  },
  {
    slug: "triple-milk-deep-hydrating-bodywash-xp",
    category: "Body wash",
    concerns: ["Dryness"],
    description:
      "A hydrating body cleanser with shea, coconut and oat milk extract blends.",
    ingredientIds: ["glycerin", "hyaluronic-acid", "centella-asiatica"],
    cautions: [
      "Designed for body use; the brand advises using a separate facial product.",
    ],
  },
  {
    slug: "30-urea-foot-roll-on",
    category: "Foot care",
    concerns: ["Rough heels"],
    description:
      "The distinct 30% urea foot formula with lactic and glycolic acid highlights.",
    ingredientIds: ["urea", "lactic-acid", "glycolic-acid", "olive-oil"],
    cautions: [
      "Foot use only. The higher urea percentage does not establish individual suitability.",
    ],
  },
  {
    slug: "10-magnesium-lotion-300ml",
    category: "Body lotion",
    concerns: ["Body massage and nourishment"],
    description:
      "A magnesium-chloride body lotion marketed for massage and nourishment. Muscle-relief claims are not validated by this catalogue.",
    ingredientIds: ["shea-butter"],
    cautions: [
      "The brand lists lavender oil; plant-derived fragrance can still irritate skin.",
    ],
    gaps: [
      "Claims about muscle relief or sleep have not been independently assessed.",
    ],
  },
  ...catalogueExpansion,
];
