"use client";
import Link from "next/link";
import { ArrowUpRight, Plus, Check } from "lucide-react";
import { useApp } from "./providers";
import { useState } from "react";
import { ingredients } from "@/data/ingredients";
import { formatCheckedOn } from "@/data/products";
import type { Product } from "@/lib/types";
export function ProductVisual({ product }: { product: Product }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const image = product.image;
  const usable =
    Boolean(image?.src) &&
    image?.permission === "permitted" &&
    image?.matchStatus === "verified" &&
    failedSource !== image.src;
  const ingredient = ingredients.find((i) => i.id === product.ingredientIds[0]);

  return (
    <div
      className={`product-visual ${usable ? "has-photo" : `fallback ${product.accent}`}`}
      aria-label={
        usable
          ? `${product.name} packaging photograph`
          : "Ingredient illustration; product photo unavailable"
      }
    >
      {usable ? (
        // Large full-width official packshot photography
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="product-photo"
          src={image!.src!}
          alt={image!.alt || `${product.name} packaging`}
          loading="lazy"
          onError={() => setFailedSource(image!.src)}
        />
      ) : (
        <>
          <span className="product-category-label">{product.category}</span>
          <span className="product-monogram">
            {ingredient?.symbol ||
              product.category
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            <small>
              {ingredient?.name.toUpperCase() || product.category.toUpperCase()}
            </small>
          </span>
          <span className="product-visual-footer">
            INGREDIENT SPOTLIGHT <span>↗</span>
          </span>
        </>
      )}
    </div>
  );
}
export function CompareButton({ product }: { product: Product }) {
  const { comparison, toggleCompare } = useApp();
  const selected = comparison.includes(product.id);
  const full = comparison.length === 2 && !selected;
  return (
    <button
      className={`compare-button ${selected ? "selected" : ""}`}
      aria-pressed={selected}
      disabled={full}
      onClick={() => toggleCompare(product.id)}
    >
      {selected ? <Check size={16} /> : <Plus size={16} />}{" "}
      {selected
        ? "Added to comparison"
        : full
          ? "Comparison full (2/2)"
          : "Compare product"}
      <span className="sr-only">: {product.name}</span>
    </button>
  );
}
export function ProductCard({
  product,
  reason,
}: {
  product: Product;
  reason?: string;
}) {
  return (
    <article className="product-card">
      <Link
        href={`/products/${product.id}`}
        className="product-card-visual-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductVisual product={product} />
      </Link>
      <div className="product-card-body">
        <span className="source-badge">Be Bodywise</span>
        <h3>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-meta">
          {product.size || "Check pack size"} · {product.category}
        </p>
        <p className="product-ingredients">
          {product.keyIngredients.join(" + ")}
        </p>
        {reason && <p className="match-reason">{reason}</p>}
        <div className="product-price">
          <strong>
            {product.price === null ? "Price unavailable" : `₹${product.price}`}
          </strong>
          <span>Checked {formatCheckedOn(product.source?.checkedOn)}</span>
        </div>
        <Link className="text-link" href={`/products/${product.id}`}>
          Explore product <ArrowUpRight size={17} />
        </Link>
        <CompareButton product={product} />
      </div>
    </article>
  );
}
export function CompareTray() {
  const { comparison, clearCompare } = useApp();
  if (!comparison.length) return null;
  return (
    <aside className="compare-tray" aria-label="Selected products">
      <span>
        <strong>{comparison.length} of 2</strong> products selected
      </span>
      <button className="text-button" onClick={clearCompare}>
        Clear
      </button>
      <Link href="/compare" className="button">
        Compare <ArrowUpRight size={16} />
      </Link>
    </aside>
  );
}
