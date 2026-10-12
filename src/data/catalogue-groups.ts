// Explicit source review: identical named formula/ingredient lists, size-only or offer aliases.
// Fragrance versions and differing actives remain distinct. Existing public product IDs are retained.
export const catalogueGroups: Record<
  string,
  { variants: string[]; aliases?: string[]; note?: string }
> = {
  "1-salicylic-acid-body-wash-100ml": {
    variants: [
      "1-salicylic-acid-body-wash-100ml",
      "1-salicylic-acid-body-wash",
      "1-salicylic-acid-body-wash-350ml",
      "salicylic-acid-body-wash-700",
    ],
  },
  "1-ketoconazole-dandruff-shampoo-150ml": {
    variants: [
      "1-ketoconazole-dandruff-shampoo-150ml",
      "1-ketoconazole-dandruff-shampoo-250ml",
    ],
  },
  "10-aha-body-scrub": {
    variants: ["10-aha-body-scrub", "10-aha-body-scrub-300"],
  },
  "10-magnesium-lotion-300ml": {
    variants: ["10-magnesium-lotion-300ml", "10-magnesium-lotion"],
  },
  "10-urea-lotion": { variants: ["10-urea-lotion", "10-urea-lotion-300ml"] },
  "20-urea-roll-on-50ml": {
    variants: ["20-urea-roll-on-50ml", "20-urea-roll-on-75ml"],
  },
  "30-urea-foot-roll-on": {
    variants: ["30-urea-foot-roll-on", "30-urea-foot-roll-on-75ml"],
  },
  "4-aha-bha-underarm-roll-on": {
    variants: ["4-aha-bha-underarm-roll-on", "4-aha-bha-underarm-rollon-75"],
  },
  "4-aha-bha-underarm-roll-on-no-fragrance": {
    variants: [
      "4-aha-bha-underarm-roll-on-no-fragrance",
      "4-aha-bha-underarm-rollon-frag-free-75",
    ],
  },
  "5-aha-bha-bodywash-700ml": {
    variants: ["5-aha-bha-bodywash-700ml", "5-aha-bha-bodywash"],
  },
  "5-aha-bha-bodywash-250ml-flora": {
    variants: [
      "5-aha-bha-bodywash-250ml-flora",
      "5-aha-bha-bodywash-700ml-flora",
    ],
  },
  "5-niacinamide-body-wash": {
    variants: ["5-niacinamide-body-wash", "niacinamide-body-wash-700"],
  },
  "6-aha-bha-underarm-roll-on-flora-75ml": {
    variants: [
      "6-aha-bha-underarm-roll-on-flora-75ml",
      "6-aha-bha-underarm-roll-on",
      "6-aha-bha-underarm-roll-on-twin-pack-75ml",
    ],
  },
  "6-aha-bha-underarm-roll-on-aqua": {
    variants: [
      "6-aha-bha-underarm-roll-on-aqua",
      "6-aha-bha-underarm-roll-on-aqua-75ml",
    ],
  },
  "2-aha-body-wash": { variants: [], aliases: ["aha-body-wash-deal"] },
  "acne-control-wash": { variants: [], aliases: ["salicylic-acid-face-wash"] },
  "body-sunscreen-spray-with-spf-50": {
    variants: [],
    aliases: ["body-sunscreen-spray-with-spf-50-deal"],
  },
  "triple-milk-deep-hydrating-bodywash-xp": {
    variants: [],
    aliases: ["triple-milk-deep-hydrating-bodywash"],
  },
  "hair-strengthening-serum": {
    variants: ["hair-strengthening-serum", "hair-strengthening-serum-50-ml"],
  },
  "hair-growth-serum-roll-on": {
    variants: [
      "hair-growth-serum-roll-on",
      "hair-growth-serum-roll-on-2-months-xp",
      "advanced-hair-growth-serum",
      "advanced-hair-growth-serum-30ml",
      "hair-growth-serum-pp-roll-on",
      "hair-growth-serum-spray",
    ],
    aliases: ["hair-growth-serum-30ml-xp-1"],
    note: "Regular Advanced serum delivery formats are grouped conservatively because a distinct formulation was not established from their shared highlights. Full lists on the dropper and post-pregnancy pages match, but were unavailable on the standard roll-on and spray pages. Some rosemary concentration labels and 30 ml/50 ml quantities conflict; confirm the exact formula and size of the chosen pack.",
  },
  "biotin-multivitamin-hair-gummies-2m": {
    variants: [
      "biotin-multivitamin-hair-gummies-2m",
      "hair-health-gummies-pack-3",
      "biotin-hair-gummies-120",
    ],
    note: "The 60, 90 and 120 gummy pages list the same formula; the 30 gummy page lists a different ingredient formula and is kept separately.",
  },
  "advanced-magnesium-gummies-60n": {
    variants: [
      "advanced-magnesium-gummies-60n",
      "advanced-magnesium-gummies-30n",
    ],
    aliases: ["magnesium-glycinate-gummies-60n"],
    note: "The 30 gummy page also shows a 60 piece tag. Confirm the pack quantity; ingredient and brand blend information match the 60 gummy range.",
  },
  "calcium-gummies": {
    variants: ["calcium-gummies", "calcium-gummies-xp"],
    note: "The pack-of-2 page shows 60 pieces in tags but 30 gummies in additional information. Confirm the total count at the store.",
  },
  "advanced-hair-growth-pack": {
    variants: [],
    aliases: ["advanced-hair-growth-pack-xp"],
  },
  "anti-stress-hairfall-kit": {
    variants: [],
    aliases: ["hair-magnesium-gummies-kit-30n"],
  },
  "hair-growth-pack-rosemary-roll-on-xp-2": {
    variants: [
      "hair-growth-pack-rosemary-roll-on-xp-2",
      "hair-growth-pack-rosemary-roll-on-90n",
    ],
  },
  "urea-skin-heel-repair-kit": {
    variants: ["urea-skin-heel-repair-kit", "urea-skin-heel-repair-kit-75ml"],
  },
};
