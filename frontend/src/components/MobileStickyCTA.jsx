import React from "react";
import { Phone } from "lucide-react";
import { BRAND } from "../mock";

// Always-visible call / quote bar for mobile visitors (hidden on desktop).
const MobileStickyCTA = () => {
  const toQuote = (e) => {
    e.preventDefault();
    const el = document.querySelector("#quote");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      data-testid="mobile-sticky-cta"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-brand-cream/95 backdrop-blur-md border-t border-border flex gap-3 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]"
    >
      <a
        href={BRAND.phoneHref}
        data-testid="mobile-cta-call"
        className="flex-1 flex items-center justify-center gap-2 border-2 border-brand-green text-brand-green font-semibold py-3 rounded-full active:scale-[0.98] transition-transform"
      >
        <Phone className="w-4 h-4" /> Call
      </a>
      <a
        href="#quote"
        onClick={toQuote}
        data-testid="mobile-cta-quote"
        className="flex-1 flex items-center justify-center bg-brand-green text-brand-cream font-semibold py-3 rounded-full active:scale-[0.98] transition-transform"
      >
        Get a free quote
      </a>
    </div>
  );
};

export default MobileStickyCTA;
