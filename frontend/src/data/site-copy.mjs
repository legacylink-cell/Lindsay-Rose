/* Single source of truth for the copy that is pre-rendered at build time.
   Imported by the React app AND by scripts/prerender.mjs, so the HTML a crawler
   receives can never drift from what a visitor sees. Plain ESM text only: no JSX,
   no icon components, so plain Node can import it during the build. */

export const HOME_COPY = {
  h1: ["We brighten your space.", "You get your time back."],
  intro:
    "Trusted, insured, eco-minded cleaning for homes and businesses across all of the Dallas\u2013Fort Worth Metroplex. Real people who treat your space with genuine care, not a faceless service.",
  badges: ["Bonded & insured", "Eco-friendly products", "Mon\u2013Fri, 8am\u20135pm"],
  sections: {
    services: {
      title: "Cleaning services for every corner of your life",
      body: "From weekly upkeep to a one-time deep clean, a move-out reset or your office, every visit follows the same detail-obsessed checklist, so nothing gets skipped.",
    },
    process: { title: "How it works", body: "Three simple steps from your first call to a brighter home." },
    areas: {
      title: "Proudly serving the Dallas\u2013Fort Worth Metroplex",
      body: "We focus on the popular Collin County communities of Plano, Frisco, McKinney, Allen, Celina and Prosper, plus Denton, Flower Mound, Grapevine and Fort Worth, where we are based and have long-standing relationships.",
    },
    reviews: { title: "Loved by neighbors across DFW", body: "Rated 5.0 from more than 65 five-star Google reviews." },
    faq: { title: "Questions, answered", body: "Everything you might want to know before booking your first clean." },
  },
};

export const RESIDENTIAL_SERVICES_COPY = [
  {
    title: "Recurring Cleaning",
    desc: "Weekly, biweekly, or monthly upkeep that keeps your home consistently fresh. Best value, never a contract.",
    tag: "Most popular",
  },
  {
    title: "Deep Cleaning",
    desc: "A thorough top-to-bottom reset, including baseboards, blinds, buildup and all. The perfect first visit.",
  },
  {
    title: "One-Time Cleaning",
    desc: "Hosting, a big event, or just need a refresh? A single spotless visit, whenever you need it.",
  },
  {
    title: "Move In / Move Out",
    desc: "Detailed cleaning for empty homes so you get your deposit back, or welcome a fresh start.",
  },
];

export const COMMERCIAL_SERVICES_COPY = [
  {
    title: "Offices & Workspaces",
    desc: "Reliable janitorial care that keeps your team healthy and your space presentable, day after day.",
  },
  {
    title: "Retail & Medical",
    desc: "Disinfection-focused cleaning that meets high-traffic and hygiene-sensitive standards.",
  },
  {
    title: "Post-Construction",
    desc: "Dust, debris, and detail work after a build or remodel. Turnover-ready in one visit.",
  },
];

export const PROCESS_COPY = [
  {
    step: "01",
    title: "Tell us about your space",
    desc: "Share a few details in our quick quote form, or call us. We listen first, because every home and office is different.",
  },
  {
    step: "02",
    title: "Get a clear, honest quote",
    desc: "A transparent estimate within 24 hours on weekdays. No pressure, no surprises, no hidden fees.",
  },
  {
    step: "03",
    title: "Relax, we brighten it",
    desc: "Our vetted, insured team arrives on time and treats your space like their own. 100% satisfaction guaranteed.",
  },
];

export const AREAS_COPY = [
  "Plano", "Frisco", "McKinney", "Allen", "Celina", "Prosper",
  "Denton", "Flower Mound", "Grapevine", "Fort Worth",
];

