import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, XCircle, Clock, RefreshCw, Truck, DollarSign,
  TrendingUp, AlertTriangle, Plus, Gauge, BarChart2, Receipt,
  ChevronRight, Eye, EyeOff, Fuel,
} from "lucide-react";
import FuelTab from './FuelTab';

const C = {
  bg:       "#0d1117",
  surface:  "#161b22",
  elevated: "#1c2330",
  border:   "#30363d",
  text:     "#e6edf3",
  muted:    "#8b949e",
  accent:   "#3b82f6",
  critical: "#ef4444",
  warning:  "#f59e0b",
  success:  "#22c55e",
  info:     "#06b6d4",
};

const API = "http://localhost:3000";

const CATEGORIES = [
  { value: "MAINTENANCE",  label: "Maintenance"  },
  { value: "INSURANCE",    label: "Insurance"    },
  { value: "TIRES",        label: "Tires"        },
  { value: "REGISTRATION", label: "Registration" },
  { value: "ROAD_TOLL",    label: "Road Toll"    },
  { value: "OTHER",        label: "Other"        },
];

const S = {
  card: (extra = {}) => ({
    background: C.elevated,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "16px 18px",
    ...extra,
  }),
  input: {
    width: "100%", background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 13,
    outline: "none", boxSizing: "border-box",
  },
  select: {
    width: "100%", background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 13,
    outline: "none", cursor: "pointer", boxSizing: "border-box",
  },
  label: {
    display: "block", marginBottom: 5, color: C.muted, fontSize: 11, fontWeight: 500,
  },
  btn: (v = "primary") => ({
    display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px",
    borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500,
    background: v === "primary" ? C.accent : v === "danger" ? "#450a0a"
              : v === "success" ? "#052e16" : C.elevated,
    color: v === "primary" ? "#fff" : v === "danger" ? C.critical
         : v === "success" ? C.success : C.text,
    border: v === "primary" ? "none" : v === "danger" ? `1px solid #7f1d1d`
          : v === "success" ? `1px solid #166534` : `1px solid ${C.border}`,
    transition: "opacity 0.15s",
  }),
  sectionTitle: { fontSize: 14, fontWeight: 600, marginBottom: 14, color: C.text },
  th: { textAlign: "left", padding: "6px 8px", color: C.muted, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" },
  td: { padding: "8px", fontSize: 12 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 },
};

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
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

function StatusBadge({ status }) {
  const map = {
    PENDING:  { color: C.warning,  bg: "#451a03", border: "#78350f" },
    APPROVED: { color: C.success,  bg: "#052e16", border: "#166534" },
    REJECTED: { color: C.critical, bg: "#450a0a", border: "#7f1d1d" },
  };
  const m = map[status] || map.PENDING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
    }}>
      {status === "APPROVED" ? <CheckCircle2 size={9} />
       : status === "REJECTED" ? <XCircle size={9} />
       : <Clock size={9} />}
      {status}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8, color: C.muted }}>
      <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading…
    </div>
  );
}

