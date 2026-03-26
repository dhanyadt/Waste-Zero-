import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMatches } from "../services/api";

const Matches = () => {
  const { matches: socketMatches, setMatchesPageActive } = useAuth();
  const [apiMatches, setApiMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setMatchesPageActive(true);
    
    const fetchMatches = async () => {
      try {
        const res = await getMatches();
        setApiMatches(res.data.matches || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
    
    return () => setMatchesPageActive(false);
  }, [setMatchesPageActive]);

  // Merge so we see both API matches and any new ones pushed via socket that might not be in the initial GET
  const displayMatches = [...apiMatches, ...socketMatches];

  return (
    <div className="page" style={{ padding: "1rem" }}>
      <h1>Matches</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading matches...</p>
      ) : displayMatches.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No matches yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayMatches.map((match, idx) => {
            const opp = match.opportunity || match;
            return (
              <div
                key={opp._id || opp.id || idx}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "rgba(255,255,255,0.75)",
                }}
              >
                <div style={{ fontSize: "0.9rem", opacity: 0.75 }}>
                  {opp.title || opp.name || "New match"}
                </div>
                <div style={{ marginTop: "6px" }}>
                  {opp.description || "You have a potential match with this opportunity based on your skills."}
                </div>
                {match.matchScore > 0 && (
                  <div style={{ marginTop: "6px", fontSize: "0.85rem", color: "green" }}>
                    Match Score: {match.matchScore}%
                  </div>
                )}
                {opp.createdBy?._id && (
                  <button
                    onClick={() => (window.location.href = `/messages/${opp.createdBy._id}`)}
                    style={{
                      marginTop: "12px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#2e7d32",
                      color: "white",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Message NGO
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
//matches folder
export default Matches;