import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllOpportunities, applyToOpportunity, getMyApplications } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/layout/Sidebar";
import { MapPin, Clock, Building2, Search, CheckCircle2, X } from "lucide-react";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};

const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@700;800;900&display=swap');

  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

  .opp-card {
    animation: fadeUp .3s ease both;
    transition: box-shadow .2s, transform .2s, border-color .2s;
  }
  .opp-card:hover {
    box-shadow: 0 8px 32px rgba(46,125,50,.18), 0 0 0 1.5px rgba(67,160,71,0.35) !important;
    transform: translateY(-3px);
    border-color: rgba(67,160,71,0.35) !important;
  }
  .opp-card.highlighted {
    box-shadow: 0 0 0 2.5px #43a047, 0 8px 32px rgba(46,125,50,.3) !important;
    border-color: #43a047 !important;
  }
  .btn-apply { transition: all .2s !important; }
  .btn-apply:hover:not(:disabled) {
    opacity:.88 !important;
    transform:translateY(-2px) !important;
    box-shadow:0 8px 22px rgba(46,125,50,.5) !important;
  }
  .btn-apply:active:not(:disabled) { transform:translateY(0) !important; }

  .btn-message { transition: all .2s !important; }
  .btn-message:hover {
    opacity: .88 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 22px rgba(211,47,47,.4) !important;
  }
  .btn-message:active { transform: translateY(0) !important; }

  .toast { animation: slideDown .25s ease both; }

  .search-input:focus {
    border-color: rgba(67,160,71,0.5) !important;
    box-shadow: 0 0 0 3px rgba(67,160,71,.15) !important;
    outline: none !important;
  }
