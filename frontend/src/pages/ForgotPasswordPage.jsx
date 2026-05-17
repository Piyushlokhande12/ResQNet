import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setUserId(data.userId);
      setStep(2);
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Email not found");
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { userId, otp, newPassword });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 20,
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{step === 1 ? "Forgot Password" : "Reset Password"}</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
            {step === 1 ? "Enter your email to receive an OTP" : "Enter the OTP and your new password"}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 12 }}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>OTP</label>
              <input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} style={{ letterSpacing: 6, textAlign: "center", fontSize: 20 }} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 12 }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          <Link to="/login" style={{ color: "var(--primary)" }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}