"use client";

import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import { products, catalogueCheckedOn, formatCheckedOn } from "@/data/products";
import { budgets, type Answers } from "@/lib/types";
import { filterProducts } from "@/lib/catalogue";
import { PageHeading, EmptyState } from "@/components/ui";
import { getCareCategories } from "@/data/categories";
import { ProductCard, CompareTray } from "@/components/product-card";
import { CareCard } from "@/components/category-card";
import { getCategoryImage } from "@/data/category-images";

const PAGE_SIZE = 12;

export default function Products() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [concern, setConcern] = useState("All concerns");
  const [budget, setBudget] = useState<Answers["budget"]>();
  const [page, setPage] = useState(1);
  const [care, setCare] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("care") || "all";
    }
    return "all";
  });

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

  const activeCareImage = activeCare ? getCategoryImage(activeCare.id) : undefined;

  useEffect(() => {
    function handlePopState() {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlCare = params.get("care") || "all";
        setCare(urlCare);
        setQuery("");
        setCategory("All categories");
        setConcern("All concerns");
        setBudget(undefined);
        setPage(1);
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleSelectCategory(categoryId: string) {
    setQuery("");
    setCategory("All categories");
    setConcern("All concerns");
    setBudget(undefined);
    setPage(1);
    setCare(categoryId);
    if (typeof window !== "undefined") {
      window.history.pushState({ care: categoryId }, "", `/products?care=${categoryId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBackToCategories() {
    setQuery("");
    setCategory("All categories");
    setConcern("All concerns");
    setBudget(undefined);
    setPage(1);
    setCare("all");
    if (typeof window !== "undefined") {
      window.history.pushState({ care: "all" }, "", "/products");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function reset() {
    setQuery("");
    setCategory("All categories");
    setConcern("All concerns");
    setBudget(undefined);
    setPage(1);
    setCare("all");
    if (typeof window !== "undefined") {
      window.history.pushState({ care: "all" }, "", "/products");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="container page-space">
      {activeCare ? (
        /* Dedicated Category Page Header */
        <div className="category-dedicated-header category-page-animated">
          <div className="category-top-nav">
            <button
              type="button"
              className="back-to-categories-btn"
              onClick={handleBackToCategories}
              aria-label="Back to all categories"
            >
              <ArrowLeft size={16} /> Back to Categories
            </button>
            <nav aria-label="Breadcrumb" className="category-breadcrumb">
              <button
                type="button"
                className="breadcrumb-link"
                onClick={handleBackToCategories}
              >
                Explore by Care
              </button>
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
              <span className="breadcrumb-current" aria-current="page">
                {activeCare.name}
              </span>
            </nav>
          </div>

          <div className="category-hero-banner">
            <div className="category-hero-copy">
              <span className="category-pill-badge">CATEGORY SPOTLIGHT</span>
              <h1 className="category-hero-title">Discover {activeCare.name}</h1>
              <p className="category-hero-desc">{activeCare.description}</p>
              <div className="category-hero-stats">
                <span className="category-count-chip">
                  {careProducts.length} matching products
                </span>
                <span className="category-checked-chip">
                  Verified {formatCheckedOn(catalogueCheckedOn)}
                </span>
                <button
                  type="button"
                  className="category-switch-chip"
                  onClick={handleBackToCategories}
                >
                  Change category <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
            {activeCareImage && (
              <div className={`category-hero-media care-hero-${activeCare.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCareImage.src}
                  alt={activeCareImage.alt}
                  className={`category-hero-photo ${activeCare.id === "hair" ? "category-hero-photo-hair" : ""}`}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Main Category Browse & All Products View */
        <>
          <PageHeading
            label="THE PRODUCT EDIT"
            title="A little care, made personal."
            description="Explore face, body and hair essentials. Understand the ingredients and find a thoughtful starting point for your routine."
          />
          <section className="care-browse care-browse-animated" aria-labelledby="care-heading">
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
              {careCategories.map((c) => (
                <CareCard
                  key={c.id}
                  category={c}
                  isActive={false}
                  onClick={() => handleSelectCategory(c.id)}
                />
              ))}
            </div>
          </section>
          <div className="category-intro">
            <div>
              <h2>All your care essentials</h2>
              <p>
                Discover {products.length} Be Bodywise products, at your own pace.
              </p>
            </div>
            <span className="small-muted">
              Information checked {formatCheckedOn(catalogueCheckedOn)}
            </span>
          </div>
        </>
      )}

      {/* Product Discovery Tools, Filters, Cards & Compare Tray */}
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
          {activeCare ? ` in ${activeCare.name}` : ""}
        </span>
        <button
          className="text-button"
          onClick={
            activeCare
              ? () => {
                  setQuery("");
                  setCategory("All categories");
                  setConcern("All concerns");
                  setBudget(undefined);
                  setPage(1);
                }
              : reset
          }
        >
          Reset filters
        </button>
      </div>
      {filtered.length ? (
        <div className="catalogue-grid product-card-animated">
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
          <button
            className="button button-secondary"
            onClick={
              activeCare
                ? () => {
                    setQuery("");
                    setCategory("All categories");
                    setConcern("All concerns");
                    setBudget(undefined);
                    setPage(1);
                  }
                : reset
            }
          >
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
