import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Check, ArrowRight } from "lucide-react";
import { BRAND } from "../mock";
import QuoteForm from "../components/QuoteForm";
import Footer from "../components/Footer";

export const SERVICE_CITIES = [
  "Plano", "Frisco", "McKinney", "Allen", "Celina", "Prosper",
  "Denton", "Flower Mound", "Grapevine", "Fort Worth",
];

const SERVICES = {
  "recurring-house-cleaning": {
    name: "Recurring House Cleaning",
    metaTitle: "Recurring House Cleaning in DFW | Weekly, Biweekly & Monthly",
    metaDescription:
      "Reliable recurring house cleaning across the Dallas–Fort Worth metroplex. Weekly, biweekly or monthly visits from the same trusted, background-checked team. Get a free quote.",
    tagline: "Weekly, biweekly & monthly upkeep",
    intro:
      "Keep your home consistently spotless with recurring house cleaning from Bright at Home Cleaning. You get the same trusted, background-checked team on a schedule that fits your life — so your home stays fresh without you lifting a finger.",
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
      { q: "Do I get the same cleaners each time?", a: "Yes — we intentionally send the same trusted, background-checked team so they get to know your home and preferences." },
    ],
  },
  "deep-cleaning": {
    name: "Deep Cleaning Services",
    metaTitle: "Deep Cleaning Services in DFW | Top-to-Bottom Home Reset",
    metaDescription:
      "Professional deep cleaning services in Denton, Plano, Frisco & across DFW. A meticulous top-to-bottom reset of your home. Bonded, insured & eco-friendly. Free quote.",
    tagline: "The thorough top-to-bottom reset",
    intro:
      "Our deep cleaning is the detailed, top-to-bottom reset your home deserves — reaching the build-up and hidden spots regular cleaning misses. It's the perfect starting point before recurring service, or a refresh whenever your home needs it.",
    included: [
      "Everything in a standard clean, done more intensively",
      "Baseboards, door frames, and detailed dusting",
      "Inside microwave and exterior of all appliances",
      "Cabinet fronts, switch plates & light fixtures",
      "Detailed bathroom scrubbing — grout, tile & fixtures",
      "Edge-to-edge vacuuming and hand-detailed corners",
    ],
    idealFor:
      "First-time clients, seasonal refreshes, homes that haven't had a professional clean in a while, or anyone wanting a truly deep, detailed result.",
    faqs: [
      { q: "How long does a deep clean take?", a: "It depends on the size and condition of your home — a deep clean typically takes longer than a standard visit. We'll give you a clear estimate with your free quote." },
      { q: "Should I get a deep clean before recurring service?", a: "Yes — we recommend starting with a deep clean so recurring visits can keep your home effortlessly maintained." },
    ],
  },
  "one-time-house-cleaning": {
    name: "One-Time House Cleaning",
    metaTitle: "One-Time House Cleaning in DFW | No Contract, No Commitment",
    metaDescription:
      "Need a one-time house cleaning in the Dallas–Fort Worth area? Perfect for special occasions or a quick reset. No contracts, no commitment. Get your free quote today.",
    tagline: "A fresh clean, exactly when you need it",
    intro:
      "Sometimes you just need a great clean once — before guests arrive, after a party, or simply to reset. Our one-time house cleaning gives you a professional, thorough result with no contracts and no commitment.",
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
      { q: "Is there a contract for one-time cleaning?", a: "None at all. One-time cleaning is exactly that — book it when you need it, with no ongoing commitment." },
      { q: "Can I add extras like inside the oven or fridge?", a: "Absolutely. Just let us know when you request your quote and we'll include them." },
    ],
  },
  "move-in-move-out-cleaning": {
    name: "Move-In / Move-Out Cleaning",
    metaTitle: "Move-In / Move-Out Cleaning in DFW | Move Cleaning Services",
    metaDescription:
      "Move-in and move-out cleaning services across DFW. Leave your old place spotless or start fresh in a truly clean new home. Great for renters, buyers & sellers. Free quote.",
    tagline: "Start fresh — or leave it spotless",
    intro:
      "Moving is stressful enough. Whether you're handing back keys or settling into a new place, our move-in / move-out cleaning delivers a spotless, top-to-bottom result on empty rooms — helping renters protect deposits and buyers start fresh.",
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
      { q: "Do you clean inside cabinets and appliances?", a: "Yes — move-in/move-out cleaning includes inside cabinets, drawers, closets, and appliances since the home is typically empty." },
      { q: "Can you work with my closing or lease-end date?", a: "We build the schedule around your move dates — just share them when you request your quote." },
    ],
  },
  "commercial-cleaning": {
    name: "Commercial Cleaning",
    metaTitle: "Commercial Cleaning in DFW | Offices, Retail & Medical",
    metaDescription:
      "Professional commercial cleaning across the Dallas–Fort Worth metroplex — offices, retail, medical suites & post-construction. Day or after-hours scheduling. Free quote.",
    tagline: "Spotless workspaces that keep business moving",
    intro:
      "A clean, healthy workspace makes a real impression on your clients and team. Bright at Home Cleaning provides dependable commercial cleaning across DFW — with flexible day or after-hours scheduling built around your operation.",
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
      { q: "Do you clean after business hours?", a: "Yes — we offer day or after-hours scheduling so cleaning never disrupts your operation." },
      { q: "Can you handle post-construction cleanup?", a: "We do. We handle fine dust, debris removal, and detailed finishing so your space is client-ready." },
    ],
  },
};

