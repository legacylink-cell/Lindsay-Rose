import React from "react";
import { Star } from "lucide-react";

const LOGOS = [
  {
    id: "01",
    file: "/logos/logo-01-house-b-horizontal.png",
    name: "House “B” Horizontal",
    desc: "Primary lockup from your brand sheet — house-B mark, green wordmark, gold “Cleaning” with rule marks.",
    use: "Best for the website header, invoices, business cards.",
    recommended: true,
  },
  {
    id: "02",
    file: "/logos/logo-02-b-emblem.png",
    name: "“B” House Emblem (Icon)",
    desc: "Bold standalone monogram — the house-shaped “B” with gold window.",
    use: "Ideal as the favicon, app icon, and social avatar.",
  },
  {
    id: "03",
    file: "/logos/logo-03-mountain.png",
    name: "Rooftop Emblem",
    desc: "Elegant rooftop crest with a green swoosh and classic serif wordmark.",
    use: "A premium, upscale feel for signage and print.",
  },
  {
    id: "04",
    file: "/logos/logo-04-roofline.png",
    name: "Minimal Roofline",
    desc: "Thin gold roofline outline with a refined serif wordmark.",
    use: "Clean and modern — great for light, minimal layouts.",
  },
  {
    id: "05",
    file: "/logos/logo-05-script-compact.png",
    name: "Script — Compact",
    desc: "Gold handwritten “Bright” paired with a bold green serif.",
    use: "Warm and personal — nice for social posts.",
  },
  {
    id: "06",
    file: "/logos/logo-06-script-stacked.png",
    name: "Script — Signature",
    desc: "Flowing gold signature “Bright” with a stacked serif block.",
    use: "Boutique, hand-crafted feel for marketing pieces.",
  },
];

const BrandPreview = () => {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink" data-testid="brand-preview-page">
      <header className="border-b border-black/10 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-green/70 font-semibold">Bright at Home Cleaning</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl font-700 text-brand-green">Logo Variations — Pick Your Favorite</h1>
          <p className="mt-3 text-brand-ink/70 max-w-2xl">
            Here are all the logo options on both dark and light backgrounds so you can compare. Tell me the number you want and I’ll set it live across the header, footer, favicon and social preview.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-12 space-y-10">
        {LOGOS.map((l) => (
          <section
            key={l.id}
            data-testid={`logo-option-${l.id}`}
            className="rounded-3xl bg-white shadow-soft ring-1 ring-black/5 overflow-hidden"
          >
            <div className="grid md:grid-cols-[1fr_1.2fr]">
              {/* Info */}
              <div className="p-7 md:p-9 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-green text-brand-cream font-serif font-700">{l.id}</span>
                  <h2 className="font-serif text-2xl font-700 text-brand-ink">{l.name}</h2>
                </div>
                {l.recommended && (
                  <span className="mt-3 inline-flex items-center gap-1.5 self-start bg-brand-amber text-brand-ink text-xs font-bold px-3 py-1.5 rounded-full">
                    <Star className="w-3 h-3 fill-brand-ink" /> Matches your primary brand sheet
                  </span>
                )}
                <p className="mt-4 text-brand-ink/75 leading-relaxed">{l.desc}</p>
                <p className="mt-3 text-sm text-brand-green font-600">{l.use}</p>
              </div>

              {/* Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="grid place-items-center p-8 bg-[#333333] min-h-[220px]">
                  <img src={l.file} alt={`${l.name} on dark`} className="max-h-40 w-auto object-contain" />
                </div>
                <div className="grid place-items-center p-8 bg-brand-cream border-t sm:border-t-0 sm:border-l border-black/10 min-h-[220px]">
                  <img src={l.file} alt={`${l.name} on light`} className="max-h-40 w-auto object-contain" />
                </div>
              </div>
            </div>

            {/* Header-size mock */}
            <div className="flex items-center gap-4 px-7 md:px-9 py-5 border-t border-black/10 bg-white">
              <span className="text-xs uppercase tracking-[0.22em] text-brand-ink/50 font-semibold shrink-0">Header size</span>
              <img src={l.file} alt={`${l.name} small`} className="h-11 w-auto object-contain" />
            </div>
          </section>
        ))}

        <section className="rounded-3xl bg-brand-green text-brand-cream p-8 md:p-10 text-center">
          <h2 className="font-serif text-2xl font-700">Ready to choose?</h2>
          <p className="mt-3 text-brand-cream/80 max-w-xl mx-auto">
            Just reply with the option number (for example, “Let’s go with Logo 01”). I’ll place it in the header and footer, generate a matching favicon and social share image, and update the site to your new brand palette and fonts.
          </p>
        </section>
      </main>
    </div>
  );
};

export default BrandPreview;