export const FAQS_COPY = [
  {
    q: "Do I need to be home during the cleaning?",
    a: "Not at all. Many clients provide a key or entry code. Our team is fully vetted, insured, and bonded, so your home is in trusted hands whether you're there or not.",
  },
  {
    q: "What products do you use?",
    a: "We bring everything we need, including strong, effective, non-toxic and biodegradable eco-friendly products that are safe for kids and pets.",
  },
  {
    q: "Why is the first cleaning different?",
    a: "In line with industry standards, your first visit is a deeper initial cleaning to remove built-up dust and grime and prepare your home for easy recurring upkeep.",
  },
  {
    q: "Am I locked into a contract?",
    a: "Never. Recurring clients get our best pricing with zero contracts. Adjust, pause, or cancel your schedule anytime.",
  },
  {
    q: "Which areas do you serve?",
    a: "We focus on the popular Collin County communities of Plano, Frisco, McKinney, Allen, Celina and Prosper, and also serve Denton, Flower Mound, Grapevine and Fort Worth, where we're based and have long-standing relationships. Don't see your city? Just ask, we're happy to check.",
  },
  {
    q: "Do you serve commercial spaces?",
    a: "Yes. We clean offices, retail, medical suites, and post-construction sites across the DFW metroplex, with day or after-hours scheduling.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We back every visit with a 100% satisfaction guarantee. If something isn't right, tell us within 24 hours and we'll make it right, free of charge.",
  },
];

