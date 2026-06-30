// ComplianceTrackerView.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop into src/ and wire into App.jsx:
//
//   import ComplianceTrackerView from './ComplianceTrackerView';
//
//   // add to visibleNavs:
//   { id: "compliance", label: "Compliance", icon: ShieldCheck,
//     show: currentUser.role !== "driver" }
//
//   // add to view switch:
//   {view === "compliance" && (
//     <ComplianceTrackerView companyId={activeCompanyId} />
//   )}
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Truck, Users, AlertTriangle, CheckCircle2,
  XCircle, Clock, RefreshCw, ChevronDown, ChevronUp, Phone,
} from "lucide-react";

const API = "http://localhost:3000";
const get = (path) => fetch(`${API}${path}`).then((r) => r.json());

const C = {
  bg: "#0d1117", surface: "#161b22", elevated: "#1c2330", border: "#30363d",
  text: "#e6edf3", muted: "#8b949e", accent: "#3b82f6",
  critical: "#ef4444", warning: "#f59e0b", success: "#22c55e", info: "#06b6d4",
};

const S = {
  card:  (extra = {}) => ({ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", ...extra }),
  title: { fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function severityOf(days) {
  if (days === null) return "unknown";
  if (days < 0)   return "expired";
  if (days <= 14) return "critical";
  if (days <= 30) return "warning";
  return "ok";
}

function colorOf(sev) {
  return { expired: C.critical, critical: C.critical, warning: C.warning, ok: C.success, unknown: C.muted }[sev];
}

function labelOf(days) {
  if (days === null) return "No date set";
  if (days < 0)  return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today!";
  return `${days}d remaining`;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ── Countdown Badge ───────────────────────────────────────────────────────────
function CountdownBadge({ days, label }) {
  const sev   = severityOf(days);
  const color = colorOf(sev);
  const bg    = sev === "ok" ? "#052e16" : sev === "warning" ? "#451a03" : sev === "expired" || sev === "critical" ? "#450a0a" : C.surface;
  const border= sev === "ok" ? "#166534" : sev === "warning" ? "#78350f" : sev === "expired" || sev === "critical" ? "#7f1d1d" : C.border;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>{label}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: bg, border: `1px solid ${border}`, width: "fit-content", maxWidth: "100%" }}>
        {sev === "ok"      && <CheckCircle2 size={11} color={color} />}
        {sev === "warning" && <Clock        size={11} color={color} />}
        {(sev === "critical" || sev === "expired") && <AlertTriangle size={11} color={color} />}
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{labelOf(days)}</span>
      </div>
      <div style={{ fontSize: 10, color: C.muted }}>Due: {/* date shown in parent */}</div>
    </div>
  );
}

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ days, totalDays = 365, size = 52 }) {
  const sev    = severityOf(days);
  const color  = colorOf(sev);
  const radius = (size - 6) / 2;
  const circ   = 2 * Math.PI * radius;
  const pct    = days === null ? 0 : Math.max(0, Math.min(1, days / totalDays));
  const dash   = pct * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={C.border} strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

// ── KPI Summary Tile ──────────────────────────────────────────────────────────
function KpiTile({ label, value, color, icon: Icon, sub }) {
  return (
    <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: color || C.text }}>{value}</div>
          {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{ background: `${color}20`, borderRadius: 7, padding: 8 }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Vehicle Compliance Row ────────────────────────────────────────────────────
function VehicleRow({ vehicle, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const insuranceDays  = daysUntil(vehicle.insuranceExpiry);
  const inspectionDays = daysUntil(vehicle.inspectionExpiry);

  const worstSev = [severityOf(insuranceDays), severityOf(inspectionDays)]
    .reduce((a, b) => {
      const rank = { expired: 0, critical: 1, warning: 2, ok: 3, unknown: 4 };
      return rank[a] <= rank[b] ? a : b;
    });

  const rowBorder = worstSev === "expired" || worstSev === "critical"
    ? `1px solid #7f1d1d`
    : worstSev === "warning"
    ? `1px solid #78350f`
    : `1px solid ${C.border}`;

  return (
    <div style={{ border: rowBorder, borderRadius: 9, marginBottom: 8, overflow: "hidden" }}>
      {/* ── Collapsed summary row ── */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", background: C.surface }}
      >
        {/* Worst ring */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProgressRing days={Math.min(insuranceDays ?? 999, inspectionDays ?? 999)} />
          <Truck size={14} color={C.muted} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{vehicle.plateNumber}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{vehicle.model}</div>
        </div>

        {/* Quick status pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <StatusPill label="Insurance" days={insuranceDays} />
          <StatusPill label="Inspection" days={inspectionDays} />
        </div>

        <div style={{ color: C.muted, marginLeft: 4 }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {open && (
        <div style={{ background: "#111927", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <ExpiryCard
              label="Insurance Policy"
              expiryDate={vehicle.insuranceExpiry}
              days={insuranceDays}
              icon="🛡️"
            />
            <ExpiryCard
              label="Annual Vehicle Inspection"
              expiryDate={vehicle.inspectionExpiry}
              days={inspectionDays}
              icon="🔧"
            />
          </div>

          {/* Assigned driver info */}
          {vehicle.assignedDriver && (
            <div style={{ background: C.elevated, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Users size={15} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{vehicle.assignedDriver.fullName}</div>
                <div style={{ fontSize: 10, color: C.muted }}>Assigned Driver</div>
              </div>
              {vehicle.assignedDriver.phoneNumber && (
                <a href={`tel:${vehicle.assignedDriver.phoneNumber}`} style={{ display: "flex", alignItems: "center", gap: 5, color: C.accent, fontSize: 11, textDecoration: "none" }}>
                  <Phone size={12} />{vehicle.assignedDriver.phoneNumber}
                </a>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ fontSize: 11, color: C.muted }}>Chassis: <span style={{ color: C.text, fontFamily: "monospace" }}>{vehicle.chassisNumber}</span></div>
            <div style={{ fontSize: 11, color: C.muted, marginLeft: 12 }}>Mileage: <span style={{ color: C.text }}>{Number(vehicle.currentMileage).toLocaleString()} km</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Driver Compliance Row ─────────────────────────────────────────────────────
function DriverRow({ driver, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const licenseDays = daysUntil(driver.licenseExpiry);
  const sev         = severityOf(licenseDays);

  const rowBorder = sev === "expired" || sev === "critical"
    ? `1px solid #7f1d1d`
    : sev === "warning"
    ? `1px solid #78350f`
    : `1px solid ${C.border}`;

  return (
    <div style={{ border: rowBorder, borderRadius: 9, marginBottom: 8, overflow: "hidden" }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", background: C.surface }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProgressRing days={licenseDays} totalDays={365} />
          <Users size={13} color={C.muted} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{driver.fullName}</div>
          <div style={{ fontSize: 11, color: C.muted }}>
            {driver.licenseNumber}
            {!driver.isActive && <span style={{ marginLeft: 8, color: C.critical, fontSize: 10 }}>● INACTIVE</span>}
          </div>
        </div>

        <StatusPill label="Licence" days={licenseDays} />

        <div style={{ color: C.muted, marginLeft: 4 }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {open && (
        <div style={{ background: "#111927", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <ExpiryCard
            label="Driver Licence"
            expiryDate={driver.licenseExpiry}
            days={licenseDays}
            icon="🪪"
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <InfoChip label="Phone" value={
              driver.phoneNumber
                ? <a href={`tel:${driver.phoneNumber}`} style={{ color: C.accent, textDecoration: "none" }}>{driver.phoneNumber}</a>
                : "—"
            } />
            <InfoChip label="Status" value={
              <span style={{ color: driver.isActive ? C.success : C.critical, fontWeight: 600 }}>
                {driver.isActive ? "Active" : "Inactive"}
              </span>
            } />
            <InfoChip label="Assigned Vehicle" value={
              driver.assignedVehicle
                ? <span style={{ color: C.info, fontWeight: 600 }}>{driver.assignedVehicle.plateNumber}</span>
                : <span style={{ color: C.muted }}>Unassigned</span>
            } />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Expiry Detail Card ────────────────────────────────────────────────────────
function ExpiryCard({ label, expiryDate, days, icon }) {
  const sev   = severityOf(days);
  const color = colorOf(sev);
  const bg    = sev === "ok" ? "#052e16" : sev === "warning" ? "#451a03" : "#450a0a";
  const border= sev === "ok" ? "#166534" : sev === "warning" ? "#78350f" : "#7f1d1d";

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 4 }}>
        {days === null ? "—" : days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? "Expires TODAY" : `${days} days left`}
      </div>
      <div style={{ fontSize: 11, color: C.muted }}>
        Expiry date: <span style={{ color: C.text, fontWeight: 500 }}>{formatDate(expiryDate)}</span>
      </div>
    </div>
  );
}

// ── Status Pill ───────────────────────────────────────────────────────────────
function StatusPill({ label, days }) {
  const sev   = severityOf(days);
  const color = colorOf(sev);
  const bg    = sev === "ok" ? "#052e16" : sev === "warning" ? "#451a03" : sev === "expired" || sev === "critical" ? "#450a0a" : C.surface;
  const border= sev === "ok" ? "#166534" : sev === "warning" ? "#78350f" : sev === "expired" || sev === "critical" ? "#7f1d1d" : C.border;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", borderRadius: 8, background: bg, border: `1px solid ${border}`, minWidth: 80 }}>
      <div style={{ fontSize: 9, color: C.muted, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color }}>
        {days === null ? "—" : days < 0 ? "EXPIRED" : `${days}d`}
      </div>
    </div>
  );
}

// ── Info Chip ─────────────────────────────────────────────────────────────────
function InfoChip({ label, value }) {
  return (
    <div style={{ background: C.elevated, borderRadius: 7, padding: "8px 12px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "30vh", gap: 8, color: C.muted }}>
      <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Loading…
    </div>
  );
}

// ── SORT helper ───────────────────────────────────────────────────────────────
function worstDays(item, type) {
  if (type === "vehicle") {
    const d1 = daysUntil(item.insuranceExpiry)  ?? 9999;
    const d2 = daysUntil(item.inspectionExpiry) ?? 9999;
    return Math.min(d1, d2);
  }
  return daysUntil(item.licenseExpiry) ?? 9999;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ComplianceTrackerView({ companyId }) {
  const [vehicles, setVehicles] = useState([]);
  const [drivers,  setDrivers]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [tab,      setTab]      = useState("vehicles"); // "vehicles" | "drivers"
  const [filter,   setFilter]   = useState("all");      // "all" | "critical" | "warning" | "ok"

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [veh, drv] = await Promise.all([
        get(`/vehicles?companyId=${companyId}`),
        get(`/drivers?companyId=${companyId}`),
      ]);
      // Sort worst-first so expired/critical items bubble to the top
      const sortedVeh = (Array.isArray(veh) ? veh : []).sort(
        (a, b) => worstDays(a, "vehicle") - worstDays(b, "vehicle"),
      );
      const sortedDrv = (Array.isArray(drv) ? drv : []).sort(
        (a, b) => worstDays(a, "driver") - worstDays(b, "driver"),
      );
      setVehicles(sortedVeh);
      setDrivers(sortedDrv);
    } catch {
      // silent — data simply won't show
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  // ── KPI counts ──────────────────────────────────────────────────────────────
  const vehicleAlerts = vehicles.reduce((acc, v) => {
    [daysUntil(v.insuranceExpiry), daysUntil(v.inspectionExpiry)].forEach((d) => {
      const s = severityOf(d);
      if (s === "expired" || s === "critical") acc.critical++;
      else if (s === "warning") acc.warning++;
    });
    return acc;
  }, { critical: 0, warning: 0 });

  const driverAlerts = drivers.reduce((acc, d) => {
    const s = severityOf(daysUntil(d.licenseExpiry));
    if (s === "expired" || s === "critical") acc.critical++;
    else if (s === "warning") acc.warning++;
    return acc;
  }, { critical: 0, warning: 0 });

  const totalCritical = vehicleAlerts.critical + driverAlerts.critical;
  const totalWarning  = vehicleAlerts.warning  + driverAlerts.warning;
  const totalOk       = (vehicles.length * 2 + drivers.length) - totalCritical - totalWarning;

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filteredVehicles = vehicles.filter((v) => {
    if (filter === "all") return true;
    const sevs = [severityOf(daysUntil(v.insuranceExpiry)), severityOf(daysUntil(v.inspectionExpiry))];
    if (filter === "critical") return sevs.some((s) => s === "critical" || s === "expired");
    if (filter === "warning")  return sevs.some((s) => s === "warning");
    if (filter === "ok")       return sevs.every((s) => s === "ok");
    return true;
  });

  const filteredDrivers = drivers.filter((d) => {
    if (filter === "all") return true;
    const sev = severityOf(daysUntil(d.licenseExpiry));
    if (filter === "critical") return sev === "critical" || sev === "expired";
    if (filter === "warning")  return sev === "warning";
    if (filter === "ok")       return sev === "ok";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── KPI Strip ── */}
      <div style={S.grid4}>
        <KpiTile label="Critical / Expired" value={totalCritical} color={C.critical} icon={XCircle}       sub="immediate action needed" />
        <KpiTile label="Expiring Soon"       value={totalWarning}  color={C.warning}  icon={AlertTriangle} sub="within 30 days" />
        <KpiTile label="Fully Compliant"     value={totalOk}       color={C.success}  icon={CheckCircle2}  sub="all documents valid" />
        <KpiTile label="Total Assets"        value={vehicles.length + drivers.length} color={C.info} icon={ShieldCheck} sub={`${vehicles.length} vehicles · ${drivers.length} drivers`} />
      </div>

      {/* ── Filter + Tab bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, background: C.elevated, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {[
            { id: "vehicles", label: "Fleet Vehicles", icon: Truck,  count: vehicles.length },
            { id: "drivers",  label: "Drivers",        icon: Users,  count: drivers.length  },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: tab === id ? C.accent : "transparent", color: tab === id ? "#fff" : C.muted }}
            >
              <Icon size={13} />{label}
              <span style={{ background: tab === id ? "rgba(255,255,255,0.2)" : C.surface, borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "all",      label: "All",      color: C.muted    },
            { id: "critical", label: "⚠ Critical", color: C.critical },
            { id: "warning",  label: "⏰ Warning",  color: C.warning  },
            { id: "ok",       label: "✓ OK",       color: C.success  },
          ].map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === id ? color : C.border}`, background: filter === id ? `${color}20` : C.elevated, color: filter === id ? color : C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={load}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.elevated, color: C.muted, fontSize: 11, cursor: "pointer" }}
          >
            <RefreshCw size={11} style={loading ? { animation: "spin 1s linear infinite" } : {}} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? <Spinner /> : (
        <div>
          {tab === "vehicles" && (
            filteredVehicles.length === 0
              ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>No vehicles match this filter.</div>
              : filteredVehicles.map((v) => (
                  <VehicleRow key={v.id} vehicle={v} defaultOpen={worstDays(v, "vehicle") <= 14} />
                ))
          )}
          {tab === "drivers" && (
            filteredDrivers.length === 0
              ? <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>No drivers match this filter.</div>
              : filteredDrivers.map((d) => (
                  <DriverRow key={d.id} driver={d} defaultOpen={worstDays(d, "driver") <= 14} />
                ))
          )}
        </div>
      )}
    </div>
  );
}