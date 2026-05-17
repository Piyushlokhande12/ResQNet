import { useState } from "react";
import api from "../api/axiosInstance";
import { Phone, Droplets } from "lucide-react";
import toast from "react-hot-toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const COMPATIBILITY = {
  "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+":  ["O+", "A+", "B+", "AB+"],
  "A-":  ["A-", "A+", "AB-", "AB+"],
  "A+":  ["A+", "AB+"],
  "B-":  ["B-", "B+", "AB-", "AB+"],
  "B+":  ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export default function BloodDonorPage() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchDonors = async () => {
    if (!selectedGroup) { toast.error("Please select a blood group"); return; }
    setLoading(true);
    try {
      const { data } = await api.get("/donors", { params: { bloodGroup: selectedGroup } });
      setDonors(data.donors || []);
      setSearched(true);
    } catch {
      toast.error("Search failed");
    }
    setLoading(false);
  };

  const compatible = selectedGroup ? COMPATIBILITY[selectedGroup] || [] : [];

  return (
    <div style={{ padding: 28, maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Blood Donor Finder</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Find registered blood donors. Update your profile with your blood group to appear as a donor.
      </p>

      {/* Search panel */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Search by Blood Group Needed</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {BLOOD_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              style={{
                width: 52, height: 52,
                borderRadius: 10,
                border: `2px solid ${selectedGroup === g ? "var(--primary)" : "var(--border)"}`,
                background: selectedGroup === g ? "rgba(229,62,62,0.12)" : "var(--bg-surface)",
                color: selectedGroup === g ? "var(--primary)" : "var(--text)",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                transition: "all 0.2s",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {selectedGroup && (
          <div style={{
            padding: "10px 14px",
            background: "rgba(229,62,62,0.07)",
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 14,
          }}>
            <Droplets size={12} style={{ display: "inline", marginRight: 6 }} color="var(--primary)" />
            <strong>{selectedGroup}</strong> can receive from:{" "}
            <span style={{ color: "var(--text-muted)" }}>
              {compatible.join(", ")}
            </span>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={searchDonors}
          disabled={loading || !selectedGroup}
          style={{ padding: "10px 24px" }}
        >
          {loading ? "Searching..." : "Find Donors"}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
            {donors.length > 0
              ? `${donors.length} donor${donors.length !== 1 ? "s" : ""} found`
              : "No donors found"}
          </h2>

          {donors.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🩸</div>
              <p style={{ color: "var(--text-muted)" }}>
                No registered donors with blood group <strong>{selectedGroup}</strong> found.<br />
                Encourage others to register their blood group on their profile.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {donors.map((d, i) => (
                <div key={i} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: 10,
                      background: "rgba(229,62,62,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13, color: "var(--primary)",
                    }}>
                      {d.bloodGroup}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {d.address?.city ? `${d.address.city}, ${d.address.state}` : "Location not set"}
                      </div>
                    </div>
                  </div>
                  <a
                    href={"tel:" + d.phone}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 8,
                      background: "rgba(56,161,105,0.12)",
                      color: "var(--success)",
                      textDecoration: "none",
                      fontSize: 13, fontWeight: 500,
                    }}
                  >
                    <Phone size={13} /> Call Donor
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}