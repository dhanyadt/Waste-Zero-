import { useEffect, useState, useCallback } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import API from "../services/api";
import { Search, User, Users, RotateCcw, Eye, X, MapPin, Mail, Calendar, Shield, ChevronLeft, ChevronRight } from "lucide-react";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047", gLight:"#81c784",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037",
  bPale:"#efebe9", bSand:"#d7ccc8", oDark:"#dc2626",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};
const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";
const PAGE_SIZE = 10;

const css = `
  @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes modalIn { from{opacity:0;transform:scale(.96)}        to{opacity:1;transform:scale(1)} }
  .user-card     { animation: fadeUp .3s ease both; }
  .profile-modal { animation: modalIn .2s ease both; }
  .page-btn { transition: all .15s; }
  .page-btn:hover:not(:disabled) { transform: translateY(-1px); }
`;

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const cfg = {
    active:    { bg:"#dcfce7", color:"#15803d", dot:"#22c55e", label:"Active" },
    suspended: { bg:"#fee2e2", color:"#b91c1c", dot:"#ef4444", label:"Suspended" },
  }[s] || { bg:T.bPale, color:"#666", dot:"#ccc", label: status || "Unknown" };

  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"4px 12px", borderRadius:20, fontSize:13, fontWeight:600,
      background:cfg.bg, color:cfg.color,
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const ProfileModal = ({ user, onClose, darkMode }) => {
  if (!user) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div className="profile-modal" onClick={e => e.stopPropagation()} style={{
        background: darkMode ? "#2a2a2a" : "#fff",
        borderRadius:24, padding:"40px 36px", width:"100%", maxWidth:460,
        boxShadow:"0 24px 80px rgba(0,0,0,.35)", position:"relative",
      }}>
        <button onClick={onClose} style={{
          position:"absolute", top:16, right:16,
          width:32, height:32, borderRadius:8, border:"none",
          background: darkMode ? "rgba(255,255,255,.1)" : T.bPale,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <X size={16} color={darkMode ? "#eee" : T.textMid} />
        </button>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:28 }}>
          <div style={{
            width:72, height:72, borderRadius:"50%",
            background:`linear-gradient(135deg, ${T.gMid}, ${T.bMid})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:26, fontWeight:700, color:"#fff", marginBottom:14,
            boxShadow:"0 8px 24px rgba(0,0,0,.2)",
          }}>
            {user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)}
          </div>
          <h2 style={{ fontFamily:serif, fontSize:22, fontWeight:800, margin:"0 0 8px", color: darkMode ? "#fff" : T.textDark }}>
            {user.name}
          </h2>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{
              padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600,
              background: user.role === "ngo" ? "#dbeafe" : T.gPale,
              color: user.role === "ngo" ? "#1e40af" : T.gDark,
              textTransform:"capitalize",
            }}>{user.role}</span>
            <StatusBadge status={user.status} />
          </div>
        </div>

        <div style={{ display:"grid", gap:12 }}>
          {[
            { icon:<Mail size={15}/>,     label:"Email",    value: user.email },
            { icon:<MapPin size={15}/>,   label:"Location", value: user.location || "—" },
            { icon:<Calendar size={15}/>, label:"Joined",   value: new Date(user.createdAt).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" }) },
            { icon:<Shield size={15}/>,   label:"Status",   value: user.status || "active" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"12px 16px", borderRadius:12,
              background: darkMode ? "rgba(255,255,255,.05)" : T.bPale,
            }}>
              <span style={{ color:T.gMid, flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".8px", color: darkMode ? "#888" : T.textSoft, marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:14, color: darkMode ? "#eee" : T.textDark, fontWeight:500, textTransform: label === "Status" ? "capitalize" : "none" }}>{value}</div>
              </div>
            </div>
          ))}
          {user.bio && (
            <div style={{ padding:"12px 16px", borderRadius:12, background: darkMode ? "rgba(255,255,255,.05)" : T.bPale }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".8px", color: darkMode ? "#888" : T.textSoft, marginBottom:6 }}>Bio</div>
              <p style={{ fontSize:14, color: darkMode ? "#ccc" : T.textMid, margin:0, lineHeight:1.6 }}>{user.bio}</p>
            </div>
          )}
          {user.skills?.length > 0 && (
            <div style={{ padding:"12px 16px", borderRadius:12, background: darkMode ? "rgba(255,255,255,.05)" : T.bPale }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".8px", color: darkMode ? "#888" : T.textSoft, marginBottom:8 }}>Skills</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {user.skills.map(skill => (
                  <span key={skill} style={{ padding:"3px 10px", borderRadius:20, fontSize:12, background:T.gPale, color:T.gDark, fontWeight:500 }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Pagination with numbered page buttons
const Pagination = ({ page, totalPages, onPageChange, darkMode }) => {
  if (totalPages <= 1) return null;

  // Show max 7 page numbers, with ellipsis if needed
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) return [1, "...", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [1, "...", page-1, page, page+1, "...", totalPages];
  };

  const pageNums = getPageNumbers();

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
      marginTop:24, padding:"16px", flexWrap:"wrap",
    }}>
      {/* Prev */}
      <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{
        display:"flex", alignItems:"center", gap:5,
        padding:"8px 14px", borderRadius:10, border:"none",
        background: page === 1 ? (darkMode ? "#333" : T.bPale) : `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
        color: page === 1 ? (darkMode ? "#666" : T.textSoft) : "#fff",
        fontWeight:600, fontSize:13, cursor: page === 1 ? "not-allowed" : "pointer",
        opacity: page === 1 ? 0.5 : 1,
      }}>
        <ChevronLeft size={14}/> Prev
      </button>

      {/* Page numbers */}
      {pageNums.map((num, i) =>
        num === "..." ? (
          <span key={`ellipsis-${i}`} style={{ fontSize:13, color: darkMode ? "#666" : T.textSoft, padding:"0 4px" }}>…</span>
        ) : (
          <button key={num} className="page-btn" onClick={() => onPageChange(num)} style={{
            width:36, height:36, borderRadius:9, border:"none",
            background: num === page
              ? `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`
              : darkMode ? "#333" : T.bPale,
            color: num === page ? "#fff" : darkMode ? "#ccc" : T.textMid,
            fontWeight: num === page ? 700 : 500,
            fontSize:13, cursor:"pointer",
            boxShadow: num === page ? "0 4px 12px rgba(67,160,71,.4)" : "none",
          }}>
            {num}
          </button>
        )
      )}

      {/* Next */}
      <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{
        display:"flex", alignItems:"center", gap:5,
        padding:"8px 14px", borderRadius:10, border:"none",
        background: page === totalPages ? (darkMode ? "#333" : T.bPale) : `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
        color: page === totalPages ? (darkMode ? "#666" : T.textSoft) : "#fff",
        fontWeight:600, fontSize:13, cursor: page === totalPages ? "not-allowed" : "pointer",
        opacity: page === totalPages ? 0.5 : 1,
      }}>
        Next <ChevronRight size={14}/>
      </button>
    </div>
  );
};

const AdminUsers = () => {
  const [allUsers, setAllUsers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [darkMode, setDarkMode]     = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/users?limit=500`);
      setAllUsers(res.data.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  const filteredUsers = allUsers.filter(u => {
    const q = search.toLowerCase().trim();
    if (roleFilter && (u.role || "").toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (statusFilter && (u.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (q) {
      const searchable = [u.name, u.email, u.role, u.location, u.status]
        .map(v => (v || "").toLowerCase()).join(" ");
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleStatus = async (userId, currentStatus) => {
    const next = (currentStatus || "").toLowerCase() === "active" ? "suspended" : "active";
    setActionLoading(userId);
    try {
      const res = await API.patch(`/admin/users/${userId}/status`, { status: next });
      const updated = res.data.data;
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, status: updated.status } : u));
      if (selectedUser?._id === userId) setSelectedUser(prev => ({ ...prev, status: updated.status }));
    } catch (err) {
      console.error("Toggle status failed:", err);
      alert(err.response?.data?.message || "Failed to update user status.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
      background: darkMode ? "#1a1a1a" : "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
    }}>
      <style>{css}</style>
      <AdminSidebar />

      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto", position:"relative" }}>

        <button onClick={() => setDarkMode(d => !d)} style={{
          position:"absolute", top:24, right:24, zIndex:100,
          padding:"8px 16px", borderRadius:12, border:"none",
          background: darkMode ? "rgba(255,255,255,.1)" : "#fff",
          color: darkMode ? "#eee" : "#333", fontWeight:600, cursor:"pointer",
          boxShadow:"0 4px 20px rgba(0,0,0,.2)",
        }}>
          {darkMode ? " Light" : "Dark"}
        </button>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{
              width:52, height:52, borderRadius:16, flexShrink:0,
              background:"rgba(255,255,255,.15)",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:"1px solid rgba(255,255,255,.2)",
            }}>
              <Users size={24} color="#43a047" />
            </div>
            <div>
              <h1 style={{ fontFamily:serif, fontSize:32, fontWeight:900, color:"#fff", margin:0 }}>
                User Management
              </h1>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", margin:4 }}>
                {allUsers.length} total • {filteredUsers.length} shown
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
                placeholder="Name, email, role, location..."
                style={{
                  width:"100%", padding:"10px 14px", borderRadius:10,
                  border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                  background: darkMode ? "#333" : "#f8fafc",
                  color: darkMode ? "#eee" : T.textDark, fontSize:14, outline:"none", boxSizing:"border-box",
                }}
              />
            </div>
            <div style={{ minWidth:150 }}>
              <div style={{ fontSize:12, color: darkMode ? "#aaa" : T.textSoft, marginBottom:6 }}>Role</div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{
                padding:"10px 14px", borderRadius:10,
                border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                background: darkMode ? "#333" : "#f8fafc",
                color: darkMode ? "#eee" : T.textDark, width:"100%", fontSize:14,
              }}>
                <option value="">All Roles</option>
                <option value="volunteer">Volunteer</option>
                <option value="ngo">NGO</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ minWidth:160 }}>
              <div style={{ fontSize:12, color: darkMode ? "#aaa" : T.textSoft, marginBottom:6 }}>Status</div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
                padding:"10px 14px", borderRadius:10,
                border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                background: darkMode ? "#333" : "#f8fafc",
                color: darkMode ? "#eee" : T.textDark, width:"100%", fontSize:14,
              }}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button onClick={fetchUsers} disabled={loading} style={{
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

        {/* User list */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"80px 0", color: darkMode ? "#666" : T.textSoft }}>
            <Users size={56} style={{ opacity:.4, display:"block", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:17 }}>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{
            background: darkMode ? "#2a2a2a" : "#fff",
            borderRadius:20, padding:"60px", textAlign:"center",
            border:`1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
          }}>
            <User size={60} style={{ color:T.textSoft, opacity:.5, display:"block", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:16, color: darkMode ? "#888" : T.textSoft }}>
              {search || roleFilter || statusFilter ? "No users match your filters." : "No users yet."}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display:"grid", gap:14 }}>
              {pagedUsers.map((u, i) => (
                <div key={u._id} className="user-card" style={{
                  background: darkMode ? "#2a2a2a" : "#fff",
                  borderRadius:18, padding:"24px 28px",
                  border:`1px solid ${darkMode ? "rgba(255,255,255,.08)" : T.bSand}`,
                  boxShadow:"0 4px 20px rgba(0,0,0,.07)",
                  animationDelay:`${i * 0.04}s`, transition:"all .2s",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{
                        width:48, height:48, borderRadius:14,
                        background:`linear-gradient(135deg, ${T.gMid}30, ${T.bMid}30)`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:16, fontWeight:700, color:T.gDark,
                      }}>
                        {u.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)}
                      </div>
                      <div>
                        <h3 style={{ fontSize:17, fontWeight:700, margin:"0 0 3px", color: darkMode ? "#fff" : T.textDark }}>{u.name}</h3>
                        <p style={{ fontSize:13, color: darkMode ? "#aaa" : T.textMid, margin:0 }}>{u.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={u.status} />
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:16, marginBottom:20 }}>
                    {[
                      { label:"Role",     value: u.role },
                      { label:"Location", value: u.location || "—" },
                      { label:"Joined",   value: new Date(u.createdAt).toLocaleDateString() },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".8px", color: darkMode ? "#888" : T.textSoft, marginBottom:4 }}>{label}</div>
                        <div style={{ fontSize:14, color: darkMode ? "#ddd" : T.textDark, fontWeight:500, textTransform: label === "Role" ? "capitalize" : "none" }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                    <button onClick={() => setSelectedUser(u)} style={{
                      padding:"9px 18px", borderRadius:9, border:`1px solid ${T.gSage}`,
                      background:T.gPale, color:T.gDark, fontWeight:600, cursor:"pointer",
                      display:"flex", alignItems:"center", gap:6, fontSize:13,
                    }}>
                      <Eye size={15}/> View Profile
                    </button>
                    <button onClick={() => toggleStatus(u._id, u.status)} disabled={actionLoading === u._id} style={{
                      padding:"9px 18px", borderRadius:9, border:"none",
                      background: (u.status || "").toLowerCase() === "active" ? "#fee2e2" : `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                      color: (u.status || "").toLowerCase() === "active" ? T.oDark : "#fff",
                      fontWeight:600, fontSize:13,
                      cursor: actionLoading === u._id ? "wait" : "pointer",
                      opacity: actionLoading === u._id ? 0.7 : 1,
                    }}>
                      {actionLoading === u._id ? "Updating..." : (u.status || "").toLowerCase() === "active" ? "Suspend" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              darkMode={darkMode}
            />
          </>
        )}
      </main>

      {selectedUser && <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} darkMode={darkMode} />}
    </div>
  );
};

export default AdminUsers;