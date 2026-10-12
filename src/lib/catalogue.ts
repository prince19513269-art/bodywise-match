import type { Answers, Product } from "./types";
import { inBudget } from "./matching";
import { getCareCategories } from "@/data/categories";
export function filterProducts(
  catalogue: readonly Product[],
  filters: {
    query: string;
    category: string;
    concern: string;
    budget?: Answers["budget"];
    care?: string;
  },
) {
  const query = filters.query.trim().toLowerCase();
  const care = getCareCategories(catalogue).find((c) => c.id === filters.care);
  return catalogue.filter(
    (p) =>
      (!care || care.includes(p)) &&
      (filters.category === "All categories" ||
        p.category === filters.category) &&
      (filters.concern === "All concerns" ||
        p.concerns.includes(filters.concern as Product["concerns"][number])) &&
      inBudget(p.price, filters.budget) &&
      `${p.name} ${p.description || ""} ${p.keyIngredients.join(" ")} ${p.category} ${p.concerns.join(" ")} ${(p.variants || []).map((v) => `${v.name} ${v.size || ""}`).join(" ")}`
        .toLowerCase()
        .includes(query),
  );
}
