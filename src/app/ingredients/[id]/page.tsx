import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ingredients } from "@/data/ingredients";
import { products, formatCheckedOn } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { Eyebrow, Notice, ExternalLink, ButtonLink } from "@/components/ui";
export const dynamicParams = false;
export function generateStaticParams() {
  return ingredients.map((i) => ({ id: i.id }));
}
export default async function IngredientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ingredient = ingredients.find((i) => i.id === id);
  if (!ingredient) notFound();
  return (
    <div className="container page-space ingredient-detail">
      <Link className="text-link back-link" href="/ingredients">
        <ArrowLeft size={16} /> Ingredient library
      </Link>
      <header className="ingredient-detail-header">
        <div>
          <Eyebrow>{ingredient.family}</Eyebrow>
          <h1>{ingredient.name}</h1>
          <p>{ingredient.summary}</p>
        </div>
        <span className="ingredient-symbol">{ingredient.symbol}</span>
      </header>
      <div className="guide-layout">
        <div>
          {[
            ["01", "What is it?", ingredient.what],
            ["02", "What does it generally do?", ingredient.does],
            ["03", "Why is it used in skincare or haircare?", ingredient.why],
            ["04", "What should I keep in mind?", ingredient.precautions],
            ["05", "What does it not guarantee?", ingredient.limits],
          ].map(([n, title, body]) => (
            <section className="guide-section" key={n}>
              <span>{n}</span>
              <div>
                <h2>{title}</h2>
                <p>{body}</p>
              </div>
            </section>
          ))}
        </div>
        <aside className="guide-source">
          <Eyebrow>READ WITH CONTEXT</Eyebrow>
          <h3>The formula matters.</h3>
          <p>
            One ingredient doesn’t tell the whole story of a product. Always
            read the current label.
          </p>
          <hr />
          <p className="small-muted">
            Education source · checked{" "}
            {formatCheckedOn(ingredient.source.checkedOn)}
          </p>
          <ExternalLink href={ingredient.source.url}>
            {ingredient.source.label}
          </ExternalLink>
        </aside>
      </div>
      <section className="ingredient-products">
        <h2>Explore products with this ingredient</h2>
        <p className="small-muted">
          Get to know the whole formula. One ingredient alone does not determine
          whether a product will suit you.
        </p>
        <div className="catalogue-grid">
          {products
            .filter((p) => p.ingredientIds.includes(ingredient.id))
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <Notice>
        Educational information only. For serious or persistent skin concerns, a
        qualified clinician can assess what is happening and discuss appropriate
        care.
      </Notice>
      <ButtonLink href="/products" secondary>
        Explore the catalogue
      </ButtonLink>
    </div>
  );
}
