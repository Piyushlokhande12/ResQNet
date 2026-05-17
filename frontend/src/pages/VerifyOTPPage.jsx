import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

export default function VerifyOTPPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { userId: state?.userId, otp });
      toast.success("Email verified! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 20,
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Verify Your Email</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
          We sent a 6-digit OTP to <strong>{state?.email}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{ textAlign: "center", fontSize: 24, letterSpacing: 8 }}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.length < 6}
            style={{ width: "100%", justifyContent: "center", padding: 12 }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}