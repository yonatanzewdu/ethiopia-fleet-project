/**
 * DriverReceiptPortal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Mobile-first receipt submission UI for drivers.
 *
 * USAGE in App.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Import this component:
 *      import DriverReceiptPortal from './DriverReceiptPortal';
 *
 * 2. Replace (or augment) the DriverDashboardView render with:
 *      {view === "driver" && <DriverReceiptPortal user={currentUser} />}
 *
 *    Or add a tab inside the existing DriverDashboardView.
 *
 * The component is fully self-contained — it manages its own API calls and
 * state.  Pass the `user` prop (shape: { id, username, driverId, companyId })
 * from the auth session exactly as your existing App.jsx already does.
 * The driver's vehicle is resolved automatically from which vehicle has
 * assignedDriver.id === user.driverId -- it is NOT a field on user itself.
 */

import { useState, useRef, useEffect } from "react";
import {
  Upload, Camera, CheckCircle2, AlertTriangle,
  RefreshCw, Receipt, Truck, DollarSign, FileText,
  ChevronDown, X, Clock,
} from "lucide-react";

// ── DESIGN TOKENS (mirrors App.jsx) ──────────────────────────────────────────
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
  { value: "MAINTENANCE",  label: "🔧 Maintenance" },
  { value: "INSURANCE",    label: "🛡️ Insurance"   },
  { value: "TIRES",        label: "🔄 Tires"       },
  { value: "REGISTRATION", label: "📋 Registration" },
  { value: "ROAD_TOLL",    label: "🛣️ Road Toll"   },
  { value: "OTHER",        label: "📦 Other"       },
];

const STATUS_META = {
  PENDING:  { color: C.warning,  bg: "#451a03", border: "#78350f", label: "Pending Review" },
  APPROVED: { color: C.success,  bg: "#052e16", border: "#166534", label: "Approved"       },
  REJECTED: { color: C.critical, bg: "#450a0a", border: "#7f1d1d", label: "Rejected"       },
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "0 0 80px 0",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: (extra = {}) => ({
    background: C.elevated,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "18px 16px",
    ...extra,
  }),
  label: {
    display: "block",
    marginBottom: 6,
    color: C.muted,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: C.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: C.text,
    fontSize: 14,
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none",
  },
  btn: (variant = "primary") => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "12px 20px",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    transition: "opacity 0.15s",
    ...(variant === "primary"
      ? { background: C.accent, color: "#fff" }
      : variant === "ghost"
      ? { background: "transparent", color: C.muted, border: `1px solid ${C.border}` }
      : { background: C.surface, color: C.text, border: `1px solid ${C.border}` }),
  }),
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: C.text,
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function ReceiptImageUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result; // full data URL
      setPreview(b64);
      onChange(b64);
    };
    reader.readAsDataURL(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label style={S.label}>Receipt Photo (optional)</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {preview ? (
        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
          <img src={preview} alt="Receipt preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
          <button
            onClick={clear}
            style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(0,0,0,0.7)", border: "none",
              borderRadius: "50%", width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            ...S.btn("secondary"),
            width: "100%",
            padding: "18px",
            flexDirection: "column",
            gap: 8,
            borderStyle: "dashed",
            color: C.muted,
          }}
        >
          <Camera size={22} color={C.muted} />
          <span style={{ fontSize: 13 }}>Tap to capture or attach receipt</span>
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
    }}>
      <Clock size={10} /> {meta.label}
    </span>
  );
}

