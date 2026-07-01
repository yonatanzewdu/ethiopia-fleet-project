/**
 * FuelTab.jsx
 * Drop this into ManagerFinancialsDashboard.jsx as a new tab.
 * Also requires the backend fuel module to be registered (see integration steps).
 */

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Fuel, TrendingDown, DollarSign, Gauge } from "lucide-react";
import { get, post } from './api/client';

const C = {
  bg: "#0d1117", surface: "#161b22", elevated: "#1c2330",
  border: "#30363d", text: "#e6edf3", muted: "#8b949e",
  accent: "#3b82f6", critical: "#ef4444", warning: "#f59e0b",
  success: "#22c55e", info: "#06b6d4",
};

const S = {
  card: (extra = {}) => ({ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", ...extra }),
  input: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 13, outline: "none", cursor: "pointer", boxSizing: "border-box" },
  label: { display: "block", marginBottom: 5, color: C.muted, fontSize: 11, fontWeight: 500 },
  btn: (v = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px",
    borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500,
    background: v === "primary" ? C.accent : C.elevated,
    color: v === "primary" ? "#fff" : C.text,
    border: v === "primary" ? "none" : `1px solid ${C.border}`,
    transition: "opacity 0.15s",
  }),
  th: { textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, fontWeight: 600 },
  td: { padding: "8px", fontSize: 12 },
  kpi: { background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" },
};

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={S.kpi}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: color || C.text }}>{value ?? "—"}</div>
          {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{ background: color ? `${color}20` : C.surface, borderRadius: 7, padding: 8 }}>
          <Icon size={18} color={color || C.muted} />
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8, color: C.muted }}>
      <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading…
    </div>
  );
}