function PendingReceiptsTab({ companyId, vehicles, onToast }) {
  const [receipts, setReceipts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [acting,   setActing]   = useState(null);
  const [expandId, setExpandId] = useState(null);

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`${API}/financials/transactions?companyId=${companyId}&status=PENDING`)
      .then((r) => r.json())
      .then((d) => setReceipts(Array.isArray(d) ? d : []))
      .catch(() => onToast("Could not load pending receipts.", "error"))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const decide = async (id, newStatus) => {
    setActing(id);
    try {
      const res = await fetch(
        `${API}/financials/transactions/${id}/approval?companyId=${companyId}`,
        {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ approvalStatus: newStatus }),
        }
      );
      if (!res.ok) throw new Error();
      onToast(`Receipt ${newStatus.toLowerCase()}.`, newStatus === "APPROVED" ? "success" : "error");
      setReceipts((prev) => prev.filter((r) => r.id !== id));
      if (expandId === id) setExpandId(null);
    } catch {
      onToast("Action failed — check backend.", "error");
    } finally {
      setActing(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {receipts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
          <CheckCircle2 size={32} color={C.success} style={{ display: "block", margin: "0 auto 10px" }} />
          <div style={{ fontSize: 13 }}>No pending receipts — all clear.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {receipts.map((r) => {
            const veh      = vehicles.find((v) => v.id === r.vehicleId);
            const expanded = expandId === r.id;
            const isActing = acting === r.id;
            return (
              <div key={r.id} style={{ ...S.card(), border: `1px solid #78350f` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                     onClick={() => setExpandId(expanded ? null : r.id)}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#451a03", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Receipt size={16} color={C.warning} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                      {r.category.replace("_", " ")}
                      {veh && <span style={{ color: C.muted, fontWeight: 400 }}> · {veh.plateNumber}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>{r.date}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.warning }}>ETB {Number(r.amount).toLocaleString()}</div>
                    <StatusBadge status={r.approvalStatus} />
                  </div>
                  <ChevronRight size={14} color={C.muted} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }} />
                </div>
                {expanded && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    {r.description && (
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                        <span style={{ fontWeight: 600, color: C.text }}>Description: </span>{r.description}
                      </div>
                    )}
                    {r.receiptUrl && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Attached Receipt:</div>
                        <img src={r.receiptUrl} alt="Receipt"
                          style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, border: `1px solid ${C.border}`, objectFit: "cover" }}
                          onError={(e) => { e.target.style.display = "none"; }} />
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...S.btn("success"), flex: 1, justifyContent: "center" }} onClick={() => decide(r.id, "APPROVED")} disabled={isActing}>
                        <CheckCircle2 size={13} />{isActing ? "Processing…" : "Approve"}
                      </button>
                      <button style={{ ...S.btn("danger"), flex: 1, justifyContent: "center" }} onClick={() => decide(r.id, "REJECTED")} disabled={isActing}>
                        <XCircle size={13} />{isActing ? "Processing…" : "Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MileageTab({ companyId, vehicles, onToast }) {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ vehicleId: "", date: new Date().toISOString().slice(0, 10), odometerReading: "" });

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`${API}/financials/mileage?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .catch(() => onToast("Could not load mileage logs.", "error"))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submitLog = async () => {
    if (!form.vehicleId) { onToast("Select a vehicle.", "error"); return; }
    if (!form.odometerReading || Number(form.odometerReading) < 0) { onToast("Enter a valid odometer reading.", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/financials/mileage?companyId=${companyId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          vehicleId:       Number(form.vehicleId),
          date:            form.date,
          odometerReading: Number(form.odometerReading),
          companyId:       Number(companyId),
        }),
      });
      if (!res.ok) throw new Error();
      onToast("Odometer reading logged.", "success");
      setForm({ vehicleId: "", date: new Date().toISOString().slice(0, 10), odometerReading: "" });
      load();
    } catch {
      onToast("Failed to log reading — check backend.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={S.card()}>
        <div style={S.sectionTitle}>Log Odometer Reading</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <div>
            <label style={S.label}>Vehicle</label>
            <select style={S.select} value={form.vehicleId} onChange={(e) => setF("vehicleId", e.target.value)}>
              <option value="">— select —</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} · {v.model}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Date</label>
            <input type="date" style={S.input} value={form.date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setF("date", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Odometer (km)</label>
            <input type="number" min="0" style={S.input} placeholder="e.g. 48500" value={form.odometerReading} onChange={(e) => setF("odometerReading", e.target.value)} />
          </div>
        </div>
        <button style={{ ...S.btn("primary"), marginTop: 12 }} onClick={submitLog} disabled={saving}>
          <Plus size={12} /> {saving ? "Saving…" : "Log Reading"}
        </button>
      </div>
      <div style={S.card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={S.sectionTitle}>Mileage History</div>
          <button style={S.btn("secondary")} onClick={load}><RefreshCw size={12} /></button>
        </div>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Vehicle", "Date", "Odometer (km)", "Distance Covered"].map((h) => <th key={h} style={S.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", color: C.muted, padding: "24px 0" }}>No mileage logs yet.</td></tr>
                ) : logs.map((l) => {
                  const veh = vehicles.find((v) => v.id === l.vehicleId);
                  return (
                    <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ ...S.td, fontWeight: 600 }}>{veh?.plateNumber || `#${l.vehicleId}`}</td>
                      <td style={{ ...S.td, color: C.muted }}>{l.date}</td>
                      <td style={{ ...S.td, fontFamily: "monospace" }}>{Number(l.odometerReading).toLocaleString()} km</td>
                      <td style={S.td}>
                        {Number(l.distanceCovered) > 0
                          ? <span style={{ color: C.success, fontWeight: 600 }}>+{Number(l.distanceCovered).toLocaleString()} km</span>
                          : <span style={{ color: C.muted }}>— (first entry)</span>}
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

function EfficiencyTab({ companyId, vehicles, onToast }) {
  const [cpkData,  setCpkData]  = useState([]);
  const [summary,  setSummary]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  const load = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/financials/cpk?companyId=${companyId}`).then((r) => r.json()),
      fetch(`${API}/financials/summary?companyId=${companyId}`).then((r) => r.json()),
    ])
      .then(([cpk, summ]) => {
        setCpkData(Array.isArray(cpk)  ? cpk  : []);
        setSummary(Array.isArray(summ) ? summ : []);
      })
      .catch(() => onToast("Could not load efficiency data.", "error"))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const totalExpenses = cpkData.reduce((acc, r) => acc + Number(r.totalApprovedExpenses) + Number(r.totalFuelCost ?? 0), 0);
  const totalDistance = cpkData.reduce((acc, r) => acc + Number(r.totalDistanceKm), 0);
  const fleetCpk      = totalDistance > 0 ? (totalExpenses / totalDistance).toFixed(2) : null;

  const CAT_COLORS = {
    MAINTENANCE: C.warning, INSURANCE: C.info, TIRES: "#a78bfa",
    REGISTRATION: C.accent, ROAD_TOLL: "#f472b6", OTHER: C.muted, FUEL: C.success,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={S.grid4}>
        <KpiCard label="Total Fleet Spend"    value={`ETB ${totalExpenses.toLocaleString()}`}  icon={DollarSign} color={C.warning} sub="expenses + fuel" />
        <KpiCard label="Total Fleet Distance" value={`${totalDistance.toLocaleString()} km`}   icon={Gauge}      color={C.info}    sub="sum of mileage logs" />
        <KpiCard label="Fleet-Wide CPK"       value={fleetCpk ? `ETB ${fleetCpk}` : "N/A"}    icon={TrendingUp} color={fleetCpk ? C.success : C.muted} sub="cost per kilometre" />
        <KpiCard label="Vehicles Tracked"     value={cpkData.length}                            icon={Truck}      color={C.accent}  sub="with financial data" />
      </div>

      <div style={S.grid2}>
        <div style={S.card()}>
          <div style={S.sectionTitle}>Spend by Category</div>
          {loading ? <Spinner /> : summary.length === 0 ? (
            <div style={{ color: C.muted, textAlign: "center", padding: "24px 0", fontSize: 12 }}>No approved transactions yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {summary.map((row) => {
                const total  = summary.reduce((a, r) => a + Number(r.total), 0);
                const pct    = total > 0 ? (Number(row.total) / total) * 100 : 0;
                const barClr = CAT_COLORS[row.category] || C.muted;
                return (
                  <div key={row.category}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{row.category.replace("_", " ")}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: barClr }}>ETB {Number(row.total).toLocaleString()}</span>
                    </div>
                    <div style={{ background: C.surface, borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ background: barClr, width: `${pct.toFixed(1)}%`, height: "100%", borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={S.card()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={S.sectionTitle}>Per-Vehicle CPK</div>
            <button style={S.btn("secondary")} onClick={load}><RefreshCw size={12} /></button>
          </div>
          {loading ? <Spinner /> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Vehicle", "Other Expenses", "Fuel Cost", "Distance", "CPK"].map((h) => <th key={h} style={S.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {cpkData.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: C.muted, padding: "24px 0" }}>No data yet. Log transactions and mileage readings to see CPK.</td></tr>
                  ) : cpkData.map((row) => {
                    const veh      = vehicles.find((v) => v.id === row.vehicleId);
                    const cpkColor = row.cpk === null ? C.muted : row.cpk < 5 ? C.success : row.cpk < 15 ? C.warning : C.critical;
                    return (
                      <tr key={row.vehicleId} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ ...S.td, fontWeight: 600 }}>{veh?.plateNumber || `#${row.vehicleId}`}</td>
                        <td style={{ ...S.td, color: C.warning }}>ETB {Number(row.totalApprovedExpenses).toLocaleString()}</td>
                        <td style={{ ...S.td, color: C.success }}>ETB {Number(row.totalFuelCost ?? 0).toLocaleString()}</td>
                        <td style={{ ...S.td, color: C.info }}>{Number(row.totalDistanceKm).toLocaleString()} km</td>
                        <td style={{ ...S.td, fontWeight: 700, color: cpkColor }}>{row.cpk !== null ? `ETB ${row.cpk}/km` : "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LogTransactionTab({ companyId, vehicles, onToast }) {
  const blank = { vehicleId: "", category: "", amount: "", description: "", date: new Date().toISOString().slice(0, 10) };
  const [form,    setForm]    = useState(blank);
  const [saving,  setSaving]  = useState(false);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(false);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadRecent = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`${API}/financials/transactions?companyId=${companyId}&status=APPROVED`)
      .then((r) => r.json())
      .then((d) => setRecent((Array.isArray(d) ? d : []).slice(0, 20)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const submit = async () => {
    if (!form.category) { onToast("Select a category.", "error"); return; }
    if (!form.amount || Number(form.amount) <= 0) { onToast("Enter a valid amount.", "error"); return; }
    setSaving(true);
    try {
      // companyId sent both in URL query param AND body for maximum compatibility
      const res = await fetch(`${API}/financials/transactions?companyId=${companyId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId:   form.vehicleId ? Number(form.vehicleId) : undefined,
          category:    form.category,
          amount:      Number(form.amount),
          description: form.description || undefined,
          date:        form.date,
          companyId:   Number(companyId),
        }),
      });
      if (!res.ok) throw new Error();
      onToast("Transaction logged.", "success");
      setForm(blank);
      loadRecent();
    } catch {
      onToast("Failed to log transaction.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={S.card()}>
        <div style={S.sectionTitle}>Log Manager Transaction</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <div>
            <label style={S.label}>Vehicle (optional)</label>
            <select style={S.select} value={form.vehicleId} onChange={(e) => setF("vehicleId", e.target.value)}>
              <option value="">— fleet-wide —</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber} · {v.model}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Category *</label>
            <select style={S.select} value={form.category} onChange={(e) => setF("category", e.target.value)}>
              <option value="">— select —</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Amount (ETB) *</label>
            <input type="number" min="0" step="0.01" style={S.input} placeholder="0.00" value={form.amount} onChange={(e) => setF("amount", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Date *</label>
            <input type="date" style={S.input} value={form.date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setF("date", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={S.label}>Description</label>
            <input style={S.input} placeholder="Optional note…" value={form.description} onChange={(e) => setF("description", e.target.value)} />
          </div>
        </div>
        <button style={{ ...S.btn("primary"), marginTop: 12 }} onClick={submit} disabled={saving}>
          <Plus size={12} /> {saving ? "Saving…" : "Log Transaction"}
        </button>
      </div>

      <div style={S.card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={S.sectionTitle}>Recent Approved Transactions</div>
          <button style={S.btn("secondary")} onClick={loadRecent}><RefreshCw size={12} /></button>
        </div>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Date", "Vehicle", "Category", "Amount", "Status"].map((h) => <th key={h} style={S.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: C.muted, padding: "24px 0" }}>No transactions logged yet.</td></tr>
                ) : recent.map((tx) => {
                  const veh = vehicles.find((v) => v.id === tx.vehicleId);
                  return (
                    <tr key={tx.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ ...S.td, color: C.muted }}>{tx.date}</td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{veh?.plateNumber || (tx.vehicleId ? `#${tx.vehicleId}` : "Fleet-wide")}</td>
                      <td style={S.td}>{tx.category.replace("_", " ")}</td>
                      <td style={{ ...S.td, color: C.warning, fontWeight: 600 }}>ETB {Number(tx.amount).toLocaleString()}</td>
                      <td style={S.td}><StatusBadge status={tx.approvalStatus} /></td>
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

const TABS = [
  { id: "receipts",   label: "Pending Receipts",  icon: Receipt    },
  { id: "mileage",    label: "Distance / Mileage", icon: Gauge      },
  { id: "efficiency", label: "Efficiency & CPK",   icon: TrendingUp },
  { id: "log",        label: "Log Expense",        icon: Plus       },
  { id: "fuel",       label: "Fuel",               icon: Fuel       },
];

export default function ManagerFinancialsDashboard({ companyId, onToast }) {
  const [vehicles,     setVehicles]     = useState([]);
  const [activeTab,    setActiveTab]    = useState("receipts");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!companyId) return;
    fetch(`${API}/vehicles?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setVehicles(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    fetch(`${API}/financials/transactions?companyId=${companyId}&status=PENDING`)
      .then((r) => r.json())
      .then((d) => setPendingCount(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, [companyId]);

  if (!companyId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: 10, color: C.muted }}>
        <DollarSign size={36} color={C.border} />
        <div style={{ fontSize: 14 }}>Select a company to view financials</div>
      </div>
    );
  }

  const tabProps = { companyId: Number(companyId), vehicles, onToast };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive  = activeTab === id;
          const isPending = id === "receipts" && pendingCount > 0;
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              background: isActive ? C.elevated : "transparent",
              color:      isActive ? C.text     : C.muted,
              border: isActive ? `1px solid ${C.border}` : "1px solid transparent",
              transition: "all 0.15s",
            }}>
              <Icon size={13} /> {label}
              {isPending && (
                <span style={{ background: C.warning, color: "#000", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 2 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "receipts"   && <PendingReceiptsTab {...tabProps} />}
      {activeTab === "mileage"    && <MileageTab         {...tabProps} />}
      {activeTab === "efficiency" && <EfficiencyTab      {...tabProps} />}
      {activeTab === "log"        && <LogTransactionTab  {...tabProps} />}
      {activeTab === "fuel"       && <FuelTab            {...tabProps} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}