import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import api from "../api/axiosInstance";
import { useGeolocation } from "../hooks/useGeolocation";
import { MapPin, Clock, CheckCircle, Radio } from "lucide-react";
import toast from "react-hot-toast";

const typeIcons = {
  medical: "🏥", accident: "🚗", fire: "🔥",
  crime: "🚨", women_safety: "👩", natural_disaster: "🌊", other: "⚠️",
};

export default function ResponderDashboard() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { location, watchLocation, clearWatch } = useGeolocation();

  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [onDuty, setOnDuty] = useState(false);

  useEffect(() => {
    loadIncidents();
    loadStats();
  }, [filter]);

  // Watch location and send updates when on duty
  useEffect(() => {
    let watchId = null;
    if (onDuty) {
      watchId = watchLocation(async (loc) => {
        try {
          await api.put("/responders/location", { coordinates: [loc.lng, loc.lat] });
        } catch {}
      });
      toast.success("On duty — location sharing active");
    }
    return () => { if (watchId) clearWatch(watchId); };
  }, [onDuty]);

  // Live new SOS events
  useEffect(() => {
    if (!socket) return;
    socket.on("new_sos", (data) => {
      toast.error("🚨 NEW SOS: " + data.emergencyType + " — " + data.userName, { duration: 8000 });
      loadIncidents();
    });
    return () => socket.off("new_sos");
  }, [socket]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/incidents", { params: { status: filter, limit: 30 } });
      setIncidents(data.incidents || []);
    } catch {
      toast.error("Failed to load incidents");
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get("/responders/stats");
      setStats(data.stats);
    } catch {}
  };

  const acceptIncident = async (incidentId) => {
    try {
      await api.post("/responders/accept/" + incidentId);
      toast.success("Incident accepted! Navigate to victim.");
      navigate("/incidents/" + incidentId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not accept incident");
    }
  };

  const statusFilters = ["pending", "accepted", "on_the_way", "resolved"];

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Responder Dashboard</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Monitor and respond to active emergencies</p>
        </div>

        {/* On-duty toggle */}
        <button
          onClick={() => setOnDuty((v) => !v)}
          className="btn"
          style={{
            background: onDuty ? "var(--success)" : "var(--bg-surface)",
            color: onDuty ? "white" : "var(--text-muted)",
            border: "1px solid " + (onDuty ? "var(--success)" : "var(--border)"),
          }}
        >
          <Radio size={15} />
          {onDuty ? "On Duty" : "Go On Duty"}
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Active Incidents", value: stats.active, icon: AlertIcon, color: "var(--primary)" },
            { label: "Resolved Today", value: stats.resolved, icon: CheckCircle, color: "var(--success)" },
            { label: "Location", value: location ? "Sharing" : "Off", icon: MapPin, color: "var(--info)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "var(--bg-card)", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 500, textTransform: "capitalize",
              background: filter === f ? "var(--primary)" : "transparent",
              color: filter === f ? "white" : "var(--text-muted)",
              transition: "all 0.2s",
            }}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Incident list */}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <p style={{ color: "var(--text-muted)" }}>No {filter} incidents</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {incidents.map((inc) => (
            <div
              key={inc._id}
              className="card"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderLeft: "3px solid " + (inc.status === "pending" ? "var(--primary)" : inc.status === "resolved" ? "var(--success)" : "var(--info)"),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                <span style={{ fontSize: 32 }}>{typeIcons[inc.emergencyType] || "⚠️"}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, textTransform: "capitalize" }}>
                    {inc.emergencyType.replace("_", " ")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {inc.user?.name} · {inc.user?.phone}
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} />
                      {inc.location?.address?.slice(0, 50) || "Location N/A"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} />
                      {new Date(inc.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={"badge badge-" + inc.status}>{inc.status.replace("_", " ")}</span>
                {inc.status === "pending" && (
                  <button className="btn btn-primary" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => acceptIncident(inc._id)}>
                    Accept
                  </button>
                )}
                <button className="btn btn-outline" style={{ fontSize: 12, padding: "8px 12px" }} onClick={() => navigate("/incidents/" + inc._id)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline icon component for alert
function AlertIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}