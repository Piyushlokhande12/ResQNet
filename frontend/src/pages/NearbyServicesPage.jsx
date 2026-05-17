import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import EmergencyMap from "../components/EmergencyMap";
import { useGeolocation } from "../hooks/useGeolocation";
import { MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";

const SERVICE_TYPES = [
  { id: "hospital",     label: "Hospitals",       icon: "🏥" },
  { id: "police",       label: "Police Stations", icon: "🚔" },
  { id: "fire_station", label: "Fire Stations",   icon: "🚒" },
  { id: "pharmacy",     label: "Pharmacies",      icon: "💊" },
];

export default function NearbyServicesPage() {
  const { location, getLocation, loading: locLoading } = useGeolocation();
  const [services,    setServices]   = useState([]);
  const [activeType,  setActiveType] = useState("hospital");
  const [loading,     setLoading]    = useState(false);
  const [selected,    setSelected]   = useState(null);

  useEffect(() => { getLocation(); }, []);
  useEffect(() => { if (location) fetchServices(activeType); }, [location, activeType]);

 const fetchServices = async (type) => {
  if (!location) return;

  setLoading(true);

  try {
    console.log("Sending request:", {
      lat: location.lat,
      lng: location.lng,
      type
    });

    const { data } = await api.get("/incidents/nearby", {
      params: {
        lat: location.lat,
        lng: location.lng,
        type
      }
    });

    console.log("SUCCESS RESPONSE:", data);

    setServices(data.services || []);
    setSelected(null);

  } catch (error) {
    console.log("FULL ERROR:", error);
    console.log("ERROR RESPONSE:", error.response);
    console.log("ERROR DATA:", error.response?.data);

    toast.error(
      error.response?.data?.message ||
      "Could not fetch nearby services"
    );

    setServices([]);
  }

  setLoading(false);
};
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Nearby Emergency Services</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
        Find hospitals, police stations and more near your current location.
      </p>

      {/* Type selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {SERVICE_TYPES.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveType(id)}
            style={{
              padding: "8px 16px", borderRadius: 999,
              border: `1px solid ${activeType === id ? "var(--primary)" : "var(--border)"}`,
              background: activeType === id ? "var(--primary)" : "var(--bg-surface)",
              color: activeType === id ? "white" : "var(--text)",
              cursor: "pointer", fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* ── Map ── */}
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
          {locLoading ? (
            <div style={{ height: 440, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card)" }}>
              <p style={{ color: "var(--text-muted)" }}>Getting your location...</p>
            </div>
          ) : (
            <EmergencyMap
              victimLocation={location}
              nearbyServices={selected ? [selected] : services}
              height={440}
            />
          )}
        </div>

        {/* ── List ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 440, overflowY: "auto" }}>
          {loading && (
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <p style={{ color: "var(--text-muted)" }}>Searching nearby...</p>
            </div>
          )}

          {!loading && services.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <p style={{ color: "var(--text-muted)" }}>
                No {activeType.replace("_", " ")}s found nearby.
              </p>
            </div>
          )}

          {services.map((s, i) => (
            <div
              key={i}
              className="card"
              onClick={() => setSelected(selected?.name === s.name ? null : s)}
              style={{
                cursor: "pointer",
                borderColor: selected?.name === s.name ? "var(--primary)" : "var(--border)",
                borderLeft: selected?.name === s.name ? "3px solid var(--primary)" : "1px solid var(--border)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                {s.isOpen !== undefined && (
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 600,
                    background: s.isOpen ? "rgba(56,161,105,0.15)" : "rgba(229,62,62,0.12)",
                    color: s.isOpen ? "var(--success)" : "var(--primary)",
                  }}>
                    {s.isOpen ? "Open" : "Closed"}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: 6, fontSize: 12, color: "var(--text-muted)", alignItems: "center" }}>
                <MapPin size={11} /> {s.address}
              </div>

              {s.rating && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>⭐ {s.rating}</div>
              )}

              <a
                href={`https://maps.google.com/?q=${s.location.lat},${s.location.lng}`}
                target="_blank" rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  marginTop: 8, fontSize: 12, color: "var(--primary)", textDecoration: "none",
                }}
              >
                <MapPin size={11} /> Open in Google Maps
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Location status bar */}
      <div style={{
        marginTop: 16, padding: "8px 14px",
        background: "var(--bg-card)", borderRadius: 8,
        display: "flex", alignItems: "center", gap: 8, fontSize: 12,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: location ? "var(--success)" : "var(--warning)",
          boxShadow: `0 0 6px ${location ? "var(--success)" : "var(--warning)"}`,
        }} />
        <span style={{ color: "var(--text-muted)" }}>
          {location
            ? `Your location: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
            : "Acquiring your location..."}
        </span>
      </div>
    </div>
  );
}