import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Check, ArrowRight } from "lucide-react";
import { BRAND } from "../mock";
import QuoteForm from "../components/QuoteForm";
import Footer from "../components/Footer";
import { usePageHead } from "../hooks/usePageHead";
import { SERVICE_PAGES as SERVICES } from "../data/site-copy.mjs";

export const SERVICE_CITIES = [
  "Plano", "Frisco", "McKinney", "Allen", "Celina", "Prosper",
  "Denton", "Flower Mound", "Grapevine", "Fort Worth",
];


const ServicePage = () => {
  const { slug } = useParams();
  const svc = SERVICES[slug];

  usePageHead(
    svc
      ? { title: svc.metaTitle, description: svc.metaDescription, path: `/services/${slug}` }
      : {}
  );

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (!svc) return;
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
        url: "https://brightathomecleaning.com/",
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
