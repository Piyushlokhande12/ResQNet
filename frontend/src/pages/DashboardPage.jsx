import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyIncidents } from "../store/incidentSlice";
import SOSButton from "../components/SOSButton";
import { AlertTriangle, Clock, CheckCircle, Phone } from "lucide-react";

const emergencyTypes = [
  { id: "medical", label: "Medical", icon: "🏥", color: "#3182ce" },
  { id: "accident", label: "Accident", icon: "🚗", color: "#d69e2e" },
  { id: "fire", label: "Fire", icon: "🔥", color: "#e53e3e" },
  { id: "crime", label: "Crime", icon: "🚨", color: "#805ad5" },
  { id: "women_safety", label: "Women Safety", icon: "👩", color: "#d53f8c" },
  { id: "natural_disaster", label: "Disaster", icon: "🌊", color: "#2b6cb0" },
];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { list } = useSelector((s) => s.incidents);

  useEffect(() => {
    dispatch(fetchMyIncidents());
  }, []);

  const pending = list.filter((i) => i.status === "pending").length;
  const resolved = list.filter((i) => i.status === "resolved").length;

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Hello, {user?.name?.split(" ")[0]} 👋</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>Stay safe. Help is always one tap away.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Active Alerts", value: pending, icon: AlertTriangle, color: "var(--primary)" },
          { label: "Resolved", value: resolved, icon: CheckCircle, color: "var(--success)" },
          { label: "Total Alerts", value: list.length, icon: Clock, color: "var(--info)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* SOS Panel */}
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "var(--primary)" }}>
            🚨 Emergency SOS
          </h2>
          <SOSButton emergencyType="medical" />
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
            For quick emergency type selection, go to{" "}
            <span
              onClick={() => navigate("/sos")}
              style={{ color: "var(--primary)", cursor: "pointer" }}
            >
              SOS Page
            </span>
          </p>
        </div>

        {/* Emergency Types */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Emergency Types</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {emergencyTypes.map(({ id, label, icon, color }) => (
              <button
                key={id}
                onClick={() => navigate("/sos", { state: { type: id } })}
                style={{
                  background: "var(--bg-surface)",
                  border: `1px solid var(--border)`,
                  borderRadius: 10,
                  padding: "12px 8px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--text)",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency contacts quick view */}
      {user?.emergencyContacts?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Emergency Contacts</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {user.emergencyContacts.map((c, i) => (
              <div key={i} style={{
                background: "var(--bg-surface)", borderRadius: 10, padding: "10px 16px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--primary)22", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Phone size={16} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}