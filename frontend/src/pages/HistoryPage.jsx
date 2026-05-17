import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyIncidents } from "../store/incidentSlice";
import { MapPin, Clock } from "lucide-react";

const typeIcons = {
  medical: "🏥", accident: "🚗", fire: "🔥",
  crime: "🚨", women_safety: "👩", natural_disaster: "🌊", other: "⚠️",
};

export default function HistoryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector((s) => s.incidents);

  useEffect(() => { dispatch(fetchMyIncidents()); }, []);

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Incident History</h1>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading...</p>}
      {!loading && list.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ color: "var(--text-muted)" }}>No incidents yet. Stay safe!</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((incident) => (
          <div
            key={incident._id}
            className="card"
            style={{ cursor: "pointer", transition: "border-color 0.2s" }}
            onClick={() => navigate(`/incidents/${incident._id}`)}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{typeIcons[incident.emergencyType] || "⚠️"}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, textTransform: "capitalize" }}>
                    {incident.emergencyType.replace("_", " ")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    #{incident._id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>
              <span className={`badge badge-${incident.status}`}>
                {incident.status.replace("_", " ")}
              </span>
            </div>

            <div style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} />
                {incident.location?.address || "Location not available"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={12} />
                {new Date(incident.createdAt).toLocaleString()}
              </span>
            </div>

            {incident.responder && (
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--success)" }}>
                ✓ Responder: {incident.responder.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}