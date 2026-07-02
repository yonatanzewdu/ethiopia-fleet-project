import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign, Route as RouteIcon, Gauge, Truck, Calendar,
  ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, RefreshCw, Building2,
  Flame, Droplets,
} from "lucide-react";
import { reportsApi } from "./reportsApi";

const C = {
  bg: "#0d1117", surface: "#161b22", elevated: "#1c2330", border: "#30363d",
  text: "#e6edf3", muted: "#8b949e", accent: "#3b82f6",
  critical: "#ef4444", warning: "#f59e0b", success: "#22c55e", info: "#06b6d4",
  fuel: "#f97316", // orange — distinct from other categories
};

const styles = {
  card: { background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" },
  sectionTitle: { fontSize: 14, fontWeight: 600, marginBottom: 14, color: C.text },
  controlBar: {
    display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end",
    background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "14px 16px", marginBottom: 14,
  },
  controlGroup: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 11, color: C.muted, fontWeight: 500 },
  select: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7,
    padding: "7px 10px", color: C.text, fontSize: 13, outline: "none", cursor: "pointer", minWidth: 180,
  },
  dateInput: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7,
    padding: "7px 10px", color: C.text, fontSize: 13, outline: "none",
  },
  refreshBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px",
    borderRadius: 7, border: "none", background: C.accent, color: "#fff",
    fontWeight: 600, fontSize: 12, cursor: "pointer",
  },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 },
  kpi: { background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" },
  kpiLabel: { fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 },
  kpiValue: { fontSize: 22, fontWeight: 700, color: C.text },
  kpiSub: { fontSize: 10, color: C.muted, marginTop: 3 },
  panelGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14, marginBottom: 14 },
  categoryRow: { marginBottom: 12 },
  categoryTop: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 },
  categoryName: { fontWeight: 600, color: C.text, textTransform: "capitalize" },
  categoryAmount: { color: C.muted },
  barTrack: { height: 7, borderRadius: 4, background: C.surface, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  trendRow: { display: "flex", alignItems: "flex-end", gap: 8, height: 150, paddingTop: 10 },
  trendBarWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  trendBar: { width: "100%", maxWidth: 28, borderRadius: "4px 4px 0 0", background: C.accent, minHeight: 4 },
  trendLabel: { fontSize: 9, color: C.muted, textAlign: "center" },
  trendValue: { fontSize: 10, fontWeight: 600, color: C.text },
  th: {
    textAlign: "left", padding: "5px 8px", color: C.muted, fontSize: 10, fontWeight: 600,
    cursor: "pointer", userSelect: "none", borderBottom: `1px solid ${C.border}`,
  },
  td: { padding: "9px 8px", color: C.text, borderBottom: `1px solid ${C.border}` },
  thInner: { display: "flex", alignItems: "center", gap: 4 },
  errorBanner: {
    display: "flex", alignItems: "center", gap: 8, background: "#450a0a",
    border: `1px solid #7f1d1d`, color: C.critical, borderRadius: 8,
    padding: "10px 14px", marginBottom: 14, fontSize: 12,
  },
  empty: { color: C.muted, textAlign: "center", padding: "24px 0", fontSize: 12 },
  fuelVehicleRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12,
  },
};

const CATEGORY_COLORS = {
  maintenance: "#3b82f6", repair: "#a855f7", insurance: "#06b6d4", tax: "#f59e0b",
  tires: "#ef4444", registration: "#22c55e", road_toll: "#84cc16", other: "#8b949e",
  fuel: "#f97316",
};

const money = (n) => `ETB ${new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 }).format(n ?? 0)}`;
const num   = (n) => new Intl.NumberFormat("en-ET", { maximumFractionDigits: 1 }).format(n ?? 0);

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