const ServicePage = () => {
  const { slug } = useParams();
  const svc = SERVICES[slug];

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (!svc) return;
    document.title = svc.metaTitle;
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", svc.metaDescription);
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = "service-jsonld";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: svc.name,
      description: svc.metaDescription,
      provider: {
        "@type": "HouseCleaningService",
        name: BRAND.full,
        telephone: "+1-469-443-6903",
        email: BRAND.email,
        url: "https://www.brightathomecleaning.com/",
      },
      areaServed: SERVICE_CITIES.map((c) => ({ "@type": "City", name: `${c}, TX` })),
    });
    document.head.appendChild(ld);
    return () => { const e = document.getElementById("service-jsonld"); if (e) e.remove(); };
  }, [svc]);

  if (!svc) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-cream text-center px-6">
        <div>
          <h1 className="font-serif text-4xl font-700 text-brand-ink">Service not found</h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-brand-green font-600"><ArrowLeft className="w-4 h-4" /> Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen">
      <header className="bg-brand-cream border-b border-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center group" data-testid="service-logo">
            <img src="/logos/logo-b-rooftop-emblem-t.png" alt={BRAND.full} className="h-16 md:h-20 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink/75 hover:text-brand-green transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream text-sm font-600 px-5 py-2.5 rounded-full transition-all">
              <Phone className="w-4 h-4" /> {BRAND.phone}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="section-pad bg-brand-green text-brand-cream">
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-amberLight font-semibold">{svc.tagline}</p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl font-700 leading-[1.05]">{svc.name} in DFW</h1>
          <p className="mt-6 text-lg text-brand-cream/85 max-w-2xl mx-auto leading-relaxed">{svc.intro}</p>
          <a href="#quote" className="mt-8 inline-flex items-center gap-2 bg-brand-amber hover:bg-brand-amberLight text-brand-ink font-600 px-7 py-4 rounded-full transition-all hover:-translate-y-0.5">
            Get a free quote <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* What's included */}
      <section className="section-pad bg-white tex-marble">
        <div className="max-w-5xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-700 text-brand-ink">What's included</h2>
            <ul className="mt-6 space-y-3">
              {svc.included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-brand-ink/75">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-brand-sage text-brand-green shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-700 text-brand-ink">Who it's for</h2>
            <p className="mt-6 text-brand-ink/75 text-lg leading-relaxed">{svc.idealFor}</p>
            <div className="mt-8 rounded-2xl bg-brand-sage p-6">
              <p className="font-600 text-brand-green">Bonded & insured · Background-checked team · 100% satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Areas served */}
      <section className="section-pad">
        <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-700 text-brand-ink">Where we provide {svc.name.toLowerCase()}</h2>
          <p className="mt-4 text-brand-ink/70 max-w-2xl mx-auto">Proudly serving the entire Dallas–Fort Worth metroplex, including:</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {SERVICE_CITIES.map((c) => (
              <span key={c} className="bg-white ring-1 ring-black/5 shadow-soft rounded-full px-4 py-2 text-sm text-brand-ink/80">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-white tex-marble">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-700 text-brand-ink text-center">Frequently asked</h2>
          <div className="mt-8 space-y-4">
            {svc.faqs.map((f) => (
              <div key={f.q} className="rounded-2xl bg-brand-cream p-6 ring-1 ring-black/5">
                <h3 className="font-600 text-brand-ink">{f.q}</h3>
                <p className="mt-2 text-brand-ink/70 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteForm />
      <Footer />
    </div>
  );
};

export default ServicePage;
