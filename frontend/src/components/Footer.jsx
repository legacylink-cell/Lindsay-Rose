import React from "react";
import { Leaf, Phone, Mail, MapPin, Clock } from "lucide-react";
import { BRAND, NAV_LINKS } from "../mock";

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Footer = () => {
  return (
    <footer className="bg-brand-ink text-brand-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-green text-brand-cream">
                <Leaf className="w-5 h-5" />
              </span>
              <span className="leading-none">
                <span className="block font-serif text-xl font-600">{BRAND.name}</span>
                <span className="block text-[10px] tracking-[0.22em] uppercase text-brand-cream/50">Cleaning Co.</span>
              </span>
            </div>
            <p className="mt-5 text-brand-cream/60 max-w-sm leading-relaxed">
              {BRAND.tagline} Family-run, bonded & insured, and obsessed with the details — for homes and businesses across DFW.
            </p>
            <button
              onClick={() => go("#quote")}
              className="mt-6 bg-brand-amber hover:bg-brand-amberLight text-brand-ink font-semibold px-6 py-3 rounded-full transition-all hover:-translate-y-0.5"
            >
              Get your free quote
            </button>
          </div>

          <div>
            <h4 className="text-sm font-600 uppercase tracking-wider text-brand-cream/80">Explore</h4>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <button onClick={() => go(l.href)} className="text-brand-cream/60 hover:text-brand-amberLight transition-colors text-sm">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-600 uppercase tracking-wider text-brand-cream/80">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-brand-cream/60">
              <li><a href={BRAND.phoneHref} className="flex items-center gap-2.5 hover:text-brand-amberLight transition-colors"><Phone className="w-4 h-4" /> {BRAND.phone}</a></li>
              <li className="flex items-center gap-2.5"><Mail className="w-4 h-4" /> {BRAND.email}</li>
              <li className="flex items-center gap-2.5"><Clock className="w-4 h-4" /> {BRAND.hours}</li>
              <li className="flex items-center gap-2.5"><MapPin className="w-4 h-4" /> {BRAND.area}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-cream/45">
          <p>© {new Date().getFullYear()} {BRAND.full}. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
            <p>Bonded & Insured · Eco-Friendly · 100% Satisfaction Guarantee</p>
            <span className="hidden sm:inline text-brand-cream/20">|</span>
            <p>
              Designed by{" "}
              <a
                href="#"
                className="font-semibold text-brand-amberLight hover:text-brand-amber transition-colors"
              >
                Mo Studio
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
