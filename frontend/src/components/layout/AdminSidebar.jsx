import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Users,
  Target,
  TrendingUp,
  ScrollText,
  Shield,
  ChevronRight,
  User,
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";

const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const S = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1a2e1a 0%, #1f1a0e 50%, #2a1a0a 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    position: "relative",
    overflow: "hidden",
    fontFamily: font,
    boxShadow: "2px 0 20px rgba(0,0,0,.3)",
    flexShrink: 0,
  },
  ring1: {
    position: "absolute", width: 280, height: 280, borderRadius: "50%",
    border: "50px solid rgba(67,160,71,.06)", top: -80, left: -80, pointerEvents: "none",
  },
  ring2: {
    position: "absolute", width: 200, height: 200, borderRadius: "50%",
    border: "36px solid rgba(93,64,55,.07)", bottom: 60, right: -70, pointerEvents: "none",
  },
  topGlow: {
    position: "absolute", width: 160, height: 160, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(67,160,71,.12) 0%, transparent 70%)",
    top: 20, left: "50%", transform: "translateX(-50%)", pointerEvents: "none",
  },
  logoBar: {
    padding: "20px 20px 16px",
    display: "flex", alignItems: "center", gap: 10,
    position: "relative", zIndex: 1,
    borderBottom: "1px solid rgba(255,255,255,.06)",
    marginBottom: 4,
  },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: "rgba(67,160,71,.2)", border: "1px solid rgba(67,160,71,.3)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
  },
  logoText: {
    fontFamily: serif, fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-.2px",
  },
  adminBadge: {
    margin: "0 16px 8px",
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(67,160,71,.15)",
    border: "1px solid rgba(67,160,71,.25)",
    display: "flex", alignItems: "center", gap: 8,
    position: "relative", zIndex: 1,
  },
  navSection: { padding: "4px 12px", flex: 1, position: "relative", zIndex: 1 },
  sectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
    color: "rgba(255,255,255,.3)", padding: "10px 8px 4px",
  },
  navBtn: (active) => ({
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "none", cursor: "pointer", marginBottom: 2,
    fontFamily: font, fontSize: 13.5, fontWeight: active ? 600 : 400,
    background: active
      ? "linear-gradient(135deg, rgba(67,160,71,.25), rgba(46,125,50,.15))"
      : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,.6)",
    borderLeft: active ? "3px solid #43a047" : "3px solid transparent",
    transition: "all .2s", textAlign: "left",
  }),
  iconWrap: (active) => ({
    width: 28, height: 28, borderRadius: 8,
    background: active ? "rgba(67,160,71,.3)" : "rgba(255,255,255,.06)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "background .2s",
  }),
  bottomSection: {
    padding: "12px 12px 20px",
    borderTop: "1px solid rgba(255,255,255,.06)",
    position: "relative", zIndex: 1,
  },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "none", cursor: "pointer", fontFamily: font,
    fontSize: 13.5, fontWeight: 500, background: "transparent",
    color: "rgba(239,68,68,.7)", transition: "all .2s", textAlign: "left",
  },
};

const adminNav = [
  { label: "Dashboard",            path: "/admin",               icon: <LayoutDashboard size={14} /> },
  { label: "Manage Users",         path: "/admin/users",         icon: <Users size={14} /> },
  { label: "Manage Opportunities", path: "/admin/opportunities", icon: <Target size={14} /> },
  { label: "Reports",              path: "/admin/reports",       icon: <TrendingUp size={14} /> },
  { label: "Logs",                 path: "/admin/logs",          icon: <ScrollText size={14} /> },
    { label: "My Profile",           path: "/profile",             icon: <User size={14} /> },

];


const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <div style={S.sidebar}>
      <div style={S.ring1} />
      <div style={S.ring2} />
      <div style={S.topGlow} />

      {/* Logo */}
      <div style={S.logoBar}>
        <div style={S.logoIcon}>♻️</div>
        <span style={S.logoText}>WasteZero</span>
      </div>

      {/* Admin identity badge */}
      <div style={S.adminBadge}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #43a047, #5d4037)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: "#fff", margin: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {user.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <Shield size={10} color="#81c784" />
            <span style={{ fontSize: 11, color: "#81c784", fontWeight: 600, letterSpacing: ".4px" }}>
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={S.navSection}>
        <p style={S.sectionLabel}>Admin Panel</p>
        {adminNav.map(({ label, path, icon }) => (
          <button
            key={path}
            style={S.navBtn(isActive(path))}
            onClick={() => navigate(path)}
            onMouseEnter={(e) => {
              if (!isActive(path)) {
                e.currentTarget.style.background = "rgba(255,255,255,.06)";
                e.currentTarget.style.color = "rgba(255,255,255,.9)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(path)) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,.6)";
              }
            }}
          >
            <div style={S.iconWrap(isActive(path))}>{icon}</div>
            <span style={{ flex: 1 }}>{label}</span>
            {isActive(path) && <ChevronRight size={12} color="rgba(255,255,255,.4)" />}
          </button>
        ))}

        {/* Theme toggle sits naturally after nav items */}
        <ThemeToggle />
      </div>

      {/* Logout */}
      <div style={S.bottomSection}>
        <button
          style={S.logoutBtn}
          onClick={() => { logout(); navigate("/"); }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,.1)";
            e.currentTarget.style.color = "rgb(239,68,68)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(239,68,68,.7)";
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;