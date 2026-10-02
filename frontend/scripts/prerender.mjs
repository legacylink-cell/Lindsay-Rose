#!/usr/bin/env node
/* Build-time pre-render.
 *
 * A crawler that does not run JavaScript used to receive an empty shell: ~11 words
 * and no <h1>. This renders the real headline, body copy and footer for every route
 * into build/<route>/index.html using the SAME copy module the React app imports,
 * so the two can never drift.
 *
 * Pure Node on purpose: a headless-Chrome step would silently skip in any build
 * image without Chromium, which is exactly where this needs to run.
 *
 * Runs automatically via the "postbuild" script. Also writes sitemap.xml from the
 * same route list, so the sitemap and the pre-rendered routes stay in lockstep.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  HOME_COPY, RESIDENTIAL_SERVICES_COPY, COMMERCIAL_SERVICES_COPY, PROCESS_COPY,
  AREAS_COPY, FAQS_COPY, SERVICE_PAGES,
} from "../src/data/site-copy.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(HERE, "..", "build");
const ORIGIN = "https://brightathomecleaning.com";
const PHONE = "469-443-6903";
const MARKER = "prerendered";

const HOME_DESCRIPTION =
  "Trusted, insured house and commercial cleaning in Plano, Frisco, McKinney and across DFW. Same vetted team every visit. Call 469-443-6903 for a free quote.";

const CAREERS_DESCRIPTION =
  "Now hiring house cleaners in Plano, Frisco, McKinney, Denton and across DFW. Competitive pay plus tips, flexible scheduling, most weekends off and paid training. Apply today, no experience required.";

const BLESSING_DESCRIPTION =
  "Each month Bright at Home Cleaning gifts one complimentary home cleaning to a DFW neighbor walking through a hard season. Nominate a neighbor, a friend, or yourself.";

/* The one list that matters. Never crawl: a missed link must never silently
   drop a page from either the pre-render or the sitemap. */
