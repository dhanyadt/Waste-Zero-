import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getMyOpportunities, deleteOpportunity, getMyApplications } from "../services/api";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047", gLight:"#81c784",
  gPale:"#c8e6c9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8",
  cream:"#fdf8f0", pageBg:"#f4ede0",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};
const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const S = {
  layout: {
    display: "flex", minHeight: "100vh", fontFamily: font,
    backgroundColor: "#162516",
    backgroundImage: [
      "radial-gradient(ellipse at 15% 85%, rgba(67,160,71,.22) 0%, transparent 50%)",
      "radial-gradient(ellipse at 85% 15%, rgba(93,64,55,.35) 0%, transparent 50%)",
      "radial-gradient(ellipse at 50% 50%, rgba(27,94,32,.4)  0%, transparent 70%)",
      "linear-gradient(135deg, #1a2e1a 0%, #1f1a0e 50%, #2a1a0a 100%)",
    ].join(", "),
  },
  main: { flex: 1, padding: "40px 36px", overflowY: "auto" },
  header: { marginBottom: 32 },
  headerTop: { display: "flex", alignItems: "center", gap: 14, marginBottom: 6 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: "linear-gradient(135deg, rgba(67,160,71,.2), rgba(46,125,50,.15))",
    border: `1px solid ${T.gSage}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, boxShadow: "0 2px 8px rgba(46,125,50,.15)",
  },
  h1: { fontFamily: serif, fontSize: 26, fontWeight: 800, color: "#ffffff", letterSpacing: "-.3px", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,.3)" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,.55)", marginLeft: 58 },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 16, marginBottom: 20,
  },
  statCard: (topColor) => ({
    borderRadius: 16,
    background: "#ffffff",
    border: `1px solid ${T.bSand}`,
    borderTop: `3px solid ${topColor}`,
    padding: "20px 22px",
    display: "flex", flexDirection: "column", gap: 6,
    boxShadow: "0 2px 8px rgba(0,0,0,.2)",
  }),
  statNum: { fontFamily: serif, fontSize: 30, fontWeight: 800, color: T.bDark },
  statLabel: { fontSize: 12.5, color: T.textSoft, fontWeight: 500 },

  card: {
    borderRadius: 18,
    background: "#ffffff",
    border: `1px solid ${T.bSand}`,
    boxShadow: "0 2px 8px rgba(0,0,0,.25), 0 8px 24px rgba(0,0,0,.2)",
    padding: "28px 32px", marginBottom: 20,
    position: "relative", overflow: "hidden",
  },
  cardAccent: {
    position: "absolute", top: 0, left: 0, right: 0, height: 3,
    background: `linear-gradient(90deg, ${T.gDark}, ${T.gMid}, ${T.bMid})`,
    borderRadius: "18px 18px 0 0",
  },
  cardTitle: {
    fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.bDark,
    marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${T.bPale}`,
  },
  summaryGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
    gap: "18px 28px",
  },
  summaryItem: { display: "flex", flexDirection: "column", gap: 5 },
  summaryLabel: { fontSize: 11.5, fontWeight: 700, color: T.bLight, textTransform: "uppercase", letterSpacing: "1px" },
  summaryValue: { fontSize: 14.5, color: T.textDark, fontWeight: 500 },
  oppBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 24px",
    background: `linear-gradient(135deg, ${T.gMid} 0%, ${T.gDark} 60%, ${T.gDeep} 100%)`,
    color: "#fff", border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer",
    boxShadow: "0 4px 14px rgba(46,125,50,.3)",
    transition: "opacity .2s, transform .15s",
  },
  createBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 24px",
    background: `linear-gradient(135deg, ${T.bMid} 0%, ${T.bDark} 100%)`,
    color: "#fff", border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer",
    boxShadow: "0 4px 14px rgba(62,39,35,.3)",
    transition: "opacity .2s, transform .15s",
  },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: 10 },
  emptyIcon: { fontSize: 38, opacity: .4 },
  emptyText: { fontSize: 14, fontWeight: 500, color: T.textSoft },
  emptyHint: { fontSize: 13, color: T.bLight },
  editBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "none",
    background: T.gPale,
    color: T.gDark,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  deleteBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "none",
    background: "#fef2f2",
    color: "#c62828",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px 32px",
    maxWidth: 400,
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
  modalTitle: {
    fontFamily: serif,
    fontSize: 20,
    fontWeight: 700,
    color: T.bDark,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: T.textMid,
    marginBottom: 24,
    lineHeight: 1.5,
  },
  modalBtnRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  modalBtn: (danger) => ({
    padding: "10px 24px",
    borderRadius: 10,
    border: danger ? "none" : `1.5px solid ${T.bSand}`,
    background: danger ? "#c62828" : "transparent",
    color: danger ? "#fff" : T.textMid,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: font,
  }),
};

