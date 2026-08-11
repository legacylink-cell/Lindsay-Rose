import React from "react";
import { ShieldCheck, Leaf, HeartHandshake, BadgeCheck } from "lucide-react";
import { STATS } from "../mock";

const BADGES = [
  { icon: ShieldCheck, label: "Bonded & Insured" },
  { icon: Leaf, label: "Eco-Friendly" },
  { icon: HeartHandshake, label: "Family Operated" },
  { icon: BadgeCheck, label: "Vetted Team" },
];

const TrustBar = () => {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="rounded-[1.75rem] bg-brand-green text-brand-cream shadow-lift overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/10">
              <p className="text-xs uppercase tracking-[0.22em] text-brand-amberLight mb-5">Why families & businesses trust us</p>
              <div className="grid grid-cols-2 gap-5">
                {BADGES.map((b) => (
                  <div key={b.label} className="flex items-center gap-3 reveal">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/10">
                      <b.icon className="w-5 h-5 text-brand-amberLight" />
                    </span>
                    <span className="text-sm font-medium">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 md:p-10 grid grid-cols-2 gap-6">
              {STATS.map((s) => (
                <div key={s.label} className="reveal">
                  <p className="font-serif text-3xl md:text-4xl font-600 text-brand-amberLight">{s.value}</p>
                  <p className="text-sm text-brand-cream/70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
