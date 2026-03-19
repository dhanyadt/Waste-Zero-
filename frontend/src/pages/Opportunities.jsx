import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllOpportunities,
  applyToOpportunity,
  getMyApplications,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import Toast from "../components/ui/Toast";
import {
  MapPin,
  Clock,
  Building2,
  Search,
  CheckCircle2,
  X,
} from "lucide-react";

const T = {
  gDeep: "#1b5e20",
  gDark: "#2e7d32",
  gMid: "#43a047",
  gPale: "#e8f5e9",
  gSage: "#a5c8a0",
  bDark: "#3e2723",
  bMid: "#5d4037",
  bLight: "#8d6e63",
  bPale: "#efebe9",
  bSand: "#d7ccc8",
  textDark: "#1c1008",
  textMid: "#4b3f36",
  textSoft: "#7b6b63",
};
const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  .opp-card { animation: fadeUp .3s ease both; transition: box-shadow .2s, transform .2s; }
  .opp-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.13) !important; transform: translateY(-3px); }
  .btn-apply { transition: all .2s !important; }
  .btn-apply:hover:not(:disabled) { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 8px 22px rgba(46,125,50,.45) !important; }
  .btn-apply:active:not(:disabled) { transform:translateY(0) !important; }
  .toast { animation: slideDown .25s ease both; }
  .search-input:focus { border-color: #43a047 !important; box-shadow: 0 0 0 3px rgba(67,160,71,.15) !important; outline:none !important; }
`;

const StatusBadge = ({ status }) => {
  const cfg = {
    open: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Open" },
    closed: {
      bg: "#fee2e2",
      color: "#b91c1c",
      dot: "#ef4444",
      label: "Closed",
    },
    "in-progress": {
      bg: "#fef9c3",
      color: "#a16207",
      dot: "#eab308",
      label: "In Progress",
    },
  }[status] || { bg: T.bPale, color: T.bLight, dot: T.bSand, label: status };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 11px",
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
};

const AppStatusBadge = ({ status }) => {
  const cfg =
    {
      pending: {
        bg: "#fef9c3",
        color: "#a16207",
        dot: "#eab308",
        label: "Pending",
        msg: "Application under review",
      },
      accepted: {
        bg: "#dcfce7",
        color: "#15803d",
        dot: "#22c55e",
        label: "Accepted",
        msg: "Congratulations! You're accepted",
      },
      rejected: {
        bg: "#fee2e2",
        color: "#b91c1c",
        dot: "#ef4444",
        label: "Rejected",
        msg: "Application was not selected",
      },
    }[status] || null;
  if (!cfg) return null;
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 13px",
          borderRadius: 20,
          background: cfg.bg,
          color: cfg.color,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: cfg.dot,
          }}
        />
        {cfg.label}
      </span>
      <p style={{ fontSize: 12.5, color: T.textSoft, margin: "6px 0 0" }}>
        {cfg.msg}
      </p>
    </div>
  );
};

const Opportunities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const isNgo = user?.role?.toLowerCase() === "ngo";
  const dashboardRoute = isNgo ? "/ngo-dashboard" : "/volunteer-dashboard";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchOpportunities();
    if (!isNgo) fetchMyApplications();
  }, [user]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getAllOpportunities();
      setOpportunities(response?.data?.opportunities || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await getMyApplications();
      const statusMap = {};
      (response?.data?.applications || []).forEach((app) => {
        statusMap[app._id] = app.applicationStatus;
      });
      setApplicationStatus(statusMap);
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  };

  const handleApply = async (opportunityId) => {
    try {
      setApplying(opportunityId);
      await applyToOpportunity(opportunityId);
      setApplicationStatus((prev) => ({ ...prev, [opportunityId]: "pending" }));
      showToast("Application submitted successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to apply", "error");
    } finally {
      setApplying(null);
    }
  };

  const filtered = opportunities.filter(
    (o) =>
      !search ||
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.location?.toLowerCase().includes(search.toLowerCase()) ||
      o.requiredSkills?.some((s) =>
        s.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: font,
          backgroundImage: [
            "radial-gradient(ellipse at 0% 0%, rgba(27,94,32,.25) 0%, transparent 45%)",
            "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
          ].join(", "),
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>
            Loading opportunities…
          </p>
        </main>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: font,
        backgroundImage: [
          "radial-gradient(ellipse at 0% 0%, rgba(27,94,32,.25) 0%, transparent 45%)",
          "radial-gradient(ellipse at 100% 100%, rgba(62,39,35,.22) 0%, transparent 45%)",
          "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
        ].join(", "),
      }}
    >
      <style>{css}</style>
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Sidebar />

      <main style={{ flex: 1, padding: "40px 36px", overflowY: "auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: serif,
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 4px",
                letterSpacing: "-.4px",
              }}
            >
              Volunteer Opportunities
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,.45)",
                margin: 0,
              }}
            >
              Find ways to make a difference in your community
            </p>
          </div>
          <button
            onClick={() => navigate(dashboardRoute)}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.15)",
              background: "rgba(255,255,255,.08)",
              color: "rgba(255,255,255,.7)",
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: font,
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              transition: "all .2s",
            }}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 24, maxWidth: 480 }}>
          <Search
            size={16}
            color={T.bLight}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            className="search-input"
            type="text"
            placeholder="Search by title, location or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 16px 11px 40px",
              boxSizing: "border-box",
              border: `1.5px solid rgba(255,255,255,.12)`,
              borderRadius: 10,
              fontSize: 14,
              fontFamily: font,
              background: "rgba(255,255,255,.08)",
              color: "#fff",
              transition: "border-color .2s, box-shadow .2s",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#c62828",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13.5,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* NGO notice */}
        {isNgo && (
          <div
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 13.5,
              color: "rgba(255,255,255,.55)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#eab308",
                flexShrink: 0,
              }}
            />
            You're viewing as NGO — apply buttons are only visible to
            volunteers.
          </div>
        )}

        {filtered.length === 0 ? (
          <div
            style={{
              borderRadius: 18,
              background: "#fff",
              border: `1px solid ${T.bSand}`,
              padding: "56px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: T.gPale,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <Search size={24} color={T.gDark} />
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: T.textMid,
                margin: "0 0 4px",
              }}
            >
              No opportunities found
            </p>
            <p style={{ fontSize: 13, color: T.bLight, margin: 0 }}>
              {search
                ? "Try a different search term"
                : "Check back later for new opportunities"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((opp, i) => (
              <div
                key={opp._id}
                className="opp-card"
                style={{
                  borderRadius: 16,
                  background: "#fff",
                  border: `1px solid ${T.bSand}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,.12)",
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15.5,
                      fontWeight: 700,
                      color: T.bDark,
                      lineHeight: 1.35,
                    }}
                  >
                    {opp.title}
                  </h3>
                  <StatusBadge status={opp.status} />
                </div>

                {/* Meta */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 13.5,
                      color: T.textMid,
                    }}
                  >
                    <Building2 size={13} color={T.bLight} />{" "}
                    <strong style={{ fontWeight: 600 }}>NGO:</strong>{" "}
                    {opp.ngo?.name || opp.createdBy?.name || "—"}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 13.5,
                      color: T.textMid,
                    }}
                  >
                    <MapPin size={13} color={T.bLight} />{" "}
                    <strong style={{ fontWeight: 600 }}>Location:</strong>{" "}
                    {opp.location}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 13.5,
                      color: T.textMid,
                    }}
                  >
                    <Clock size={13} color={T.bLight} />{" "}
                    <strong style={{ fontWeight: 600 }}>Duration:</strong>{" "}
                    {opp.duration}
                  </span>
                </div>

                {/* Skills */}
                {opp.requiredSkills?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <p
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: T.textSoft,
                        margin: "0 0 7px",
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                      }}
                    >
                      Skills Required
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {opp.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: T.gPale,
                            color: T.gDark,
                            fontSize: 12,
                            fontWeight: 500,
                            border: `1px solid ${T.gSage}`,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p
                  style={{
                    fontSize: 13.5,
                    color: T.textMid,
                    lineHeight: 1.6,
                    margin: "0 0 16px",
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {opp.description}
                </p>

                {/* Action — only show for volunteers */}
                {!isNgo && (
                  <div
                    style={{
                      borderTop: `1px solid ${T.bPale}`,
                      paddingTop: 14,
                      marginTop: "auto",
                    }}
                  >
                    {applicationStatus[opp._id] ? (
                      <AppStatusBadge status={applicationStatus[opp._id]} />
                    ) : opp.status === "open" ? (
                      <button
                        className="btn-apply"
                        onClick={() => handleApply(opp._id)}
                        disabled={applying === opp._id}
                        style={{
                          width: "100%",
                          padding: "11px",
                          background:
                            applying === opp._id
                              ? "#9ca3af"
                              : `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: font,
                          cursor:
                            applying === opp._id ? "not-allowed" : "pointer",
                          boxShadow:
                            applying === opp._id
                              ? "none"
                              : "0 4px 14px rgba(46,125,50,.3)",
                        }}
                      >
                        {applying === opp._id ? "Applying…" : "Apply Now"}
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          width: "100%",
                          padding: "11px",
                          background: "#f3f4f6",
                          color: "#9ca3af",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: font,
                          cursor: "not-allowed",
                        }}
                      >
                        Not Available
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Opportunities;
