"use client";
import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Smile,
  Droplets,
  Waves,
  Flower2,
  Sparkles,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { products, catalogueCheckedOn, formatCheckedOn } from "@/data/products";
import { budgets, type Answers } from "@/lib/types";
import { filterProducts } from "@/lib/catalogue";
import { PageHeading, EmptyState } from "@/components/ui";
import { getCareCategories } from "@/data/categories";
import { ProductCard, CompareTray } from "@/components/product-card";
const PAGE_SIZE = 12;
const categoryIcons = {
  face: Smile,
  body: Droplets,
  hair: Waves,
  underarm: Flower2,
  acne: Sparkles,
  hydration: Heart,
};
export default function Products() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [concern, setConcern] = useState("All concerns");
  const [budget, setBudget] = useState<Answers["budget"]>();
  const [page, setPage] = useState(1);
  const [care, setCare] = useState("all");
  const careCategories = getCareCategories(products);
  const activeCare = careCategories.find((c) => c.id === care);
  const careProducts = activeCare
    ? products.filter(activeCare.includes)
    : products;
  const categoryOptions = [...new Set(careProducts.map((p) => p.category))];
  const concernOptions = [...new Set(careProducts.flatMap((p) => p.concerns))];
  const filtered = filterProducts(products, {
    query,
    category,
    concern,
    budget,
    care,
  });
  function reset() {
    setQuery("");
    setCategory("All categories");
    setConcern("All concerns");
    setBudget(undefined);
    setPage(1);
    setCare("all");
  }
  return (
    <div className="container page-space">
      <PageHeading
        label="THE PRODUCT EDIT"
        title="A little care, made personal."
        description="Explore face, body and hair essentials. Understand the ingredients and find a thoughtful starting point for your routine."
      />
      <section className="care-browse" aria-labelledby="care-heading">
        <div className="care-heading">
          <h2 id="care-heading">Explore by care</h2>
          <button
            className="care-all"
            aria-pressed={care === "all"}
            onClick={reset}
          >
            View all {products.length} products <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="care-grid">
          {careCategories.map((c) => {
            const Icon = categoryIcons[c.icon];
            return (
              <button
                key={c.id}
                className={`care-card care-${c.id} ${care === c.id ? "active" : ""}`}
                aria-pressed={care === c.id}
                onClick={() => {
                  reset();
                  setCare(c.id);
                }}
              >
                <span className="care-icon">
                  <Icon size={27} strokeWidth={1.35} />
                </span>
                <strong>{c.name}</strong>
                <span className="care-description">{c.description}</span>
                <span className="care-count">
                  {c.count} products <ArrowUpRight size={15} />
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <div className="category-intro">
        <div>
          <h2>{activeCare?.name || "All your care essentials"}</h2>
          <p>
            {activeCare?.description ||
              `Discover ${products.length} Be Bodywise products, at your own pace.`}
          </p>
        </div>
        <span className="small-muted">
          Information checked {formatCheckedOn(catalogueCheckedOn)}
        </span>
      </div>
      <div className="catalogue-tools">
        <label className="search-input">
          <Search size={20} />
          <span className="sr-only">Search products</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search products or ingredients…"
          />
        </label>
        <div className="filters">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <label>
            <span className="sr-only">Product type</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="All categories">All product types</option>
              {categoryOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Concern</span>
            <select
              value={concern}
              onChange={(e) => {
                setConcern(e.target.value);
                setPage(1);
              }}
            >
              <option>All concerns</option>
              {concernOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Budget</span>
            <select
              value={budget || ""}
              onChange={(e) => {
                setBudget((e.target.value || undefined) as Answers["budget"]);
                setPage(1);
              }}
            >
              <option value="">All budgets</option>
              {budgets.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="catalogue-count">
        <span aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </span>
        <button className="text-button" onClick={reset}>
          Reset filters
        </button>
      </div>
      {filtered.length ? (
        <div className="catalogue-grid">
          {filtered
            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
            .map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
        </div>
      ) : (
        <EmptyState title="Nothing here just yet.">
          <p>
            Try another search or adjust your filters to explore more options.
          </p>
          <button className="button button-secondary" onClick={reset}>
            Clear all filters
          </button>
        </EmptyState>
      )}
      {filtered.length > PAGE_SIZE && (
        <nav className="pagination" aria-label="Catalogue pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(filtered.length / PAGE_SIZE)}
          </span>
          <button
            disabled={page * PAGE_SIZE >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </nav>
      )}
      <CompareTray />
      <p className="catalogue-footnote">
        Prices may change. Confirm price, pack size and availability at the
        official store. Budget filters use the size shown on the card.
      </p>
    </div>
  );
}
