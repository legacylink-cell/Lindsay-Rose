import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, HeartHandshake, Gift, Home, CheckCircle2, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "../mock";
import { usePageHead } from "../hooks/usePageHead";
import Footer from "../components/Footer";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TITLE = "Bright Blessing of the Month | Nominate a DFW Home \u2014 Bright at Home Cleaning";
const DESCRIPTION =
  "Each month Bright at Home Cleaning gifts one complimentary home cleaning to a DFW neighbor walking through a hard season. Nominate a neighbor, a friend, or yourself \u2014 nominators receive $25 off their first cleaning.";

const RELATIONSHIPS = ["Neighbor", "Family", "Church", "Myself", "Other"];

const STEPS = [
  { icon: HeartHandshake, title: "Nominate someone", body: "Tell us about a neighbor, friend, family member, church member \u2014 or yourself. The story stays private with our team." },
  { icon: Home, title: "We prayerfully select one home", body: "Our owners and Operations Director choose one DFW home each month and confirm the family wants it. This is a blessing, not a random drawing." },
  { icon: Gift, title: "We clean it at no cost", body: "A standard clean \u2014 living areas, kitchen, baths and floors \u2014 gifted free to a home that needs a little extra brightness." },
];

const BrightBlessing = () => {
  const [cycle, setCycle] = useState(null);
  const [live, setLive] = useState(null);
  const [form, setForm] = useState({
    nominator_name: "", nominator_phone: "", nominator_email: "", nominator_city: "",
    nominee_name: "", nominee_city: "", nominee_phone: "", why: "",
    relationship: RELATIONSHIPS[0], permission_to_contact: false,
    understands_selected: false, wants_discount: false, company: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  usePageHead({ title: TITLE, description: DESCRIPTION, path: "/bright-blessing", noindex: live === false });

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetch(`${API}/site-settings`)
      .then((r) => r.json())
      .then((d) => { setCycle(d.nominations); setLive(d.nominations_live); })
      .catch(() => setCycle({ is_open: true }));
  }, []);

  const update = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nominator_name || !form.nominator_phone || !form.nominator_email) {
      toast.error("Please add your name, phone and email so we can reach you.");
      return;
    }
    if (!form.nominee_name || !form.why) {
      toast.error("Please tell us who you're nominating and why.");
      return;
    }
    if (!form.understands_selected) {
      toast.error("Please confirm you understand this is a selected blessing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/nominations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      toast.success("Nomination received. Thank you for noticing them.");
    } catch {
      toast.error("Something went wrong. Please call us at " + BRAND.phone + ".");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/55 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition";
  const labelCls = "block text-sm font-medium text-brand-ink mb-1.5";
  const open = !cycle || cycle.is_open;

  return (
    <div className="bg-brand-cream min-h-screen" data-testid="bright-blessing-page">
      <header className="bg-brand-green text-brand-cream">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-brand-cream/80 hover:text-brand-cream transition-colors" data-testid="blessing-back-home">
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
          <a href={BRAND.phoneHref} className="flex items-center gap-2 text-sm font-600 text-brand-amberLight hover:text-brand-cream transition-colors">
            <Phone className="w-4 h-4" /> {BRAND.phone}
          </a>
        </div>
      </header>

      {live === false && (
        <div data-testid="blessing-preview-notice" className="bg-brand-amber/15 border-b border-brand-amber/30">
          <p className="max-w-5xl mx-auto px-5 md:px-8 py-2.5 text-xs text-brand-ink/75">
            Private preview — this page isn't linked anywhere on the site or visible to search engines yet.
          </p>
        </div>
      )}

      <section className="relative overflow-hidden bg-brand-green text-brand-cream grain">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-amberLight font-semibold">Faith in action</p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-700 leading-[1.05]">
            Bright Blessing<br />of the Month
          </h1>
          <p className="mt-5 font-serif text-lg md:text-xl italic text-brand-amberLight">One home made bright.</p>
          <p className="mt-6 max-w-2xl text-brand-cream/80 leading-relaxed">
            Every month, Bright at Home Cleaning gifts one complimentary home cleaning to a DFW neighbor
            walking through a hard season — illness, grief, caregiving, a new baby, job loss, recovery
            after surgery. Know someone who could use a clean home and a deep breath? Nominate them.
            You can even nominate yourself.
          </p>
          {cycle?.closes_label && open && (
            <p className="mt-6 inline-block rounded-full bg-white/10 px-5 py-2.5 text-sm font-600" data-testid="blessing-deadline">
              Nominations close {cycle.closes_label} · DFW homes only
            </p>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-700 text-brand-ink">How it works</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-white rounded-2xl p-6 shadow-soft ring-1 ring-black/5">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-brand-sage text-brand-green">
                <s.icon className="w-5 h-5" />
              </span>
              <p className="mt-4 text-xs font-600 text-brand-amber">Step {i + 1}</p>
              <h3 className="mt-1 font-600 text-brand-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-brand-ink/70 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-brand-sage p-5">
          <Gift className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
          <p className="text-sm text-brand-ink/80">
            <span className="font-600 text-brand-green">A thank-you for noticing someone:</span> submit a
            complete nomination and you'll receive $25 off your first cleaning if you'd like Bright at Home
            in your own house. New customers, one per household, good for 60 days.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 md:px-8 pb-20" id="nominate">
        <div className="bg-white rounded-[2rem] p-7 md:p-10 shadow-lift ring-1 ring-black/5">
          {!open ? (
            <div className="text-center py-8" data-testid="blessing-closed">
              <span className="grid place-items-center w-16 h-16 rounded-full bg-brand-sage text-brand-green mx-auto mb-5">
                <HeartHandshake className="w-8 h-8" />
              </span>
              <h2 className="font-serif text-3xl font-700 text-brand-ink">Nominations are closed for {cycle?.month_label}</h2>
              <p className="mt-3 text-brand-ink/70 max-w-md mx-auto">
                We're prayerfully reviewing this month's nominations and selecting one home.
                The next round opens {cycle?.next_open_label}.
              </p>
              <a href={BRAND.phoneHref} className="mt-6 inline-flex items-center gap-2 text-sm font-600 text-brand-green hover:text-brand-greenDark">
                <Phone className="w-4 h-4" /> {BRAND.phone}
              </a>
            </div>
          ) : submitted ? (
            <div className="text-center py-8" data-testid="blessing-submitted">
              <span className="grid place-items-center w-16 h-16 rounded-full bg-brand-sage text-brand-green mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8" />
              </span>
              <h2 className="font-serif text-3xl font-700 text-brand-ink">Nomination received</h2>
              <p className="mt-3 text-brand-ink/70 max-w-md mx-auto">
                Thank you for caring about them, {form.nominator_name.split(" ")[0]}. We review nominations
                through {cycle?.closes_label} and select one DFW home. We may not be able to clean every
                home nominated, but every story is read.
              </p>
              <p className="mt-3 text-sm text-brand-ink/60 max-w-md mx-auto">
                Our team will follow up with you about your $25-off thank-you.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ ...form, nominee_name: "", nominee_city: "", nominee_phone: "", why: "", understands_selected: false }); }}
                className="mt-6 text-sm font-semibold text-brand-green hover:text-brand-greenDark"
                data-testid="blessing-nominate-another"
              >
                Nominate someone else
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="blessing-form">
              <div>
                <h2 className="font-serif text-3xl font-700 text-brand-ink">Nominate a home</h2>
                <p className="mt-2 text-sm text-brand-ink/65">
                  Private form — their story stays with our team and is never posted publicly.
                </p>
              </div>

              <fieldset className="space-y-4">
                <legend className="text-xs uppercase tracking-[0.18em] text-brand-amber font-semibold mb-3">About you</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bb-name" className={labelCls}>Your name *</label>
                    <input id="bb-name" data-testid="bb-nominator-name" autoComplete="name" className={inputCls} value={form.nominator_name} onChange={update("nominator_name")} placeholder="Your full name" />
                  </div>
                  <div>
                    <label htmlFor="bb-phone" className={labelCls}>Your phone *</label>
                    <input id="bb-phone" data-testid="bb-nominator-phone" type="tel" autoComplete="tel" className={inputCls} value={form.nominator_phone} onChange={update("nominator_phone")} placeholder="Your phone number" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bb-email" className={labelCls}>Your email *</label>
                    <input id="bb-email" data-testid="bb-nominator-email" type="email" autoComplete="email" className={inputCls} value={form.nominator_email} onChange={update("nominator_email")} placeholder="you@email.com" />
                  </div>
                  <div>
                    <label htmlFor="bb-city" className={labelCls}>Your city</label>
                    <input id="bb-city" data-testid="bb-nominator-city" autoComplete="address-level2" className={inputCls} value={form.nominator_city} onChange={update("nominator_city")} placeholder="Your city" />
                  </div>
                </div>
                <div>
                  <label htmlFor="bb-rel" className={labelCls}>Your relationship to them</label>
                  <select id="bb-rel" data-testid="bb-relationship" className={inputCls} value={form.relationship} onChange={update("relationship")}>
                    {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </fieldset>

              <fieldset className="space-y-4 pt-2 border-t border-border">
                <legend className="text-xs uppercase tracking-[0.18em] text-brand-amber font-semibold mb-3 mt-4">Who you're nominating</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bb-nominee" className={labelCls}>Their name *</label>
                    <input id="bb-nominee" data-testid="bb-nominee-name" className={inputCls} value={form.nominee_name} onChange={update("nominee_name")} placeholder="Their full name" />
                  </div>
                  <div>
                    <label htmlFor="bb-nominee-city" className={labelCls}>Their city or ZIP</label>
                    <input id="bb-nominee-city" data-testid="bb-nominee-city" className={inputCls} value={form.nominee_city} onChange={update("nominee_city")} placeholder="City or ZIP code" />
                  </div>
                </div>
                <div>
                  <label htmlFor="bb-nominee-phone" className={labelCls}>Their phone <span className="text-brand-ink/50">(if you know it)</span></label>
                  <input id="bb-nominee-phone" data-testid="bb-nominee-phone" type="tel" className={inputCls} value={form.nominee_phone} onChange={update("nominee_phone")} placeholder="Optional" />
                </div>
                <div>
                  <label htmlFor="bb-why" className={labelCls}>Why this home? *</label>
                  <textarea id="bb-why" data-testid="bb-why" rows={5} className={inputCls} value={form.why} onChange={update("why")} placeholder="Two to four sentences is plenty. Share the season they're walking through." />
                  <p className="mt-1.5 text-xs text-brand-ink/55">This stays private with our team.</p>
                </div>
              </fieldset>

              <fieldset className="space-y-3 pt-2 border-t border-border">
                <legend className="text-xs uppercase tracking-[0.18em] text-brand-amber font-semibold mb-3 mt-4">Before you send</legend>
                <label className="flex items-start gap-3 text-sm text-brand-ink/80 cursor-pointer">
                  <input type="checkbox" data-testid="bb-permission" className="mt-0.5 w-4 h-4 rounded border-input text-brand-green focus:ring-brand-green/40" checked={form.permission_to_contact} onChange={update("permission_to_contact")} />
                  <span>It's okay for us to contact them about this nomination.</span>
                </label>
                <label className="flex items-start gap-3 text-sm text-brand-ink/80 cursor-pointer">
                  <input type="checkbox" data-testid="bb-understands" className="mt-0.5 w-4 h-4 rounded border-input text-brand-green focus:ring-brand-green/40" checked={form.understands_selected} onChange={update("understands_selected")} />
                  <span>I understand this is a selected blessing, not a random drawing. *</span>
                </label>
                <label className="flex items-start gap-3 text-sm text-brand-ink/80 cursor-pointer">
                  <input type="checkbox" data-testid="bb-discount" className="mt-0.5 w-4 h-4 rounded border-input text-brand-green focus:ring-brand-green/40" checked={form.wants_discount} onChange={update("wants_discount")} />
                  <span>I want the $25-off first cleaning if I book Bright at Home.</span>
                </label>
              </fieldset>

              <input type="text" name="company" value={form.company} onChange={update("company")} tabIndex="-1" autoComplete="off" aria-hidden="true" className="hidden" />

              <button
                type="submit"
                disabled={loading}
                data-testid="bb-submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-greenDark text-brand-cream font-semibold px-6 py-4 rounded-full transition-all hover:shadow-lift hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send nomination"} <Send className="w-4 h-4" />
              </button>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-brand-ink/60">
                <ShieldCheck className="w-3.5 h-3.5" /> One blessing awarded each month · One free clean per household per year · DFW service area only
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrightBlessing;
