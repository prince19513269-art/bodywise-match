import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { products, productById, formatCheckedOn } from "@/data/products";
import { ingredients } from "@/data/ingredients";
import {
  CompareButton,
  CompareTray,
  ProductVisual,
} from "@/components/product-card";
import { Eyebrow, ExternalLink } from "@/components/ui";
import {
  thingsToKeepInMind,
  customerPrecautions,
  customerDescription,
} from "@/lib/product-copy";
export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}
export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = productById.get(id);
  if (!product) notFound();
  const notes = thingsToKeepInMind(product);
  return (
    <div className="container page-space product-page">
      <Link href="/products" className="text-link back-link">
        <ArrowLeft size={16} /> Browse all products
      </Link>
      <div className="product-detail">
        <ProductVisual product={product} />
        <div className="product-overview">
          <Eyebrow>BE BODYWISE</Eyebrow>
          <h1>{product.name}</h1>
          <div className="product-tags">
            <span>{product.category}</span>
            {product.concerns.map((concern) => (
              <span key={concern}>{concern}</span>
            ))}
          </div>
          <p className="detail-price">
            {product.price === null
              ? "See price at store"
              : "₹" + product.price}
            <span>{product.size || "Confirm pack size at store"}</span>
          </p>
          <p className="product-description">{customerDescription(product)}</p>
          <ul className="quick-highlights">
            <li>
              <Check size={16} />
              {product.category}
            </li>
            <li>
              <Check size={16} />
              {product.keyIngredients.length
                ? product.keyIngredients[0]
                : "Explore the full details below"}
            </li>
            {!!product.variants?.length && (
              <li>
                <Check size={16} />
                {product.variants.length} pack options to explore
              </li>
            )}
          </ul>
          <div className="detail-actions">
            {product.purchaseUrl && (
              <a
                className="button"
                href={product.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on official store ↗
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <CompareButton product={product} />
          </div>
          <p className="small-muted">
            Prices may change. Confirm size and availability at the official
            store.
          </p>
          <p className="last-checked">
            Information last checked on{" "}
            {formatCheckedOn(product.source?.checkedOn)}.
          </p>
        </div>
      </div>
      <div className="detail-grid">
        <section className="detail-section">
          <Eyebrow>A PLACE IN YOUR ROUTINE</Eyebrow>
          <h2>Why you might explore it</h2>
          <p>{customerDescription(product)}</p>
          <p className="small-muted">
            The brand positions it for{" "}
            {product.concerns.join(", ").toLowerCase()}. Results and tolerance
            vary from person to person.
          </p>
          <h3>Key ingredients</h3>
          <p>
            {product.keyIngredients.join(" · ") ||
              "Check the full ingredient label at the store."}
          </p>
          <p className="small-muted">
            Ingredient highlights. Always read the full label before use.
          </p>
          {product.ingredientIds.map((ingredientId) => {
            const ingredient = ingredients.find((i) => i.id === ingredientId);
            return ingredient ? (
              <Link
                className="ingredient-mini"
                href={"/ingredients/" + ingredientId}
                key={ingredientId}
              >
                <strong>{ingredient.name} ↗</strong>
                <span>{ingredient.summary}</span>
              </Link>
            ) : null;
          })}
        </section>
        <div className="product-guidance">
          {!!product.variants?.length && (
            <section className="detail-section">
              <h2>Choose your pack</h2>
              <div className="size-variants">
                {product.variants.map((v) => (
                  <a
                    href={v.url}
                    key={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <strong>{v.size || "Confirm pack size at store"}</strong>
                    <span>{v.name}</span>
                    <span>
                      {v.price === null ? "See store price" : "₹" + v.price}
                    </span>
                    <span className="sr-only">
                      {v.name} (opens in a new tab)
                    </span>
                  </a>
                ))}
              </div>
              <p className="small-muted">
                Check the current formula and price for your chosen size.
              </p>
            </section>
          )}
          <section className="detail-section">
            <h2>How to use</h2>
            <p>
              {product.usage || "Follow the instructions on the current pack."}
            </p>
            <p className="small-muted">
              Follow the current label. Any results timeline is guidance from
              the brand, not a guarantee.
            </p>
          </section>
          <section className="detail-section keep-in-mind">
            <h2>Things to keep in mind</h2>
            <ul>
              {[...customerPrecautions(product), ...notes].map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
          <section className="detail-section product-source">
            {product.source && (
              <ExternalLink href={product.source.url}>
                Official product page
              </ExternalLink>
            )}
            <p className="last-checked">
              Last checked {formatCheckedOn(product.source?.checkedOn)}.
            </p>
          </section>
        </div>
      </div>
      <CompareTray />
    </div>
  );
}
