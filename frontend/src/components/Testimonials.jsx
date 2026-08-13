import React from "react";
import { Star, Quote, ExternalLink } from "lucide-react";
import { TESTIMONIALS, BRAND } from "../mock";

const Card = ({ t }) => (
  <div className="relative w-[320px] md:w-[380px] shrink-0 bg-brand-cream rounded-2xl p-7 shadow-soft ring-1 ring-black/5 whitespace-normal">
    <Quote className="absolute top-6 right-6 w-9 h-9 text-brand-sage" />
    <span className="flex gap-0.5">
      {[...Array(t.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-brand-amber text-brand-amber" />
      ))}
    </span>
    <p className="mt-4 text-brand-ink/80 leading-relaxed italic line-clamp-6">“{t.quote}”</p>
    <div className="mt-5 flex items-center gap-3">
      <span className="grid place-items-center w-11 h-11 rounded-full bg-brand-green text-brand-cream font-600 shrink-0">
        {t.name.charAt(0)}
      </span>
      <div>
        <p className="font-600 text-brand-ink">{t.name}</p>
        <p className="text-sm text-brand-ink/60">{t.role}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section id="reviews" className="section-pad bg-white overflow-hidden">
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
            <span className="text-brand-ink/65 font-medium">5.0 average · 65+ Google reviews</span>
          </div>
        </div>
      </div>

      {/* animated marquee */}
      <div className="reviews-marquee relative mt-12">
        <div className="reviews-track flex gap-5 w-max px-5">
          {loop.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <p className="mt-10 text-center text-xs text-brand-ink/60">Verified reviews from our Google Business Profile.</p>
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="text-brand-ink/70">Loved your clean? We'd be grateful for a quick review.</p>
          <a
            href={BRAND.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream font-600 px-7 py-3.5 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5"
          >
            <Star className="w-4 h-4 fill-brand-amber text-brand-amber" />
            Leave us a review on Google
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
