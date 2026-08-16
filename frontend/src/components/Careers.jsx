import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Phone, Target, Eye, Heart, ShieldCheck, TrendingUp, Leaf,
  Clock, CheckCircle2, Send, Briefcase, MapPin, Users, DollarSign, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "../mock";
import Footer from "./Footer";

const VALUES = [
  { icon: Heart, title: "Genuine Care", desc: "We treat every home, office, and teammate the way we'd want to be treated." },
  { icon: ShieldCheck, title: "Integrity", desc: "We do what we say — on time, every time, whether or not anyone is watching." },
  { icon: Users, title: "Teamwork", desc: "We win together, support each other, and celebrate the wins big and small." },
  { icon: TrendingUp, title: "Growth", desc: "We invest in training and promote from within so you can build a real career." },
];

const PERKS = [
  { icon: DollarSign, label: "Competitive pay plus tips & bonuses" },
  { icon: Clock, label: "Flexible scheduling — most weekends off" },
  { icon: Leaf, label: "All eco-friendly supplies & equipment provided" },
  { icon: TrendingUp, label: "Paid training and room to grow into lead roles" },
  { icon: Heart, label: "A supportive, family-run team culture" },
];

const POSITIONS = [
  { title: "Residential Cleaning Technician", type: "Full-time / Part-time", area: "Collin & Dallas County" },
  { title: "Commercial / Janitorial Cleaner", type: "Evenings", area: "DFW Metroplex" },
  { title: "Team Lead & Trainer", type: "Full-time", area: "Collin & Dallas County" },
  { title: "Customer Care Coordinator", type: "Full-time", area: "Denton, TX" },
];

