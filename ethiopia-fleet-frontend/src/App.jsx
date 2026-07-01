import "leaflet/dist/leaflet.css";
import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import {
  LayoutDashboard, Truck, Users, Map, ShieldAlert,
  Building2, Plus, AlertTriangle, Activity, Lock, LogOut, User,
  CheckCircle2, XCircle, RefreshCw, Menu, X,
  WifiOff, Trash2, Ban, RotateCcw, Crosshair, UserPlus, Radio, DollarSign,BarChart3,ShieldCheck,
} from "lucide-react";


import DriverReceiptPortal        from './DriverReceiptPortal';
import ManagerFinancialsDashboard from './ManagerFinancialsDashboard';
import AnalyticsReportingView from './AnalyticsReportingView';
import ComplianceTrackerView from './ComplianceTrackerView';
import LandingPage from './LandingPage';
import { DriverFuelForm } from './DriverFuelForm';
import { get, post, patch, put, del, setToken, clearToken, registerUnauthorizedHandler } from './api/client';

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ── HAVERSINE DISTANCE (metres) ───────────────────────────────────────────────
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R  = 6_371_000;
  const φ1 = (lat1 * Math.PI) / 180, φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── STABLE MOCK GPS COORDS ────────────────────────────────────────────────────
function getVehicleCoordinates(vehicleId) {
  const seed  = (vehicleId * 7919) % 1000 / 1000;
  const angle = seed * 2 * Math.PI;
  const r     = 0.010 + seed * 0.018;
  return [9.03 + r * Math.sin(angle), 38.74 + r * Math.cos(angle)];
}

// ── MAP CAMERA CONTROLLER ─────────────────────────────────────────────────────
function MapCameraController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { animate: true, duration: 1.5 });
  }, [target, map]);
  return null;
}

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:        "#0d1117",
  surface:   "#161b22",
  elevated:  "#1c2330",
  border:    "#30363d",
  text:      "#e6edf3",
  muted:     "#8b949e",
  accent:    "#3b82f6",
  accentDim: "#1d4ed8",
  critical:  "#ef4444",
  warning:   "#f59e0b",
  success:   "#22c55e",
  info:      "#06b6d4",
  breach:    "#ff2d2d",
};

const styles = {
  app: {
    display: "flex", height: "100vh", background: C.bg,
    color: C.text, fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 13, overflow: "hidden",
  },
  sidebar: {
    width: 210, background: C.surface, borderRight: `1px solid ${C.border}`,
    display: "flex", flexDirection: "column", flexShrink: 0,
  },
  sidebarLogo: {
    padding: "16px 14px 12px", borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", gap: 8,
  },
  logoMark: {
    width: 28, height: 28, background: C.accent, borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
    margin: "2px 6px", borderRadius: 7, cursor: "pointer",
    background: active ? C.elevated : "transparent",
    color: active ? C.text : C.muted,
    border: active ? `1px solid ${C.border}` : "1px solid transparent",
    transition: "all 0.15s", userSelect: "none",
  }),
  main:    { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  header:  { height: 50, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0 },
  content: { flex: 1, overflow: "auto", padding: 16 },
  card: (extra = {}) => ({ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", ...extra }),
  input: {
    width: "100%", background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 13,
    outline: "none", boxSizing: "border-box",
  },
  label:        { display: "block", marginBottom: 5, color: C.muted, fontSize: 11, fontWeight: 500 },
  btn: (v = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px",
    borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500,
    background: v === "primary" ? C.accent : v === "danger" ? "#450a0a" : C.elevated,
    color:      v === "primary" ? "#fff"   : v === "danger" ? C.critical : C.text,
    border:     v === "primary" ? "none"   : v === "danger" ? `1px solid #7f1d1d` : `1px solid ${C.border}`,
    transition: "opacity 0.15s",
  }),
  badge: (severity) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600,
    background: severity === "CRITICAL" ? "#450a0a" : "#451a03",
    color:      severity === "CRITICAL" ? C.critical : C.warning,
    border:     `1px solid ${severity === "CRITICAL" ? "#7f1d1d" : "#78350f"}`,
  }),
  kpi:          { background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" },
  grid2:        { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 },
  grid4:        { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 },
  formGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 600, marginBottom: 14, color: C.text },
  select: {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 13,
    outline: "none", cursor: "pointer", width: "100%",
  },
};

function getStatusColor(status) {
  if (!status) return C.success;
  const s = status.toLowerCase();
  if (s.includes("repair") || s.includes("maintenance")) return C.warning;
  if (s.includes("out") || s.includes("service"))        return C.critical;
  return C.success;
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={styles.kpi}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: color || C.text }}>{value ?? "—"}</div>
          {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{ background: color ? `${color}20` : C.surface, borderRadius: 7, padding: 8 }}>
          <Icon size={18} color={color || C.muted} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 9999,
      background: type === "error" ? "#450a0a" : "#052e16",
      border: `1px solid ${type === "error" ? C.critical : C.success}`,
      color: type === "error" ? C.critical : C.success,
      borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500,
      display: "flex", alignItems: "center", gap: 8, maxWidth: 340,
    }}>
      {type === "error" ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
      {msg}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", gap: 8, color: C.muted }}>
      <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading…
    </div>
  );
}

