import React from "react";
import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "../mock";

const Testimonials = () => {
  return (
    <section id="reviews" className="section-pad bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">Kind words</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl font-600 text-brand-ink">
            Loved by DFW homes & businesses
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-brand-amber text-brand-amber" />
              ))}
            </span>
            <span className="text-brand-ink/65 font-medium">4.9 average · hundreds of happy clients</span>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="reveal relative bg-brand-cream rounded-2xl p-7 shadow-soft ring-1 ring-black/5">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-brand-sage" />
              <span className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-amber text-brand-amber" />
                ))}
              </span>
              <p className="mt-4 text-brand-ink/80 leading-relaxed text-lg font-serif italic">“{t.quote}”</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-brand-green text-brand-cream font-600">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="font-600 text-brand-ink">{t.name}</p>
                  <p className="text-sm text-brand-ink/55">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-brand-ink/45">Reviews shown are illustrative placeholders.</p>
      </div>
    </section>
  );
};

export default Testimonials;
