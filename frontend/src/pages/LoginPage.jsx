import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/authSlice";
import { Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 20,
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "var(--primary)", display: "inline-flex",
            alignItems: "center", justifyContent: "center", marginBottom: 12,
          }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>ResQNet</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Emergency Response Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          <Link to="/forgot-password" style={{ color: "var(--primary)" }}>Forgot password?</Link>
          <span style={{ margin: "0 8px" }}>·</span>
          <Link to="/register" style={{ color: "var(--primary)" }}>Create account</Link>
        </div>
      </div>
    </div>
  );
}