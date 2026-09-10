import React, { useState, useEffect, useCallback } from "react";
import { Lock, LogOut, Inbox, Briefcase, RefreshCw, AlarmClock, CalendarClock, Trash2, Check, CalendarCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "bah_admin_token";
const OVERDUE_HRS = 24;

const STATUS_STYLES = {
  new: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  contacted: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  booked: "bg-brand-sage text-brand-green ring-1 ring-brand-green/20",
};

const Admin = () => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [tab, setTab] = useState("quotes");
  const [quotes, setQuotes] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const [q, a] = await Promise.all([
        fetch(`${API}/admin/quotes`, opts),
        fetch(`${API}/admin/applications`, opts),
      ]);
      if (q.status === 401 || a.status === 401) { logout(); toast.error("Session expired, please log in."); return; }
      setQuotes(await q.json());
      setApps(await a.json());
    } catch {
      toast.error("Could not load submissions.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const fmt = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };

  const setStatus = async (item, status) => {
    const path = tab === "quotes" ? "quotes" : "applications";
    const setter = tab === "quotes" ? setQuotes : setApps;
    setter((p) => p.map((x) => (x.id === item.id ? { ...x, status } : x)));
    try {
      const res = await fetch(`${API}/admin/${path}/${item.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "new" ? "Moved back to New." : `Marked ${status}.`);
    } catch {
      setter((p) => p.map((x) => (x.id === item.id ? { ...x, status: item.status || "new" } : x)));
      toast.error("Could not update. Please try again.");
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete this ${tab === "quotes" ? "quote request" : "application"} from ${item.name}? This can't be undone.`)) return;
    try {
      const path = tab === "quotes" ? "quotes" : "applications";
      const res = await fetch(`${API}/admin/${path}/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      if (tab === "quotes") setQuotes((p) => p.filter((x) => x.id !== item.id));
      else setApps((p) => p.filter((x) => x.id !== item.id));
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

  const list = tab === "quotes" ? quotes : apps;

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
                  <p className="mt-3 font-serif text-3xl font-700 text-brand-ink">{s.value}</p>
                  <p className="text-sm text-brand-ink/60">{s.label}</p>
                </div>
              ))}
            </div>
          );
        })()}

        <div className="inline-flex bg-white rounded-full p-1 shadow-soft ring-1 ring-black/5 mb-6">
          <button onClick={() => setTab("quotes")} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-600 transition-all ${tab === "quotes" ? "bg-brand-green text-brand-cream" : "text-brand-ink/60"}`}><Inbox className="w-4 h-4" /> Quote Requests ({quotes.length})</button>
          <button onClick={() => setTab("apps")} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-600 transition-all ${tab === "apps" ? "bg-brand-green text-brand-cream" : "text-brand-ink/60"}`}><Briefcase className="w-4 h-4" /> Applications ({apps.length})</button>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-brand-ink/60 shadow-soft ring-1 ring-black/5">No {tab === "quotes" ? "quote requests" : "applications"} yet.</div>
        ) : (
          <div className="space-y-3">
            {list.map((item) => {
              const status = item.status || "new";
              const hrs = (Date.now() - new Date(item.created_at).getTime()) / 3600000;
              const overdue = tab === "quotes" && status === "new" && hrs >= OVERDUE_HRS;
              return (
              <div key={item.id} data-testid={`submission-card-${item.id}`} className={`bg-white rounded-2xl p-5 shadow-soft ring-1 ${overdue ? "ring-2 ring-amber-300" : "ring-black/5"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-600 text-brand-ink">{item.name}</span>
                    <a href={`tel:${item.phone}`} className="text-sm text-brand-green">{item.phone}</a>
                    <a href={`mailto:${item.email}`} className="text-sm text-brand-ink/60">{item.email}</a>
                    <span data-testid={`status-badge-${item.id}`} className={`text-[11px] font-600 uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
                      {status}
                    </span>
                    {overdue && (
                      <span data-testid={`overdue-flag-${item.id}`} className="inline-flex items-center gap-1 text-[11px] font-600 text-amber-700">
                        <AlarmClock className="w-3.5 h-3.5" /> Needs reply
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
                  {item.service && <span className="bg-brand-sage text-brand-green px-2.5 py-1 rounded-full">{item.service}</span>}
                  {item.city && <span className="bg-brand-sage text-brand-green px-2.5 py-1 rounded-full">{item.city}</span>}
                  {item.position && <span className="bg-brand-sage text-brand-green px-2.5 py-1 rounded-full">{item.position}</span>}
                </div>
                {(item.details || item.message) && <p className="mt-3 text-sm text-brand-ink/75">{item.details || item.message}</p>}
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
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
                  {status !== "new" && (
                    <button onClick={() => setStatus(item, "new")} data-testid={`mark-new-${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-600 px-3 py-2 rounded-full text-brand-ink/60 hover:text-brand-ink transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> Back to new
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
