/**
 * LandingPage.jsx — Updated
 * - Removed all "Book a Demo" buttons (replaced with "Sign In")
 * - Content matches the real Garanti Fleet product (Analytics, CPK, Compliance, etc.)
 */

import { useState, useEffect } from "react";
import {
  Truck, LayoutDashboard, Users, DollarSign, ShieldCheck,
  ChevronDown, ArrowRight, TrendingUp, AlertTriangle,
  CheckCircle2, Activity, BarChart2, Map, Menu, X,
  Gauge, Building2, Receipt,
} from "lucide-react";

const P = {
  forestDeep:   "#0a1a0f",
  forestDark:   "#0f2318",
  forestMid:    "#163020",
  forestBorder: "#1f4a2e",
  forestAccent: "#22603a",
  green:        "#2d9653",
  greenLight:   "#3ab865",
  greenMuted:   "#4ade80",
  white:        "#f8faf9",
  offWhite:     "#c8d6cd",
  muted:        "#7a9989",
  dimmed:       "#3d5949",
  hairline:     "#1a3d27",
  warning:      "#f59e0b",
  critical:     "#ef4444",
  info:         "#38bdf8",
};

const T = {
  hero:    { fontSize: "clamp(36px, 5.5vw, 68px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em" },
  h2:      { fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em" },
  body:    { fontSize: 16, fontWeight: 400, lineHeight: 1.75 },
  small:   { fontSize: 13, fontWeight: 400, lineHeight: 1.65 },
  caption: { fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" },
};

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav({ onLoginClick }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [activeDD,   setActiveDD]   = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Solutions", items: ["Fleet Analytics", "Compliance Engine", "Driver Management", "Cost Intelligence"] },
    { label: "Features",  items: ["Live Telematics", "CPK Dashboard", "Receipt Pipeline", "Alert Automation"] },
    { label: "Resources", items: ["Documentation", "API Reference", "Support Center"] },
    { label: "Pricing",   items: null },
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(10,26,15,0.97)" : P.forestDeep,
      borderBottom: `1px solid ${scrolled ? P.forestBorder : "transparent"}`,
      backdropFilter: scrolled ? "blur(12px)" : "none",
      transition: "all 0.25s",
    }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", gap: 28 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: P.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: P.white, lineHeight: 1 }}>Garanti Fleet</div>
            <div style={{ ...T.caption, fontSize: 9, color: P.muted, marginTop: 2 }}>Ethiopia Fleet OS</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav style={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
          {links.map(({ label, items }) => (
            <div key={label} style={{ position: "relative" }}
              onMouseEnter={() => setActiveDD(label)}
              onMouseLeave={() => setActiveDD(null)}
            >
              <button style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "8px 14px", background: "none", border: "none",
                color: activeDD === label ? P.white : P.offWhite,
                fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 6,
              }}>
                {label}
                {items && <ChevronDown size={12} style={{ transform: activeDD === label ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />}
              </button>
              {items && activeDD === label && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0,
                  background: P.forestMid, border: `1px solid ${P.forestBorder}`,
                  borderRadius: 10, padding: "6px 0", minWidth: 190,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
                }}>
                  {items.map(item => (
                    <div key={item} style={{ padding: "8px 16px", fontSize: 13, color: P.offWhite, cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = P.forestAccent; e.currentTarget.style.color = P.white; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = P.offWhite; }}
                    >{item}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={onLoginClick} style={{ padding: "8px 18px", background: "none", border: "none", color: P.offWhite, fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = P.white}
            onMouseLeave={e => e.currentTarget.style.color = P.offWhite}
          >Login</button>
          <button onClick={onLoginClick} style={{
            padding: "9px 22px", background: P.green, border: "none",
            color: "#fff", fontSize: 14, fontWeight: 600, borderRadius: 8, cursor: "pointer",
          }}
            onMouseEnter={e => e.currentTarget.style.background = P.greenLight}
            onMouseLeave={e => e.currentTarget.style.background = P.green}
          >Sign In →</button>
          <button onClick={() => setMobileOpen(v => !v)} style={{ display: "none", background: "none", border: "none", color: P.white, cursor: "pointer", padding: 4 }} className="mob-btn">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ background: P.forestDark, borderTop: `1px solid ${P.forestBorder}`, padding: "16px 24px 24px" }}>
          {links.map(({ label }) => (
            <div key={label} style={{ padding: "11px 0", borderBottom: `1px solid ${P.hairline}`, color: P.offWhite, fontSize: 15, cursor: "pointer" }}>{label}</div>
          ))}
          <button onClick={onLoginClick} style={{ marginTop: 18, width: "100%", padding: "12px", background: P.green, border: "none", color: "#fff", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Sign In to Platform →
          </button>
        </div>
      )}

      <style>{`@media(max-width:768px){nav{display:none!important}.mob-btn{display:flex!important}}`}</style>
    </header>
  );
}

// ── DASHBOARD MOCKUP (matches the real product) ───────────────────────────────
function DashboardMockup() {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard"      },
    { icon: Truck,           label: "Vehicles"       },
    { icon: Users,           label: "Drivers"        },
    { icon: DollarSign,      label: "Financials"     },
    { icon: Map,             label: "Live Tracker Map" },
    { icon: BarChart2,       label: "Analytics", active: true },
  ];

  return (
    <div style={{
      background: "#0b1a13", border: `1px solid ${P.forestBorder}`,
      borderRadius: 14, overflow: "hidden", display: "flex", height: 460,
      fontSize: 11, fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
    }}>

      {/* Sidebar */}
      <div style={{ width: 168, background: "#071210", borderRight: `1px solid ${P.hairline}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "13px 13px 10px", borderBottom: `1px solid ${P.hairline}`, display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: P.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={13} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.white }}>Garanti Fleet</div>
            <div style={{ fontSize: 9, color: P.muted }}>Ethiopia Fleet OS</div>
          </div>
        </div>

        <nav style={{ padding: "8px 6px", flex: 1 }}>
          {navItems.map(({ icon: Icon, label, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "6px 9px",
              borderRadius: 6, marginBottom: 2,
              background: active ? P.forestMid : "transparent",
              color: active ? P.greenMuted : P.dimmed,
              border: active ? `1px solid ${P.forestBorder}` : "1px solid transparent",
            }}>
              <Icon size={12} /><span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: "8px 10px", borderTop: `1px solid ${P.hairline}` }}>
          <div style={{ fontSize: 9, color: P.dimmed, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>Active Company</div>
          <div style={{ background: P.forestMid, border: `1px solid ${P.forestBorder}`, borderRadius: 5, padding: "5px 8px", fontSize: 10, color: P.offWhite, fontWeight: 500 }}>
            Abyssinia Transport
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: P.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>A</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: P.white }}>admin</div>
              <div style={{ fontSize: 9, color: P.muted }}>Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d1f16", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ height: 38, background: "#0a1a10", borderBottom: `1px solid ${P.hairline}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 8 }}>
          <BarChart2 size={12} color={P.green} />
          <span style={{ fontSize: 11, fontWeight: 600, color: P.white }}>Abyssinia Transport</span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: P.muted }}>admin · Admin</span>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: `1px solid ${P.hairline}` }}>
          {[{ label: "Scope", val: "All Vehicles" }, { label: "Start Date", val: "12/29/2025" }, { label: "End Date", val: "06/29/2026" }].map(({ label, val }) => (
            <div key={label} style={{ display: "flex", flex: label === "Scope" ? 1.2 : 1, flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 8, color: P.muted }}>{label}</div>
              <div style={{ background: P.forestMid, border: `1px solid ${P.forestBorder}`, borderRadius: 5, padding: "4px 7px", fontSize: 9, color: P.offWhite }}>{val}</div>
            </div>
          ))}
          <div style={{ marginTop: 10, background: P.green, border: "none", borderRadius: 5, padding: "4px 10px", fontSize: 9, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            ↻ Refresh
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, padding: "8px 12px 6px" }}>
          {[
            { label: "Cumulative Spend",        val: "ETB 284,500",  sub: "Approved, non-fuel expenses", color: P.white    },
            { label: "Total Distance Logged",   val: "12,400 km",    sub: "8 vehicles",                  color: P.white    },
            { label: "Average Fleet Efficiency", val: "ETB 22.9/km", sub: "Cost per kilometer (CPK)",    color: P.greenMuted },
          ].map(({ label, val, sub, color }) => (
            <div key={label} style={{ background: P.forestMid, border: `1px solid ${P.forestBorder}`, borderRadius: 8, padding: "9px 11px" }}>
              <div style={{ fontSize: 9, color: P.muted, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 8, color: P.dimmed }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 12px", flex: 1, overflow: "hidden" }}>

          {/* Expense breakdown */}
          <div style={{ background: P.forestMid, border: `1px solid ${P.forestBorder}`, borderRadius: 8, padding: "9px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: P.offWhite, marginBottom: 8 }}>Expense Breakdown by Category</div>
            {[
              { cat: "Maintenance",  pct: 42, amt: "119,490" },
              { cat: "Tires",        pct: 28, amt: "79,660"  },
              { cat: "Insurance",    pct: 18, amt: "51,210"  },
              { cat: "Road Toll",    pct: 8,  amt: "22,760"  },
              { cat: "Other",        pct: 4,  amt: "11,380"  },
            ].map(({ cat, pct, amt }) => (
              <div key={cat} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: P.offWhite }}>{cat}</span>
                  <span style={{ fontSize: 9, color: P.greenMuted, fontWeight: 600 }}>ETB {amt}</span>
                </div>
                <div style={{ background: "#0a1a0f", borderRadius: 3, height: 4, overflow: "hidden" }}>
                  <div style={{ background: P.green, width: `${pct}%`, height: "100%", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* CPK trend */}
          <div style={{ background: P.forestMid, border: `1px solid ${P.forestBorder}`, borderRadius: 8, padding: "9px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: P.offWhite, marginBottom: 8 }}>Cost-Per-Kilometer Trend</div>
            <div style={{ position: "relative", height: 80 }}>
              <svg width="100%" height="80" viewBox="0 0 220 80" preserveAspectRatio="none">
                <polyline points="0,70 30,58 60,62 90,45 120,38 150,42 180,28 220,22"
                  fill="none" stroke={P.green} strokeWidth="1.5" strokeLinejoin="round" />
                <polyline points="0,70 30,58 60,62 90,45 120,38 150,42 180,28 220,22 220,80 0,80"
                  fill={`${P.green}15`} strokeWidth="0" />
                {[0,30,60,90,120,150,180,220].map((x, i) => {
                  const ys = [70,58,62,45,38,42,28,22];
                  return <circle key={i} cx={x} cy={ys[i]} r="2.5" fill={P.green} />;
                })}
              </svg>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {["Jan","Feb","Mar","Apr","May","Jun"].map(m => (
                <span key={m} style={{ fontSize: 8, color: P.dimmed }}>{m}</span>
              ))}
            </div>

            {/* Vehicle comparison mini table */}
            <div style={{ marginTop: 10, borderTop: `1px solid ${P.hairline}`, paddingTop: 7 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: P.offWhite, marginBottom: 5 }}>Vehicle Comparison</div>
              {[
                { plate: "AA-55522", dist: "5,000 km", cost: "ETB 0",      cpk: "ETB 0/km"    },
                { plate: "AA-12345", dist: "4,200 km", cost: "ETB 96,600", cpk: "ETB 23.0/km" },
                { plate: "AA-67890", dist: "3,200 km", cost: "ETB 73,500", cpk: "ETB 22.9/km" },
              ].map(({ plate, dist, cost, cpk }) => (
                <div key={plate} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 4, padding: "4px 0", borderTop: `1px solid ${P.hairline}` }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: P.white }}>{plate}</span>
                  <span style={{ fontSize: 9, color: P.muted }}>{dist}</span>
                  <span style={{ fontSize: 9, color: P.warning }}>{cost}</span>
                  <span style={{ fontSize: 9, color: P.greenMuted, fontWeight: 600 }}>{cpk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? P.forestMid : P.forestDark, border: `1px solid ${hovered ? P.forestAccent : P.forestBorder}`, borderRadius: 14, padding: "26px 24px", transition: "all 0.2s" }}>
      <div style={{ width: 40, height: 40, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Icon size={19} color={accent} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: P.white, marginBottom: 9 }}>{title}</div>
      <div style={{ ...T.small, color: P.muted, lineHeight: 1.7 }}>{body}</div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function LandingPage({ onLoginClick }) {
  return (
    <div style={{ background: P.forestDeep, color: P.white, fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <Nav onLoginClick={onLoginClick} />

      {/* HERO */}
      <section style={{ background: P.forestDeep, paddingTop: 72, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse at center top, rgba(45,150,83,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#0d2b18", border: `1px solid ${P.forestBorder}`, borderRadius: 20, padding: "5px 15px", marginBottom: 30 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.greenMuted }} />
            <span style={{ ...T.caption, color: P.greenMuted, fontSize: 10 }}>Powering Ethiopian Fleet Efficiency</span>
          </div>

          <h1 style={{ ...T.hero, color: P.white, margin: "0 0 22px" }}>
            Fleet management that <span style={{ color: P.green }}>thinks ahead.</span>
          </h1>

          <p style={{ ...T.body, color: P.muted, maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.75 }}>
            Multi-tenant fleet OS for Ethiopian operators. Track every vehicle, manage driver compliance,
            control cost-per-kilometre, and process expense receipts — all in one secure platform.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <button onClick={onLoginClick} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 32px", background: P.green, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, borderRadius: 10, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = P.greenLight}
              onMouseLeave={e => e.currentTarget.style.background = P.green}
            >Sign In to Platform <ArrowRight size={15} /></button>
            <button onClick={onLoginClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "13px 24px", background: "transparent", border: `1px solid ${P.forestBorder}`, color: P.offWhite, fontSize: 15, fontWeight: 500, borderRadius: 10, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P.forestAccent; e.currentTarget.style.color = P.white; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = P.forestBorder; e.currentTarget.style.color = P.offWhite; }}
            >Start a Free Trial</button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap", marginBottom: 52 }}>
            {["Multi-tenant isolation", "Real-time geofencing", "Driver receipt pipeline"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 5, color: P.muted, fontSize: 12 }}>
                <CheckCircle2 size={12} color={P.greenMuted} />{item}
              </div>
            ))}
          </div>

          {/* Browser + mockup */}
          <div>
            <div style={{ background: "#071210", border: `1px solid ${P.hairline}`, borderBottom: "none", borderRadius: "12px 12px 0 0", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[P.critical, P.warning, P.greenMuted].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.65 }} />)}
              </div>
              <div style={{ flex: 1, background: "#0a1a0f", border: `1px solid ${P.hairline}`, borderRadius: 5, padding: "3px 10px", fontSize: 10, color: P.dimmed, textAlign: "center" }}>
                fleet.garanti.et/analytics
              </div>
            </div>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: P.forestDark, borderTop: `1px solid ${P.forestBorder}`, borderBottom: `1px solid ${P.forestBorder}`, padding: "44px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 28, textAlign: "center" }}>
          {[
            { val: "240+",  label: "Fleets across Ethiopia"       },
            { val: "12k+",  label: "Vehicles tracked monthly"     },
            { val: "34%",   label: "Avg cost-per-km reduction"    },
            { val: "99.7%", label: "Compliance alert accuracy"    },
          ].map(({ val, label }) => (
            <div key={label}>
              <div style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: P.white, lineHeight: 1, letterSpacing: "-0.03em" }}>{val}</div>
              <div style={{ ...T.small, color: P.muted, marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: P.forestDeep, padding: "88px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ ...T.caption, color: P.green, marginBottom: 12 }}>Core Platform</div>
            <h2 style={{ ...T.h2, color: P.white, margin: "0 0 14px" }}>Everything your fleet needs</h2>
            <p style={{ ...T.body, color: P.muted, maxWidth: 480, margin: "0 auto" }}>From live geofencing to CPK intelligence — one platform, total control.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
            <FeatureCard icon={BarChart2}   accent={P.greenMuted} title="Analytics & CPK engine"    body="Date-ranged expense reports, per-vehicle cost-per-kilometre, and category breakdowns. Approved receipts only — no noise." />
            <FeatureCard icon={ShieldCheck} accent={P.info}       title="Compliance automation"     body="Automated alerts for insurance, inspection, and license expiry. Renew directly from the alert — no separate workflow." />
            <FeatureCard icon={Receipt}     accent={P.warning}    title="Driver receipt pipeline"   body="Drivers photograph receipts on mobile. Managers approve or reject. Approved spend feeds CPK instantly." />
            <FeatureCard icon={Map}         accent="#a78bfa"       title="Live geofence tracking"   body="Real-time vehicle positions across Addis Ababa. Configurable depot zone with instant breach alerts and map pins." />
            <FeatureCard icon={Building2}   accent={P.greenMuted} title="Multi-tenant isolation"   body="Every company's data is fully isolated. Super Admin controls the whole platform. Managers see only their fleet." />
            <FeatureCard icon={Gauge}       accent={P.info}       title="Mileage & odometer logs"  body="Log odometer readings per vehicle. Distance covered is auto-calculated and fed directly into CPK computations." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: P.forestDark, padding: "88px 24px", borderTop: `1px solid ${P.forestBorder}` }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", background: P.forestDeep, border: `1px solid ${P.forestBorder}`, borderRadius: 20, padding: "52px 36px" }}>
          <div style={{ ...T.caption, color: P.green, marginBottom: 14 }}>Ready to start</div>
          <h2 style={{ ...T.h2, color: P.white, margin: "0 0 14px" }}>Take control of your fleet's costs</h2>
          <p style={{ ...T.body, color: P.muted, marginBottom: 32 }}>Join Ethiopian fleet operators already running smarter and fully compliant.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onLoginClick} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "13px 30px", background: P.green, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, borderRadius: 10, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = P.greenLight}
              onMouseLeave={e => e.currentTarget.style.background = P.green}
            >Sign In to Platform <ArrowRight size={15} /></button>
            <button onClick={onLoginClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "13px 22px", background: "transparent", border: `1px solid ${P.forestBorder}`, color: P.offWhite, fontSize: 15, fontWeight: 500, borderRadius: 10, cursor: "pointer" }}>
              Start a Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: P.forestDark, borderTop: `1px solid ${P.forestBorder}`, padding: "36px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: P.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.white }}>Garanti Fleet</div>
              <div style={{ fontSize: 10, color: P.muted }}>Ethiopia Fleet Management OS</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: P.dimmed }}>© {new Date().getFullYear()} Garanti Fleet. Built for Ethiopian operators.</div>
          <button onClick={onLoginClick} style={{ fontSize: 12, color: P.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Sign in to platform →
          </button>
        </div>
      </footer>
    </div>
  );
}