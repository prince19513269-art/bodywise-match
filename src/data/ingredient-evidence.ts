// Match whole ingredient names in the product's own highlights/full list, never marketing claims.
// Branded blends are kept separate from their components. Derivatives require explicit aliases.
const aliases: Record<string, RegExp> = {
  "salicylic-acid": /\bsalicylic acid\b/i,
  niacinamide: /\bniacinamide\b/i,
  "hyaluronic-acid": /\bhyaluronic acid\b|\bsodium hyaluronate\b/i,
  "glycolic-acid": /\bglycolic acid\b/i,
  "lactic-acid": /\blactic acid\b/i,
  urea: /(?:^|[,;])\s*(?:\d+%\s*)?urea\b/i,
  ceramides: /\bceramide (?:complex|np|ap|eop)\b/i,
  glycerin: /\bglycer(?:in|ine)\b/i,
  panthenol: /\b(?:d-)?panth(?:en|an)ol\b/i,
  allantoin: /\ballantoin\b/i,
  "aloe-vera": /\baloe (?:vera|barbadensis)\b/i,
  "centella-asiatica":
    /\bcentella(?: asiatica)?(?: extract)?\b|\bcica extract\b/i,
  "shea-butter": /\bshea(?:\)? butter)?\b|\bbutyrospermum parkii\b/i,
  "argan-oil": /\bargan oil\b|\bargania spinosa\b/i,
  "olive-oil": /\bolive oil\b|\bolea europaea\b/i,
  keratin: /\b(?:hydrolyzed |hydrolysed )?keratin\b/i,
  biotin: /\bbiotin\b/i,
  "zinc-pyrithione": /\bzinc pyrithione\b|\bzpto\b/i,
  rosemary: /\brosemary\b|\brosmarinus officinalis\b/i,
  "copper-peptides": /\bcopper tripeptide-1\b/i,
  "mandelic-acid": /\bmandelic acid\b/i,
  "kojic-acid": /\bkojic acid\b(?!\s+dipalmitate)/i,
  "kojic-acid-dipalmitate": /\bkojic acid dipalmitate\b/i,
  retinol: /(?:^|[,;])\s*(?:\d+(?:\.\d+)?%\s*)?retinol(?=\s*(?:[,;]|$))/i,
  "benzoyl-peroxide": /\bbenzoyl peroxide\b/i,
  ketoconazole: /\bketoconazole\b/i,
  magnesium: /\bmagnesium\b/i,
  calcium: /\bcalcium\b(?!\s+gluconate)/i,
  "vitamin-d3": /\bvitamin d3\b|\bcholecalciferol\b/i,
  zinc: /\bzinc citrate\b|\bzinc & multivitamins\b|(?:^|[,;])\s*zinc(?=\s*[,;]|$)/i,
  "vitamin-c": /\bvitamin c\b|\b(?:l-)?ascorbic acid\b/i,
  "vitamin-e": /\bvitamin e\b|\btocopheryl acetate\b|\btocopherol\b/i,
  "chicory-inulin": /\bchicory(?: root)?(?: inulin| extract)?\b/i,
  glutathione: /\bglutathione\b/i,
  redensyl: /\bredensyl\b/i,
  anagain: /\banagain\b/i,
  aminexil: /\baminexil\b|\bdiaminopyrimidine oxide\b/i,
  "titanium-dioxide": /\btitanium dioxide\b/i,
  "zinc-oxide": /\bzinc oxide\b/i,
  "alpha-arbutin": /\balpha arbutin\b/i,
  chamomile: /\bchamomile\b/i,
  "oat-extract": /\boat (?:extract|kernel extract)\b|\bavena sativa\b/i,
};
export function verifiedIngredientIds(
  highlights: readonly string[],
  ingredientList: string | null,
): string[] {
  return [
    ...new Set(
      [...highlights, ingredientList || ""].flatMap((evidence) =>
        Object.entries(aliases)
          .filter(([, pattern]) => pattern.test(evidence))
          .map(([id]) => id),
      ),
    ),
  ];
}
