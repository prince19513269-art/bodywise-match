import type { Product } from "./types";
// Keep full research notes in the data/audit; expose actionable transparency to shoppers.
export function thingsToKeepInMind(product: Product): string[] {
  const notes = (product.fieldGaps || []).flatMap((note) => {
    if (/image|photo/i.test(note)) return [];
    if (/Pack size conflicts/i.test(note))
      return [
        "The store page lists different pack sizes. Confirm the size before ordering.",
      ];
    if (/price not available/i.test(note))
      return ["Check the latest price at the official store."];
    if (/fragrance|perfume/i.test(note))
      return [
        "The product name and ingredient list differ about fragrance. Check the current label if fragrance is a concern.",
      ];
    if (/frequency differs/i.test(note))
      return [
        "Directions differ on the store page. Follow the instructions on your pack.",
      ];
    if (/usage|directions.*differ/i.test(note))
      return [
        "Directions on this page are incomplete or inconsistent. Confirm instructions on the current pack before use.",
      ];
    if (/30 ml\/50 ml|quantity|pack count|pack quantity/i.test(note))
      return [
        "Some pack quantities differ between store page sections. Confirm the contents and size before ordering.",
      ];
    if (/percent|concentration|2000 ppm|acid strengths/i.test(note))
      return [
        "Some ingredient strengths are unclear on the store page. Check the current ingredient label.",
      ];
    if (/38%|complete formulation|selected actives/i.test(note))
      return ["Check the full ingredient list on your pack before use."];
    if (/muscle relief|sleep/i.test(note))
      return [
        "Muscle-relief and sleep benefits are not established by this guide.",
      ];
    if (/collagen itself/i.test(note))
      return [
        "The gummy lists a plant-based blend. Collagen itself is not confirmed as an ingredient.",
      ];
    return [
      "Confirm the current product details and label at the official store.",
    ];
  });
  return [...new Set(notes)];
}
export function customerPrecautions(product: Product): string[] {
  return product.precautions.map((p) =>
    p
      .replace(/^General precaution: /, "")
      .replace(
        /Individual tolerance is not established by a listed ingredient\./,
        "Every skin is different.",
      )
      .replace(/Brand guidance /, "The store ")
      .replace(/not validated by this catalogue/, "not guaranteed")
      .replace(/^./, (c) => c.toUpperCase()),
  );
}
export function customerDescription(product: Product): string {
  return (product.description || "").replace(
    "Muscle-relief claims are not validated by this catalogue.",
    "Muscle-relief benefits are not established by this guide.",
  );
}
