import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      toast.success("Account created! Check your email for OTP.");
      navigate("/verify-otp", { state: { userId: data.userId, email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 20,
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "var(--primary)", display: "inline-flex",
            alignItems: "center", justifyContent: "center", marginBottom: 10,
          }}>
            <Shield size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Create Account</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Join ResQNet today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="Piyush Sharma" value={form.name} onChange={set("name")} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="At least 6 characters" value={form.password} onChange={set("password")} required minLength={6} />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: 12 }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}