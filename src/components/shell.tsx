"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ArrowRight, Menu, X, ScanLine } from "lucide-react";
import { useState } from "react";
import { useApp } from "./providers";
export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="Bodywise Match home">
      <span className="logo-mark">
        <ScanLine size={22} />
      </span>
      <span>
        bodywise<span className="logo-light"> match</span>
        <small>SKINCARE, MADE CLEAR.</small>
      </span>
    </Link>
  );
}
export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { comparison } = useApp();
  const links = [
    ["/products", "Discover products"],
    ["/ingredients", "Ingredient library"],
    [
      "/compare",
      `Compare${comparison.length ? ` (${comparison.length})` : ""}`,
    ],
  ];
  return (
    <>
      <div className="announcement">
        A little care. A little clarity. A routine that feels like you.
      </div>
      <header className="nav-shell">
        <nav className="nav container" aria-label="Main navigation">
          <Logo />
          <div className="desktop-links">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname.startsWith(href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
          <Link href="/discover" className="button nav-cta">
            Find My Match <ArrowUpRight size={17} />
          </Link>
          <button
            className="icon-button mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </nav>
        {open && (
          <div className="mobile-nav" id="mobile-nav">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/discover" onClick={() => setOpen(false)}>
              Find My Match <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div>
          <Logo />
          <p>
            Understand ingredients. Compare products.
            <br />
            Choose with clarity.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/products">Discover products</Link>
          <Link href="/ingredients">Ingredient library</Link>
          <Link href="/about">About & privacy</Link>
          <Link href="/discover">Find My Match</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>
          An independent discovery companion. Not affiliated with or endorsed by
          Be Bodywise or Mosaic Wellness. Educational information, not a
          diagnosis or medical advice. For serious or persistent skin concerns,
          seek professional care.
        </p>
        <span>© 2026 Bodywise Match</span>
      </div>
    </footer>
  );
}
