// MOCK DATA for Bright at Home Cleaning (frontend-only teaser).
// NOTE: Testimonials and quote submissions are MOCKED for now.

import {
  SprayCan, Home, Repeat, Truck, Building2, Wrench, Store,
  Blinds, DoorOpen, Flame, AppWindow, Fan, Refrigerator, Archive, Utensils,
} from "lucide-react";

export const BRAND = {
  name: "Bright at Home",
  full: "Bright at Home Cleaning",
  tagline: "A Brighter Home. A Better Day.",
  phone: "469-443-6903",
  phoneHref: "tel:+14694436903",
  email: "support@brightathomecleaning.com",
  hours: "Mon–Fri, 8am–5pm",
  area: "Dallas–Fort Worth Metroplex",
  address: "401 Saratoga Dr, Denton, TX 76210",
  reviewUrl: "https://www.google.com/search?q=Bright+at+Home+Cleaning+Services#lrd=0x864c1b327112189d:0x69466840e88545a1,3,,,,",
  social: {
    facebook: "https://www.facebook.com/brightathomecleaning/",
    instagram: "#",
  },
};

export const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Commercial", href: "#commercial" },
  { label: "How it works", href: "#process" },
  { label: "Areas", href: "#areas" },
  { label: "Reviews", href: "#reviews" },
];

export const DIFFERENTIATORS = [
  {
    icon: "ShieldCheck",
    title: "Background-Checked Team",
    desc: "Every single team member passes a thorough background check before they ever set foot in your home \u2014 a step far too many cleaning companies quietly skip. Your safety and peace of mind always come first.",
    featured: true,
  },
  {
    icon: "Heart",
    title: "Faith-Driven Care",
    desc: "We run our business on integrity and genuine care, treating your home and family the way we'd want ours treated.",
  },
  {
    icon: "Users",
    title: "The Same Trusted Faces",
    desc: "You get a consistent, familiar crew who learn your home and preferences \u2014 not a rotating cast of strangers.",
  },
  {
    icon: "Leaf",
    title: "Eco-Friendly & Safe",
    desc: "Effective, non-toxic, biodegradable products that are safe for your kids, pets, and the planet.",
  },
  {
    icon: "BadgeCheck",
    title: "Bonded & Insured",
    desc: "Fully bonded and insured for complete protection, so you can relax knowing you're fully covered.",
  },
  {
    icon: "Star",
    title: "100% Satisfaction Guarantee",
    desc: "If anything isn't perfect, tell us within 24 hours and we'll make it right \u2014 free. That's our promise.",
  },
];

