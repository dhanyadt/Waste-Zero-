import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import ProfileEditModal from "../components/ui/ProfileEditModal";
import ProfileUploadModal from "../components/ui/ProfileUploadModal";

<<<<<<< HEAD
const NgoDashboard = () => {
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900">

      {/* Sidebar */}
=======
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
    display: "flex", minHeight: "100vh",
    fontFamily: font,
    /* rich parchment bg with green + brown depth */
    background: T.pageBg,
    backgroundImage: [
      "radial-gradient(ellipse at 0% 0%, rgba(27,94,32,.18) 0%, transparent 40%)",
      "radial-gradient(ellipse at 100% 100%, rgba(62,39,35,.15) 0%, transparent 40%)",
      "radial-gradient(ellipse at 60% 40%, rgba(67,160,71,.07) 0%, transparent 50%)",
      "radial-gradient(ellipse at 30% 80%, rgba(93,64,55,.08) 0%, transparent 40%)",
    ].join(", "),
  },
  main: { flex: 1, padding: "40px 36px", overflowY: "auto" },

  /* header */
  header: { marginBottom: 32 },
  headerTop: { display: "flex", alignItems: "center", gap: 14, marginBottom: 6 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: `linear-gradient(135deg, rgba(93,64,55,.2), rgba(62,39,35,.15))`,
    border: `1px solid ${T.bSand}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, boxShadow: "0 2px 8px rgba(62,39,35,.12)",
  },
  h1: { fontFamily: serif, fontSize: 26, fontWeight: 800, color: T.bDark, letterSpacing: "-.3px", margin: 0 },
  subtitle: { fontSize: 14, color: T.textSoft, marginLeft: 58 },

  /* stats */
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 16, marginBottom: 20,
  },
  statCard: (topColor, bgFrom, bgTo) => ({
    borderRadius: 16,
    background: `linear-gradient(145deg, ${bgFrom}, ${bgTo})`,
    border: `1px solid ${T.bSand}`,
    borderTop: `3px solid ${topColor}`,
    padding: "20px 22px",
    display: "flex", flexDirection: "column", gap: 6,
    boxShadow: "0 2px 8px rgba(62,39,35,.1)",
  }),
  statNum: { fontFamily: serif, fontSize: 30, fontWeight: 800, color: T.bDark },
  statLabel: { fontSize: 12.5, color: T.textSoft, fontWeight: 500 },

  /* cards */
  card: {
    borderRadius: 18,
    background: "linear-gradient(145deg, #fdf8f0, #f8f0e4)",
    border: `1px solid ${T.bSand}`,
    boxShadow: "0 2px 8px rgba(62,39,35,.09), 0 8px 24px rgba(62,39,35,.06)",
    padding: "28px 32px",
    marginBottom: 20,
    position: "relative", overflow: "hidden",
  },
  cardAccent: {
    position: "absolute", top: 0, left: 0, right: 0, height: 3,
    background: `linear-gradient(90deg, ${T.bMid}, ${T.gMid})`,
    borderRadius: "18px 18px 0 0",
  },
  cardTitle: {
    fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.bDark,
    marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${T.bPale}`,
  },

  /* org profile grid */
  orgGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "18px 28px",
  },
  orgItem: { display: "flex", flexDirection: "column", gap: 5 },
  orgLabel: { fontSize: 11.5, fontWeight: 700, color: T.bLight, textTransform: "uppercase", letterSpacing: "1px" },
  orgValue: { fontSize: 14.5, color: T.textDark, fontWeight: 500 },

  /* create button */
  createBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 24px",
    background: `linear-gradient(135deg, ${T.bMid} 0%, ${T.bDark} 100%)`,
    color: "#fff", border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 600, fontFamily: font,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(62,39,35,.3)",
    transition: "opacity .2s, transform .15s",
  },

  /* empty */
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "32px 0", gap: 10,
  },
  emptyIcon: { fontSize: 38, opacity: .4 },
  emptyText: { fontSize: 14, fontWeight: 500, color: T.textSoft },
  emptyHint: { fontSize: 13, color: T.bLight },
};

const VolunteerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: font }}>
      <p style={{ color: T.textSoft }}>Loading…</p>
    </div>
  );

  const stats = [
    { label: "Opportunities",    value: 0, top: T.bMid,  from: "#fdf8f0", to: "#f5ece0" },
    { label: "Applications In",  value: 0, top: T.gDark,  from: "#f0f8f0", to: "#e8f5e9" },
    { label: "Active Volunteers", value: 0, top: T.gMid,  from: "#fdf8f0", to: "#f5ece0" },
    { label: "Events This Month", value: 0, top: T.bLight, from: "#fdf8f0", to: "#f5ece0" },
  ];

  const orgInfo = [
    { label: "Email",    value: user?.email    || "—" },
    { label: "Location", value: user?.location || "—" },
    { label: "Bio",      value: user?.bio      || "—" },
    { label: "Role",     value: user?.role     || "NGO" },
  ];

  return (
    <div style={S.layout}>
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
      <Sidebar />
      <main style={S.main}>

        {/* Header */}
<<<<<<< HEAD
        <div>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-300">
            🌱 WasteZero NGO Dashboard
          </h1>

          <p className="text-gray-500 mt-1 dark:text-slate-300">
            Manage your organization’s waste pickup and recycling opportunities
          </p>
        </div>

        <ProfileEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
        <ProfileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />


        {/* Profile Summary */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-6">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "N"}
          </div>

          {/* Profile Info */}
          <div className="flex-1">

            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
              {user?.name || "WasteZero Partner NGO"}
            </h2>

            <p className="text-gray-500 dark:text-slate-300">
              {user?.email || "ngo@wastezero.org"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">

              <p>
                <span className="font-medium text-gray-600 dark:text-slate-300">Role:</span>{" "}
                <span className="text-green-600 font-medium">
                  NGO
                </span>
              </p>

              <p>
                <span className="font-medium text-green-600 dark:text-green-300">Organization:</span>{" "}
                <span className="dark:text-slate-300">WasteZero Partner NGO</span>
              </p>

              <p>
                <span className="font-medium text-green-600 dark:text-green-300">Location:</span>{" "}
                <span className="dark:text-slate-300">Kolkata, India</span>
              </p>

              <p>
                <span className="font-medium text-green-600 dark:text-green-300">Joined:</span>{" "}
                <span className="dark:text-slate-300">Feb 2026</span>
              </p>

            </div>

          </div>

          {/* Edit Profile Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Edit Picture
            </button>
          </div>

        </div>


        {/* Create Opportunity Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex justify-between items-center">

          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
              Create Opportunity
            </h2>

            <p className="text-gray-500 text-sm mt-1 dark:text-slate-300">
              Post new cleanup drives and waste pickup opportunities
            </p>
          </div>

          <button
            disabled
            className="bg-gray-300 text-gray-600 px-5 py-2 rounded-lg cursor-not-allowed dark:bg-slate-700 dark:text-slate-300"
          >
            Coming in Milestone 2 🚧
          </button>

        </div>


        {/* My Opportunities Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">

          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-slate-100">
            My Opportunities
          </h2>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12 text-center">

            <div className="text-6xl mb-3">♻️</div>

            <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-100">
              No Opportunities Created Yet
            </h3>

            <p className="text-gray-500 mt-2 dark:text-slate-300">
              Create your first cleanup opportunity in Milestone 2.
            </p>

          </div>

        </div>


        {/* Impact Message */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-md">

          <h2 className="text-xl font-semibold mb-2">
            Make a Bigger Environmental Impact 🌍
          </h2>

          <p className="text-green-100">
            Create opportunities and collaborate with volunteers to keep our planet clean.
=======
        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={S.headerIcon}>🏢</div>
            <h1 style={S.h1}>NGO Dashboard</h1>
          </div>
          <p style={S.subtitle}>Welcome back, <strong style={{ color: T.bMid }}>{user?.name}</strong></p>
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          {stats.map(({ label, value, top, from, to }) => (
            <div key={label} style={S.statCard(top, from, to)}>
              <span style={S.statNum}>{value}</span>
              <span style={S.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* Org Profile */}
        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={S.cardTitle}>Organization Profile</h2>
          <div style={S.orgGrid}>
            {orgInfo.map(({ label, value }) => (
              <div key={label} style={S.orgItem}>
                <span style={S.orgLabel}>{label}</span>
                <span style={S.orgValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Create Opportunity */}
        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={{ ...S.cardTitle, borderBottom: "none", marginBottom: 10, paddingBottom: 0 }}>Post an Opportunity</h2>
          <p style={{ fontSize: 14, color: T.textSoft, marginBottom: 18 }}>
            Create recycling drives, collection events, and volunteer opportunities for your community.
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
          </p>
          <button style={S.createBtn}
            onClick={() => navigate("/create-opportunity")}
            onMouseEnter={e => { e.currentTarget.style.opacity = ".9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1";  e.currentTarget.style.transform = "translateY(0)"; }}>
            <span>＋</span> Create New Opportunity
          </button>
        </div>

        {/* My Opportunities */}
        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={S.cardTitle}>My Opportunities</h2>
          <div style={S.empty}>
            <span style={S.emptyIcon}>📋</span>
            <p style={S.emptyText}>No opportunities created yet.</p>
            <p style={S.emptyHint}>Click "Create New Opportunity" above to get started!</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default VolunteerDashboard;