import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOpportunities, applyToOpportunity, getMyApplications } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import { MapPin, Clock, Building2, Search, CheckCircle2, X } from "lucide-react";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};

const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

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

  // 🌙 DARK MODE STATE
  const [darkMode, setDarkMode] = useState(false);

  const isNgo = user?.role?.toLowerCase() === "ngo";
  const dashboardRoute = isNgo ? "/ngo-dashboard" : "/volunteer-dashboard";

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
      (response?.data?.applications || []).forEach(app => {
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
      setApplicationStatus(prev => ({ ...prev, [opportunityId]: "pending" }));
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(null);
    }
  };

  const filtered = opportunities.filter(o =>
    !search ||
    o.title?.toLowerCase().includes(search.toLowerCase()) ||
    o.location?.toLowerCase().includes(search.toLowerCase()) ||
    o.requiredSkills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{
        display:"flex",
        minHeight:"100vh",
        fontFamily:font,
        background: darkMode ? "#1a1a1a" : "#f3f4f6"
      }}>
        <Sidebar />
        <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <p>Loading opportunities…</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      display:"flex",
      minHeight:"100vh",
      fontFamily:font,
      background: darkMode ? "#002200" : "#c0e0c0"
      //background: darkMode ? "#1a1a1a" : "#f3f4f6"
    }}>
      <Sidebar />

      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto" }}>

        {/* HEADER */}
        <div style={{
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          marginBottom:28
        }}>

          <div>
            <h1 style={{
              fontFamily:serif,
              fontSize:28,
              fontWeight:800,
              color: darkMode ? "#fff" : T.bDark,
              margin:"0 0 4px"
            }}>
              Volunteer Opportunities
            </h1>

            <p style={{
              fontSize:14,
              color: darkMode ? "#bbb" : T.textSoft,
              margin:0
            }}>
              Find ways to make a difference in your community
            </p>
          </div>

          {/* DARK MODE TOGGLE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding:"8px 14px",
              borderRadius:"8px",
              border:"none",
              cursor:"pointer",
              background: darkMode ? "#444" : "#ddd",
              color: darkMode ? "#fff" : "#000",
              fontWeight:600
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

        </div>


        {/* SEARCH */}
        <div style={{ position:"relative", marginBottom:24, maxWidth:480 }}>
          <Search size={16} color={T.bLight}
            style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }} />

          <input
            type="text"
            placeholder="Search by title, location or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:"100%",
              padding:"11px 16px 11px 40px",
              borderRadius:10,
              border:`1px solid ${T.bSand}`,
              fontSize:14,
              fontFamily:font,
              background: darkMode ? "#2c2c2c" : "#fff",
              color: darkMode ? "#fff" : "#000"
            }}
          />
        </div>


        {error && (
          <div style={{
            background:"#fef2f2",
            border:"1px solid #fecaca",
            color:"#c62828",
            borderRadius:10,
            padding:"10px 14px",
            fontSize:13.5,
            marginBottom:20
          }}>
            {error}
          </div>
        )}


        {filtered.length === 0 ? (
          <p>No opportunities found</p>
        ) : (

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))",
            gap:16
          }}>

            {filtered.map((opp) => (

              <div key={opp._id}
                style={{
                  borderRadius:16,
                  background: darkMode ? "#2c2c2c" : "#fff",
                  border:`1px solid ${T.bSand}`,
                  padding:"22px 24px"
                }}>

                <h3 style={{
                  margin:0,
                  fontSize:16,
                  fontWeight:700,
                  color: darkMode ? "#fff" : T.bDark
                }}>
                  {opp.title}
                </h3>

                <p style={{
                  fontSize:13.5,
                  color: darkMode ? "#ccc" : T.textMid,
                  marginTop:8
                }}>
                  {opp.description}
                </p>

                <div style={{ marginTop:12 }}>

                  <p style={{ fontSize:13 }}>
                    <Building2 size={14}/> {opp.ngo?.name}
                  </p>

                  <p style={{ fontSize:13 }}>
                    <MapPin size={14}/> {opp.location}
                  </p>

                  <p style={{ fontSize:13 }}>
                    <Clock size={14}/> {opp.duration}
                  </p>

                </div>


                {!isNgo && (
                  <button
                    onClick={() => handleApply(opp._id)}
                    disabled={applying === opp._id}
                    style={{
                      width:"100%",
                      marginTop:14,
                      padding:"11px",
                      background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                      color:"#fff",
                      border:"none",
                      borderRadius:10,
                      fontWeight:600,
                      cursor:"pointer"
                    }}
                  >
                    {applying === opp._id ? "Applying…" : "Apply Now"}
                  </button>
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