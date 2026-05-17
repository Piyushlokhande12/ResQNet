import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { triggerSOS } from "../store/incidentSlice";
import { useGeolocation } from "../hooks/useGeolocation";
import toast from "react-hot-toast";

const HOLD_DURATION = 3000; // 3 seconds hold to trigger

export default function SOSButton({ emergencyType = "medical" }) {
  const dispatch = useDispatch();
  const { sosLoading } = useSelector((s) => s.incidents);
  const { location, getLocation } = useGeolocation();

  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const startPress = () => {
    if (sosLoading) return;
    setPressing(true);
    setProgress(0);

    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= HOLD_DURATION) {
        clearInterval(id);
        handleSOS();
      }
    }, 50);
    setIntervalId(id);
  };

  const cancelPress = () => {
    setPressing(false);
    setProgress(0);
    if (intervalId) clearInterval(intervalId);
  };

  const handleSOS = async () => {
    if (!location) {
      toast.error("Could not get your location. Please enable GPS.");
      cancelPress();
      return;
    }

    const result = await dispatch(
      triggerSOS({
        emergencyType,
        coordinates: [location.lng, location.lat],
        triggerMethod: "button",
      })
    );

    if (triggerSOS.fulfilled.match(result)) {
      toast.success("🚨 SOS Alert Sent! Help is on the way.", { duration: 5000 });
    } else {
      toast.error(result.payload || "SOS failed");
    }
    setPressing(false);
    setProgress(0);
  };

  const circumference = 2 * Math.PI * 60;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 160, height: 160 }}>
        {/* Progress ring */}
        <svg style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }} width="160" height="160">
          <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(229,62,62,0.15)" strokeWidth="6" />
          <circle
            cx="80" cy="80" r="60"
            fill="none"
            stroke="#e53e3e"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>

        {/* Button */}
        <button
          onMouseDown={startPress}
          onMouseUp={cancelPress}
          onMouseLeave={cancelPress}
          onTouchStart={startPress}
          onTouchEnd={cancelPress}
          disabled={sosLoading}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 120, height: 120,
            borderRadius: "50%",
            border: "none",
            cursor: sosLoading ? "not-allowed" : "pointer",
            background: pressing
              ? "linear-gradient(135deg, #c53030, #e53e3e)"
              : "linear-gradient(135deg, #e53e3e, #fc8181)",
            color: "white",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: 2,
            boxShadow: pressing
              ? "0 0 40px rgba(229,62,62,0.8), 0 0 80px rgba(229,62,62,0.4)"
              : "0 0 20px rgba(229,62,62,0.4)",
            transition: "all 0.2s",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {sosLoading ? "..." : "SOS"}
        </button>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
        {pressing ? `Hold for ${Math.ceil(((100 - progress) / 100) * 3)}s...` : "Hold for 3 seconds to trigger"}
      </p>
    </div>
  );
}