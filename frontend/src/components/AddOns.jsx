import React from "react";
import { Plus, PhoneCall, ArrowRight, CalendarClock } from "lucide-react";
import { ADDONS, ADDONS_NOTE, ONE_TIME, BRAND } from "../mock";

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const AddOns = () => {
  return (
    <section id="addons" className="section-pad bg-brand-sage/50">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Add-ons */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14 items-start">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 bg-white border border-black/5 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-green shadow-soft">
              <Plus className="w-4 h-4" /> Make it yours
            </span>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl font-600 text-brand-ink">
              Add-on services
            </h2>
            <p className="mt-4 text-brand-ink/70 text-lg leading-relaxed">
              Spotted something extra you'd love us to tackle? Beyond our standard scope, you can add any of these detailed touches to a visit for a small additional fee.
            </p>
            <div className="mt-6 flex items-start gap-3 bg-white rounded-2xl p-4 shadow-soft ring-1 ring-black/5">
              <CalendarClock className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
              <p className="text-sm text-brand-ink/75">{ADDONS_NOTE}</p>
            </div>
            <a
              href={BRAND.phoneHref}
              className="mt-5 inline-flex items-center gap-2 text-brand-green font-600 hover:text-brand-greenDark transition-colors"
            >
              <PhoneCall className="w-4 h-4" /> Inquire about add-ons
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ADDONS.map((a) => (
              <div
                key={a.label}
                className="reveal group flex items-center gap-4 bg-white rounded-2xl p-5 shadow-soft ring-1 ring-black/5 hover:shadow-lift hover:-translate-y-0.5 transition-all"
              >
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-brand-sage text-brand-green group-hover:bg-brand-green group-hover:text-brand-cream transition-colors shrink-0">
                  <a.icon className="w-5 h-5" />
                </span>
                <span className="font-medium text-brand-ink">{a.label}</span>
              </div>
            ))}
            <div className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-green/30 p-4 text-sm text-brand-ink/60">
              Something else in mind? Just ask — we're flexible.
            </div>
          </div>
        </div>

        {/* One-time cleaning callout */}
        <div className="reveal mt-14 rounded-[1.75rem] bg-brand-green text-brand-cream p-8 md:p-12 shadow-lift grain relative overflow-hidden">
          <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-8 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-brand-amberLight font-semibold">Not on a schedule?</p>
              <h3 className="mt-3 font-serif text-3xl md:text-4xl font-600">{ONE_TIME.title}</h3>
              <p className="mt-4 text-brand-cream/80 leading-relaxed max-w-xl">{ONE_TIME.body}</p>
            </div>
            <div className="md:justify-self-end flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => go("#quote")}
                className="group inline-flex items-center justify-center gap-2 bg-brand-amber hover:bg-brand-amberLight text-brand-ink font-600 px-7 py-4 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5"
              >
                Get a one-time quote
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-brand-cream font-600 px-7 py-4 rounded-full border border-white/20 transition-all hover:-translate-y-0.5"
              >
                <PhoneCall className="w-4 h-4" /> Call us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddOns;
