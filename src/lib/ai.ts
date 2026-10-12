import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import {
  retrieveRelevantCatalogue,
  formatRetrievedContextForPrompt,
  type RetrievedCatalogue,
} from "./catalogue-retrieval";

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

export function getApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY !== undefined) {
    const trimmed = process.env.GEMINI_API_KEY.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  // Fallback to reading .env.local directly if process environment was not populated
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^GEMINI_API_KEY=(.*)$/m);
      if (match && match[1].trim()) {
        let key = match[1].trim();
        if (
          (key.startsWith('"') && key.endsWith('"')) ||
          (key.startsWith("'") && key.endsWith("'"))
        ) {
          key = key.slice(1, -1).trim();
        }
        if (key) {
          return key;
        }
      }
    }
  } catch {
    // Ignore file read fallback errors
  }

  return undefined;
}

export const aiAvailability = {
  get enabled(): boolean {
    return Boolean(getApiKey());
  },
  get reason(): string {
    return getApiKey()
      ? "Gemini AI is connected and ready."
      : "GEMINI_API_KEY is not configured in .env.local.";
  },
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AssistantContext = {
  productId?: string;
  productIds?: [string, string];
  ingredientId?: string;
  quizSummary?: string;
};

export type AssistantOptions = {
  message: string;
  history?: { role: string; content: string }[];
  context?: AssistantContext;
};

export type AssistantResult = {
  reply: string;
  isConfigured: boolean;
  modelUsed?: string;
  error?: string;
  sourceLinks?: { label: string; url: string }[];
};

export function isGeminiConfigured(): boolean {
  return Boolean(getApiKey());
}

export function buildPromptWithRetrieval(
  query: string,
  context?: AssistantContext,
): { systemInstruction: string; retrieval: RetrievedCatalogue } {
  const retrieval = retrieveRelevantCatalogue(query, {
    productId: context?.productId,
    productIds: context?.productIds,
    ingredientId: context?.ingredientId,
  });

  const structuredContext = formatRetrievedContextForPrompt(retrieval);

  const systemInstruction = `You are "Ask Bodywise Match", an intelligent, empathetic, and strictly honest personal care & ingredient advisor for the independent Bodywise Match app.

PRIMARY DIRECTIVE:
You are grounded EXCLUSIVELY in the verified Be Bodywise product catalogue and ingredient library provided below. You must NEVER invent, assume, or extrapolate product facts, ingredients, concentrations, or URLs.

1. OFFICIAL PRODUCT URLS (MANDATORY):
- Whenever you recommend or list a Be Bodywise product from the catalogue, you MUST provide its exact official product link from the verified records below.
- Format each link in markdown: [Product Name](URL) or "Official link: [View on Be Bodywise](URL)".
- You MUST NOT state "I cannot provide official links" or "Links are unavailable". Use the exact URL stored in the verified record.
- NEVER invent, modify, or fabricate an official link.

2. INGREDIENT & CONCENTRATION FIDELITY:
- State ONLY the key ingredients and concentrations explicitly provided in the "Verified Key Ingredients" field of each record.
- If a specific concentration percentage is listed (e.g. "1% Salicylic Acid" or "2.5% Benzoyl Peroxide"), state that exact percentage.
- If no percentage is listed (e.g. "Salicylic Acid"), DO NOT invent or guess one.
- DO NOT claim ingredients are present if they are not in the verified record.

3. DEDUPLICATION OF PACK SIZES:
- Each numbered record ([PRODUCT 1], [PRODUCT 2], ...) represents a UNIQUE product.
- Size options (e.g. 100 mL, 250 mL, 700 mL) are pack variants of the SAME product. You must NEVER count two different sizes of the same product as two separate recommendations.

4. HONEST PRODUCT COUNTING:
- If the user asks for N products (e.g. "List five products...") and the verified catalogue contains fewer than N products for that concern, state honestly:
  "The catalogue currently contains [M] verified products for [concern] rather than [N]."
- List ONLY the eligible verified products that exist. NEVER fabricate products to meet a requested number.

5. SEPARATION OF VERIFIED FACTS VS EDUCATIONAL EXPLANATIONS:
- Clearly distinguish between:
  a) Verified Brand Facts: Product name, category, price, size, verified ingredients, and brand-stated positioning.
  b) Educational Know-How: Scientific background on how ingredients generally work (e.g., how BHAs exfoliate inside pores), with honest disclaimers that individual skin tolerance and results vary.

6. SAFETY & MEDICAL BOUNDARIES:
- NO MEDICAL DIAGNOSES: Never diagnose medical conditions (severe cystic acne, fungal infections, dermatitis, alopecia).
- NO TREATMENT GUARANTEES: Never promise a cure or 100% elimination of concerns.
- PATCH TESTING & SUN PROTECTION: Always recommend patch testing for new active formulations and daily sunscreen with exfoliating acids (AHA/BHA).
- Gently advise seeing a certified dermatologist for painful, persistent, or severe conditions.

7. RESPONSE STYLE & PRESENTATION (CONCISE, FRIENDLY & BEGINNER-FRIENDLY):
- TONE: Warm, conversational, friendly, and beginner-friendly — like chatting with a helpful skincare advisor friend, NOT writing a dense research report or textbook.
- LENGTH & BREVITY: For ordinary questions, aim for approximately 80–150 words or fewer. Keep explanations clear, snappy, and easy to understand.
- NO FLUFF: Skip repetitive greetings (e.g. "Hello! As your Bodywise advisor...", "Certainly!"), boilerplate introductions, and unnecessary closing sign-offs. Jump straight into the helpful advice.
- COMPACT PRODUCT RECOMMENDATION FORMAT: When listing or recommending products, use this compact format for each item:
  • **Product Name**: [Official Link](URL)
  • **Key Ingredients**: 1–2 important verified ingredients from the record
  • **Why it helps**: One short sentence explaining how it targets the concern
- RELEVANT PRECAUTIONS ONLY: Mention safety or patch testing only when directly relevant to the actives involved, in just one or two concise sentences. Do not attach repetitive long disclaimers.
- MULTI-PRODUCT & COMPARISON QUERIES: If the user explicitly asks for multiple items (e.g. "List five products...") or a comparison, provide each requested item using the compact format above without excessive text.
- NO RAW HEADINGS: Avoid markdown heading symbols like ### or ##; use clean bold text and bullet points instead.

==================================================
VERIFIED CATALOGUE DATA FOR THIS QUERY:
==================================================
${structuredContext}
`.trim();

  return { systemInstruction, retrieval };
}

export function buildSystemPrompt(
  queryOrContext?: string | AssistantContext,
  maybeContext?: AssistantContext,
): string {
  let query = "";
  let context: AssistantContext | undefined;

  if (typeof queryOrContext === "string") {
    query = queryOrContext;
    context = maybeContext;
  } else if (typeof queryOrContext === "object" && queryOrContext !== null) {
    context = queryOrContext;
  }

  const { systemInstruction } = buildPromptWithRetrieval(query, context);
  return systemInstruction;
}

// Current supported models in order of capability & availability
export const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
];

