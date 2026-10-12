# Bodywise Match

An independent, mobile-first skincare discovery fellowship prototype.

**Understand ingredients. Compare products. Choose with clarity.**

## Run locally

Use Node.js 22 or later and pnpm. From this folder:

```sh
pnpm install
pnpm dev
```

Open **http://127.0.0.1:3000**. If that port is occupied, use the URL printed by Next.js.
No API key, account, database, or environment configuration is needed.

On this Windows computer, if `pnpm` is not on PATH, use:

```powershell
& 'C:\Users\acer\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dev
```

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm start` serves the production build. The lockfile pins installed dependency versions.

## What is here

- Next.js App Router, TypeScript, Tailwind CSS, Lucide icons.
- Responsive homepage and five-step discovery with validation, editing, reset, and back navigation.
- A deterministic matcher, honest empty results, reasons, cautions, and missing-information notices.
- 30 distinct brand-source-checked products across 15 categories; search, concern/budget filters, size variants, pagination, details, and two-product comparison.
- 20 ingredient guides linking to products with verified ingredient presence.
- Loading, error, and not-found states; keyboard focus, semantic inputs, mobile navigation, reduced motion.
- Future AI explanation interfaces without fake responses, keys, or network calls.

## Data and privacy

Answers and comparison selections live only in React memory: internal navigation retains them; refresh or closing the tab clears them. No analytics, authentication, photos, customer identity collection, or preference transmission.

“Source-checked” means listed information was found on the recorded official product page. It is **not clinical validation**. The catalogue was checked on 12 October 2026. Conflicting pack sizes are unavailable, two prices remain unknown, and formula inconsistencies are flagged. Prices and stock are snapshots. Development fixtures stay isolated.

Official image source URLs are recorded, but photos are not downloaded or reused because permission and visual/variant correspondence remain unconfirmed. The existing typographic placeholders adapt to each product. See [docs/CATALOGUE_AUDIT.md](docs/CATALOGUE_AUDIT.md) for sources, image-review links, gaps, and excluded retired listings.

This is not an official Be Bodywise app, not endorsed by Mosaic Wellness, and not a medical diagnostic tool. Phase 1 uses transparent rules; AI is not enabled.

See [HANDOFF.md](HANDOFF.md) for architecture, verification, known limitations, and Phase 2 work.
