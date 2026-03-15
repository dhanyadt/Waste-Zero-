import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOpportunities, applyToOpportunity, getMyApplications } from "../services/api";
import { useAuth } from "../context/AuthContext";
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
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  .opp-card { animation: fadeUp .3s ease both; transition: box-shadow .2s, transform .2s; }
  .opp-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.13) !important; transform: translateY(-3px); }
  .btn-apply { transition: all .2s !important; }
  .btn-apply:hover:not(:disabled) { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 8px 22px rgba(46,125,50,.45) !important; }
  .btn-apply:active:not(:disabled) { transform:translateY(0) !important; }
  .toast { animation: slideDown .25s ease both; }
  .search-input:focus { border-color: #43a047 !important; box-shadow: 0 0 0 3px rgba(67,160,71,.15) !important; outline:none !important; }
`;

const StatusBadge = ({ status }) => {
  const cfg = {
    open:         { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Open"        },
    closed:       { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Closed"      },
    "in-progress":{ bg:"#fef9c3", color:"#a16207", dot:"#eab308", label:"In Progress" },
  }[status] || { bg:T.bPale, color:T.bLight, dot:T.bSand, label:status };

  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 11px", borderRadius:20,
      background:cfg.bg, color:cfg.color,
      fontSize:12, fontWeight:700, whiteSpace:"nowrap",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
};

const AppStatusBadge = ({ status }) => {
  const cfg = {
    pending:  { bg:"#fef9c3", color:"#a16207", dot:"#eab308", label:"Pending",  msg:"Application under review"       },
    accepted: { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Accepted", msg:"Congratulations! You're accepted" },
    rejected: { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Rejected", msg:"Application was not selected"    },
  }[status] || null;
  if (!cfg) return null;
  return (
    <div style={{ textAlign:"center", padding:"8px 0" }}>
      <span style={{
        display:"inline-flex", alignItems:"center", gap:5,
        padding:"5px 13px", borderRadius:20,
        background:cfg.bg, color:cfg.color,
        fontSize:12, fontWeight:700,
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
    {type === "success"
      ? <CheckCircle2 size={18} />
      : <X size={18} />}
    <span>{msg}</span>
    <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", marginLeft:4, opacity:.6, lineHeight:1 }}>
      <X size={14} />
    </button>
  </div>
);

const ApplyModal = ({ isOpen, onClose, onSubmit, opp }) => {
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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto',
        animation: 'scaleIn 0.2s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.bDark }}>
            Apply to "{opp.title}"
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.7 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: T.textMid, marginBottom: 6 }}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${T.bPale}`,
                fontSize: 15, fontFamily: font,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <p style={{ fontSize: 13, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: T.textMid, marginBottom: 6 }}>
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, State or Remote"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${T.bPale}`,
                fontSize: 15, fontFamily: font,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <p style={{ fontSize: 13, color: '#ef4444', marginTop: 4 }}>{errors.location}</p>}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: T.textMid, marginBottom: 6 }}>
              Skills (comma-separated) *
            </label>
            <textarea
              rows={3}
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. Web Development, Community Outreach, Data Analysis"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${T.bPale}`,
                fontSize: 15, fontFamily: font, resize: 'vertical',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              className={errors.skills ? 'error' : ''}
            />
            {errors.skills && <p style={{ fontSize: 13, color: '#ef4444', marginTop: 4 }}>{errors.skills}</p>}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '14px', borderRadius: 12, border: `1px solid ${T.bPale}`,
                background: T.bPale, color: T.bDark, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: font,
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1, padding: '14px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`, color: '#fff',
                fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: font, boxShadow: '0 4px 14px rgba(67,160,71,0.4)',
              }}
            >
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

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [applyModal, setApplyModal] = useState({ isOpen: false, selectedOpp: null });

  // 🌙 DARK MODE STATE
  const [darkMode, setDarkMode] = useState(false);

  const isNgo = user?.role?.toLowerCase() === "ngo";
  const dashboardRoute = isNgo ? "/ngo-dashboard" : "/volunteer-dashboard";

  useEffect(() => {
    fetchOpportunities();
    if (!isNgo) fetchMyApplications();
  }, [user]);

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

  const openApplyModal = (oppId) => {
    const opp = opportunities.find(o => o._id === oppId);
    if (opp) {
      setApplyModal({ isOpen: true, selectedOpp: opp });
  const handleApply = async (opportunityId) => {
    try {
      setApplying(opportunityId);
      await applyToOpportunity(opportunityId);
      setApplicationStatus(prev => ({ ...prev, [opportunityId]: "pending" }));
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(null);
    }
  };

  const closeApplyModal = () => {
    setApplyModal({ isOpen: false, selectedOpp: null });
  };

  const handleApply = async (oppId, formData) => {
  try {
    setApplying(oppId);

    await applyToOpportunity(oppId, formData);

    setApplicationStatus(prev => ({
      ...prev,
      [oppId]: "pending"
    }));

    showToast("Application submitted successfully!", "success");

  } catch (err) {
    showToast(
      err.response?.data?.message || "Failed to apply for opportunity",
      "error"
    );
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
      <div style={{
        display:"flex",
        minHeight:"100vh",
        fontFamily:font,
        background: darkMode ? "#1a1a1a" : "#f3f4f6"
      }}>
        <Sidebar />
        <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <p>Loading opportunities…</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      display:"flex",
      minHeight:"100vh",
      fontFamily:font,
      background: darkMode ? "#002200" : "#c0e0c0"
      //background: darkMode ? "#1a1a1a" : "#f3f4f6"
    }}>
      <style>{css}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {applyModal.isOpen && (
        <ApplyModal
          isOpen={applyModal.isOpen}
          onClose={closeApplyModal}
          onSubmit={handleApply}
          opp={applyModal.selectedOpp}
        />
      )}
      <Sidebar />

      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto" }}>

        {/* HEADER */}
        <div style={{
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          marginBottom:28
        }}>

          <div>
            <h1 style={{
              fontFamily:serif,
              fontSize:28,
              fontWeight:800,
              color: darkMode ? "#fff" : T.bDark,
              margin:"0 0 4px"
            }}>
              Volunteer Opportunities
            </h1>

            <p style={{
              fontSize:14,
              color: darkMode ? "#bbb" : T.textSoft,
              margin:0
            }}>
              Find ways to make a difference in your community
            </p>
          </div>

          {/* DARK MODE TOGGLE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding:"8px 14px",
              borderRadius:"8px",
              border:"none",
              cursor:"pointer",
              background: darkMode ? "#444" : "#ddd",
              color: darkMode ? "#fff" : "#000",
              fontWeight:600
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

        </div>


        {/* SEARCH */}
        <div style={{ position:"relative", marginBottom:24, maxWidth:480 }}>
          <Search size={16} color={T.bLight}
            style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }} />

          <input
            type="text"
            placeholder="Search by title, location or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:"100%",
              padding:"11px 16px 11px 40px",
              borderRadius:10,
              border:`1px solid ${T.bSand}`,
              fontSize:14,
              fontFamily:font,
              background: darkMode ? "#2c2c2c" : "#fff",
              color: darkMode ? "#fff" : "#000"
            }}
          />
        </div>


        {error && (
          <div style={{
            background:"#fef2f2",
            border:"1px solid #fecaca",
            color:"#c62828",
            borderRadius:10,
            padding:"10px 14px",
            fontSize:13.5,
            marginBottom:20
          }}>
            {error}
          </div>
        )}


        {filtered.length === 0 ? (
          <p>No opportunities found</p>
        ) : (

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))",
            gap:16
          }}>

            {filtered.map((opp) => (

              <div key={opp._id}
                style={{
                  borderRadius:16,
                  background: darkMode ? "#2c2c2c" : "#fff",
                  border:`1px solid ${T.bSand}`,
                  padding:"22px 24px"
                }}>

                <h3 style={{
                  margin:0,
                  fontSize:16,
                  fontWeight:700,
                  color: darkMode ? "#fff" : T.bDark
                }}>
                  {opp.title}
                </h3>

                <p style={{
                  fontSize:13.5,
                  color: darkMode ? "#ccc" : T.textMid,
                  marginTop:8
                }}>
                  {opp.description}
                </p>

                <div style={{ marginTop:12 }}>

                  <p style={{ fontSize:13 }}>
                    <Building2 size={14}/> {opp.ngo?.name}
                  </p>

                  <p style={{ fontSize:13 }}>
                    <MapPin size={14}/> {opp.location}
                  </p>

                  <p style={{ fontSize:13 }}>
                    <Clock size={14}/> {opp.duration}
                  </p>

                </div>


                {!isNgo && (
                  <div style={{ borderTop:`1px solid ${T.bPale}`, paddingTop:14, marginTop:"auto" }}>
                    {applicationStatus[opp._id] ? (
                      <AppStatusBadge status={applicationStatus[opp._id]} />
                    ) : opp.status === "open" ? (
                      <button className="btn-apply"
                        onClick={() => openApplyModal(opp._id)}
                        disabled={applicationStatus[opp._id]}
                        style={{
                          width:"100%", padding:"11px",
                          background: applicationStatus[opp._id]
                            ? "#9ca3af"
                            : `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                          color:"#fff", border:"none", borderRadius:10,
                          fontSize:14, fontWeight:600, fontFamily:font,
                          cursor: applicationStatus[opp._id] ? "not-allowed" : "pointer",
                          boxShadow: applicationStatus[opp._id] ? "none" : "0 4px 14px rgba(46,125,50,.3)",
                        }}>
                        {applicationStatus[opp._id] ? "Applied" : "Apply Now"}
                      </button>
                    ) : (
                      <button disabled style={{
                        width:"100%", padding:"11px",
                        background:"#f3f4f6", color:"#9ca3af",
                        border:"none", borderRadius:10,
                        fontSize:14, fontWeight:600, fontFamily:font,
                        cursor:"not-allowed",
                      }}>Not Available</button>
                    )}
                  </div>
                  <button
                    onClick={() => handleApply(opp._id)}
                    disabled={applying === opp._id}
                    style={{
                      width:"100%",
                      marginTop:14,
                      padding:"11px",
                      background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                      color:"#fff",
                      border:"none",
                      borderRadius:10,
                      fontWeight:600,
                      cursor:"pointer"
                    }}
                  >
                    {applying === opp._id ? "Applying…" : "Apply Now"}
                  </button>
                )}

              </div>

            ))}

          </div>

        )}

      </main>
    </div>
  );
};

export default Opportunities;