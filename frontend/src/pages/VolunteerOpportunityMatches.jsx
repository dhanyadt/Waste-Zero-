import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getMatches, getOpportunityById, applyToOpportunity, updateUserProfile } from "../services/api";
import { Target, Search, MapPin, Filter, ChevronLeft, ChevronRight, Loader2, Users, Building2, Star } from "lucide-react";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047", gLight:"#81c784",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
  gold: "#facc15", purple: "#a78bfa"
};
const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
  .match-card { animation: fadeUp .4s ease both; transition: all .2s; }
  .match-card:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(0,0,0,.22) !important; }
  .filter-section { animation: fadeUp .3s ease both; }
  .btn-primary { transition: all .2s !important; }
  .btn-primary:hover { opacity:.9 !important; transform:translateY(-1px) !important; }
  .score-badge { animation: scaleIn .2s ease both; }
`;

const ScoreBadge = ({ score, maxScore=100 }) => (
  <div className="score-badge" style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "4px 12px", borderRadius: 20,
    background: `linear-gradient(135deg, ${T.gold} 0%, #fbbf24 100%)`,
    color: T.textDark, fontSize: 12, fontWeight: 700,
    boxShadow: "0 2px 8px rgba(250,204,21,.4)",
  }}>
    <Star size={12} fill="currentColor" />
    {Math.round((score / maxScore) * 100)}%
  </div>
);

const FilterSection = ({ filters, setFilters, totalMatches }) => (
  <div className="filter-section" style={{
    display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 24,
    padding: "20px", borderRadius: 16, background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200 }}>
      <Search size={18} color="rgba(255,255,255,.6)" />
      <input
        placeholder="Search opportunities by title or skill..."
        value={filters.search}
        onChange={(e) => setFilters({...filters, search: e.target.value})}
        style={{
          flex: 1, padding: "10px 14px", borderRadius: 12, border: "none",
          background: "rgba(255,255,255,.1)", color: "#fff",
          fontSize: 14, backdropFilter: "blur(10px)",
        }}
      />
    </div>
    
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <MapPin size={16} color="rgba(255,255,255,.6)" />
      <input
        placeholder="Location (e.g. Bangalore)"
        value={filters.location}
        onChange={(e) => setFilters({...filters, location: e.target.value})}
        style={{
          width: 160, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)",
          background: "rgba(255,255,255,.08)", color: "#fff", fontSize: 13,
        }}
      />
    </div>
    
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Filter size={16} color="rgba(255,255,255,.6)" />
      <select
        value={filters.minScore}
        onChange={(e) => setFilters({...filters, minScore: parseInt(e.target.value)})}
        style={{
          padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.2)",
          background: "rgba(255,255,255,.08)", color: "#fff", fontSize: 13,
        }}
      >
        <option value={0}>All Scores</option>
        <option value={10}>10%+</option>
        <option value={25}>25%+</option>
        <option value={50}>50%+</option>
      </select>
    </div>
    
    <div style={{ marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>
      {totalMatches} matches found
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 32, padding: "16px 24px",
  }}>
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage <= 1}
      style={{
        padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.gSage}`,
        background: currentPage <= 1 ? "rgba(255,255,255,.05)" : T.gPale,
        color: currentPage <= 1 ? "rgba(255,255,255,.4)" : T.gDark,
        cursor: currentPage <= 1 ? "default" : "pointer",
      }}
    >
      <ChevronLeft size={16} />
    </button>
    <span style={{ fontWeight: 600, color: "#fff", minWidth: 60, textAlign: "center" }}>
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= totalPages}
      style={{
        padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.gSage}`,
        background: currentPage >= totalPages ? "rgba(255,255,255,.05)" : T.gPale,
        color: currentPage >= totalPages ? "rgba(255,255,255,.4)" : T.gDark,
        cursor: currentPage >= totalPages ? "default" : "pointer",
      }}
    >
      <ChevronRight size={16} />
    </button>
  </div>
);

const VolunteerOpportunityMatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", location: "", minScore: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);

  // Apply Modal functions (copied from VolunteerDashboard)
  const openApplyModal = async (oppId) => {
    try {
      setSelectedOppId(oppId);
      const oppResponse = await getOpportunityById(oppId);
      setSelectedOpportunity(oppResponse.data.opportunity);
      
      // Pre-fill with current user data
      setApplyData({
        name: user?.name || '',
        skills: user?.skills?.join(', ') || '',
        location: user?.location || ''
      });
      
      // Initial skill preview
      updateSkillPreview(oppResponse.data.opportunity.requiredSkills || [], user?.skills || []);
      
      setShowApplyModal(true);
    } catch (err) {
      console.error('Failed to load opportunity:', err);
    }
  };

  const updateSkillPreview = (oppSkills, userSkills) => {
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
    const matched = oppSkills.filter(skill => userSkillSet.has(skill.toLowerCase().trim()));
    setSkillPreview({
      matchedCount: matched.length,
      matchedSkills: matched,
      totalOppSkills: oppSkills.length
    });
  };

  const handleSubmitApply = async () => {
    if (!applyData.name.trim() || !applyData.location.trim() || !applyData.skills.trim()) {
      setError('Please fill all fields');
      return;
    }

    try {
      setApplying(true);
      setError('');

      // Parse skills
      const skills = applyData.skills.split(',').map(s => s.trim()).filter(Boolean);

      // Update profile first
      await updateUserProfile({ 
        name: applyData.name.trim(),
        skills,
        location: applyData.location.trim()
      });

      // Then apply
      await applyToOpportunity(selectedOppId);

      setError("Application submitted successfully! ✅");
      setTimeout(() => setError(""), 4000);
      setShowApplyModal(false);
    } catch (err) {
      console.error("Apply error:", err);
      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  // Apply Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applyData, setApplyData] = useState({ name: '', skills: '', location: '' });
  const [applying, setApplying] = useState(false);
  const [skillPreview, setSkillPreview] = useState({ matchedCount: 0, matchedSkills: [], totalOppSkills: 0 });

  const PAGE_SIZE = 12;
  const filteredMatches = matches.filter((match) => {
    const titleMatch = match.opportunity.title.toLowerCase().includes(filters.search.toLowerCase());
    const skillMatch = match.opportunity.requiredSkills?.some(skill => 
      skill.toLowerCase().includes(filters.search.toLowerCase())
    ) || !filters.search;
    const ngoMatch = match.opportunity.createdBy?.name?.toLowerCase().includes(filters.search.toLowerCase()) || !filters.search;
    const locationMatch = !filters.location || 
      match.opportunity.location?.toLowerCase().includes(filters.location.toLowerCase());
    const scoreMatch = match.matchScore >= filters.minScore;
    return (titleMatch || skillMatch || ngoMatch) && locationMatch && scoreMatch;
  });

  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMatches();
      setMatches(response.data.matches || []);
      setTotalMatches(response.data.matches?.length || 0);
    } catch (err) {
      console.error("Fetch matches error:", err);
      setError(err.response?.data?.message || "Failed to load matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "volunteer") {
      fetchMatches();
    }
  }, [user]);

  if (!user || user.role !== "volunteer") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div style={{
      display: "flex", minHeight: "100vh", fontFamily: font,
      background: "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
    }}>
      <style>{css}</style>
      <Sidebar />
      
      <main style={{ flex: 1, padding: "40px 36px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Target size={22} color="rgba(255,255,255,.8)" />
            </div>
            <div>
              <h1 style={{ 
                fontFamily: serif, fontSize: 28, fontWeight: 800, 
                color: "#fff", margin: 0, letterSpacing: "-.4px" 
              }}>
                Opportunity Matches
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", margin: 0 }}>
                Find opportunities perfectly matched to your skills and location
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b",
            borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "80px 40px", color: "rgba(255,255,255,.5)",
          }}>
            <Loader2 size={48} className="animate-spin" color={T.gLight} />
            <p style={{ marginTop: 16, fontSize: 15 }}>Calculating best skill matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "100px 40px", textAlign: "center", color: "rgba(255,255,255,.4)",
          }}>
            <Target size={64} style={{ opacity: .3, marginBottom: 20 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
              No matches found
            </h2>
            <p style={{ fontSize: 15, margin: 0 }}>
              Update your skills and location in profile for better recommendations
            </p>
          </div>
        ) : (
          <>
            <FilterSection 
              filters={filters} 
              setFilters={setFilters} 
              totalMatches={filteredMatches.length} 
            />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {paginatedMatches.map((match, index) => (
                <div key={match.opportunity._id} className="match-card" style={{
                  padding: "24px 28px", borderRadius: 18, cursor: "pointer",
                  border: `1px solid rgba(255,255,255,.08)`,
                  background: "rgba(255,255,255,.04)", backdropFilter: "blur(16px)",
                  animationDelay: `${0.1 + index * 0.05}s`,
                }} onClick={() => navigate(`/opportunities/${match.opportunity._id}`)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 16,
                          background: `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Building2 size={24} color="#fff" />
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 4px",
                          }}>
                            {match.opportunity.title}
                          </h3>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                            {match.opportunity.requiredSkills?.slice(0, 5).map((skill, i) => (
                              <span key={i} style={{
                                padding: "4px 10px", borderRadius: 12,
                                background: T.gPale, color: T.gDark,
                                fontSize: 12, fontWeight: 600,
                              }}>
                                {skill}
                              </span>
                            ))}
                            {match.opportunity.requiredSkills?.length > 5 && (
                              <span style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>
                                +{match.opportunity.requiredSkills.length - 5} more
                              </span>
                            )}
                          </div>
                          {match.matchingSkills && match.matchingSkills.length > 0 && (
                            <div style={{ fontSize: 12, color: T.gLight, marginBottom: 8 }}>
                              💚 {match.matchingSkills.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        <ScoreBadge score={match.matchScore} />
                        {match.opportunity.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", 
                            background: "rgba(255,255,255,.08)", borderRadius: 20 }}>
                            <MapPin size={14} color={T.gLight} />
                            <span style={{ fontSize: 13, color: "#fff" }}>{match.opportunity.location}</span>
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                          {match.opportunity.duration || 'Flexible'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div style={{ marginBottom: 12, fontSize: 13, color: "rgba(255,255,255,.6)" }}>
                        Posted by: <strong style={{ color: "#fff" }}>{match.opportunity.createdBy?.name || 'NGO'}</strong>
                      </div>
                      <button 
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openApplyModal(match.opportunity._id);
                        }}
                        style={{
                          padding: "12px 24px", borderRadius: 12,
                          background: `linear-gradient(135deg, ${T.gDark}, ${T.gMid})`,
                          color: "#fff", border: "none", fontWeight: 600, fontSize: 14,
                          boxShadow: "0 6px 20px rgba(46,125,50,.4)",
                          cursor: "pointer",
                        }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {Math.ceil(filteredMatches.length / PAGE_SIZE) > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredMatches.length / PAGE_SIZE)}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {/* Apply Modal */}
        {showApplyModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001,
          }} onClick={() => setShowApplyModal(false)}>
            <div style={{
              background: "#fff", borderRadius: 20, padding: "32px 28px", 
              minWidth: 420, maxWidth: 500, maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 25px 70px rgba(0,0,0,.4)",
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.bDark, margin: "0 0 12px" }}>
                Apply to Opportunity
              </h3>
              <p style={{ fontSize: 14, color: T.textMid, margin: "0 0 24px" }}>
                Update your profile details to apply. NGO will see your skills match.
              </p>

              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textDark, marginBottom: 6 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={applyData.name}
                    onChange={e => setApplyData({...applyData, name: e.target.value})}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 12,
                      border: `2px solid ${T.bPale}`, fontSize: 14, fontFamily: font,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textDark, marginBottom: 6 }}>
                    Skills * (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. recycling, teamwork, React, graphic design"
                    value={applyData.skills}
                    onChange={e => {
                      setApplyData({...applyData, skills: e.target.value});
                      // Live preview update
                      if (selectedOpportunity?.requiredSkills) {
                        const inputSkills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        updateSkillPreview(selectedOpportunity.requiredSkills, inputSkills);
                      }
                    }}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 12,
                      border: `2px solid ${T.bPale}`, fontSize: 14, fontFamily: font,
                    }}
                  />
                  {selectedOpportunity && (
                    <div style={{ marginTop: 12, padding: "12px 16px", background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#166534", marginBottom: 6 }}>
                        💚 Skill Match Preview: {skillPreview.matchedCount}/{skillPreview.totalOppSkills}
                      </div>
                      {skillPreview.matchedSkills.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {skillPreview.matchedSkills.map((skill, i) => (
                            <span key={i} style={{
                              padding: "4px 10px", borderRadius: 20,
                              background: "#22c55e", color: "white", fontSize: 12, fontWeight: 500
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: "#15803d", margin: 0 }}>No matching skills yet - add relevant skills above!</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.textDark, marginBottom: 6 }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New York, NY or Remote"
                    value={applyData.location}
                    onChange={e => setApplyData({...applyData, location: e.target.value})}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 12,
                      border: `2px solid ${T.bPale}`, fontSize: 14, fontFamily: font,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowApplyModal(false)}
                  disabled={applying}
                  style={{
                    padding: "12px 24px", borderRadius: 12,
                    background: "transparent", border: `2px solid ${T.bSand}`,
                    color: T.textMid, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1,
                    maxWidth: 140,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApply}
                  disabled={applying || !applyData.name.trim() || !applyData.skills.trim() || !applyData.location.trim()}
                  style={{
                    padding: "12px 24px", borderRadius: 12,
                    background: `linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                    color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1,
                    boxShadow: "0 6px 20px rgba(46,125,50,.4)",
                    opacity: applying || !applyData.name.trim() || !applyData.skills.trim() || !applyData.location.trim() ? 0.6 : 1,
                  }}
                >
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VolunteerOpportunityMatches;