// Delete Confirmation Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
  if (!isOpen) return null;
  
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalContent} onClick={e => e.stopPropagation()}>
        <h3 style={S.modalTitle}>{title}</h3>
        <p style={S.modalText}>{message}</p>
        <div style={S.modalBtnRow}>
          <button 
            style={S.modalBtn(false)} 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            style={S.modalBtn(true)} 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper to display role with proper capitalization
const displayRole = (role) => {
  if (!role) return "Volunteer";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const VolunteerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [oppToDelete, setOppToDelete] = useState(null);

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoadingData(true);
      // Fetch opportunities created by this user
      const oppResponse = await getMyOpportunities();
      setOpportunities(oppResponse.data.opportunities || []);
      
      // Fetch applications made by this user
      const appResponse = await getMyApplications();
      setApplications(appResponse.data.applications || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchData();
    }
  }, [loading, user]);

  // Open delete confirmation modal
  const handleDeleteClick = (opp) => {
    setOppToDelete(opp);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!oppToDelete) return;

    setDeletingId(oppToDelete._id);
    try {
      await deleteOpportunity(oppToDelete._id);
      setOpportunities(opportunities.filter(opp => opp._id !== oppToDelete._id));
      setShowDeleteModal(false);
      setOppToDelete(null);
    } catch (err) {
      console.error("Failed to delete opportunity:", err);
      setError(err.response?.data?.message || "Failed to delete opportunity");
    } finally {
      setDeletingId(null);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setOppToDelete(null);
  };

  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#fef3c7", color: "#b45309" }}>Pending</span>;
      case "accepted":
        return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#15803d" }}>Accepted</span>;
      case "rejected":
        return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#fee2e2", color: "#b91c1c" }}>Rejected</span>;
      default:
        return null;
    }
  };

  if (loading || loadingData) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: font }}>
      <p style={{ color: T.textSoft }}>Loading…</p>
    </div>
  );

  const stats = [
    { label: "My Applications",  value: applications.length, top: T.gMid   },
    { label: "Opportunities", value: opportunities.length, top: T.bMid   },
    { label: "Accepted",  value: applications.filter(a => a.applicationStatus === "accepted").length, top: "#22c55e" },
    { label: "Pending", value: applications.filter(a => a.applicationStatus === "pending").length, top: "#f59e0b" },
  ];

  const summary = [
    { label: "Email",    value: user?.email    || "—" },
    { label: "Skills",   value: user?.skills?.join(", ") || "—" },
    { label: "Location", value: user?.location || "—" },
    { label: "Role",     value: displayRole(user?.role) || "Volunteer" },
  ];

  return (
    <div style={S.layout}>
      <Sidebar />
      <main style={S.main}>

        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={S.headerIcon}>🌱</div>
            <h1 style={S.h1}>Volunteer Dashboard</h1>
          </div>
          <p style={S.subtitle}>Welcome back, <strong style={{ color: T.bMid }}>{user?.name}</strong></p>
        </div>

        <div style={S.statsRow}>
          {stats.map(({ label, value, top }) => (
            <div key={label} style={S.statCard(top)}>
              <span style={S.statNum}>{value}</span>
              <span style={S.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={S.cardTitle}>Profile Summary</h2>
          <div style={S.summaryGrid}>
            {summary.map(({ label, value }) => (
              <div key={label} style={S.summaryItem}>
                <span style={S.summaryLabel}>{label}</span>
                <span style={S.summaryValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={{ ...S.cardTitle, borderBottom: "none", marginBottom: 10, paddingBottom: 0 }}>Browse Opportunities</h2>
          <p style={{ fontSize: 14, color: T.textSoft, marginBottom: 18 }}>Find recycling drives and initiatives near you.</p>
          <button style={S.oppBtn} onClick={() => navigate("/opportunities")}
            onMouseEnter={e => { e.currentTarget.style.opacity=".9"; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
            <span>♻️</span> View All Opportunities
          </button>
        </div>

        {/* Create Opportunity Section - Same as NGO */}
        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={{ ...S.cardTitle, borderBottom: "none", marginBottom: 10, paddingBottom: 0 }}>Post an Opportunity</h2>
          <p style={{ fontSize: 14, color: T.textSoft, marginBottom: 18 }}>
            Create recycling drives, collection events, and volunteer opportunities for your community.
          </p>
          <button style={S.createBtn} onClick={() => navigate("/create-opportunity")}
            onMouseEnter={e => { e.currentTarget.style.opacity=".9"; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
            <span>＋</span> Create New Opportunity
          </button>
        </div>

        {/* My Created Opportunities Section */}
        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={S.cardTitle}>My Created Opportunities</h2>
          {error && <p style={{ color: "#c62828", marginBottom: 12 }}>{error}</p>}
          {opportunities.length === 0 ? (
            <div style={S.empty}>
              <span style={S.emptyIcon}>📋</span>
              <p style={S.emptyText}>No opportunities created yet.</p>
              <p style={S.emptyHint}>Click "Create New Opportunity" above to get started!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {opportunities.map((opp) => (
                <div key={opp._id} style={{
                  padding: "20px",
                  borderRadius: 12,
                  border: `1px solid ${T.bSand}`,
                  background: "#fff",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.bDark }}>{opp.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button 
                        onClick={() => navigate(`/edit-opportunity/${opp._id}`)}
                        style={S.editBtn}
                        disabled={deletingId === opp._id}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(opp)}
                        style={S.deleteBtn}
                        disabled={deletingId === opp._id}
                      >
                        {deletingId === opp._id ? "..." : "🗑️ Delete"}
                      </button>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: opp.status === "open" ? T.gPale : "#fef2f2",
                        color: opp.status === "open" ? T.gDark : "#c62828"
                      }}>
                        {opp.status === "open" ? "🟢 Open" : "🔴 Closed"}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 12px 0", fontSize: 14, color: T.textMid, lineHeight: 1.5 }}>{opp.description}</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    {opp.requiredSkills && opp.requiredSkills.map((skill, idx) => (
                      <span key={idx} style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: 12,
                        background: T.gPale,
                        color: T.gDark,
                        fontWeight: 500
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: T.textSoft }}>
                    <span>📍 {opp.location}</span>
                    <span>⏰ {opp.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Applications Section */}
        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={S.cardTitle}>My Applications</h2>
          {applications.length === 0 ? (
            <div style={S.empty}>
              <span style={S.emptyIcon}>📋</span>
              <p style={S.emptyText}>No applications yet.</p>
              <p style={S.emptyHint}>Browse opportunities above and apply to get started!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {applications.map((app) => (
                <div key={app._id} style={{
                  padding: "20px",
                  borderRadius: 12,
                  border: `1px solid ${T.bSand}`,
                  background: "#fff",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.bDark }}>{app.title}</h3>
                    {getApplicationStatusBadge(app.applicationStatus)}
                  </div>
                  <p style={{ margin: "0 0 12px 0", fontSize: 14, color: T.textMid, lineHeight: 1.5 }}>{app.description}</p>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: T.textSoft }}>
                    <span>📍 {app.location}</span>
                    <span>⏰ {app.duration}</span>
                    <span>🏢 NGO: {app.ngo?.name || "Unknown"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          title="Delete Opportunity"
          message={`Are you sure you want to delete "${oppToDelete?.title}"? This action cannot be undone.`}
          isDeleting={deletingId !== null}
        />

      </main>
    </div>
  );
};

export default VolunteerDashboard;
