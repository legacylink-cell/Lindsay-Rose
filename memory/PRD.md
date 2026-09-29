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

## Email delivery (2026-06, updated)
- **FormSubmit.co REMOVED.** Emails now send via **Google Workspace SMTP** (`smtp.gmail.com:587`, STARTTLS) authenticated with an App Password for `support@brightathomecleaning.com`.
- Env keys in `backend/.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_APP_PASSWORD`, `MAIL_FROM_NAME`, `FORWARD_EMAIL`. (`FORWARD_ORIGIN`/`FORWARD_CC` removed.)
- `_forward_email()` in `backend/server.py` now: (1) sends the submission to `FORWARD_EMAIL` with `Reply-To` = submitter, (2) sends the client confirmation to the submitter. Independent try/except; failures never affect the saved submission. **No CC to anyone.**
- **Branded HTML confirmations (2026-06)**: `CLIENT_EMAILS` + `_client_message(kind, first)` in `backend/server.py` build multipart text+HTML client emails (cream logo band, amber rule, brand-green heading, pill `tel:` CTA, tagline footer). Distinct subjects: "We received your quote request" vs "We received your application". Logo pulled from `SITE_URL/logos/logo-b-rooftop-emblem-t.png` (env `SITE_URL`, defaults to production domain). Verified in preview: 2 quote + 2 application sends, all 4 confirmations logged sent.

## Lead delivery hardening + ROOT CAUSE of missing emails (2026-09-27)
- **ROOT CAUSE FOUND**: the Google Workspace **App Password is invalid** — `smtplib` login to smtp.gmail.com:587 returns `535 5.7.8 Username and Password not accepted / BadCredentials`. Reproduced in preview; both the stored spelling (`…ohlr…`) and the l/i alternate from the user's Secrets screenshot (`…ohir…`) are rejected, so it is revoked/expired, not mistyped. Most common trigger: the Google account password was changed or 2SV re-configured, which invalidates all existing app passwords. Production Secrets DO contain all SMTP keys (screenshot-verified), so missing config was NOT the cause. Pre-SMTP-era misses are separately explained by the never-reliable FormSubmit relay.
- **NOTE**: production runtime logs are NOT accessible to the agent (deployment_agent only performs static scans), so all evidence came from reproducing the SMTP login locally + the new instrumentation.
- **Per-lead delivery tracking**: every quote/application now stores `delivery.{email,telegram}.{status,attempts,error,at}`. `dispatch_lead(kind, id)` replaces the old fire-and-forget `_forward_email` task; `_forward_email` now RAISES on support-notification failure so the outcome is recorded (a failed client confirmation is still only logged).
- **Auto-retry**: `retry_failed_deliveries()` + `_delivery_retry_loop()` startup task sweep every `DELIVERY_RETRY_MINUTES` (10) and re-dispatch anything not `sent`, up to `DELIVERY_MAX_ATTEMPTS` (8). Channels are independent — a dead channel can never suppress the other.
- **Telegram alerts** (chosen over Twilio to avoid 10DLC delay): `_send_telegram()` posts to the Bot API via httpx; `_telegram_payload()` formats quote vs application with name/phone/email/city/service/details + dashboard link. Env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (**both empty — awaiting user**). Test endpoint `POST /api/admin/telegram/test`.
- **New admin endpoints**: `GET /api/admin/delivery-health` (config presence + live SMTP login probe + undelivered count), `POST /api/admin/{kind}s/{id}/resend`, `POST /api/admin/telegram/test`.
- **Dashboard**: red "Lead alerts need attention" banner (`delivery-health-banner`), per-card "Email not sent" flag (`email-failed-flag-{id}`, error in tooltip) and a "Resend email" button (`resend-{id}`).
- **The App Password was regenerated by the user on 2026-09-29** and the new one works: `smtp_login_ok: true`, fresh submissions deliver on the first attempt, and the 3 outage-stranded leads were all rescued to `sent` (undelivered 3 → 0). `SMTP_APP_PASSWORD` in preview `.env` is current; **production Secrets still hold the DEAD password until the user updates it there and re-publishes.**
- Delivery refinements after the iteration_3 review: `_smtp_probe()` caches the live SMTP login check for 60s (dashboard loads no longer hammer Google); retry sweep selects only `telegram.status == "failed"` (so connecting Telegram later never blasts alerts for old leads); `_is_channel_outage()` keeps an outage from burning a lead's retry budget, and a lead is re-dispatched past the cap once the channel is healthy again.
- Dashboard banner is severity-aware: **red** only when email is actually broken or leads are undelivered, **amber informational** when just the phone channel isn't connected (avoids a false alarm for an optional channel).
- Tests: 33/33 pytest pass (`tests/test_delivery.py`, `tests/test_status_and_reminders.py`, `tests/backend_test.py`; admin password updated to Dallas2025!! in all). Banner state verified in-browser for both the broken-email and healthy-email cases.
- **Also spotted**: production Secrets are missing `SITE_URL` (harmless — code default is the apex domain) and still carry the obsolete `FORWARD_CC` (ignored by code; user can delete).