function SubmittedReceiptRow({ tx }) {
  const cat = CATEGORIES.find((c) => c.value === tx.category);
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "10px 0", borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
          {cat?.label || tx.category}
        </div>
        {tx.description && (
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{tx.description}</div>
        )}
        <div style={{ fontSize: 10, color: C.muted }}>{tx.date}</div>
      </div>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.warning }}>
          ETB {Number(tx.amount).toLocaleString()}
        </div>
        <StatusBadge status={tx.approvalStatus} />
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function DriverReceiptPortal({ user }) {
  const companyId = user?.companyId;
  const driverId  = user?.driverId;

  const blank = {
    vehicleId:   "",
    category:    "",
    amount:      "",
    description: "",
    date:        new Date().toISOString().slice(0, 10),
    receiptUrl:  null,
  };

  const [form,         setForm]         = useState(blank);
  const [vehicles,     setVehicles]     = useState([]);
  const [history,      setHistory]      = useState([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [loadingHist,  setLoadingHist]  = useState(false);
  const [toast,        setToast]        = useState(null);
  const [activeTab,    setActiveTab]    = useState("submit"); // "submit" | "history"

  // Show a short toast notification
  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load all company vehicles, then resolve which ONE is currently assigned
  // to this driver. Drivers can only submit receipts for that vehicle --
  // this is not a free-pick dropdown.
  useEffect(() => {
    if (!companyId) return;
    fetch(`${API}/vehicles?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => setVehicles(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [companyId]);

  const assignedVehicle = vehicles.find((v) => v.assignedDriver?.id === driverId) || null;

  // Lock the form's vehicleId to the resolved assigned vehicle whenever it changes
  useEffect(() => {
    setForm((f) => ({ ...f, vehicleId: assignedVehicle ? String(assignedVehicle.id) : "" }));
  }, [assignedVehicle?.id]);

  // Load this driver's submission history
  const loadHistory = () => {
    if (!companyId) return;
    setLoadingHist(true);
    fetch(`${API}/financials/transactions?companyId=${companyId}`)
      .then((r) => r.json())
      .then((d) => {
        const myReceipts = (Array.isArray(d) ? d : [])
          .filter((tx) => tx.driverId === driverId);
        setHistory(myReceipts);
      })
      .catch(() => notify("Could not load submission history.", "error"))
      .finally(() => setLoadingHist(false));
  };

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!assignedVehicle) {
      notify("You're not currently assigned to a vehicle. Ask your manager to assign one before submitting receipts.", "error");
      return;
    }
    if (!form.category)  { notify("Please select an expense category.", "error"); return; }
    if (!form.amount || Number(form.amount) <= 0) { notify("Enter a valid amount.", "error"); return; }

    setSubmitting(true);
    try {
      const body = {
        vehicleId:   assignedVehicle.id,
        category:    form.category,
        amount:      Number(form.amount),
        description: form.description || undefined,
        date:        form.date,
        receiptUrl:  form.receiptUrl  || undefined,
        companyId,
        driverId,
      };

      const res = await fetch(`${API}/financials/receipts`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Server rejected the submission.");

      notify("Receipt submitted — pending manager review.");
      setForm(blank);
    } catch (err) {
      notify(err.message || "Submission failed. Check connectivity.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={S.page}>

      {/* ── Profile banner ── */}
      <div style={{ ...S.card(), display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "#1d4ed8", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          {user?.username?.[0]?.toUpperCase() || "D"}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.username}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            Vehicle: <span style={{ color: assignedVehicle ? C.text : C.warning, fontWeight: 600 }}>
              {assignedVehicle ? assignedVehicle.plateNumber : "Not assigned"}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
            background: "#052e16", color: C.success, border: `1px solid #166534`,
          }}>DRIVER</span>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        background: C.surface, borderRadius: 10, padding: 4,
        border: `1px solid ${C.border}`,
      }}>
        {[
          { id: "submit",  label: "Submit Receipt", icon: Upload  },
          { id: "history", label: "My Submissions", icon: Receipt },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 0", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: activeTab === id ? C.elevated : "transparent",
              color:      activeTab === id ? C.text     : C.muted,
              transition: "all 0.15s",
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── SUBMIT TAB ── */}
      {activeTab === "submit" && (
        <div style={S.card()}>
          <div style={S.sectionTitle}><Receipt size={16} color={C.accent} />New Expense Receipt</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Vehicle -- locked to whichever vehicle is assigned to this driver */}
            <div>
              <label style={S.label}>Vehicle *</label>
              {assignedVehicle ? (
                <div style={{
                  ...S.select,
                  display: "flex", alignItems: "center", gap: 8,
                  color: C.text, cursor: "default",
                }}>
                  <Truck size={14} color={C.muted} />
                  {assignedVehicle.plateNumber} · {assignedVehicle.model}
                </div>
              ) : (
                <div style={{
                  ...S.select,
                  display: "flex", alignItems: "center", gap: 8,
                  color: C.warning, cursor: "default",
                }}>
                  <AlertTriangle size={14} />
                  You are not assigned to a vehicle. Contact your manager.
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label style={S.label}>Category *</label>
              <div style={{ position: "relative" }}>
                <select
                  style={S.select}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">— Select category —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label style={S.label}>Amount (ETB) *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13 }}>ETB</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={{ ...S.input, paddingLeft: 46 }}
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label style={S.label}>Expense Date *</label>
              <input
                type="date"
                style={S.input}
                value={form.date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label style={S.label}>Description (optional)</label>
              <textarea
                style={{ ...S.input, minHeight: 72, resize: "vertical" }}
                placeholder="Brief description of the expense…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            {/* Receipt image */}
            <ReceiptImageUploader
              value={form.receiptUrl}
              onChange={(v) => set("receiptUrl", v)}
            />

            {/* Note banner */}
            <div style={{
              background: "#1e3a5f", border: `1px solid #2563eb`,
              borderRadius: 8, padding: "10px 12px",
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <AlertTriangle size={14} color={C.info} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 11, color: "#93c5fd", lineHeight: 1.5 }}>
                Your receipt will be reviewed by your fleet manager before it
                affects cost calculations. You will see its status in "My Submissions."
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ ...S.btn("primary"), width: "100%", padding: "14px", fontSize: 15 }}
            >
              {submitting
                ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</>
                : <><Upload size={15} /> Submit Receipt</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div style={S.card()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={S.sectionTitle}><FileText size={16} color={C.accent} />My Submissions</div>
            <button
              onClick={loadHistory}
              style={{ ...S.btn("ghost"), padding: "6px 10px", fontSize: 11 }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {loadingHist ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "32px 0", color: C.muted, gap: 8 }}>
              <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading…
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>
              <Receipt size={32} color={C.border} style={{ display: "block", margin: "0 auto 10px" }} />
              No receipts submitted yet.
            </div>
          ) : (
            <>
              {/* Summary counts */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                {["PENDING", "APPROVED", "REJECTED"].map((s) => {
                  const count = history.filter((tx) => tx.approvalStatus === s).length;
                  const meta  = STATUS_META[s];
                  return (
                    <div key={s} style={{ background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: meta.color }}>{count}</div>
                      <div style={{ fontSize: 10, color: meta.color, marginTop: 2, opacity: 0.8 }}>{s}</div>
                    </div>
                  );
                })}
              </div>

              {/* Receipt rows */}
              {history.map((tx) => <SubmittedReceiptRow key={tx.id} tx={tx} />)}
            </>
          )}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, background: toast.type === "error" ? "#450a0a" : "#052e16",
          border: `1px solid ${toast.type === "error" ? C.critical : C.success}`,
          color: toast.type === "error" ? C.critical : C.success,
          borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
        }}>
          {toast.type === "error"
            ? <AlertTriangle size={14} />
            : <CheckCircle2 size={14} />
          }
          {toast.msg}
        </div>
      )}

      {/* ── Keyframe for spinner ── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
