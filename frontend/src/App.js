import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Services from "./components/Services";
import AddOns from "./components/AddOns";
import Commercial from "./components/Commercial";
import About from "./components/About";
import FaithVerse from "./components/FaithVerse";
import Differentiators from "./components/Differentiators";
import HowItWorks from "./components/HowItWorks";
import ServiceAreas from "./components/ServiceAreas";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import QuoteForm from "./components/QuoteForm";
import Footer from "./components/Footer";
import MobileStickyCTA from "./components/MobileStickyCTA";
import Careers from "./components/Careers";
import Admin from "./components/Admin";
import BrandPreview from "./components/BrandPreview";
import ServicePage from "./pages/ServicePage";

function useReveal() {
  useEffect(() => {
    const revealVisible = () => {
      document.querySelectorAll(".reveal:not(.in-view)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add("in-view");
      });
    };
    // Safety fallback: if IntersectionObserver isn't available, reveal everything.
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    // Backup: a live-query scroll/resize handler reveals any .reveal element that
    // enters the viewport, even if the observer missed it (e.g. dev hot reload).
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; revealVisible(); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    revealVisible();
    const t = setTimeout(revealVisible, 1500);
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t);
    };
  }, []);
}

const Landing = () => {
  useReveal();
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      // Arrived from another page with a section hash (e.g. /#commercial) — scroll to it once rendered.
      const t = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return (
    <div className="App bg-brand-cream">
      <Header />
      <main>
        <Hero />
        <FaithVerse />
        <TrustBar />
        <Services />
        <Differentiators />
        <AddOns />
        <Commercial />
        <About />
        <HowItWorks />
        <Pricing />
        <ServiceAreas />
        <Testimonials />
        <FAQ />
        <QuoteForm />
      </main>
      <Footer />
      <div aria-hidden className="h-20 lg:hidden" />
      <MobileStickyCTA />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/brand" element={<BrandPreview />} />
        <Route path="/services/:slug" element={<ServicePage />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
