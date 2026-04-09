import { useEffect, useState } from "react";
import { Users, Users2, Target, Loader2, Clock, Shield, ShieldCheck, Sun, Moon, Trophy, ArrowRight } from "lucide-react";
import AdminSidebar from "../components/layout/AdminSidebar";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

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
  .admin-card { animation: fadeUp .3s ease both; }
  .admin-log-row { transition: box-shadow .2s, transform .2s; }
  .admin-log-row:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1) !important; transform: translateY(-2px); }
  .rank-row { transition: background .15s; cursor:pointer; }
  .rank-row:hover { background: rgba(67,160,71,.08) !important; }
`;

const formatAction = (action = "") => {
  const map = {
    USER_SUSPENDED:      "Suspended a user",
    USER_ACTIVATED:      "Activated a user",
    OPPORTUNITY_DELETED: "Deleted an opportunity",
  };
  return map[action.toUpperCase()] || action;
};

// Ranked list panel — scrollable
const RankedList = ({ title, subtitle, accentColor, badgeColor, badgeBg, items, renderValue, darkMode }) => (
  <div className="admin-card" style={{
    borderRadius:20, background: darkMode ? "#2a2a2a" : "#fff",
    border:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
    padding:"28px", animationDelay:"0.28s",
    boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
    borderLeft:`4px solid ${accentColor}`,
    display:"flex", flexDirection:"column",
  }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:`${accentColor}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Trophy size={18} color={accentColor} />
      </div>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color: darkMode ? "#fff" : T.textDark }}>{title}</div>
        <div style={{ fontSize:11, color: darkMode ? "#888" : T.textSoft }}>{subtitle}</div>
      </div>
    </div>

    {items.length === 0 ? (
      <p style={{ fontSize:14, color: darkMode ? "#666" : T.textSoft, margin:0 }}>No data yet.</p>
    ) : (
      <div style={{ overflowY:"auto", maxHeight:320, display:"flex", flexDirection:"column", gap:6 }}>
        {items.map((item, i) => (
          <div key={item._id || i} className="rank-row" style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"12px 14px", borderRadius:12,
            background: darkMode ? "#333" : T.bPale,
          }}>
            {/* Rank number */}
            <div style={{
              width:28, height:28, borderRadius:8, flexShrink:0,
              background: i === 0 ? "#fbbf24" : i === 1 ? "#d1d5db" : i === 2 ? "#cd7c2f" : `${accentColor}20`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:800,
              color: i < 3 ? "#fff" : accentColor,
            }}>
              {i + 1}
            </div>

            {/* Avatar initial */}
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:`linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:14, fontWeight:700, color:accentColor,
            }}>
              {item.name?.charAt(0).toUpperCase() || "?"}
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:600, color: darkMode ? "#fff" : T.textDark, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {item.name || "Unknown"}
              </div>
              <div style={{ fontSize:11, color: darkMode ? "#aaa" : T.textSoft, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {item.email || item.location || ""}
              </div>
            </div>

            <span style={{
              padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:700,
              background:badgeBg, color:badgeColor, flexShrink:0, whiteSpace:"nowrap",
            }}>
              {renderValue(item)}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats]   = useState({});
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const navigate = useNavigate();

  const [topNgos, setTopNgos]             = useState([]);
  const [topVolunteers, setTopVolunteers] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, logsRes] = await Promise.all([
          API.get("/admin/overview"),
          API.get("/admin/logs?limit=12"),
        ]);
        setStats(overviewRes.data.data || {});
        setLogs(logsRes.data.logs || []);

        const reportsRes = await API.get("/admin/reports");
        const rpts = reportsRes.data.reports || {};
        setTopNgos(rpts.opportunities?.opportunitiesByNGO || []);
        setTopVolunteers(rpts.messages?.topActiveVolunteers || []);
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
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:font,
      background:"linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color:"#43a047" }} />
        <p style={{ color:"rgba(255,255,255,.8)", fontSize:16 }}>Loading Admin Dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:font,
      background:"linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)" }}>
      <div style={{ textAlign:"center", padding:"40px 32px", maxWidth:420, background:"#fff", borderRadius:20 }}>
        <Shield size={28} color="#ef4444" style={{ marginBottom:16 }} />
        <h2 style={{ fontFamily:serif, fontSize:22, margin:"0 0 12px" }}>Dashboard Error</h2>
        <p style={{ color:"#666", marginBottom:20 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{
          padding:"10px 24px", borderRadius:10, border:"none",
          background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
          color:"#fff", fontWeight:600, cursor:"pointer",
        }}>Retry</button>
      </div>
    </div>
  );

  const summaryCards = [
    { label:"Total Users",   value: stats.totalUsers         || 0, icon:Users,  accent:T.gMid },
    { label:"Active NGOs",   value: stats.activeNgos         || 0, icon:Users2, accent:"#1976d2" },
    { label:"Volunteers",    value: stats.activeVolunteers   || 0, icon:Users2, accent:"#7b1fa2" },
    { label:"Opportunities", value: stats.totalOpportunities || 0, icon:Target, accent:"#eab308" },
  ];


  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:font }}>
      <style>{css}</style>
      <AdminSidebar />

      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto", position:"relative" }}>

        {/*  Header — solid white title always, no gradient that disappears in dark mode */}
        <div style={{ marginBottom:36, display:"flex", alignItems:"center", gap:16 }}>
          <div style={{
            width:52, height:52, borderRadius:16, flexShrink:0,
            background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <ShieldCheck size={24} color="#43a047" />
          </div>
          <div>
            {/*  Plain solid white — visible on both dark bg and dark mode bg */}
            <h1 style={{
              fontFamily:serif, fontSize:32, fontWeight:900,
              color: "#fff",
              margin:0, letterSpacing:"-.02em",
            }}>Admin Dashboard</h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", margin:4 }}>
              Platform overview and recent activity
            </p>
          </div>
        </div>

        {/* Summary stat cards — respect darkMode like AdminUsers does */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:28 }}>
          {summaryCards.map(({ label, value, icon:Icon, accent }, i) => (
            <div key={label} className="admin-card" style={{
              borderRadius:20,
              background: darkMode ? "#2a2a2a" : "#fff",   // ✅ dark: #2a2a2a, light: white
              borderTop:`4px solid ${accent}`,
              padding:"28px 24px",
              boxShadow: darkMode
                ? "0 8px 32px rgba(0,0,0,.5)"
                : "0 4px 20px rgba(0,0,0,.12)",
              animationDelay:`${i * 0.07}s`,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${accent}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon size={20} style={{ color:accent }} />
                </div>
                {/*  Number colour follows dark mode */}
                <div style={{ fontSize:32, fontFamily:serif, fontWeight:900, color: darkMode ? "#fff" : "#000" }}>
                  {value.toLocaleString()}
                </div>
              </div>
              {/* Label colour follows dark mode */}
              <div style={{ fontSize:12, color: darkMode ? "#aaa" : T.textSoft, fontWeight:600, textTransform:"uppercase", letterSpacing:".8px" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Ranked lists — unchanged */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
          <RankedList
            title="Top NGOs"
            subtitle="by opportunities created"
            accentColor="#1976d2"
            badgeColor="#1e40af"
            badgeBg="#dbeafe"
            items={topNgos}
            renderValue={item => `${item.count} opps`}
            darkMode={darkMode}
          />
          <RankedList
            title="Top Volunteers"
            subtitle="by applications submitted"
            accentColor="#7b1fa2"
            badgeColor="#6b21a8"
            badgeBg="#f3e8ff"
            items={topVolunteers}
            renderValue={item => `${item.count} apps`}
            darkMode={darkMode}
          />
        </div>

        {/* Recent Activity — unchanged */}
        <div className="admin-card" style={{
          borderRadius:24, background: darkMode ? "#2a2a2a" : "#fff",
          border:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
          boxShadow: darkMode ? "0 12px 48px rgba(0,0,0,.5)" : "0 8px 32px rgba(0,0,0,.1)",
          padding:"36px 40px", position:"relative", overflow:"hidden",
          animationDelay:"0.42s",
        }}>
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:4,
            background:`linear-gradient(90deg, ${T.gDark}, ${T.bMid}, ${T.gMid})`,
            borderRadius:"24px 24px 0 0",
          }} />

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, paddingBottom:16, borderBottom:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bPale}` }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"rgba(129,199,132,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Clock size={20} style={{ color:T.gDark }} />
            </div>
            <div>
              <h2 style={{ fontFamily:serif, fontSize:20, fontWeight:800, margin:0, color: darkMode ? "#fff" : T.textDark }}>Recent Activity</h2>
              <p style={{ fontSize:14, color: darkMode ? "#aaa" : T.textSoft, margin:4 }}>{logs.length} recent actions</p>
            </div>
            <button onClick={() => navigate("/admin/logs")} style={{
              marginLeft:"auto", padding:"8px 16px", borderRadius:10, border:"none",
              background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
              color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer",
              display:"flex", alignItems:"center", gap:6,
              boxShadow:"0 4px 12px rgba(67,160,71,.3)",
            }}>
              View All <ArrowRight size={13}/>
            </button>
          </div>

          <div style={{ maxHeight:460, overflowY:"auto", paddingRight:8 }}>
            {logs.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 24px", color: darkMode ? "#888" : T.textSoft }}>
                <Clock size={48} style={{ opacity:.4, marginBottom:16 }}/>
                <p style={{ fontSize:16, fontWeight:500, margin:0 }}>No recent activity</p>
                <p style={{ fontSize:13, marginTop:4 }}>Activity feed will appear here once admin actions are taken</p>
              </div>
            ) : logs.map((log, idx) => (
              <div key={log._id || idx} className="admin-log-row" style={{
                padding:"18px 22px", borderRadius:14, marginBottom:10,
                border:`1px solid ${darkMode ? "rgba(255,255,255,.07)" : T.bSand}`,
                background: darkMode ? "#333" : "#fdfaf6",
              }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:T.gMid, flexShrink:0, marginTop:6 }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:600, margin:"0 0 4px", color: darkMode ? "#fff" : T.bDark }}>
                      {formatAction(log.action)}
                    </p>
                    <p style={{ fontSize:13, color: darkMode ? "#aaa" : T.textSoft, margin:0 }}>
                      {log.adminId?.name || "System"} • {new Date(log.createdAt).toLocaleString()}
                    </p>
                    {log.details && (
                      <p style={{ fontSize:12, color: darkMode ? "#777" : T.textSoft, margin:"4px 0 0" }}>{log.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;