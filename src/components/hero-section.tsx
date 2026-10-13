import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ButtonLink, Eyebrow } from "@/components/ui";

export function HeroSection() {
  return (
    <section className="hero container" aria-label="Introduction">
      {/* Left-hand column: preserved messaging, typography, and actions */}
      <div className="hero-copy">
        <Eyebrow>
          <span className="blue-dot" /> YOUR SKINCARE, WITH A LITTLE MORE CLARITY
        </Eyebrow>
        <h1>
          Find skincare
          <br />
          you <span>understand.</span>
        </h1>
        <p className="hero-description">
          Explore ingredients, compare products, and discover Be Bodywise options
          with more clarity.
        </p>
        <div className="hero-actions">
          <ButtonLink href="/discover" className="hero-cta-primary">
            Find My Match <ArrowUpRight size={19} />
          </ButtonLink>
          <ButtonLink href="/ingredients" secondary className="hero-cta-secondary">
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

      {/* Right-hand column: immersive editorial beauty hero stage */}
      <div
        className="hero-beauty-stage"
        aria-label="Editorial beauty showcase with interactive ingredient discovery"
      >
        {/* Ambient atmospheric studio lighting elements */}
        <div className="hero-studio-glow" aria-hidden="true" />
        <div className="hero-ambient-ring ring-1" aria-hidden="true" />
        <div className="hero-ambient-ring ring-2" aria-hidden="true" />

        {/* Model portrait frame */}
        <div className="hero-model-frame">
          <Image
            src="/images/hero/hero-model.jpg"
            alt="Be Bodywise clarity edit - confident Indian woman with healthy, glowing skin"
            width={1200}
            height={896}
            priority
            className="hero-model-image"
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 560px"
          />
          <div className="hero-model-gradient-overlay" aria-hidden="true" />

          {/* Editorial clarity header tag inside frame */}
          <div className="hero-editorial-badge">
            <span className="badge-pulse" aria-hidden="true" />
            <span className="badge-text">THE CLARITY EDIT</span>
            <span className="badge-divider" aria-hidden="true">
              ·
            </span>
            <span className="badge-sub">42 INGREDIENT GUIDES</span>
          </div>

          {/* Reassurance pill anchored at frame bottom */}
          <div className="hero-floating-pill" aria-hidden="true">
            <ShieldCheck size={15} className="pill-icon" />
            <span>Dermatologically Backed Actives</span>
          </div>
        </div>

        {/* Floating interactive ingredient discovery cards */}
        <div className="hero-ingredient-deck">
          {/* Card 1: Niacinamide (Vitamin B3) */}
          <Link
            href="/ingredients/niacinamide"
            className="hero-floating-card card-niacinamide"
            aria-label="Explore Niacinamide: balances oil and strengthens skin barrier"
          >
            <div className="card-symbol-badge b3" aria-hidden="true">
              B₃
            </div>
            <div className="card-info">
              <span className="card-name">Niacinamide</span>
              <span className="card-desc">Balances oil &amp; strengthens barrier</span>
            </div>
            <span className="card-arrow" aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
          </Link>

          {/* Card 2: Salicylic Acid (BHA) */}
          <Link
            href="/ingredients/salicylic-acid"
            className="hero-floating-card card-salicylic"
            aria-label="Explore Salicylic Acid: unclogs pores and gently exfoliates skin"
          >
            <div className="card-symbol-badge sa" aria-hidden="true">
              SA
            </div>
            <div className="card-info">
              <span className="card-name">Salicylic Acid</span>
              <span className="card-desc">Unclogs pores &amp; gently exfoliates</span>
            </div>
            <span className="card-arrow" aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
          </Link>

          {/* Card 3: Hyaluronic Acid (HA) */}
          <Link
            href="/ingredients/hyaluronic-acid"
            className="hero-floating-card card-hyaluronic"
            aria-label="Explore Hyaluronic Acid: attracts deep moisture and hydrates skin"
          >
            <div className="card-symbol-badge ha" aria-hidden="true">
              HA
            </div>
            <div className="card-info">
              <span className="card-name">Hyaluronic Acid</span>
              <span className="card-desc">Attracts moisture &amp; hydrates deeply</span>
            </div>
            <span className="card-arrow" aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
