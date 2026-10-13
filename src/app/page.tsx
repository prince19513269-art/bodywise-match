import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GitCompareArrows,
  SlidersHorizontal,
  ShieldCheck,
  MoveUpRight,
} from "lucide-react";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { products } from "@/data/products";
import { getCareCategories } from "@/data/categories";
import { CareCard } from "@/components/category-card";
import { HeroSection } from "@/components/hero-section";

export default function Home() {
  const careCategories = getCareCategories(products);
  return (
    <>
      <HeroSection />
      <section className="principles">
        <div className="container principles-inner">
          <span>
            Thoughtful discovery.
            <br />
            <strong>From the very first step.</strong>
          </span>
          <span>
            <SlidersHorizontal size={19} /> Guided by your preferences
          </span>
          <span>
            <BookOpen size={19} /> Ingredients, in plain language
          </span>
          <span>
            <ShieldCheck size={19} /> Transparent product information
          </span>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <Eyebrow>A BETTER WAY TO EXPLORE</Eyebrow>
            <h2>
              Less confusion.
              <br />
              More informed choices.
            </h2>
          </div>
          <p>
            Skincare shouldn’t feel like homework.
            <br />
            Start with what matters to you.
          </p>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: SlidersHorizontal,
              number: "01",
              title: "Discover relevant products",
              body: "A few thoughtful questions help you explore options for your concerns, preferences, and budget.",
              link: "/discover",
              cta: "Find your starting point",
            },
            {
              icon: BookOpen,
              number: "02",
              title: "Understand ingredients",
              body: "Go beyond the name on the label. Learn what ingredients generally do, and what they don’t guarantee.",
              link: "/ingredients",
              cta: "Explore the ingredient library",
            },
            {
              icon: GitCompareArrows,
              number: "03",
              title: "Compare with confidence",
              body: "See product information side by side, with sources and missing details clearly marked.",
              link: "/compare",
              cta: "Take a closer look",
            },
          ].map(({ icon: Icon, ...feature }) => (
            <Link
              className="feature-card"
              href={feature.link}
              key={feature.number}
            >
              <div className="feature-top">
                <Icon size={24} />
                <span>{feature.number}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
              <span className="feature-link">
                {feature.cta}
                <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container section care-browse" aria-labelledby="home-care-heading">
        <div className="care-heading">
          <div>
            <Eyebrow>EXPLORE BY CARE</Eyebrow>
            <h2 id="home-care-heading">Explore by care</h2>
          </div>
          <Link href="/products" className="care-all">
            View all {products.length} products <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="care-grid">
          {careCategories.map((c) => (
            <CareCard
              key={c.id}
              category={{
                id: c.id,
                name: c.name,
                description: c.description,
                count: c.count,
                icon: c.icon,
              }}
              href={`/products?care=${c.id}`}
            />
          ))}
        </div>
      </section>
      <section className="how-section">
        <div className="container how-layout">
          <div>
            <Eyebrow>HOW IT WORKS</Eyebrow>
            <h2>
              A little about you.
              <br />A clearer place to start.
            </h2>
            <ButtonLink href="/discover">
              Let’s find your starting point <ArrowRight size={18} />
            </ButtonLink>
          </div>
          <ol className="steps-list">
            <li>
              <span>01</span>
              <div>
                <h3>Tell us what matters</h3>
                <p>Share your main concern, skin preferences, and budget.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Explore the reasoning</h3>
                <p>
                  See why each product appears, along with cautions and details
                  to check before you choose.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Make your own informed choice</h3>
                <p>
                  Learn, compare, and visit the official store when you’re
                  ready.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
      <section className="container editorial">
        <div>
          <Eyebrow>START WITH CURIOSITY</Eyebrow>
          <h2>
            What’s actually
            <br />
            in your skincare?
          </h2>
          <p>Four familiar ingredients. Clear, useful explanations.</p>
          <Link className="text-link" href="/ingredients">
            Open the ingredient library <ArrowRight size={18} />
          </Link>
        </div>
        <div className="ingredient-index">
          {[
            ["salicylic-acid", "Salicylic acid", "The exfoliating BHA"],
            ["niacinamide", "Niacinamide", "A form of vitamin B3"],
            [
              "hyaluronic-acid",
              "Hyaluronic acid",
              "The moisture-attracting ingredient",
            ],
            ["glycolic-acid", "Glycolic acid", "An exfoliating AHA"],
          ].map(([id, name, desc]) => (
            <Link href={`/ingredients/${id}`} key={id}>
              <div>
                <h3>{name}</h3>
                <span>{desc}</span>
              </div>
              <MoveUpRight size={21} />
            </Link>
          ))}
        </div>
      </section>
      <div className="container closing-note">
        <ShieldCheck size={22} />
        <p>
          Find your starting point, then choose at your own pace. Every skin is
          different; read the label and introduce new products thoughtfully.
        </p>
        <Link href="/about">
          Our approach <ArrowUpRight size={16} />
        </Link>
      </div>
    </>
  );
}
