import React, { useState } from "react";
import { Send, Phone, Mail, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "../mock";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICE_TYPES = [
  "Recurring home cleaning",
  "Deep cleaning",
  "One-time cleaning",
  "Move in / move out",
  "Commercial / office",
  "Post-construction",
];

const QuoteForm = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", service: SERVICE_TYPES[0], details: "", company: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please add your name, email and phone so we can reach you.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      toast.success("Thanks! We'll reply within 24 hours on weekdays.");
    } catch (err) {
      toast.error("Something went wrong. Please call us at " + BRAND.phone + ".");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/55 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition";

  return (
    <section id="quote" className="section-pad">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] rounded-[2rem] overflow-hidden shadow-lift ring-1 ring-black/5">
          {/* left info panel */}
          <div className="bg-brand-green text-brand-cream p-8 md:p-12 relative grain">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-amberLight font-semibold">Get a free quote</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl font-700">Let's brighten your space</h2>
            <p className="mt-4 text-brand-cream/75 leading-relaxed max-w-md">
              Tell us a little about your home or business and we'll send a clear, no-obligation quote — usually within 24 hours on weekdays.
            </p>

            <div className="mt-10 space-y-5">
              <a href={BRAND.phoneHref} className="flex items-center gap-4 group">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors shrink-0"><Phone className="w-5 h-5 text-brand-amberLight" /></span>
                <span className="min-w-0"><span className="block text-xs text-brand-cream/60">Call us</span><span className="font-600 break-words">{BRAND.phone}</span></span>
              </a>
              <a href={`mailto:${BRAND.email}`} className="flex items-center gap-4 group">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors shrink-0"><Mail className="w-5 h-5 text-brand-amberLight" /></span>
                <span className="min-w-0"><span className="block text-xs text-brand-cream/60">Email</span><span className="font-600 break-all">{BRAND.email}</span></span>
              </a>
              <div className="flex items-center gap-4">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/10 shrink-0"><Clock className="w-5 h-5 text-brand-amberLight" /></span>
                <span className="min-w-0"><span className="block text-xs text-brand-cream/60">Hours</span><span className="font-600 break-words">{BRAND.hours}</span></span>
              </div>
              <div className="flex items-center gap-4">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/10 shrink-0"><MapPin className="w-5 h-5 text-brand-amberLight" /></span>
                <span className="min-w-0"><span className="block text-xs text-brand-cream/60">Serving</span><span className="font-600 break-words">{BRAND.area}</span></span>
              </div>
            </div>
          </div>

          {/* right form */}
          <div className="bg-white p-8 md:p-12">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <span className="grid place-items-center w-16 h-16 rounded-full bg-brand-sage text-brand-green mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </span>
                <h3 className="font-serif text-3xl font-700 text-brand-ink">Request received!</h3>
                <p className="mt-3 text-brand-ink/65 max-w-sm">
                  Thanks, {form.name.split(" ")[0]}. We'll review your details and reply within 24 hours on weekdays. Check your spam folder just in case.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", city: "", service: SERVICE_TYPES[0], details: "" }); }}
                  className="mt-6 text-sm font-semibold text-brand-green hover:text-brand-greenDark"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="qf-name" className="block text-sm font-medium text-brand-ink mb-1.5">Full name *</label>
                    <input id="qf-name" name="name" autoComplete="name" className={inputCls} value={form.name} onChange={update("name")} placeholder="Your full name" />
                  </div>
                  <div>
                    <label htmlFor="qf-phone" className="block text-sm font-medium text-brand-ink mb-1.5">Phone *</label>
                    <input id="qf-phone" name="phone" type="tel" autoComplete="tel" className={inputCls} value={form.phone} onChange={update("phone")} placeholder="Your phone number" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="qf-email" className="block text-sm font-medium text-brand-ink mb-1.5">Email *</label>
                    <input id="qf-email" name="email" type="email" autoComplete="email" className={inputCls} value={form.email} onChange={update("email")} placeholder="Your email address" />
                  </div>
                  <div>
                    <label htmlFor="qf-city" className="block text-sm font-medium text-brand-ink mb-1.5">City</label>
                    <input id="qf-city" name="city" autoComplete="address-level2" className={inputCls} value={form.city} onChange={update("city")} placeholder="Your city" />
                  </div>
                </div>
                <div>
                  <label htmlFor="qf-service" className="block text-sm font-medium text-brand-ink mb-1.5">Service needed</label>
                  <select id="qf-service" name="service" className={inputCls} value={form.service} onChange={update("service")}>
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="qf-details" className="block text-sm font-medium text-brand-ink mb-1.5">Tell us about your space</label>
                  <textarea id="qf-details" name="details" rows={4} className={inputCls} value={form.details} onChange={update("details")} placeholder="Share any details that help us prepare your quote" />
                </div>
                <input type="text" name="company" value={form.company} onChange={update("company")} tabIndex="-1" autoComplete="off" aria-hidden="true" className="hidden" />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream font-semibold px-6 py-4 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send my quote request"} <Send className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-brand-ink/60">No obligation. We never share your details.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
