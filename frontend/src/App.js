import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Services from "./components/Services";
import Commercial from "./components/Commercial";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import ServiceAreas from "./components/ServiceAreas";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import QuoteForm from "./components/QuoteForm";
import Footer from "./components/Footer";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    // Safety fallback: if IntersectionObserver isn't available, reveal everything.
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("in-view"));
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
    els.forEach((el) => obs.observe(el));
    // Extra safety net: never let content stay invisible for long.
    const t = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.in-view)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add("in-view");
      });
    }, 2500);
    return () => {
      obs.disconnect();
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
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return (
    <div className="App bg-brand-cream">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Services />
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
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
