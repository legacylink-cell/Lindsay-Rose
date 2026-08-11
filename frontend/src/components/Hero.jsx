import React from "react";
import { Star, Phone, ArrowRight, ShieldCheck, Leaf, Clock } from "lucide-react";
import { BRAND, IMAGES } from "../mock";

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Hero = () => {
  return (
    <section id="top" className="relative overflow-hidden pt-32 md:pt-40 pb-16 md:pb-24">
      {/* soft decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-brand-sage blur-3xl opacity-60" />
        <div className="absolute top-40 -left-32 w-[420px] h-[420px] rounded-full bg-brand-amberLight/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-3 bg-white border border-black/5 rounded-full pl-2 pr-4 py-1.5 shadow-soft">
            <div className="flex -space-x-2.5">
              {[
                { i: "M", c: "bg-brand-green" },
                { i: "D", c: "bg-brand-amber" },
                { i: "P", c: "bg-brand-greenLight" },
                { i: "J", c: "bg-brand-ink" },
              ].map((a) => (
                <span
                  key={a.i}
                  className={`grid place-items-center w-7 h-7 rounded-full ring-2 ring-white text-[11px] font-semibold text-white ${a.c}`}
                >
                  {a.i}
                </span>
              ))}
            </div>
            <div className="flex flex-col leading-none">
              <span className="flex items-center gap-1">
                <span className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-brand-amber text-brand-amber" />
                  ))}
                </span>
                <span className="text-xs font-bold text-brand-ink ml-0.5">5.0</span>
              </span>
              <span className="text-[11px] font-medium text-brand-ink/65 mt-1">67 five-star Google reviews</span>
            </div>
          </div>

          <h1 className="mt-6 font-serif text-[2.9rem] leading-[1.02] sm:text-6xl md:text-[4.4rem] font-700 text-brand-ink tracking-tight">
            A brighter home.
            <span className="block text-brand-green">A better day.</span>
          </h1>

          <p className="mt-6 text-lg text-brand-ink/70 max-w-xl leading-relaxed">
            Trusted, insured, eco-minded cleaning for homes and businesses across Collin County, Dallas County, and all of the {BRAND.area}. Real people who treat your space with genuine care — not a faceless service.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => go("#quote")}
              className="group inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream font-semibold px-7 py-4 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5"
            >
              Get your free quote
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href={BRAND.phoneHref}
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-green font-semibold px-7 py-4 rounded-full border border-brand-green/20 hover:border-brand-green/40 transition-all hover:-translate-y-0.5"
            >
              <Phone className="w-4 h-4" /> {BRAND.phone}
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-ink/70">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-green" /> Bonded & insured</span>
            <span className="inline-flex items-center gap-2"><Leaf className="w-4 h-4 text-brand-green" /> Eco-friendly products</span>
            <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4 text-brand-green" /> {BRAND.hours}</span>
          </div>
        </div>

        {/* image collage */}
        <div className="relative">
          <div className="relative rounded-[2rem] overflow-hidden shadow-lift ring-1 ring-black/5">
            <img src={IMAGES.heroLiving} alt="Bright, spotless living room cleaned by Bright at Home Cleaning in DFW" fetchPriority="high" decoding="async" width="800" height="520" className="w-full h-[420px] md:h-[520px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-greenDark/25 to-transparent" />
          </div>

          <div className="absolute -bottom-6 -left-4 md:-left-8 w-40 md:w-52 rounded-2xl overflow-hidden shadow-lift ring-4 ring-brand-cream floaty">
            <img src={IMAGES.kitchen} alt="Sunlit clean kitchen" loading="lazy" decoding="async" width="208" height="160" className="w-full h-32 md:h-40 object-cover" />
          </div>

          <div className="absolute -top-5 -right-3 md:-right-6 bg-white rounded-2xl shadow-lift px-4 py-3 ring-1 ring-black/5">
            <p className="font-serif text-2xl font-700 text-brand-green leading-none">100%</p>
            <p className="text-[11px] text-brand-ink/60 mt-1 max-w-[110px]">Satisfaction guaranteed, every visit</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
