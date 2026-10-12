import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  GitCompareArrows,
  SlidersHorizontal,
  ShieldCheck,
  MoveUpRight,
} from "lucide-react";
import { ButtonLink, Eyebrow } from "@/components/ui";
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <Eyebrow>
            <span className="blue-dot" /> YOUR SKINCARE, WITH A LITTLE MORE
            CLARITY
          </Eyebrow>
          <h1>
            Find skincare
            <br />
            you <span>understand.</span>
          </h1>
          <p className="hero-description">
            Explore ingredients, compare products, and discover Be Bodywise
            options with more clarity.
          </p>
          <div className="hero-actions">
            <ButtonLink href="/discover">
              Find My Match <ArrowUpRight size={19} />
            </ButtonLink>
            <ButtonLink href="/ingredients" secondary>
              Explore Ingredients <ArrowRight size={18} />
            </ButtonLink>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={15} /> No sign-up needed
            </span>
            <span>
              <Check size={15} /> Your pace. Your choice.
            </span>
          </div>
        </div>
        <div
          className="hero-visual"
          aria-label="Preview of ingredient education and the discovery process"
        >
          <div className="visual-top">
            <span>THE CLARITY EDIT</span>
            <span>01 / INGREDIENTS</span>
          </div>
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="ingredient-preview">
            <div className="preview-label">
              <span className="mini-icon">
                <BookOpen size={17} />
              </span>{" "}
              A LITTLE INGREDIENT KNOW-HOW
            </div>
            <span className="ingredient-number">B₃</span>
            <h2>Meet niacinamide.</h2>
            <p>
              A familiar name on the label.
              <br />A little easier to understand.
            </p>
            <div className="preview-tags">
              <span>Vitamin B3</span>
              <span>Oiliness</span>
            </div>
            <Link className="preview-link" href="/ingredients/niacinamide">
              Get to know this ingredient <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="floating-note">
            <span className="check-circle">
              <Check size={20} />
            </span>
            <div>
              <strong>Clarity over guesswork.</strong>
              <span>Understand the why behind a choice.</span>
            </div>
          </div>
          <span className="visual-bottom">
            LESS OVERWHELM. MORE UNDERSTANDING.
          </span>
        </div>
      </section>
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
