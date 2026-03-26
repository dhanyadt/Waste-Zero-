import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Camera,
  User,
  Target,
  Calendar,
  MessageSquare,
  TrendingUp,
  Settings,
  HelpCircle,
  Shield,
} from "lucide-react";
import ProfileUploadModal from "../ui/ProfileUploadModal";

const T = {
  gDeep: "#1b5e20",
  gDark: "#2e7d32",
  gMid: "#43a047",
  gLight: "#81c784",
  gPale: "#c8e6c9",
  gSage: "#a5c8a0",
  bDark: "#3e2723",
  bMid: "#5d4037",
  bLight: "#8d6e63",
  bPale: "#efebe9",
  bSand: "#d7ccc8",
};
const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const S = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #1a2e1a 0%, #1f1a0e 50%, #2a1a0a 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    position: "relative",
    overflow: "hidden",
    fontFamily: font,
    boxShadow: "2px 0 20px rgba(0,0,0,.3)",
    flexShrink: 0,
  },
  /* decorative rings */
  ring1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    border: "50px solid rgba(67,160,71,.06)",
    top: -80,
    left: -80,
    pointerEvents: "none",
  },
  ring2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: "50%",
    border: "36px solid rgba(93,64,55,.07)",
    bottom: 60,
    right: -70,
    pointerEvents: "none",
  },
  topGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(67,160,71,.12) 0%, transparent 70%)",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
  },
  /* logo bar */
  logoBar: {
    padding: "20px 20px 0",
    display: "flex",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 1,
    borderBottom: "1px solid rgba(255,255,255,.06)",
    paddingBottom: 16,
    marginBottom: 4,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "rgba(67,160,71,.2)",
    border: "1px solid rgba(67,160,71,.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  logoText: {
    fontFamily: serif,
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-.2px",
  },
  /* profile section */
  profileSection: {
    padding: "16px 20px 12px",
    position: "relative",
    zIndex: 1,
    borderBottom: "1px solid rgba(255,255,255,.06)",
    marginBottom: 8,
  },
  avatarWrap: { position: "relative", width: 52, height: 52, marginBottom: 10 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${T.gMid}, ${T.bMid})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    border: "2px solid rgba(255,255,255,.15)",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,.3)",
  },
  cameraBtn: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: T.gMid,
    border: "2px solid rgba(26,46,26,1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background .2s",
  },
  userName: { fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 },
  userRole: {
    fontSize: 12,
    color: T.gSage,
    textTransform: "capitalize",
    marginBottom: 6,
  },
  statusDot: (avail) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    color: "rgba(255,255,255,.5)",
  }),
  dot: (avail) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: avail ? T.gLight : T.bSand,
    boxShadow: avail ? "0 0 6px rgba(129,199,132,.6)" : "none",
  }),
  /* nav */
  navSection: { padding: "4px 12px", flex: 1, position: "relative", zIndex: 1 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,.3)",
    padding: "10px 8px 4px",
  },
  navBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    marginBottom: 2,
    fontFamily: font,
    fontSize: 13.5,
    fontWeight: active ? 600 : 400,
    background: active
      ? "linear-gradient(135deg, rgba(67,160,71,.25), rgba(46,125,50,.15))"
      : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,.6)",
    borderLeft: active ? `3px solid ${T.gMid}` : "3px solid transparent",
    transition: "all .2s",
    textAlign: "left",
  }),
  iconWrap: (active) => ({
    width: 28,
    height: 28,
    borderRadius: 8,
    background: active ? "rgba(67,160,71,.3)" : "rgba(255,255,255,.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background .2s",
  }),
  /* bottom area */
  bottomSection: {
    padding: "12px 12px 20px",
    borderTop: "1px solid rgba(255,255,255,.06)",
    position: "relative",
    zIndex: 1,
  },
  darkModeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    marginBottom: 4,
  },
  darkLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,.5)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontFamily: font,
    fontSize: 13.5,
    fontWeight: 500,
    background: "transparent",
    color: "rgba(239,68,68,.7)",
    transition: "all .2s",
    textAlign: "left",
  },
};

const Sidebar = () => {
  const { user, logout, notificationCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) return null; 

  const isActive = (path) => location.pathname === path;

  const mainNav = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={14} />,
    },
    {
      label: "Schedule Pickup",
      path: "/schedule",
      icon: <Calendar size={14} />,
    },
    {
      label: "Opportunities",
      path: "/opportunities",
      icon: <Target size={14} />,
    },
    { label: "Messages", path: "/messages", icon: <MessageSquare size={14} /> },
    { label: "My Impact", path: "/impact", icon: <TrendingUp size={14} /> },
  ];

  const settingsNav = [
    { label: "My Profile", path: "/profile", icon: <User size={14} /> },
    { label: "Settings", path: "/settings", icon: <Settings size={14} /> },
    { label: "Help & Support", path: "/help", icon: <HelpCircle size={14} /> },
    ...(user?.role === "admin"
      ? [{ label: "Admin Panel", path: "/admin", icon: <Shield size={14} /> }]
      : []),
  ];

  const initials = user?.name
  ? user.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  : "";

  return (
    <div style={S.sidebar}>
      {/* decorative */}
      <div style={S.ring1} />
      <div style={S.ring2} />
      <div style={S.topGlow} />

      {/* Logo bar */}
      <div style={S.logoBar}>
        <div style={S.logoIcon}>♻️</div>
        <span style={S.logoText}>WasteZero</span>
      </div>

      {/* Profile */}
      <div style={S.profileSection}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={S.avatarWrap}>
            <div style={S.avatar}>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>
            <button style={S.cameraBtn} onClick={() => setIsModalOpen(true)}>
              <Camera size={10} color="#fff" />
            </button>
          </div>
          <div>
            <p style={S.userName}>
  {user ? user.name : ""}
</p>
            <p style={S.userRole}>
              {user ? (
  user.role.charAt(0).toUpperCase() + user.role.slice(1)
) : ""}
            </p>
          
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div style={S.navSection}>
        <p style={S.sectionLabel}>Main Menu</p>
        {mainNav.map(({ label, path, icon }) => (
          <button
            key={path}
            style={S.navBtn(isActive(path))}
            onClick={() => navigate(path)}
            onMouseEnter={(e) => {
              if (!isActive(path))
                e.currentTarget.style.background = "rgba(255,255,255,.06)";
              e.currentTarget.style.color = "rgba(255,255,255,.9)";
            }}
            onMouseLeave={(e) => {
              if (!isActive(path)) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,.6)";
              }
            }}
          >
            <div style={S.iconWrap(isActive(path))}>{icon}</div>
            <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
            {path === "/messages" && notificationCount > 0 && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: "0 6px",
                  borderRadius: 999,
                  background: "rgba(239,68,68,.85)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>
        ))}

        <p style={S.sectionLabel}>Settings</p>
        {settingsNav.map(({ label, path, icon }) => (
          <button
            key={path}
            style={S.navBtn(isActive(path))}
            onClick={() => navigate(path)}
            onMouseEnter={(e) => {
              if (!isActive(path))
                e.currentTarget.style.background = "rgba(255,255,255,.06)";
              e.currentTarget.style.color = "rgba(255,255,255,.9)";
            }}
            onMouseLeave={(e) => {
              if (!isActive(path)) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,.6)";
              }
            }}
          >
            <div style={S.iconWrap(isActive(path))}>{icon}</div>
            {label}
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div style={S.bottomSection}>
        <button
          style={S.logoutBtn}
          onClick={() => {
            logout();
            navigate("/");
          }}
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

      <ProfileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
