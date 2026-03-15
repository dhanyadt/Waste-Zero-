import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getAllOpportunitiesForNgo, deleteOpportunity } from "../services/api";
import { Plus, Pencil, Trash2, MapPin, Clock, AlertTriangle, Building2 } from "lucide-react";
import { getOpportunityApplicants } from "../services/api";

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
      fontSize:12, fontWeight:700, letterSpacing:".1px", whiteSpace:"nowrap",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, title, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,.6)", backdropFilter:"blur(6px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }} onClick={onClose}>
      <div className="modal-wrap" style={{
        background:"#fff", borderRadius:20, padding:"32px 36px",
        maxWidth:420, width:"90%",
        boxShadow:"0 32px 80px rgba(0,0,0,.3)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width:48, height:48, borderRadius:14,
          background:"#fee2e2", display:"flex",
          alignItems:"center", justifyContent:"center", marginBottom:18,
        }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:800, color:T.bDark, margin:"0 0 8px" }}>
          Delete Opportunity
        </h3>
        <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.65, margin:"0 0 28px" }}>
          Are you sure you want to delete <strong style={{color:T.textDark}}>"{title}"</strong>?
          This action cannot be undone.
        </p>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onClose} disabled={isDeleting} style={{
            flex:1, padding:"12px", borderRadius:10,
            border:`1.5px solid ${T.bSand}`, background:"transparent",
            color:T.textMid, fontSize:14, fontWeight:600,
            fontFamily:font, cursor:"pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} style={{
            flex:1, padding:"12px", borderRadius:10,
            border:"none", background:"#ef4444",
            color:"#fff", fontSize:14, fontWeight:600,
            fontFamily:font, cursor:"pointer",
            boxShadow:"0 4px 14px rgba(239,68,68,.35)",
          }}>{isDeleting ? "Deleting…" : "Delete"}</button>
        </div>
      </div>
    </div>
  );
};

const NgoDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [applicants, setApplicants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [oppToDelete, setOppToDelete] = useState(null);

  const fetchOpportunities = async () => {
  try {
    const response = await getAllOpportunitiesForNgo();
    const opps = response.data.opportunities || [];

    setOpportunities(opps);

    const data = {};

    for (let opp of opps) {
      try {
        const res = await getOpportunityApplicants(opp._id);
        data[opp._id] = res.data.applicants || [];
      } catch (err) {
        data[opp._id] = [];
      }
    }

    setApplicants(data);

  } catch (err) {
    console.error("Failed to fetch opportunities:", err);
    setError("Failed to load opportunities");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!authLoading && user) fetchOpportunities();
  }, [authLoading, user]);

  const handleDeleteClick = (opp) => { setOppToDelete(opp); setShowDeleteModal(true); };

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
    { label:"Total",       value:opportunities.length,                                              accent:T.bMid   },
    { label:"Open",        value:opportunities.filter(o=>o.status==="open").length,                 accent:T.gDark  },
    { label:"In Progress", value:opportunities.filter(o=>o.status==="in-progress").length,          accent:"#eab308"},
    { label:"Closed",      value:opportunities.filter(o=>o.status==="closed").length,               accent:"#ef4444"},
  ];

  const orgInfo = [
    { label:"Email",    value:user?.email    || "—" },
    { label:"Location", value:user?.location || "—" },
    { label:"Bio",      value:user?.bio      || "—" },
    { label:"Role",     value:"NGO"                  },
  ];

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
      background:"linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
      backgroundImage:[
        "radial-gradient(ellipse at 0% 0%, rgba(27,94,32,.25) 0%, transparent 45%)",
        "radial-gradient(ellipse at 100% 100%, rgba(62,39,35,.22) 0%, transparent 45%)",
        "radial-gradient(ellipse at 55% 35%, rgba(67,160,71,.08) 0%, transparent 50%)",
        "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
      ].join(", "),
    }}>
      <style>{css}</style>
      <Sidebar />
      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
            <div style={{
              width:44, height:44, borderRadius:12, flexShrink:0,
              background:"rgba(255,255,255,.08)",
              border:"1px solid rgba(255,255,255,.12)",
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
              borderRadius:16, background:"#fff",
              borderTop:`3px solid ${accent}`,
              padding:"20px 22px",
              boxShadow:"0 2px 8px rgba(0,0,0,.25), 0 4px 16px rgba(0,0,0,.18)",
              animationDelay:`${i*0.06}s`,
            }}>
              <div style={{ fontFamily:serif, fontSize:32, fontWeight:900, color:T.bDark, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:12, color:T.textSoft, fontWeight:600, marginTop:6, textTransform:"uppercase", letterSpacing:".5px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Org Profile */}
        <div className="ngo-card" style={{
          borderRadius:18, background:"#fff",
          border:`1px solid ${T.bSand}`,
          boxShadow:"0 2px 8px rgba(0,0,0,.22), 0 8px 24px rgba(0,0,0,.18)",
          padding:"26px 30px", marginBottom:18,
          position:"relative", overflow:"hidden",
          animationDelay:"0.1s",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.bMid}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:T.bDark, margin:"0 0 16px", paddingBottom:12, borderBottom:`1px solid ${T.bPale}` }}>
            Organization Profile
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px,1fr))", gap:"14px 28px" }}>
            {orgInfo.map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize:11, fontWeight:700, color:T.bLight, textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:14, color:T.textDark, fontWeight:500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Create CTA */}
        <div className="ngo-card" style={{
          borderRadius:18, background:"#fff",
          border:`1px solid ${T.bSand}`,
          boxShadow:"0 2px 8px rgba(0,0,0,.22), 0 8px 24px rgba(0,0,0,.18)",
          padding:"22px 30px", marginBottom:18,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16,
          position:"relative", overflow:"hidden",
          animationDelay:"0.15s",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.gDark}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <div>
            <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:T.bDark, margin:"0 0 3px" }}>Post an Opportunity</h2>
            <p style={{ fontSize:13, color:T.textSoft, margin:0 }}>Create recycling drives, collection events, and volunteer opportunities.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate("/create-opportunity")} style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"11px 20px",
            background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
            color:"#fff", border:"none", borderRadius:10,
            fontSize:13.5, fontWeight:600, fontFamily:font, cursor:"pointer",
            boxShadow:`0 4px 14px rgba(46,125,50,.3)`,
          }}>
            <Plus size={15} /> Create Opportunity
          </button>
        </div>

        {/* Opportunities */}
        <div className="ngo-card" style={{
          borderRadius:18, background:"#fff",
          border:`1px solid ${T.bSand}`,
          boxShadow:"0 2px 8px rgba(0,0,0,.22), 0 8px 24px rgba(0,0,0,.18)",
          padding:"26px 30px", marginBottom:20,
          position:"relative", overflow:"hidden",
          animationDelay:"0.2s",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.bMid}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.bPale}` }}>
            <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:T.bDark, margin:0 }}>All Opportunities</h2>
            <span style={{ fontSize:12.5, color:T.textSoft, fontWeight:500 }}>{opportunities.length} total</span>
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
              <p style={{ fontSize:14.5, fontWeight:600, color:T.textMid, margin:0 }}>No opportunities yet</p>
              <p style={{ fontSize:13, color:T.bLight, margin:0 }}>Click "Create Opportunity" above to get started</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {opportunities.map((opp, i) => (
                <div key={opp._id} className="ngo-opp-row" style={{
                  padding:"16px 18px", borderRadius:12,
                  border:`1px solid ${T.bSand}`, background:"#fdfaf6",
                  animationDelay:`${0.2 + i*0.04}s`,
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <h3 style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color:T.bDark }}>{opp.title}</h3>
                      <p style={{
                        margin:0, fontSize:13, color:T.textMid, lineHeight:1.5,
                        display:"-webkit-box", WebkitLineClamp:2,
                        WebkitBoxOrient:"vertical", overflow:"hidden",
                      }}>{opp.description}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
                      <StatusBadge status={opp.status} />
                      <button className="btn-edit" onClick={() => navigate(`/edit-opportunity/${opp._id}`)}
                        disabled={deletingId === opp._id}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:5,
                          padding:"6px 11px", borderRadius:8,
                          border:`1.5px solid ${T.gSage}`, background:T.gPale,
                          color:T.gDark, fontSize:12, fontWeight:600,
                          cursor:"pointer", fontFamily:font,
                        }}>
                        <Pencil size={11} /> Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteClick(opp)}
                        disabled={deletingId === opp._id}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:5,
                          padding:"6px 11px", borderRadius:8,
                          border:"1.5px solid #fecaca", background:"#fef2f2",
                          color:"#c62828", fontSize:12, fontWeight:600,
                          cursor:"pointer", fontFamily:font,
                        }}>
                        <Trash2 size={11} /> {deletingId === opp._id ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>

                  
                   
{/* Required Skills */}
{opp.requiredSkills?.length > 0 && (
  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
    {opp.requiredSkills.map((skill, idx) => (
      <span
        key={idx}
        style={{
          padding:"3px 9px",
          borderRadius:20,
          background:T.gPale,
          color:T.gDark,
          fontSize:11.5,
          fontWeight:500,
          border:`1px solid ${T.gSage}`,
        }}
      >
        {skill}
      </span>
    ))}
  </div>
)}

{/* Applicants Skill Match */}
{applicants[opp._id]?.length > 0 && (
  <div style={{ marginTop:8 }}>
    {applicants[opp._id].slice(0,3).map((app, i) => (
      <div key={i} style={{ fontSize:12.5 }}>
        {app.name} —
        <span style={{ color:"#16a34a", fontWeight:600 }}>
          {" "}{app.matchPercent}% match
        </span>
      </div>
    ))}
  </div>
)}


                  <div style={{ display:"flex", gap:14, fontSize:12, color:T.textSoft }}>
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
        />
      </main>
    </div>
  );
};

export default NgoDashboard;