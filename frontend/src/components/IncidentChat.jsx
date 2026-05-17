import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import api from "../api/axiosInstance";
import { Send } from "lucide-react";

export default function IncidentChat({ incidentId, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const socket = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket || !incidentId) return;
    socket.emit("join_room", incidentId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receive_message");
  }, [socket, incidentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/incidents/${incidentId}/message`, { text });
      setText("");
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: 380,
      background: "var(--bg-surface)", borderRadius: 12,
      border: "1px solid var(--border)",
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 14 }}>
        Emergency Chat
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginTop: 40 }}>
            No messages yet. Start communicating with your responder.
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
          return (
            <div key={i} style={{
              alignSelf: isMe ? "flex-end" : "flex-start",
              maxWidth: "75%",
              background: isMe ? "var(--primary)" : "var(--bg-card)",
              color: "var(--text)",
              padding: "8px 12px",
              borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              fontSize: 13,
            }}>
              {!isMe && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
                  {msg.senderName}
                </div>
              )}
              <div>{msg.text}</div>
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex", gap: 8, padding: "10px 12px",
        borderTop: "1px solid var(--border)",
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="btn btn-primary"
          style={{ padding: "10px 14px" }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}