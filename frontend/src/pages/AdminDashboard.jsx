import { useEffect, useState } from "react";
import { Users, Users2, Target, Loader2, Clock, Shield, ShieldCheck, Sun, Moon } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
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
  .admin-card { animation: fadeUp .3s ease both; }
  .admin-log-row { transition: box-shadow .2s, transform .2s; }
  .admin-log-row:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1) !important; transform: translateY(-2px); }
  .btn-primary { transition: all .2s !important; }
  .btn-primary:hover { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 8px 22px rgba(46,125,50,.45) !important; }
`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => setDarkMode(!darkMode);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, logsRes] = await Promise.all([
          API.get("/admin/overview"),
          API.get("/admin/logs")
        ]);
        setStats(overviewRes.data.data);
        setLogs(logsRes.data.logs);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"100vh", fontFamily:font,
      background: darkMode ? "#1e1e1e" : "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
    }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: darkMode ? "#81c784" : "#43a047" }} />
        <p style={{ color: darkMode ? "#ccc" : "rgba(255,255,255,.8)", fontSize:16 }}>Loading Admin Dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"100vh", fontFamily:font,
      background: darkMode ? "#1e1e1e" : "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
    }}>
      <div style={{
        textAlign:"center", padding:"40px 32px", maxWidth:420, 
        background: darkMode ? "#2a2a2a" : "#fff",
        borderRadius:20, boxShadow: darkMode ? "0 20px 60px rgba(0,0,0,.6)" : "0 20px 60px rgba(0,0,0,.3)",
        color: darkMode ? "#eee" : "#000",
      }}>
        <div style={{
          width:60, height:60, margin:"0 auto 20px",
          background:"#fee2e2", borderRadius:16,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Shield size={28} color="#ef4444" />
        </div>
        <h2 style={{ fontFamily:serif, fontSize:24, fontWeight:800, margin:"0 0 12px" }}>
          Dashboard Error
        </h2>
        <p style={{ fontSize:15, lineHeight:1.6, margin:"0 0 24px", color: darkMode ? "#ccc" : "#666" }}>
          {error}. Please refresh or check server.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
          style={{
            padding:"12px 28px", borderRadius:12, border:"none",
            background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
            color:"#fff", fontSize:14, fontWeight:600, fontFamily:font, cursor:"pointer",
            boxShadow:`0 6px 20px rgba(67,160,71,.4)`,
          }}
        >
          Retry Loading
        </button>
      </div>
    </div>
  );

  const adminStats = [
    { label:"Total Users", value:stats.totalUsers || 0, icon:Users, accent:T.gMid },
    { label:"NGOs", value:stats.ngos || 0, icon:Users2, accent:T.bMid },
    { label:"Volunteers", value:stats.volunteers || 0, icon:Users2, accent:T.gDark },
    { label:"Opportunities", value:stats.totalOpportunities || 0, icon:Target, accent:"#eab308" },
  ];

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
      background: darkMode 
        ? "#1a1a1a"
        : "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
      color: darkMode ? "#eee" : "#000"
    }}>
      <style>{css}</style>
      <Sidebar />
      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto", position:"relative" }}>

        {/* Dark/Light Toggle */}
        <button onClick={toggleTheme} style={{
          position:"absolute", top:24, right:24,
          display:"flex", alignItems:"center", gap:6,
          padding:"8px 16px", borderRadius:12, border:"none",
          background: darkMode ? "rgba(255,255,255,.1)" : "#fff",
          color: darkMode ? "#eee" : "#333", fontWeight:600, fontSize:13,
          backdropFilter:"blur(10px)", cursor:"pointer",
          boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,.4)" : "0 2px 10px rgba(0,0,0,.2)",
        }}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? "Light" : "Dark"}
        </button>

        {/* Header */}
        <div style={{ marginBottom:36 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
            <div style={{
              width:52, height:52, borderRadius:16, flexShrink:0,
              background: darkMode ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.15)",
              border:"1px solid rgba(255,255,255,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <ShieldCheck size={24} color={darkMode ? "#81c784" : "#43a047"} />
            </div>
            <div>
              <h1 style={{ 
                fontFamily:serif, fontSize:32, fontWeight:900, 
                background: darkMode ? "linear-gradient(135deg, #81c784, #4ade80)" : "linear-gradient(135deg, #fff, #f0f9f0)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                margin:0, letterSpacing:"-0.02em"
              }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize:14, color: darkMode ? "#aaa" : "rgba(255,255,255,.6)", margin:4 }}>
                Platform overview and recent activity
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", 
          gap:16, marginBottom:28 
        }}>
          {adminStats.map(({ label, value, icon: Icon, accent }, i) => (
            <div key={label} className="admin-card" style={{
              borderRadius:20, background: darkMode ? "#2a2a2a" : "#fff",
              borderTop:`4px solid ${accent}`,
              padding:"28px 24px",
              boxShadow: darkMode 
                ? "0 8px 32px rgba(0,0,0,.6), 0 12px 48px rgba(0,0,0,.4)" 
                : "0 4px 20px rgba(0,0,0,.15), 0 8px 32px rgba(0,0,0,.1)",
              animationDelay:`${i*0.08}s`,
              color: darkMode ? "#eee" : T.textDark,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <div style={{
                  width:44, height:44, borderRadius:12,
                  background: darkMode ? `rgba(255,255,255,.08)` : `${accent}20`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <div style={{ fontSize:32, fontFamily:serif, fontWeight:900, lineHeight:1, color: darkMode ? "#fff" : "#000" }}>
                  {value.toLocaleString()}
                </div>
              </div>
              <div style={{ 
                fontSize:13, color: darkMode ? "#aaa" : T.textSoft, 
                fontWeight:600, textTransform:"uppercase", 
                letterSpacing:".8px", lineHeight:1.3
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="admin-card" style={{
          borderRadius:24, background: darkMode ? "#2a2a2a" : "#fff",
          border:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
          boxShadow: darkMode ? "0 12px 48px rgba(0,0,0,.5), 0 20px 80px rgba(0,0,0,.3)" : "0 8px 32px rgba(0,0,0,.12), 0 12px 48px rgba(0,0,0,.08)",
          padding:"36px 40px", position:"relative", overflow:"hidden",
          animationDelay:"0.2s",
          color: darkMode ? "#eee" : T.textDark,
          maxWidth: "none"
        }}>
          <div style={{ 
            position:"absolute", top:0, left:0, right:0, height:4, 
            background:`linear-gradient(90deg, ${T.gDark}, ${T.bMid}, ${T.gMid})`, 
            borderRadius:"24px 24px 0 0" 
          }} />
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, paddingBottom:16, borderBottom:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bPale}` }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:`rgba(129,199,132,.2)`, display:"flex",
              alignItems:"center", justifyContent:"center",
            }}>
              <Clock size={20} style={{ color: T.gDark }} />
            </div>
            <div>
              <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:800, margin:0 }}>
                Recent Activity
              </h2>
              <p style={{ fontSize:14, color: darkMode ? "#aaa" : T.textSoft, margin:4 }}>
                {logs.length} recent actions
              </p>
            </div>
          </div>

          <div style={{ maxHeight:"500px", overflowY:"auto", paddingRight:8 }}>
            {logs.slice(0, 12).map((log, index) => (
              <div key={log._id || index} className="admin-log-row" style={{
                padding:"20px 24px", borderRadius:16, marginBottom:12,
                border:`1px solid ${darkMode ? "rgba(255,255,255,.08)" : T.bSand}`,
                background: darkMode ? "#333" : "#fdfaf6",
                transition:"all .2s ease",
                color: darkMode ? "#eee" : T.textDark,
              }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                  <div style={{
                    width:4, height:4, borderRadius:"50%",
                    background: T.gMid, flexShrink:0, marginTop:6
                  }} />
                  <div style={{ flex:1 }}>
                    <p style={{ 
                      fontSize:15, fontWeight:600, margin:"0 0 4px",
                      color: darkMode ? "#fff" : T.bDark
                    }}>
                      {log.action}
                    </p>
                    <p style={{ 
                      fontSize:13, color: darkMode ? "#aaa" : T.textSoft,
                      margin:0
                    }}>
                      {log.user || 'System'} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                padding:"60px 24px", color: darkMode ? "#888" : T.textSoft
              }}>
                <Clock size={48} style={{ opacity:0.5, marginBottom:16 }} />
                <p style={{ fontSize:16, fontWeight:500, margin:0 }}>No recent activity</p>
                <p style={{ fontSize:13, marginTop:4 }}>Activity feed will appear here</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;

