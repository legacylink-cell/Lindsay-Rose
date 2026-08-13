import React from "react";
import { ShieldCheck, Heart, Users, Leaf, BadgeCheck, Star, ArrowRight } from "lucide-react";
import { DIFFERENTIATORS } from "../mock";

const ICONS = { ShieldCheck, Heart, Users, Leaf, BadgeCheck, Star };

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Differentiators = () => {
  return (
    <section id="why-us" className="section-pad bg-white tex-marble">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">Why choose us</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl font-700 text-brand-ink">
            What sets us apart
          </h2>
          <p className="mt-4 text-brand-ink/65 text-lg">
            Anyone can clean a house. Here's what makes trusting us with your home genuinely different.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIFFERENTIATORS.map((d) => {
            const Icon = ICONS[d.icon] || Star;
            if (d.featured) {
              return (
                <div key={d.title} className="reveal bg-brand-green text-brand-cream rounded-2xl p-7 shadow-lift relative overflow-hidden grain">
                  <span className="relative inline-flex items-center gap-2 bg-brand-amber text-brand-ink text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Our #1 difference
                  </span>
                  <span className="relative mt-4 grid place-items-center w-14 h-14 rounded-xl bg-white/10 text-brand-amberLight">
                    <Icon className="w-6 h-6" />
                  </span>
                  <h3 className="relative mt-4 text-xl font-600">{d.title}</h3>
                  <p className="relative mt-2 text-sm text-brand-cream/85 leading-relaxed">{d.desc}</p>
                </div>
              );
            }
            return (
              <div key={d.title} className="reveal bg-brand-cream rounded-2xl p-7 shadow-soft ring-1 ring-black/5 hover:shadow-lift hover:-translate-y-1 transition-all">
                <span className="grid place-items-center w-14 h-14 rounded-xl bg-brand-sage text-brand-green">
                  <Icon className="w-6 h-6" />
                </span>
                <h3 className="mt-4 text-xl font-600 text-brand-ink">{d.title}</h3>
                <p className="mt-2 text-brand-ink/65 text-sm leading-relaxed">{d.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Differentiators;
