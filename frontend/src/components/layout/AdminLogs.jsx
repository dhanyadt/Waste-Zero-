import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "./AdminSidebar";
import API from "../../services/api";
import { Clock, Shield, RotateCcw, Search } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const T = {
  gDark:"#2e7d32", gMid:"#43a047", gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};
const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .log-row { animation: fadeUp .25s ease both; transition: box-shadow .2s, transform .2s; }
  .log-row:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1) !important; transform: translateY(-1px); }
`;

const ACTION_CFG = {
  USER_SUSPENDED:      { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Suspended user" },
  USER_ACTIVATED:      { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Activated user" },
  OPPORTUNITY_DELETED: { bg:"#fef9c3", color:"#a16207", dot:"#eab308", label:"Deleted opportunity" },
};

const ActionBadge = ({ action }) => {
  const cfg = ACTION_CFG[(action || "").toUpperCase()] ||
    { bg:T.bPale, color:"#666", dot:"#ccc", label: action || "Unknown" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600,
      background:cfg.bg, color:cfg.color, whiteSpace:"nowrap",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
};

const AdminLogs = () => {
  const [logs, setLogs]             = useState([]);
  const [pagination, setPagination] = useState({ current:1, pages:1, total:0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/logs?page=${page}&limit=15`);
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { current:1, pages:1, total:0 });
    } catch (err) {
      console.error("Logs fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(currentPage); }, [currentPage, fetchLogs]);

  const filtered = logs.filter(log => {
    if (actionFilter && (log.action || "").toUpperCase() !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const searchable = [log.adminId?.name, log.adminId?.email, log.details, log.action, log.targetType]
        .map(v => (v || "").toLowerCase()).join(" ");
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
    }}>
      <style>{css}</style>
      <AdminSidebar />

      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto", position:"relative" }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{
              width:52, height:52, borderRadius:16, flexShrink:0,
              background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Clock size={24} color="#43a047" />
            </div>
            <div>
              
              <h1 style={{ fontFamily:serif, fontSize:32, fontWeight:900, color:"#fff", margin:0 }}>
                Admin Activity Logs
              </h1>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", margin:4 }}>
                {pagination.total} total actions • page {pagination.current} of {pagination.pages}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: darkMode ? "#2a2a2a" : "#fff",
          borderRadius:20, padding:"24px 28px", marginBottom:24,
          border:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
          boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
        }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, alignItems:"flex-end" }}>
            <div style={{ flex:1, minWidth:220 }}>
              <div style={{ fontSize:12, color: darkMode ? "#aaa" : T.textSoft, marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                <Search size={14}/> Search
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Admin name, details..."
                style={{
                  width:"100%", padding:"10px 14px", borderRadius:10,
                  border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                  background: darkMode ? "#333" : "#f8fafc",
                  color: darkMode ? "#eee" : T.textDark,
                  fontSize:14, outline:"none", boxSizing:"border-box",
                }}
              />
            </div>
            <div style={{ minWidth:200 }}>
              <div style={{ fontSize:12, color: darkMode ? "#aaa" : T.textSoft, marginBottom:6 }}>Action type</div>
              <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{
                padding:"10px 14px", borderRadius:10,
                border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                background: darkMode ? "#333" : "#f8fafc",
                color: darkMode ? "#eee" : T.textDark, width:"100%", fontSize:14,
              }}>
                <option value="">All actions</option>
                <option value="USER_SUSPENDED">Suspended user</option>
                <option value="USER_ACTIVATED">Activated user</option>
                <option value="OPPORTUNITY_DELETED">Deleted opportunity</option>
              </select>
            </div>
            <button onClick={() => fetchLogs(currentPage)} disabled={loading} style={{
              padding:"10px 20px", borderRadius:10, border:"none",
              background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
              color:"#fff", fontWeight:600, cursor: loading ? "wait" : "pointer",
              display:"flex", alignItems:"center", gap:8, fontSize:14,
              boxShadow:"0 4px 14px rgba(67,160,71,.4)",
            }}>
              <RotateCcw size={16}/> Refresh
            </button>
          </div>
        </div>

        {/* Log rows */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"80px 0", color: darkMode ? "#666" : T.textSoft }}>
            <Clock size={56} style={{ opacity:.4, display:"block", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:17 }}>Loading logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: darkMode ? "#2a2a2a" : "#fff",
            borderRadius:20, padding:"60px", textAlign:"center",
            border:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
          }}>
            <Shield size={60} style={{ color:T.textSoft, opacity:.5, display:"block", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:16, color: darkMode ? "#888" : T.textSoft }}>No logs found.</p>
          </div>
        ) : (
          <div style={{ display:"grid", gap:10 }}>
            {filtered.map((log, i) => (
              <div key={log._id} className="log-row" style={{
                background: darkMode ? "#2a2a2a" : "#fff",
                borderRadius:16, padding:"20px 24px",
                border:`1px solid ${darkMode ? "rgba(255,255,255,.08)" : T.bSand}`,
                boxShadow:"0 2px 12px rgba(0,0,0,.06)",
                animationDelay:`${i * 0.03}s`,
                display:"flex", alignItems:"flex-start", gap:16,
              }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:T.gMid, flexShrink:0, marginTop:8 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
                    <ActionBadge action={log.action} />
                    <span style={{ fontSize:13, color: darkMode ? "#aaa" : T.textSoft }}>
                      by <strong style={{ color: darkMode ? "#ddd" : T.textDark }}>
                        {log.adminId?.name || log.adminId?.email || "System"}
                      </strong>
                    </span>
                    <span style={{ fontSize:12, color: darkMode ? "#666" : T.textSoft, marginLeft:"auto" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <p style={{ fontSize:13, color: darkMode ? "#999" : T.textMid, margin:0 }}>{log.details}</p>
                  )}
                  <div style={{ fontSize:11, color: darkMode ? "#666" : T.textSoft, marginTop:4 }}>
                    {log.targetType} • ID: ...{String(log.targetId || "").slice(-6)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:28 }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
              <button key={pageNum} onClick={() => setCurrentPage(pageNum)} style={{
                padding:"8px 14px", borderRadius:9, border:"none", fontSize:13, fontWeight:600,
                cursor:"pointer",
                background: pageNum === currentPage
                  ? `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`
                  : darkMode ? "#333" : T.bPale,
                color: pageNum === currentPage ? "#fff" : darkMode ? "#ccc" : T.textMid,
                boxShadow: pageNum === currentPage ? "0 4px 12px rgba(67,160,71,.4)" : "none",
              }}>
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLogs;