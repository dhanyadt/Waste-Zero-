import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOpportunity } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import { CheckCircle2, ClipboardList } from "lucide-react";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};
const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const SKILLS_OPTIONS = [
  "Event Coordination",
  "Community Outreach",
  "Public Speaking",
  "Teamwork",
  "Leadership",
  "Environmental Awareness",
  "Waste Segregation Knowledge",
  "Recycling Practices",
  "Composting Knowledge",
  "Campaign Management",
  "Social Media Promotion",
  "Fundraising",
  "Volunteer Coordination",
  "Sustainability Advocacy",
  "Workshop Facilitation"
];
const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
  .co-card { animation: fadeUp .3s ease both; }
  .skill-chip { transition: all .15s !important; }
  .skill-chip:hover { border-color: #4ade80 !important; }
  .status-opt { transition: all .15s !important; }
  .status-opt:hover { border-color: #86efac !important; }
  .btn-submit { transition: all .2s !important; }
  .btn-submit:hover { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 8px 22px rgba(46,125,50,.45) !important; }
  .btn-submit:active { transform:translateY(0) !important; }
  .co-input:focus { border-color: #43a047 !important; box-shadow: 0 0 0 3px rgba(67,160,71,.15) !important; outline:none !important; }
  .success-overlay { animation: scaleIn .2s ease both; }
`;

const CreateOpportunity = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", requiredSkills: [],
    duration: "", location: "", status: "open",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleSkill = (skill) => setFormData(prev => ({
    ...prev,
    requiredSkills: prev.requiredSkills.includes(skill)
      ? prev.requiredSkills.filter(s => s !== skill)
      : [...prev.requiredSkills, skill],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.title || !formData.description || !formData.duration || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      await createOpportunity(formData);
      setShowSuccess(true);
      setTimeout(() => navigate("/ngo-dashboard"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create opportunity");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:font,
      background:"linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)" }}>
      <p style={{ color:"rgba(255,255,255,.4)" }}>Loading…</p>
    </div>
  );

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
      backgroundImage:[
        "radial-gradient(ellipse at 0% 0%, rgba(27,94,32,.25) 0%, transparent 45%)",
        "radial-gradient(ellipse at 100% 100%, rgba(62,39,35,.22) 0%, transparent 45%)",
        "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
      ].join(", "),
    }}>
      <style>{css}</style>
      <Sidebar />
      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto" }}>

        {/* Success overlay */}
        {showSuccess && (
          <div style={{
            position:"fixed", inset:0, zIndex:1000,
            background:"rgba(22,37,22,.85)", backdropFilter:"blur(8px)",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:16,
          }}>
            <div className="success-overlay" style={{
              width:72, height:72, borderRadius:20,
              background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 8px 28px rgba(46,125,50,.5)",
            }}>
              <CheckCircle2 size={36} color="#fff" />
            </div>
            <p style={{ fontFamily:serif, fontSize:22, fontWeight:800, color:"#fff", margin:0 }}>Success!</p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.55)", margin:0 }}>Opportunity created successfully. Redirecting…</p>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:4 }}>
            <div style={{
              width:44, height:44, borderRadius:12,
              background:"rgba(255,255,255,.08)",
              border:"1px solid rgba(255,255,255,.12)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <ClipboardList size={20} color="rgba(255,255,255,.7)" />
            </div>
            <div>
              <h1 style={{ fontFamily:serif, fontSize:24, fontWeight:800, color:"#fff", margin:0, letterSpacing:"-.3px" }}>
                Create Opportunity
              </h1>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.4)", margin:0 }}>Fill in the details to create a volunteer opportunity</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="co-card" style={{
          borderRadius:18, background:"#fff",
          border:`1px solid ${T.bSand}`,
          boxShadow:"0 2px 8px rgba(0,0,0,.22), 0 8px 24px rgba(0,0,0,.18)",
          padding:"32px", 
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.gDark}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />

          <h2 style={{ fontFamily:serif, fontSize:17, fontWeight:700, color:T.bDark, margin:"0 0 24px", paddingBottom:14, borderBottom:`1px solid ${T.bPale}` }}>
            Opportunity Details
          </h2>

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#c62828", borderRadius:10, padding:"10px 14px", fontSize:13.5, marginBottom:20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.bMid, textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>
                Title <span style={{color:"#ef4444"}}>*</span>
              </label>
              <input className="co-input" type="text" name="title" placeholder="Opportunity Title"
                value={formData.title} onChange={handleChange} required
                style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${T.bSand}`, borderRadius:10, fontSize:14, fontFamily:font, color:T.textDark, background:"#fff", boxSizing:"border-box", transition:"border-color .2s, box-shadow .2s" }} />
            </div>

            {/* Description */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.bMid, textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>
                Description <span style={{color:"#ef4444"}}>*</span>
              </label>
              <textarea className="co-input" name="description" placeholder="Describe the opportunity..."
                value={formData.description} onChange={handleChange} required
                style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${T.bSand}`, borderRadius:10, fontSize:14, fontFamily:font, color:T.textDark, background:"#fff", boxSizing:"border-box", minHeight:110, resize:"vertical", transition:"border-color .2s, box-shadow .2s" }} />
            </div>

            {/* Skills */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.bMid, textTransform:"uppercase", letterSpacing:".8px", marginBottom:10 }}>
                Required Skills
              </label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {SKILLS_OPTIONS.map(skill => {
                  const sel = formData.requiredSkills.includes(skill);
                  return (
                    <div key={skill} className="skill-chip" onClick={() => toggleSkill(skill)} style={{
                      padding:"7px 14px", borderRadius:20, cursor:"pointer",
                      border: sel ? `2px solid ${T.gMid}` : `1.5px solid ${T.bSand}`,
                      background: sel ? T.gPale : "#fff",
                      color: sel ? T.gDark : T.textMid,
                      fontSize:13, fontWeight: sel ? 600 : 400,
                    }}>{skill}</div>
                  );
                })}
              </div>
            </div>

            {/* Duration + Location */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.bMid, textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>
                  Duration <span style={{color:"#ef4444"}}>*</span>
                </label>
                <input className="co-input" type="text" name="duration" placeholder="e.g., 3 months"
                  value={formData.duration} onChange={handleChange} required
                  style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${T.bSand}`, borderRadius:10, fontSize:14, fontFamily:font, color:T.textDark, background:"#fff", boxSizing:"border-box", transition:"border-color .2s, box-shadow .2s" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.bMid, textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>
                  Location <span style={{color:"#ef4444"}}>*</span>
                </label>
                <input className="co-input" type="text" name="location" placeholder="Location"
                  value={formData.location} onChange={handleChange} required
                  style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${T.bSand}`, borderRadius:10, fontSize:14, fontFamily:font, color:T.textDark, background:"#fff", boxSizing:"border-box", transition:"border-color .2s, box-shadow .2s" }} />
              </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.bMid, textTransform:"uppercase", letterSpacing:".8px", marginBottom:10 }}>
                Status
              </label>
              <div style={{ display:"flex", gap:10 }}>
                {[
                  { val:"open",   dot:"#22c55e", label:"Open"   },
                  { val:"closed", dot:"#ef4444", label:"Closed" },
                ].map(({ val, dot, label }) => {
                  const sel = formData.status === val;
                  return (
                    <div key={val} className="status-opt" onClick={() => setFormData({...formData, status:val})} style={{
                      display:"inline-flex", alignItems:"center", gap:8,
                      padding:"10px 18px", borderRadius:10, cursor:"pointer",
                      border: sel ? `2px solid ${T.gMid}` : `1.5px solid ${T.bSand}`,
                      background: sel ? T.gPale : "#fff",
                      color: sel ? T.gDark : T.textMid,
                      fontSize:14, fontWeight: sel ? 600 : 400,
                    }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:dot }} />
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:12 }}>
              <button type="button" onClick={() => navigate("/ngo-dashboard")} style={{
                flex:1, padding:"13px 24px", borderRadius:10,
                border:`1.5px solid ${T.bSand}`, background:"transparent",
                color:T.textMid, fontSize:14, fontWeight:600, fontFamily:font, cursor:"pointer",
              }}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={isLoading} style={{
                flex:2, padding:"13px 24px", borderRadius:10,
                border:"none", background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                color:"#fff", fontSize:14, fontWeight:600, fontFamily:font, cursor:"pointer",
                boxShadow:`0 4px 14px rgba(46,125,50,.3)`,
              }}>{isLoading ? "Creating…" : "Create Opportunity"}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateOpportunity;