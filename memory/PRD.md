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







## Build-time pre-rendering (2026-10-01)
Problem: the served HTML was an empty CRA shell. A crawler without JS got ~11 words and no `<h1>`.
- **`frontend/scripts/prerender.mjs`** runs as `postbuild` (`node scripts/prerender.mjs`, also available as `yarn prerender`). It reads the freshly built `build/index.html` (so asset hashes are always correct), injects real markup into `<div id="root">`, rewrites title/description/canonical/og per route, and writes `build/<route>/index.html`.
- **PURE NODE, deliberately.** The brief asked for headless Chrome, but neither the pod nor the build image has Chromium, so a Chrome step would silently skip exactly where it must run. The script instead renders from a shared copy module. If anyone adds Chromium later, this remains valid.
- **`frontend/src/data/site-copy.mjs`** is the single source of truth: `HOME_COPY`, `*_COPY` lists moved out of `mock.js`, and `SERVICE_PAGES` moved out of `ServicePage.jsx`. `mock.js` re-exports them and re-attaches lucide icons **by array position** (order matters, see its comment). The React app and the pre-render import the same text, so they cannot drift.
- **Explicit `ROUTES` list** in the script, never crawled. `sitemap.xml` is generated from that same list into both `build/` and `public/` (7 urls; `/bright-blessing` carries `sitemap: false` + `noindex: true` while it stays private).
- **Idempotent**: `pristineShell()` strips the marker class and any prior injected markup, so re-running never stacks attributes. (Caught after a double run produced `class="prerendered" class="prerendered"`.)
- **Invisible-HTML guard**: generated files put `class="prerendered"` on `<html>`; `index.css` forces `.reveal` to `opacity: 1 / transform: none / animation: none` under that marker, and `src/index.js` removes the marker before React's first paint so visitors still get the animations. The generated markup also never uses `.reveal`, so it is belt-and-braces.
- Homepage meta description cut from 238 to **155 chars**, ending on "Call 469-443-6903 for a free quote." Updated in `public/index.html` (description + og + twitter) and `App.js` `HOME_DESCRIPTION`.
- Verified locally on a real `yarn build`: every one of the 8 routes has exactly **1 `<h1>`** and **450-660 words** of real copy with tags stripped (acceptance asked for 300+), titles 56-76 chars, descriptions 155-198.
- **UNVERIFIED, needs a post-deploy check**: whether the production static host serves `build/services/<slug>/index.html` for that path or always falls back to `build/index.html`. The homepage is correct either way. Check with `curl -s https://brightathomecleaning.com/services/deep-cleaning | grep -c "<h1"`.

## Dark-mode native control flash (2026-10-01)
- Symptom (reported on production): opening the relationship dropdown on `/bright-blessing` flashed solid black for about a second before the options appeared.
- Root cause: nothing declared a colour scheme, so `getComputedStyle(document.documentElement).colorScheme` was `normal`. On a device in OS dark mode the browser paints native controls (select popups, date pickers, scrollbars) with its DARK user-agent palette first, then repaints. Not a React or data bug.
- Fix: `html { color-scheme: light; }` plus explicit `background-color`/`color` on `select`, `option` and `optgroup` in `frontend/src/index.css`, and `<meta name="color-scheme" content="light">` in `public/index.html` so the browser knows before CSS parses.
- Applies site-wide, so it also covers the Service dropdown on the quote form and the Position dropdown on Careers.
- Verified with Playwright `emulate_media(color_scheme="dark")`: root scheme now reports `light` and select/option backgrounds are white on `/bright-blessing`, `/` and `/careers`.
- NOTE: `public/index.html` does not hot reload; restart the frontend after editing it.

