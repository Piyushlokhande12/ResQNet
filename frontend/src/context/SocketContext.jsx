import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { updateIncidentStatus } from "../store/incidentSlice";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
    });

    const socket = socketRef.current;

    socket.on("connect", () => console.log("Socket connected"));

    // Real-time SOS alert (for admin/responder)
    socket.on("new_sos", (data) => {
      if (user?.role === "admin" || user?.role === "responder") {
        toast.error(`🚨 NEW SOS: ${data.emergencyType} — ${data.userName}`, { duration: 8000 });
      }
    });

    // Status changed (for victim)
    socket.on("status_changed", ({ status }) => {
      toast.success(`Incident status: ${status.replace("_", " ").toUpperCase()}`);
    });

    return () => socket.disconnect();
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);