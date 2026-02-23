import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";

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
  empty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: 10 },
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
    { label: "Applications",  value: 0, top: T.gMid   },
    { label: "Opportunities", value: 0, top: T.bMid   },
    { label: "Hours Logged",  value: 0, top: "#f59e0b" },
    { label: "Impact Points", value: 0, top: T.gLight  },
  ];

  const summary = [
    { label: "Email",    value: user?.email    || "—" },
    { label: "Skills",   value: user?.skills?.join(", ") || "—" },
    { label: "Location", value: user?.location || "—" },
    { label: "Role",     value: user?.role     || "Volunteer" },
  ];

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900">
=======
    <div style={S.layout}>
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
      <Sidebar />
      <main style={S.main}>

        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={S.headerIcon}>🌱</div>
            <h1 style={S.h1}>Volunteer Dashboard</h1>
          </div>
          <p style={S.subtitle}>Welcome back, <strong style={{ color: T.bMid }}>{user?.name}</strong></p>
        </div>

<<<<<<< HEAD
        {/* Upcoming Cleanup Drives */}
        <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800">
          <h3 className="text-lg font-semibold mb-4 text-green-700 dark:text-green-300">
            🚛 Upcoming Cleanup Drives
          </h3>

          <ul className="space-y-3 text-gray-700 dark:text-slate-300">
            <li>📍 Park Street – 18 Feb 2026</li>
            <li>📍 Eco Lake – 22 Feb 2026</li>
            <li>📍 City Market – 1 Mar 2026</li>
          </ul>
=======
        <div style={S.statsRow}>
          {stats.map(({ label, value, top, from, to }) => (
            <div key={label} style={S.statCard(top)}>
              <span style={S.statNum}>{value}</span>
              <span style={S.statLabel}>{label}</span>
            </div>
          ))}
>>>>>>> e951827d6ab3baa7e3574f9def12f976dc6651a5
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
          <h2 style={{ ...S.cardTitle, borderBottom: "none", marginBottom: 10, paddingBottom: 0 }}>Opportunities</h2>
          <p style={{ fontSize: 14, color: T.textSoft, marginBottom: 18 }}>Browse and apply to recycling drives and initiatives near you.</p>
          <button style={S.oppBtn} onClick={() => navigate("/opportunities")}
            onMouseEnter={e => { e.currentTarget.style.opacity=".9"; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
            <span>♻️</span> View Available Opportunities
          </button>
        </div>

        <div style={S.card}>
          <div style={S.cardAccent} />
          <h2 style={S.cardTitle}>My Applications</h2>
          <div style={S.empty}>
            <span style={S.emptyIcon}>📋</span>
            <p style={S.emptyText}>No applications yet.</p>
            <p style={S.emptyHint}>Browse opportunities above and apply to get started!</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default VolunteerDashboard;