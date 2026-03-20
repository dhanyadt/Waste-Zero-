import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Matches = () => {
  const { matches, setMatchesPageActive } = useAuth();

  useEffect(() => {
    setMatchesPageActive(true);
    return () => setMatchesPageActive(false);
  }, [setMatchesPageActive]);

  return (
    <div className="page" style={{ padding: "1rem" }}>
      <h1>Matches</h1>
      {matches.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No matches yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {matches.map((match, idx) => (
            <div
              key={match.id ?? match._id ?? idx}
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.1)",
                background: "rgba(255,255,255,0.75)",
              }}
            >
              <div style={{ fontSize: "0.9rem", opacity: 0.75 }}>
                {match.name || match.title || "New match"}
              </div>
              <div style={{ marginTop: "6px" }}>
                {match.description || JSON.stringify(match)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;