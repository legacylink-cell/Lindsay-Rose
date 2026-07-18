import React from "react";
import { Check, ArrowRight, Star } from "lucide-react";
import { PRICING } from "../mock";

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Pricing = () => {
  return (
    <section id="pricing" className="section-pad bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">Simple, honest pricing</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl font-600 text-brand-ink">
            Fair quotes, no contracts, no surprises
          </h2>
          <p className="mt-4 text-brand-ink/65 text-lg">
            Every home and business is different — final pricing comes from your free quote. Here's where most clients start.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className={`reveal relative rounded-[1.75rem] p-8 transition-all duration-300 hover:-translate-y-1.5 ${
                p.highlight
                  ? "bg-brand-green text-brand-cream shadow-lift ring-1 ring-brand-green"
                  : "bg-brand-cream text-brand-ink shadow-soft ring-1 ring-black/5 hover:shadow-lift"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-brand-amber text-brand-ink text-xs font-bold px-3 py-1.5 rounded-full shadow-soft">
                  <Star className="w-3 h-3 fill-brand-ink" /> Most requested
                </span>
              )}
              <h3 className={`font-serif text-2xl font-600 ${p.highlight ? "text-brand-cream" : "text-brand-ink"}`}>{p.name}</h3>
              <p className={`text-sm mt-1 ${p.highlight ? "text-brand-cream/70" : "text-brand-ink/60"}`}>{p.blurb}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-serif text-4xl font-600">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "text-brand-cream/70" : "text-brand-ink/55"}`}>{p.unit}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className={`mt-0.5 grid place-items-center w-5 h-5 rounded-full shrink-0 ${p.highlight ? "bg-brand-amber text-brand-ink" : "bg-brand-green text-brand-cream"}`}>
                      <Check className="w-3 h-3" />
                    </span>
                    <span className={p.highlight ? "text-brand-cream/90" : "text-brand-ink/75"}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => go("#quote")}
                className={`mt-8 w-full inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-full transition-all hover:-translate-y-0.5 ${
                  p.highlight
                    ? "bg-brand-amber text-brand-ink hover:bg-brand-amberLight"
                    : "bg-brand-green text-brand-cream hover:bg-brand-greenDark"
                }`}
              >
                {p.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-brand-ink/55">100% satisfaction guaranteed · Bonded & insured · Never locked into a contract</p>
      </div>
    </section>
  );
};

export default Pricing;
