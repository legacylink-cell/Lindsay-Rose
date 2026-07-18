// MOCK DATA for Brightleaf Cleaning Co. (frontend-only teaser).
// NOTE: Testimonials and quote submissions are MOCKED for now.

import {
  Sparkles, Home, Repeat, Truck, Building2, Wrench,
} from "lucide-react";

export const BRAND = {
  name: "Brightleaf",
  full: "Brightleaf Cleaning Co.",
  tagline: "Home & commercial cleaning, done with care — across DFW.",
  phone: "469-443-6903",
  phoneHref: "tel:+14694436903",
  email: "hello@brightleafcleaning.com",
  hours: "Mon–Fri, 9am–5pm",
  area: "Dallas–Fort Worth Metroplex",
};

export const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Areas", href: "#areas" },
  { label: "Reviews", href: "#reviews" },
  { label: "About", href: "#about" },
];

export const IMAGES = {
  heroLiving: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxicmlnaHQlMjBjbGVhbiUyMGxpdmluZyUyMHJvb218ZW58MHx8fHwxNzg0MzgwMzI4fDA&ixlib=rb-4.1.0&q=85",
  livingSofa: "https://images.unsplash.com/photo-1615800002234-05c4d488696c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxicmlnaHQlMjBjbGVhbiUyMGxpdmluZyUyMHJvb218ZW58MHx8fHwxNzg0MzgwMzI4fDA&ixlib=rb-4.1.0&q=85",
  kitchen: "https://images.unsplash.com/photo-1713514374038-656f7bbde9db?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHw0fHxzdW5saXQlMjBraXRjaGVufGVufDB8fHx8MTc4NDM4MDMyOXww&ixlib=rb-4.1.0&q=85",
  bedroomPlants: "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYmVkcm9vbXxlbnwwfHx8fDE3ODQzODAzMjh8MA&ixlib=rb-4.1.0&q=85",
  bedroom: "https://images.unsplash.com/photo-1541004995602-b3e898709909?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxjb3p5JTIwYmVkcm9vbXxlbnwwfHx8fDE3ODQzODAzMjh8MA&ixlib=rb-4.1.0&q=85",
  cleanerGlass: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBjbGVhbmVyJTIwd29ya2luZ3xlbnwwfHx8fDE3ODQzODAzNjZ8MA&ixlib=rb-4.1.0&q=85",
  cleanerTeam: "https://images.pexels.com/photos/6195274/pexels-photo-6195274.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  cleanerVacuum: "https://images.pexels.com/photos/6196694/pexels-photo-6196694.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  cleaningStove: "https://images.pexels.com/photos/9462314/pexels-photo-9462314.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  cleaningSink: "https://images.unsplash.com/photo-1556910638-6cdac31d44dc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHw0fHxjbGVhbmluZyUyMGtpdGNoZW58ZW58MHx8fHwxNzg0MzgwMzY1fDA&ixlib=rb-4.1.0&q=85",
};

export const RESIDENTIAL_SERVICES = [
  {
    icon: Repeat,
    title: "Recurring Cleaning",
    desc: "Weekly, biweekly, or monthly upkeep that keeps your home consistently fresh. Best value, never a contract.",
    tag: "Most popular",
  },
  {
    icon: Sparkles,
    title: "Deep Cleaning",
    desc: "A thorough top-to-bottom reset — baseboards, blinds, buildup and all. The perfect first visit.",
  },
  {
    icon: Home,
    title: "One-Time Cleaning",
    desc: "Hosting, a big event, or just need a refresh? A single spotless visit, whenever you need it.",
  },
  {
    icon: Truck,
    title: "Move In / Move Out",
    desc: "Detailed cleaning for empty homes so you get your deposit back — or welcome a fresh start.",
  },
];

export const COMMERCIAL_SERVICES = [
  {
    icon: Building2,
    title: "Offices & Workspaces",
    desc: "Reliable janitorial care that keeps your team healthy and your space presentable, day after day.",
  },
  {
    icon: Sparkles,
    title: "Retail & Medical",
    desc: "Disinfection-focused cleaning that meets high-traffic and hygiene-sensitive standards.",
  },
  {
    icon: Wrench,
    title: "Post-Construction",
    desc: "Dust, debris, and detail work after a build or remodel — turnover-ready in one visit.",
  },
];

