import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/authSlice";
import { Plus, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    medicalConditions: [],
    allergies: [],
    address: { street: "", city: "", state: "", pincode: "" },
    emergencyContacts: [],
  });

  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [newContact, setNewContact] = useState({ name: "", email: "", relation: "" });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        medicalConditions: user.medicalConditions || [],
        allergies: user.allergies || [],
        address: user.address || { street: "", city: "", state: "", pincode: "" },
        emergencyContacts: user.emergencyContacts || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile updated!");
    } else {
      toast.error("Update failed");
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error("Name and email are required");
      return;
    }
    setForm((f) => ({ ...f, emergencyContacts: [...f.emergencyContacts, { ...newContact }] }));
    setNewContact({ name: "", email: "", relation: "" });
  };

  const removeContact = (i) => {
    setForm((f) => ({ ...f, emergencyContacts: f.emergencyContacts.filter((_, idx) => idx !== i) }));
  };

  const addChip = (field, value, setter) => {
    if (!value.trim()) return;
    setForm((f) => ({ ...f, [field]: [...f[field], value.trim()] }));
    setter("");
  };

  const removeChip = (field, i) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));
  };

  return (
    <div style={{ padding: 28, maxWidth: 700 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Profile</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          <Save size={15} /> {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Basic Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Basic Information</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email (read-only)</label>
            <input value={user?.email || ""} disabled style={{ opacity: 0.5 }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Blood Group</label>
            <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
              <option value="">Select blood group</option>
              {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Address</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {["street", "city", "state", "pincode"].map((field) => (
            <div key={field} className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ textTransform: "capitalize" }}>{field}</label>
              <input
                value={form.address[field] || ""}
                onChange={(e) => setForm({ ...form, address: { ...form.address, [field]: e.target.value } })}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Medical Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Medical Information</h2>

        <div style={{ marginBottom: 14 }}>
          <label>Medical Conditions</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              placeholder="e.g. Diabetes, Hypertension"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addChip("medicalConditions", newCondition, setNewCondition)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-outline" onClick={() => addChip("medicalConditions", newCondition, setNewCondition)}>
              <Plus size={14} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {form.medicalConditions.map((c, i) => (
              <span key={i} style={{
                background: "rgba(49,130,206,0.15)", color: "var(--info)",
                borderRadius: 999, padding: "4px 10px", fontSize: 12,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {c}
                <Trash2 size={10} style={{ cursor: "pointer" }} onClick={() => removeChip("medicalConditions", i)} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <label>Allergies</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              placeholder="e.g. Penicillin, Peanuts"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addChip("allergies", newAllergy, setNewAllergy)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-outline" onClick={() => addChip("allergies", newAllergy, setNewAllergy)}>
              <Plus size={14} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {form.allergies.map((a, i) => (
              <span key={i} style={{
                background: "rgba(214,158,46,0.15)", color: "var(--warning)",
                borderRadius: 999, padding: "4px 10px", fontSize: 12,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {a}
                <Trash2 size={10} style={{ cursor: "pointer" }} onClick={() => removeChip("allergies", i)} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Emergency Contacts</h2>

        {/* Existing contacts */}
        {form.emergencyContacts.map((c, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--bg-surface)", borderRadius: 8, padding: "10px 14px",
            marginBottom: 8,
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {c.email}{c.relation ? " · " + c.relation : ""}
              </div>
            </div>
            <button onClick={() => removeContact(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)" }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Add new contact */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginTop: 12, alignItems: "end" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Name</label>
            <input placeholder="Contact name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email</label>
            <input
              type="email"
              placeholder="contact@gmail.com"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Relation</label>
            <input placeholder="e.g. Father" value={newContact.relation} onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={addContact} style={{ padding: "10px 14px" }}>
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}