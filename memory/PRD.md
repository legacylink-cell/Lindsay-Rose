# Bright at Home Cleaning — Product Requirements & Status

## Product
Premium, conversion-focused marketing site for **Bright at Home Cleaning** (DFW residential + commercial cleaning). Faith-forward, mobile-first, SEO-ready. Collects quote + career leads. Preview env editable; production at https://www.bright.mozeid.com (user redeploys).

## Stack
- Frontend: React + Tailwind + shadcn/ui. Routes: `/` (Landing), `/careers`, `/admin`, `/brand` (logo preview).
- Backend: FastAPI + MongoDB (quote/career storage, admin JWT auth, FormSubmit email relay).
- Key files: `src/mock.js` (brand data), `src/index.css`, `tailwind.config.js`, `public/index.html`, components in `src/components/`.

## Brand system (updated 2026-06 — client official brand kit)
- **Colors**: primary green `#1F5B3A`, bright green `#4CAF50` (brand-greenLight/greenBright), gold `#F4C542` (brand-amber), cream/off-white `#FFF7E6` (brand-cream), charcoal `#333333` (brand-ink). Applied in tailwind brand tokens + index.css :root vars + index.html theme-color.
- **Typography**: Headings/display = **Cormorant Garamond** at weight **700 + subtle 0.4px text-stroke** for extra heft (avoids thin look). Body/UI = **Mulish** (closest free Proxima Nova match). Cormorant applied ONLY via explicit `.font-serif` class on large headings; global `h1–h4` no longer forces serif (fixes small sub-heading/accordion readability). Loaded in index.html; tailwind `serif`/`display` = Cormorant, `sans` = Mulish.
- **Textures (minimal)**: subtle marble (`.tex-marble`, ~5% opacity) on Pricing section; subtle white-pebble (`.tex-pebble`, ~6%) on Testimonials/reviews section.
- **Logo**: **Logo B — Rooftop Emblem** SELECTED and applied site-wide (2026-06). Transparent cutout at `public/logos/logo-b-rooftop-emblem-t.png` used in Header, Footer (on cream panel), Careers header, Admin. Favicon/apple-touch/logo192/logo512/favicon.ico regenerated from the rooftop emblem crop (on cream). OG image (og-image.jpg/.png) regenerated with Logo B + tagline. Other variations still in `public/logos/` and previewable at `/brand`.

## Recent changes (2026-06)
- Removed repetitive "Custom quote" text on pricing cards → per-card taglines (Tailored to your home / Your first-visit reset / Built around your space) with Heart icon.
- Removed all AI-connotation icons (replaced sparkle with Heart). No AI icons/text anywhere.
- Faith section: removed "Holy Bible" (now just "Matthew 5:16"); icon changed from open book to **Cross**.
- Review count changed 67 → **65+** (hero, testimonials, stats, schema=65).
- Applied full brand kit: palette + Montserrat/Source Sans 3 fonts + subtle marble/pebble textures.
- Built `/brand` logo preview page.

## Open items / backlog
- **P0 (awaiting user)**: Pick a logo at `/brand`, then finalize it site-wide + regenerate favicon/OG.
- Instagram social URL still placeholder (`#`) in mock.js — replace or hide.
- FormSubmit email activation unverified in production (primary design@mozeid.com, CC support@brightathomecleaning.com).
- Terms & Conditions text is placeholder — needs legal-approved copy.
- Optional: city landing pages (Plano/Argyle) for local SEO; Google Business Profile work (business-side).

## Integrations
- MongoDB (Motor), FastAPI, FormSubmit.co (email relay), Admin JWT (ADMIN_USERNAME/PASSWORD, JWT_SECRET in backend/.env — do not echo), Google review link, Facebook link, Unsplash imagery, Google Fonts.
