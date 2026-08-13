import React from "react";
import { MapPin } from "lucide-react";
import { AREAS, BRAND } from "../mock";

const ServiceAreas = () => {
  const loop = [...AREAS, ...AREAS];
  return (
    <section id="areas" className="section-pad">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="rounded-[2rem] bg-brand-greenDark text-brand-cream overflow-hidden relative grain">
          <div className="relative px-8 md:px-12 py-12 md:py-16">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-brand-amberLight font-semibold">Proudly serving</p>
              <h2 className="mt-3 font-serif text-2xl sm:text-3xl md:text-[2.15rem] lg:text-5xl font-700">
                Collin County, Dallas County & all of DFW
              </h2>
              <p className="mt-4 text-brand-cream/70 text-lg max-w-2xl mx-auto">
                Rooted in Collin and Dallas County — and now serving the entire Dallas–Fort Worth metroplex. From Fort Worth to Frisco, Dallas to Denton, we're ready to brighten your space. Don't see your city? Just ask.
              </p>
            </div>
          </div>

          {/* marquee */}
          <div className="relative overflow-hidden py-8 border-t border-white/10">
            <div className="flex gap-3 marquee-track w-max">
              {loop.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap">
                  <MapPin className="w-4 h-4 text-brand-amberLight" /> {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreas;