## COPY RULE: no em dashes, ever (2026-10-01)
Client instruction, verbatim: "remove all hem dashed from the site. we should never have any hem dashes now or in the future."
- All 107 em dashes removed from `frontend/src`, `frontend/public` and `backend/server.py`. Each one was rewritten by hand with natural punctuation (comma, colon, period, parentheses or a rephrase) rather than swapped for a hyphen, so the copy still reads properly.
- Covered the literal `—`, the escaped `\u2014` form in JS strings and Python string literals, and HTML entities.
- Email-field placeholders that used `—` for a blank value now read "Not provided" (and `_reminder_message` compares against that string).
- **ENFORCED BY TEST**: `backend/tests/test_no_em_dashes.py` scans `frontend/src`, `frontend/public` and `backend` for `—`, `\u2014`, `&mdash;`, `&#8212;`, `&#x2014;` and fails with file:line if any appear. **When writing ANY future copy, use commas/colons/periods instead; the suite will fail otherwise.**
- NOTE: en dashes (`–`) were deliberately left alone, e.g. "Dallas–Fort Worth" and "Mon–Fri", since the request was specifically about em dashes. Ask before changing those.
- Tests: 69/69 pass. Verified 0 em dashes in the rendered text and page titles of the homepage, a service page, Careers and Bright Blessing.
- Also fixed while here: the older pytest files now send a unique `X-Forwarded-For` per submission (the suite previously shared one rate-limit bucket and tripped the new burst filter), and the timing-trap test is scoped to its own marker so parallel tests don't break it.

## Spam filtering, nominator export, blessing announcements (2026-10-01)
### Spam protection (all three public forms, no visible captcha)
- `_screen_submission(request, body, *texts)` gates `/api/quotes`, `/api/applications`, `/api/nominations`. Layers: honeypot `company`; timing trap (`elapsed_ms` < `MIN_FORM_SECONDS`=2.5s → dropped as bot); per-visitor burst check; `_spam_check()` content heuristics (>=2 links, >=2 pitch phrases from `_SPAM_PHRASES`, or 1 phrase + 1 link).
- **Design rule: only bots are discarded.** Anything a human might have sent is STORED with `spam: true` + `spam_reason` and simply not emailed, so it stays visible and restorable — never lost.
- `_client_ip()` reads `cf-connecting-ip` / `x-real-ip` / `x-forwarded-for` before `request.client.host`. **This was a genuine bug caught in testing**: behind the ingress every visitor shared ONE rate-limit bucket, so real leads would have been dropped site-wide after 4 submissions. `RATE_LIMIT_MAX`=6 per `RATE_LIMIT_WINDOW_SECONDS`=600 per real IP.
- Spam docs are excluded from `delivery_health` undelivered counts and from `retry_failed_deliveries()`.
- `POST /api/admin/{kind}s/{id}/not-spam` clears the flag and dispatches the email. Admin UI: collapsible `spam-group` with `not-spam-{id}`; flagged items never appear in the main list.
- Frontend: `QuoteForm`, `Careers` and `BrightBlessing` all send `elapsed_ms` from a mount-time ref.