const Careers = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: POSITIONS[0].title, message: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const inputCls =
    "w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/55 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please add your name, email and phone so we can reach you.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      toast.success("Application received! We'll be in touch soon.");
    } catch (err) {
      toast.error("Something went wrong. Please email " + BRAND.email + ".");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen">
      {/* top bar */}
      <header className="bg-brand-cream border-b border-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center group" data-testid="careers-logo">
            <img src="/logos/logo-b-rooftop-emblem-t.png" alt={BRAND.full} className="h-16 md:h-20 w-auto object-contain transition-opacity duration-200 group-hover:opacity-80" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink/75 hover:text-brand-green transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to site
            </Link>
            <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream text-sm font-600 px-5 py-2.5 rounded-full transition-all">
              <Phone className="w-4 h-4" /> {BRAND.phone}
            </a>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden section-pad">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-brand-sage blur-3xl opacity-60" />
        </div>
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-white border border-black/5 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-green shadow-soft">
            <Briefcase className="w-4 h-4" /> We're hiring across DFW
          </span>
          <h1 className="mt-6 font-serif text-4xl sm:text-6xl font-700 text-brand-ink tracking-tight leading-[1.05]">
            Build a career you're
            <span className="block text-brand-green">proud to come home to.</span>
          </h1>
          <p className="mt-6 text-lg text-brand-ink/70 max-w-2xl mx-auto leading-relaxed">
            At {BRAND.full}, our people are everything. If you take pride in your work, love a job well done, and want to be part of a team that treats you like family — we'd love to meet you.
          </p>
          <a href="#apply" className="mt-8 inline-flex items-center gap-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream font-600 px-7 py-4 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5">
            Apply now
          </a>
        </div>
      </section>

      {/* mission & vision */}
      <section className="pb-4">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-6">
          <div className="bg-brand-green text-brand-cream rounded-[1.75rem] p-8 md:p-10 shadow-lift">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/10 text-brand-amberLight">
              <Target className="w-6 h-6" />
            </span>
            <h2 className="mt-5 font-serif text-3xl font-700">Our Mission</h2>
            <p className="mt-4 text-brand-cream/85 leading-relaxed text-lg">
              To give families and businesses across North Texas the gift of time and peace of mind — delivering meticulous, eco-friendly cleaning through a team we treat like family. We show up on time, care for every detail, and leave every space brighter than we found it.
            </p>
          </div>
          <div className="bg-white rounded-[1.75rem] p-8 md:p-10 shadow-soft ring-1 ring-black/5">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-brand-sage text-brand-green">
              <Eye className="w-6 h-6" />
            </span>
            <h2 className="mt-5 font-serif text-3xl font-700 text-brand-ink">Our Vision</h2>
            <p className="mt-4 text-brand-ink/70 leading-relaxed text-lg">
              To become the most trusted and loved cleaning company in the Dallas–Fort Worth metroplex — known not only for spotless homes and workspaces, but for creating rewarding, respectful careers and setting the standard for integrity, sustainability, and genuine care in our industry.
            </p>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="section-pad">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">What we stand for</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl font-700 text-brand-ink">Our core values</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-7 shadow-soft ring-1 ring-black/5">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-brand-sage text-brand-green">
                  <v.icon className="w-5 h-5" />
                </span>
                <h3 className="mt-4 text-lg font-600 text-brand-ink">{v.title}</h3>
                <p className="mt-1.5 text-sm text-brand-ink/65 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* perks */}
      <section className="pb-4">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-700 text-brand-ink text-center">Why you'll love working here</h2>
          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {PERKS.map((p) => (
              <div key={p.label} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-soft ring-1 ring-black/5">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-sage text-brand-green shrink-0">
                  <p.icon className="w-5 h-5" />
                </span>
                <span className="text-brand-ink/80">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* background check requirement */}
      <section className="pb-4">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <div className="rounded-[1.5rem] bg-brand-green text-brand-cream p-6 md:p-8 flex items-start gap-4 shadow-soft">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/10 text-brand-amberLight shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-serif text-2xl font-700">A note on trust &amp; safety</h3>
              <p className="mt-2 text-brand-cream/85 leading-relaxed">
                Because our team works inside clients' homes and businesses, <span className="font-600 text-brand-cream">a clean, successfully completed background check is a firm requirement</span> for every position, with no exceptions. It's how we keep our clients safe and uphold the trust they place in us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* application form */}
      <section className="section-pad bg-white tex-marble" data-testid="why-work-with-us">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">Why work with us · Por qué unirte</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl font-700 text-brand-ink">A cleaning job you'll actually enjoy</h2>
          <p className="mt-3 text-brand-ink/60 italic">Un trabajo de limpieza que disfrutarás de verdad.</p>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ["Competitive weekly pay", "$XX–$XX/hr · paid weekly", "Pago semanal competitivo"],
              ["Daytime hours — no nights", "Typical Mon–Fri, 8am–5pm", "Horario de día, sin noches"],
              ["Paid training", "We train you — no experience required", "Capacitación pagada"],
              ["Consistent local routes", "Stay close to home across DFW", "Rutas locales constantes"],
              ["Supportive family team", "Be treated like family, not a number", "Equipo que te trata como familia"],
              ["Room to grow", "Grow into lead & supervisor roles", "Oportunidad de crecer"],
            ].map(([en, sub, es]) => (
              <div key={en} className="bg-brand-cream rounded-2xl p-6 ring-1 ring-black/5">
                <h3 className="font-600 text-brand-ink">{en}</h3>
                <p className="mt-1 text-sm text-brand-ink/70">{sub}</p>
                <p className="mt-2 text-sm text-brand-green italic">{es}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-brand-green text-brand-cream p-7 md:p-9 flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-serif text-2xl font-700">Prefer to text? · ¿Prefieres textear?</p>
              <p className="mt-1 text-brand-cream/80">Text us and we'll help you apply. · Envíanos un mensaje y te ayudamos a aplicar.</p>
            </div>
            <a href="sms:+14694436903?&body=Hi%21%20I%27d%20like%20to%20apply%20for%20a%20cleaning%20position." data-testid="text-to-apply" className="shrink-0 inline-flex items-center gap-2 bg-brand-amber hover:bg-brand-amberLight text-brand-ink font-600 px-7 py-4 rounded-full transition-all">
              <MessageSquare className="w-4 h-4" /> Text us to apply
            </a>
          </div>
        </div>
      </section>

      <section id="apply" className="section-pad">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="bg-white rounded-[1.75rem] p-8 md:p-10 shadow-lift ring-1 ring-black/5">
            {submitted ? (
              <div className="text-center py-8">
                <span className="grid place-items-center w-16 h-16 rounded-full bg-brand-sage text-brand-green mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </span>
                <h3 className="font-serif text-3xl font-700 text-brand-ink">Thank you, {form.name.split(" ")[0]}!</h3>
                <p className="mt-3 text-brand-ink/65 max-w-md mx-auto">
                  We've received your application and will be in touch soon. In the meantime, feel free to call us at {BRAND.phone}.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold">Join the team</p>
                  <h2 className="mt-3 font-serif text-4xl font-700 text-brand-ink">Apply today</h2>
                  <p className="mt-3 text-brand-ink/65">Tell us a little about yourself — we read every application.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="c-name" className="block text-sm font-medium text-brand-ink mb-1.5">Full name *</label>
                      <input id="c-name" name="name" autoComplete="name" className={inputCls} value={form.name} onChange={update("name")} placeholder="Your full name" />
                    </div>
                    <div>
                      <label htmlFor="c-phone" className="block text-sm font-medium text-brand-ink mb-1.5">Phone *</label>
                      <input id="c-phone" name="phone" type="tel" autoComplete="tel" className={inputCls} value={form.phone} onChange={update("phone")} placeholder="Your phone number" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="c-email" className="block text-sm font-medium text-brand-ink mb-1.5">Email *</label>
                    <input id="c-email" name="email" type="email" autoComplete="email" className={inputCls} value={form.email} onChange={update("email")} placeholder="Your email address" />
                  </div>
                  <div>
                    <label htmlFor="c-position" className="block text-sm font-medium text-brand-ink mb-1.5">Position of interest</label>
                    <select id="c-position" name="position" className={inputCls} value={form.position} onChange={update("position")}>
                      {POSITIONS.map((p) => <option key={p.title} value={p.title}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="c-message" className="block text-sm font-medium text-brand-ink mb-1.5">Tell us about yourself</label>
                    <textarea id="c-message" name="message" rows={4} className={inputCls} value={form.message} onChange={update("message")} placeholder="Experience, availability, and why you'd be a great fit" />
                  </div>
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream font-600 px-6 py-4 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5">
                    Submit application <Send className="w-4 h-4" />
                  </button>
                  <p className="text-center text-xs text-brand-ink/55">
                    Prefer email? Send your resume to{" "}
                    <a href={`mailto:${BRAND.email}?subject=Job Application`} className="font-600 text-brand-green hover:underline">{BRAND.email}</a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
