import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import API from "../services/api";
import { Search, User, Users, ShieldAlert, ShieldCheck, Filter, Eye, RotateCcw } from "lucide-react";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047", gLight:"#81c784",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8", oDark:"#dc2626",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};
const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .user-card { animation: fadeUp .3s ease both; }
  .user-row:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(0,0,0,.12) !important; }
`;

const StatusBadge = ({ status, darkMode }) => {
  const cfg = {
    active: { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Active" },
    suspended: { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Suspended" }
  }[status] || { bg: darkMode ? "#555" : T.bPale, color:"#666", dot:"#ccc", label:status };
  
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"4px 12px", borderRadius:20, fontSize:13, fontWeight:600,
      background:cfg.bg, color:cfg.color, whiteSpace:"nowrap"
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId) => {
    try {
      await API.patch(`/admin/users/${userId}/status`);
      fetchUsers(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) &&
    (!roleFilter || user.role === roleFilter) &&
    (!statusFilter || user.status === statusFilter)
  );

  const roleOptions = ["", "volunteer", "ngo", "admin"];
  const statusOptions = ["", "active", "suspended"];

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
      background: darkMode ? "#1a1a1a" : "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
      color: darkMode ? "#eee" : "#000"
    }}>
      <style>{css}</style>
      <Sidebar />
      
      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto", position:"relative" }}>
        
        {/* Dark Mode Toggle */}
        <button onClick={() => setDarkMode(!darkMode)} style={{
          position:"absolute", top:24, right:24, zIndex:100,
          padding:"8px 16px", borderRadius:12, border:"none",
          background: darkMode ? "rgba(255,255,255,.1)" : "#fff",
          color: darkMode ? "#eee" : "#333", fontWeight:600, cursor:"pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,.2)", backdropFilter:"blur(10px)"
        }}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{
              width:52, height:52, borderRadius:16, flexShrink:0,
              background: darkMode ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.15)",
              display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,.2)"
            }}>
              <Users size={24} color={darkMode ? "#81c784" : "#43a047"} />
            </div>
            <div>
              <h1 style={{ 
                fontFamily:serif, fontSize:32, fontWeight:900,
                background: darkMode ? "linear-gradient(135deg, #81c784 0%, #4ade80)" : "linear-gradient(135deg, #fff 0%, #f0f9f0)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:0
              }}>
                User Management
              </h1>
              <p style={{ fontSize:14, color: darkMode ? "#aaa" : "rgba(255,255,255,.6)", margin:4 }}>
                Manage {users.length} users • {filteredUsers.length} shown
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: darkMode ? "#2a2a2a" : "#fff",
          borderRadius:20, padding:"28px 32px", marginBottom:28,
          border: `1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
          boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)"
        }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:16, alignItems:"end" }}>
            <div style={{ flex:1, minWidth:240 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, fontSize:13, color: darkMode ? "#aaa" : T.textSoft }}>
                <Search size={16} /> Search users
              </div>
              <div style={{
                padding:"12px 16px", borderRadius:12, border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                background: darkMode ? "#333" : "#f8fafc", fontSize:15
              }}>
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email..." 
                  style={{ border:"none", outline:"none", background:"transparent", width:"100%", color:"inherit" }}
                />
              </div>
            </div>

            <div style={{ minWidth:160 }}>
              <div style={{ fontSize:13, color: darkMode ? "#aaa" : T.textSoft, marginBottom:8 }}>Role</div>
              <select 
                value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                style={{
                  padding:"12px 16px", borderRadius:12, border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                  background: darkMode ? "#333" : "#f8fafc", color:"inherit", width:"100%"
                }}
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>{role || "All Roles"}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth:180 }}>
              <div style={{ fontSize:13, color: darkMode ? "#aaa" : T.textSoft, marginBottom:8 }}>Status</div>
              <select 
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{
                  padding:"12px 16px", borderRadius:12, border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                  background: darkMode ? "#333" : "#f8fafc", color:"inherit", width:"100%"
                }}
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s || "All Status"}</option>
                ))}
              </select>
            </div>

            <button onClick={fetchUsers} disabled={loading} style={{
              padding:"12px 24px", borderRadius:12, border:"none",
              background: `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`, color:"#fff",
              fontWeight:600, cursor: loading ? "wait" : "pointer",
              display:"flex", alignItems:"center", gap:8,
              boxShadow: "0 4px 20px rgba(67,160,71,.4)"
            }}>
              <RotateCcw size={18} /> Refresh
            </button>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"80px 32px", color: darkMode ? "#666" : T.textSoft }}>
            <Users size={64} style={{ opacity:0.5, marginBottom:20, margin:"0 auto" }} />
            <p style={{ fontSize:18, fontWeight:500 }}>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{
            background: darkMode ? "#2a2a2a" : "#fff",
            borderRadius:24, padding:"80px 64px", textAlign:"center",
            border:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`
          }}>
            <User size={72} style={{ color: darkMode ? "#666" : T.textSoft, marginBottom:24 }} />
            <h3 style={{ fontFamily:serif, fontSize:24, fontWeight:700, margin:"0 0 8px", color: darkMode ? "#ccc" : T.textMid }}>
              No users found
            </h3>
            <p style={{ fontSize:15, color: darkMode ? "#888" : T.textSoft }}>
              {search || roleFilter || statusFilter ? "Try adjusting your filters" : "No users yet"}
            </p>
          </div>
        ) : (
          <div style={{ display:"grid", gap:16 }}>
            {filteredUsers.map((user, i) => (
              <div key={user._id} className="user-card" style={{
                background: darkMode ? "#2a2a2a" : "#fff",
                borderRadius:20, padding:"28px 32px",
                border:`1px solid ${darkMode ? "rgba(255,255,255,.08)" : T.bSand}`,
                boxShadow: "0 8px 32px rgba(0,0,0,.08)",
                animationDelay: `${i * 0.05}s`,
                transition: "all .25s ease"
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{
                      width:56, height:56, borderRadius:16, overflow:"hidden",
                      background: `linear-gradient(135deg, ${T.gMid}20, ${T.bMid}20)`,
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}>
                      <User size={24} style={{ color: T.gDark }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize:20, fontWeight:700, margin:"0 0 4px", color: darkMode ? "#fff" : T.textDark }}>
                        {user.name}
                      </h3>
                      <p style={{ fontSize:14, color: darkMode ? "#aaa" : T.textMid, margin:0 }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={user.status} darkMode={darkMode} />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:20, marginBottom:24 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color: darkMode ? "#aaa" : T.textSoft, marginBottom:6, textTransform:"uppercase" }}>Role</div>
                    <div style={{ fontSize:15, fontWeight:600, color: darkMode ? "#eee" : T.textDark }}>
                      {user.role}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color: darkMode ? "#aaa" : T.textSoft, marginBottom:6, textTransform:"uppercase" }}>Location</div>
                    <div style={{ fontSize:15, color: darkMode ? "#eee" : T.textDark }}>
                      {user.location || "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color: darkMode ? "#aaa" : T.textSoft, marginBottom:6, textTransform:"uppercase" }}>Joined</div>
                    <div style={{ fontSize:15, color: darkMode ? "#ccc" : T.textMid }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                  <button onClick={() => navigate(`/admin/users/${user._id}`)} style={{
                    padding:"10px 20px", borderRadius:10, border:`1px solid ${T.gSage}`,
                    background:T.gPale, color:T.gDark, fontWeight:600, cursor:"pointer",
                    display:"flex", alignItems:"center", gap:6, fontSize:14,
                    transition:"all .2s"
                  }}>
                    <Eye size={16} /> View Profile
                  </button>
                  <button onClick={() => toggleStatus(user._id)} style={{
                    padding:"10px 20px", borderRadius:10, border:"none",
                    background: user.status === "active" ? "#fee2e2" : `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                    color: user.status === "active" ? T.oDark : "#fff", fontWeight:600, cursor:"pointer",
                    fontSize:14,
                    transition:"all .2s"
                  }}>
                    {user.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminUsers;
