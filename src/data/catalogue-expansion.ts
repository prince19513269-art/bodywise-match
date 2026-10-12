import type { Review } from "./catalogue-review";
import type { Concern, Product } from "@/lib/types";
// Concise, manually reviewed descriptions of cached official pages. No clinical promises imported.
type Entry = [
  slug: string,
  category: Product["category"],
  concerns: Concern[],
  description: string,
];
const entries: Entry[] = [
  [
    "1-ketoconazole-dandruff-shampoo-150ml",
    "Shampoo",
    ["Dandruff"],
    "A ketoconazole shampoo listed for dandruff and scalp flaking.",
  ],
  [
    "10-aha-body-scrub",
    "Body exfoliant",
    ["Body texture or bumps", "Acne marks or uneven tone"],
    "A body scrub combining lactic acid with physical exfoliating particles.",
  ],
  [
    "12-aha-scrub",
    "Body exfoliant",
    ["Body texture or bumps", "Acne marks or uneven tone"],
    "A body scrub whose highlights list 10% lactic acid and 2% glycolic acid.",
  ],
  [
    "2-5-benzoyl-peroxide-bodywash",
    "Body wash",
    ["Body acne"],
    "A rinse-off benzoyl peroxide body cleanser positioned for body breakouts.",
  ],
  [
    "2-aha-body-wash",
    "Body wash",
    ["Body texture or bumps", "Dryness"],
    "A body cleanser with an AHA blend, glycerin and aloe vera.",
  ],
  [
    "4-aha-bha-underarm-roll-on",
    "Underarm care",
    ["Underarm odour", "Underarm uneven tone"],
    "The Flora fragrance version of the 4% AHA BHA underarm roll-on.",
  ],
  [
    "4-aha-bha-underarm-roll-on-aqua",
    "Underarm care",
    ["Underarm odour", "Underarm uneven tone"],
    "The Aqua fragrance version of the 4% AHA BHA underarm roll-on.",
  ],
  [
    "4-aha-bha-underarm-roll-on-oudh",
    "Underarm care",
    ["Underarm odour", "Underarm uneven tone"],
    "The Oudh fragrance version of the 4% AHA BHA underarm roll-on.",
  ],
  [
    "4-aha-bha-underarm-roll-on-watermelon",
    "Underarm care",
    ["Underarm odour", "Underarm uneven tone"],
    "The Watermelon fragrance version of the 4% AHA BHA underarm roll-on.",
  ],
  [
    "5-aha-bha-bodywash-250ml-flora",
    "Body wash",
    ["Body texture or bumps", "Acne marks or uneven tone"],
    "The Flora fragrance version of the exfoliating AHA BHA body cleanser.",
  ],
  [
    "6-aha-bha-underarm-roll-on-aqua",
    "Underarm care",
    ["Underarm odour", "Underarm uneven tone"],
    "The Aqua version of the underarm roll-on marketed as a 6% acid blend.",
  ],
  [
    "6-aha-bha-underarm-roll-on-frag-free",
    "Underarm care",
    ["Underarm odour", "Underarm uneven tone"],
    "The fragrance-free-labelled version of the 6% underarm roll-on range.",
  ],
  [
    "6-aha-bha-underarm-roll-on-watermelon",
    "Underarm care",
    ["Underarm odour", "Underarm uneven tone"],
    "The Watermelon version of the underarm roll-on marketed as a 6% acid blend.",
  ],
  [
    "benzoyl-peroxide-facewash",
    "Face cleanser",
    ["Acne-prone skin"],
    "A rinse-off face cleanser whose highlights list 2.5% benzoyl peroxide.",
  ],
  [
    "biotin-hair-gummies-breastfeeding-moms-30n-xp",
    "Supplements",
    ["Hair thinning", "Nutritional support"],
    "A hair supplement gummy marketed for post-pregnancy hair fall, with a distinct DHA-containing formula.",
  ],
  [
    "biotin-multivitamin-hair-gummies-2m",
    "Supplements",
    ["Hair thinning", "Nutritional support"],
    "Biotin and multivitamin gummies in the 60, 90 and 120 count range.",
  ],
  [
    "hair-health-gummies",
    "Supplements",
    ["Hair thinning", "Nutritional support"],
    "The 30-count biotin gummy listing. Its published ingredient list differs from the larger-count range.",
  ],
  [
    "advanced-magnesium-gummies-60n",
    "Supplements",
    ["Nutritional support", "Sleep and relaxation"],
    "Gummies containing a five-form magnesium blend, marketed for sleep and relaxation.",
  ],
  [
    "body-sunscreen-spray-with-spf-50",
    "Sun protection",
    ["Sun protection"],
    "A body sunscreen in a spray format, marketed with SPF 50.",
  ],
  [
    "brow-lash-serum",
    "Brow & lash care",
    ["Brow and lash care"],
    "An applicator serum for eyebrows and lashes with Anagain, Redensyl, LashLD and Aminexil highlights.",
  ],
  [
    "calcium-gummies",
    "Supplements",
    ["Nutritional support"],
    "A calcium supplement gummy with lichen-derived vitamin D3 and chicory root.",
  ],
  [
    "collagen-skin-gummies",
    "Supplements",
    ["Nutritional support"],
    "Plant-extract gummies marketed as a collagen-building supplement; the highlights list a botanical blend rather than collagen itself.",
  ],
  [
    "glutathione-gummies-60",
    "Supplements",
    ["Nutritional support"],
    "A glutathione and multivitamin gummy supplement marketed for skin appearance.",
  ],
  [
    "face-razor-for-women",
    "Care tools",
    ["Facial grooming"],
    "A facial grooming razor with stainless-steel blades and a protective cover.",
  ],
  [
    "ice-roller",
    "Care tools",
    ["Cooling facial care"],
    "A refillable freezing tool marketed for cooling facial care.",
  ],
  [
    "lightest-mineral-sunscreen-spf50",
    "Sun protection",
    ["Sun protection"],
    "A face sunscreen marketed with SPF 50+, with titanium dioxide and zinc oxide identified in the official description.",
  ],
  [
    "multivitamin-gummies",
    "Supplements",
    ["Nutritional support"],
    "A gummy multivitamin supplement with B vitamins, vitamins C, D3 and E, and zinc highlights.",
  ],
  [
    "pigmentation-repair-cream",
    "Body cream",
    ["Acne marks or uneven tone", "Body texture or bumps"],
    "A body cream positioned for uneven tone and rough areas around the neck, knees, elbows and body folds.",
  ],
  [
    "scalp-massager",
    "Care tools",
    ["Scalp cleansing"],
    "A handheld silicone-bristle tool for use while washing or conditioning hair.",
  ],
  [
    "water-hardness-test-strip-sample",
    "Care tools",
    ["Water hardness testing"],
    "A listing titled Water Hardness Test Strip. Its description and directions instead describe a water-softening liquid; confirm the actual item before purchasing.",
  ],
  [
    "1-zpto-ads-hg30-kit",
    "Hair care kits",
    ["Dandruff", "Hair thinning"],
    "A kit pairing the 1% ZPTO shampoo with hair supplement gummies.",
  ],
  [
    "advanced-hair-growth-pack",
    "Hair care kits",
    ["Hair thinning"],
    "A bundle of Advanced Hair Growth Serum and hair supplement gummies.",
  ],
  [
    "advanced-underarm-pigmentation-kit",
    "Body care kits",
    ["Underarm odour", "Underarm uneven tone"],
    "A bundle of 6% AHA BHA underarm roll-on and Pigmentation Repair Cream.",
  ],
  [
    "advanced-urea-skin-heel-repair-kit-50ml",
    "Body care kits",
    ["Dryness", "Rough heels"],
    "A kit pairing 20% Urea Lotion with a foot roll-on.",
  ],
  [
    "aha-bha-body-pack",
    "Body care kits",
    ["Body texture or bumps"],
    "A bundle of 1% Salicylic Acid Body Wash and 5% Lactic Acid Body Lotion.",
  ],
  [
    "anti-stress-hairfall-kit",
    "Wellness kits",
    ["Hair thinning", "Sleep and relaxation"],
    "A bundle of hair supplement gummies and magnesium gummies, marketed for stress-related hair fall.",
  ],
  [
    "body-care-mini-pack",
    "Body care kits",
    ["Body acne", "Acne marks or uneven tone"],
    "A bundle of 1% Salicylic Acid Body Wash and 10% Niacinamide Body Lotion.",
  ],
  [
    "body-de-tan-kit",
    "Body care kits",
    ["Sun protection", "Acne marks or uneven tone"],
    "A body-care bundle pairing an exfoliating wash with De-Tan SPF 50+ Body Sunscreen Lotion.",
  ],
  [
    "body-exfoliation-pigmentation-kit",
    "Body care kits",
    ["Body texture or bumps", "Acne marks or uneven tone"],
    "A bundle of the glycolic acid body stick and Pigmentation Repair Cream.",
  ],
  [
    "daily-hydration-kit",
    "Body care kits",
    ["Dryness"],
    "A bundle of Triple Milk Deep Hydrating Body Wash and 10% Urea Body Lotion.",
  ],
  [
    "dandruff-and-hairfall-kit",
    "Hair care kits",
    ["Dandruff", "Hair thinning"],
    "A bundle of ketoconazole shampoo and biotin hair gummies.",
  ],
  [
    "face-and-body-acne-kit",
    "Body care kits",
    ["Acne-prone skin", "Body acne"],
    "A kit of face and body salicylic acid cleansers.",
  ],
  [
    "face-body-sunscreen-kit",
    "Sun care kits",
    ["Sun protection"],
    "A bundle of Ultra Light Sunscreen SPF50+ and Body Sunscreen Spray with SPF 50.",
  ],
  [
    "hair-fall-control-mini",
    "Hair care kits",
    ["Dry or frizzy hair"],
    "A hair cleansing and conditioning bundle with keratin shampoo and conditioner.",
  ],
  [
    "hair-growth-pack-30ml-xp",
    "Hair care kits",
    ["Hair thinning"],
    "A dropper-format Advanced Hair Growth Serum bundle with hair supplement gummies.",
  ],
  [
    "hair-growth-pack-rosemary-roll-on-xp-2",
    "Hair care kits",
    ["Hair thinning"],
    "A 25 ml roll-on scalp serum bundle with hair supplement gummies in different pack counts.",
  ],
  [
    "hair-pro-growth-pack",
    "Hair care kits",
    ["Hair thinning"],
    "A bundle of Hair Growth Serum and hair supplement gummies whose highlights include Procapil.",
  ],
  [
    "intense-dandruff-kit",
    "Hair care kits",
    ["Dandruff"],
    "A bundle of ketoconazole shampoo and Anti-Dandruff Serum.",
  ],
  [
    "keratin-shampoo-with-roll-on",
    "Hair care kits",
    ["Hair thinning"],
    "A kit pairing Keratin Shampoo for Hair Fall with Advanced Hair Growth Serum Roll-On.",
  ],
  [
    "magnesium-gummies-and-lotion-kit",
    "Wellness kits",
    ["Sleep and relaxation", "Body massage and nourishment"],
    "A bundle of magnesium gummies and a magnesium body lotion.",
  ],
  [
    "sabodywash-scrub",
    "Body care kits",
    ["Body texture or bumps"],
    "A bundle of 1% Salicylic Acid Body Wash and 10% AHA Body Scrub.",
  ],
  [
    "strawberry-skin-kit",
    "Body care kits",
    ["Body texture or bumps"],
    "A bundle of 5% AHA BHA Exfoliating Body Wash and the glycolic acid body stick.",
  ],
  [
    "strawberry-skin-pack",
    "Body care kits",
    ["Body texture or bumps"],
    "A three-product bundle of salicylic acid body wash, AHA body scrub and lactic acid body lotion.",
  ],
  [
    "summer-essentials-kit",
    "Sun care kits",
    ["Sun protection", "Underarm odour", "Body acne"],
    "A three-product bundle of salicylic acid body wash, 4% AHA BHA underarm roll-on and Ultra Light Sunscreen.",
  ],
  [
    "sun-care-duo-head-to-toe",
    "Sun care kits",
    ["Sun protection"],
    "A bundle of Ultra Light Sunscreen SPF50+ and De-Tan SPF 50+ Body Sunscreen Lotion.",
  ],
  [
    "underarm-pigmentation-kit-no-fragrance",
    "Body care kits",
    ["Underarm uneven tone"],
    "A bundle of the No Fragrance-labelled 4% underarm roll-on and Pigmentation Repair Cream.",
  ],
  [
    "urea-skin-heel-repair-kit",
    "Body care kits",
    ["Dryness", "Rough heels"],
    "A bundle of 10% Urea Body Lotion and 20% Urea Foot Roll On.",
  ],
];
const overrides: Record<string, Partial<Review>> = {
  "6-aha-bha-underarm-roll-on-frag-free": {
    cautions: [
      "The published ingredient list includes Perfume despite the fragrance-free name; confirm the current label.",
    ],
    gaps: ["Product name and ingredient list disagree about fragrance."],
  },
  "underarm-pigmentation-kit-no-fragrance": {
    cautions: [
      "The No Fragrance-labelled roll-on has conflicting fragrance information on its individual listing; confirm the component label.",
    ],
  },
  "1-ketoconazole-dandruff-shampoo-150ml": {
    cautions: [
      "Keep away from eyes. Ask a pharmacist or clinician about medicated scalp care if symptoms persist.",
    ],
    usage:
      "Massage onto wet scalp, leave briefly, then rinse well. The page gives both 1–2 and 2–3 minute contact times; follow the current pack.",
    gaps: ["Usage contact time differs between page sections."],
  },
  "10-aha-body-scrub": {
    usage:
      "Gently massage a small amount over damp body skin, then rinse. The brand suggests once or twice weekly.",
    cautions: [
      "Avoid vigorous scrubbing and combining several exfoliating products. Use sun protection.",
    ],
    gaps: [
      "The page disagrees about whether to use the scrub before or after body wash.",
      "Official image filename refers to 12% AHA despite the 10% product name; image correspondence requires review.",
    ],
  },
  "12-aha-scrub": {
    gaps: [
      "The highlights list glycolic acid, but the published full ingredient list does not; confirm the current label.",
    ],
    cautions: [
      "Exfoliating acids and physical scrubbing can irritate skin. Use sun protection.",
    ],
  },
  "2-5-benzoyl-peroxide-bodywash": {
    cautions: [
      "Benzoyl peroxide may cause dryness and irritation and can bleach fabric. Keep away from eyes.",
    ],
  },
  "benzoyl-peroxide-facewash": {
    cautions: [
      "Benzoyl peroxide may cause dryness and irritation and can bleach fabric. Keep away from eyes.",
    ],
  },
  "brow-lash-serum": {
    cautions: [
      "For external application only; avoid getting serum into the eyes. Stop if discomfort occurs.",
    ],
  },
  "pigmentation-repair-cream": {
    ingredients: [
      "Lactic acid",
      "Urea",
      "Niacinamide",
      "Kojic acid dipalmitate",
      "Retinol",
    ],
    cautions: [
      "Contains retinol and exfoliating acids; avoid use during pregnancy and seek guidance if breastfeeding. Use sun protection.",
    ],
    gaps: [
      "The description names kojic acid while the full list specifies kojic acid dipalmitate; these are distinct ingredients.",
    ],
  },
  "lightest-mineral-sunscreen-spf50": {
    ingredients: [
      "Titanium dioxide",
      "Zinc oxide",
      "Niacinamide",
      "Pollufence",
    ],
    cautions: [
      "Apply and reapply as directed on the pack. Sunscreen does not eliminate all UV exposure.",
    ],
  },
  "body-sunscreen-spray-with-spf-50": {
    cautions: [
      "Follow label coverage and reapplication directions. Avoid inhaling the spray or spraying directly towards the face.",
    ],
  },
  "water-hardness-test-strip-sample": {
    ingredients: [],
    ingredientIds: [],
    usage: null,
    recommendationEligible: false,
    cautions: [
      "The page describes a different item. Obtain the actual test-strip directions from the store before use.",
    ],
    gaps: [
      "Usage instructions and ingredients refer to water softener, not the named test strip; they have not been imported.",
    ],
  },
  "face-razor-for-women": {
    ingredients: [],
    cautions: [
      "Handle the blade carefully. Follow the pack directions and stop if skin is irritated.",
    ],
    recommendationEligible: false,
  },
  "ice-roller": {
    ingredients: [],
    usage:
      "Fill the tool to about 80% with water and freeze for at least four hours. Follow the pack directions for brief, gentle applications.",
    cautions: [
      "Stop if cooling causes discomfort. Do not assume the tool treats redness or injuries.",
    ],
    recommendationEligible: false,
  },
  "scalp-massager": {
    ingredients: [],
    usage:
      "Massage gently in circular motions while shampooing, or when distributing conditioner or a hair mask.",
    cautions: [
      "Avoid forceful pressure or use on an irritated scalp. Hair growth is not guaranteed.",
    ],
    recommendationEligible: false,
  },
  "hair-health-gummies": {
    usage: "The brand directs adults to chew one gummy after a meal each day.",
  },
  "collagen-skin-gummies": {
    gaps: [
      "The brand describes a collagen-building botanical blend; collagen itself is not confirmed as an ingredient.",
    ],
  },
  "hair-growth-pack-30ml-xp": {
    gaps: [
      "The 30 ml product name conflicts with the 50 ml component quantity in additional information.",
    ],
  },
};
export const catalogueExpansion: Review[] = entries.map(
  ([slug, category, concerns, description]) => ({
    slug,
    category,
    concerns,
    description,
    ingredientIds: [],
    // Kits and supplements require guidance beyond the existing skin-only questionnaire.
    recommendationEligible:
      !category.endsWith("kits") &&
      category !== "Supplements" &&
      category !== "Care tools" &&
      category !== "Brow & lash care" &&
      category !== "Shampoo" &&
      category !== "Scalp serum",
    ...overrides[slug],
  }),
);
