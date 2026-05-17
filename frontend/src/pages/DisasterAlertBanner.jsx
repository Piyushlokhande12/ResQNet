import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import api from "../api/axiosInstance";
import { X, AlertTriangle } from "lucide-react";

const severityColors = {
  low:      { bg: "rgba(49,130,206,0.12)",  text: "var(--info)",    border: "rgba(49,130,206,0.3)" },
  medium:   { bg: "rgba(214,158,46,0.12)", text: "var(--warning)", border: "rgba(214,158,46,0.3)" },
  high:     { bg: "rgba(229,62,62,0.12)",  text: "var(--primary)", border: "rgba(229,62,62,0.3)" },
  critical: { bg: "rgba(229,62,62,0.2)",   text: "var(--primary)", border: "var(--primary)" },
};

const typeIcons = {
  flood: "🌊", earthquake: "🏔️", fire: "🔥", storm: "⛈️", other: "⚠️",
};

export default function DisasterAlertBanner() {
  const socket = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    // Load active alerts on mount
    api.get("/disasters")
      .then(({ data }) => setAlerts(data.alerts || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("disaster_alert", (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });
    return () => socket.off("disaster_alert");
  }, [socket]);

  const visible = alerts.filter((a) => !dismissed.has(a._id || a.id));

  if (visible.length === 0) return null;

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      {visible.slice(0, 2).map((alert) => {
        const colors = severityColors[alert.severity] || severityColors.medium;
        return (
          <div
            key={alert._id || alert.id}
            style={{
              background: colors.bg,
              borderBottom: `2px solid ${colors.border}`,
              padding: "10px 28px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 18 }}>{typeIcons[alert.type] || "⚠️"}</span>
            <AlertTriangle size={14} color={colors.text} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: colors.text }}>{alert.title}</strong>
              {" — "}
              <span style={{ color: "var(--text)" }}>{alert.message}</span>
              {alert.affectedArea && (
                <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>
                  📍 {alert.affectedArea}
                </span>
              )}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              color: colors.text, letterSpacing: 1,
            }}>
              {alert.severity}
            </span>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, alert._id || alert.id]))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}