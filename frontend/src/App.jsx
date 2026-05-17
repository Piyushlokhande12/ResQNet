// import { Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { AuthProvider } from "./context/AuthContext";
// import { SocketProvider } from "./context/SocketContext";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import VerifyOTPPage from "./pages/VerifyOTPPage";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// import DashboardPage from "./pages/DashboardPage";
// import SOSPage from "./pages/SOSPage";
// import IncidentDetailPage from "./pages/IncidentDetailPage";
// import HistoryPage from "./pages/HistoryPage";
// import ProfilePage from "./pages/ProfilePage";
// import AdminDashboard from "./pages/AdminDashboard";
// import ResponderDashboard from "./pages/ResponderDashboard";
// import Navbar from "./components/Navbar";
// import LandingPage from "./pages/LandingPage";
// import NearbyServicesPage  from "./pages/NearbyServicesPage";
// import BloodDonorPage      from "./pages/BloodDonorPage";
// import QRCardPage          from "./pages/QRCardPage";
// 
// // Protected route wrapper
// const ProtectedRoute = ({ children, roles }) => {
//   const { user, token } = useSelector((s) => s.auth);
//   if (!token) return <Navigate to="/login" />;
//   if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" />;
//   return children;
// };

// export default function App() {
//   return (
//     <AuthProvider>
//       <SocketProvider>
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/verify-otp" element={<VerifyOTPPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />

//           {/* Protected */}
//            <Route path="/" element={<ProtectedRoute><><DisasterAlertBanner /><Navbar /></></ProtectedRoute>}>
//           {/* <Route path="/" element={<ProtectedRoute><Navbar /></ProtectedRoute>}> */}
//             {/* <Route index element={<Navigate to="/dashboard" />} /> */}
//             <Route path="dashboard" element={<DashboardPage />} />
//             <Route path="sos" element={<SOSPage />} />
//             <Route path="incidents/:id" element={<IncidentDetailPage />} />
//             <Route path="history" element={<HistoryPage />} />
//             <Route path="profile" element={<ProfilePage />} />
//              <Route path="nearby" element={<NearbyServicesPage />} />
//                <Route path="donors"        element={<BloodDonorPage />} />
//             <Route path="qr-card"       element={<QRCardPage />} />
//             {/* Admin only */}
//             <Route path="admin" element={
//               <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
//             } />

//             {/* Responder only */}
//             <Route path="responder" element={
//               <ProtectedRoute roles={["responder", "admin"]}><ResponderDashboard /></ProtectedRoute>
//             } />
//           </Route>

//           <Route path="*" element={<Navigate to="/dashboard" />} />
//         </Routes>
//       </SocketProvider>
//     </AuthProvider>
//   );
// }




import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

// Public Pages
import LandingPage        from "./pages/LandingPage";
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import VerifyOTPPage      from "./pages/VerifyOTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Protected Pages
import DashboardPage      from "./pages/DashboardPage";
import SOSPage            from "./pages/SOSPage";
import IncidentDetailPage from "./pages/IncidentDetailPage";
import HistoryPage        from "./pages/HistoryPage";
import ProfilePage        from "./pages/ProfilePage";
import AdminDashboard     from "./pages/AdminDashboard";
import ResponderDashboard from "./pages/ResponderDashboard";
import NearbyServicesPage from "./pages/NearbyServicesPage";
import BloodDonorPage     from "./pages/BloodDonorPage";
import RoleRequestPage    from "./pages/RoleRequestPage";

// Components
import Navbar              from "./components/Navbar";
import DisasterAlertBanner from "./pages/DisasterAlertBanner";


// ── Protected Route Wrapper ──────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Layout for all protected pages (Disaster Banner + Sidebar Navbar) ────────
const ProtectedLayout = () => (
  <ProtectedRoute>
    <>
      <DisasterAlertBanner />
      <Navbar />
    </>
  </ProtectedRoute>
);

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>

          {/* ── Public routes ────────────────────────────────────────── */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/verify-otp"      element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── Protected routes ─────────────────────────────────────── */}
          <Route element={<ProtectedLayout />}>

            {/* All logged-in users */}
            <Route path="/dashboard"        element={<DashboardPage />} />
            <Route path="/sos"              element={<SOSPage />} />
            <Route path="/incidents/:id"    element={<IncidentDetailPage />} />
            <Route path="/history"          element={<HistoryPage />} />
            <Route path="/profile"          element={<ProfilePage />} />
            <Route path="/nearby"           element={<NearbyServicesPage />} />
            <Route path="/donors"           element={<BloodDonorPage />} />
          
            <Route path="/become-responder" element={<RoleRequestPage />} />

            {/* Admin only */}
            <Route path="/admin" element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Responder + Admin */}
            <Route path="/responder" element={
              <ProtectedRoute roles={["responder", "admin"]}>
                <ResponderDashboard />
              </ProtectedRoute>
            } />

          </Route>

          {/* ── Fallback ─────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}
