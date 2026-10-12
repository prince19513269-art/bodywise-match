"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { ingredients } from "@/data/ingredients";
import { PageHeading, EmptyState, Notice } from "@/components/ui";
export default function Ingredients() {
  const [query, setQuery] = useState("");
  const filtered = ingredients.filter((i) =>
    `${i.name} ${i.family} ${i.summary}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  return (
    <div className="container page-space">
      <PageHeading
        label="THE INGREDIENT LIBRARY"
        title="Good questions. Clearer answers."
        description="Get familiar with the names on the label. What they do, why they’re there, and where their limits lie."
      />
      <label className="search-input library-search">
        <Search size={20} />
        <span className="sr-only">Search ingredients</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search an ingredient or benefit…"
        />
      </label>
      <p className="small-muted" aria-live="polite">
        {filtered.length} ingredient guides · A little everyday know-how
      </p>
      <div className="ingredient-grid">
        {filtered.map((i, index) => (
          <Link
            className={`ingredient-card ingredient-tone-${index % 4}`}
            key={i.id}
            href={`/ingredients/${i.id}`}
          >
            <div className="ingredient-card-top">
              <span>{i.family}</span>
              <ArrowUpRight size={21} />
            </div>
            <span className="ingredient-symbol">{i.symbol}</span>
            <h2>{i.name}</h2>
            <p>{i.summary}</p>
            <span className="ingredient-read">
              Understand this ingredient <ArrowUpRight size={16} />
            </span>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState title="No ingredient found.">
          <p>Try “hydration”, “BHA”, or an ingredient name.</p>
          <button
            className="button button-secondary"
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </EmptyState>
      )}
      <Notice>
        Ingredient knowledge is a starting point. The whole formula and your
        skin’s response matter. Read the label, introduce products thoughtfully,
        and seek professional care for persistent concerns.
      </Notice>
    </div>
  );
}
