import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import api from "../api/axiosInstance";
import IncidentChat from "../components/IncidentChat";
import EmergencyMap from "../components/EmergencyMap";
import { MapPin, Clock, User, Upload, ArrowLeft, Phone } from "lucide-react";
import toast from "react-hot-toast";

const typeIcons = {
  medical: "🏥",
  accident: "🚗",
  fire: "🔥",
  crime: "🚨",
  women_safety: "👩",
  natural_disaster: "🌊",
  other: "⚠️",
};

const statusColors = {
  pending: "var(--warning)",
  accepted: "var(--info)",
  on_the_way: "var(--info)",
  resolved: "var(--success)",
  fake: "var(--primary)",
  cancelled: "var(--text-muted)",
};

export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useSelector((s) => s.auth);

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [responderLoc, setResponderLoc] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch incident on mount and when id changes
  useEffect(() => {
    fetchIncident();
  }, [id]);

  // Socket.io — join room and listen for real-time updates
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join_room", id);

    socket.on("status_changed", ({ status }) => {
      setIncident((prev) => (prev ? { ...prev, status } : prev));
      toast.success("Status updated: " + status.replace(/_/g, " ").toUpperCase());
    });

    socket.on("responder_location", ({ coordinates }) => {
      setResponderLoc({ lat: coordinates[1], lng: coordinates[0] });
    });

    socket.on("incident_accepted", ({ responderName }) => {
      toast.success("Responder " + responderName + " is on the way!");
    });

    return () => {
      socket.off("status_changed");
      socket.off("responder_location");
      socket.off("incident_accepted");
    };
  }, [socket, id]);

  const fetchIncident = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/incidents/" + id);
      setIncident(data.incident);
    } catch {
      toast.error("Could not load incident");
      navigate("/history");
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.patch("/incidents/" + id + "/status", { status: newStatus });
      setIncident((prev) => ({ ...prev, status: newStatus }));
      toast.success("Status updated to: " + newStatus.replace(/_/g, " "));
    } catch {
      toast.error("Failed to update status");
    }
    setUpdatingStatus(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/incidents/" + id + "/evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Evidence uploaded successfully!");
      fetchIncident();
    } catch {
      toast.error("Upload failed. Try again.");
    }
    setUploading(false);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        padding: 28, display: "flex", alignItems: "center",
        justifyContent: "center", minHeight: "60vh",
        flexDirection: "column", gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--primary)",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading incident...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!incident) return null;

  const victimLoc = incident.location?.coordinates
    ? { lat: incident.location.coordinates[1], lng: incident.location.coordinates[0] }
    : null;

  const isAdminOrResponder = user?.role === "admin" || user?.role === "responder";
  const isOwner = incident.user?._id === user?._id || incident.user === user?._id;

  return (
    <div style={{ padding: 28 }}>

      {/* ── Back button ── */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline"
        style={{ marginBottom: 20, fontSize: 13 }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: 24,
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: "var(--bg-surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, border: "1px solid var(--border)",
          }}>
            {typeIcons[incident.emergencyType] || "⚠️"}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, textTransform: "capitalize" }}>
              {incident.emergencyType.replace(/_/g, " ")} Emergency
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Incident ID: <strong>#{incident._id.slice(-8).toUpperCase()}</strong>
              {" · "}
              Triggered via: <strong style={{ textTransform: "capitalize" }}>{incident.triggerMethod || "button"}</strong>
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6,
        }}>
          <span
            className={"badge badge-" + incident.status}
            style={{ fontSize: 14, padding: "7px 18px" }}
          >
            {incident.status.replace(/_/g, " ")}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {new Date(incident.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Incident Details card */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Incident Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <MapPin size={15} color="var(--primary)" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>LOCATION</div>
                  <div>{incident.location?.address || "Location not available"}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Clock size={15} color="var(--primary)" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>TIME</div>
                  <div>{new Date(incident.createdAt).toLocaleString()}</div>
                  {incident.acceptedAt && (
                    <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
                      Accepted: {new Date(incident.acceptedAt).toLocaleTimeString()}
                    </div>
                  )}
                  {incident.resolvedAt && (
                    <div style={{ color: "var(--success)", fontSize: 12, marginTop: 2 }}>
                      Resolved: {new Date(incident.resolvedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>

              {incident.user && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <User size={15} color="var(--primary)" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>VICTIM</div>
                    <div style={{ fontWeight: 500 }}>{incident.user.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {incident.user.phone}
                      {incident.user.bloodGroup && (
                        <span style={{
                          marginLeft: 8,
                          background: "rgba(229,62,62,0.12)",
                          color: "var(--primary)",
                          borderRadius: 4,
                          padding: "1px 6px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                          {incident.user.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {incident.responder && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Phone size={15} color="var(--success)" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>ASSIGNED RESPONDER</div>
                    <div style={{ fontWeight: 500, color: "var(--success)" }}>{incident.responder.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{incident.responder.phone}</div>
                  </div>
                </div>
              )}

              {incident.description && (
                <div style={{
                  background: "var(--bg-surface)", borderRadius: 8,
                  padding: "10px 14px", marginTop: 4,
                  borderLeft: "3px solid var(--primary)",
                }}>
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 4 }}>DESCRIPTION</div>
                  <div style={{ fontSize: 13 }}>{incident.description}</div>
                </div>
              )}
            </div>

            {/* Medical info — shown to responders/admin */}
            {isAdminOrResponder && (
              <>
                {incident.user?.medicalConditions?.length > 0 && (
                  <div style={{
                    marginTop: 14, padding: "12px 14px",
                    background: "rgba(229,62,62,0.07)",
                    borderRadius: 8,
                    border: "1px solid rgba(229,62,62,0.2)",
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "var(--primary)", marginBottom: 6 }}>
                      ⚕️ Medical Conditions
                    </div>
                    <div style={{ fontSize: 13 }}>{incident.user.medicalConditions.join(", ")}</div>
                    {incident.user.allergies?.length > 0 && (
                      <div style={{ fontSize: 12, marginTop: 6, color: "var(--text-muted)" }}>
                        <strong>Allergies:</strong> {incident.user.allergies.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {/* Emergency contacts */}
                {incident.user?.emergencyContacts?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>EMERGENCY CONTACTS</div>
                    {incident.user.emergencyContacts.map((c, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between",
                        padding: "7px 10px",
                        background: "var(--bg-surface)",
                        borderRadius: 7, marginBottom: 6, fontSize: 12,
                      }}>
                        <span style={{ fontWeight: 500 }}>{c.name} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({c.relation})</span></span>
                        <span style={{ color: "var(--info)" }}>{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status update — admin/responder only */}
          {isAdminOrResponder && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Update Status</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["accepted", "on_the_way", "resolved", "fake"].map((s) => (
                  <button
                    key={s}
                    className="btn btn-outline"
                    disabled={updatingStatus || incident.status === s}
                    onClick={() => handleStatusUpdate(s)}
                    style={{
                      fontSize: 12,
                      padding: "7px 14px",
                      textTransform: "capitalize",
                      borderColor: incident.status === s ? statusColors[s] : undefined,
                      color: incident.status === s ? statusColors[s] : undefined,
                      opacity: updatingStatus ? 0.6 : 1,
                    }}
                  >
                    {s.replace(/_/g, " ")}
                    {incident.status === s && " ✓"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Evidence upload */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Evidence</h2>

            {incident.media?.length > 0 ? (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8, marginBottom: 14,
              }}>
                {incident.media.map((m, i) => (
                  <a key={i} href={m.url} target="_blank" rel="noreferrer"
                    style={{ borderRadius: 8, overflow: "hidden", display: "block" }}>
                    {m.type === "image" ? (
                      <img
                        src={m.url}
                        alt={"evidence " + (i + 1)}
                        style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{
                        height: 80, background: "var(--bg-surface)",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 30,
                        border: "1px solid var(--border)",
                      }}>
                        {m.type === "video" ? "🎥" : "🎤"}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                No evidence uploaded yet.
              </p>
            )}

            <label style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              cursor: uploading ? "not-allowed" : "pointer",
              fontSize: 13,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "9px 16px",
              transition: "border-color 0.2s",
              opacity: uploading ? 0.6 : 1,
            }}>
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload Evidence"}
              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                accept="image/*,video/*,audio/*"
                disabled={uploading}
              />
            </label>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
              Supported: images, videos, audio recordings
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Map */}
          {victimLoc ? (
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{
                padding: "12px 16px",
                background: "var(--bg-card)",
                borderBottom: "1px solid var(--border)",
                fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <MapPin size={14} color="var(--primary)" />
                Live Location
                {responderLoc && (
                  <span style={{
                    marginLeft: "auto", fontSize: 11,
                    color: "var(--success)",
                    background: "rgba(56,161,105,0.12)",
                    padding: "2px 8px", borderRadius: 999,
                  }}>
                    🟢 Responder tracking active
                  </span>
                )}
              </div>
              <EmergencyMap
                victimLocation={victimLoc}
                responderLocation={responderLoc}
              />
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Location data not available</p>
            </div>
          )}

          {/* Chat */}
          <IncidentChat
            incidentId={id}
            initialMessages={incident.messages || []}
          />
        </div>
      </div>
    </div>
  );
}