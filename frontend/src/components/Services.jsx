import React, { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { RESIDENTIAL_SERVICES, COMMERCIAL_SERVICES, CHECKLIST } from "../mock";

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const ServiceCard = ({ s }) => (
  <div className="reveal group relative bg-white rounded-2xl p-7 shadow-soft ring-1 ring-black/5 hover:shadow-lift transition-all duration-300 hover:-translate-y-1">
    {s.tag && (
      <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-wider bg-brand-amber/15 text-brand-amber px-2.5 py-1 rounded-full">
        {s.tag}
      </span>
    )}
    <span className="grid place-items-center w-14 h-14 rounded-xl bg-brand-sage text-brand-green group-hover:bg-brand-green group-hover:text-brand-cream transition-colors">
      <s.icon className="w-6 h-6" />
    </span>
    <h3 className="mt-5 text-xl font-600 text-brand-ink">{s.title}</h3>
    <p className="mt-2 text-brand-ink/65 text-sm leading-relaxed">{s.desc}</p>
    <button onClick={() => go("#quote")} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:gap-2 transition-all">
      Get a quote <ArrowUpRight className="w-4 h-4" />
    </button>
  </div>
);

const Services = () => {
  const [tab, setTab] = useState("residential");
  const list = tab === "residential" ? RESIDENTIAL_SERVICES : COMMERCIAL_SERVICES;

  return (
    <section id="services" className="section-pad">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">What we do</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl font-600 text-brand-ink">
              Cleaning built around <span className="italic text-brand-green">your</span> space
            </h2>
            <p className="mt-4 text-brand-ink/65 text-lg">
              From weekly upkeep to commercial janitorial care, every visit is tailored, thorough, and handled by people who genuinely care.
            </p>
          </div>

          <div className="inline-flex bg-white rounded-full p-1 shadow-soft ring-1 ring-black/5 self-start">
            {[
              { id: "residential", label: "Residential" },
              { id: "commercial", label: "Commercial" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  tab === t.id ? "bg-brand-green text-brand-cream shadow-soft" : "text-brand-ink/60 hover:text-brand-green"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {list.map((s) => (
            <ServiceCard key={s.title} s={s} />
          ))}
        </div>

        {/* checklist */}
        <div className="mt-14 rounded-[1.75rem] bg-brand-sage/60 p-8 md:p-10 reveal">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-center">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-600 text-brand-ink">What's included in every clean</h3>
              <p className="mt-3 text-brand-ink/65">A consistent, detail-obsessed checklist — so nothing gets missed.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {CHECKLIST.map((c) => (
                <div key={c} className="flex items-start gap-3">
                  <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-brand-green text-brand-cream shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="text-sm text-brand-ink/80">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
