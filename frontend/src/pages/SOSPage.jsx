import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SOSButton from "../components/SOSButton";
import { useShakeDetection } from "../hooks/useShakeDetection";
import { triggerSOS } from "../store/incidentSlice";
import { useGeolocation } from "../hooks/useGeolocation";
import toast from "react-hot-toast";

const types = [
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "accident", label: "Accident", icon: "🚗" },
  { id: "fire", label: "Fire", icon: "🔥" },
  { id: "crime", label: "Crime", icon: "🚨" },
  { id: "women_safety", label: "Women Safety", icon: "👩" },
  { id: "natural_disaster", label: "Disaster", icon: "🌊" },
];

export default function SOSPage() {
  const locationState = useLocation().state;
  const dispatch = useDispatch();
  const { sosLoading } = useSelector((s) => s.incidents);
  const { location, getLocation } = useGeolocation();
  const [selectedType, setSelectedType] = useState(locationState?.type || "medical");
  const [description, setDescription] = useState("");
  const [shakeTriggered, setShakeTriggered] = useState(false);

  useEffect(() => { getLocation(); }, []);

  // Shake-to-SOS
  useShakeDetection(() => {
    if (!shakeTriggered && !sosLoading) {
      setShakeTriggered(true);
      toast("📳 Shake detected! Sending SOS...", { icon: "🚨", duration: 3000 });
      handleManualSOS("shake");
    }
  });

  const handleManualSOS = async (method = "button") => {
    if (!location) { toast.error("Could not get location."); return; }
    const result = await dispatch(triggerSOS({
      emergencyType: selectedType,
      coordinates: [location.lng, location.lat],
      description,
      triggerMethod: method,
    }));
    if (triggerSOS.fulfilled.match(result)) {
      toast.success("🚨 SOS Alert Sent! Help is coming.", { duration: 6000 });
    } else {
      toast.error(result.payload || "SOS failed");
      setShakeTriggered(false);
    }
  };

  return (
    <div style={{ padding: 28, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>🚨 Send SOS Alert</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Select emergency type, then hold the SOS button for 3 seconds or shake your phone.
      </p>

      {/* Type selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Emergency Type</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {types.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setSelectedType(id)}
              style={{
                background: selectedType === id ? "var(--primary)" : "var(--bg-surface)",
                border: `1px solid ${selectedType === id ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 10,
                padding: "12px 8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                color: "var(--text)",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 24 }}>{icon}</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Additional Details (optional)</label>
          <textarea
            placeholder="Describe the situation briefly..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Location status */}
      <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: location ? "var(--success)" : "var(--warning)",
          boxShadow: location ? "0 0 6px var(--success)" : "0 0 6px var(--warning)",
        }} />
        <span style={{ fontSize: 13 }}>
          {location
            ? `Location acquired: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
            : "Acquiring your location..."}
        </span>
      </div>

      {/* SOS Button */}
      <div className="card" style={{ textAlign: "center", padding: 36 }}>
        <SOSButton emergencyType={selectedType} />
        <div style={{ marginTop: 20, padding: "10px 16px", background: "rgba(229,62,62,0.08)", borderRadius: 8, fontSize: 12, color: "var(--text-muted)" }}>
        
        </div>
      </div>
    </div>
  );
}