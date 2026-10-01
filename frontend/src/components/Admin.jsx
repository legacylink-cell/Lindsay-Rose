import React, { useState, useEffect, useCallback } from "react";
import { Lock, LogOut, Inbox, Briefcase, RefreshCw, AlarmClock, CalendarClock, Trash2, Check, CalendarCheck, RotateCcw, MailWarning, Send, AlertTriangle, ShieldCheck, HeartHandshake, Eye, EyeOff, X, Download, ShieldAlert, Undo2 } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "bah_admin_token";
const OVERDUE_HRS = 24;

const TAB_META = {
  quotes: { path: "quotes", kind: "quote", label: "quote requests" },
  apps: { path: "applications", kind: "application", label: "applications" },
  noms: { path: "nominations", kind: "nomination", label: "nominations" },
};

const STATUS_STYLES = {
  new: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  contacted: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  booked: "bg-brand-sage text-brand-green ring-1 ring-brand-green/20",
  reviewing: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  selected: "bg-brand-sage text-brand-green ring-1 ring-brand-green/20",
  not_selected: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
};

// Nominations carry a different shape to quotes/applications.
const normalize = (item, tab) => {
  if (tab !== "noms") {
    return {
      name: item.name, phone: item.phone, email: item.email,
      chips: [item.service, item.city, item.position].filter(Boolean),
      body: item.details || item.message,
    };
  }
  return {
    name: item.nominator_name,
    phone: item.nominator_phone,
    email: item.nominator_email,
    chips: [
      item.nominee_name ? `For: ${item.nominee_name}` : null,
      item.nominee_city,
      item.relationship,
      item.wants_discount ? "Wants BRIGHT25" : null,
      item.permission_to_contact ? "OK to contact" : "No contact permission",
    ].filter(Boolean),
    body: item.why,
  };
};