export default function AnalyticsReportingView({ companyId, onToast }) {
  const [{ startDate, endDate }, setRange] = useState(defaultRange());
  const [vehicleId, setVehicleId] = useState("");
  const [vehicles, setVehicles]   = useState([]);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [sortKey, setSortKey]     = useState("totalCost");
  const [sortDir, setSortDir]     = useState("desc");

  useEffect(() => {
    if (!companyId) return;
    reportsApi.getVehicles(companyId).then((d) => setVehicles(Array.isArray(d) ? d : [])).catch(() => {});
  }, [companyId]);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true); setError(null);
    try {
      const result = await reportsApi.getDashboard(companyId, {
        vehicleId: vehicleId || undefined,
        startDate,
        endDate,
      });
      setData(result);
    } catch {
      setError("Could not load analytics data — check backend on :3000.");
      onToast?.("Could not load analytics data", "error");
    } finally {
      setLoading(false);
    }
  }, [companyId, vehicleId, startDate, endDate, onToast]);

  useEffect(() => { load(); }, [load]);

  const sortedComparison = useMemo(() => {
    if (!data?.vehicleComparison) return [];
    const rows = [...data.vehicleComparison];
    rows.sort((a, b) => {
      const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return rows;
  }, [data, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortHeader({ field, children }) {
    const active = sortKey === field;
    return (
      <th style={styles.th} onClick={() => toggleSort(field)}>
        <span style={styles.thInner}>
          {children}
          {active ? (sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />) : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />}
        </span>
      </th>
    );
  }

  if (!companyId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: 10, color: C.muted }}>
        <Building2 size={36} color={C.border} />
        <div style={{ fontSize: 14 }}>Select a company to view analytics</div>
      </div>
    );
  }

  const plateFor = (vId) => vehicles.find((v) => v.id === vId)?.plateNumber ?? `#${vId}`;
  const maxCategoryTotal = Math.max(1, ...(data?.expenseBreakdown ?? []).map((r) => r.total));
  const maxTrendValue = Math.max(1, ...(data?.cpkTrend ?? []).map((p) => p.costPerKilometer ?? 0));

  const kpis = data?.kpis;
  const fuel = data?.fuelSummary;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Controls ── */}
      <div style={styles.controlBar}>
        <div style={styles.controlGroup}>
          <span style={styles.label}>Scope</span>
          <select style={styles.select} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">All Vehicles</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
          </select>
        </div>
        <div style={styles.controlGroup}>
          <span style={styles.label}><Calendar size={10} style={{ marginRight: 4, verticalAlign: "-1px" }} />Start Date</span>
          <input type="date" style={styles.dateInput} value={startDate} onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))} />
        </div>
        <div style={styles.controlGroup}>
          <span style={styles.label}>End Date</span>
          <input type="date" style={styles.dateInput} value={endDate} onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))} />
        </div>
        <button style={styles.refreshBtn} onClick={load} disabled={loading}>
          <RefreshCw size={13} style={loading ? { animation: "spin 1s linear infinite" } : undefined} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <div style={styles.errorBanner}><AlertCircle size={15} />{error}</div>}

      {/* ── KPI Row ── */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}><DollarSign size={13} />Non-Fuel Expenses</div>
          <div style={styles.kpiValue}>{money(kpis?.cumulativeCompanySpend)}</div>
          <div style={styles.kpiSub}>Approved transactions</div>
        </div>
        <div style={{ ...styles.kpi, border: `1px solid #7c3a1a` }}>
          <div style={{ ...styles.kpiLabel, color: C.fuel }}><Flame size={13} color={C.fuel} />Fuel Spend</div>
          <div style={{ ...styles.kpiValue, color: C.fuel }}>{money(kpis?.totalFuelSpend)}</div>
          <div style={styles.kpiSub}>{num(fuel?.totalLitres)} L · avg {money(kpis?.avgFuelPricePerLitre)}/L</div>
        </div>
        <div style={{ ...styles.kpi, border: `1px solid #1e3a5f` }}>
          <div style={{ ...styles.kpiLabel, color: C.accent }}><DollarSign size={13} />Total Fleet Cost</div>
          <div style={{ ...styles.kpiValue, color: C.accent }}>{money(kpis?.totalCombinedSpend)}</div>
          <div style={styles.kpiSub}>Fuel + approved expenses</div>
        </div>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}><RouteIcon size={13} />Distance Logged</div>
          <div style={styles.kpiValue}>{num(kpis?.totalDistanceLogged)} km</div>
          <div style={styles.kpiSub}>{vehicleId ? "1 vehicle" : `${vehicles.length} vehicles`}</div>
        </div>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}><Gauge size={13} />Fleet Efficiency (CPK)</div>
          <div style={styles.kpiValue}>
            {kpis?.averageFleetEfficiency == null ? "N/A" : `${money(kpis.averageFleetEfficiency)}/km`}
          </div>
          <div style={styles.kpiSub}>Including fuel cost</div>
        </div>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}><Droplets size={13} />Fuel Consumption</div>
          <div style={styles.kpiValue}>
            {kpis?.avgLitresPer100km == null ? "N/A" : `${num(kpis.avgLitresPer100km)} L/100km`}
          </div>
          <div style={styles.kpiSub}>Fleet average</div>
        </div>
      </div>

      {/* ── Expense Breakdown + CPK Trend ── */}
      <div style={styles.panelGrid}>
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Expense Breakdown by Category</div>
          {!data?.expenseBreakdown?.length ? (
            <div style={styles.empty}>No expenses in this range.</div>
          ) : data.expenseBreakdown.map((row) => (
            <div key={row.category} style={styles.categoryRow}>
              <div style={styles.categoryTop}>
                <span style={{ ...styles.categoryName, color: CATEGORY_COLORS[row.category] ?? C.muted }}>
                  {row.category === "fuel" ? "⛽ Fuel" : row.category.replace("_", " ")}
                </span>
                <span style={styles.categoryAmount}>{money(row.total)}</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${(row.total / maxCategoryTotal) * 100}%`, background: CATEGORY_COLORS[row.category] ?? C.muted }} />
              </div>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Cost-Per-Kilometer Trend</div>
          <div style={{ display: "flex", gap: 16, marginBottom: 10, fontSize: 10, color: C.muted }}>
            <span><span style={{ color: C.accent }}>■</span> Total CPK (fuel + expenses)</span>
          </div>
          {!data?.cpkTrend?.length ? (
            <div style={styles.empty}>No CPK data in this range.</div>
          ) : (
            <div style={styles.trendRow}>
              {data.cpkTrend.map((point) => {
                const heightPct = point.costPerKilometer
                  ? Math.max(4, (point.costPerKilometer / maxTrendValue) * 100)
                  : 4;
                // Split the bar visually: fuel portion vs non-fuel
                const fuelPct = point.totalCost > 0
                  ? Math.round((point.fuelCost / point.totalCost) * 100)
                  : 0;
                return (
                  <div key={point.period} style={styles.trendBarWrap} title={`Fuel: ${money(point.fuelCost)} | Other: ${money(point.totalApprovedExpenses)}`}>
                    <span style={styles.trendValue}>
                      {point.costPerKilometer == null ? "N/A" : point.costPerKilometer.toFixed(1)}
                    </span>
                    {/* Stacked bar: orange (fuel) on top, blue (expenses) below */}
                    <div style={{ width: "100%", maxWidth: 28, height: `${heightPct}%`, borderRadius: "4px 4px 0 0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ flex: fuelPct, background: C.fuel, minHeight: fuelPct > 0 ? 2 : 0 }} />
                      <div style={{ flex: 100 - fuelPct, background: C.accent, minHeight: (100 - fuelPct) > 0 ? 2 : 0 }} />
                    </div>
                    <span style={styles.trendLabel}>
                      {new Date(point.period).toLocaleDateString("en-ET", { month: "short", day: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Fuel breakdown per vehicle ── */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}><Flame size={14} color={C.fuel} style={{ marginRight: 6, verticalAlign: "-2px" }} />Fuel Cost per Vehicle</div>
        {!fuel?.perVehicle?.length ? (
          <div style={styles.empty}>No fuel logs in this range.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={styles.th}>Vehicle</th>
                  <th style={styles.th}>Total Fuel Spend</th>
                  <th style={styles.th}>Litres Filled</th>
                  <th style={styles.th}>Distance (fuel km)</th>
                  <th style={styles.th}>Avg L/100 km</th>
                </tr>
              </thead>
              <tbody>
                {fuel.perVehicle.map((row) => (
                  <tr key={row.vehicleId}>
                    <td style={styles.td}>{row.plateNumber ?? plateFor(row.vehicleId)}</td>
                    <td style={{ ...styles.td, color: C.fuel, fontWeight: 600 }}>{money(row.totalSpend)}</td>
                    <td style={styles.td}>{num(row.totalLitres)} L</td>
                    <td style={styles.td}>{num(row.totalKm)} km</td>
                    <td style={styles.td}>{row.avgLitresPer100km == null ? "N/A" : `${num(row.avgLitresPer100km)} L/100km`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Vehicle Comparison ── */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}><Truck size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />Vehicle Comparison</div>
        {!sortedComparison.length ? (
          <div style={styles.empty}>No vehicle data in this range.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <SortHeader field="plateNumber">Vehicle</SortHeader>
                  <SortHeader field="totalDistanceCovered">Distance</SortHeader>
                  <SortHeader field="totalApprovedCost">Other Costs</SortHeader>
                  <SortHeader field="totalFuelCost">Fuel Cost</SortHeader>
                  <SortHeader field="totalCost">Total Cost</SortHeader>
                  <SortHeader field="costPerKilometer">CPK</SortHeader>
                </tr>
              </thead>
              <tbody>
                {sortedComparison.map((row) => (
                  <tr key={row.vehicleId}>
                    <td style={styles.td}>{row.plateNumber ?? plateFor(row.vehicleId)}</td>
                    <td style={styles.td}>{num(row.totalDistanceCovered)} km</td>
                    <td style={styles.td}>{money(row.totalApprovedCost)}</td>
                    <td style={{ ...styles.td, color: C.fuel }}>{money(row.totalFuelCost)}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{money(row.totalCost)}</td>
                    <td style={styles.td}>{row.costPerKilometer == null ? "N/A" : `${money(row.costPerKilometer)}/km`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
