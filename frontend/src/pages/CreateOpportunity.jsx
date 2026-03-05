import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOpportunity } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";

const T = {
  gDeep: "#1b5e20", gDark: "#2e7d32", gMid: "#43a047", gLight: "#81c784",
  gPale: "#c8e6c9", gSage: "#a5c8a0",
  bDark: "#3e2723", bMid: "#5d4037", bLight: "#8d6e63",
  bPale: "#efebe9", bSand: "#d7ccc8",
  cream: "#fdf8f0", pageBg: "#f4ede0",
  textDark: "#1c1008", textMid: "#4b3f36", textSoft: "#7b6b63",
};
const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const SKILLS_OPTIONS = [
  "Community Outreach", "Event Planning", "Social Media", "Driving",
  "Physical Labor", "First Aid", "Teaching", "Leadership",
  "Fundraising", "Photography", "Logistics", "Marketing"
];

const S = {
  layout: {
    display: "flex", minHeight: "100vh",
    fontFamily: font,
    background: T.pageBg,
    backgroundImage: [
      "radial-gradient(ellipse at 0% 0%, rgba(27,94,32,.18) 0%, transparent 40%)",
      "radial-gradient(ellipse at 100% 100%, rgba(62,39,35,.15) 0%, transparent 40%)",
    ].join(", "),
  },
  main: { flex: 1, padding: "40px 36px", overflowY: "auto" },
  header: { marginBottom: 32 },
  headerTop: { display: "flex", alignItems: "center", gap: 14, marginBottom: 6 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, color: "#fff",
  },
  h1: { fontFamily: serif, fontSize: 26, fontWeight: 800, color: T.bDark, letterSpacing: "-.3px", margin: 0 },
  subtitle: { fontSize: 14, color: T.textSoft, marginLeft: 58 },
  
  card: {
    borderRadius: 18,
    background: "linear-gradient(145deg, #fdf8f0, #f8f0e4)",
    border: `1px solid ${T.bSand}`,
    boxShadow: "0 2px 8px rgba(62,39,35,.09)",
    padding: "32px",
    maxWidth: 700,
  },
  cardTitle: {
    fontFamily: serif, fontSize: 18, fontWeight: 700, color: T.bDark,
    marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid ${T.bPale}`,
  },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 700, color: T.bMid, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".5px" },
  input: {
    width: "100%", padding: "12px 16px",
    border: `1.5px solid ${T.bSand}`, borderRadius: 10,
    fontSize: 14, fontFamily: font,
    color: T.textDark, background: "#fff",
    outline: "none", boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
  },
  textarea: {
    width: "100%", padding: "12px 16px",
    border: `1.5px solid ${T.bSand}`, borderRadius: 10,
    fontSize: 14, fontFamily: font,
    color: T.textDark, background: "#fff",
    outline: "none", boxSizing: "border-box",
    minHeight: 120, resize: "vertical",
  },
  select: {
    width: "100%", padding: "12px 16px",
    border: `1.5px solid ${T.bSand}`, borderRadius: 10,
    fontSize: 14, fontFamily: font,
    color: T.textDark, background: "#fff",
    cursor: "pointer", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b5c52' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: 16,
  },
  
  skillsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 10,
  },
  skillChip: (selected) => ({
    padding: "8px 14px", borderRadius: 20,
    border: selected ? `2px solid ${T.gMid}` : `1.5px solid ${T.bSand}`,
    background: selected ? T.gPale : "#fff",
    color: selected ? T.gDark : T.textMid,
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    textAlign: "center", transition: "all .2s",
  }),
  
  radioGroup: { display: "flex", gap: 16 },
  radioLabel: (selected) => ({
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 18px", borderRadius: 10,
    border: selected ? `2px solid ${T.gMid}` : `1.5px solid ${T.bSand}`,
    background: selected ? T.gPale : "#fff",
    color: selected ? T.gDark : T.textMid,
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    transition: "all .2s",
  }),
  
  btnRow: { display: "flex", gap: 12, marginTop: 28 },
  btn: (primary) => ({
    flex: 1, padding: "14px 24px",
    background: primary ? `linear-gradient(135deg, ${T.gMid} 0%, ${T.gDark} 100%)` : T.bPale,
    color: primary ? "#fff" : T.textMid,
    border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 600, fontFamily: font,
    cursor: "pointer",
    boxShadow: primary ? "0 4px 14px rgba(46,125,50,.3)" : "none",
  }),
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#c62828", borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 20 },
  success: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 20 },
};

const focusOn = (e) => { e.target.style.borderColor = T.gMid; e.target.style.boxShadow = "0 0 0 3px rgba(67,160,71,.15)"; };
const focusOff = (e) => { e.target.style.borderColor = T.bSand; e.target.style.boxShadow = "none"; };

const CreateOpportunity = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: [],
    duration: "",
    location: "",
    status: "open",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!formData.title || !formData.description || !formData.duration || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await createOpportunity(formData);
      setSuccess("Opportunity created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create opportunity");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: font }}>
        <p style={{ color: T.textSoft }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={S.layout}>
      <Sidebar />
      <main style={S.main}>
        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={S.headerIcon}>📋</div>
            <h1 style={S.h1}>Create Opportunity</h1>
          </div>
          <p style={S.subtitle}>Post a new recycling event or volunteer opportunity</p>
        </div>

        <div style={S.card}>
          <h2 style={S.cardTitle}>Opportunity Details</h2>
          
          {error && <div style={S.error}>{error}</div>}
          {success && <div style={S.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={S.field}>
              <label style={S.label}>Title *</label>
              <input type="text" name="title" placeholder="e.g., Community Recycling Drive" 
                value={formData.title} onChange={handleChange} onFocus={focusOn} onBlur={focusOff}
                style={S.input} required />
            </div>

            <div style={S.field}>
              <label style={S.label}>Description *</label>
              <textarea name="description" placeholder="Describe the opportunity, activities, and goals..."
                value={formData.description} onChange={handleChange} onFocus={focusOn} onBlur={focusOff}
                style={S.textarea} required />
            </div>

            <div style={S.field}>
              <label style={S.label}>Required Skills</label>
              <div style={S.skillsGrid}>
                {SKILLS_OPTIONS.map(skill => (
                  <div key={skill} style={S.skillChip(formData.requiredSkills.includes(skill))}
                    onClick={() => toggleSkill(skill)}>
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={S.field}>
                <label style={S.label}>Duration *</label>
                <input type="text" name="duration" placeholder="e.g., 2 hours, 1 week"
                  value={formData.duration} onChange={handleChange} onFocus={focusOn} onBlur={focusOff}
                  style={S.input} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Location *</label>
                <input type="text" name="location" placeholder="e.g., Central Park, City Name"
                  value={formData.location} onChange={handleChange} onFocus={focusOn} onBlur={focusOff}
                  style={S.input} required />
              </div>
            </div>

            <div style={S.field}>
              <label style={S.label}>Status</label>
              <div style={S.radioGroup}>
                <div style={S.radioLabel(formData.status === "open")}
                  onClick={() => setFormData({ ...formData, status: "open" })}>
                  <span>🟢</span> Open
                </div>
                <div style={S.radioLabel(formData.status === "closed")}
                  onClick={() => setFormData({ ...formData, status: "closed" })}>
                  <span>🔴</span> Closed
                </div>
              </div>
            </div>

            <div style={S.btnRow}>
              <button type="button" style={S.btn(false)} onClick={() => navigate("/dashboard")}>
                Cancel
              </button>
              <button type="submit" style={S.btn(true)} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Opportunity"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateOpportunity;
