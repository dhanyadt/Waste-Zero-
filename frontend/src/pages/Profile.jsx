import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const T = {
  gDeep:  "#1b5e20",
  gDark:  "#2e7d32",
  gMid:   "#43a047",
  gLight: "#81c784",
  gPale:  "#e8f5e9",
  gSage:  "#a5c8a0",
  bDark:  "#3e2723",
  bMid:   "#5d4037",
  bLight: "#8d6e63",
  bPale:  "#efebe9",
  bSand:  "#d7ccc8",
  cream:  "#fffdf9",
  textDark: "#1a1a1a",
  textMid:  "#4b3f36",
  textSoft: "#7b6b63",
};

const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const S = {
  /* ── rich green+brown page bg, white cards ── */
  page: {
    minHeight: "100vh",
    fontFamily: font,
    padding: "40px 24px",
    backgroundColor: "#162516",
    backgroundImage: [
      "radial-gradient(ellipse at 15% 85%, rgba(67,160,71,.22) 0%, transparent 50%)",
      "radial-gradient(ellipse at 85% 15%, rgba(93,64,55,.35) 0%, transparent 50%)",
      "radial-gradient(ellipse at 50% 50%, rgba(27,94,32,.4) 0%, transparent 70%)",
      "linear-gradient(135deg, #1a2e1a 0%, #1f1a0e 50%, #2a1a0a 100%)",
    ].join(", "),
  },

  container: { maxWidth: 740, margin: "0 auto" },

  pageTitle: {
    fontFamily: serif,
    fontSize: "28px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "4px",
    letterSpacing: "-.3px",
    textShadow: "0 2px 8px rgba(0,0,0,.3)",
  },
  pageSub: {
    fontSize: "13.5px",
    color: "rgba(255,255,255,.55)",
    marginBottom: "28px",
  },

  tabs: {
    display: "inline-flex",
    borderRadius: "10px",
    background: "rgba(255,255,255,.08)",
    padding: "4px",
    gap: "4px",
    marginBottom: "28px",
    boxShadow: "0 1px 4px rgba(0,0,0,.2)",
    border: "1px solid rgba(255,255,255,.1)",
  },
  tab: (active) => ({
    padding: "9px 28px",
    borderRadius: "8px",
    border: "none",
    fontFamily: font,
    fontSize: "14px",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    background: active ? "#fff" : "transparent",
    color: active ? T.bDark : "rgba(255,255,255,.55)",
    boxShadow: active ? "0 1px 4px rgba(62,39,35,.1)" : "none",
    transition: "all .2s",
  }),

  /* white cards with green-to-brown top accent */
  card: {
    background: "#ffffff",
    borderRadius: "18px",
    border: "1px solid " + T.bSand,
    boxShadow: "0 2px 8px rgba(62,39,35,.09), 0 8px 24px rgba(62,39,35,.06)",
    padding: "32px",
    marginBottom: "24px",
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "3px",
    background: "linear-gradient(90deg, " + T.gDark + ", " + T.gMid + ", " + T.bMid + ")",
    borderRadius: "18px 18px 0 0",
  },

  cardHeader: {
    paddingBottom: "18px",
    borderBottom: "1px solid " + T.bPale,
    marginBottom: "24px",
  },
  cardTitle: {
    fontFamily: serif,
    fontSize: "18px",
    fontWeight: 700,
    color: T.bDark,
    marginBottom: "4px",
  },
  cardSub: { fontSize: "13px", color: T.textSoft },

  fieldRow: { marginBottom: "20px" },

  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: T.bMid,
    marginBottom: "6px",
    letterSpacing: ".4px",
    textTransform: "uppercase",
  },

  readValue: {
    fontSize: "14.5px",
    color: T.textDark,
    padding: "10px 0",
    borderBottom: "1px solid " + T.bPale,
  },

  input: {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid " + T.bSand,
    borderRadius: "11px",
    fontSize: "14.5px",
    fontFamily: font,
    color: T.textDark,
    background: "rgba(255,255,255,.9)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
  },

  inputReadOnly: {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid " + T.bPale,
    borderRadius: "11px",
    fontSize: "14.5px",
    fontFamily: font,
    color: T.textSoft,
    background: "#f7f4f0",
    outline: "none",
    boxSizing: "border-box",
    cursor: "default",
  },

  textarea: {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid " + T.bSand,
    borderRadius: "11px",
    fontSize: "14.5px",
    fontFamily: font,
    color: T.textDark,
    background: "rgba(255,255,255,.9)",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "90px",
    transition: "border-color .2s",
  },

  hint: { fontSize: "12px", color: T.textSoft, marginTop: "5px" },

  badge: {
    display: "inline-block",
    padding: "4px 14px",
    borderRadius: "20px",
    background: T.gPale,
    color: T.gDark,
    fontSize: "12.5px",
    fontWeight: 700,
    textTransform: "capitalize",
    border: "1px solid " + T.gSage,
  },

  btnRow: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid " + T.bPale,
  },

  btnPrimary: {
    padding: "10px 26px",
    background: "linear-gradient(135deg, " + T.gMid + " 0%, " + T.gDark + " 60%, " + T.bMid + " 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "11px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: font,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(46,125,50,.3), inset 0 1px 0 rgba(255,255,255,.1)",
    transition: "opacity .2s, transform .15s",
  },

  btnSecondary: {
    padding: "10px 26px",
    background: T.bPale,
    color: T.textMid,
    border: "1.5px solid " + T.bSand,
    borderRadius: "11px",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily: font,
    cursor: "pointer",
  },

  successMsg: {
    background: T.gPale,
    border: "1px solid " + T.gSage,
    color: T.gDark,
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "13.5px",
    marginBottom: "16px",
  },

  errorMsg: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#c62828",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "13.5px",
    marginBottom: "16px",
  },
};

const focusOn  = (e) => { e.target.style.borderColor = T.gMid; e.target.style.boxShadow = "0 0 0 3px rgba(67,160,71,.15)"; e.target.style.background = "#fff"; };
const focusOff = (e) => { e.target.style.borderColor = T.bSand; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,.9)"; };

const hoverOn  = (e) => { e.currentTarget.style.opacity = ".9";  e.currentTarget.style.transform = "translateY(-1px)"; };
const hoverOff = (e) => { e.currentTarget.style.opacity = "1";   e.currentTarget.style.transform = "translateY(0)"; };

const Profile = () => {
  const { user, updateUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", skills: "", location: "", bio: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });
  const [showPasswords, setShowPasswords] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });

  const toggleShow = (field) => setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        skills: user.skills?.join(", ") || "",
        location: user.location || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: font }}>
        <p style={{ color: T.textSoft }}>Loading…</p>
      </div>
    );
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
          location: formData.location,
          bio: formData.bio,
        }),
      });
      const data = await res.json();
      if (res.ok) { updateUser(data.user); setEditing(false); }
      else alert(data.message);
    } catch (err) { console.error(err); }
  };

  const handleChangePassword = async () => {
    setPasswordMessage({ text: "", type: "" });
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordMessage({ text: "All fields are required", type: "error" });
    if (newPassword !== confirmPassword)
      return setPasswordMessage({ text: "New passwords do not match", type: "error" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ text: "Password updated successfully ✅", type: "success" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordMessage({ text: data.message, type: "error" });
      }
    } catch {
      setPasswordMessage({ text: "Something went wrong", type: "error" });
    }
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        <h1 style={S.pageTitle}>My Profile</h1>
        <p style={S.pageSub}>Manage your account information and settings</p>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={S.tab(activeTab === "profile")}  onClick={() => setActiveTab("profile")}>Profile</button>
          <button style={S.tab(activeTab === "password")} onClick={() => setActiveTab("password")}>Password</button>
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div style={S.card}>
            <div style={S.cardAccent} />

            <div style={S.cardHeader}>
              <h2 style={S.cardTitle}>Personal Information</h2>
              <p style={S.cardSub}>Update your personal information and profile details</p>
            </div>

            {/* Full Name */}
            <div style={S.fieldRow}>
              <label style={S.label}>Full Name</label>
              {editing
                ? <input name="name" value={formData.name} onChange={handleChange} onFocus={focusOn} onBlur={focusOff} style={S.input} />
                : <p style={S.readValue}>{user?.name || "—"}</p>}
            </div>

            {/* Email (read-only) */}
            <div style={S.fieldRow}>
              <label style={S.label}>Email</label>
              <input value={user?.email || ""} readOnly style={S.inputReadOnly} />
              <p style={S.hint}>This is the email address used for account notifications.</p>
            </div>

            {/* Role */}
            <div style={S.fieldRow}>
              <label style={S.label}>Role</label>
              <div><span style={S.badge}>{user?.role}</span></div>
            </div>

            {/* Location */}
            <div style={S.fieldRow}>
              <label style={S.label}>Location</label>
              {editing ? (
                <>
                  <input name="location" value={formData.location} onChange={handleChange} onFocus={focusOn} onBlur={focusOff} style={S.input} placeholder="City, Country" />
                  <p style={S.hint}>This helps match you with nearby opportunities.</p>
                </>
              ) : (
                <p style={S.readValue}>{user?.location || "—"}</p>
              )}
            </div>

            {/* Skills */}
            <div style={S.fieldRow}>
              <label style={S.label}>Skills</label>
              {editing
                ? <input name="skills" value={formData.skills} onChange={handleChange} onFocus={focusOn} onBlur={focusOff} style={S.input} placeholder="e.g. React, teamwork, etc." />
                : <p style={S.readValue}>{user?.skills?.join(", ") || "—"}</p>}
            </div>

            {/* Bio */}
            <div style={S.fieldRow}>
              <label style={S.label}>Bio</label>
              {editing
                ? <textarea name="bio" value={formData.bio} onChange={handleChange} onFocus={focusOn} onBlur={focusOff} style={S.textarea} placeholder="Tell us a bit about yourself…" />
                : <p style={S.readValue}>{user?.bio || "—"}</p>}
            </div>

            {/* Buttons */}
            <div style={S.btnRow}>
              {editing ? (
                <>
                  <button style={S.btnPrimary} onClick={handleSave} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Save Changes</button>
                  <button style={S.btnSecondary} onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button style={S.btnPrimary} onClick={() => setEditing(true)} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Edit Profile</button>
              )}
            </div>
          </div>
        )}

        {/* ── PASSWORD TAB ── */}
        {activeTab === "password" && (
          <div style={S.card}>
            <div style={S.cardAccent} />

            <div style={S.cardHeader}>
              <h2 style={S.cardTitle}>Change Password</h2>
              <p style={S.cardSub}>Update your password to secure your account</p>
            </div>

            {passwordMessage.text && (
              <div style={passwordMessage.type === "success" ? S.successMsg : S.errorMsg}>
                {passwordMessage.text}
              </div>
            )}

            {[
              { name: "currentPassword", label: "Current Password" },
              { name: "newPassword",     label: "New Password", hint: "Password must be at least 6 characters long." },
              { name: "confirmPassword", label: "Confirm New Password" },
            ].map(({ name, label, hint }) => (
              <div key={name} style={S.fieldRow}>
                <label style={S.label}>{label}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPasswords[name] ? "text" : "password"}
                    name={name}
                    value={passwordData[name]}
                    onChange={handlePasswordChange}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    style={{ ...S.input, paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow(name)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      fontSize: "17px",
                      cursor: "pointer",
                      color: T.bLight,
                      padding: "2px",
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = T.gMid; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = T.bLight; }}
                  >
                    {showPasswords[name] ? "👁️" : "🔒"}
                  </button>
                </div>
                {hint && <p style={S.hint}>{hint}</p>}
              </div>
            ))}

            <div style={S.btnRow}>
              <button style={S.btnPrimary} onClick={handleChangePassword} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;