// Add import at top of SOSPage.jsx
import { useVoiceSOS } from "../hooks/useVoiceSOS";

// Inside component, after useShakeDetection:
const { listening, supported, start: startVoice, stop: stopVoice } = useVoiceSOS(
  (method) => {
    toast("🎤 Voice detected! Sending SOS...", { icon: "🚨" });
    handleManualSOS("voice");
  }
);

// Add this UI block below the shake detection notice:
{supported && (
  <div className="card" style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>🎤 Voice SOS</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Say "Help me" or "Emergency" to trigger SOS
      </div>
    </div>
    <button
      onClick={listening ? stopVoice : startVoice}
      className="btn"
      style={{
        background: listening ? "rgba(229,62,62,0.15)" : "var(--bg-surface)",
        color: listening ? "var(--primary)" : "var(--text-muted)",
        border: `1px solid ${listening ? "var(--primary)" : "var(--border)"}`,
        fontSize: 12,
      }}
    >
      {listening ? "🔴 Listening..." : "Start Listening"}
    </button>
  </div>
)}