function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10, color: C.muted }}>
      <Icon size={28} color={C.border} />
      <div style={{ fontSize: 13 }}>{msg}</div>
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

 const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { access_token, user } = await post('/auth/login', { username, password });
      setToken(access_token);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Authentication failed. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: C.bg, alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ ...styles.card(), width: 340, padding: "28px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ ...styles.logoMark, width: 44, height: 44, borderRadius: 10 }}><Activity size={22} color="#fff" /></div>
        </div>
        <h2 style={{ textAlign: "center", fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Garanti Fleet</h2>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 11, marginTop: 4, marginBottom: 20 }}>Secure Interface Gateway</p>
        {error && (
          <div style={{ background: "#450a0a", border: `1px solid ${C.critical}`, color: C.critical, padding: "8px 10px", borderRadius: 6, fontSize: 11, marginBottom: 14 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Username">
            <input type="text" style={styles.input} placeholder="e.g., manager" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
          </Field>
          <Field label="Password">
            <input type="password" style={styles.input} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </Field>
          <button type="submit" style={{ ...styles.btn("primary"), justifyContent: "center", marginTop: 8, padding: "9px 0" }} disabled={loading}>
            <Lock size={13} /> {loading ? "Authenticating…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── DRIVER PORTAL VIEW ────────────────────────────────────────────────────────
function DriverDashboardView({ user }) {
  const [checked,   setChecked]   = useState({ brakes: false, tires: false, fuel: false });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={styles.card()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <User size={18} color={C.accent} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>Driver Profile</div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{user.username}</div>
        <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>
          Assigned Vehicle: <span style={{ color: C.text, fontWeight: 600 }}>#{user.vehicleId || "—"}</span>
        </div>
      </div>

      <div style={styles.card()}>
        <div style={styles.sectionTitle}>Pre-Trip Safety Checklist</div>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: C.success }}>
            <CheckCircle2 size={32} style={{ display: "block", margin: "0 auto 8px" }} />
            <div>Inspection submitted successfully!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.keys(checked).map((key) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 10px", background: C.surface, borderRadius: 6 }}>
                <input type="checkbox" checked={checked[key]} onChange={(e) => setChecked({ ...checked, [key]: e.target.checked })} />
                <span style={{ textTransform: "capitalize" }}>Verify {key} safety status</span>
              </label>
            ))}
            <button style={{ ...styles.btn("primary"), marginTop: 8 }} onClick={() => setSubmitted(true)}>
              Submit Inspection Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ALERT ROW ─────────────────────────────────────────────────────────────────
function AlertRow({ alert, onRenewed, onNavigateToMap }) {
  const isCrit     = alert.severity === "CRITICAL";
  const isGeofence = alert.category === "GEOFENCE_BREACH";
  const catLabel   = { VEHICLE_INSURANCE: "Insurance", VEHICLE_INSPECTION: "Inspection", DRIVER_LICENSE: "License", GEOFENCE_BREACH: "Geofence" }[alert.category] || alert.category;

  const [showRenew, setShowRenew] = useState(false);
  const [renewDate, setRenewDate] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [saveErr,   setSaveErr]   = useState("");

  const fieldMap = {
    VEHICLE_INSURANCE:  { field: "insuranceExpiry",  path: `/vehicles/${alert.assetId}` },
    VEHICLE_INSPECTION: { field: "inspectionExpiry", path: `/vehicles/${alert.assetId}` },
    DRIVER_LICENSE:     { field: "licenseExpiry",    path: `/drivers/${alert.assetId}`  },
  };
  const mapping = fieldMap[alert.category];

  const handleSave = async () => {
    if (!renewDate || !mapping) return;
    setSaving(true); setSaveErr("");
    try {
      await patch(mapping.path, { [mapping.field]: renewDate });
      setShowRenew(false); setRenewDate("");
      if (onRenewed) onRenewed();
    } catch {
      setSaveErr("Save failed — check backend");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, background: isGeofence ? "rgba(255,45,45,0.05)" : "transparent" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
        <div style={{
          width: 3, alignSelf: "stretch", borderRadius: 4, flexShrink: 0,
          background: isGeofence ? C.breach : isCrit ? C.critical : C.warning,
          boxShadow: isGeofence ? `0 0 6px ${C.breach}` : "none",
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isGeofence ? C.breach : C.text }}>
            {alert.assetName}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {alert.message || `${catLabel}${alert.expiryDate ? ` · expires ${alert.expiryDate}` : ""}${alert.detail ? ` · ${alert.detail}` : ""}`}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
          {isGeofence ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: "#450000", color: C.breach, border: "1px solid #7f0000",
              animation: "breachPulse 1.4s ease-in-out infinite",
            }}>⚠ BREACH</span>
          ) : (
            <>
              <span style={styles.badge(alert.severity)}>{alert.severity}</span>
              {alert.daysRemaining !== undefined && (
                <div style={{ fontSize: 11, color: C.muted }}>
                  {alert.daysRemaining < 0 ? `${Math.abs(alert.daysRemaining)}d overdue` : `${alert.daysRemaining}d left`}
                </div>
              )}
            </>
          )}
          {isGeofence && onNavigateToMap && (
            <button style={{ ...styles.btn("primary"), padding: "3px 9px", fontSize: 11 }} onClick={() => onNavigateToMap(alert.assetId)}>
              <Crosshair size={11} /> Track
            </button>
          )}
          {mapping && (
            <button style={{ ...styles.btn("secondary"), padding: "3px 9px", fontSize: 11, color: C.accent, borderColor: C.accent }} onClick={() => { setShowRenew((v) => !v); setSaveErr(""); }}>
              Renew
            </button>
          )}
        </div>
      </div>
      {showRenew && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 10px 16px", background: "#0d1523", borderRadius: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>New expiry:</span>
          <input type="date" style={{ ...styles.input, width: "auto", flex: 1, padding: "5px 8px", fontSize: 12 }} value={renewDate} onChange={(e) => setRenewDate(e.target.value)} />
          <button style={{ ...styles.btn("primary"), padding: "5px 12px", fontSize: 12 }} onClick={handleSave} disabled={!renewDate || saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button style={{ ...styles.btn("secondary"), padding: "5px 9px", fontSize: 12 }} onClick={() => { setShowRenew(false); setRenewDate(""); setSaveErr(""); }}>
            Cancel
          </button>
          {saveErr && <span style={{ fontSize: 11, color: C.critical }}>{saveErr}</span>}
        </div>
      )}
    </div>
  );
}

// ── SUPER ADMIN VIEW ──────────────────────────────────────────────────────────
function AdminView({ companies, onRefresh, onToast }) {
  const [companyForm, setCompanyForm] = useState({ name: "", registrationNumber: "", address: "" });
  const [vehicleForm, setVehicleForm] = useState({ companyId: "", plateNumber: "", model: "", chassisNumber: "", insuranceExpiry: "", inspectionExpiry: "" });
  const [driverForm,  setDriverForm]  = useState({ companyId: "", fullName: "", licenseNumber: "", licenseExpiry: "", phoneNumber: "" });
   const [userForm,    setUserForm]    = useState({ username: "", password: "", role: "manager", companyId: "", driverId: "" });
  const [usersList,   setUsersList]   = useState([]);
  const [driversForUserForm, setDriversForUserForm] = useState([]);
  const [busy,        setBusy]        = useState("");
  const [suspended,   setSuspended]   = useState({});
  const [deletingId,  setDeletingId]  = useState(null);

  const fetchUsers = useCallback(async () => {
    try { setUsersList(Array.isArray(await get("/users")) ? await get("/users") : []); }
    catch { onToast("Could not load users registry", "error"); }
  }, [onToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleSuspend = (id) => {
    setSuspended((p) => {
      const n = { ...p, [id]: !p[id] };
      onToast(n[id] ? "Company suspended" : "Company reinstated", "success");
      return n;
    });
  };
  useEffect(() => {
    if (!userForm.companyId) { setDriversForUserForm([]); return; }
    get(`/drivers?companyId=${userForm.companyId}`)
      .then((d) => setDriversForUserForm(Array.isArray(d) ? d : []))
      .catch(() => setDriversForUserForm([]));
  }, [userForm.companyId]);

  const deleteCompany = async (company) => {
    if (!window.confirm(`Permanently delete "${company.name}"? This cannot be undone.`)) return;
    setDeletingId(company.id);
    try { await del(`/companies/${company.id}`); onToast(`"${company.name}" deleted.`, "success"); onRefresh(); }
    catch { onToast("Deletion failed — check backend", "error"); }
    finally { setDeletingId(null); }
  };

  const submitCompany = async (e) => {
    e.preventDefault(); setBusy("company");
    try {
      await post("/companies", companyForm);
      setCompanyForm({ name: "", registrationNumber: "", address: "" });
      onToast("Company registered successfully", "success"); onRefresh();
    } catch { onToast("Company registration failed", "error"); }
    finally { setBusy(""); }
  };

  const submitVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.companyId) { onToast("Select a company to assign this vehicle to.", "error"); return; }
    setBusy("vehicle");
    try {
      await post("/vehicles", { ...vehicleForm, companyId: Number(vehicleForm.companyId) });
      setVehicleForm({ companyId: "", plateNumber: "", model: "", chassisNumber: "", insuranceExpiry: "", inspectionExpiry: "" });
      onToast("Vehicle registered successfully", "success");
    } catch { onToast("Vehicle registration failed — check backend", "error"); }
    finally { setBusy(""); }
  };

  const submitDriver = async (e) => {
    e.preventDefault();
    if (!driverForm.companyId) { onToast("Select a company to assign this driver to.", "error"); return; }
    setBusy("driver");
    try {
      await post("/drivers", { ...driverForm, companyId: Number(driverForm.companyId) });
      setDriverForm({ companyId: "", fullName: "", licenseNumber: "", licenseExpiry: "", phoneNumber: "" });
      onToast("Driver onboarded successfully", "success");
    } catch { onToast("Driver onboarding failed — check backend", "error"); }
    finally { setBusy(""); }
  };

 const submitUser = async (e) => {
    e.preventDefault();
    if (!userForm.companyId) { onToast("Select a company to assign the user to.", "error"); return; }
    if (userForm.role === "driver" && !userForm.driverId) {
      onToast("Select which driver this login belongs to.", "error");
      return;
    }
    setBusy("user");
    try {
      await post("/users", {
        ...userForm,
        companyId: Number(userForm.companyId),
        driverId: userForm.role === "driver" ? Number(userForm.driverId) : undefined,
      });
      setUserForm({ username: "", password: "", role: "manager", companyId: "", driverId: "" });
      onToast(`Account @${userForm.username} created`, "success"); fetchUsers();
    } catch { onToast("User creation failed", "error"); }
    finally { setBusy(""); }
  };

  const companyOptions = companies.map((c) => <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={styles.grid2}>
        {/* Register company */}
        <div style={styles.card()}>
          <div style={styles.sectionTitle}>Register New Company</div>
          <form onSubmit={submitCompany} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Company name"><input style={styles.input} required placeholder="Addis Freight Ltd." value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} /></Field>
            <Field label="Registration number"><input style={styles.input} required placeholder="ETH-2026-001" value={companyForm.registrationNumber} onChange={(e) => setCompanyForm({ ...companyForm, registrationNumber: e.target.value })} /></Field>
            <Field label="Address"><input style={styles.input} required placeholder="Bole Sub-city, Addis Ababa" value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} /></Field>
            <button type="submit" style={{ ...styles.btn("primary"), marginTop: 4 }} disabled={!!busy}>
              <Plus size={13} />{busy === "company" ? "Registering…" : "Register Company"}
            </button>
          </form>
        </div>

        {/* Provision user */}
        <div style={styles.card()}>
          <div style={styles.sectionTitle}>Provision User Account</div>
          <form onSubmit={submitUser} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Username"><input style={styles.input} required placeholder="e.g., dawit_driver" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} /></Field>
            <Field label="Password"><input type="password" style={styles.input} required placeholder="••••••••" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></Field>
   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={styles.label}>Role</label>
                <select style={styles.select} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value, driverId: "" })}>
                  <option value="manager">Manager</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Company</label>
                <select style={styles.select} value={userForm.companyId} onChange={(e) => setUserForm({ ...userForm, companyId: e.target.value, driverId: "" })} required>
                  <option value="">— select —</option>
                  {companyOptions}
                </select>
              </div>
            </div>
 
            {userForm.role === "driver" && (
              <div>
                <label style={styles.label}>Link to Driver Record</label>
                <select
                  style={styles.select}
                  value={userForm.driverId}
                  onChange={(e) => setUserForm({ ...userForm, driverId: e.target.value })}
                  required
                  disabled={!userForm.companyId}
                >
                  <option value="">
                    {userForm.companyId ? "— select driver —" : "Select a company first"}
                  </option>
                  {driversForUserForm.map((d) => (
                    <option key={d.id} value={d.id}>{d.fullName}</option>
                  ))}
                </select>
              </div>
            )}
 
            <button type="submit" style={{ ...styles.btn("primary"), marginTop: 4, background: C.info }} disabled={!!busy}>
              <UserPlus size={13} />{busy === "user" ? "Creating…" : "Provision Account"}
            </button>
          </form>
        </div>
      </div>

      <div style={styles.grid2}>
        {/* Register vehicle */}
        <div style={styles.card()}>
          <div style={styles.sectionTitle}>Register Vehicle</div>
          <form onSubmit={submitVehicle} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Assign to company">
              <select style={styles.select} required value={vehicleForm.companyId} onChange={(e) => setVehicleForm({ ...vehicleForm, companyId: e.target.value })}>
                <option value="">— select company —</option>
                {companyOptions}
              </select>
            </Field>
            <Field label="Plate number"><input style={styles.input} required placeholder="AA-12345" value={vehicleForm.plateNumber} onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })} /></Field>
            <Field label="Model"><input style={styles.input} required placeholder="Isuzu FVR" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} /></Field>
            <Field label="Chassis number"><input style={styles.input} placeholder="JABI6AK2XH7009001" value={vehicleForm.chassisNumber} onChange={(e) => setVehicleForm({ ...vehicleForm, chassisNumber: e.target.value })} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Insurance expiry"><input type="date" style={styles.input} value={vehicleForm.insuranceExpiry} onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })} /></Field>
              <Field label="Inspection expiry"><input type="date" style={styles.input} value={vehicleForm.inspectionExpiry} onChange={(e) => setVehicleForm({ ...vehicleForm, inspectionExpiry: e.target.value })} /></Field>
            </div>
            <button type="submit" style={{ ...styles.btn("primary"), marginTop: 4 }} disabled={!!busy}>
              <Truck size={13} />{busy === "vehicle" ? "Registering…" : "Register Vehicle"}
            </button>
          </form>
        </div>

        {/* Onboard driver */}
        <div style={styles.card()}>
          <div style={styles.sectionTitle}>Onboard Driver</div>
          <form onSubmit={submitDriver} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Assign to company">
              <select style={styles.select} required value={driverForm.companyId} onChange={(e) => setDriverForm({ ...driverForm, companyId: e.target.value })}>
                <option value="">— select company —</option>
                {companyOptions}
              </select>
            </Field>
            <Field label="Full name"><input style={styles.input} required placeholder="Abebe Girma" value={driverForm.fullName} onChange={(e) => setDriverForm({ ...driverForm, fullName: e.target.value })} /></Field>
            <Field label="License number"><input style={styles.input} required placeholder="ETD-2021-003456" value={driverForm.licenseNumber} onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })} /></Field>
            <Field label="License expiry"><input type="date" style={styles.input} value={driverForm.licenseExpiry} onChange={(e) => setDriverForm({ ...driverForm, licenseExpiry: e.target.value })} /></Field>
            <Field label="Phone number"><input style={styles.input} placeholder="+251 91 234 5678" value={driverForm.phoneNumber} onChange={(e) => setDriverForm({ ...driverForm, phoneNumber: e.target.value })} /></Field>
            <button type="submit" style={{ ...styles.btn("primary"), marginTop: 4 }} disabled={!!busy}>
              <Users size={13} />{busy === "driver" ? "Onboarding…" : "Onboard Driver"}
            </button>
          </form>
        </div>
      </div>

      {/* Users registry */}
      <div style={styles.card()}>
        <div style={styles.sectionTitle}>Global User Accounts</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Username", "Role", "Company"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersList.map((u, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "8px", fontWeight: 600 }}>@{u.username}</td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: u.role === "manager" ? C.accent : u.role === "admin" ? C.critical : C.warning }}>
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "8px", color: C.muted }}>
                    {companies.find((c) => c.id === u.companyId)?.name || `ID: ${u.companyId || "System"}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company directory */}
      <div style={styles.card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={styles.sectionTitle}>Company Directory</div>
          <button style={styles.btn("secondary")} onClick={onRefresh}><RefreshCw size={12} />Refresh</button>
        </div>
        {companies.length === 0 ? (
          <div style={{ color: C.muted, textAlign: "center", padding: "24px 0" }}>No companies registered yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["ID", "Name", "Reg. Number", "Address", "Created", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "5px 8px", color: C.muted, fontSize: 10, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => {
                  const isSuspended = !!suspended[c.id];
                  return (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: isSuspended ? 0.45 : 1, background: isSuspended ? "#0a0d12" : "transparent", transition: "opacity 0.15s" }}>
                      <td style={{ padding: "9px 8px", color: C.muted }}>{c.id}</td>
                      <td style={{ padding: "9px 8px", fontWeight: 500 }}>
                        {c.name}
                        {isSuspended && <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: "#1c1917", color: C.muted, border: `1px solid ${C.border}` }}>SUSPENDED</span>}
                      </td>
                      <td style={{ padding: "9px 8px", color: C.muted }}>{c.registrationNumber}</td>
                      <td style={{ padding: "9px 8px", color: C.muted }}>{c.address}</td>
                      <td style={{ padding: "9px 8px", color: C.muted }}>{formatDate(c.createdAt)}</td>
                      <td style={{ padding: "9px 8px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={{ ...styles.btn("secondary"), padding: "5px 9px", fontSize: 11, color: isSuspended ? C.success : C.warning }} onClick={() => toggleSuspend(c.id)}>
                            {isSuspended ? <RotateCcw size={12} /> : <Ban size={12} />}{isSuspended ? "Reinstate" : "Suspend"}
                          </button>
                          <button style={{ ...styles.btn("secondary"), padding: "5px 9px", fontSize: 11, color: C.critical, borderColor: "#7f1d1d" }} onClick={() => deleteCompany(c)} disabled={deletingId === c.id}>
                            <Trash2 size={12} />{deletingId === c.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD VIEW ────────────────────────────────────────────────────────────
function DashboardView({ companyId, onNavigateToMap }) {
  const [data,          setData]          = useState(null);
  const [vehicles,      setVehicles]      = useState([]);
  const [drivers,       setDrivers]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [pendingDriver, setPendingDriver] = useState({});
  const [assigningId,   setAssigningId]   = useState(null);
  const [assignError,   setAssignError]   = useState("");

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true); setError(null);
    try {
      const [alerts, veh, drv, geofences] = await Promise.all([
        get(`/companies/${companyId}/alerts`),
        get(`/vehicles?companyId=${companyId}`),
        get(`/drivers?companyId=${companyId}`),
        get(`/geofence?companyId=${companyId}`).catch(() => []),
      ]);

      const geofenceByVehicle = {};
      (Array.isArray(geofences) ? geofences : []).forEach((g) => {
        geofenceByVehicle[g.vehicleId] = {
          ...g,
          lat: Number(g.lat),
          lng: Number(g.lng),
          radius: Number(g.radius),
        };
      });
      const DEFAULT_GEOFENCE = { lat: 9.03, lng: 38.74, radius: 2000 };

      const computedAlerts = [...(alerts.alerts || [])];
      let extraCritical = 0;

      (Array.isArray(veh) ? veh : []).forEach((v) => {
        const vehicleGeofence = geofenceByVehicle[v.id] || DEFAULT_GEOFENCE;
        const [vLat, vLng] = getVehicleCoordinates(v.id);
        const dist = haversineMeters(vLat, vLng, vehicleGeofence.lat, vehicleGeofence.lng);
        if (dist > vehicleGeofence.radius) {
          extraCritical++;
          computedAlerts.unshift({
            category:  "GEOFENCE_BREACH",
            severity:  "CRITICAL",
            assetId:   v.id,
            assetName: `GEOFENCE BREACH: ${v.plateNumber} is outside operational boundary!`,
            message:   `${Math.round(dist - vehicleGeofence.radius).toLocaleString()} m beyond its ${vehicleGeofence.radius.toLocaleString()} m geofence`,
          });
        }
      });

      setData({ ...alerts, criticalCount: (alerts.criticalCount || 0) + extraCritical, alerts: computedAlerts });
      setVehicles(Array.isArray(veh) ? veh : []);
      setDrivers(Array.isArray(drv) ? drv : []);
    } catch {
      setError("Cannot reach backend — is it running on :3000?");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const assignDriver = async (vehicleId) => {
    const driverId = pendingDriver[vehicleId];
    if (!driverId) return;
    setAssigningId(vehicleId);
    setAssignError("");
    try {
      await patch(`/vehicles/${vehicleId}/assign-driver`, { driverId: Number(driverId) });
      const assignedDriver = drivers.find((d) => d.id === Number(driverId));
      setVehicles((prev) =>
        prev.map((v) => v.id === vehicleId ? { ...v, assignedDriver } : v)
      );
      setPendingDriver((p) => ({ ...p, [vehicleId]: "" }));
    } catch {
      setAssignError("Assignment failed — check the backend");
    } finally {
      setAssigningId(null);
    }
  };

  if (!companyId) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: 10, color: C.muted }}>
      <Building2 size={36} color={C.border} />
      <div style={{ fontSize: 14 }}>Select a company from the header to view the dashboard</div>
    </div>
  );

  if (loading) return <Spinner />;
  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: 10, color: C.critical }}>
      <WifiOff size={32} /><div>{error}</div>
      <button style={styles.btn("secondary")} onClick={load}><RefreshCw size={12} />Retry</button>
    </div>
  );

  const breachCount   = data?.alerts?.filter((a) => a.category === "GEOFENCE_BREACH").length || 0;
  const activeDrivers = drivers.filter((d) => d.isActive).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={styles.grid4}>
        <KpiCard label="Total Vehicles"     value={vehicles.length}         icon={Truck}         color={C.info}     sub="registered fleet" />
        <KpiCard label="Active Drivers"     value={activeDrivers}           icon={Users}         color={C.success}  sub={`of ${drivers.length} total`} />
        <KpiCard label="Critical Alerts"    value={data?.criticalCount}     icon={XCircle}       color={C.critical} sub="immediate action" />
        <KpiCard label="Geofence Breaches"  value={breachCount}             icon={Radio}         color={breachCount > 0 ? C.breach : C.muted} sub="outside depot zone" />
      </div>

      <div style={styles.grid2}>
        <div style={styles.card()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={styles.sectionTitle}>Compliance & Geofence Alerts</div>
            <button style={styles.btn("secondary")} onClick={load}><RefreshCw size={12} /></button>
          </div>
          {!data?.alerts?.length ? (
            <div style={{ color: C.muted, textAlign: "center", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={24} color={C.success} />All assets compliant
            </div>
          ) : (
            data.alerts.map((a, i) => (
              <AlertRow key={`${a.category}-${a.assetId ?? i}`} alert={a} onRenewed={load} onNavigateToMap={onNavigateToMap} />
            ))
          )}
        </div>

        <div style={styles.card()}>
          <div style={styles.sectionTitle}>Active Fleet</div>
          {assignError && (
            <div style={{ color: C.critical, fontSize: 11, marginBottom: 10, padding: "6px 10px", background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 6 }}>
              {assignError}
            </div>
          )}
          {vehicles.length === 0 ? (
            <EmptyState icon={Truck} msg="No vehicles registered." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Plate", "Model", "Status", "Driver"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "5px 8px", color: C.muted, fontSize: 10, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "6px 8px", fontWeight: 600 }}>{v.plateNumber}</td>
                      <td style={{ padding: "6px 8px", color: C.muted }}>{v.model}</td>
                      <td style={{ padding: "6px 8px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: getStatusColor(v.status) }}>● {v.status || "Active"}</span>
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        {v.assignedDriver ? (
                          <span style={{ color: C.success }}>{v.assignedDriver.fullName}</span>
                        ) : (
                          <div style={{ display: "flex", gap: 4 }}>
                            <select style={{ ...styles.select, padding: "2px 4px", fontSize: 11 }} value={pendingDriver[v.id] || ""} onChange={(e) => setPendingDriver({ ...pendingDriver, [v.id]: e.target.value })}>
                              <option value="">Unassigned</option>
                              {drivers.map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                            </select>
                            <button style={{ ...styles.btn("primary"), padding: "3px 7px", fontSize: 11 }} onClick={() => assignDriver(v.id)} disabled={assigningId === v.id}>
                              {assigningId === v.id ? "…" : "Assign"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── VEHICLES VIEW ─────────────────────────────────────────────────────────────
function VehiclesView({ companyId }) {
  const [vehicles,    setVehicles]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState(null);
  const [expandedId,  setExpandedId]  = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [saving,      setSaving]      = useState(false);

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    get(`/vehicles?companyId=${companyId}`)
      .then((d) => setVehicles(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const STATUSES = ["Active", "Maintenance", "Out of Service"];
  const statusStyle = (s) => ({
    "Active":         { bg: "#052e16", color: C.success,  border: "#166534" },
    "Maintenance":    { bg: "#451a03", color: C.warning,  border: "#78350f" },
    "Out of Service": { bg: "#450a0a", color: C.critical, border: "#7f1d1d" },
  }[s] || { bg: C.surface, color: C.muted, border: C.border });

  const handleRowClick = (v) => {
    if (expandedId === v.id) { setExpandedId(null); return; }
    setExpandedId(v.id);
    setEditForm({
      plateNumber:      v.plateNumber      || "",
      model:            v.model            || "",
      chassisNumber:    v.chassisNumber    || "",
      currentMileage:   v.currentMileage   ?? "",
      insuranceExpiry:  v.insuranceExpiry  ? v.insuranceExpiry.slice(0,10) : "",
      inspectionExpiry: v.inspectionExpiry ? v.inspectionExpiry.slice(0,10) : "",
      status:           v.status           || "Active",
    });
  };

  const handleSave = async (vehicleId) => {
    setSaving(true);
    try {
      const payload = { ...editForm, currentMileage: Number(editForm.currentMileage) || 0 };
      await patch(`/vehicles/${vehicleId}`, payload);
      setVehicles((prev) => prev.map((v) => v.id === vehicleId ? { ...v, ...payload } : v));
      setExpandedId(null);
      setToast({ msg: "Vehicle updated successfully", type: "success" });
    } catch {
      setToast({ msg: "Update failed — check backend", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await patch(`/vehicles/${vehicleId}`, { status: newStatus });
      setVehicles((prev) => prev.map((v) => v.id === vehicleId ? { ...v, status: newStatus } : v));
    } catch { setToast({ msg: "Status update failed", type: "error" }); }
  };

  const handleUnassign = async (e, vehicleId) => {
    e.stopPropagation();
    try {
      await patch(`/vehicles/${vehicleId}/release-driver`, {});
      setVehicles((prev) => prev.map((v) => v.id === vehicleId ? { ...v, assignedDriver: null } : v));
      setToast({ msg: "Driver unassigned", type: "success" });
    } catch { setToast({ msg: "Unassign failed", type: "error" }); }
  };

  if (!companyId) return <EmptyState icon={Truck} msg="Select a company to view vehicles." />;
  if (loading)    return <Spinner />;

  return (
    <>
      <div style={styles.card()}>
        <div style={styles.sectionTitle}>Fleet Vehicles <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>— click a row to view details &amp; edit</span></div>
        {vehicles.length === 0 ? <EmptyState icon={Truck} msg="No vehicles found." /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Plate", "Model", "Chassis", "Insurance", "Inspection", "Driver", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "5px 8px", color: C.muted, fontSize: 10, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => {
                  const status   = v.status || "Active";
                  const sc       = statusStyle(status);
                  const isOpen   = expandedId === v.id;
                  const ef       = editForm;
                  return (
                    <>
                      <tr
                        key={v.id}
                        onClick={() => handleRowClick(v)}
                        style={{
                          borderBottom: isOpen ? "none" : `1px solid ${C.border}`,
                          cursor: "pointer",
                          background: isOpen ? "#1a2133" : "transparent",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "#1a2133"; }}
                        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ padding: "9px 8px", fontWeight: 600 }}>
                          <span style={{ marginRight: 6, color: C.muted, fontSize: 10 }}>{isOpen ? "▼" : "▶"}</span>
                          {v.plateNumber}
                        </td>
                        <td style={{ padding: "9px 8px" }}>{v.model}</td>
                        <td style={{ padding: "9px 8px", color: C.muted, fontSize: 11, fontFamily: "monospace" }}>{v.chassisNumber || "—"}</td>
                        <td style={{ padding: "9px 8px", color: C.muted }}>{formatDate(v.insuranceExpiry)}</td>
                        <td style={{ padding: "9px 8px", color: C.muted }}>{formatDate(v.inspectionExpiry)}</td>
                        <td style={{ padding: "9px 8px" }}>
                          {v.assignedDriver ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ color: C.success }}>{v.assignedDriver.fullName}</span>
                              <button
                                style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, fontSize: 10, padding: "2px 7px", cursor: "pointer" }}
                                onClick={(e) => handleUnassign(e, v.id)}
                              >Unassign</button>
                            </div>
                          ) : <span style={{ color: C.muted }}>—</span>}
                        </td>
                        <td style={{ padding: "9px 8px" }} onClick={(e) => e.stopPropagation()}>
                          <select
                            style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 6, padding: "4px 7px", color: sc.color, fontSize: 11, fontWeight: 600, cursor: "pointer", outline: "none" }}
                            value={status}
                            onChange={(e) => handleStatusChange(v.id, e.target.value)}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr key={`${v.id}-detail`}>
                          <td colSpan={7} style={{ padding: 0, borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ background: "#111927", borderTop: `1px solid ${C.border}`, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.accent, marginBottom: 2 }}>✏️ Edit Vehicle — {v.plateNumber}</div>

                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                                <div style={{ background: C.elevated, borderRadius: 7, padding: "8px 12px", border: `1px solid ${C.border}` }}>
                                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>Vehicle ID</div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>#{v.id}</div>
                                </div>
                                <div style={{ background: C.elevated, borderRadius: 7, padding: "8px 12px", border: `1px solid ${C.border}` }}>
                                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>Assigned Driver</div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: v.assignedDriver ? C.success : C.muted }}>
                                    {v.assignedDriver?.fullName || "Unassigned"}
                                  </div>
                                </div>
                                <div style={{ background: C.elevated, borderRadius: 7, padding: "8px 12px", border: `1px solid ${C.border}` }}>
                                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>Current Status</div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: statusStyle(v.status || "Active").color }}>{v.status || "Active"}</div>
                                </div>
                                <div style={{ background: C.elevated, borderRadius: 7, padding: "8px 12px", border: `1px solid ${C.border}` }}>
                                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>Mileage (km)</div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v.currentMileage ?? "—"}</div>
                                </div>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                                <Field label="Plate Number">
                                  <input style={styles.input} value={ef.plateNumber} onChange={(e) => setEditForm({ ...ef, plateNumber: e.target.value })} />
                                </Field>
                                <Field label="Model">
                                  <input style={styles.input} value={ef.model} onChange={(e) => setEditForm({ ...ef, model: e.target.value })} />
                                </Field>
                                <Field label="Chassis Number">
                                  <input style={styles.input} value={ef.chassisNumber} onChange={(e) => setEditForm({ ...ef, chassisNumber: e.target.value })} />
                                </Field>
                                <Field label="Current Mileage (km)">
                                  <input type="number" min="0" style={styles.input} value={ef.currentMileage} onChange={(e) => setEditForm({ ...ef, currentMileage: e.target.value })} />
                                </Field>
                                <Field label="Insurance Expiry">
                                  <input type="date" style={styles.input} value={ef.insuranceExpiry} onChange={(e) => setEditForm({ ...ef, insuranceExpiry: e.target.value })} />
                                </Field>
                                <Field label="Inspection Expiry">
                                  <input type="date" style={styles.input} value={ef.inspectionExpiry} onChange={(e) => setEditForm({ ...ef, inspectionExpiry: e.target.value })} />
                                </Field>
                              </div>

                              <div style={{ display: "flex", gap: 8 }}>
                                <button style={{ ...styles.btn("primary"), padding: "7px 18px" }} onClick={() => handleSave(v.id)} disabled={saving}>
                                  {saving ? "Saving…" : "Save Changes"}
                                </button>
                                <button style={{ ...styles.btn("secondary"), padding: "7px 14px" }} onClick={() => setExpandedId(null)}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ── DRIVERS VIEW ──────────────────────────────────────────────────────────────
function DriversView({ companyId }) {
  const [drivers,    setDrivers]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast,      setToast]      = useState(null);

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    get(`/drivers?companyId=${companyId}`)
      .then((d) => setDrivers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const terminate = async (driver) => {
    if (!window.confirm(`Permanently terminate "${driver.fullName}"?`)) return;
    setDeletingId(driver.id);
    try {
      await del(`/drivers/${driver.id}`);
      setDrivers((p) => p.filter((d) => d.id !== driver.id));
      setToast({ msg: `${driver.fullName} removed`, type: "success" });
    } catch { setToast({ msg: "Termination failed", type: "error" }); }
    finally { setDeletingId(null); }
  };

  if (!companyId) return <EmptyState icon={Users} msg="Select a company to view drivers." />;
  if (loading)    return <Spinner />;

  return (
    <>
      <div style={styles.card()}>
        <div style={styles.sectionTitle}>Driver Roster</div>
        {drivers.length === 0 ? <EmptyState icon={Users} msg="No drivers found." /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Name", "License #", "License Expiry", "Phone", "Status", "Vehicle", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "5px 8px", color: C.muted, fontSize: 10, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "9px 8px", fontWeight: 600 }}>{d.fullName}</td>
                    <td style={{ padding: "9px 8px", color: C.muted, fontFamily: "monospace", fontSize: 11 }}>{d.licenseNumber}</td>
                    <td style={{ padding: "9px 8px", color: C.muted }}>{formatDate(d.licenseExpiry)}</td>
                    <td style={{ padding: "9px 8px" }}>
                      {d.phoneNumber ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <a href={`tel:${d.phoneNumber}`} style={{ color: C.accent, textDecoration: "none" }}>{d.phoneNumber}</a>
                          <a href={`https://wa.me/${d.phoneNumber.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ color: C.success, textDecoration: "none" }}>(WA)</a>
                        </div>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "9px 8px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: d.isActive ? "#052e16" : "#1c1917", color: d.isActive ? C.success : C.muted, border: `1px solid ${d.isActive ? "#166534" : C.border}` }}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "9px 8px", color: C.muted }}>
                      {d.assignedVehicle?.plateNumber || "—"}
                    </td>
                    <td style={{ padding: "9px 8px" }}>
                      <button
                        style={{ ...styles.btn("secondary"), padding: "4px 10px", fontSize: 11, color: C.critical, borderColor: "#7f1d1d", opacity: deletingId === d.id ? 0.5 : 1 }}
                        disabled={deletingId === d.id}
                        onClick={() => terminate(d)}
                      >
                        <Trash2 size={11} />{deletingId === d.id ? "Removing…" : "Terminate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ── LIVE MAP VIEW ─────────────────────────────────────────────────────────────

function makeIcon(color, isBreaching) {
  const pulse = isBreaching
    ? `animation: breachPinPulse 0.9s ease-in-out infinite alternate; box-shadow: 0 0 0 4px ${color}55;`
    : `box-shadow: 0 0 0 2px ${color}40;`;
  const truckSvg = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
      <path d="M10 17h4V5H2v12h3"/>
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/>
      <circle cx="7.5" cy="17.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>`;
  return L.divIcon({
    className: "",
    iconAnchor: [14, 32],
    popupAnchor: [0, -34],
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35));">
      <div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;${pulse}">
        ${truckSvg}
      </div>
    </div>`,
  });
}

const DEFAULT_GEOFENCE = { lat: 9.03, lng: 38.74, radius: 2000 };

// ─────────────────────────────────────────────────────────────────────────────
// THE ONLY CHANGED FUNCTION IN THIS FILE
// Changes made (mobile UX only — desktop behaviour is identical to before):
//   1. Added local `isMobile` detection inside this component.
//   2. Added `panelOpen` state — false by default on mobile, true on desktop.
//   3. Geofence panel is hidden on mobile when panelOpen===false.
//   4. Tapping a vehicle marker OR a vehicle card sets panelOpen=true on mobile.
//   5. A close (×) button inside the panel lets the user dismiss it on mobile.
//   6. A floating "⚙ Geofence" FAB button appears on mobile when panel is closed.
// ─────────────────────────────────────────────────────────────────────────────
function LiveMapView({ companyId, focusedVehicleId }) {
  // ── Mobile detection (local, so LiveMapView is self-contained) ────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [vehicles,    setVehicles]    = useState([]);
  const [geofenceMap, setGeofenceMap] = useState({});
  const [selectedId,  setSelectedId]  = useState(focusedVehicleId || null);
  const [draft,       setDraft]       = useState(DEFAULT_GEOFENCE);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");

  // ── Panel open state: hidden by default on mobile, always visible on desktop
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 768);

  // Keep panelOpen in sync if the window is resized across the breakpoint
  useEffect(() => {
    if (!isMobile) setPanelOpen(true);
  }, [isMobile]);

  const loadVehiclesAndGeofences = useCallback(async () => {
    if (!companyId) return;
    try {
      const [veh, geofences] = await Promise.all([
        get(`/vehicles?companyId=${companyId}`),
        get(`/geofence?companyId=${companyId}`).catch(() => []),
      ]);
      setVehicles(Array.isArray(veh) ? veh : []);
      const map = {};
      (Array.isArray(geofences) ? geofences : []).forEach((g) => {
        map[g.vehicleId] = {
          ...g,
          lat: Number(g.lat),
          lng: Number(g.lng),
          radius: Number(g.radius),
        };
      });
      setGeofenceMap(map);
    } catch {}
  }, [companyId]);

  useEffect(() => { loadVehiclesAndGeofences(); }, [loadVehiclesAndGeofences]);

  useEffect(() => {
    if (selectedId) return;
    if (focusedVehicleId) { setSelectedId(focusedVehicleId); return; }
    if (vehicles.length > 0) setSelectedId(vehicles[0].id);
  }, [vehicles, focusedVehicleId, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setDraft(geofenceMap[selectedId] || DEFAULT_GEOFENCE);
    setSaveMsg("");
  }, [selectedId, geofenceMap]);

  const displayVehicles = useMemo(() => {
    const source = vehicles.length > 0 ? vehicles : [
      { id: 1, plateNumber: "AA-12345", model: "Isuzu FVR",       status: "Active",      assignedDriver: { fullName: "Abebe G." } },
      { id: 2, plateNumber: "AA-67890", model: "Tata LPT",        status: "Maintenance", assignedDriver: { fullName: "Tigist M." } },
      { id: 3, plateNumber: "AA-11111", model: "FAW J6",          status: "Active",      assignedDriver: null },
      { id: 4, plateNumber: "AA-22222", model: "Hino 700",        status: "Active",      assignedDriver: { fullName: "Yonas K." } },
      { id: 5, plateNumber: "AA-33333", model: "Sinotruk",        status: "Active",      assignedDriver: { fullName: "Dawit B." } },
      { id: 6, plateNumber: "AA-44444", model: "Mercedes Actros", status: "Maintenance", assignedDriver: { fullName: "Liya T." } },
    ];
    return source.map((v) => {
      const vehicleGeofence = geofenceMap[v.id] || DEFAULT_GEOFENCE;
      const [lat, lng]  = getVehicleCoordinates(v.id);
      const dist        = haversineMeters(lat, lng, vehicleGeofence.lat, vehicleGeofence.lng);
      const isBreaching = dist > vehicleGeofence.radius;
      return { ...v, lat, lng, dist, isBreaching, geofence: vehicleGeofence };
    });
  }, [vehicles, geofenceMap]);

  const breachCount = displayVehicles.filter((v) => v.isBreaching).length;

  const mapCenter = useMemo(() => {
    if (focusedVehicleId) return getVehicleCoordinates(focusedVehicleId);
    const first = displayVehicles[0];
    return first ? [first.geofence.lat, first.geofence.lng] : [DEFAULT_GEOFENCE.lat, DEFAULT_GEOFENCE.lng];
  }, [focusedVehicleId, displayVehicles]);

  function pinColor(v) {
    if (v.isBreaching)              return C.breach;
    if (v.status === "Maintenance") return C.warning;
    return C.success;
  }

  const updateDraftField = (field, rawVal) => {
    if (field === "radius") {
      const parsed = parseInt(rawVal, 10);
      const val = Number.isNaN(parsed) ? "" : parsed;
      setDraft((d) => ({ ...d, radius: val }));
      return;
    }
    const val = parseFloat(rawVal);
    setDraft((d) => ({ ...d, [field]: Number.isNaN(val) ? d[field] : val }));
  };

  const saveGeofence = async () => {
    if (!selectedId) return;
    const safeDraft = {
      ...draft,
      radius: Math.max(50, Number(draft.radius) || 50),
    };
    setSaving(true); setSaveMsg("");
    try {
      const saved = await put(`/geofence/${selectedId}?companyId=${companyId}`, safeDraft);
      setGeofenceMap((prev) => ({
        ...prev,
        [selectedId]: {
          ...saved,
          lat: Number(saved.lat),
          lng: Number(saved.lng),
          radius: Number(saved.radius),
        },
      }));
      setSaveMsg("Saved ✓");
      // Auto-close the panel on mobile after saving so the map is visible again
      if (isMobile) setPanelOpen(false);
    } catch {
      setSaveMsg("Save failed — check backend");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 2500);
    }
  };

  const resetToDefault = () => setDraft(DEFAULT_GEOFENCE);

  // Unified handler: select a vehicle AND open the panel on mobile
  const selectVehicle = (id) => {
    setSelectedId(id);
    if (isMobile) setPanelOpen(true);
  };

  const selectedVehicle = displayVehicles.find((v) => v.id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={15} color={C.accent} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Live Telematics — Addis Ababa</span>
          <span style={{ fontSize: 10, background: "#052e16", color: C.success, border: `1px solid #166534`, borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>● LIVE</span>
          {breachCount > 0 && (
            <span style={{ fontSize: 10, background: "#450000", color: C.breach, border: `1px solid #7f0000`, borderRadius: 20, padding: "2px 8px", fontWeight: 700, animation: "breachPulse 1.2s ease-in-out infinite" }}>
              ⚠ {breachCount} BREACH{breachCount > 1 ? "ES" : ""}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[["In-Zone", C.success, displayVehicles.filter((v) => !v.isBreaching && v.status !== "Maintenance").length],
            ["Maintenance", C.warning, displayVehicles.filter((v) => v.status === "Maintenance").length],
            ["Breaching",   C.breach,  breachCount]].map(([label, color, count]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />{count} {label}
            </div>
          ))}
        </div>
      </div>

      {/* Map + geofence panel */}
      <div style={{ position: "relative", height: "calc(100vh - 220px)", minHeight: 420, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
        <MapContainer center={[9.03, 38.74]} zoom={13} style={{ height: "100%", width: "100%", background: "#eef2f5" }}>
          <MapCameraController target={mapCenter} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {displayVehicles.map((v) => (
            <Circle
              key={`geofence-${v.id}`}
              center={[v.geofence.lat, v.geofence.lng]}
              radius={v.geofence.radius}
              pathOptions={{
                color: v.id === selectedId ? C.accent : C.muted,
                weight: v.id === selectedId ? 2 : 1,
                opacity: v.id === selectedId ? 0.9 : 0.35,
                fillColor: v.isBreaching ? C.breach : C.accent,
                fillOpacity: v.id === selectedId ? 0.08 : 0.03,
                dashArray: "8 5",
              }}
              eventHandlers={{ click: () => selectVehicle(v.id) }}
            >
              <Popup>
                <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 12, lineHeight: 1.7 }}>
                  <strong style={{ color: C.accent }}>🏭 {v.plateNumber} — Geofence</strong><br />
                  {Number(v.geofence.lat).toFixed(4)}°N, {Number(v.geofence.lng).toFixed(4)}°E<br />
                  Radius: {Number(v.geofence.radius).toLocaleString()} m<br />
                  <span style={{ color: v.isBreaching ? C.breach : C.success, fontSize: 11 }}>
                    {v.isBreaching ? "⚠ Vehicle outside its boundary" : "✓ Vehicle inside its boundary"}
                  </span>
                </div>
              </Popup>
            </Circle>
          ))}

          {displayVehicles.map((v) => {
            const color = pinColor(v);
            return (
              <Marker
                key={v.id}
                position={[v.lat, v.lng]}
                icon={makeIcon(color, v.isBreaching)}
                eventHandlers={{ click: () => selectVehicle(v.id) }}
              >
                <Popup minWidth={200}>
                  <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 12, lineHeight: 1.75 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🚛 {v.plateNumber}</div>
                    <div><span style={{ color: "#888" }}>Model:</span> {v.model || "—"}</div>
                    <div><span style={{ color: "#888" }}>Status:</span> <span style={{ color, fontWeight: 600 }}>{v.status || "Active"}</span></div>
                    <div><span style={{ color: "#888" }}>Driver:</span> {v.assignedDriver?.fullName || "Unassigned"}</div>
                    <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{v.lat.toFixed(4)}°N, {v.lng.toFixed(4)}°E</div>
                    <div style={{ fontSize: 10, color: v.isBreaching ? C.breach : "#888", marginTop: 2 }}>
                      {Math.round(v.dist).toLocaleString()} m from its geofence centre
                    </div>
                    {v.isBreaching && (
                      <div style={{ marginTop: 6, padding: "4px 8px", borderRadius: 5, background: "#450000", color: C.breach, fontSize: 10, fontWeight: 700, border: "1px solid #7f0000" }}>
                        ⚠ OUTSIDE OPERATIONAL BOUNDARY
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* ── GEOFENCE PANEL ───────────────────────────────────────────────────
            Desktop: always visible, positioned top-right (unchanged).
            Mobile:  hidden until a vehicle is tapped, then slides in as a
                     bottom sheet. Closed with the × button in the header.
        ─────────────────────────────────────────────────────────────────────── */}
        {panelOpen && (
          <div style={isMobile ? {
            // Mobile: bottom sheet
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1000,
            background: "rgba(22, 27, 34, 0.98)",
            border: `1px solid ${C.border}`,
            borderRadius: "14px 14px 0 0",
            padding: "14px 16px 20px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
          } : {
            // Desktop: top-right overlay (exactly as before)
            position: "absolute", top: 12, right: 12, zIndex: 1000, width: 240,
            background: "rgba(22, 27, 34, 0.97)",
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "14px 14px 16px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}>
            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, boxShadow: `0 0 6px ${C.accent}` }} />
                <span style={{ fontWeight: 700, fontSize: 12 }}>Geofence Parameters</span>
              </div>
              {/* Close button — only shown on mobile */}
              {isMobile && (
                <button
                  onClick={() => setPanelOpen(false)}
                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <Field label="Vehicle">
              <select
                style={{ ...styles.select, fontSize: 12, padding: "6px 9px" }}
                value={selectedId || ""}
                onChange={(e) => setSelectedId(Number(e.target.value))}
              >
                {displayVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.plateNumber}</option>
                ))}
              </select>
            </Field>

            {/* On mobile, show fields in a 2-column grid to save vertical space */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr",
              gap: 8,
              marginTop: 8,
            }}>
              <Field label="Center Latitude">
                <input type="number" step="0.0001" style={{ ...styles.input, fontSize: 12, padding: "6px 9px" }}
                  value={draft.lat}
                  onChange={(e) => updateDraftField("lat", e.target.value)} />
              </Field>
              <Field label="Center Longitude">
                <input type="number" step="0.0001" style={{ ...styles.input, fontSize: 12, padding: "6px 9px" }}
                  value={draft.lng}
                  onChange={(e) => updateDraftField("lng", e.target.value)} />
              </Field>
              <Field label="Zone Radius (Meters)">
                <input type="number" step="50" min="100" style={{ ...styles.input, fontSize: 12, padding: "6px 9px" }}
                  value={draft.radius}
                  onChange={(e) => updateDraftField("radius", e.target.value)} />
              </Field>
            </div>

            {selectedVehicle && (
              <div style={{
                marginTop: 10, padding: "8px 10px", borderRadius: 7,
                background: selectedVehicle.isBreaching ? "rgba(255,45,45,0.08)" : "rgba(34,197,94,0.07)",
                border: `1px solid ${selectedVehicle.isBreaching ? "#7f0000" : "#166534"}`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: selectedVehicle.isBreaching ? C.breach : C.success, marginBottom: 2 }}>
                  {selectedVehicle.isBreaching ? "⚠ THIS VEHICLE IS BREACHING" : "✓ THIS VEHICLE IS INSIDE ITS ZONE"}
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>
                  {Math.round(selectedVehicle.dist).toLocaleString()} m from its geofence centre
                </div>
              </div>
            )}

            {/* On mobile, show buttons side-by-side to save space */}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexDirection: isMobile ? "row" : "column" }}>
              <button
                style={{ ...styles.btn("primary"), flex: 1, justifyContent: "center", fontSize: 12, padding: "7px 0" }}
                onClick={saveGeofence}
                disabled={saving || !selectedId}
              >
                {saving ? "Saving…" : saveMsg || "Save Geofence"}
              </button>
              <button
                style={{ ...styles.btn("secondary"), flex: isMobile ? "0 0 auto" : 1, justifyContent: "center", fontSize: 11, padding: "6px 10px" }}
                onClick={resetToDefault}
              >
                <RotateCcw size={11} />{!isMobile && " Reset to Default"}
              </button>
            </div>
          </div>
        )}

        {/* ── FAB: floating "⚙ Geofence" button on mobile when panel is closed ── */}
        {isMobile && !panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            style={{
              position: "absolute", bottom: 16, right: 16, zIndex: 1000,
              background: C.accent, border: "none", borderRadius: 24,
              color: "#fff", fontWeight: 700, fontSize: 12,
              padding: "10px 16px", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(59,130,246,0.5)",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            ⚙ Geofence
          </button>
        )}
      </div>

      {/* Vehicle cards grid — tapping opens the geofence panel on mobile */}
      <div style={styles.grid4}>
        {displayVehicles.map((v) => {
          const color = pinColor(v);
          return (
            <div
              key={v.id}
              onClick={() => selectVehicle(v.id)}
              style={{
                ...styles.kpi,
                cursor: "pointer",
                border: v.isBreaching ? `1px solid #7f0000` : v.id === selectedId ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
                background: v.isBreaching ? "rgba(255,45,45,0.06)" : C.elevated,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{v.plateNumber}</span>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 ${v.isBreaching ? 8 : 5}px ${color}`, animation: v.isBreaching ? "breachPulse 1.2s ease-in-out infinite" : "none" }} />
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{v.model || "—"}</div>
              <div style={{ fontSize: 11, color: C.success, marginBottom: 2 }}>{v.assignedDriver?.fullName || "Unassigned"}</div>
              <div style={{ fontSize: 11, color, fontWeight: 600 }}>{v.status || "Active"}</div>
              <div style={{ fontSize: 10, color: v.isBreaching ? C.breach : C.muted, marginTop: 3, fontWeight: v.isBreaching ? 600 : 400 }}>
                {Math.round(v.dist).toLocaleString()} m from its zone centre
              </div>
              {v.isBreaching && <div style={{ fontSize: 9, color: C.breach, fontWeight: 700, marginTop: 3 }}>⚠ OUTSIDE BOUNDARY</div>}
              {/* Hint on mobile so users know tapping opens the editor */}
              {isMobile && (
                <div style={{ fontSize: 9, color: C.accent, marginTop: 4, opacity: 0.7 }}>
                  Tap to edit geofence →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
 const [currentUser, setCurrentUser] = useState(() => {
  try {
    const saved = sessionStorage.getItem("fleet_user");
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
});

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
useEffect(() => {
    registerUnauthorizedHandler(() => {
      clearToken();
      sessionStorage.removeItem("fleet_user");
      setCurrentUser(null);
    });
  }, []);
  const [view,            setView]            = useState("dashboard");
  const [companies,       setCompanies]       = useState([]);
  const [activeCompanyId, setActiveCompanyId] = useState("");
  const [loading,         setLoading]         = useState(true);
  const [toast,           setToast]           = useState(null);
  const [sideOpen,        setSideOpen]        = useState(true);
  
  const [activeDriverTab, setActiveDriverTab] = useState("maintenance");
const [showLanding, setShowLanding] = useState(
  () => sessionStorage.getItem("visited") !== "true"
);
  const [focusedVehicleId, setFocusedVehicleId] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const loadCompanies = useCallback(async () => {
    try {
      const list = Array.isArray(await get("/companies")) ? await get("/companies") : [];
      setCompanies(list);
      if (list.length > 0 && !activeCompanyId) setActiveCompanyId(String(list[0].id));
    } catch {
      showToast("Backend offline", "error");
    } finally {
      setLoading(false);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    if (currentUser && currentUser.role !== "driver") loadCompanies();
    else setLoading(false);
  }, [currentUser, loadCompanies]);

   if (showLanding && !currentUser) {
  sessionStorage.setItem("visited", "true");
  return <LandingPage onLoginClick={() => setShowLanding(false)} />;
}

  if (!currentUser) {
    return (
      
      <LoginScreen onLoginSuccess={(user) => {
  sessionStorage.setItem("fleet_user", JSON.stringify(user));
  setCurrentUser(user);
        if      (user.role === "admin")   setView("admin");
        else if (user.role === "driver")  setView("driver");
        else { setView("dashboard"); if (user.companyId) setActiveCompanyId(String(user.companyId)); }
      }} />
    );
  }

  const currentCompanyName = companies.find((c) => c.id === Number(activeCompanyId))?.name || "Fleet Dashboard";

  const visibleNavs = [
    { id: "admin",      label: "Super Admin",     icon: ShieldAlert,     show: currentUser.role === "admin"  },
    { id: "dashboard",  label: "Dashboard",        icon: LayoutDashboard, show: currentUser.role !== "driver" },
    { id: "vehicles",   label: "Vehicles",         icon: Truck,           show: currentUser.role !== "driver" },
    { id: "drivers",    label: "Drivers",          icon: Users,           show: currentUser.role !== "driver" },
    { id: "financials", label: "Financials",       icon: DollarSign,      show: currentUser.role !== "driver" },
    { id: "map",        label: "Live Tracker Map", icon: Map,             show: currentUser.role !== "driver" },
    { id: "driver",     label: "My Vehicle Log",   icon: User,            show: currentUser.role === "driver" },
    { id: "analytics", label: "Analytics", icon: BarChart3, show: currentUser.role !== "driver" },
    { id: "compliance", label: "Compliance", icon: ShieldCheck,
  show: currentUser.role !== "driver" },
  ].filter((n) => n.show);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 13px; }
        @keyframes spin          { to   { transform: rotate(360deg); } }
        @keyframes breachPulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes breachPinPulse { from { box-shadow: 0 0 0 3px rgba(255,45,45,0.7); } to { box-shadow: 0 0 0 8px rgba(255,45,45,0); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        input, select { color-scheme: dark; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        input::placeholder { color: #484f58; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }

        .leaflet-container { background: #eef2f5 !important; font-family: 'Inter', system-ui, sans-serif; }
        .leaflet-popup-content-wrapper { background: #ffffff !important; color: #1f2937 !important; border: 1px solid #d6dbe1 !important; border-radius: 10px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important; }
        .leaflet-popup-tip             { background: #ffffff !important; }
        .leaflet-popup-close-button    { color: #6b7280 !important; }
        .leaflet-popup-close-button:hover { color: #1f2937 !important; }
        .leaflet-control-zoom a        { background: #ffffff !important; color: #1f2937 !important; border-color: #d6dbe1 !important; }
        .leaflet-control-zoom a:hover  { background: #f3f4f6 !important; }
        .leaflet-control-attribution   { background: rgba(255,255,255,0.8) !important; color: #6b7280 !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: #3b82f6 !important; }
        .leaflet-bar                   { border-color: #d6dbe1 !important; }
        .leaflet-popup-content         { margin: 10px 14px !important; }
      `}</style>

      <div style={styles.app}>
        {isMobile && sideOpen && (
          <div
            onClick={() => setSideOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 999,
              background: "rgba(0,0,0,0.55)",
            }}
          />
        )}

        <aside style={{
          ...styles.sidebar,
          ...(isMobile ? {
            position: "fixed",
            top: 0, left: 0,
            height: "100vh",
            zIndex: 1000,
            transform: sideOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.25s ease",
            boxShadow: sideOpen ? "4px 0 24px rgba(0,0,0,0.7)" : "none",
          } : {
            display: sideOpen ? "flex" : "none",
          }),
        }}>
            <div style={styles.sidebarLogo}>
              <div style={styles.logoMark}><Activity size={15} color="#fff" /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Garanti Fleet</div>
                <div style={{ fontSize: 10, color: C.muted }}>Ethiopia Fleet OS</div>
              </div>
            </div>

            <nav style={{ flex: 1, padding: "10px 0" }}>
              {visibleNavs.map(({ id, label, icon: Icon }) => (
                <div key={id} style={styles.navItem(view === id)} onClick={() => { setFocusedVehicleId(null); setView(id); if (isMobile) setSideOpen(false); }}>
                  <Icon size={15} />{label}
                </div>
              ))}
            </nav>

            {currentUser.role !== "driver" && (
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
                <label style={{ ...styles.label, marginBottom: 6 }}>Active Company</label>
                <select style={styles.select} value={activeCompanyId} onChange={(e) => setActiveCompanyId(e.target.value)}>
                  <option value="">All companies</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {currentUser.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{currentUser.username}</div>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "capitalize" }}>{currentUser.role}</div>
                </div>
              </div>
              <button style={{ ...styles.btn("secondary"), width: "100%", justifyContent: "center", fontSize: 11, color: C.critical }} onClick={() => { clearToken(); sessionStorage.removeItem("fleet_user"); setCurrentUser(null); }}>
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          </aside>

        <div style={styles.main}>
          <header style={styles.header}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", padding: 3 }} onClick={() => setSideOpen((v) => !v)}>
              {sideOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>
              {view === "admin" ? "Super Admin Portal" : view === "driver" ? "Driver Console" : currentCompanyName}
            </div>
            <div style={{ fontSize: 11, color: C.muted, background: C.elevated, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.border}` }}>
              <span style={{ color: C.text, fontWeight: 600 }}>{currentUser.username}</span>
              <span style={{ marginLeft: 6, color: C.muted, textTransform: "capitalize" }}>· {currentUser.role}</span>
            </div>
          </header>

          <div style={styles.content}>
            {loading ? <Spinner /> : (
              <>
                {view === "admin"      && <AdminView companies={companies} onRefresh={loadCompanies} onToast={showToast} />}
                {view === "dashboard"  && <DashboardView companyId={activeCompanyId} onNavigateToMap={(vid) => { setFocusedVehicleId(vid); setView("map"); }} />}
                {view === "vehicles"   && <VehiclesView  companyId={activeCompanyId} />}
                {view === "drivers"    && <DriversView   companyId={activeCompanyId} />}
                {view === "financials" && (
                  <ManagerFinancialsDashboard
                    companyId={activeCompanyId}
                    onToast={showToast}
                  />
                )}
                {view === "analytics" && (
     <AnalyticsReportingView companyId={activeCompanyId} onToast={showToast} />
   )}
                {view === "driver" && (
  <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <button
        onClick={() => setActiveDriverTab('maintenance')}
        style={{
          flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
          border: `1px solid ${C.border}`,
          background: activeDriverTab === 'maintenance' ? C.elevated : C.surface,
          color: activeDriverTab === 'maintenance' ? C.accent : C.muted,
        }}
      >
        🛠️ Expenses / Inspection
      </button>
      <button
        onClick={() => setActiveDriverTab('fuel')}
        style={{
          flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
          border: `1px solid ${C.border}`,
          background: activeDriverTab === 'fuel' ? C.elevated : C.surface,
          color: activeDriverTab === 'fuel' ? C.accent : C.muted,
        }}
      >
        ⛽ Log Fuel Request
      </button>
    </div>
    {activeDriverTab === 'maintenance' ? (
      <DriverReceiptPortal user={currentUser} />
    ) : (
      <DriverFuelForm userSession={currentUser} />
    )}
  </div>
)}
                {view === "map"        && <LiveMapView companyId={activeCompanyId} focusedVehicleId={focusedVehicleId} />}
                {view === "compliance" && (
  <ComplianceTrackerView companyId={activeCompanyId} />
)}
              </>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
