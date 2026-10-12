"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useApp } from "./providers";

type SourceLink = {
  label: string;
  url: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  isError?: boolean;
  sourceLinks?: SourceLink[];
};

function renderInlineMarkdown(text: string): React.ReactNode {
  // Regex matches:
  // 1. Markdown link: [label](url)
  // 2. Bold italic: ***text***
  // 3. Bold: **text** or __text__
  // 4. Code: `code`
  const tokenRegex =
    /(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|__[^_]+?__|`[^`]+?`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="assistant-inline-link"
        >
          {linkMatch[1]}
        </a>
      );
    }
    if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
      return (
        <strong key={i}>
          <em className="assistant-italic">{part.slice(3, -3)}</em>
        </strong>
      );
    }
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={i} className="assistant-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Parse italic words wrapped with single asterisks (*word*) and clean stray symbols
    const italicRegex = /(?:^|\s)\*([^*]+)\*(?=\s|[.,;:!?]|$)/g;
    const subParts = part.split(italicRegex);

    if (subParts.length > 1) {
      return (
        <span key={i}>
          {subParts.map((sub, j) => {
            if (j % 2 === 1) {
              return (
                <em key={j} className="assistant-italic">
                  {sub}
                </em>
              );
            }
            return sub.replace(/\*{1,3}/g, "").replace(/^#{1,6}\s*/g, "");
          })}
        </span>
      );
    }

    // Clean any stray formatting symbols (*, **, ###) that were not closed or matched
    return part.replace(/\*{1,3}/g, "").replace(/^#{1,6}\s*/g, "");
  });
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="assistant-bubble-text">
      {lines.map((rawLine, idx) => {
        const trimmed = rawLine.trim();

        if (!trimmed) {
          return <div key={idx} className="assistant-line-break" />;
        }

        // Horizontal dividers: --- or *** or ___
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={idx} className="assistant-divider" />;
        }

        // Markdown headings: ###, ##, #
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = Math.min(Math.max(headingMatch[1].length, 1), 6);
          return (
            <div
              key={idx}
              className={`assistant-heading assistant-heading-${level}`}
            >
              {renderInlineMarkdown(headingMatch[2])}
            </div>
          );
        }

        // Bullet list items: *, -, •
        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="assistant-bullet-item">
              <span className="assistant-bullet-dot" aria-hidden="true">
                •
              </span>
              <div className="assistant-bullet-content">
                {renderInlineMarkdown(bulletMatch[1])}
              </div>
            </div>
          );
        }

        // Numbered list items: 1., 2., etc.
        const numberedMatch = trimmed.match(/^(\d+)[\.)]\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="assistant-numbered-item">
              <span className="assistant-numbered-badge" aria-hidden="true">
                {numberedMatch[1]}.
              </span>
              <div className="assistant-numbered-content">
                {renderInlineMarkdown(numberedMatch[2])}
              </div>
            </div>
          );
        }

        // Normal text line
        return (
          <div key={idx} className="assistant-content-line">
            {renderInlineMarkdown(rawLine)}
          </div>
        );
      })}
    </div>
  );
}

const DEFAULT_SUGGESTIONS = [
  "What does niacinamide do?",
  "How do the salicylic and ceramide body washes differ?",
  "What ingredients help with skin texture or bumps?",
  "Why was a product suggested in Find My Match?",
];

export function AssistantModal() {
  const {
    assistantOpen,
    closeAssistant,
    assistantContext,
    openAssistant,
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check initial configuration status on load
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/assistant");
        if (res.ok) {
          const data = await res.json();
          setIsConfigured(data.isConfigured);
        }
      } catch {
        // If fetch fails, keep null
      }
    }
    checkStatus();
  }, []);

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || input).trim();
      if (!text || loading) return;

      const userMessage: Message = {
        id: "u-" + Date.now(),
        role: "user",
        content: text,
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!textToSend) setInput("");
      setLoading(true);
      setLastFailedMessage(null);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history,
            context: {
              productId: assistantContext?.productId,
            },
          }),
        });

        const data = await res.json();
        setIsConfigured(data.isConfigured);

        if (!res.ok && !data.reply) {
          throw new Error(data.error || "Failed to contact assistant");
        }

        const assistantMessage: Message = {
          id: "a-" + Date.now(),
          role: "assistant",
          content:
            data.reply || "I couldn't generate a response. Please try again.",
          modelUsed: data.modelUsed,
          isError: Boolean(data.error && !data.isConfigured),
          sourceLinks: Array.isArray(data.sourceLinks) ? data.sourceLinks : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: unknown) {
        console.error("Assistant chat error:", err);
        setLastFailedMessage(text);
        setMessages((prev) => [
          ...prev,
          {
            id: "err-" + Date.now(),
            role: "assistant",
            content:
              "Could not reach the Gemini assistant. Please check your internet connection or verify `.env.local` settings.",
            isError: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, assistantContext],
  );

  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  // When opened with an initial question, auto-send or set it
  useEffect(() => {
    if (assistantOpen) {
      if (assistantContext?.initialQuestion) {
        handleSendRef.current(assistantContext.initialQuestion);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [assistantOpen, assistantContext]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && assistantOpen) {
        closeAssistant();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [assistantOpen, closeAssistant]);
  if (!assistantOpen) return null;

  const productSuggestions = assistantContext?.productName
    ? [
        `What should I know about this product's ingredients?`,
        `How do I use ${assistantContext.productName} in my routine?`,
        `Why was this product suggested?`,
        `Are there any cautions or skin types that should avoid this?`,
      ]
    : DEFAULT_SUGGESTIONS;

  function handleReset() {
    setMessages([]);
    setLastFailedMessage(null);
  }

  return (
    <div
      className="assistant-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Ask Bodywise Match AI Assistant"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAssistant();
      }}
    >
      <div className="assistant-modal">
        {/* Header */}
        <div className="assistant-header">
          <div className="assistant-header-title">
            <span className="assistant-icon-badge">
              <Sparkles size={17} />
            </span>
            <div>
              <h3>Ask Bodywise Match</h3>
              <p>Gemini AI Skincare & Catalogue Advisor</p>
            </div>
          </div>
          <div className="assistant-header-actions">
            {messages.length > 0 && (
              <button
                className="assistant-btn-ghost"
                onClick={handleReset}
                title="Start a new conversation"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
            <button
              className="assistant-btn-close"
              onClick={closeAssistant}
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Product Context Banner */}
        {assistantContext?.productName && (
          <div className="assistant-context-banner">
            <div>
              <span className="assistant-context-label">FOCUSED PRODUCT</span>
              <strong>{assistantContext.productName}</strong>
            </div>
            <button
              className="assistant-context-clear"
              onClick={() => openAssistant({})}
              title="Clear focused product"
            >
              Clear context
            </button>
          </div>
        )}

        {/* Notice banner if GEMINI_API_KEY is not configured */}
        {isConfigured === false && (
          <div className="assistant-setup-notice">
            <AlertCircle size={16} />
            <div>
              <strong>Setup Required:</strong> Add <code>GEMINI_API_KEY</code> to{" "}
              <code>.env.local</code> to activate live Gemini AI answers.
            </div>
          </div>
        )}

        {/* Message List */}
        <div className="assistant-messages">
          {messages.length === 0 ? (
            <div className="assistant-welcome">
              <div className="assistant-welcome-icon">
                <Sparkles size={28} />
              </div>
              <h4>Hello! How can I help you choose?</h4>
              <p>
                I can explain ingredients, compare Be Bodywise formulas,
                suggest routines, or clarify why a product matches your skin.
              </p>

              <div className="assistant-suggestions-label">
                <HelpCircle size={13} />
                <span>Suggested questions:</span>
              </div>
              <div className="assistant-suggestions-grid">
                {productSuggestions.map((prompt) => (
                  <button
                    key={prompt}
                    className="assistant-suggestion-pill"
                    onClick={() => handleSend(prompt)}
                  >
                    <span>{prompt}</span>
                    <ChevronRight size={13} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`assistant-message-row ${
                    m.role === "user" ? "user-row" : "assistant-row"
                  }`}
                >
                  <div
                    className={`assistant-bubble ${
                      m.role === "user"
                        ? "user-bubble"
                        : m.isError
                          ? "error-bubble"
                          : "assistant-bubble-styled"
                    }`}
                  >
                    <FormattedMessage content={m.content} />
                    {m.sourceLinks && m.sourceLinks.length > 0 && (
                      <div className="assistant-verified-links">
                        <div className="assistant-verified-links-header">
                          <ShieldCheck size={13} />
                          <span>Verified Catalogue Links ({m.sourceLinks.length})</span>
                        </div>
                        <div className="assistant-verified-links-grid">
                          {m.sourceLinks.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="assistant-verified-link-pill"
                            >
                              <span>{link.label}</span>
                              <ExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="assistant-message-row assistant-row">
                  <div className="assistant-bubble assistant-bubble-styled assistant-thinking">
                    <span className="dot-pulse" />
                    <span className="dot-pulse" />
                    <span className="dot-pulse" />
                    <span className="thinking-text">Consulting Gemini & Catalogue...</span>
                  </div>
                </div>
              )}

              {lastFailedMessage && !loading && (
                <div className="assistant-retry-row">
                  <button
                    className="button button-secondary"
                    style={{ minHeight: "36px", padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => handleSend(lastFailedMessage)}
                  >
                    <RotateCcw size={13} /> Retry last question
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <form
          className="assistant-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="assistant-input-field"
            placeholder={
              assistantContext?.productName
                ? `Ask about ${assistantContext.productName}...`
                : "Ask about ingredients, products, or routines..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="assistant-send-btn"
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>

        {/* Ethical / Medical Boundary Footer */}
        <div className="assistant-disclaimer">
          <ShieldCheck size={12} />
          <span>
            Educational information from Be Bodywise catalogue & dermatological
            guides. Not medical advice.
          </span>
        </div>
      </div>
    </div>
  );
}

export function AssistantLauncherButton() {
  const { openAssistant, assistantOpen } = useApp();
  if (assistantOpen) return null;

  return (
    <button
      className="assistant-floating-launcher"
      onClick={() => openAssistant()}
      aria-label="Open Ask Bodywise Match AI Assistant"
      title="Ask Bodywise Match AI Assistant"
    >
      <Sparkles size={17} />
      <span>Ask AI</span>
    </button>
  );
}

export function AskProductAssistantButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const { openAssistant } = useApp();
  return (
    <button
      type="button"
      className="button button-secondary detail-assistant-btn"
      onClick={() =>
        openAssistant({
          productId,
          productName,
        })
      }
    >
      <Sparkles size={16} />
      <span>Ask AI about this product</span>
    </button>
  );
}

export function ProductAssistantCallout({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const { openAssistant } = useApp();

  const quickQuestions = [
    "What should I know about this product's ingredients?",
    "Why was this product suggested?",
    "How does this fit into a daily routine?",
  ];

  return (
    <div className="product-ai-callout">
      <div className="product-ai-callout-header">
        <span className="product-ai-badge">
          <Sparkles size={14} /> Ask Bodywise Match
        </span>
        <h4>Have questions about this formula?</h4>
        <p>
          Ask our Gemini-powered assistant for ingredient breakdowns, usage advice,
          and transparent considerations.
        </p>
      </div>
      <div className="product-ai-quick-links">
        {quickQuestions.map((q) => (
          <button
            key={q}
            type="button"
            className="product-ai-chip"
            onClick={() =>
              openAssistant({
                productId,
                productName,
                initialQuestion: q,
              })
            }
          >
            <span>{q}</span>
            <ChevronRight size={13} />
          </button>
        ))}
      </div>
    </div>
  );
}