export const SERVICE_PAGES = {
  "recurring-house-cleaning": {
    name: "Recurring House Cleaning",
    metaTitle: "Recurring House Cleaning in DFW | Weekly, Biweekly & Monthly",
    metaDescription:
      "Reliable recurring house cleaning across the Dallas–Fort Worth metroplex. Weekly, biweekly or monthly visits from the same trusted, background-checked team. Get a free quote.",
    tagline: "Weekly, biweekly & monthly upkeep",
    intro:
      "Keep your home consistently spotless with recurring house cleaning from Bright at Home Cleaning. You get the same trusted, background-checked team on a schedule that fits your life, so your home stays fresh without you lifting a finger.",
    included: [
      "Dusting of all reachable surfaces, sills & fixtures",
      "Kitchen: counters, exterior appliances, sink & floors",
      "Bathrooms: toilets, showers, tubs, mirrors & floors",
      "Vacuuming and mopping of all floors",
      "Trash removal and general tidying",
      "The same crew every visit for consistency",
    ],
    idealFor:
      "Busy families and professionals who want a reliably clean home every week or two without the hassle of managing it themselves.",
    faqs: [
      { q: "How often should I schedule recurring cleaning?", a: "Most clients choose weekly or biweekly. We'll recommend a cadence based on your home size, pets, and lifestyle during your free quote." },
      { q: "Do I get the same cleaners each time?", a: "Yes, we intentionally send the same trusted, background-checked team so they get to know your home and preferences." },
    ],
  },
  "deep-cleaning": {
    name: "Deep Cleaning Services",
    metaTitle: "Deep Cleaning Services in DFW | Top-to-Bottom Home Reset",
    metaDescription:
      "Professional deep cleaning services in Denton, Plano, Frisco & across DFW. A meticulous top-to-bottom reset of your home. Bonded, insured & eco-friendly. Free quote.",
    tagline: "The thorough top-to-bottom reset",
    intro:
      "Our deep cleaning is the detailed, top-to-bottom reset your home deserves, reaching the build-up and hidden spots regular cleaning misses. It's the perfect starting point before recurring service, or a refresh whenever your home needs it.",
    included: [
      "Everything in a standard clean, done more intensively",
      "Baseboards, door frames, and detailed dusting",
      "Inside microwave and exterior of all appliances",
      "Cabinet fronts, switch plates & light fixtures",
      "Detailed bathroom scrubbing: grout, tile & fixtures",
      "Edge-to-edge vacuuming and hand-detailed corners",
    ],
    idealFor:
      "First-time clients, seasonal refreshes, homes that haven't had a professional clean in a while, or anyone wanting a truly deep, detailed result.",
    faqs: [
      { q: "How long does a deep clean take?", a: "It depends on the size and condition of your home. A deep clean typically takes longer than a standard visit. We'll give you a clear estimate with your free quote." },
      { q: "Should I get a deep clean before recurring service?", a: "Yes, we recommend starting with a deep clean so recurring visits can keep your home effortlessly maintained." },
    ],
  },
  "one-time-house-cleaning": {
    name: "One-Time House Cleaning",
    metaTitle: "One-Time House Cleaning in DFW | No Contract, No Commitment",
    metaDescription:
      "Need a one-time house cleaning in the Dallas–Fort Worth area? Perfect for special occasions or a quick reset. No contracts, no commitment. Get your free quote today.",
    tagline: "A fresh clean, exactly when you need it",
    intro:
      "Sometimes you just need a great clean once, whether before guests arrive, after a party, or simply to reset. Our one-time house cleaning gives you a professional, thorough result with no contracts and no commitment.",
    included: [
      "Full clean of kitchens and bathrooms",
      "Dusting, vacuuming and mopping throughout",
      "Surfaces, fixtures and mirrors wiped down",
      "Trash removal and tidying",
      "Optional add-ons like inside oven or fridge",
      "Flexible scheduling around your event",
    ],
    idealFor:
      "Special occasions, pre- or post-event cleanups, holidays, or anyone who wants a one-off professional clean without an ongoing plan.",
    faqs: [
      { q: "Is there a contract for one-time cleaning?", a: "None at all. One-time cleaning is exactly that: book it when you need it, with no ongoing commitment." },
      { q: "Can I add extras like inside the oven or fridge?", a: "Absolutely. Just let us know when you request your quote and we'll include them." },
    ],
  },
  "move-in-move-out-cleaning": {
    name: "Move-In / Move-Out Cleaning",
    metaTitle: "Move-In / Move-Out Cleaning in DFW | Move Cleaning Services",
    metaDescription:
      "Move-in and move-out cleaning services across DFW. Leave your old place spotless or start fresh in a truly clean new home. Great for renters, buyers & sellers. Free quote.",
    tagline: "Start fresh, or leave it spotless",
    intro:
      "Moving is stressful enough. Whether you're handing back keys or settling into a new place, our move-in / move-out cleaning delivers a spotless, top-to-bottom result on empty rooms, helping renters protect deposits and buyers start fresh.",
    included: [
      "Detailed clean of empty rooms, top to bottom",
      "Inside cabinets, drawers and closets",
      "Inside oven, fridge and microwave",
      "Baseboards, doors, switch plates & fixtures",
      "Full bathroom and kitchen sanitizing",
      "Floors vacuumed and mopped throughout",
    ],
    idealFor:
      "Renters wanting their deposit back, landlords turning over units, and home buyers or sellers who want the property truly move-ready.",
    faqs: [
      { q: "Do you clean inside cabinets and appliances?", a: "Yes, move-in/move-out cleaning includes inside cabinets, drawers, closets, and appliances since the home is typically empty." },
      { q: "Can you work with my closing or lease-end date?", a: "We build the schedule around your move dates, so just share them when you request your quote." },
    ],
  },
  "commercial-cleaning": {
    name: "Commercial Cleaning",
    metaTitle: "Commercial Cleaning in DFW | Offices, Retail & Medical",
    metaDescription:
      "Professional commercial cleaning across the Dallas–Fort Worth metroplex: offices, retail, medical suites & post-construction. Day or after-hours scheduling. Free quote.",
    tagline: "Spotless workspaces that keep business moving",
    intro:
      "A clean, healthy workspace makes a real impression on your clients and team. Bright at Home Cleaning provides dependable commercial cleaning across DFW, with flexible day or after-hours scheduling built around your operation.",
    included: [
      "Offices, workspaces and common areas",
      "Retail floors and customer-facing spaces",
      "Medical suites with appropriate sanitizing",
      "Restrooms, breakrooms and kitchens",
      "Post-construction cleanup",
      "Custom scopes & supply management",
    ],
    idealFor:
      "Offices, retail stores, medical and dental practices, property managers, and post-construction sites that need a reliable, professional cleaning partner.",
    faqs: [
      { q: "Do you clean after business hours?", a: "Yes, we offer day or after-hours scheduling so cleaning never disrupts your operation." },
      { q: "Can you handle post-construction cleanup?", a: "We do. We handle fine dust, debris removal, and detailed finishing so your space is client-ready." },
    ],
  },
};
