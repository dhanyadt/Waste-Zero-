import { useEffect, useState, useCallback } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import API from "../services/api";
import { Search, Target, RotateCcw, Trash2, MapPin, Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const T = {
  gDeep: "#1b5e20", gDark: "#2e7d32", gMid: "#43a047", gLight: "#81c784",
  gPale: "#e8f5e9", gSage: "#a5c8a0",
  bDark: "#3e2723", bMid: "#5d4037", bLight: "#8d6e63",
  bPale: "#efebe9", bSand: "#d7ccc8", oDark: "#dc2626",
  textDark: "#1c1008", textMid: "#4b3f36", textSoft: "#7b6b63",
};
const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";
const PAGE_SIZE = 10;

const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .opp-row { animation: fadeUp .3s ease both; transition: box-shadow .2s, transform .2s; }
  .opp-row:hover { box-shadow: 0 6px 24px rgba(0,0,0,.1) !important; transform: translateY(-2px); }
  .page-btn { transition: all .15s; }
  .page-btn:hover:not(:disabled) { transform: translateY(-1px); }
`;

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const cfg = {
    open: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Open" },
    closed: { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444", label: "Closed" },
    "in-progress": { bg: "#fef9c3", color: "#a16207", dot: "#eab308", label: "In Progress" },
  }[s] || { bg: T.bPale, color: "#666", dot: "#ccc", label: status || "Unknown" };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const Pagination = ({ page, totalPages, onPageChange, darkMode }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      marginTop: 24, padding: "16px", flexWrap: "wrap",
    }}>
      <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "8px 14px", borderRadius: 10, border: "none",
        background: page === 1 ? (darkMode ? "#333" : T.bPale) : `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
        color: page === 1 ? (darkMode ? "#666" : T.textSoft) : "#fff",
        fontWeight: 600, fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer",
        opacity: page === 1 ? 0.5 : 1,
      }}>
        <ChevronLeft size={14} /> Prev
      </button>

      {getPageNumbers().map((num, i) =>
        num === "..." ? (
          <span key={`e-${i}`} style={{ fontSize: 13, color: darkMode ? "#666" : T.textSoft, padding: "0 4px" }}>…</span>
        ) : (
          <button key={num} className="page-btn" onClick={() => onPageChange(num)} style={{
            width: 36, height: 36, borderRadius: 9, border: "none",
            background: num === page ? `linear-gradient(135deg, ${T.gMid}, ${T.gDark})` : darkMode ? "#333" : T.bPale,
            color: num === page ? "#fff" : darkMode ? "#ccc" : T.textMid,
            fontWeight: num === page ? 700 : 500, fontSize: 13, cursor: "pointer",
            boxShadow: num === page ? "0 4px 12px rgba(67,160,71,.4)" : "none",
          }}>
            {num}
          </button>
        )
      )}

      <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "8px 14px", borderRadius: 10, border: "none",
        background: page === totalPages ? (darkMode ? "#333" : T.bPale) : `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
        color: page === totalPages ? (darkMode ? "#666" : T.textSoft) : "#fff",
        fontWeight: 600, fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer",
        opacity: page === totalPages ? 0.5 : 1,
      }}>
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
};

const AdminOpportunities = () => {
  const [allOpps, setAllOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  const fetchOpps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/opportunities?limit=500`);
      setAllOpps(res.data.data || []);
    } catch (err) {
      console.error("Fetch opportunities error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOpps(); }, [fetchOpps]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = allOpps.filter(o => {
    const q = search.toLowerCase().trim();
    if (statusFilter && (o.status || "").toLowerCase() !== statusFilter) return false;
    
    if (q) {
      const searchable = [
        o.title, 
        o.description, 
        o.location, 
        o.ngo?.name, 
        o.createdBy?.name, 
        o.status
      ].map(v => (v || "").toLowerCase()).join(" ");
      
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedOpps = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const deleteOpp = async (id) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    setDeletingId(id);
    try {
      await API.delete(`/admin/opportunities/${id}`);
      setAllOpps(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete opportunity.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: font }}>
      <style>{css}</style>
      <AdminSidebar />

      <main style={{ flex: 1, padding: "40px 36px", overflowY: "auto", position: "relative" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: "rgba(255,255,255,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(255,255,255,.2)",
            }}>
              <Target size={24} color="#43a047" />
            </div>
            <div>
              <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 900, color: "#fff", margin: 0 }}>
                Opportunity Moderation
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", margin: 4 }}>
                {allOpps.length} total • {filtered.length} shown
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: darkMode ? "#2a2a2a" : "#fff",
          borderRadius: 20, padding: "24px 28px", marginBottom: 24,
          border: `1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
          boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: 300 }}>
              <div style={{ fontSize: 12, color: darkMode ? "#aaa" : T.textSoft, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Search size = {14} /> Search
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Title, NGO, description, location..."
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${darkMode ? "#555" : T.bSand}`,
                  background: darkMode ? "#333" : "#f8fafc",
                  color: darkMode ? "#eee" : T.textDark, fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 12, color: darkMode ? "#aaa" : T.textSoft, marginBottom: 6 }}>Status</div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
                padding: "10px 14px", borderRadius: 10,
                border: `1px solid ${darkMode ? "#555" : T.bSand}`,
                background: darkMode ? "#333" : "#f8fafc",
                color: darkMode ? "#eee" : T.textDark, width: "100%", fontSize: 14,
              }}>
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>

            <button onClick={fetchOpps} disabled={loading} style={{
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
              color: "#fff", fontWeight: 600, cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 8, fontSize: 14,
              boxShadow: "0 4px 14px rgba(67,160,71,.4)",
            }}>
              <RotateCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: darkMode ? "#666" : T.textSoft }}>
            <Target size={56} style={{ opacity: .4, display: "block", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 17 }}>Loading opportunities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: darkMode ? "#2a2a2a" : "#fff",
            borderRadius: 20, padding: "60px", textAlign: "center",
            border: `1px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}`,
          }}>
            <Target size={60} style={{ color: T.textSoft, opacity: .5, display: "block", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 16, color: darkMode ? "#888" : T.textSoft }}>No opportunities match your filters.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 14 }}>
              {pagedOpps.map((o, i) => (
                <div key={o._id} className="opp-row" style={{
                  background: darkMode ? "#2a2a2a" : "#fff",
                  borderRadius: 18, padding: "24px 28px",
                  border: `1px solid ${darkMode ? "rgba(255,255,255,.08)" : T.bSand}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,.07)",
                  animationDelay: `${i * 0.04}s`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", color: darkMode ? "#fff" : T.textDark }}>{o.title}</h3>
                      {o.description && (
                        <p style={{
                          fontSize: 13, color: darkMode ? "#aaa" : T.textMid, margin: 0,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>{o.description}</p>
                      )}
                    </div>
                    <StatusBadge status={o.status} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 18 }}>
                    {[
                      { icon: <Users size={13} />, label: "NGO", value: o.ngo?.name || o.createdBy?.name || "—" },
                      { icon: <MapPin size={13} />, label: "Location", value: o.location || "—" },
                      { icon: <Calendar size={13} />, label: "Created", value: new Date(o.createdAt).toLocaleDateString() },
                      { icon: <Users size={13} />, label: "Applicants", value: o.applicants?.length || 0 },
                    ].map(({ icon, label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: darkMode ? "#888" : T.textSoft, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          {icon} {label}
                        </div>
                        <div style={{ fontSize: 14, color: darkMode ? "#ddd" : T.textDark, fontWeight: 500 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {o.requiredSkills?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                      {o.requiredSkills.map((skill, idx) => (
                        <span key={idx} style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                          background: darkMode ? "rgba(67,160,71,.15)" : T.gPale,
                          color: darkMode ? "#81c784" : T.gDark,
                          border: darkMode ? "1px solid rgba(67,160,71,.3)" : `1px solid ${T.gSage}`,
                        }}>{skill}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => deleteOpp(o._id)} disabled={deletingId === o._id} style={{
                      padding: "9px 18px", borderRadius: 9, border: "none",
                      background: "#fee2e2", color: T.oDark, fontWeight: 600, fontSize: 13,
                      cursor: deletingId === o._id ? "wait" : "pointer",
                      opacity: deletingId === o._id ? 0.7 : 1,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <Trash2 size={14} />
                      {deletingId === o._id ? "Deleting..." : "Delete"}
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
    </div>
  );
};

export default AdminOpportunities;