export const ROUTES = [
  { path: "/", title: "Bright at Home Cleaning | A Brighter Home. A Better Day.",
    description: HOME_DESCRIPTION, priority: "1.0", changefreq: "weekly", render: renderHome },
  ...Object.entries(SERVICE_PAGES).map(([slug, svc]) => ({
    path: `/services/${slug}`, title: svc.metaTitle, description: svc.metaDescription,
    priority: "0.9", changefreq: "monthly", render: () => renderService(slug, svc),
  })),
  { path: "/careers", title: "Cleaning Jobs in DFW | Now Hiring House Cleaners | Bright at Home Cleaning",
    description: CAREERS_DESCRIPTION, priority: "0.7", changefreq: "monthly", render: renderCareers },
  { path: "/bright-blessing", title: "Bright Blessing of the Month | Nominate a DFW Home | Bright at Home Cleaning",
    description: BLESSING_DESCRIPTION, priority: "0.5", changefreq: "monthly",
    render: renderBlessing, noindex: true, sitemap: false },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ul = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const faqBlock = (faqs) =>
  faqs.map((f) => `<section><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></section>`).join("");

function renderHome() {
  const { h1, intro, badges, sections } = HOME_COPY;
  return `
<h1>${esc(h1.join(" "))}</h1>
<p>${esc(intro)}</p>
${ul(badges)}
<section><h2>${esc(sections.services.title)}</h2><p>${esc(sections.services.body)}</p>
${[...RESIDENTIAL_SERVICES_COPY, ...COMMERCIAL_SERVICES_COPY]
    .map((s) => `<article><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></article>`).join("")}
</section>
<section><h2>${esc(sections.process.title)}</h2><p>${esc(sections.process.body)}</p>
${PROCESS_COPY.map((p) => `<article><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></article>`).join("")}
</section>
<section><h2>${esc(sections.areas.title)}</h2><p>${esc(sections.areas.body)}</p>${ul(AREAS_COPY)}</section>
<section><h2>${esc(sections.faq.title)}</h2><p>${esc(sections.faq.body)}</p>${faqBlock(FAQS_COPY)}</section>`;
}

function trustBlock() {
  return `
<section><h2>Why neighbors across DFW choose Bright at Home Cleaning</h2>
${ul(["Bonded and insured, with every cleaner background-checked before they set foot in your home",
      "The same vetted team on every visit, so they learn your home and your preferences",
      "Eco-friendly products that are safe around children and pets",
      "Flat, transparent pricing with no surprises and no long-term contract",
      "A 100% satisfaction guarantee: if something is missed, we come back and make it right, free of charge"])}
<p>Rated 5.0 from more than 65 five-star Google reviews across the Dallas\u2013Fort Worth metroplex.</p>
</section>
<section><h2>${esc(HOME_COPY.sections.process.title)}</h2><p>${esc(HOME_COPY.sections.process.body)}</p>
${PROCESS_COPY.map((p) => `<article><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></article>`).join("")}
</section>`;
}

function renderService(slug, svc) {
  return `
<h1>${esc(svc.name)}</h1>
<p>${esc(svc.tagline)}</p>
<p>${esc(svc.intro)}</p>
<section><h2>What's included</h2>${ul(svc.included)}</section>
<section><h2>Ideal for</h2><p>${esc(svc.idealFor)}</p></section>
${trustBlock()}
<section><h2>Areas we serve</h2><p>${esc(HOME_COPY.sections.areas.body)}</p>${ul(AREAS_COPY)}</section>
<section><h2>${esc(svc.name)} questions</h2>${faqBlock(svc.faqs)}</section>
<section><h2>Get a free quote</h2><p>Call or text ${PHONE} for a free, no-obligation quote on ${esc(svc.name.toLowerCase())} anywhere in the Dallas\u2013Fort Worth metroplex. Most quotes come back the same business day.</p></section>`;
}

function renderCareers() {
  return `
<h1>Join the Bright at Home Cleaning team</h1>
<p>We are hiring house cleaners and commercial cleaners across the Dallas\u2013Fort Worth metroplex, including Plano, Frisco, McKinney, Allen, Denton, Flower Mound, Grapevine and Fort Worth.</p>
<section><h2>Why people stay</h2>
${ul(["Competitive pay plus tips", "Flexible scheduling, most weekends off", "Paid training and all supplies provided",
      "W-2 or 1099, your choice", "A bilingual operations director, so there is no language barrier",
      "Mileage between homes and a supportive, faith-driven team"])}
</section>
<section><h2>What we look for</h2>
<p>Dependability first. If you show up when you say you will, treat homes with care and take pride in the details, we will train you. No experience required.</p>
${ul(["Reliable transportation", "Able to pass a background check", "Comfortable working in client homes", "A positive, respectful attitude"])}
</section>
<section><h2>Three ways to apply</h2>
<p>Fill out the application on this page, call or text us at ${PHONE}, or email support@brightathomecleaning.com. We read every application.</p>
</section>
<section><h2>What the work looks like</h2>
<p>Most days you will clean two to four homes with a small, consistent team. A standard visit covers dusting, kitchens, bathrooms, vacuuming and mopping, following the same detailed checklist every time so nothing gets skipped. Deep cleans and move-out cleans take longer and pay accordingly.</p>
${ul(["Daytime hours, Monday through Friday, 8am to 5pm",
      "All cleaning products and equipment provided, so there is nothing to buy",
      "Paid training before your first solo home",
      "Steady, repeat clients rather than a new address every day"])}
</section>
<section><h2>Where we hire</h2>
<p>We hire across the Dallas\u2013Fort Worth metroplex and try to schedule you close to home.</p>
${ul(AREAS_COPY)}
</section>
<section><h2>About Bright at Home Cleaning</h2>
<p>We are a family-run, faith-driven cleaning company serving homes and businesses across DFW. We are bonded and insured, every cleaner is background-checked, and we are rated 5.0 from more than 65 five-star Google reviews. We treat our team the way we treat our clients: with honesty, respect and genuine care.</p>
</section>`;
}

function renderBlessing() {
  return `
<h1>Bright Blessing of the Month</h1>
<p>One home made bright.</p>
<p>Every month, Bright at Home Cleaning gifts one complimentary home cleaning to a Dallas\u2013Fort Worth neighbor walking through a hard season such as illness, grief, caregiving, a new baby, job loss or recovery after surgery. Nominate a neighbor, a friend, a church member, or yourself.</p>
<section><h2>How it works</h2>
${ul(["Nominate someone and tell us about the season they are walking through. The story stays private with our team.",
      "Our owners and Operations Director prayerfully select one DFW home each month and confirm the family wants it. This is a selected blessing, not a random drawing.",
      "We clean it at no cost: living areas, kitchen, baths and floors, gifted free."])}
</section>
<section><h2>A thank-you for noticing someone</h2>
<p>Submit a complete nomination and you will receive $25 off your first cleaning if you would like Bright at Home in your own house. New customers, one per household, good for 60 days.</p>
</section>
<section><h2>Who can be nominated</h2>
<p>Any household inside our Dallas\u2013Fort Worth service area. Most nominations come from neighbors, church families and coworkers who have watched someone carry a heavy season quietly.</p>
${ul(["A family navigating illness, surgery or treatment",
      "A caregiver looking after a parent, spouse or child",
      "A household grieving a loss",
      "New parents in the first exhausting months",
      "Someone recovering from a job loss or a hard transition"])}
<p>One blessing is awarded each month, one free clean per household per year, inside our service area only.</p>
</section>
<section><h2>About Bright at Home Cleaning</h2>
<p>We are a family-run, faith-driven cleaning company serving homes and businesses across the Dallas\u2013Fort Worth metroplex. Bonded, insured and rated 5.0 from more than 65 five-star Google reviews. This program is simply how we put that faith into action in our own backyard.</p>
</section>`;
}

function footer() {
  return `
<footer>
<h2>Bright at Home Cleaning</h2>
<p>A brighter home, a brighter life. Bonded, insured and obsessed with the details, for homes and businesses across the Dallas\u2013Fort Worth metroplex.</p>
<p>Call or text <a href="tel:+14694436903">${PHONE}</a> or email <a href="mailto:support@brightathomecleaning.com">support@brightathomecleaning.com</a>. Open Mon\u2013Fri, 8am\u20135pm.</p>
<nav><h3>Services</h3><ul>${Object.entries(SERVICE_PAGES)
    .map(([slug, s]) => `<li><a href="/services/${slug}">${esc(s.name)}</a></li>`).join("")}</ul></nav>
<nav><h3>Company</h3><ul>
<li><a href="/">Home</a></li><li><a href="/#how-it-works">How it works</a></li>
<li><a href="/#areas">Areas we serve</a></li><li><a href="/#reviews">Reviews</a></li>
<li><a href="/careers">Careers</a></li></ul></nav>
<nav><h3>Follow us</h3><ul>
<li><a href="https://www.facebook.com/brightathomecleaning/">Facebook</a></li>
<li><a href="https://www.instagram.com/brightathomecleaning_/">Instagram</a></li></ul></nav>
<p>&copy; ${new Date().getFullYear()} Bright at Home Cleaning. All rights reserved.</p>
</footer>`;
}

/* Re-running the script must be safe: strip any artifacts of an earlier pass so
   the shell is always pristine (otherwise the marker class and the injected
   markup stack up). */
function pristineShell(html) {
  return html
    .replace(/<html((?:\s+class="prerendered")+)/, "<html")
    .replace(/<style id="prerender-guard">[\s\S]*?<\/noscript>/g, "")
    .replace(/(<div id="root">)[\s\S]*?(<\/div>\s*<\/body>)/, "$1$2");
}

/* The injected markup is deliberately class-free, so with the app's stylesheet it
   still looks like a plain text document. Humans must never see that: the hide
   rule is unconditional (not tied to the <html> marker) so no ordering of
   script execution can ever paint it. The <noscript> block puts it back for
   anyone browsing without JavaScript. */
const PRERENDER_GUARD =
  `<style id="prerender-guard">` +
  `html.prerendered body{background:#FFFEF9}` +
  `[data-prerendered]{position:absolute!important;width:1px;height:1px;` +
  `overflow:hidden;clip-path:inset(50%);white-space:nowrap}` +
  `</style>` +
  `<noscript><style>` +
  `#prerender-splash{display:none!important}` +
  `[data-prerendered]{position:static!important;width:auto;height:auto;` +
  `overflow:visible;clip-path:none;white-space:normal;max-width:46rem;margin:0 auto;` +
  `padding:2.5rem 1.25rem;line-height:1.65}` +
  `</style></noscript>`;

/* Shown for the few hundred milliseconds before React paints. It lives inside
   #root, so React clears it on mount with no extra code. */
const SPLASH =
  `<div id="prerender-splash" style="position:fixed;inset:0;display:flex;align-items:center;` +
  `justify-content:center;background:#FFFEF9;color:#1E4634;font-family:'Cormorant Garamond',Georgia,serif;` +
  `font-size:26px;letter-spacing:0.06em">Bright at Home Cleaning</div>`;

function applyHead(html, route) {
  const url = route.path === "/" ? `${ORIGIN}/` : `${ORIGIN}${route.path}`;
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(route.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(route.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(route.description)}$2`);
  if (route.noindex) {
    out = out.replace(/(<meta name="robots" content=")[^"]*(")/, "$1noindex, nofollow$2");
  }
  out = out.replace("</head>", `${PRERENDER_GUARD}</head>`);
  return out.replace("<html", `<html class="${MARKER}"`);
}

function writeRoute(shell, route) {
  const body = `${route.render()}${footer()}`;
  const html = applyHead(shell, route).replace(
    /(<div id="root">)(<\/div>)/,
    // Function form on purpose: the copy contains "$25", and a string replacement
    // would read that as a capture-group reference and corrupt the markup.
    (_m, open, close) => `${open}<div data-prerendered="true">${body}</div>${SPLASH}${close}`
  );
  const dir = route.path === "/" ? BUILD : path.join(BUILD, route.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const h1s = (body.match(/<h1/g) || []).length;
  return { words, h1s };
}

function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const entries = ROUTES.filter((r) => r.sitemap !== false).map((r) => {
    const loc = r.path === "/" ? `${ORIGIN}/` : `${ORIGIN}${r.path}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
           `    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(BUILD, "sitemap.xml"), xml);
  // Keep the source copy identical so a plain build without this step is still correct.
  fs.writeFileSync(path.join(HERE, "..", "public", "sitemap.xml"), xml);
  return entries.length;
}

function main() {
  const shellPath = path.join(BUILD, "index.html");
  if (!fs.existsSync(shellPath)) {
    console.error("prerender: build/index.html missing. Run the build first.");
    process.exit(1);
  }
  const shell = pristineShell(fs.readFileSync(shellPath, "utf8"));
  console.log("prerender: writing %d routes", ROUTES.length);
  for (const route of ROUTES) {
    const { words, h1s } = writeRoute(shell, route);
    const file = route.path === "/" ? "index.html" : `${route.path.slice(1)}/index.html`;
    console.log(`  ${file.padEnd(46)} h1=${h1s} words=${words}`);
  }
  console.log("prerender: sitemap.xml written with %d urls", writeSitemap());
}

main();
