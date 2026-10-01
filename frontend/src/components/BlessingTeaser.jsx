import React from "react";
import { HeartHandshake, ArrowRight } from "lucide-react";
import { useSiteSettings } from "../hooks/useSiteSettings";

// Homepage teaser for the monthly blessing. Hidden until the admin publishes it.
export const BlessingTeaser = () => {
  const settings = useSiteSettings();
  if (!settings?.nominations_live) return null;
  const cycle = settings.nominations || {};

  return (
    <section className="section-pad" data-testid="blessing-teaser">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-green text-brand-cream grain px-7 py-12 md:px-14 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-600 uppercase tracking-[0.18em] text-brand-amberLight">
              <HeartHandshake className="w-3.5 h-3.5" /> Faith in action
            </span>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl font-700 leading-[1.08]">
              Bright Blessing of the Month
            </h2>
            <p className="mt-4 text-brand-cream/80 leading-relaxed">
              Each month we gift one complimentary home cleaning to a DFW neighbor walking through a hard
              season — illness, grief, caregiving, a new baby, recovery, job loss. Nominate a neighbor, a
              friend, or yourself. Nominators receive $25 off their first cleaning.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/bright-blessing"
                data-testid="blessing-teaser-cta"
                className="inline-flex items-center gap-2 bg-brand-amber hover:bg-brand-amberLight text-brand-ink font-semibold px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5"
              >
                Nominate a home <ArrowRight className="w-4 h-4" />
              </a>
              {cycle.is_open && cycle.closes_label && (
                <p className="text-sm text-brand-cream/70">Nominations close {cycle.closes_label}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlessingTeaser;
