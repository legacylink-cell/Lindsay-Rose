import React from "react";
import { Phone, Star } from "lucide-react";

const NAV = ["Services", "Commercial", "How it works", "Areas", "Reviews", "Careers"];

const LOGOS = [
  {
    id: "A",
    file: "/logos/logo-a-house-horizontal-t.png",
    h: "h-11 md:h-12",
    name: "House “B” Horizontal",
    desc: "The primary lockup from your brand sheet — house-B mark with the green wordmark and gold “Cleaning” rule marks. Clean, balanced, instantly readable.",
    recommended: true,
  },
  {
    id: "B",
    file: "/logos/logo-b-rooftop-emblem-t.png",
    h: "h-14 md:h-16",
    name: "Rooftop Emblem",
    desc: "Upscale twin-roof crest with a green swoosh and classic serif wordmark. Premium and distinctive — great as a statement mark.",
  },
  {
    id: "C",
    file: "/logos/logo-c-script-t.png",
    h: "h-11 md:h-12",
    name: "Script Signature",
    desc: "Gold handwritten “Bright” paired with a bold serif. Warm, personal and boutique — feels hand-crafted.",
  },
  {
    id: "D",
    file: "/logos/logo-d-bold-wordmark-t.png",
    h: "h-10 md:h-11",
    name: "Bold Wordmark",
    desc: "Confident gold serif “BRIGHT” with a green boxed “Cleaning”. Modern, high-contrast and strong at any size.",
  },
];

const HeaderMock = ({ logo }) => (
  <div className="rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-lift">
    {/* Mock site header — real cream theme, unchanged */}
    <div className="flex items-center justify-between px-5 md:px-8 py-4 bg-brand-cream border-b border-black/5">
      <img src={logo.file} alt={logo.name} className={`${logo.h} w-auto object-contain`} />
      <nav className="hidden lg:flex items-center gap-6">
        {NAV.map((n) => (
          <span key={n} className="text-[13px] text-brand-ink/80 font-medium">{n}</span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <span className="hidden md:inline-flex items-center gap-1.5 text-brand-ink/85 text-sm font-semibold">
          <Phone className="w-4 h-4 text-brand-green" /> 469-443-6903
        </span>
        <span className="inline-flex items-center bg-brand-green text-brand-cream text-sm font-bold px-4 py-2 rounded-full">
          Get a free quote
        </span>
      </div>
    </div>
    {/* Mock hero strip for context */}
    <div className="bg-white px-5 md:px-8 py-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-brand-green/70 font-semibold">Guided by our Christian faith</p>
      <h3 className="mt-2 font-serif text-2xl md:text-3xl font-700 leading-tight text-brand-ink">
        We brighten your space, <span className="text-brand-green">so you get your time back.</span>
      </h3>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center bg-brand-green text-brand-cream text-sm font-bold px-5 py-2.5 rounded-full">Get your free quote</span>
        <span className="inline-flex items-center gap-1 text-sm text-brand-ink/70 font-medium">
          <Star className="w-4 h-4 text-brand-amber fill-brand-amber" /> 5.0 · 65+ Google reviews
        </span>
      </div>
    </div>
  </div>
);

const BrandPreview = () => {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink" data-testid="brand-preview-page">
      <header className="border-b border-black/10 bg-white/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-6">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-green/70 font-semibold">Bright at Home Cleaning</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl font-700 text-brand-green">Logo Options — On Your Live Header</h1>
          <p className="mt-3 text-brand-ink/70 max-w-2xl">
            Same cream header we already use — the header color isn’t changing. I’ve removed each logo’s dark background so it sits cleanly on the real theme. Tell me which letter you want (e.g. “Let’s go with Logo A”) and I’ll set it live everywhere and build a matching favicon + share image.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-12 space-y-14">
        {LOGOS.map((l) => (
          <section key={l.id} data-testid={`logo-option-${l.id}`}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-green text-brand-cream font-serif font-700">{l.id}</span>
              <h2 className="font-serif text-2xl font-700 text-brand-ink">{l.name}</h2>
              {l.recommended && (
                <span className="inline-flex items-center gap-1.5 bg-brand-amber text-brand-ink text-xs font-bold px-3 py-1.5 rounded-full">
                  <Star className="w-3 h-3 fill-brand-ink" /> Matches your primary brand sheet
                </span>
              )}
            </div>
            <p className="text-brand-ink/75 max-w-3xl mb-5">{l.desc}</p>
            <HeaderMock logo={l} />
          </section>
        ))}

        <section className="rounded-3xl bg-brand-green text-brand-cream p-8 md:p-10 text-center">
          <h2 className="font-serif text-2xl font-700">Ready to choose?</h2>
          <p className="mt-3 text-brand-cream/80 max-w-xl mx-auto">
            Reply with the letter (A, B, C or D). I’ll place it in the header and footer, generate a matching favicon and social share image, and finalize your new brand look.
          </p>
        </section>
      </main>
    </div>
  );
};

export default BrandPreview;
