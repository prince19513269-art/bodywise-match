"use client";

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
import { useApp } from "./providers";

export function HeroSection() {
  const { openAssistant } = useApp();

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
            Find My Match <ArrowUpRight size={18} />
          </ButtonLink>
          <ButtonLink href="/ingredients" secondary className="hero-cta-secondary">
            Explore Ingredients <ArrowRight size={17} />
          </ButtonLink>
          <button
            type="button"
            className="hero-cta-assistant"
            onClick={() => openAssistant()}
            aria-label="Open Ask AI skincare assistant"
          >
            <Sparkles size={15} /> Ask AI
          </button>
        </div>
        <div className="hero-reassurance">
          <span>
            <Check size={14} /> No sign-up needed
          </span>
          <span>
            <Check size={14} /> Your pace. Your choice.
          </span>
        </div>
      </div>

      {/* Right-hand column: unified, elegant editorial showcase */}
      <div
        className="hero-showcase-stage"
        aria-label="Editorial beauty showcase with interactive ingredient discovery"
      >
        {/* Ambient atmospheric studio lighting — soft glow only, NO outlines or circular rings */}
        <div className="hero-studio-glow" aria-hidden="true" />

        {/* Cohesive layered rounded panel system matching app design tokens */}
        <div className="hero-showcase-panel">
          {/* Editorial header bar inside showcase panel */}
          <div className="hero-panel-header">
            <div className="hero-editorial-badge">
              <span className="badge-pulse" aria-hidden="true" />
              <span className="badge-text">THE CLARITY EDIT</span>
            </div>
            <div className="hero-trust-badge">
              <ShieldCheck size={14} className="trust-icon" aria-hidden="true" />
              <span>Dermatologically Backed</span>
            </div>
          </div>

          {/* Model portrait frame — pristine, unobstructed, full hair & facial visibility */}
          <div className="hero-portrait-frame">
            <Image
              src="/images/hero/hero-model.jpg"
              alt="Be Bodywise clarity edit - confident Indian woman with healthy, glowing skin"
              width={1200}
              height={896}
              priority
              className="hero-portrait-image"
              sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 500px"
            />
          </div>

          {/* Supporting interactive ingredient discovery dock */}
          <div className="hero-actives-dock">
            <div className="actives-dock-header">
              <span className="dock-title">FEATURED CORE ACTIVES</span>
              <span className="dock-subtitle">Tap to explore guide</span>
            </div>

            <div className="actives-grid">
              {/* Card 1: Niacinamide (Vitamin B3) */}
              <Link
                href="/ingredients/niacinamide"
                className="active-item-card"
                aria-label="Explore Niacinamide: balances oil and strengthens skin barrier"
              >
                <div className="active-badge b3" aria-hidden="true">
                  B₃
                </div>
                <div className="active-info">
                  <span className="active-name">Niacinamide</span>
                  <span className="active-role">Oil balance &amp; barrier</span>
                </div>
                <span className="active-arrow" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </span>
              </Link>

              {/* Card 2: Salicylic Acid (BHA) */}
              <Link
                href="/ingredients/salicylic-acid"
                className="active-item-card"
                aria-label="Explore Salicylic Acid: unclogs pores and gently exfoliates skin"
              >
                <div className="active-badge sa" aria-hidden="true">
                  SA
                </div>
                <div className="active-info">
                  <span className="active-name">Salicylic Acid</span>
                  <span className="active-role">Pores &amp; gentle exfoliation</span>
                </div>
                <span className="active-arrow" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </span>
              </Link>

              {/* Card 3: Hyaluronic Acid (HA) */}
              <Link
                href="/ingredients/hyaluronic-acid"
                className="active-item-card"
                aria-label="Explore Hyaluronic Acid: attracts deep moisture and hydrates skin"
              >
                <div className="active-badge ha" aria-hidden="true">
                  HA
                </div>
                <div className="active-info">
                  <span className="active-name">Hyaluronic Acid</span>
                  <span className="active-role">Deep layer hydration</span>
                </div>
                <span className="active-arrow" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
