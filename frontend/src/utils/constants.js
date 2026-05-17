export const EMERGENCY_TYPES = [
  { id: "medical",          label: "Medical",       icon: "🏥" },
  { id: "accident",         label: "Accident",      icon: "🚗" },
  { id: "fire",             label: "Fire",          icon: "🔥" },
  { id: "crime",            label: "Crime",         icon: "🚨" },
  { id: "women_safety",     label: "Women Safety",  icon: "👩" },
  { id: "natural_disaster", label: "Disaster",      icon: "🌊" },
  { id: "other",            label: "Other",         icon: "⚠️" },
];

export const STATUS_COLORS = {
  pending:    "#d69e2e",
  accepted:   "#3182ce",
  on_the_way: "#3182ce",
  resolved:   "#38a169",
  cancelled:  "#718096",
  fake:       "#e53e3e",
};

export const RESPONDER_TYPES = [
  { id: "police",    label: "Police",    icon: "👮" },
  { id: "ambulance", label: "Ambulance", icon: "🚑" },
  { id: "fire",      label: "Fire",      icon: "🚒" },
  { id: "medical",   label: "Medical",   icon: "⚕️" },
];

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";