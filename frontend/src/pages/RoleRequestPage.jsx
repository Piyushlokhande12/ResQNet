import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../api/axiosInstance";
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const RESPONDER_TYPES = [
  { id: "ambulance", label: "Ambulance Driver",    icon: "🚑", desc: "Emergency medical transport" },
  { id: "medical",   label: "Medical Professional", icon: "⚕️", desc: "Doctor, nurse, paramedic" },
  { id: "police",    label: "Police Officer",        icon: "👮", desc: "Law enforcement personnel" },
  { id: "fire",      label: "Fire Brigade",          icon: "🚒", desc: "Fire and rescue services" },
];

export default function RoleRequestPage() {
  const { user } = useSelector((s) => s.auth);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    responderType: "ambulance",
    badgeId: "",
    department: "",
    reason: "",
  });

  useEffect(() => { fetchMyRequests(); }, []);

  const fetchMyRequests = async () => {
    try {
      const { data } = await api.get("/role-requests/mine");
      setRequests(data.requests || []);
    } catch { setRequests([]); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.badgeId || !form.department || !form.reason) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/role-requests", form);
      toast.success("Request submitted! Admin will review it.");
      fetchMyRequests();
      setForm({ responderType: "ambulance", badgeId: "", department: "", reason: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
    setSubmitting(false);
  };

  const hasPending = requests.some((r) => r.status === "pending");

  return (
    <div style={{ padding: 28, maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Become a Responder</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Apply to join as an emergency responder. Your request will be reviewed by an admin.
      </p>

      {/* Current role badge */}
      <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: user?.role === "responder" ? "rgba(56,161,105,0.15)" : "rgba(49,130,206,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={22} color={user?.role === "responder" ? "var(--success)" : "var(--info)"} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Current Role</div>
          <div style={{
            fontWeight: 700, fontSize: 16, textTransform: "capitalize",
            color: user?.role === "responder" ? "var(--success)" : "var(--text)",
          }}>
            {user?.role}
          </div>
        </div>
        {user?.role === "responder" && (
          <div style={{
            marginLeft: "auto", background: "rgba(56,161,105,0.12)",
            color: "var(--success)", borderRadius: 8,
            padding: "8px 16px", fontSize: 13, fontWeight: 600,
          }}>
            ✅ You are already a Responder
          </div>
        )}
      </div>

      {/* My past requests */}
      {!loading && requests.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>My Requests</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {requests.map((r) => (
              <div key={r._id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", background: "var(--bg-surface)", borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>
                    {r.responderType} — {r.department}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Badge: {r.badgeId} · {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  {r.adminNote && (
                    <div style={{ fontSize: 12, color: "var(--warning)", marginTop: 4 }}>
                      Admin note: {r.adminNote}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {r.status === "pending" && <Clock size={14} color="var(--warning)" />}
                  {r.status === "approved" && <CheckCircle size={14} color="var(--success)" />}
                  {r.status === "rejected" && <XCircle size={14} color="var(--primary)" />}
                  <span style={{
                    fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                    color: r.status === "pending" ? "var(--warning)" : r.status === "approved" ? "var(--success)" : "var(--primary)",
                  }}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application form */}
      {user?.role !== "responder" && user?.role !== "admin" && (
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            {hasPending ? "Request Pending Review" : "Submit Application"}
          </h2>

          {hasPending ? (
            <div style={{
              padding: "20px", background: "rgba(214,158,46,0.08)",
              borderRadius: 8, border: "1px solid rgba(214,158,46,0.2)",
              textAlign: "center",
            }}>
              <Clock size={28} color="var(--warning)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Your application is under review. Admin will approve or reject it soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Type selector */}
              <div className="form-group">
                <label>Responder Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
                  {RESPONDER_TYPES.map(({ id, label, icon, desc }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setForm({ ...form, responderType: id })}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: `1px solid ${form.responderType === id ? "var(--primary)" : "var(--border)"}`,
                        background: form.responderType === id ? "rgba(229,62,62,0.08)" : "var(--bg-surface)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Badge ID / Employee ID</label>
                <input
                  placeholder="e.g. AMB-2025-001 or EMP-456"
                  value={form.badgeId}
                  onChange={(e) => setForm({ ...form, badgeId: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department / Organization</label>
                <input
                  placeholder="e.g. City Hospital Emergency, MP Police Indore"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Why do you want to become a responder?</label>
                <textarea
                  placeholder="Briefly explain your role and experience..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required
                  style={{ minHeight: 80 }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}