"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Smile,
  Droplets,
  Waves,
  Flower2,
  Sparkles,
  Heart,
  LayoutGrid,
  Check,
  type LucideIcon,
} from "lucide-react";
import { getCategoryImage } from "@/data/category-images";

export interface CareCategoryData {
  id: string;
  name: string;
  description: string;
  count: number;
  icon?: string;
}

const fallbackIconMap: Record<string, LucideIcon> = {
  face: Smile,
  body: Droplets,
  hair: Waves,
  underarm: Flower2,
  wellness: Heart,
  tools: Sparkles,
  acne: Sparkles,
  hydration: Heart,
  all: LayoutGrid,
};

export function CareCard({
  category,
  isActive = false,
  onClick,
  href,
}: {
  category: CareCategoryData;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const image = getCategoryImage(category.id);
  const FallbackIcon =
    (category.icon && fallbackIconMap[category.icon]) ||
    fallbackIconMap[category.id] ||
    Smile;

  const content = (
    <>
      <div className="care-card-image-wrap">
        {!imageError && image?.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            className="care-card-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="care-card-fallback" aria-hidden="true">
            <span className="care-fallback-icon">
              <FallbackIcon size={32} strokeWidth={1.5} />
            </span>
          </div>
        )}
      </div>
      <div className="care-card-body">
        <strong className="care-card-title">{category.name}</strong>
        <p className="care-card-desc">{category.description}</p>
        <div className="care-card-footer">
          <span className="care-card-count">{category.count} products</span>
          <span className="care-card-arrow" aria-hidden="true">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </>
  );

  const className = `care-card care-${category.id} ${isActive ? "active" : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-pressed={isActive}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

export function QuizCategoryCard({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const image = getCategoryImage(id);
  const FallbackIcon = fallbackIconMap[id] || Smile;

  return (
    <label className={`quiz-category-card ${checked ? "selected" : ""}`}>
      <input
        type="radio"
        name="Explore a category"
        value={id}
        checked={checked}
        onChange={onChange}
        className="quiz-category-radio"
      />
      <div className="quiz-category-thumb-wrap">
        {!imageError && image?.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt=""
            className="quiz-category-thumb"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="quiz-category-thumb-fallback" aria-hidden="true">
            <FallbackIcon size={20} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="quiz-category-info">
        <span className="quiz-category-title">{label}</span>
      </div>
      <span className="quiz-category-indicator" aria-hidden="true">
        {checked && <Check size={13} strokeWidth={2.5} />}
      </span>
    </label>
  );
}