### Nominator CSV export
- `GET /api/admin/nominations/export?cycle=YYYY-MM` (admin JWT) → `text/csv` attachment, 11 columns incl. "Wants $25 code", spam rows excluded. Admin UI button `export-nominators` (fetch + blob download, since the header can't ride on a plain link).

### "Homes we've blessed" announcements
- `announcements` collection. Public `GET /api/announcements` returns published entries only. Admin `GET/POST/PATCH ?published=/DELETE /api/admin/announcements`.
- **Playbook privacy rule enforced server-side**: `first_name` is split and only the first token stored, so a full name can never leak. Note capped at 280 chars; the story itself is never shown.
- Entries start as drafts (`published: false`). Admin panel `announcements-panel` can add/toggle/delete; toggle is optimistic (fixed a double-click staleness bug flagged in review).
- Public section `blessings-honored` on `/bright-blessing` renders only when at least one entry is published.

- Tested 2026-10-01 (iteration_5.json + follow-ups): **64/64 pytest** incl. the new `tests/test_spam_export_announcements.py`; verified 8 leads from 8 distinct IPs are all stored unflagged (no false positives), a 2-link sales pitch is flagged and silent, bot-speed submissions vanish, and a genuine lead still emails. Test data cleaned, announcements cleared, publish toggle left OFF.

## Bright Blessing of the Month — nomination form (2026-10-01)
Source: client playbook PDF (`Bright-Blessing-of-the-Month-Team-Playbook`). Agent owns the "Mo (website)" items only: §5 build the form + alert on submission, §6 the required fields. Legal framing is FIXED by the playbook — always "nominate / select / bless / gift / complimentary / faith in action", NEVER "enter to win / sweepstakes / raffle / random drawing / giveaway".
- **Page**: `frontend/src/pages/BrightBlessing.jsx` at route `/bright-blessing` (hero, "How it works" 3 steps, $25 thank-you note, form, privacy fine print). Brand-consistent with the rest of the site, `Footer` reused.
- **All §6 fields**: nominator name/phone/email/city; relationship (Neighbor/Family/Church/Myself/Other); nominee name, city-or-ZIP, optional phone; "why this home" textarea; 3 checkboxes — permission to contact, "selected blessing, not a random drawing" (REQUIRED, enforced client + server), "$25-off" opt-in. Honeypot `company` field.
- **Hidden-by-default publishing**: `settings` collection doc `{id: "site", nominations_live: bool}`. `GET /api/site-settings` (public) exposes the flag + cycle; `PATCH /api/admin/site-settings` (admin JWT) toggles it. While OFF: no header/mobile/footer/homepage links, `noindex, nofollow` robots meta, and an amber "Private preview" strip on the page. While ON: header nav "Bright Blessing", footer "Bright Blessing of the Month", homepage `BlessingTeaser` section, robots restored.
- **Admin**: third "Nominations" tab + publish panel with Preview link and Publish/Hide button. Statuses `new/reviewing/selected/not_selected`. Nomination cards use `normalize(item, tab)` since the shape differs from quotes/applications. Same delivery tracking, resend and retry safety net.
- **Cycle is automatic** (`nomination_cycle()`): open the 1st–15th America/Chicago, closed after; closed state shows "next round opens <date>". No manual date editing.
- **NO auto thank-you email to nominators** — `dispatch_lead()` passes `client_kind=None` for nominations because Operations (Mayra) sends BRIGHT25 manually. Support notification still goes to FORWARD_EMAIL.
- Fixed while building: `usePageHead`'s noindex cleanup was deleting the shell's global `robots` meta; it now captures and restores the previous value.
- Tested 2026-10-01 (iteration_4.json): 15/15 new nomination pytest + 48/48 total suite; Playwright verified hidden-state (zero links anywhere, noindex), form validation, submission, admin tab + all status transitions, and the publish toggle flipping public links on and off. Toggle left OFF. Test data cleaned.
- **PENDING when the user approves going public**: add `/bright-blessing` to `frontend/public/sitemap.xml` (deliberately omitted while private).

## Health panel + watchdog (2026-09-29)
- Admin health panel is now ALWAYS visible with three explicit channel rows (email / phone alerts / delivery backlog) and a `data-health` attribute of `healthy` | `warning` | `error`:
  - **green** (`ShieldCheck`, brand sage): everything working — "All lead alerts are working".
  - **amber**: only the optional phone channel is missing.
  - **red**: email broken (missing creds or rejected sign-in) or undelivered backlog > 0.
- Panel self-refreshes every 60s (`delivery-health` poll), so a channel fixed in Secrets turns the panel green without a manual reload.
- **Watchdog** (`watchdog_check()` + `_watchdog_loop()`, every `WATCHDOG_MINUTES`=15): detects a channel going from healthy → broken and warns through the SURVIVING channel — email outage → Telegram message; Telegram outage → email to FORWARD_EMAIL. Fires only on the transition, never repeats. Module-level `_channel_state` holds the previous state.
- Stat tiles switched from `font-serif` to `tabular-nums` (the serif face rendered "1" as "I").
- 33/33 pytest still pass; green state verified in-browser by temporarily setting Telegram env values (reverted afterwards).
- **PRODUCTION STATUS 2026-09-29**: owner's production screenshot showed red banner — `smtp_login_ok: false` and **21 real leads undelivered** (earliest seen 9/26 Nicole Wilhelm). Production Secrets still hold the REVOKED app password. Once `SMTP_APP_PASSWORD` is updated in Secrets + re-published, the retry sweep delivers the whole backlog automatically within ~10 min. Preview is healthy.

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
