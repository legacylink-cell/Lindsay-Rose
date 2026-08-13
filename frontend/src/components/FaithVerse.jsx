import React from "react";
import { Sun } from "lucide-react";

const FaithVerse = () => {
  return (
    <section className="relative overflow-hidden bg-brand-greenDark text-brand-cream grain">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20 text-center relative">
        <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-white/10 text-brand-amberLight mb-6">
          <Sun className="w-7 h-7" />
        </span>
        <blockquote className="font-serif text-2xl md:text-4xl leading-snug font-600">
          “Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.”
        </blockquote>
        <p className="mt-5 text-brand-amberLight tracking-[0.22em] uppercase text-sm font-600">Matthew 5:16</p>
        <p className="mt-4 text-brand-cream/70 max-w-xl mx-auto">
          Faith is at the heart of who we are. We aim to let that light shine through in every home and business we care for.
        </p>
      </div>
    </section>
  );
};

export default FaithVerse;
