import React from "react";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { BRAND, NAV_LINKS } from "../mock";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

const go = (href) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const TERMS = [
  {
    h: "1. Services",
    p: `${BRAND.full} provides residential and commercial cleaning services throughout the Dallas–Fort Worth metroplex. The specific scope of each cleaning is agreed upon in your quote. Your first visit is an initial deep cleaning and may take additional time.`,
  },
  {
    h: "2. Quotes & Pricing",
    p: "All quotes are estimates based on the information you provide and may be adjusted after an in-person or virtual assessment. Recurring clients receive our best per-visit pricing and are never locked into a contract.",
  },
  {
    h: "3. Scheduling & Access",
    p: "You agree to provide safe, reasonable access to the property at the scheduled time. If we are unable to access the property, a cancellation fee may apply. Please provide at least 24 hours' notice to reschedule or cancel.",
  },
  {
    h: "4. Satisfaction Guarantee",
    p: "We stand behind our work with a 100% satisfaction guarantee. If any area does not meet your expectations, notify us within 24 hours and we will return to re-clean the affected area at no additional cost.",
  },
  {
    h: "5. Payment",
    p: "Payment is due upon completion of service unless other arrangements have been made in writing. Commercial accounts may be invoiced according to agreed terms.",
  },
  {
    h: "6. Liability",
    p: "We are bonded and insured. We take great care in your home or business; however, we ask that fragile, high-value, or sentimental items be secured prior to service. Please report any concerns within 24 hours of service.",
  },
  {
    h: "7. Privacy",
    p: "Any personal information you share with us is used solely to provide and improve our services and is never sold to third parties.",
  },
];

const TermsDialog = ({ children }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-w-2xl bg-brand-cream text-brand-ink border-none">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl text-brand-ink">Terms &amp; Conditions</DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[65vh] pr-4">
        <p className="text-sm text-brand-ink/65 mb-4">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}. These terms are a general placeholder and should be reviewed by legal counsel before publishing.
        </p>
        <div className="space-y-5">
          {TERMS.map((t) => (
            <div key={t.h}>
              <h4 className="font-600 text-brand-ink">{t.h}</h4>
              <p className="mt-1 text-sm text-brand-ink/70 leading-relaxed">{t.p}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

const Footer = () => {
  return (
    <footer className="bg-brand-ink text-brand-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="inline-flex bg-brand-cream rounded-2xl p-3" data-testid="footer-logo">
              <img src="/logos/logo-b-rooftop-emblem-t.png" alt={BRAND.full} className="h-20 w-auto object-contain" />
            </div>
            <p className="mt-3 font-serif text-lg italic text-brand-amberLight">{BRAND.tagline}</p>
            <p className="mt-3 text-brand-cream/70 max-w-sm leading-relaxed">
              Family-run, bonded & insured, and obsessed with the details — for homes and businesses across Collin County, Dallas County, and all of DFW.
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
                  <button onClick={() => go(l.href)} className="text-brand-cream/70 hover:text-brand-amberLight transition-colors text-sm">
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <a href="/careers" className="text-brand-cream/70 hover:text-brand-amberLight transition-colors text-sm">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-600 uppercase tracking-wider text-brand-cream/80">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-brand-cream/70">
              <li><a href={BRAND.phoneHref} className="flex items-center gap-2.5 hover:text-brand-amberLight transition-colors"><Phone className="w-4 h-4 shrink-0" /> {BRAND.phone}</a></li>
              <li><a href={`mailto:${BRAND.email}`} className="flex items-center gap-2.5 hover:text-brand-amberLight transition-colors break-all"><Mail className="w-4 h-4 shrink-0" /> {BRAND.email}</a></li>
              <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 shrink-0" /> {BRAND.hours}</li>
              <li className="flex items-start gap-2.5"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {BRAND.address}</li>
            </ul>

            <h4 className="mt-6 text-sm font-600 uppercase tracking-wider text-brand-cream/80">Follow us</h4>
            <div className="mt-3 flex items-center gap-3">
              {BRAND.social.facebook && (
                <a href={BRAND.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="grid place-items-center w-10 h-10 rounded-xl bg-white/10 hover:bg-brand-amber hover:text-brand-ink text-brand-cream transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {BRAND.social.instagram && (
                <a href={BRAND.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="grid place-items-center w-10 h-10 rounded-xl bg-white/10 hover:bg-brand-amber hover:text-brand-ink text-brand-cream transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-cream/70">
          <p>© {new Date().getFullYear()} {BRAND.full}. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
            <p>Bonded & Insured · Eco-Friendly · 100% Satisfaction Guarantee</p>
            <span className="hidden sm:inline text-brand-cream/20">|</span>
            <TermsDialog>
              <button className="font-medium text-brand-cream/60 hover:text-brand-amberLight transition-colors underline-offset-2 hover:underline">
                Terms & Conditions
              </button>
            </TermsDialog>
            <span className="hidden sm:inline text-brand-cream/20">|</span>
            <p>
              Designed by{" "}
              <a
                href="https://mozeid.com/"
                target="_blank"
                rel="noopener noreferrer"
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
