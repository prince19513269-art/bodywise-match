"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  LockKeyhole,
  BookOpen,
  Pencil,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { ButtonLink, Eyebrow, Notice, EmptyState } from "@/components/ui";
import { CompareTray, ProductCard } from "@/components/product-card";
import {
  skinTypes,
  sensitivities,
  familiarityLevels,
  budgets,
  type Answers,
  type DiscoveryCategory,
  type Concern,
} from "@/lib/types";
import { products } from "@/data/products";
import { matchProducts } from "@/lib/matching";
import { customerPrecautions, thingsToKeepInMind } from "@/lib/product-copy";
import { ingredients } from "@/data/ingredients";
import {
  concernLabel,
  discoveryLabels,
  discoveryPool,
  discoveryConcerns,
  getDiscoveryCategories,
  selectDiscoveryCategory,
  toggleDiscoveryOption,
  validDiscoveryStep,
  needsIrritation,
} from "@/lib/discovery";
function Choices({
  label,
  options,
  value,
  onChange,
  values = [],
  multiple = false,
  getLabel = (option) => option,
}: {
  label: string;
  options: readonly string[];
  value?: string;
  onChange: (value: string) => void;
  values?: readonly string[];
  multiple?: boolean;
  getLabel?: (value: string) => string;
}) {
  return (
    <fieldset className="choices">
      <legend>{label}</legend>
      {options.map((option) => {
        const checked = multiple ? values.includes(option) : value === option;
        return (
          <label className={`choice ${checked ? "chosen" : ""}`} key={option}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={label}
              value={option}
              checked={checked}
              onChange={() => onChange(option)}
            />
            <span>{getLabel(option)}</span>
            <span className="radio-indicator">
              {checked && <Check size={13} />}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
export default function Discover() {
  const { answers, setAnswers, step, setStep } = useApp();
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const category = answers.discoveryCategory;
  const skinPath = category === "face" || category === "body";
  const topicalPath = needsIrritation(answers);
  const categoryOptions = getDiscoveryCategories(products);
  const concernOptions = discoveryConcerns(answers, products);
  const productTypes = [
    ...new Set(discoveryPool(answers, products).map((p) => p.category)),
  ];
  const steps = [
    "Your category",
    category === "all" ? "Your interests" : "Your concerns",
    category === "hair"
      ? "Scalp & preferences"
      : skinPath
        ? "Skin & preferences"
        : "Your preferences",
    "Your budget",
    "Your discovery",
  ];
  const education = ingredients.find(
    (i) =>
      i.id ===
      (category === "hair"
        ? "rosemary"
        : category === "body"
          ? "urea"
          : category === "underarm"
            ? "lactic-acid"
            : category === "wellness"
              ? "biotin"
              : "niacinamide"),
  )!;
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const update = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError("");
  };
  function next() {
    if (!validDiscoveryStep(answers, step)) {
      setError(
        "Please answer the required questions, or choose Not sure, to continue.",
      );
      return;
    }
    setError("");
    setStep(step + 1);
  }
  function reset() {
    setAnswers({});
    setStep(0);
    setError("");
  }
  const matches = matchProducts(answers, products);
  const titles = [
    "What would you like to explore today?",
    category === "all"
      ? "What would you like to focus on?"
      : category === "hair"
        ? "What would you like help with for your hair or scalp?"
        : category === "underarm"
          ? "What matters to you for underarm care?"
          : "Which concerns would you like to explore?",
    category === "hair"
      ? "Tell us about your scalp and preferences."
      : skinPath
        ? "Tell us about your skin and preferences."
        : "What are your product preferences?",
    "What is your approximate budget?",
    "Your starting point, made clearer.",
  ];
  return (
    <div className="container discovery-layout">
      <aside className="discovery-sidebar">
        <Eyebrow>FIND MY MATCH</Eyebrow>
        <h2>
          A little clarity.
          <br />
          Built around you.
        </h2>
        <p>
          There’s no perfect answer.
          <br />
          Just start with what you know.
        </p>
        <ol>
          {steps.map((label, i) => (
            <li
              key={label}
              className={i === step ? "current" : i < step ? "complete" : ""}
              aria-current={i === step ? "step" : undefined}
            >
              <span>{i < step ? <Check size={15} /> : `0${i + 1}`}</span>
              {label}
            </li>
          ))}
        </ol>
        <div className="privacy-note">
          <LockKeyhole size={18} />
          <p>
            No account. No photos.
            <br />
            Answers stay in this tab’s memory and clear on refresh.
          </p>
        </div>
      </aside>
      <section className="question-panel">
        <div className="question-top">
          <span>STEP {step + 1} OF 5</span>
          <button className="text-button" onClick={reset}>
            <RotateCcw size={14} /> Start over
          </button>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Discovery progress"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={step + 1}
        >
          <span style={{ width: `${(step + 1) * 20}%` }} />
        </div>
        <div className="question-content" key={step}>
          <h1 ref={heading} tabIndex={-1}>
            {titles[step]}
          </h1>
          <p className="question-subtitle">
            {
              [
                "Choose a category to begin. You can explore broadly too.",
                "Choose one or more priorities, or Not sure. These are catalogue topics, not diagnoses.",
                "Share what you know. Product preferences are optional; no answer guarantees suitability.",
                "Optional. This helps narrow options using recorded prices.",
                "These are options to research, with the reasoning and limitations in view.",
              ][step]
            }
          </p>
          {step === 0 && (
            <Choices
              label="Explore a category"
              options={categoryOptions}
              getLabel={(value) => discoveryLabels[value as DiscoveryCategory]}
              value={category}
              onChange={(value) => {
                setAnswers((prev) =>
                  selectDiscoveryCategory(prev, value as DiscoveryCategory),
                );
                setError("");
              }}
            />
          )}
          {step === 1 && (
            <>
              {category === "all" && (
                <Choices
                  label="Preferred categories"
                  options={[
                    ...categoryOptions.filter((c) => c !== "all"),
                    "Not sure",
                  ]}
                  getLabel={(value) =>
                    value === "Not sure"
                      ? value
                      : discoveryLabels[value as DiscoveryCategory]
                  }
                  multiple
                  values={answers.preferredCategories}
                  onChange={(value) => {
                    setAnswers((prev) => ({
                      ...prev,
                      preferredCategories: toggleDiscoveryOption(
                        prev.preferredCategories || [],
                        value as DiscoveryCategory | "Not sure",
                        "Not sure",
                      ),
                      selectedConcerns: undefined,
                      productType: undefined,
                      skin: undefined,
                      scalp: undefined,
                      sensitivity: undefined,
                      fragrancePreference: undefined,
                    }));
                    setError("");
                  }}
                />
              )}
              <Choices
                label={
                  category === "all" ? "Your goals" : "Concerns to explore"
                }
                options={[...concernOptions, "Not sure"]}
                getLabel={concernLabel}
                multiple
                values={answers.selectedConcerns}
                onChange={(value) => {
                  setAnswers((prev) => ({
                    ...prev,
                    selectedConcerns: toggleDiscoveryOption(
                      prev.selectedConcerns || [],
                      value as Concern | "Not sure",
                      "Not sure",
                    ),
                  }));
                  setError("");
                }}
              />
            </>
          )}
          {step === 2 && (
            <>
              {skinPath && (
                <Choices
                  label="General skin characteristics"
                  options={skinTypes}
                  value={answers.skin}
                  onChange={(value) => update("skin", value)}
                />
              )}
              {category === "hair" && (
                <Choices
                  label="How does your scalp usually feel?"
                  options={["Often oily", "Often dry", "Not sure"]}
                  value={answers.scalp}
                  onChange={(value) => update("scalp", value)}
                />
              )}
              {topicalPath && (
                <Choices
                  label={
                    category === "hair"
                      ? "Do hair or scalp products often cause irritation or discomfort?"
                      : "Do products often cause irritation or discomfort?"
                  }
                  options={sensitivities}
                  value={answers.sensitivity}
                  onChange={(value) => update("sensitivity", value)}
                />
              )}
              {productTypes.length > 1 && (
                <Choices
                  label="Preferred product type (optional)"
                  options={["Any product type", ...productTypes, "Not sure"]}
                  value={answers.productType || "Any product type"}
                  onChange={(value) => update("productType", value)}
                />
              )}
              {category === "underarm" && (
                <>
                  <Choices
                    label="Fragrance preference (optional)"
                    options={["No preference", "Avoid fragrance", "Not sure"]}
                    value={answers.fragrancePreference || "No preference"}
                    onChange={(value) => update("fragrancePreference", value)}
                  />
                  <p className="small-muted">
                    If you avoid fragrance, we only show products with no
                    fragrance listed in the reviewed full ingredient list. A
                    fragrance-free name alone is not enough.
                  </p>
                </>
              )}
              <Choices
                label="Ingredient familiarity"
                options={familiarityLevels}
                value={answers.familiarity}
                onChange={(value) => update("familiarity", value)}
              />
              <div className="education-preview">
                <BookOpen size={22} />
                <div>
                  <Eyebrow>A SMALL DOSE OF KNOW-HOW</Eyebrow>
                  <h3>
                    {category === "tools"
                      ? "The directions matter."
                      : `${education.name}, simply put.`}
                  </h3>
                  <p>
                    {category === "tools"
                      ? "Check the directions for the exact item. A care tool is not a treatment or a guarantee of results."
                      : `${education.summary} ${education.precautions}`}
                  </p>
                  <Link
                    className="text-link"
                    href={
                      category === "tools"
                        ? "/products"
                        : `/ingredients/${education.id}`
                    }
                  >
                    {category === "tools"
                      ? "Explore the catalogue"
                      : "Read the ingredient guide"}{" "}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <Choices
                label="Budget per product"
                options={budgets}
                value={answers.budget}
                onChange={(value) => update("budget", value)}
              />
              <p className="small-muted">
                ₹600 is included in the ₹300–₹600 range. Products with unknown
                prices are excluded when a budget range is selected.
              </p>
            </>
          )}
          {step === 4 && (
            <>
              <div className="summary">
                <div className="summary-heading">
                  <h2>Your discovery profile</h2>
                  <button className="text-button" onClick={() => setStep(0)}>
                    <Pencil size={14} /> Edit answers
                  </button>
                </div>
                <dl>
                  {[
                    [
                      "Category",
                      category ? discoveryLabels[category] : "Not selected",
                    ],
                    ...(category === "all"
                      ? [
                          [
                            "Preferred categories",
                            (answers.preferredCategories || [])
                              .map((c) =>
                                c === "Not sure" ? c : discoveryLabels[c],
                              )
                              .join(", "),
                          ],
                        ]
                      : []),
                    [
                      "Concerns or goals",
                      answers.selectedConcerns?.map(concernLabel).join(", "),
                    ],
                    ...(skinPath
                      ? [["Skin characteristics", answers.skin]]
                      : []),
                    ...(category === "hair"
                      ? [["Scalp characteristics", answers.scalp]]
                      : []),
                    ...(topicalPath
                      ? [
                          [
                            "Products often cause irritation?",
                            answers.sensitivity,
                          ],
                        ]
                      : []),
                    [
                      "Product preference",
                      answers.productType || "Any product type",
                    ],
                    ...(category === "underarm"
                      ? [
                          [
                            "Fragrance preference",
                            answers.fragrancePreference || "No preference",
                          ],
                        ]
                      : []),
                    ["Ingredient familiarity", answers.familiarity],
                    ["Budget", answers.budget || "Skipped — no price filter"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Notice>
                <strong>How we chose these options</strong>
                <p>
                  These options match your category, at least one selected
                  concern or goal, product preferences and recorded budget. Your
                  comfort answers add cautions; we do not infer unverified
                  suitability. Explore the directions and limitations before
                  deciding what feels right for you.
                </p>
              </Notice>
              {matches.length ? (
                <>
                  <h2 className="results-heading">
                    {matches.length}{" "}
                    {matches.length === 1 ? "option" : "options"} to explore
                  </h2>
                  <div className="results-grid">
                    {matches.map((match) => (
                      <div key={match.product.id}>
                        <ProductCard
                          product={match.product}
                          reason={match.reasons.join(" ")}
                        />
                        <details className="match-details">
                          <summary>Things to keep in mind</summary>
                          <ul>
                            {[
                              ...customerPrecautions(match.product),
                              ...match.cautions.filter(
                                (c) => !match.product.precautions.includes(c),
                              ),
                              ...thingsToKeepInMind(match.product),
                            ].map((text) => (
                              <li key={text}>{text}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState title="Let’s try a different starting point.">
                  <p>
                    We don’t have an option for this combination yet. Try
                    adjusting your budget or explore the ingredient guides for a
                    little more clarity.
                  </p>
                  <div className="empty-actions">
                    <button
                      className="button button-secondary"
                      onClick={() => setStep(0)}
                    >
                      Edit answers
                    </button>
                    <ButtonLink href="/ingredients">
                      Explore ingredients
                    </ButtonLink>
                  </div>
                </EmptyState>
              )}
              <p className="small-muted results-footnote">
                For serious or persistent concerns, seek professional care. A
                product appearing here does not guarantee results or individual
                tolerance.
              </p>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="question-actions">
            {step > 0 ? (
              <button
                className="button button-secondary"
                onClick={() => {
                  setError("");
                  setStep(step - 1);
                }}
              >
                <ArrowLeft size={17} /> Back
              </button>
            ) : (
              <Link className="text-link" href="/">
                Back to home
              </Link>
            )}
            {step < 4 && (
              <div className="next-actions">
                {step === 3 && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, budget: undefined }));
                      setStep(4);
                    }}
                  >
                    Skip for now
                  </button>
                )}
                <button className="button" onClick={next}>
                  {step === 3 ? "See my discovery" : "Continue"}
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
            {step === 4 && (
              <ButtonLink href="/products">
                Explore catalogue <ArrowRight size={16} />
              </ButtonLink>
            )}
          </div>
        </div>
      </section>
      <CompareTray />
    </div>
  );
}
