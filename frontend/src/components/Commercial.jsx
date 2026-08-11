import React from "react";
import { Check, ArrowRight, Building2, Phone } from "lucide-react";
import { IMAGES, COMMERCIAL_SERVICES, COMMERCIAL_BENEFITS, COMMERCIAL_INDUSTRIES, BRAND } from "../mock";

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Commercial = () => {
  return (
    <section id="commercial" className="section-pad bg-brand-greenDark text-brand-cream relative overflow-hidden grain">
      <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* left: images */}
          <div className="relative reveal order-2 lg:order-1">
            <div className="rounded-[2rem] overflow-hidden shadow-lift ring-1 ring-white/10">
              <img loading="lazy" decoding="async" src={IMAGES.officeLobby} alt="Modern, spotless office lobby" width="900" height="520" className="w-full h-[440px] md:h-[520px] object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-4 md:-right-8 w-44 md:w-56 rounded-2xl overflow-hidden shadow-lift ring-4 ring-brand-greenDark floaty">
              <img loading="lazy" decoding="async" src={IMAGES.commercialCleaner} alt="Commercial cleaning professional" width="320" height="160" className="w-full h-32 md:h-40 object-cover" />
            </div>
            <div className="absolute -top-5 -left-3 md:-left-6 bg-brand-amber text-brand-ink rounded-2xl px-4 py-3 shadow-lift">
              <p className="text-2xl font-600 leading-none">B2B</p>
              <p className="text-[11px] mt-1 max-w-[120px] font-medium">Trusted by DFW businesses</p>
            </div>
          </div>

          {/* right: content */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide reveal">
              <Building2 className="w-4 h-4 text-brand-amberLight" /> Commercial & Office Cleaning
            </span>
            <h2 className="reveal mt-5 text-4xl md:text-5xl font-600">
              Spotless workspaces that keep business moving
            </h2>
            <p className="reveal mt-5 text-brand-cream/75 text-lg leading-relaxed max-w-xl">
              From single offices to multi-site facilities across DFW, Bright at Home delivers dependable commercial cleaning built around your schedule, your standards, and your budget.
            </p>

            {/* service cards */}
            <div className="reveal mt-8 grid sm:grid-cols-3 gap-4">
              {COMMERCIAL_SERVICES.map((s) => (
                <div key={s.title} className="bg-white/8 border border-white/10 rounded-2xl p-5 hover:bg-white/12 transition-colors">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-amber/20 text-brand-amberLight">
                    <s.icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-3 font-600 text-brand-cream">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-brand-cream/60 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* benefits */}
            <div className="reveal mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {COMMERCIAL_BENEFITS.map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-brand-amber text-brand-ink shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="text-sm text-brand-cream/80">{b}</span>
                </div>
              ))}
            </div>

            <div className="reveal mt-9 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => go("#quote")}
                className="group inline-flex items-center justify-center gap-2 bg-brand-amber hover:bg-brand-amberLight text-brand-ink font-semibold px-7 py-4 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5"
              >
                Request a commercial quote
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-brand-cream font-semibold px-7 py-4 rounded-full border border-white/20 transition-all hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4" /> Call {BRAND.phone}
              </a>
            </div>
          </div>
        </div>

        {/* industries strip */}
        <div className="reveal mt-14 pt-10 border-t border-white/10">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-amberLight font-semibold text-center">Industries we serve</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {COMMERCIAL_INDUSTRIES.map((i) => (
              <span key={i} className="bg-white/8 border border-white/10 rounded-full px-5 py-2.5 text-sm font-medium">
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Commercial;