## Per-route head tags / canonicals (2026-06)
- **`frontend/src/hooks/usePageHead.js`** (new): shared hook + `absoluteUrl()`. Sets per route: `document.title`, `meta[name=description]`, self-referencing `link[rel=canonical]` (created if missing), `og:url`, `og:title`, `og:description`, `twitter:title`, `twitter:description`.
- Host is `https://brightathomecleaning.com` (**apex, no www**) — matched to the live redirect direction: the platform's Root Domain Redirection is set with the apex as Primary, so `www.*` 308-redirects to apex (verified 2026-06, path + query preserved). Canonical/sitemap/robots/schema all flipped from www to apex so nothing canonicalises to a redirecting URL. No trailing slash except the homepage.
- Wired into: `App.js` Landing (`/`, HOME_TITLE/HOME_DESCRIPTION consts), `components/Careers.jsx` (`/careers`, new jobs-focused title + description), `pages/ServicePage.jsx` (`/services/{slug}`, uses existing per-service metaTitle/metaDescription; its old inline title/meta code was removed, its `Service` JSON-LD block kept).
- Before: every route emitted the hardcoded homepage canonical from `public/index.html` (told Google the 5 service pages + careers were duplicates of home). After: 7/7 routes verified unique title, unique description, self-referencing canonical, single canonical tag, og:url in sync, and correct reset on SPA back-navigation.
- **KNOWN LIMITATION**: head tags are set client-side, so `curl` still shows the homepage canonical from the static shell (no JS execution). Googlebot renders JS and sees the correct per-route canonical. A build-time prerender step would be needed for raw-HTML correctness — not implemented, not verifiable in preview.
- **RESOLVED (platform-side)**: duplicate host collapsed via Publish → Domain → Enable Root Domain Redirection with apex as Primary. `www` → apex is a 308 (permanent, Google treats it as 301). Only remaining `www.` reference in the codebase is the GTM hostname allow-list in index.html, which intentionally covers both hosts.
- JSON-LD: shell `HouseCleaningService`/`LocalBusiness` block still renders on every route (static in index.html); each service page additionally injects its own `Service` block describing that service, removed on unmount.


## Lead status + follow-up reminders (Option A, 2026-06)
- **Statuses**: quotes = `new` / `contacted` / `booked`; applications = `new` / `contacted`. New submissions save with `status: "new"`; older records with no field are treated as new in both API queries and UI.
- **Admin UI** (`frontend/src/components/Admin.jsx`): status badge per card, one-tap `Mark contacted` / `Mark booked` / `Back to new` (optimistic update + rollback on failure), amber "Needs reply" flag + ring on quotes still `new` after 24h, and an **Awaiting reply** stat card (replaced "Total submissions").
- **Endpoints**: `PATCH /api/admin/quotes/{id}/status`, `PATCH /api/admin/applications/{id}/status` (validated, admin JWT), `POST /api/admin/reminders/run` (manual trigger).
- **Reminder engine** (`run_reminders()` + `_reminder_loop()` startup task): every `REMINDER_CHECK_MINUTES` (180) it emails support ONE branded digest of quotes still `new` past `REMINDER_AFTER_HOURS` (24), with name/city/service/age and tappable phone + email per lead and an Open Admin Dashboard CTA. Each lead is stamped `reminded_at` so it nags **once**; marking contacted/booked also stamps it. Restart-safe (no duplicate sends).
- Caveat: the loop lives in the backend process, so a restart resets the timer and a digest can fire late.
- Tested 2026-06 (iteration_2.json): backend 100% (10/10 pytest in `backend/tests/test_status_and_reminders.py`), frontend 100% (all Admin status flows, persistence, overdue flag, tab-specific buttons). Test/synthetic submissions cleaned out afterwards.


- Verified in preview 2026-06: quote + career application both logged "Support notification sent" and "Client confirmation sent". Needs redeploy for production.

## Open items / backlog
- **P0 (awaiting user)**: Pick a logo at `/brand`, then finalize it site-wide + regenerate favicon/OG.
- Instagram social URL still placeholder (`#`) in mock.js — replace or hide.
- Confirm production email delivery after redeploy (Google Workspace SMTP; support inbox + client confirmation).
- Terms & Conditions text is placeholder — needs legal-approved copy.
- Optional: city landing pages (Plano/Argyle) for local SEO; Google Business Profile work (business-side).

## Integrations
- MongoDB (Motor), FastAPI, Google Workspace SMTP (email delivery), Admin JWT (ADMIN_USERNAME/PASSWORD, JWT_SECRET in backend/.env — do not echo), Google review link, Facebook link, Unsplash imagery, Google Fonts.