export const CHECKLIST = [
  "Vacuum & clean all flooring",
  "Dust furniture, fans, baseboards & blinds",
  "Disinfect kitchen counters, sinks & appliances",
  "Clean microwave in/out, polish stainless steel",
  "Scrub & disinfect bathrooms",
  "Polish mirrors & shower doors",
  "Wipe laundry surfaces",
  "Empty trash & replace liners",
  "Change master sheets & make beds",
  "Clean glass on entry doors",
];

export const PROCESS = [
  {
    step: "01",
    title: "Tell us about your space",
    desc: "Share a few details in our quick quote form, or call us. We listen first — every home and office is different.",
  },
  {
    step: "02",
    title: "Get a clear, honest quote",
    desc: "A transparent estimate within 24 hours on weekdays. No pressure, no surprises, no hidden fees.",
  },
  {
    step: "03",
    title: "Relax — we brighten it",
    desc: "Our vetted, insured team arrives on time and treats your space like their own. 100% satisfaction guaranteed.",
  },
];

export const PRICING = [
  {
    name: "Recurring",
    highlight: false,
    price: "from $119",
    unit: "/ visit",
    blurb: "Weekly, biweekly & monthly upkeep.",
    features: [
      "Best per-visit pricing",
      "Same trusted team",
      "Never locked into a contract",
      "Flexible rescheduling",
    ],
    cta: "Get recurring quote",
  },
  {
    name: "Deep Clean",
    highlight: true,
    price: "from $249",
    unit: "/ visit",
    blurb: "The thorough first-visit reset.",
    features: [
      "Top-to-bottom detail work",
      "Baseboards, blinds & buildup",
      "Ideal before recurring service",
      "Eco-friendly products included",
    ],
    cta: "Book a deep clean",
  },
  {
    name: "Commercial",
    highlight: false,
    price: "Custom",
    unit: "quote",
    blurb: "Offices, retail, medical & more.",
    features: [
      "Tailored to your schedule",
      "Day or after-hours service",
      "Insured & bonded crews",
      "Dedicated account contact",
    ],
    cta: "Request commercial quote",
  },
];

export const AREAS = [
  "Dallas", "Fort Worth", "Plano", "Frisco", "McKinney", "Allen",
  "Arlington", "Irving", "Garland", "Grapevine", "Southlake", "Coppell",
  "Richardson", "Carrollton", "Denton", "Prosper", "Fairview", "Murphy",
];

// MOCK testimonials — placeholder content, not real customers.
export const TESTIMONIALS = [
  {
    name: "Maria G.",
    role: "Frisco, TX",
    quote: "They treated my home like it was their own. I came back to a house that literally smelled like sunshine. The team is warm, punctual, and genuinely kind.",
    rating: 5,
  },
  {
    name: "Daniel R.",
    role: "Office Manager, Dallas",
    quote: "We switched our office to Brightleaf and the difference was immediate. Consistent, thorough, and they actually care about the details.",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "Plano, TX",
    quote: "The move-out clean got our full deposit back. Communication was effortless and the quote was exactly what they charged. Rare these days.",
    rating: 5,
  },
  {
    name: "James & Elaine",
    role: "McKinney, TX",
    quote: "Biweekly cleanings have given us our weekends back. Same lovely crew every time — it feels like family looking after our home.",
    rating: 5,
  },
];

export const FAQS = [
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
    q: "Do you serve commercial spaces?",
    a: "Yes. We clean offices, retail, medical suites, and post-construction sites across the DFW metroplex, with day or after-hours scheduling.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We back every visit with a 100% satisfaction guarantee. If something isn't right, tell us within 24 hours and we'll make it right — free.",
  },
];

export const STATS = [
  { value: "12+", label: "Years brightening DFW" },
  { value: "4,800+", label: "Homes & offices cleaned" },
  { value: "100%", label: "Satisfaction guarantee" },
  { value: "4.9★", label: "Average client rating" },
];
