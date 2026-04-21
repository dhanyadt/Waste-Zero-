import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getAllOpportunitiesForNgo, deleteOpportunity, updateApplicationStatus } from "../services/api";
import { Plus, Pencil, Trash2, MapPin, Clock, AlertTriangle, Building2, MessageSquare, Users, CheckCircle, XCircle } from "lucide-react";
import API from "../services/api";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047", gLight:"#81c784",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};
const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .ngo-card { animation: fadeUp .3s ease both; }
  .ngo-opp-row { transition: box-shadow .2s, transform .2s; }
  .ngo-opp-row:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1) !important; transform: translateY(-2px); }
  .btn-primary { transition: all .2s !important; }
  .btn-primary:hover { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 8px 22px rgba(46,125,50,.45) !important; }
  .btn-primary:active { transform:translateY(0) !important; }
  .btn-edit { transition: all .15s !important; }
  .btn-edit:hover { background:#d1fae5 !important; border-color:#4ade80 !important; transform:translateY(-1px); }
  .btn-delete { transition: all .15s !important; }
  .btn-delete:hover { background:#fee2e2 !important; border-color:#f87171 !important; transform:translateY(-1px); }
  .modal-wrap { animation: scaleIn .18s ease both; }
  .convo-row { transition: background .15s, transform .15s; cursor: pointer; }
  .convo-row:hover { background: rgba(46,125,50,.08) !important; transform: translateX(3px); }
  .btn-msg-volunteer { transition: all .18s !important; }
  .btn-msg-volunteer:hover { opacity:.88 !important; transform:translateY(-1px) !important; box-shadow:0 6px 18px rgba(46,125,50,.4) !important; }
  .btn-msg-volunteer:active { transform:translateY(0) !important; }
  .vol-row { transition: background .15s, transform .15s; }
  .vol-row:hover { background: rgba(46,125,50,.06) !important; transform: translateX(2px); }
  .applicant-row { transition: background .15s; }
  .applicant-row:hover { background: rgba(46,125,50,.04) !important; }
  .btn-accept { transition: all .15s !important; }
  .btn-accept:hover { opacity:.85 !important; transform:translateY(-1px) !important; }
  .btn-reject { transition: all .15s !important; }
  .btn-reject:hover { opacity:.85 !important; transform:translateY(-1px) !important; }

  /* ── Applicant row responsive layout ── */
  .applicant-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .applicant-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 160px;
    min-width: 0;
  }
  .applicant-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  /* Opportunity header wraps on small screens */
  .opp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }
  .opp-title-block { flex: 1 1 200px; min-width: 0; }
  .opp-action-block {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  @media (max-width: 540px) {
    .applicant-actions {
      width: 100%;
      justify-content: flex-start;
    }
    .opp-action-block {
      width: 100%;
    }
  }
`;

const StatusBadge = ({ status, darkMode }) => {
  const cfg = {
    open:   { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Open"   },
    closed: { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Closed" },
  }[status] || { bg: darkMode ? "#333" : T.bPale, color: darkMode ? "#eee" : T.bLight, dot: darkMode ? "#888" : T.bSand, label: status };

  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 11px", borderRadius:20,
      background:cfg.bg, color:cfg.color,
      fontSize:12, fontWeight:700, letterSpacing:".1px", whiteSpace:"nowrap",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
};

const ApplicantStatusBadge = ({ status }) => {
  const cfg = {
    pending:  { bg:"#fef9c3", color:"#a16207", label:"Pending"  },
    accepted: { bg:"#dcfce7", color:"#15803d", label:"Accepted" },
    rejected: { bg:"#fee2e2", color:"#b91c1c", label:"Rejected" },
  }[status] || { bg:"#f3f4f6", color:"#6b7280", label: status };

  return (
    <span style={{
      padding:"3px 9px", borderRadius:20,
      background:cfg.bg, color:cfg.color,
      fontSize:11, fontWeight:700, whiteSpace:"nowrap",
    }}>
      {cfg.label}
    </span>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, title, isDeleting, darkMode }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,.6)", backdropFilter:"blur(6px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }} onClick={onClose}>
      <div className="modal-wrap" style={{
        background: darkMode ? "#1e1e1e" : "#fff", borderRadius:20, padding:"32px 36px",
        maxWidth:420, width:"90%",
        boxShadow: darkMode ? "0 32px 80px rgba(0,0,0,.8)" : "0 32px 80px rgba(0,0,0,.3)",
        color: darkMode ? "#eee" : "#000",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width:48, height:48, borderRadius:14,
          background:"#fee2e2", display:"flex",
          alignItems:"center", justifyContent:"center", marginBottom:18,
        }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:800, margin:"0 0 8px" }}>
          Delete Opportunity
        </h3>
        <p style={{ fontSize:14, lineHeight:1.65, margin:"0 0 28px" }}>
          Are you sure you want to delete <strong>"{title}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onClose} disabled={isDeleting} style={{
            flex:1, padding:"12px", borderRadius:10,
            border:`1.5px solid ${darkMode ? "#555" : T.bSand}`, background:"transparent",
            color: darkMode ? "#ccc" : T.textMid, fontSize:14, fontWeight:600, cursor:"pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} style={{
            flex:1, padding:"12px", borderRadius:10,
            border:"none", background:"#ef4444",
            color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer",
            boxShadow:"0 4px 14px rgba(239,68,68,.35)",
          }}>{isDeleting ? "Deleting…" : "Delete"}</button>
        </div>
      </div>
    </div>
  );
};

const NgoDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const navigate = useNavigate();
  const [opportunities, setOpportunities]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [deletingId, setDeletingId]         = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [oppToDelete, setOppToDelete]       = useState(null);
  const [matches, setMatches]               = useState({});
  const [conversations, setConversations]   = useState([]);
  const [convoLoading, setConvoLoading]     = useState(true);
  const [updatingApplicant, setUpdatingApplicant] = useState(null);

  const topVolunteers = Object.values(matches)
    .flat()
    .reduce((acc, m) => {
      const id = String(m.volunteer._id);
      if (!acc.find((v) => String(v.volunteer._id) === id)) acc.push(m);
      return acc;
    }, [])
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const fetchMatchesForOpp = async (oppId) => {
    try {
      const res = await API.get(`/matches/${oppId}`);
      return res.data.matches || [];
    } catch (err) {
      console.error("Match fetch error:", err);
      return [];
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getAllOpportunitiesForNgo();
      const opps = response.data.opportunities || [];
      setOpportunities(opps);

      const matchData = {};
      for (let opp of opps) {
        const matched = await fetchMatchesForOpp(opp._id);
        matchData[opp._id] = matched.sort((a, b) => b.matchScore - a.matchScore);
      }
      setMatches(matchData);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
      setError("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setConvoLoading(true);
      const res = await API.get("/messages");
      setConversations(res.data?.conversations || []);
    } catch (err) {
      setConversations([]);
    } finally {
      setConvoLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchOpportunities();
      fetchConversations();
    }
  }, [authLoading, user]);

  const handleDeleteClick  = (opp) => { setOppToDelete(opp); setShowDeleteModal(true); };

  const handleConfirmDelete = async () => {
    if (!oppToDelete) return;
    setDeletingId(oppToDelete._id);
    try {
      await deleteOpportunity(oppToDelete._id);
      setOpportunities(opportunities.filter(o => o._id !== oppToDelete._id));
      setShowDeleteModal(false);
      setOppToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete opportunity");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateApplicantStatus = async (opportunityId, volunteerId, status) => {
    const key = `${opportunityId}-${volunteerId}`;
    setUpdatingApplicant(key);
    try {
      await updateApplicationStatus(opportunityId, volunteerId, status);
      setOpportunities(prev =>
        prev.map(opp => {
          if (opp._id !== opportunityId) return opp;
          return {
            ...opp,
            applicants: opp.applicants.map(a =>
              a.user?._id?.toString() === volunteerId.toString() ||
              a.user?.toString() === volunteerId.toString()
                ? { ...a, status }
                : a
            ),
          };
        })
      );
    } catch (err) {
      console.error("Failed to update applicant status:", err);
      setError(err.response?.data?.message || "Failed to update applicant status");
    } finally {
      setUpdatingApplicant(null);
    }
  };

  if (authLoading || loading) return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"100vh", fontFamily:font,
      background:"linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
    }}>
      <p style={{ color:"rgba(255,255,255,.4)", fontSize:14 }}>Loading…</p>
    </div>
  );

  const stats = [
    { label:"Total",  value:opportunities.length,                               accent:T.bMid    },
    { label:"Open",   value:opportunities.filter(o=>o.status==="open").length,  accent:T.gDark   },
    { label:"Closed", value:opportunities.filter(o=>o.status==="closed").length,accent:"#ef4444" },
  ];

  const orgInfo = [
    { label:"Email",    value:user?.email    || "—" },
    { label:"Location", value:user?.location || "—" },
    { label:"Bio",      value:user?.bio      || "—" },
    { label:"Role",     value:"NGO"                  },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:font, color: darkMode ? "#eee" : "#000" }}>
      <style>{css}</style>
      <Sidebar />
      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto", position:"relative" }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
            <div style={{
              width:44, height:44, borderRadius:12, flexShrink:0,
              background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Building2 size={20} color="rgba(255,255,255,.7)" />
            </div>
            <div>
              <h1 style={{ fontFamily:serif, fontSize:26, fontWeight:800, color:"#fff", margin:0, letterSpacing:"-.3px" }}>
                NGO Dashboard
              </h1>
              <p style={{ fontSize:13.5, color:"rgba(255,255,255,.45)", margin:0 }}>
                Welcome back, <strong style={{ color:"rgba(255,255,255,.75)", fontWeight:600 }}>{user?.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:14, marginBottom:24 }}>
          {stats.map(({ label, value, accent }, i) => (
            <div key={label} className="ngo-card" style={{
              borderRadius:16, background: darkMode ? "#1e1e1e" : "#fff",
              borderTop:`3px solid ${accent}`, padding:"20px 22px",
              boxShadow: darkMode
                ? "0 2px 8px rgba(0,0,0,.6), 0 4px 16px rgba(0,0,0,.4)"
                : "0 2px 8px rgba(0,0,0,.25), 0 4px 16px rgba(0,0,0,.18)",
              animationDelay:`${i*0.06}s`,
              color: darkMode ? "#eee" : T.textDark,
            }}>
              <div style={{ fontFamily:serif, fontSize:32, fontWeight:900, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:12, color: darkMode ? "#ccc" : T.textSoft, fontWeight:600, marginTop:6, textTransform:"uppercase", letterSpacing:".5px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Org Profile */}
        <div className="ngo-card" style={{
          borderRadius:18, background: darkMode ? "#1e1e1e" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4)" : "0 2px 8px rgba(0,0,0,.22)",
          padding:"26px 30px", marginBottom:18,
          position:"relative", overflow:"hidden", animationDelay:"0.1s",
          color: darkMode ? "#eee" : T.textDark,
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.bMid}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 16px", paddingBottom:12, borderBottom:`1px solid ${darkMode ? "#555" : T.bPale}` }}>
            Organization Profile
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px,1fr))", gap:"14px 28px" }}>
            {orgInfo.map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize:11, fontWeight:700, color: darkMode ? "#ccc" : T.bLight, textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:14, color: darkMode ? "#eee" : T.textDark, fontWeight:500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Volunteers */}
        <div className="ngo-card" style={{
          borderRadius:18, background: darkMode ? "#1e1e1e" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4)" : "0 2px 8px rgba(0,0,0,.22)",
          padding:"26px 30px", marginBottom:18,
          position:"relative", overflow:"hidden", animationDelay:"0.12s",
          color: darkMode ? "#eee" : T.textDark,
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.gDark}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${darkMode ? "#555" : T.bPale}` }}>
            <Users size={16} color={T.gDark} />
            <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:0 }}>Recommended Volunteers</h2>
            {topVolunteers.length > 0 && (
              <span style={{ marginLeft:"auto", fontSize:12, color: darkMode ? "#aaa" : T.textSoft }}>
                {topVolunteers.length} top match{topVolunteers.length !== 1 ? "es" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <p style={{ fontSize:13, opacity:0.5 }}>Loading matches…</p>
          ) : topVolunteers.length === 0 ? (
            <p style={{ fontSize:13, opacity:0.5 }}>No volunteer matches yet. Create opportunities to find matches.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {topVolunteers.map((m) => (
                <div key={m.volunteer._id} className="vol-row" style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"12px 14px", borderRadius:12,
                  border:`1px solid ${darkMode ? "#444" : T.bSand}`,
                  background: darkMode ? "#2a2a2a" : T.bPale,
                  flexWrap:"wrap",
                }}>
                  <div style={{
                    width:40, height:40, borderRadius:10, flexShrink:0,
                    background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:serif, fontSize:16, fontWeight:800, color:"#fff",
                  }}>
                    {m.volunteer.name?.charAt(0).toUpperCase() || "V"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color: darkMode ? "#fff" : T.bDark }}>
                      {m.volunteer.name}
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap", alignItems:"center" }}>
                      {m.volunteer.location && (
                        <span style={{ fontSize:11.5, color: darkMode ? "#aaa" : T.textSoft, display:"flex", alignItems:"center", gap:3 }}>
                          <MapPin size={10} /> {m.volunteer.location}
                        </span>
                      )}
                      {m.volunteer.skills?.slice(0, 3).map((s, idx) => (
                        <span key={idx} style={{
                          padding:"2px 8px", borderRadius:20,
                          background: darkMode ? "#333" : T.gPale,
                          color: darkMode ? "#ccc" : T.gDark,
                          fontSize:11, fontWeight:500,
                          border:`1px solid ${darkMode ? "#555" : T.gSage}`,
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                    <span style={{
                      fontSize:12, fontWeight:700, color:"#15803d",
                      background:"#dcfce7", padding:"3px 9px", borderRadius:20,
                      border:"1px solid #bbf7d0",
                    }}>
                      {m.matchScore}% match
                    </span>
                    <button
                      className="btn-msg-volunteer"
                      onClick={() => navigate("/messages", {
                        state: { preSelectUserId: m.volunteer._id, preSelectUserName: m.volunteer.name }
                      })}
                      style={{
                        padding:"6px 13px",
                        background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                        color:"#fff", border:"none", borderRadius:8,
                        fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:font,
                        boxShadow:`0 3px 10px rgba(46,125,50,.3)`,
                      }}
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversations */}
        <div className="ngo-card" style={{
          borderRadius:18, background: darkMode ? "#1e1e1e" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4)" : "0 2px 8px rgba(0,0,0,.22)",
          padding:"26px 30px", marginBottom:18,
          position:"relative", overflow:"hidden", animationDelay:"0.13s",
          color: darkMode ? "#eee" : T.textDark,
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.bMid}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${darkMode ? "#555" : T.bPale}` }}>
            <MessageSquare size={16} color={T.gDark} />
            <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:0 }}>Messages</h2>
            {conversations.length > 0 && (
              <span style={{ marginLeft:"auto", fontSize:12, color: darkMode ? "#aaa" : T.textSoft }}>
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {convoLoading ? (
            <p style={{ fontSize:13, opacity:0.5 }}>Loading conversations…</p>
          ) : conversations.length === 0 ? (
            <p style={{ fontSize:13, opacity:0.5 }}>No messages yet. Volunteers can message you from the Opportunities page.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {conversations.map((convo) => (
                <div
                  key={convo.user._id}
                  className="convo-row"
                  onClick={() => navigate("/messages", {
                    state: { preSelectUserId: convo.user._id, preSelectUserName: convo.user.name }
                  })}
                  style={{
                    display:"flex", alignItems:"center", gap:14,
                    padding:"12px 14px", borderRadius:12,
                    border:`1px solid ${darkMode ? "#444" : T.bSand}`,
                    background: darkMode ? "#2a2a2a" : T.bPale,
                  }}
                >
                  <div style={{
                    width:38, height:38, borderRadius:10, flexShrink:0,
                    background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <MessageSquare size={16} color="#fff" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color: darkMode ? "#fff" : T.bDark }}>
                      {convo.user.name || "Volunteer"}
                    </div>
                    <div style={{ fontSize:12, color: darkMode ? "#aaa" : T.textSoft, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {convo.lastMessage || "No messages yet"}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color: darkMode ? "#888" : T.textSoft, flexShrink:0 }}>
                    {convo.createdAt ? new Date(convo.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create CTA */}
        <div className="ngo-card" style={{
          borderRadius:18, background: darkMode ? "#1e1e1e" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4)" : "0 2px 8px rgba(0,0,0,.22)",
          padding:"22px 30px", marginBottom:18,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16,
          position:"relative", overflow:"hidden", animationDelay:"0.15s",
          color: darkMode ? "#eee" : T.textDark,
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.gDark}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <div>
            <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 3px" }}>Post an Opportunity</h2>
            <p style={{ fontSize:13, color: darkMode ? "#ccc" : T.textSoft, margin:0 }}>Create recycling drives, collection events, and volunteer opportunities.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate("/create-opportunity")} style={{
            display:"inline-flex", alignItems:"center", gap:7, padding:"11px 20px",
            background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
            color:"#fff", border:"none", borderRadius:10,
            fontSize:13.5, fontWeight:600, fontFamily:font, cursor:"pointer",
            boxShadow:`0 4px 14px rgba(46,125,50,.3)`,
          }}>
            <Plus size={15} /> Create Opportunity
          </button>
        </div>

        {/* Opportunities List */}
        <div className="ngo-card" style={{
          borderRadius:18, background: darkMode ? "#1e1e1e" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4)" : "0 2px 8px rgba(0,0,0,.22)",
          padding:"26px 30px", marginBottom:20,
          position:"relative", overflow:"hidden", animationDelay:"0.2s",
          color: darkMode ? "#eee" : T.textDark,
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.bMid}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${darkMode ? "#555" : T.bPale}` }}>
            <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:0 }}>All Opportunities</h2>
            <span style={{ fontSize:12.5, color: darkMode ? "#ccc" : T.textSoft, fontWeight:500 }}>{opportunities.length} total</span>
          </div>

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#c62828", borderRadius:10, padding:"10px 14px", fontSize:13.5, marginBottom:14 }}>
              {error}
            </div>
          )}

          {opportunities.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 0", gap:10 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:T.bPale, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
                <Plus size={22} color={T.bLight} />
              </div>
              <p style={{ fontSize:14.5, fontWeight:600, color: darkMode ? "#ccc" : T.textMid, margin:0 }}>No opportunities yet</p>
              <p style={{ fontSize:13, color: darkMode ? "#aaa" : T.bLight, margin:0 }}>Click "Create Opportunity" above to get started</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {opportunities.map((opp, i) => (
                <div key={opp._id} className="ngo-opp-row" style={{
                  padding:"16px 18px", borderRadius:12,
                  border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                  background: darkMode ? "#2a2a2a" : "#fdfaf6",
                  animationDelay:`${0.2 + i*0.04}s`,
                  color: darkMode ? "#eee" : T.textDark,
                }}>

                  {/* Title + action buttons — wraps on small screens */}
                  <div className="opp-header">
                    <div className="opp-title-block">
                      <h3 style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color: darkMode ? "#fff" : T.bDark }}>{opp.title}</h3>
                      <p style={{
                        margin:0, fontSize:13, color: darkMode ? "#ccc" : T.textMid, lineHeight:1.5,
                        display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
                      }}>{opp.description}</p>
                    </div>
                    <div className="opp-action-block">
                      <StatusBadge status={opp.status} darkMode={darkMode} />
                      <button className="btn-edit" onClick={() => navigate(`/edit-opportunity/${opp._id}`)}
                        disabled={deletingId === opp._id}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:5,
                          padding:"6px 11px", borderRadius:8,
                          border:`1.5px solid ${T.gSage}`, background:T.gPale,
                          color:T.gDark, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:font,
                        }}>
                        <Pencil size={11} /> Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteClick(opp)}
                        disabled={deletingId === opp._id}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:5,
                          padding:"6px 11px", borderRadius:8,
                          border:"1.5px solid #fecaca", background:"#fef2f2",
                          color:"#c62828", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:font,
                        }}>
                        <Trash2 size={11} /> {deletingId === opp._id ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {opp.requiredSkills?.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                      {opp.requiredSkills.map((skill, idx) => (
                        <span key={idx} style={{
                          padding:"3px 9px", borderRadius:20,
                          background: darkMode ? "#333" : T.gPale, color: darkMode ? "#eee" : T.gDark,
                          fontSize:11.5, fontWeight:500, border:`1px solid ${darkMode ? "#555" : T.gSage}`,
                        }}>{skill}</span>
                      ))}
                    </div>
                  )}

                  {/* ── APPLICANTS PANEL ── */}
                  {opp.applicants?.length > 0 && (
                    <div style={{
                      marginTop:12, padding:"14px 16px",
                      background: darkMode ? "#333" : "#f8fdf8",
                      borderRadius:12,
                      border:`1px solid ${darkMode ? "#444" : T.gSage}`,
                    }}>
                      {/* Panel header */}
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                        <Users size={13} color={darkMode ? "#81c784" : T.gDark} />
                        <span style={{ fontSize:12, fontWeight:700, color: darkMode ? "#81c784" : T.gDark, textTransform:"uppercase", letterSpacing:".6px" }}>
                          Applicants ({opp.applicants.length})
                        </span>
                      </div>

                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {opp.applicants.map((applicant) => {
                          const volunteerId = applicant.user?._id || applicant.user;
                          const key = `${opp._id}-${volunteerId}`;
                          const isBusy = updatingApplicant === key;

                          return (
                            <div key={String(volunteerId)} className="applicant-row" style={{
                              padding:"10px 12px", borderRadius:10,
                              background: darkMode ? "#3a3a3a" : "#fff",
                              border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                            }}>
                              {/*
                                Responsive inner layout:
                                - Row on ≥541px (avatar + name on left, badges + buttons on right)
                                - Stacks to two lines on <540px via flex-wrap
                              */}
                              <div className="applicant-inner">

                                {/* Avatar + name */}
                                <div className="applicant-info">
                                  <div style={{
                                    width:32, height:32, borderRadius:8, flexShrink:0,
                                    background:`linear-gradient(135deg, ${T.gMid}40, ${T.gDark}30)`,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    fontSize:13, fontWeight:700, color: darkMode ? "#81c784" : T.gDark,
                                  }}>
                                    {(applicant.name || applicant.user?.name || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div style={{ minWidth:0 }}>
                                    <div style={{ fontSize:13.5, fontWeight:600, color: darkMode ? "#fff" : T.bDark, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                                      {applicant.name || applicant.user?.name || "Volunteer"}
                                    </div>
                                    {applicant.location && (
                                      <div style={{ fontSize:11, color: darkMode ? "#aaa" : T.textSoft, display:"flex", alignItems:"center", gap:3, marginTop:2 }}>
                                        <MapPin size={9} /> {applicant.location}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Status badge + action buttons */}
                                <div className="applicant-actions">
                                  <ApplicantStatusBadge status={applicant.status} />

                                  {applicant.status === "pending" && (
                                    <>
                                      <button
                                        className="btn-accept"
                                        disabled={isBusy}
                                        onClick={() => handleUpdateApplicantStatus(opp._id, volunteerId, "accepted")}
                                        style={{
                                          display:"inline-flex", alignItems:"center", gap:4,
                                          padding:"5px 11px", borderRadius:7, border:"none",
                                          background:"#16a34a", color:"#fff",
                                          fontSize:12, fontWeight:600,
                                          cursor: isBusy ? "wait" : "pointer",
                                          opacity: isBusy ? 0.6 : 1, fontFamily:font,
                                          whiteSpace:"nowrap",
                                        }}
                                      >
                                        <CheckCircle size={12} />
                                        {isBusy ? "…" : "Accept"}
                                      </button>
                                      <button
                                        className="btn-reject"
                                        disabled={isBusy}
                                        onClick={() => handleUpdateApplicantStatus(opp._id, volunteerId, "rejected")}
                                        style={{
                                          display:"inline-flex", alignItems:"center", gap:4,
                                          padding:"5px 11px", borderRadius:7, border:"none",
                                          background:"#dc2626", color:"#fff",
                                          fontSize:12, fontWeight:600,
                                          cursor: isBusy ? "wait" : "pointer",
                                          opacity: isBusy ? 0.6 : 1, fontFamily:font,
                                          whiteSpace:"nowrap",
                                        }}
                                      >
                                        <XCircle size={12} />
                                        {isBusy ? "…" : "Reject"}
                                      </button>
                                    </>
                                  )}

                                  <button
                                    onClick={() => navigate("/messages", {
                                      state: {
                                        preSelectUserId: String(volunteerId),
                                        preSelectUserName: applicant.name || applicant.user?.name || "Volunteer",
                                      }
                                    })}
                                    style={{
                                      display:"inline-flex", alignItems:"center", gap:4,
                                      padding:"5px 11px", borderRadius:7, border:"none",
                                      background: darkMode ? "#2e7d32" : T.gPale,
                                      color: darkMode ? "#fff" : T.gDark,
                                      fontSize:12, fontWeight:600, cursor:"pointer",
                                      fontFamily:font, whiteSpace:"nowrap",
                                    }}
                                  >
                                    <MessageSquare size={12} /> Message
                                  </button>
                                </div>

                              </div>{/* /applicant-inner */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Location / duration footer */}
                  <div style={{ display:"flex", gap:14, fontSize:12, color: darkMode ? "#ccc" : T.textSoft, marginTop:10, flexWrap:"wrap" }}>
                    {opp.location && <span style={{ display:"flex", alignItems:"center", gap:4 }}><MapPin size={11} />{opp.location}</span>}
                    {opp.duration && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={11} />{opp.duration}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setOppToDelete(null); }}
          onConfirm={handleConfirmDelete}
          title={oppToDelete?.title}
          isDeleting={deletingId !== null}
          darkMode={darkMode}
        />
      </main>
    </div>
  );
};

export default NgoDashboard;