const Admin = () => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [tab, setTab] = useState("quotes");
  const [quotes, setQuotes] = useState([]);
  const [apps, setApps] = useState([]);
  const [noms, setNoms] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [announce, setAnnounce] = useState({ first_name: "", city: "", note: "" });
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const setterFor = (t) => (t === "quotes" ? setQuotes : t === "apps" ? setApps : setNoms);

  const resend = async (item) => {
    try {
      const res = await fetch(`${API}/admin/${TAB_META[tab].kind}s/${item.id}/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const ok = data?.delivery?.email?.status === "sent";
      toast[ok ? "success" : "error"](ok ? "Sent." : "Still failing — check delivery settings.");
      load();
    } catch {
      toast.error("Could not resend.");
    }
  };

  const togglePublish = async () => {
    const next = !settings?.nominations_live;
    if (next && !window.confirm("Publish the Bright Blessing page? It will be linked in the header, footer and homepage, and visible to search engines.")) return;
    setSettings((s) => ({ ...s, nominations_live: next }));
    try {
      const res = await fetch(`${API}/admin/site-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nominations_live: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Bright Blessing page is now live on the site." : "Bright Blessing page is hidden again.");
    } catch {
      setSettings((s) => ({ ...s, nominations_live: !next }));
      toast.error("Could not change that. Please try again.");
    }
  };

  const notSpam = async (item) => {
    try {
      const res = await fetch(`${API}/admin/${TAB_META[tab].kind}s/${item.id}/not-spam`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Restored and emailed to you.");
      load();
    } catch {
      toast.error("Could not restore that one.");
    }
  };

  const exportNominators = async () => {
    try {
      const res = await fetch(`${API}/admin/nominations/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bright-blessing-nominators.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Nominator list downloaded.");
    } catch {
      toast.error("Could not build the export.");
    }
  };

  const addAnnouncement = async () => {
    if (!announce.first_name.trim() || !announce.city.trim()) {
      toast.error("A first name and city are required.");
      return;
    }
    try {
      const res = await fetch(`${API}/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(announce),
      });
      if (!res.ok) throw new Error();
      setAnnounce({ first_name: "", city: "", note: "" });
      toast.success("Saved as a draft — publish it when you're ready.");
      loadAnnouncements();
    } catch {
      toast.error("Could not save that.");
    }
  };

  const toggleAnnouncement = async (a) => {
    const next = !a.published;
    setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? { ...x, published: next } : x)));
    try {
      const res = await fetch(`${API}/admin/announcements/${a.id}/publish?published=${next}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Now showing on the page." : "Hidden from the page.");
    } catch {
      setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? { ...x, published: a.published } : x)));
      toast.error("Could not change that.");
    }
  };

  const deleteAnnouncement = async (a) => {
    if (!window.confirm(`Remove ${a.first_name} from ${a.city}?`)) return;
    try {
      await fetch(`${API}/admin/announcements/${a.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadAnnouncements();
    } catch {
      toast.error("Could not remove that.");
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      toast.success("Welcome back!");
    } catch {
      toast.error("Incorrect username or password.");
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  };

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const opts = { headers: { Authorization: `Bearer ${token}` } };
      const [q, a, n, h, s] = await Promise.all([
        fetch(`${API}/admin/quotes`, opts),
        fetch(`${API}/admin/applications`, opts),
        fetch(`${API}/admin/nominations`, opts),
        fetch(`${API}/admin/delivery-health`, opts),
        fetch(`${API}/site-settings`),
      ]);
      if (q.status === 401 || a.status === 401) { logout(); toast.error("Session expired, please log in."); return; }
      setQuotes(await q.json());
      setApps(await a.json());
      if (n.ok) setNoms(await n.json());
      if (h.ok) setHealth(await h.json());
      if (s.ok) setSettings(await s.json());
    } catch {
      toast.error("Could not load submissions.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadAnnouncements = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAnnouncements(await res.json());
    } catch { /* non-critical */ }
  }, [token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  // Keep the health panel current so a fixed channel turns green on its own.
  useEffect(() => {
    if (!token) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${API}/admin/delivery-health`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setHealth(await res.json());
      } catch { /* transient, next tick retries */ }
    }, 60000);
    return () => clearInterval(id);
  }, [token]);

  const fmt = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };

  const setStatus = async (item, status) => {
    const setter = setterFor(tab);
    setter((p) => p.map((x) => (x.id === item.id ? { ...x, status } : x)));
    try {
      const res = await fetch(`${API}/admin/${TAB_META[tab].path}/${item.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "new" ? "Moved back to New." : `Marked ${status.replace("_", " ")}.`);
    } catch {
      setter((p) => p.map((x) => (x.id === item.id ? { ...x, status: item.status || "new" } : x)));
      toast.error("Could not update. Please try again.");
    }
  };

  const remove = async (item) => {
    const who = item.name || item.nominator_name;
    if (!window.confirm(`Delete this submission from ${who}? This can't be undone.`)) return;
    try {
      const res = await fetch(`${API}/admin/${TAB_META[tab].path}/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setterFor(tab)((p) => p.filter((x) => x.id !== item.id));
      toast.success("Deleted.");
    } catch {
      toast.error("Could not delete. Please try again.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-cream px-5">
        <form onSubmit={login} className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-lift ring-1 ring-black/5">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logos/logo-b-rooftop-emblem-t.png" alt="Bright at Home Cleaning" className="h-12 w-auto object-contain" />
            <div className="leading-tight">
              <p className="text-[10px] tracking-[0.28em] uppercase text-brand-amber">Admin</p>
            </div>
          </div>
          <h1 className="font-serif text-2xl font-700 text-brand-ink flex items-center gap-2"><Lock className="w-5 h-5 text-brand-green" /> Sign in</h1>
          <div className="mt-5 space-y-3">
            <input className="w-full rounded-xl border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40" placeholder="Username" value={creds.username} onChange={(e) => setCreds({ ...creds, username: e.target.value })} />
            <input type="password" className="w-full rounded-xl border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40" placeholder="Password" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} />
            <button type="submit" className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-cream font-600 px-6 py-3 rounded-full transition-colors">Sign in</button>
          </div>
        </form>
      </div>
    );
  }

  const list = (tab === "quotes" ? quotes : tab === "apps" ? apps : noms).filter((x) => !x.spam);
  const spamList = (tab === "quotes" ? quotes : tab === "apps" ? apps : noms).filter((x) => x.spam);

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logos/logo-b-rooftop-emblem-t.png" alt="Bright at Home Cleaning" className="h-10 w-auto object-contain" />
            <p className="font-serif text-lg font-700 text-brand-ink">Submissions Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink/70 hover:text-brand-green px-3 py-2"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
            <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink/70 hover:text-red-600 px-3 py-2"><LogOut className="w-4 h-4" /> Log out</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">
        {health && (() => {
          const emailBroken = !health.email_configured || health.smtp_login_ok === false;
          const backlog = health.undelivered > 0;
          const telegramMissing = !health.telegram_configured;
          const allGood = !emailBroken && !backlog && !telegramMissing;
          const tone = (emailBroken || backlog)
            ? { box: "bg-red-50 ring-red-200", icon: "text-red-600", head: "text-red-900", body: "text-red-800" }
            : telegramMissing
              ? { box: "bg-amber-50 ring-amber-200", icon: "text-amber-600", head: "text-amber-900", body: "text-amber-800" }
              : { box: "bg-brand-sage ring-brand-green/20", icon: "text-brand-green", head: "text-brand-green", body: "text-brand-ink/75" };
          const Icon = allGood ? ShieldCheck : AlertTriangle;
          return (
            <div data-testid="delivery-health-banner" data-health={allGood ? "healthy" : emailBroken || backlog ? "error" : "warning"}
                 className={`mb-6 rounded-2xl ${tone.box} ring-1 p-5 flex items-start gap-3`}>
              <Icon className={`w-5 h-5 ${tone.icon} shrink-0 mt-0.5`} />
              <div className={`text-sm ${tone.head} w-full`}>
                <p className="font-600">
                  {allGood ? "All lead alerts are working" : emailBroken || backlog ? "Lead alerts need attention" : "One more alert channel available"}
                </p>
                <ul className={`mt-1.5 space-y-1 ${tone.body}`}>
                  <li data-testid="health-email" className="flex items-center gap-2">
                    {health.email_configured && health.smtp_login_ok !== false
                      ? <><Check className="w-3.5 h-3.5 text-brand-green" /> Email alerts working — verified with Google just now</>
                      : !health.email_configured
                        ? <><MailWarning className="w-3.5 h-3.5" /> Email credentials are missing — no lead emails can be sent</>
                        : <span title={health.smtp_error || ""} className="flex items-center gap-2"><MailWarning className="w-3.5 h-3.5" /> Google is rejecting the mailbox sign-in — the app password needs to be regenerated</span>}
                  </li>
                  <li data-testid="health-telegram" className="flex items-center gap-2">
                    {health.telegram_configured
                      ? <><Check className="w-3.5 h-3.5 text-brand-green" /> Phone alerts connected</>
                      : <><AlarmClock className="w-3.5 h-3.5" /> Phone alerts aren't connected yet — you're relying on email alone</>}
                  </li>
                  <li data-testid="health-backlog" className="flex items-center gap-2">
                    {backlog
                      ? <><MailWarning className="w-3.5 h-3.5" /> {health.undelivered} lead{health.undelivered === 1 ? "" : "s"} still waiting to be emailed — retrying automatically</>
                      : <><Check className="w-3.5 h-3.5 text-brand-green" /> Every lead has been delivered</>}
                  </li>
                </ul>
              </div>
            </div>
          );
        })()}
        {(() => {
          const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
          const all = [...quotes, ...apps];
          const newThisWeek = all.filter((x) => {
            const t = new Date(x.created_at).getTime();
            return !isNaN(t) && t >= weekAgo;
          }).length;
          const stats = [
            { icon: Inbox, label: "Quote requests", value: quotes.length },
            { icon: Briefcase, label: "Applications", value: apps.length },
            { icon: AlarmClock, label: "Awaiting reply", value: quotes.filter((q) => (q.status || "new") === "new").length },
            { icon: CalendarClock, label: "New this week", value: newThisWeek },
          ];
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-soft ring-1 ring-black/5">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-sage text-brand-green">
                    <s.icon className="w-5 h-5" />
                  </span>
                  <p className="mt-3 text-3xl font-700 text-brand-ink tabular-nums">{s.value}</p>
                  <p className="text-sm text-brand-ink/60">{s.label}</p>
                </div>
              ))}
            </div>
          );
        })()}

        <div className="inline-flex bg-white rounded-full p-1 shadow-soft ring-1 ring-black/5 mb-6">
          <button onClick={() => setTab("quotes")} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-600 transition-all ${tab === "quotes" ? "bg-brand-green text-brand-cream" : "text-brand-ink/60"}`}><Inbox className="w-4 h-4" /> Quote Requests ({quotes.length})</button>
          <button onClick={() => setTab("apps")} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-600 transition-all ${tab === "apps" ? "bg-brand-green text-brand-cream" : "text-brand-ink/60"}`}><Briefcase className="w-4 h-4" /> Applications ({apps.length})</button>
          <button onClick={() => setTab("noms")} data-testid="tab-nominations" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-600 transition-all ${tab === "noms" ? "bg-brand-green text-brand-cream" : "text-brand-ink/60"}`}><HeartHandshake className="w-4 h-4" /> Nominations ({noms.length})</button>
        </div>

        {tab === "noms" && settings && (
          <div data-testid="blessing-publish-panel" className="mb-6 bg-white rounded-2xl p-5 shadow-soft ring-1 ring-black/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-600 text-brand-ink flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-brand-green" /> Bright Blessing page
              </p>
              <p className="mt-1 text-sm text-brand-ink/65">
                {settings.nominations_live
                  ? "Live on the site — linked in the header, footer and homepage."
                  : "Hidden — reachable only by direct link, and kept out of Google."}
                {" "}
                <a href="/bright-blessing" target="_blank" rel="noreferrer" className="text-brand-green font-600 underline-offset-2 hover:underline" data-testid="blessing-preview-link">
                  Preview the page
                </a>
              </p>
              {settings.nominations && (
                <p className="mt-1 text-xs text-brand-ink/55">
                  {settings.nominations.is_open
                    ? `This month's nominations are open and close ${settings.nominations.closes_label}.`
                    : `Nominations are closed for ${settings.nominations.month_label}; the next round opens ${settings.nominations.next_open_label}.`}
                </p>
              )}
            </div>
            <button
              onClick={togglePublish}
              data-testid="blessing-publish-toggle"
              aria-pressed={!!settings.nominations_live}
              className={`inline-flex items-center gap-2 text-sm font-600 px-5 py-2.5 rounded-full transition-colors ${settings.nominations_live ? "bg-brand-sage text-brand-green hover:bg-red-50 hover:text-red-700" : "bg-brand-green text-brand-cream hover:bg-brand-greenDark"}`}
            >
              {settings.nominations_live ? <><EyeOff className="w-4 h-4" /> Hide from site</> : <><Eye className="w-4 h-4" /> Publish to site</>}
            </button>
          </div>
        )}

        {tab === "noms" && (
          <div className="mb-6 grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-soft ring-1 ring-black/5">
              <p className="font-600 text-brand-ink flex items-center gap-2"><Download className="w-4 h-4 text-brand-green" /> Nominator list</p>
              <p className="mt-1 text-sm text-brand-ink/65">
                Every nominator with their phone, email and whether they asked for the $25 code — ready for Mayra.
              </p>
              <button onClick={exportNominators} data-testid="export-nominators" className="mt-4 inline-flex items-center gap-2 text-sm font-600 px-5 py-2.5 rounded-full bg-brand-green text-brand-cream hover:bg-brand-greenDark transition-colors">
                <Download className="w-4 h-4" /> Download CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-soft ring-1 ring-black/5" data-testid="announcements-panel">
              <p className="font-600 text-brand-ink flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-brand-green" /> Homes we've blessed</p>
              <p className="mt-1 text-sm text-brand-ink/65">
                Shown on the page as first name and city only — never the story.
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                <input data-testid="announce-first-name" className="rounded-xl border border-input bg-white px-3 py-2 text-sm" placeholder="First name" value={announce.first_name} onChange={(e) => setAnnounce({ ...announce, first_name: e.target.value })} />
                <input data-testid="announce-city" className="rounded-xl border border-input bg-white px-3 py-2 text-sm" placeholder="City" value={announce.city} onChange={(e) => setAnnounce({ ...announce, city: e.target.value })} />
              </div>
              <input data-testid="announce-note" className="mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm" placeholder="Optional short line (no story details)" value={announce.note} onChange={(e) => setAnnounce({ ...announce, note: e.target.value })} />
              <button onClick={addAnnouncement} data-testid="announce-add" className="mt-3 inline-flex items-center gap-2 text-sm font-600 px-5 py-2.5 rounded-full bg-brand-sage text-brand-green hover:bg-brand-green hover:text-brand-cream transition-colors">
                <Check className="w-4 h-4" /> Save as draft
              </button>

              {announcements.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-border pt-3">
                  {announcements.map((a) => (
                    <li key={a.id} data-testid={`announcement-${a.id}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-brand-ink/80">
                        <span className="font-600">{a.first_name}</span> — {a.city}
                        <span className="text-brand-ink/50"> · {a.month_label}</span>
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleAnnouncement(a)} data-testid={`announcement-toggle-${a.id}`} className={`text-xs font-600 px-3 py-1.5 rounded-full transition-colors ${a.published ? "bg-brand-sage text-brand-green" : "bg-neutral-100 text-brand-ink/60"}`}>
                          {a.published ? "Showing" : "Draft"}
                        </button>
                        <button onClick={() => deleteAnnouncement(a)} data-testid={`announcement-delete-${a.id}`} className="text-brand-ink/40 hover:text-red-600 transition-colors" aria-label="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-brand-ink/60 shadow-soft ring-1 ring-black/5">No {TAB_META[tab].label} yet.</div>
        ) : (
          <div className="space-y-3">
            {list.map((item) => {
              const status = item.status || "new";
              const hrs = (Date.now() - new Date(item.created_at).getTime()) / 3600000;
              const overdue = tab === "quotes" && status === "new" && hrs >= OVERDUE_HRS;
              const emailStatus = item.delivery?.email?.status;
              const emailFailed = emailStatus && emailStatus !== "sent";
              const v = normalize(item, tab);
              return (
              <div key={item.id} data-testid={`submission-card-${item.id}`} className={`bg-white rounded-2xl p-5 shadow-soft ring-1 ${overdue ? "ring-2 ring-amber-300" : "ring-black/5"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-600 text-brand-ink">{v.name}</span>
                    <a href={`tel:${v.phone}`} className="text-sm text-brand-green">{v.phone}</a>
                    <a href={`mailto:${v.email}`} className="text-sm text-brand-ink/60">{v.email}</a>
                    <span data-testid={`status-badge-${item.id}`} className={`text-[11px] font-600 uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
                      {status.replace("_", " ")}
                    </span>
                    {overdue && (
                      <span data-testid={`overdue-flag-${item.id}`} className="inline-flex items-center gap-1 text-[11px] font-600 text-amber-700">
                        <AlarmClock className="w-3.5 h-3.5" /> Needs reply
                      </span>
                    )}
                    {emailFailed && (
                      <span data-testid={`email-failed-flag-${item.id}`} title={item.delivery?.email?.error || ""} className="inline-flex items-center gap-1 text-[11px] font-600 text-red-700 bg-red-50 ring-1 ring-red-200 px-2 py-1 rounded-full">
                        <MailWarning className="w-3.5 h-3.5" /> Email not sent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-brand-ink/50">{fmt(item.created_at)}</span>
                    <button onClick={() => remove(item)} data-testid={`delete-submission-${item.id}`} className="text-brand-ink/40 hover:text-red-600 transition-colors" aria-label="Delete submission" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {v.chips.map((c) => (
                    <span key={c} className="bg-brand-sage text-brand-green px-2.5 py-1 rounded-full">{c}</span>
                  ))}
                </div>
                {tab === "noms" && item.nominee_phone && (
                  <p className="mt-2 text-xs text-brand-ink/60">Nominee phone: <a href={`tel:${item.nominee_phone}`} className="text-brand-green">{item.nominee_phone}</a></p>
                )}
                {v.body && <p className="mt-3 text-sm text-brand-ink/75 whitespace-pre-line">{v.body}</p>}
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
                  {tab === "noms" ? (
                    <>
                      {status !== "reviewing" && (
                        <button onClick={() => setStatus(item, "reviewing")} data-testid={`mark-reviewing-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-full bg-brand-green text-brand-cream hover:bg-brand-greenDark transition-colors">
                          <Check className="w-3.5 h-3.5" /> Mark reviewing
                        </button>
                      )}
                      {status !== "selected" && (
                        <button onClick={() => setStatus(item, "selected")} data-testid={`mark-selected-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-full bg-brand-sage text-brand-green hover:bg-brand-green hover:text-brand-cream transition-colors">
                          <HeartHandshake className="w-3.5 h-3.5" /> Select this home
                        </button>
                      )}
                      {status !== "not_selected" && (
                        <button onClick={() => setStatus(item, "not_selected")} data-testid={`mark-not-selected-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-full text-brand-ink/60 hover:text-brand-ink transition-colors">
                          <X className="w-3.5 h-3.5" /> Not this month
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {status !== "contacted" && (
                        <button onClick={() => setStatus(item, "contacted")} data-testid={`mark-contacted-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-full bg-brand-green text-brand-cream hover:bg-brand-greenDark transition-colors">
                          <Check className="w-3.5 h-3.5" /> Mark contacted
                        </button>
                      )}
                      {tab === "quotes" && status !== "booked" && (
                        <button onClick={() => setStatus(item, "booked")} data-testid={`mark-booked-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-full bg-brand-sage text-brand-green hover:bg-brand-green hover:text-brand-cream transition-colors">
                          <CalendarCheck className="w-3.5 h-3.5" /> Mark booked
                        </button>
                      )}
                    </>
                  )}
                  {status !== "new" && (
                    <button onClick={() => setStatus(item, "new")} data-testid={`mark-new-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-full text-brand-ink/60 hover:text-brand-ink transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> Back to new
                    </button>
                  )}
                  {emailFailed && (
                    <button onClick={() => resend(item)} data-testid={`resend-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors">
                      <Send className="w-3.5 h-3.5" /> Resend email
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {spamList.length > 0 && (
          <details className="mt-6 bg-white rounded-2xl shadow-soft ring-1 ring-black/5 overflow-hidden" data-testid="spam-group">
            <summary className="cursor-pointer px-5 py-4 text-sm font-600 text-brand-ink/70 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-ink/40" />
              Filtered as spam ({spamList.length}) — not emailed to you
            </summary>
            <div className="border-t border-border divide-y divide-border">
              {spamList.map((item) => {
                const v = normalize(item, tab);
                return (
                  <div key={item.id} data-testid={`spam-card-${item.id}`} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-600 text-brand-ink/70">{v.name}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-xs text-brand-ink/45" title={item.spam_reason || ""}>{item.spam_reason}</span>
                        <button onClick={() => notSpam(item)} data-testid={`not-spam-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-full bg-brand-sage text-brand-green hover:bg-brand-green hover:text-brand-cream transition-colors">
                          <Undo2 className="w-3.5 h-3.5" /> Not spam
                        </button>
                        <button onClick={() => remove(item)} data-testid={`delete-submission-${item.id}`} className="text-brand-ink/35 hover:text-red-600 transition-colors" aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </div>
                    {v.body && <p className="mt-1.5 text-xs text-brand-ink/50 line-clamp-2">{v.body}</p>}
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default Admin;
