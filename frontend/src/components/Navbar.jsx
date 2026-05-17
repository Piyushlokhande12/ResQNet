import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import {
  Shield,
  Home,
  Clock,
  User,
  LogOut,
  AlertTriangle,
  BarChart2,
  Radio,
  MapPin,
  Hospital,
  Droplets,
  
} from "lucide-react";

const navLinks = [
  {
    to: "/dashboard",
    label: "Home",
    icon: Home,
    roles: ["user", "admin", "responder"],
  },
  {
    to: "/sos",
    label: "SOS",
    icon: AlertTriangle,
    roles: ["user"],
  },
  {
    to: "/nearby",
    label: "Nearby",
    icon: MapPin,
    roles: ["user", "admin", "responder"],
  },
  {
    to: "/donors",
    label: "Donors",
    icon: Droplets,
    roles: ["user", "admin", "responder"],
  },
  {
    to: "/history",
    label: "History",
    icon: Clock,
    roles: ["user", "admin", "responder"],
  },
 
  {
    to: "/responder",
    label: "Dispatch",
    icon: Radio,
    roles: ["admin", "responder"],
  },
  {
    to: "/admin",
    label: "Admin",
    icon: BarChart2,
    roles: ["admin"],
  },
  {
    to: "/profile",
    label: "Profile",
    icon: User,
    roles: ["user", "admin", "responder"],
  },
  { to: "/become-responder", label: "Apply Responder", icon: Shield, roles: ["user"] },
];

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const filtered = navLinks.filter((link) =>
    link.roles.includes(user?.role)
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              padding: "0 20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
             ResQNet
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "0 10px",
          }}
        >
          {filtered.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? "white" : "var(--text-muted)",
                background: isActive
                  ? "var(--primary)"
                  : "transparent",
                transition: "all 0.2s",
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {user?.name}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 12,
              textTransform: "capitalize",
            }}
          >
            {user?.role}
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{
              width: "100%",
              justifyContent: "center",
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}