// Future server-side adapter boundary. No SDK, secret, network call, or generated answer in Phase 1.
export type ExplanationRequest =
  | { kind: "ingredient"; ingredientId: string; detail: "simple" | "detailed" }
  | { kind: "comparison"; productIds: [string, string] }
  | { kind: "product-question"; productId: string; question: string };
export type ExplanationResponse = {
  text: string;
  sourceUrls: string[];
  limitations: string[];
};
export interface ExplanationProvider {
  explain(
    request: ExplanationRequest,
    signal?: AbortSignal,
  ): Promise<ExplanationResponse>;
}
export const aiAvailability = {
  enabled: false,
  reason:
    "AI explanations are planned for a future phase. The current experience uses reviewed content and transparent rules.",
} as const;
