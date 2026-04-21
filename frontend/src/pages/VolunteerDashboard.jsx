import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// ✅ FIXED IMPORT
import { getAllOpportunities, getMyApplications } from "../services/api";
import { getMatches } from "../services/api";
import { ArrowRight, MapPin, Clock, Building2, User, Sun, Moon } from "lucide-react";

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
  .vol-card { animation: fadeUp .3s ease both; }
  .vol-app-row { transition: box-shadow .2s, transform .2s; }
  .vol-app-row:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1) !important; transform: translateY(-2px); }
  .btn-primary { transition: all .2s !important; }
  .btn-primary:hover { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 8px 22px rgba(46,125,50,.45) !important; }
  .btn-primary:active { transform:translateY(0) !important; }
`;

const StatusBadge = ({ status, darkMode }) => {
  const cfg = {
    pending:  { bg:"#fef9c3", color:"#a16207", dot:"#eab308", label:"Pending"  },
    accepted: { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Accepted" },
    rejected: { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Rejected" },
  }[status] || { bg:darkMode ? "#555" : T.bPale, color:darkMode ? "#eee" : T.bLight, dot:darkMode ? "#888" : T.bSand, label:status };

  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:20, background:cfg.bg, color:cfg.color, fontSize:12, fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const OppStatusBadge = ({ status, darkMode }) => {
  const cfg = {
    open:{ bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Open" },
    closed:{ bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Closed" },
    "in-progress":{ bg:"#fef9c3", color:"#a16207", dot:"#eab308", label:"In Progress" },
  }[status] || { bg:darkMode ? "#555" : T.bPale, color:darkMode ? "#eee" : T.bLight, dot:darkMode ? "#888" : T.bSand, label:status };

  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:20, background:cfg.bg, color:cfg.color, fontSize:12, fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const VolunteerDashboard = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  
  const fetchData = async () => {
  try {
    setLoadingData(true);

    const appResponse = await getMyApplications();
    setApplications(appResponse.data.applications || []);

    const oppResponse = await getAllOpportunities();
    setOpportunities(oppResponse.data.opportunities || []);

    // NEW
    const matchResponse = await getMatches();
    setMatches(matchResponse.data.matches || []);

  } catch (err) {
    console.error("Failed to fetch data:", err);
    setError("Failed to load data");
  } finally {
    setLoadingData(false);
  }
};

  useEffect(() => {
  if (!user) return;
  fetchData();
}, [user]);

  if (loading || loadingData) return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"100vh", fontFamily:font,
      background: darkMode ? "#222" : "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
    }}>
      <p style={{ color:"rgba(255,255,255,.4)", fontSize:14 }}>Loading…</p>
    </div>
  );

  const stats = [
    { label:"My Applications", value:applications.length, accent:T.gMid },
    { label:"Accepted", value:applications.filter(a=>a.applicationStatus==="accepted").length, accent:"#22c55e" },
    { label:"Pending", value:applications.filter(a=>a.applicationStatus==="pending").length, accent:"#eab308" },
    { label:"My Opportunities", value:opportunities.length, accent:T.bMid },
  ];

  const summary = [
    { label:"Email", value:user?.email || "—" },
    { label:"Skills", value:user?.skills?.join(", ") || "—" },
    { label:"Location", value:user?.location || "—" },
    { label:"Role", value:"Volunteer" },
  ];

  const acceptedCount = applications?.filter(app => 
    app.applicants?.some(a => a.user === user?._id && a.status === "accepted")
  ).length || 0;

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
    }}>
      <style>{css}</style>
      <Sidebar />
      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto", position:"relative" }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
            <div style={{
              width:44, height:44, borderRadius:12, flexShrink:0,
              background: darkMode ? "rgba(255,255,255,.15)" : "#fff",
              border:"1px solid rgba(255,255,255,.12)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {/* ✅ FIX: icon visible in both modes */}
              <User size={20} color={darkMode ? "#e8f5e9" : "#1a2e1a"} />
            </div>
            <div>
              <h1 style={{ fontFamily:serif, fontSize:26, fontWeight:800, color:"#fff", margin:0, letterSpacing:"-.3px" }}>
                Volunteer Dashboard
              </h1>
              <p style={{ fontSize:13.5, color: darkMode ? "#aaa" : "rgba(255,255,255,.45)", margin:0 }}>
                Welcome back, <strong style={{ color: darkMode ? "#fff" : "rgba(255,255,255,.75)", fontWeight:600 }}>{user?.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:14, marginBottom:24 }}>
          {stats.map(({ label, value, accent }, i) => (
            <div key={label} className="vol-card" style={{
              borderRadius:16, background: darkMode ? "#333" : "#fff",
              borderTop:`3px solid ${accent}`,
              padding:"20px 22px",
              boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)" : "0 2px 8px rgba(0,0,0,.25), 0 4px 16px rgba(0,0,0,.18)",
              animationDelay:`${i*0.06}s`,
              color: darkMode ? "#eee" : T.textDark,
            }}>
              <div style={{ fontFamily:serif, fontSize:32, fontWeight:900, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:12, color: darkMode ? "#ccc" : T.textSoft, fontWeight:600, marginTop:6, textTransform:"uppercase", letterSpacing:".5px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Profile Summary */}
        <div className="vol-card" style={{
          borderRadius:18, background: darkMode ? "#333" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)" : "0 2px 8px rgba(0,0,0,.22), 0 8px 24px rgba(0,0,0,.18)",
          padding:"26px 30px", marginBottom:18,
          position:"relative", overflow:"hidden",
          animationDelay:"0.1s",
          color: darkMode ? "#eee" : T.textDark,
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.gDark}, ${T.gMid}, ${T.bMid})`, borderRadius:"18px 18px 0 0" }} />
          <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 16px", paddingBottom:12, borderBottom:`1px solid ${darkMode ? "#555" : T.bPale}` }}>
            Profile Summary
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:"14px 28px" }}>
            {summary.map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize:11, fontWeight:700, color: darkMode ? "#ccc" : T.bLight, textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:14, fontWeight:500, color: darkMode ? "#eee" : T.textDark }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Browse CTA */}
        <div className="vol-card" style={{
          borderRadius:18, background: darkMode ? "#333" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)" : "0 2px 8px rgba(0,0,0,.22), 0 8px 24px rgba(0,0,0,.18)",
          padding:"22px 30px", marginBottom:18,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16,
          position:"relative", overflow:"hidden",
          animationDelay:"0.15s",
          color: darkMode ? "#eee" : T.textDark,
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.gDark}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <div>
            <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 3px" }}>Browse Opportunities</h2>
            <p style={{ fontSize:13, color: darkMode ? "#ccc" : T.textSoft, margin:0 }}>Find recycling drives and initiatives near you.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate("/opportunities")} style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"11px 20px",
            background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
            color:"#fff", border:"none", borderRadius:10,
            fontSize:13.5, fontWeight:600, fontFamily:font, cursor:"pointer",
            boxShadow:`0 4px 14px rgba(46,125,50,.3)`,
          }}>
            View All Opportunities <ArrowRight size={14} />
          </button>
        </div>

        {/* 🔥 Recommended Opportunities */}
        <div className="vol-card" style={{
          borderRadius:18,
          background: darkMode ? "#333" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode
            ? "0 2px 8px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)"
            : "0 2px 8px rgba(0,0,0,.22), 0 8px 24px rgba(0,0,0,.18)",
          padding:"26px 30px",
          marginBottom:18,
          color: darkMode ? "#eee" : T.textDark, // ✅ FIX: outer card text color
        }}>

          <h2 style={{
            fontFamily:serif,
            fontSize:16,
            fontWeight:700,
            marginBottom:16,
            color: darkMode ? "#eee" : T.textDark, // ✅ FIX: heading visible in dark
          }}>
             Recommended For You
          </h2>

          {matches.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No matches found.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {matches.map((item, i) => {
                const opp = item.opportunity;
                return (
                  <div key={opp._id} style={{
                    padding:"16px",
                    borderRadius:"12px",
                    border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                    background: darkMode ? "#444" : "#fdfaf6",
                  }}>

                    {/* ✅ FIX: all text inside card uses darkMode-aware colors */}
                    <h3 style={{ margin:"0 0 5px", color: darkMode ? "#fff" : T.bDark }}>
                      {opp.title}
                    </h3>

                    <p style={{ fontSize:"13px", margin:0, color: darkMode ? "#ccc" : T.textMid, opacity: darkMode ? 1 : 0.8 }}>
                      {opp.description}
                    </p>

                    <div style={{ marginTop:"8px", fontWeight:"600", color:"#4ade80" }}>
                       {item.matchScore}% Match
                    </div>

                    <div style={{ fontSize:"12px", marginTop:"4px", color: darkMode ? "#ccc" : T.textSoft }}>
                      Skills: {item.matchingSkills.join(", ") || "—"}
                    </div>

                    <div style={{ display:"flex", gap:8, marginTop:"10px" }}>
                      <button
                        onClick={() => navigate(`/opportunities/${opp._id}`)}
                        style={{
                          flex:1, padding:"8px 14px", borderRadius:"8px",
                          border:"none", background:"#2e7d32",
                          color:"#fff", cursor:"pointer", fontWeight:600, fontSize:13,
                        }}
                      >
                        View & Apply
                      </button>
                      <button
                        onClick={() => navigate("/messages", {
                          state: {
                            preSelectUserId: opp.createdBy?._id || opp.ngo?._id,
                            preSelectUserName: opp.ngo?.name || "NGO",
                          }
                        })}
                        style={{
                          flex:1, padding:"8px 14px", borderRadius:"8px",
                          border:"none", background:"#b91c1c",
                          color:"#fff", cursor:"pointer", fontWeight:600, fontSize:13,
                        }}
                      >
                        💬 Message
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Applications */}
        <div className="vol-card" style={{
          borderRadius:18, background: darkMode ? "#333" : "#fff",
          border:`1px solid ${darkMode ? "#555" : T.bSand}`,
          boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)" : "0 2px 8px rgba(0,0,0,.22), 0 8px 24px rgba(0,0,0,.18)",
          padding:"26px 30px", marginBottom:20,
          position:"relative", overflow:"hidden",
          animationDelay:"0.2s",
          color: darkMode ? "#eee" : T.textDark,
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.bMid}, ${T.gMid})`, borderRadius:"18px 18px 0 0" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${darkMode ? "#555" : T.bPale}` }}>
            <h2 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:0 }}>My Applications</h2>
            <span style={{ fontSize:12.5, color: darkMode ? "#ccc" : T.textSoft, fontWeight:500 }}>{applications.length} total</span>
          </div>

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#c62828", borderRadius:10, padding:"10px 14px", fontSize:13.5, marginBottom:14 }}>
              {error}
            </div>
          )}

          {applications.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 0", gap:10 }}>
              <div style={{ width:52, height:52, borderRadius:14, background: darkMode ? "#555" : T.gPale, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 }}>
                <ArrowRight size={22} color={darkMode ? "#eee" : T.gDark} />
              </div>
              <p style={{ fontSize:14.5, fontWeight:600, color: darkMode ? "#ccc" : T.textMid, margin:0 }}>No applications yet</p>
              <p style={{ fontSize:13, color: darkMode ? "#aaa" : T.bLight, margin:0 }}>Browse opportunities and apply to get started</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {applications.map((app, i) => (
                <div key={app._id} className="vol-app-row" style={{
                  padding:"16px 18px", borderRadius:12,
                  border:`1px solid ${darkMode ? "#555" : T.bSand}`, background: darkMode ? "#444" : "#fdfaf6",
                  animationDelay:`${0.2 + i*0.04}s`,
                  color: darkMode ? "#eee" : T.textDark,
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <h3 style={{ margin:"0 0 3px", fontSize:15, fontWeight:700, color: darkMode ? "#fff" : T.bDark }}>{app.title}</h3>
                      <p style={{
                        margin:0, fontSize:13, color: darkMode ? "#ccc" : T.textMid, lineHeight:1.5,
                        display:"-webkit-box", WebkitLineClamp:2,
                        WebkitBoxOrient:"vertical", overflow:"hidden",
                      }}>{app.description}</p>
                    </div>
                    <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                      <OppStatusBadge status={app.status} darkMode={darkMode} />
                      <StatusBadge status={app.applicationStatus} darkMode={darkMode} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:14, fontSize:12, color: darkMode ? "#ccc" : T.textSoft }}>
                    {app.location && <span style={{ display:"flex", alignItems:"center", gap:4 }}><MapPin size={11} />{app.location}</span>}
                    {app.duration && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={11} />{app.duration}</span>}
                    {app.ngo?.name && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Building2 size={11} />{app.ngo.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default VolunteerDashboard;