export const IMAGES = {
  heroLiving: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxicmlnaHQlMjBjbGVhbiUyMGxpdmluZyUyMHJvb218ZW58MHx8fHwxNzg0MzgwMzI4fDA&ixlib=rb-4.1.0&q=85&w=1200&auto=format",
  livingSofa: "https://images.unsplash.com/photo-1615800002234-05c4d488696c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxicmlnaHQlMjBjbGVhbiUyMGxpdmluZyUyMHJvb218ZW58MHx8fHwxNzg0MzgwMzI4fDA&ixlib=rb-4.1.0&q=85&w=1200&auto=format",
  kitchen: "https://images.unsplash.com/photo-1713514374038-656f7bbde9db?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHw0fHxzdW5saXQlMjBraXRjaGVufGVufDB8fHx8MTc4NDM4MDMyOXww&ixlib=rb-4.1.0&q=85&w=640&auto=format",
  bedroomPlants: "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYmVkcm9vbXxlbnwwfHx8fDE3ODQzODAzMjh8MA&ixlib=rb-4.1.0&q=85&w=640&auto=format",
  bedroom: "https://images.unsplash.com/photo-1541004995602-b3e898709909?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxjb3p5JTIwYmVkcm9vbXxlbnwwfHx8fDE3ODQzODAzMjh8MA&ixlib=rb-4.1.0&q=85&w=1200&auto=format",
  cleanerGlass: "https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  cleanerTeam: "https://images.pexels.com/photos/6195274/pexels-photo-6195274.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  cleanerVacuum: "https://images.pexels.com/photos/6196694/pexels-photo-6196694.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  cleaningStove: "https://images.pexels.com/photos/9462314/pexels-photo-9462314.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  cleaningSink: "https://images.unsplash.com/photo-1556910638-6cdac31d44dc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHw0fHxjbGVhbmluZyUyMGtpdGNoZW58ZW58MHx8fHwxNzg0MzgwMzY1fDA&ixlib=rb-4.1.0&q=85&w=1200&auto=format",
  officeLobby: "https://images.unsplash.com/photo-1587316205943-b15dc52a12e0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxvZmZpY2UlMjBsb2JieXxlbnwwfHx8fDE3ODQzODE2NzN8MA&ixlib=rb-4.1.0&q=85&w=1200&auto=format",
  officeSpace: "https://images.pexels.com/photos/164586/pexels-photo-164586.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  commercialCleaner: "https://images.pexels.com/photos/6196223/pexels-photo-6196223.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

export const RESIDENTIAL_SERVICES = [
  {
    icon: Repeat,
    title: "Recurring Cleaning",
    desc: "Weekly, biweekly, or monthly upkeep that keeps your home consistently fresh. Best value, never a contract.",
    tag: "Most popular",
  },
  {
    icon: SprayCan,
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
    icon: Store,
    title: "Retail & Medical",
    desc: "Disinfection-focused cleaning that meets high-traffic and hygiene-sensitive standards.",
  },
  {
    icon: Wrench,
    title: "Post-Construction",
    desc: "Dust, debris, and detail work after a build or remodel — turnover-ready in one visit.",
  },
];

export const COMMERCIAL_BENEFITS = [
  "Flexible day or after-hours scheduling",
  "Insured & bonded, background-checked crews",
  "Consistent quality with a dedicated account contact",
  "Custom scopes & supply management",
  "Disinfection for high-traffic & sensitive spaces",
  "Flat, transparent pricing \u2014 no surprises",
];

export const COMMERCIAL_INDUSTRIES = [
  "Offices", "Retail", "Medical & Dental", "Salons & Studios",
  "Restaurants", "Property Mgmt", "Churches", "Post-Construction",
];

export const ADDONS = [
  { icon: Blinds, label: "Blinds, shutters & window sills" },
  { icon: DoorOpen, label: "Baseboards, doors & door frames" },
  { icon: Flame, label: "Inside-the-oven cleaning" },
  { icon: AppWindow, label: "Interior reachable windows" },
  { icon: Archive, label: "Cabinet & drawer exteriors" },
  { icon: Fan, label: "Ceiling fans & light fixtures" },
  { icon: Refrigerator, label: "Inside-the-fridge cleaning" },
  { icon: Utensils, label: "Interior cabinets & pantry" },
];

export const ADDONS_NOTE = "Just give us a call or email about a week before your next visit and we'll fold any extras into your scheduled clean.";

export const ONE_TIME = {
  title: "Need a one-time clean?",
  body: "We're known for keeping homes fresh on a regular schedule \u2014 but we're just as happy to help for a single visit. Our one-time cleans follow our full scope of services at a deeper level, and you can pair them with any add-ons you like. Reach out and we'll build a clear, no-obligation quote around your home.",
};

// MOCK DATA continues below.
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
    price: "Custom",
    unit: "quote",
    blurb: "Weekly, biweekly & monthly upkeep.",
    features: [
      "Best per-visit value",
      "Same trusted team",
      "Never locked into a contract",
      "Flexible rescheduling",
    ],
    cta: "Get recurring quote",
  },
  {
    name: "Deep Clean",
    highlight: true,
    price: "Custom",
    unit: "quote",
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

// Real customer reviews from the Bright at Home Cleaning Google Business Profile.
export const TESTIMONIALS = [
  {
    name: "Dani Price",
    role: "Verified Google Review",
    quote: "I am so pleased with Bright At Home Cleaning! The work they do is exceptional and incredibly professional. I first received a text that they were 'en route'. Lori was punctual and kind and got straight to the job. She paid special attention to details, and it looks and smells great! After she left I received a text that the job was done and the invoice was on its way. I love the communication! I highly recommend them.",
    rating: 5,
  },
  {
    name: "Chelsey Garrett",
    role: "Verified Google Review",
    quote: "Lori and Maren were very kind and professional. They spent a concentrated effort on certain areas that I've had trouble getting clean, and they achieved together what I couldn't! I really appreciated the time they took to clean and my home looks and smells amazing!",
    rating: 5,
  },
  {
    name: "Jennifer Inumerable",
    role: "Verified Google Review",
    quote: "Maren and her team are professional and very responsive. I used them for a deep clean and they did a fantastic job cleaning my house and using green products too, which is hard to find with cleaning companies nowadays. I also really liked the small thank you gift they gave me after the service. Would wholeheartedly recommend!",
    rating: 5,
  },
  {
    name: "Kassie Redd",
    role: "Verified Google Review",
    quote: "We went through a couple different cleaning services and individuals before we found out about Bright at Home. Sarah is the BEST by far! She is thorough and efficient and has amazing attention to detail. Now I get that \"new home\" feel on a regular basis!",
    rating: 5,
  },
  {
    name: "Christopher Pilcic",
    role: "Verified Google Review",
    quote: "Bright at Home did an excellent job cleaning our home while we were out of town. It was such a pleasure coming home to a clean house. The attention to detail was very impressive. I will definitely be calling them back!",
    rating: 5,
  },
  {
    name: "D. L.",
    role: "Local Guide · Google Review",
    quote: "So glad we found Bright at Home Cleaning! I have high standards for cleaning but didn't have time for it myself anymore, which was causing added stress that we didn't need. Lori & Jennifer do a superb job and are friendly, trustworthy, punctual, and efficient. We've had them for an initial deep clean then back for bi-weekly cleanings and it's wonderful!",
    rating: 5,
  },
  {
    name: "Sarah Stephens",
    role: "Verified Google Review",
    quote: "Kaeley always does an amazing job on our home. Her attention to detail is outstanding, and it's always such a relief to come home to a spotless house. Highly recommend!",
    rating: 5,
  },
  {
    name: "PC Ashley",
    role: "Local Guide · Google Review",
    quote: "Wow, house looks beautiful and smells wonderful! Also important to me, I don't have to go through the entire house repositioning pictures and knick knacks! Amazing attention to detail!",
    rating: 5,
  },
  {
    name: "Becky Hurst",
    role: "Local Guide · Google Review",
    quote: "18 months later, I am still thrilled with Bright at Home Cleaning. They handle everything in a purely professional and helpful manner — they're kind, always punctual, and I'm so thankful to see them. From the initial consult to payment, the whole process is easy and full of considerate communication. Highly recommend!",
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
  { value: "6+", label: "Years serving North Texas" },
  { value: "2,500+", label: "Cleans completed" },
  { value: "67", label: "Five-star Google reviews" },
  { value: "5.0★", label: "Average client rating" },
];
