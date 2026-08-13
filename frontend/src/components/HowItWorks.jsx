import React from "react";
import { Phone } from "lucide-react";
import { IMAGES, PROCESS, BRAND } from "../mock";

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const HowItWorks = () => {
  return (
    <section id="process" className="section-pad">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">How it works</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl font-700 text-brand-ink">
            Booking us is refreshingly simple
          </h2>
          <p className="mt-4 text-brand-ink/65 text-lg">Three easy steps between you and a spotless space.</p>
        </div>

        <div className="mt-14 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="space-y-3">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="reveal group flex gap-5 p-6 rounded-2xl hover:bg-white hover:shadow-soft transition-all">
                <div className="shrink-0">
                  <span className="grid place-items-center w-14 h-14 rounded-2xl bg-brand-green text-brand-cream font-serif text-xl font-700 group-hover:bg-brand-amber group-hover:text-brand-ink transition-colors">
                    {p.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-600 text-brand-ink">{p.title}</h3>
                  <p className="mt-1.5 text-brand-ink/65 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
            <div className="ml-6 mt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => go("#quote")}
                className="bg-brand-green hover:bg-brand-greenDark text-brand-cream font-semibold px-7 py-4 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5"
              >
                Start with a free quote
              </button>
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-green font-semibold px-7 py-4 rounded-full border border-brand-green/20 hover:border-brand-green/40 transition-all hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4" /> Call {BRAND.phone}
              </a>
            </div>
          </div>

          <div className="relative reveal">
            <div className="rounded-[2rem] overflow-hidden shadow-lift ring-1 ring-black/5">
              <img loading="lazy" decoding="async" src={IMAGES.cleanerGlass} alt="Cleaning professional at work" width="900" height="520" className="w-full h-[520px] object-cover" />
            </div>
            <div className="absolute -top-5 -left-4 md:-left-8 w-40 rounded-2xl overflow-hidden shadow-lift ring-4 ring-brand-cream floaty">
              <img loading="lazy" decoding="async" src={IMAGES.bedroomPlants} alt="Fresh, tidy bedroom" width="320" height="128" className="w-full h-32 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