`;

const StatusBadge = ({ status }) => {
  const cfg = {
    open:         { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Open"        },
    closed:       { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Closed"      },
    "in-progress":{ bg:"#fef9c3", color:"#a16207", dot:"#eab308", label:"In Progress" },
  }[status] || { bg:"#f1f5f9", color:"#64748b", dot:"#94a3b8", label:status };

  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 11px", borderRadius:20,
      background:cfg.bg, color:cfg.color,
      fontSize:12, fontWeight:700, whiteSpace:"nowrap",
      border:`1px solid ${cfg.dot}44`,
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
};

const AppStatusBadge = ({ status }) => {
  const cfg = {
    pending:  { bg:"#fef9c3", color:"#a16207", dot:"#eab308", label:"Pending",  msg:"Application under review"        },
    accepted: { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Accepted", msg:"Congratulations! You're accepted" },
    rejected: { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Rejected", msg:"Application was not selected"     },
  }[status] || null;
  if (!cfg) return null;
  return (
    <div style={{ textAlign:"center", padding:"8px 0" }}>
      <span style={{
        display:"inline-flex", alignItems:"center", gap:5,
        padding:"5px 13px", borderRadius:20,
        background:cfg.bg, color:cfg.color,
        fontSize:12, fontWeight:700,
        border:`1px solid ${cfg.dot}44`,
      }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }} />
        {cfg.label}
      </span>
      <p style={{ fontSize:12.5, color:T.textSoft, margin:"6px 0 0" }}>{cfg.msg}</p>
    </div>
  );
};

const Toast = ({ msg, type, onClose }) => (
  <div className="toast" style={{
    position:"fixed", top:24, right:24, zIndex:1000,
    display:"flex", alignItems:"center", gap:12,
    padding:"14px 18px", borderRadius:12,
    background: type === "success" ? "#dcfce7" : "#fee2e2",
    border: `1px solid ${type === "success" ? "#86efac" : "#fca5a5"}`,
    color: type === "success" ? "#15803d" : "#b91c1c",
    fontSize:14, fontWeight:600, fontFamily:font,
    boxShadow:"0 8px 24px rgba(0,0,0,.15)",
    maxWidth:340,
  }}>
    {type === "success" ? <CheckCircle2 size={18} /> : <X size={18} />}
    <span>{msg}</span>
    <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", marginLeft:4, opacity:.6, lineHeight:1, color:"inherit" }}>
      <X size={14} />
    </button>
  </div>
);

const ApplyModal = ({ isOpen, onClose, onSubmit, opp, darkMode }) => {
  const [formData, setFormData] = useState({ name: '', location: '', skills: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !opp) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.skills.trim()) newErrors.skills = 'Skills are required (comma-separated)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      await onSubmit(opp._id, { ...formData, skills: skillsArray });
      onClose();
    } catch (err) {
      // Toast handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000,
      padding:'20px', backdropFilter:'blur(6px)',
    }}>
      <div style={{
        background: darkMode ? "#1e2d1e" : "#fff", borderRadius:20, padding:'32px', width:'100%', maxWidth:420,
        boxShadow:'0 20px 60px rgba(0,0,0,.3)', maxHeight:'90vh', overflowY:'auto',
        border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h3 style={{ margin:0, fontSize:20, fontFamily:serif, fontWeight:800, color: darkMode ? "#e8f5e9" : T.bDark }}>
            Apply to "{opp.title}"
          </h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', padding:4, opacity:0.5, color: darkMode ? "#e8f5e9" : T.bDark }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label:'Full Name *', key:'name', type:'text', placeholder:'Enter your full name' },
            { label:'Location *', key:'location', type:'text', placeholder:'City, State or Remote' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.textSoft, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.8px' }}>
                {label}
              </label>
              <input
                type={type}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                placeholder={placeholder}
                style={{
                  width:'100%', padding:'11px 14px', borderRadius:10,
                  border: darkMode ? '1px solid #444' : `1px solid ${T.bSand}`,
                  background: darkMode ? '#2a2a2a' : '#fafafa',
                  color: darkMode ? '#e8f5e9' : T.textDark, fontSize:14, fontFamily:font,
                  outline:'none',
                }}
              />
              {errors[key] && <p style={{ fontSize:12, color:'#ef4444', marginTop:4 }}>{errors[key]}</p>}
            </div>
          ))}

          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, color: darkMode ? "rgba(255,255,255,0.6)" : T.textSoft, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.8px' }}>
              Skills (comma-separated) *
            </label>
            <textarea
              rows={3}
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. Web Development, Community Outreach"
              style={{
                width:'100%', padding:'11px 14px', borderRadius:10,
                border: darkMode ? '1px solid #444' : `1px solid ${T.bSand}`,
                background: darkMode ? '#2a2a2a' : '#fafafa',
                color: darkMode ? '#e8f5e9' : T.textDark, fontSize:14, fontFamily:font, resize:'vertical',
                outline:'none',
              }}
            />
            {errors.skills && <p style={{ fontSize:12, color:'#ef4444', marginTop:4 }}>{errors.skills}</p>}
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <button type="button" onClick={onClose} disabled={submitting} style={{
              flex:1, padding:'12px', borderRadius:10,
              border:`1px solid ${T.bSand}`,
              background:T.bPale, color:T.textMid,
              fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:font,
            }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{
              flex:1, padding:'12px', borderRadius:10, border:'none',
              background:'linear-gradient(135deg, #43a047, #2e7d32)', color:'#fff',
              fontSize:14, fontWeight:600, cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily:font, boxShadow:'0 4px 14px rgba(67,160,71,0.4)',
            }}>
              {submitting ? 'Submitting...' : 'Apply Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Opportunities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [applyModal, setApplyModal] = useState({ isOpen: false, selectedOpp: null });
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const cardRefs = useRef({});
  const isNgo = user?.role?.toLowerCase() === "ngo";

  useEffect(() => {
    fetchOpportunities();
    if (!isNgo) fetchMyApplications();
  }, [user]);

  useEffect(() => {
    if (!id || opportunities.length === 0) return;
    const opp = opportunities.find(o => o._id === id);
    if (!opp) return;
    setTimeout(() => {
      cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    if (opp.status === "open" && !applicationStatus[id]) {
      setApplyModal({ isOpen: true, selectedOpp: opp });
    }
  }, [id, opportunities]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getAllOpportunities();
      setOpportunities(response?.data?.opportunities || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await getMyApplications();
      const statusMap = {};
      (response?.data?.applications || []).forEach(app => {
        statusMap[app._id] = app.applicationStatus;
      });
      setApplicationStatus(statusMap);
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openApplyModal = (oppId) => {
    const opp = opportunities.find(o => o._id === oppId);
    if (opp) setApplyModal({ isOpen: true, selectedOpp: opp });
  };

  const closeApplyModal = () => setApplyModal({ isOpen: false, selectedOpp: null });

  const handleApply = async (oppId, formData) => {
    try {
      setApplying(oppId);
      await applyToOpportunity(oppId, formData);
      setApplicationStatus(prev => ({ ...prev, [oppId]: "pending" }));
      showToast("Application submitted successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to apply for opportunity", "error");
    } finally {
      setApplying(null);
    }
  };

  const filtered = opportunities.filter(o =>
    !search ||
    o.title?.toLowerCase().includes(search.toLowerCase()) ||
    o.location?.toLowerCase().includes(search.toLowerCase()) ||
    o.requiredSkills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ display:"flex", minHeight:"100vh", fontFamily:font, background:"#0d1f0e" }}>
        <Sidebar />
        <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Loading opportunities…</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      display:"flex",
      minHeight:"100vh",
      fontFamily:font,
    }}>
      <style>{css}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {applyModal.isOpen && (
        <ApplyModal
          isOpen={applyModal.isOpen}
          onClose={closeApplyModal}
          onSubmit={handleApply}
          opp={applyModal.selectedOpp}
          darkMode={darkMode}
        />
      )}
      <Sidebar />

      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto" }}>

        {/* HEADER */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:serif, fontSize:28, fontWeight:800, color:"#e8f5e9", margin:"0 0 4px", letterSpacing:"-0.3px" }}>
              Volunteer Opportunities
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:0 }}>
              Find ways to make a difference in your community
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div style={{ position:"relative", marginBottom:28, maxWidth:480 }}>
          <Search size={15} color="rgba(255,255,255,0.3)"
            style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }} />
          <input
            className="search-input"
            type="text"
            placeholder="Search by title, location or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:"100%", padding:"11px 16px 11px 40px", borderRadius:10,
              border:"1px solid rgba(255,255,255,0.08)", fontSize:14, fontFamily:font,
              background:"rgba(255,255,255,0.05)", color:"#e8f5e9",
            }}
          />
        </div>

        {error && (
          <div style={{
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)",
            color:"#f87171", borderRadius:10, padding:"10px 14px",
            fontSize:13.5, marginBottom:20,
          }}>
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:14 }}>No opportunities found</p>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
            {filtered.map((opp, idx) => (
              <div
                key={opp._id}
                ref={el => cardRefs.current[opp._id] = el}
                className={`opp-card${id === opp._id ? " highlighted" : ""}`}
                style={{
                  borderRadius:16,
                  background: darkMode ? "#1e2d1e" : "#f7f9f7",
                  border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
                  boxShadow:"0 2px 12px rgba(0,0,0,0.18)",
                  padding:"22px 24px",
                  display:"flex", flexDirection:"column", gap:12,
                  animationDelay:`${idx * 0.04}s`,
                }}
              >
                {/* TITLE + STATUS */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <h3 style={{ margin:0, fontSize:15, fontWeight:700, color: darkMode ? "#e8f5e9" : T.bDark, fontFamily:serif, lineHeight:1.3 }}>
                    {opp.title}
                  </h3>
                  <StatusBadge status={opp.status} />
                </div>

                {/* DESCRIPTION */}
                {opp.description && (
                  <p style={{
                    fontSize:13, margin:0, lineHeight:1.6,
                    color: darkMode ? "rgba(255,255,255,0.55)" : T.textSoft,
                    display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden",
                  }}>
                    {opp.description}
                  </p>
                )}

                {/* META */}
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {opp.ngo?.name && (
                    <span style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, color: darkMode ? "rgba(255,255,255,0.6)" : T.textMid }}>
                      <Building2 size={13} color={darkMode ? "#81c784" : T.bLight} /> {opp.ngo.name}
                    </span>
                  )}
                  {opp.location && (
                    <span style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, color: darkMode ? "rgba(255,255,255,0.6)" : T.textMid }}>
                      <MapPin size={13} color={darkMode ? "#81c784" : T.bLight} /> {opp.location}
                    </span>
                  )}
                  {opp.duration && (
                    <span style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, color: darkMode ? "rgba(255,255,255,0.6)" : T.textMid }}>
                      <Clock size={13} color={darkMode ? "#81c784" : T.bLight} /> {opp.duration}
                    </span>
                  )}
                </div>

                {/* SKILLS */}
                {opp.requiredSkills?.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {opp.requiredSkills.map((skill, i) => (
                      <span key={i} style={{
                        padding:"3px 9px", borderRadius:20,
                        background: darkMode ? "rgba(67,160,71,0.15)" : T.gPale,
                        color: darkMode ? "#81c784" : T.gDark,
                        fontSize:11.5, fontWeight:500,
                        border: darkMode ? "1px solid rgba(67,160,71,0.3)" : `1px solid ${T.gSage}`,
                      }}>{skill}</span>
                    ))}
                  </div>
                )}

                {/* ACTIONS */}
                {!isNgo && (
                  <div style={{
                    borderTop: darkMode ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${T.bPale}`,
                    paddingTop:14, marginTop:"auto", display:"flex", flexDirection:"column", gap:8,
                  }}>
                    {applicationStatus[opp._id] ? (
                      <AppStatusBadge status={applicationStatus[opp._id]} />
                    ) : opp.status === "open" ? (
                      <button
                        className="btn-apply"
                        onClick={() => openApplyModal(opp._id)}
                        disabled={!!applicationStatus[opp._id]}
                        style={{
                          width:"100%", padding:"11px",
                          background: applicationStatus[opp._id] ? "#e5e7eb" : "linear-gradient(135deg, #43a047, #2e7d32)",
                          color: applicationStatus[opp._id] ? "#9ca3af" : "#fff",
                          border:"none", borderRadius:10,
                          fontSize:14, fontWeight:600, fontFamily:font,
                          cursor: applicationStatus[opp._id] ? "not-allowed" : "pointer",
                          boxShadow: applicationStatus[opp._id] ? "none" : "0 4px 14px rgba(46,125,50,.35)",
                        }}
                      >
                        {applying === opp._id ? "Applying…" : applicationStatus[opp._id] ? "Applied" : "Apply Now"}
                      </button>
                    ) : (
                      <button disabled style={{
                        width:"100%", padding:"11px",
                        background: darkMode ? "rgba(255,255,255,0.08)" : "#f3f4f6",
                        color: darkMode ? "rgba(255,255,255,0.3)" : "#9ca3af",
                        border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                        borderRadius:10, fontSize:14, fontWeight:600, fontFamily:font, cursor:"not-allowed",
                      }}>
                        Not Available
                      </button>
                    )}

                    {/* MESSAGE NGO */}
                    <button
                      className="btn-message"
                      onClick={() => navigate("/messages", {
                        state: {
                          preSelectUserId: opp.createdBy?._id || opp.ngo?._id,
                          preSelectUserName: opp.ngo?.name || "NGO",
                        }
                      })}
                      style={{
                        width:"100%", padding:"11px",
                        background:"linear-gradient(135deg, #e53935, #b71c1c)",
                        color:"#fff", border:"none", borderRadius:10,
                        fontSize:14, fontWeight:600, fontFamily:font,
                        cursor:"pointer", boxShadow:"0 4px 14px rgba(229,57,53,.3)",
                      }}
                    >
                       Message NGO
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default Opportunities