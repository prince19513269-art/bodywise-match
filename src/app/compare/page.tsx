"use client";
import { useApp } from "@/components/providers";
import { products, productById, formatCheckedOn } from "@/data/products";
import { ProductVisual } from "@/components/product-card";
import { PageHeading, Notice, ButtonLink, ExternalLink } from "@/components/ui";
import type { Product } from "@/lib/types";
import { customerPrecautions, thingsToKeepInMind } from "@/lib/product-copy";
export default function Compare() {
  const { comparison, toggleCompare, clearCompare } = useApp();
  const selected = comparison
    .map((id) => productById.get(id))
    .filter((p): p is Product => !!p);
  const fields: { label: string; render: (p: Product) => string }[] = [
    { label: "Product category", render: (p) => p.category },
    { label: "Concerns to explore", render: (p) => p.concerns.join(", ") },
    {
      label: "Highlighted ingredients",
      render: (p) =>
        p.keyIngredients.join(", ") || "Check the ingredient label",
    },
    { label: "Size", render: (p) => p.size || "Confirm pack size at store" },
    {
      label: "Price when checked",
      render: (p) =>
        p.price === null
          ? "See price at store"
          : `₹${p.price} · ${formatCheckedOn(p.source?.checkedOn)}`,
    },
    {
      label: "How to use",
      render: (p) => p.usage || "Follow the current pack label",
    },
    {
      label: "Precautions",
      render: (p) => customerPrecautions(p).join(" "),
    },
    {
      label: "Things to keep in mind",
      render: (p) =>
        thingsToKeepInMind(p).join(" ") ||
        "Confirm the current label, price and availability at the store.",
    },
    {
      label: "Size options",
      render: (p) =>
        p.variants?.length
          ? p.variants
              .map(
                (v) =>
                  `${v.size || "Confirm pack size at store"}: ${v.price === null ? "price unavailable" : `₹${v.price}`}`,
              )
              .join(" · ")
          : "See store for size options",
    },
    { label: "Availability", render: () => "Confirm at the official store" },
  ];
  return (
    <div className="container page-space">
      <PageHeading
        label="SIDE BY SIDE"
        title="Understand the difference."
        description="Two products. The details that matter. Compare what’s available, with no scores or promises."
      />
      <Notice>
        Different product categories serve different purposes. A comparison is
        not a routine recommendation, a ranking, or advice to combine these
        products.
      </Notice>
      <div className="compare-picker">
        <div>
          <h2>Choose two products</h2>
          <p className="small-muted" aria-live="polite">
            {selected.length} of 2 selected
          </p>
        </div>
        <div className="compare-options">
          {products.map((p) => (
            <label
              key={p.id}
              className={comparison.includes(p.id) ? "active" : ""}
            >
              <input
                type="checkbox"
                checked={comparison.includes(p.id)}
                disabled={comparison.length === 2 && !comparison.includes(p.id)}
                onChange={() => toggleCompare(p.id)}
              />
              {p.name}
            </label>
          ))}
        </div>
        <button
          className="text-button"
          onClick={clearCompare}
          disabled={!selected.length}
        >
          Clear selection
        </button>
      </div>
      {selected.length === 2 ? (
        <div
          className="comparison-scroll"
          tabIndex={0}
          role="region"
          aria-label="Product comparison table"
        >
          <table className="comparison-table">
            <caption className="sr-only">
              Comparison of {selected.map((p) => p.name).join(" and ")}
            </caption>
            <thead>
              <tr>
                <th scope="col">At a glance</th>
                {selected.map((p) => (
                  <th scope="col" key={p.id}>
                    <ProductVisual product={p} />
                    <h2>{p.name}</h2>
                    <button
                      className="text-button"
                      onClick={() => toggleCompare(p.id)}
                    >
                      Remove<span className="sr-only"> {p.name}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.label}>
                  <th scope="row">{field.label}</th>
                  {selected.map((p) => (
                    <td key={p.id}>{field.render(p)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">Official source & purchase</th>
                {selected.map((p) => (
                  <td key={p.id}>
                    {p.purchaseUrl ? (
                      <ExternalLink href={p.purchaseUrl}>
                        Official store
                      </ExternalLink>
                    ) : (
                      "Link unavailable"
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="comparison-placeholders">
          {[0, 1].map((index) => (
            <div key={index}>
              {selected[index] ? (
                <>
                  <ProductVisual product={selected[index]} />
                  <h3>{selected[index].name}</h3>
                  <button
                    className="text-button"
                    onClick={() => toggleCompare(selected[index].id)}
                  >
                    Remove product
                  </button>
                </>
              ) : (
                <>
                  <span className="empty-symbol">0{index + 1}</span>
                  <h3>
                    {selected.length
                      ? "Choose one more product"
                      : "Your comparison starts here"}
                  </h3>
                  <p>Select a product above, or explore the catalogue.</p>
                  <ButtonLink href="/products" secondary>
                    Browse products
                  </ButtonLink>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
