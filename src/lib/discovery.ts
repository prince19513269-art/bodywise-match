import type { Answers, Concern, DiscoveryCategory, Product } from "./types";
import { getCareCategories } from "@/data/categories";
export const discoveryLabels: Record<DiscoveryCategory, string> = {
  face: "Face & Skin Care",
  hair: "Hair & Scalp Care",
  body: "Body Care",
  underarm: "Underarm Care",
  wellness: "Health & Wellness",
  tools: "Care Tools",
  all: "Explore All Products",
};
export function getDiscoveryCategories(catalogue: readonly Product[]) {
  return (Object.keys(discoveryLabels) as DiscoveryCategory[]).filter((id) =>
    id === "all"
      ? catalogue.length > 0
      : getCareCategories(catalogue).some((c) => c.id === id),
  );
}
export function inDiscoveryCategory(
  product: Product,
  category: DiscoveryCategory,
) {
  return (
    category === "all" ||
    !!getCareCategories([product]).find((c) => c.id === category)
  );
}
export function discoveryPool(answers: Answers, catalogue: readonly Product[]) {
  const preferred = (answers.preferredCategories || []).filter(
    (c): c is DiscoveryCategory => c !== "Not sure" && c !== "all",
  );
  return catalogue.filter(
    (p) =>
      inDiscoveryCategory(p, answers.discoveryCategory || "all") &&
      (answers.discoveryCategory !== "all" ||
        !preferred.length ||
        preferred.some((c) => inDiscoveryCategory(p, c))),
  );
}
export function discoveryConcerns(
  answers: Answers,
  catalogue: readonly Product[],
): Concern[] {
  return [
    ...new Set(discoveryPool(answers, catalogue).flatMap((p) => p.concerns)),
  ];
}
export function selectDiscoveryCategory(
  previous: Answers,
  category: DiscoveryCategory,
): Answers {
  return previous.discoveryCategory === category
    ? previous
    : { discoveryCategory: category };
}
export function toggleDiscoveryOption<T extends string>(
  selected: readonly T[],
  value: T,
  unsure: T,
): T[] {
  if (value === unsure) return selected.includes(unsure) ? [] : [unsure];
  const known = selected.filter((v) => v !== unsure);
  return known.includes(value)
    ? known.filter((v) => v !== value)
    : [...known, value];
}
export function validDiscoveryStep(answers: Answers, step: number) {
  if (step === 0) return !!answers.discoveryCategory;
  if (step === 1)
    return (
      !!answers.selectedConcerns?.length &&
      (answers.discoveryCategory !== "all" ||
        !!answers.preferredCategories?.length)
    );
  if (step === 2)
    return (
      !!answers.familiarity &&
      (!["face", "body"].includes(answers.discoveryCategory || "") ||
        !!answers.skin) &&
      (answers.discoveryCategory !== "hair" || !!answers.scalp) &&
      (!needsIrritation(answers) || !!answers.sensitivity)
    );
  return true;
}
export function needsIrritation(answers: Answers) {
  if (answers.discoveryCategory !== "all")
    return ["face", "hair", "body", "underarm"].includes(
      answers.discoveryCategory || "",
    );
  return (
    !answers.preferredCategories?.length ||
    answers.preferredCategories.includes("Not sure") ||
    answers.preferredCategories.some((c) =>
      ["face", "hair", "body", "underarm"].includes(c),
    )
  );
}
export function concernLabel(concern: string) {
  return concern === "Hair thinning"
    ? "Hair fall or thinning"
    : concern === "Body texture or bumps"
      ? "Roughness or body bumps"
      : concern;
}
