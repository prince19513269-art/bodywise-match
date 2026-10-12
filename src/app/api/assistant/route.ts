import { NextResponse } from "next/server";
import { askGeminiAssistant, isGeminiConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    isConfigured: isGeminiConfigured(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history, context } = body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A message string is required." },
        { status: 400 },
      );
    }

    const result = await askGeminiAssistant({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      context: typeof context === "object" ? context : undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Assistant API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        reply:
          "An unexpected server error occurred while processing your request. Please try again.",
        isConfigured: isGeminiConfigured(),
        error: message,
      },
      { status: 500 },
    );
  }
}