export default function FuelTab({ companyId, vehicles, onToast }) {
  const blank = {
    vehicleId: "", date: new Date().toISOString().slice(0, 10),
    litres: "", pricePerLitre: "", odometerReading: "", notes: "",
  };

  const [form,    setForm]    = useState(blank);
  const [logs,    setLogs]    = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const totalCost = form.litres && form.pricePerLitre
    ? (Number(form.litres) * Number(form.pricePerLitre)).toFixed(2)
    : null;

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([
      get(`/fuel?companyId=${companyId}`),
      get(`/fuel/summary?companyId=${companyId}`),
    ])
      .then(([logsData, summaryData]) => {
        setLogs(Array.isArray(logsData) ? logsData : []);
        setSummary(summaryData && typeof summaryData === "object" ? summaryData : null);
      })
      .catch(() => onToast("Could not load fuel data.", "error"))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.vehicleId)       { onToast("Select a vehicle.", "error"); return; }
    if (!form.litres || Number(form.litres) <= 0) { onToast("Enter litres filled.", "error"); return; }
    if (!form.pricePerLitre || Number(form.pricePerLitre) <= 0) { onToast("Enter price per litre.", "error"); return; }
    if (!form.odometerReading || Number(form.odometerReading) < 0) { onToast("Enter odometer reading.", "error"); return; }

    setSaving(true);
    try {
      await post(`/fuel`, {
        vehicleId:      Number(form.vehicleId),
        date:           form.date,
        litres:         Number(form.litres),
        pricePerLitre:  Number(form.pricePerLitre),
        odometerReading: Number(form.odometerReading),
        notes:          form.notes || undefined,
        companyId:      Number(companyId),
      });
      onToast("Fuel fill-up logged.", "success");
      setForm(blank);
      load();
    } catch {
      onToast("Failed to log fuel — check backend.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <KpiCard label="Total Fuel Spend"     value={summary ? `ETB ${Number(summary.totalSpend).toLocaleString()}` : "—"}        icon={DollarSign}   color={C.warning} sub="all fill-ups" />
        <KpiCard label="Total Litres"          value={summary ? `${Number(summary.totalLitres).toLocaleString()} L` : "—"}          icon={Fuel}         color={C.info}    sub="across fleet" />
        <KpiCard label="Avg Consumption"       value={summary?.avgLitresPer100km ? `${summary.avgLitresPer100km} L/100km` : "N/A"}  icon={TrendingDown} color={summary?.avgLitresPer100km ? C.success : C.muted} sub="fleet average" />
        <KpiCard label="Avg Price / Litre"     value={summary?.avgPricePerLitre ? `ETB ${summary.avgPricePerLitre}` : "N/A"}        icon={Gauge}        color={C.accent}  sub="across fill-ups" />
      </div>

      {/* Log form */}
      <div style={S.card()}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: C.text }}>Log Fuel Fill-Up</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <div>
            <label style={S.label}>Vehicle *</label>
            <select style={S.select} value={form.vehicleId} onChange={(e) => setF("vehicleId", e.target.value)}>
              <option value="">— select —</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} · {v.model}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Date *</label>
            <input type="date" style={S.input} value={form.date}
                   max={new Date().toISOString().slice(0, 10)}
                   onChange={(e) => setF("date", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Litres Filled *</label>
            <input type="number" min="0" step="0.1" style={S.input}
                   placeholder="e.g. 60" value={form.litres}
                   onChange={(e) => setF("litres", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Price per Litre (ETB) *</label>
            <input type="number" min="0" step="0.01" style={S.input}
                   placeholder="e.g. 92.50" value={form.pricePerLitre}
                   onChange={(e) => setF("pricePerLitre", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Odometer (km) *</label>
            <input type="number" min="0" style={S.input}
                   placeholder="e.g. 48500" value={form.odometerReading}
                   onChange={(e) => setF("odometerReading", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Notes</label>
            <input style={S.input} placeholder="Optional…" value={form.notes}
                   onChange={(e) => setF("notes", e.target.value)} />
          </div>
        </div>

        {/* Auto-calculated total */}
        {totalCost && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: C.surface, borderRadius: 7, border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: C.muted }}>Total Cost:</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.warning }}>ETB {Number(totalCost).toLocaleString()}</span>
          </div>
        )}

        <button style={{ ...S.btn("primary"), marginTop: 12 }} onClick={submit} disabled={saving}>
          <Plus size={12} /> {saving ? "Saving…" : "Log Fill-Up"}
        </button>
      </div>

      {/* Per-vehicle summary */}
      {summary?.perVehicle?.length > 0 && (
        <div style={S.card()}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: C.text }}>Per-Vehicle Fuel Summary</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Vehicle", "Total Spend", "Litres", "KM Tracked", "Avg L/100km"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.perVehicle.map((row) => {
                  const veh = vehicles.find((v) => v.id === row.vehicleId);
                  const effColor = row.avgLitresPer100km === null ? C.muted
                    : row.avgLitresPer100km < 12 ? C.success
                    : row.avgLitresPer100km < 20 ? C.warning
                    : C.critical;
                  return (
                    <tr key={row.vehicleId} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ ...S.td, fontWeight: 600 }}>{veh?.plateNumber || `#${row.vehicleId}`}</td>
                      <td style={{ ...S.td, color: C.warning }}>ETB {Number(row.totalSpend).toLocaleString()}</td>
                      <td style={{ ...S.td, color: C.info }}>{Number(row.totalLitres).toLocaleString()} L</td>
                      <td style={{ ...S.td, color: C.muted }}>{Number(row.totalKm).toLocaleString()} km</td>
                      <td style={{ ...S.td, fontWeight: 700, color: effColor }}>
                        {row.avgLitresPer100km !== null ? `${row.avgLitresPer100km} L/100km` : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fill-up history */}
      <div style={S.card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Fill-Up History</div>
          <button style={S.btn("secondary")} onClick={load}><RefreshCw size={12} /></button>
        </div>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Date", "Vehicle", "Litres", "Price/L", "Total", "Odometer", "km since last", "L/100km"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...S.td, textAlign: "center", color: C.muted, padding: "24px 0" }}>
                      No fuel logs yet. Log your first fill-up above.
                    </td>
                  </tr>
                ) : logs.map((log) => {
                  const veh = vehicles.find((v) => v.id === log.vehicleId);
                  const effColor = log.litresPer100km === null ? C.muted
                    : Number(log.litresPer100km) < 12 ? C.success
                    : Number(log.litresPer100km) < 20 ? C.warning
                    : C.critical;
                  return (
                    <tr key={log.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ ...S.td, color: C.muted }}>{log.date}</td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{veh?.plateNumber || `#${log.vehicleId}`}</td>
                      <td style={{ ...S.td, color: C.info }}>{Number(log.litres).toLocaleString()} L</td>
                      <td style={{ ...S.td, color: C.muted }}>ETB {Number(log.pricePerLitre).toFixed(2)}</td>
                      <td style={{ ...S.td, color: C.warning, fontWeight: 600 }}>ETB {Number(log.totalCost).toLocaleString()}</td>
                      <td style={{ ...S.td, color: C.muted }}>{Number(log.odometerReading).toLocaleString()} km</td>
                      <td style={{ ...S.td, color: C.muted }}>
                        {Number(log.kmSinceLastFill) > 0 ? `${Number(log.kmSinceLastFill).toLocaleString()} km` : <span style={{ color: C.muted }}>— (first)</span>}
                      </td>
                      <td style={{ ...S.td, fontWeight: 600, color: effColor }}>
                        {log.litresPer100km !== null ? `${Number(log.litresPer100km).toFixed(1)}` : "N/A"}
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