export async function askGeminiAssistant(
  options: AssistantOptions,
): Promise<AssistantResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      isConfigured: false,
      reply: `**Ask Bodywise Match is ready!**

To enable live Gemini AI responses on your computer:
1. Open or create the file \`.env.local\` in the project root directory.
2. Add your Gemini API key from Google AI Studio:
\`\`\`
GEMINI_API_KEY=your_actual_api_key_here
\`\`\`
3. Refresh the page or ask your question again.

*Your API key remains strictly on your local machine and will never be exposed to the browser or GitHub.*`,
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const { systemInstruction, retrieval } = buildPromptWithRetrieval(
    options.message,
    options.context,
  );

  // Collect verified sourceLinks from the matched products
  const sourceLinks = retrieval.matchedProducts
    .filter((p) => Boolean(p.source?.url))
    .map((p) => ({
      label: p.name,
      url: p.source!.url,
    }));

  // Format message history
  const contents: { role: string; parts: { text: string }[] }[] = [];

  if (options.history && options.history.length > 0) {
    for (const h of options.history) {
      const role = h.role === "assistant" || h.role === "model" ? "model" : "user";
      contents.push({
        role,
        parts: [{ text: h.content }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: options.message }],
  });

  let lastError: Error | unknown = null;
  let sawAuthError = false;
  let sawQuotaError = false;
  let sawHighDemandError = false;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
        contents,
      });

      const replyText = response.text?.trim();
      if (replyText) {
        return {
          reply: replyText,
          isConfigured: true,
          modelUsed: modelName,
          sourceLinks: sourceLinks.length > 0 ? sourceLinks.slice(0, 6) : undefined,
        };
      }
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);

      // Check for authentication / permission issues
      if (
        message.includes("API_KEY_INVALID") ||
        message.includes("API key not valid") ||
        message.includes("PERMISSION_DENIED") ||
        message.includes("401") ||
        message.includes("403")
      ) {
        sawAuthError = true;
        break;
      }

      // Check for quota or rate limits
      if (
        message.includes("RESOURCE_EXHAUSTED") ||
        message.includes("429") ||
        message.includes("quota")
      ) {
        sawQuotaError = true;
        continue;
      }

      // Check for high traffic / demand (503 UNAVAILABLE)
      if (
        message.includes("503") ||
        message.includes("UNAVAILABLE") ||
        message.includes("high demand")
      ) {
        sawHighDemandError = true;
        continue;
      }

      // If model not found (404) or retired, try next candidate
      if (
        message.includes("404") ||
        message.includes("NOT_FOUND") ||
        message.includes("not found") ||
        message.includes("no longer available")
      ) {
        continue;
      }
    }
  }

  const rawErrorMessage =
    lastError instanceof Error ? lastError.message : String(lastError);

  // Redact any accidental presence of the API key from internal error messages
  const safeError =
    apiKey && apiKey.length > 5
      ? rawErrorMessage.split(apiKey).join("[REDACTED_KEY]")
      : rawErrorMessage;

  if (sawAuthError) {
    return {
      reply:
        "The configured `GEMINI_API_KEY` was not recognized or is unauthorized. Please verify that your API key is correctly copied into `.env.local` from Google AI Studio (https://aistudio.google.com/).",
      isConfigured: false,
      error: safeError,
    };
  }

  if (sawQuotaError) {
    return {
      reply:
        "Gemini AI free tier rate limit was reached. Please wait 30–60 seconds before sending your next question.",
      isConfigured: true,
      error: safeError,
    };
  }

  if (sawHighDemandError) {
    return {
      reply:
        "Google's Gemini AI service is currently experiencing temporary high traffic. Please wait a moment and tap **Retry last question**.",
      isConfigured: true,
      error: safeError,
    };
  }

  if (
    safeError.includes("ENOTFOUND") ||
    safeError.includes("ECONNREFUSED") ||
    safeError.includes("fetch failed")
  ) {
    return {
      reply:
        "Unable to establish a connection to Google's AI servers. Please check your internet connection.",
      isConfigured: true,
      error: safeError,
    };
  }

  return {
    reply:
      "Sorry, I had trouble receiving a response from Gemini AI. Please check your internet connection or verify your API key in `.env.local`.",
    isConfigured: true,
    error: safeError,
  };
}
