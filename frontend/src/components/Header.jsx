import React, { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { BRAND, NAV_LINKS } from "../mock";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-brand-cream/90 backdrop-blur-md shadow-soft py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between">
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-2.5 group">
          <span className="grid place-items-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-brand-green transition-transform group-hover:scale-105">
            <img src="/logo-icon.png" alt="" aria-hidden="true" className="w-9 h-9 md:w-11 md:h-11 object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-2xl md:text-[1.7rem] font-600 tracking-wide text-brand-ink">{BRAND.name}</span>
            <span className="block text-[11px] tracking-[0.3em] uppercase text-brand-amber">Cleaning</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="text-sm font-medium text-brand-ink/75 hover:text-brand-green transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-brand-amber after:transition-all hover:after:w-full"
            >
              {l.label}
            </button>
          ))}
          <a
            href="/careers"
            className="text-sm font-medium text-brand-ink/75 hover:text-brand-green transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-brand-amber after:transition-all hover:after:w-full"
          >
            Careers
          </a>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href={BRAND.phoneHref} className="flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-greenLight transition-colors">
            <Phone className="w-4 h-4" /> {BRAND.phone}
          </a>
          <button
            onClick={() => go("#quote")}
            className="bg-brand-green hover:bg-brand-greenDark text-brand-cream text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5"
          >
            Get a free quote
          </button>
        </div>

        <button className="lg:hidden text-brand-ink p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-brand-cream border-t border-border mt-3 px-5 py-4 shadow-soft">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <button key={l.href} onClick={() => go(l.href)} className="text-left py-3 text-brand-ink/80 font-medium border-b border-border/60">
                {l.label}
              </button>
            ))}
            <a href="/careers" className="text-left py-3 text-brand-ink/80 font-medium border-b border-border/60">
              Careers
            </a>
            <a href={BRAND.phoneHref} className="flex items-center gap-2 py-3 text-brand-green font-semibold">
              <Phone className="w-4 h-4" /> {BRAND.phone}
            </a>
            <button onClick={() => go("#quote")} className="mt-2 bg-brand-green text-brand-cream font-semibold px-5 py-3 rounded-full">
              Get a free quote
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
