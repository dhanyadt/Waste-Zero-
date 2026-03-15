import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getMatchedVolunteers, updateApplicantStatus } from "../services/api";
import { ArrowLeft, MessageCircle, MapPin, Target } from "lucide-react";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047", gLight:"#81c784",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};
const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .match-card { transition: box-shadow .2s, transform .2s; animation: fadeUp .3s ease both; }
  .match-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1) !important; transform: translateY(-2px); }
  .btn-primary { transition: all .2s !important; }
  .btn-primary:hover { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 8px 22px rgba(46,125,50,.45) !important; }
`;

const MatchScoreBar = ({ score }) => (
  <div style={{ textAlign:"right", marginBottom:12 }}>
    <div style={{ fontSize:11, color:T.textSoft, marginBottom:4 }}>Match Score</div>
    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, fontWeight:700, color:T.gDark }}>
      <div style={{
        width: "60px", height: "8px", borderRadius:4, background:T.gPale,
        overflow:"hidden", border:`1px solid ${T.gSage}`,
      }}>
        <div style={{
          height:"100%", width: `${score}%`,
          background:`linear-gradient(90deg, ${T.gDark}, ${T.gMid})`,
          borderRadius:3,
        }} />
      </div>
      <span>{Math.round(score)}%</span>
    </div>
  </div>
);

const MatchView = () => {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await getMatchedVolunteers(opportunityId);
        setMatches(response.data.matches || []);
      } catch (err) {
        setError("Failed to load matches");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [opportunityId]);

  if (loading) return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"100vh", fontFamily:font,
      background:"linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)",
    }}>
      <p style={{ color:"rgba(255,255,255,.4)", fontSize:14 }}>Loading matches...</p>
    </div>
  );

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
      backgroundImage:[
        "radial-gradient(ellipse at 0% 0%, rgba(27,94,32,.25) 0%, transparent 45%)",
        "radial-gradient(ellipse at 100% 100%, rgba(62,39,35,.22) 0%, transparent 45%)",
        "linear-gradient(160deg, #1a2e1a 0%, #1f1a0e 55%, #2a1a0a 100%)"
      ].join(", "),
    }}>
      <style>{css}</style>
      <Sidebar />
      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto" }}>
        <button onClick={() => navigate("/ngo-dashboard")} style={{
          display:"flex", alignItems:"center", gap:8, marginBottom:24,
          padding:"10px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,.12)",
          background:"rgba(255,255,255,.05)", color:"rgba(255,255,255,.8)",
          fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:font,
        }}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div style={{
          borderRadius:20, background:"#fff", boxShadow:"0 8px 32px rgba(0,0,0,.25)",
          padding:"32px", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg, ${T.gDark}, ${T.gMid})", borderRadius:"20px 20px 0 0" }} />
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <div style={{
              width:48, height:48, borderRadius:12, background:T.gPale,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Target size={22} color={T.gDark} />
            </div>
            <div>
              <h1 style={{ fontFamily:serif, fontSize:24, fontWeight:800, color:T.bDark, margin:0 }}>
                Matched Volunteers
              </h1>
              <p style={{ fontSize:14, color:T.textMid, margin:"4px 0 0" }}>Review volunteers based on skills & location match</p>
            </div>
            <span style={{ marginLeft:"auto", fontSize:13, fontWeight:600, color:T.gDark, background:T.gPale, padding:"4px 10px", borderRadius:20 }}>
              {matches.length} matches
            </span>
          </div>

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:T.bDark, borderRadius:12, padding:"16px 20px", textAlign:"center" }}>
              {error}
            </div>
          )}

          {matches.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 40px", gap:16, color:T.textSoft }}>
              <div style={{ width:64, height:64, borderRadius:16, background:T.gPale, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Target size={28} color={T.gDark} />
              </div>
              <h3 style={{ fontSize:18, fontWeight:700, color:T.textMid, margin:0 }}>No matches yet</h3>
              <p style={{ fontSize:14, margin:0, textAlign:"center", maxWidth:"320px" }}>
                No volunteers match this opportunity's skills or location requirements yet.
                Share the opportunity to attract more applicants.
              </p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {matches.sort((a, b) => (b.type === 'approved' ? 1 : 0) - (a.type === 'approved' ? 1 : 0) || b.matchScore - a.matchScore).map((match, i) => (
                <div key={match.volunteer._id || match.approvalId} className="match-card" style={{
                  padding:"24px", borderRadius:16, border:`1px solid ${T.bSand}`,
                  background: match.type === 'approved' ? "#dcfce7" : "#fdfaf6", cursor:"pointer",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                        <div style={{
                          width:56, height:56, borderRadius:14,
                          background: match.type === 'approved' ? T.gLight : `linear-gradient(135deg, ${T.gLight}, ${T.gPale})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:18, fontWeight:700, color:T.gDark,
                        }}>
                          {match.volunteer.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:T.bDark, margin:0 }}>
                            {match.volunteer.name}
                          </h3>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
                            {match.volunteer.skills?.slice(0,4).map(skill => (
                              <span key={skill} style={{
                                padding:"3px 10px", borderRadius:16,
                                background:T.gPale, color:T.gDark, fontSize:12, fontWeight:500,
                                border:`1px solid ${T.gSage}`,
                              }}>
                                {skill}
                              </span>
                            ))}
                            {match.volunteer.skills?.length > 4 && (
                              <span style={{ fontSize:12, color:T.textSoft }}>+{match.volunteer.skills.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <MatchScoreBar score={match.matchScore} />
                      <div style={{ display:"flex", gap:16, fontSize:13, color:T.textSoft }}>
                        {match.volunteer.location && (
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <MapPin size={14} /> {match.volunteer.location}
                          </span>
                        )}
                        <span>{match.matchingSkills.length} matching skills</span>
                      </div>
                    </div>
                    {match.status === 'accepted' ? (
                      <button style={{
                        padding:"12px 24px", borderRadius:12,
                        background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
                        color:"#fff", border:"none", fontWeight:600, fontSize:14,
                        cursor:"pointer", boxShadow:"0 4px 16px rgba(46,125,50,.3)",
                      }} onClick={() => navigate(`/messages/${match.volunteer._id}`)}>
                        <MessageCircle size={16} style={{ marginRight:6, display:"inline" }} />
                        Message
                      </button>
                    ) : (
                      <div style={{ display:"flex", gap:8 }}>
                        <StatusBadge status={match.status} />
                        <div style={{ display:"flex", gap:8 }}>
                          <button 
                            onClick={async () => {
                              setUpdatingStatus(prev => ({...prev, [match.applicantId]: 'accepted'}));
                              try {
                                await updateApplicantStatus(opportunityId, match.applicantId, 'accepted');
                                setMatches(prev => prev.map(m => m.applicantId === match.applicantId 
                                  ? {...m, status: 'accepted'} 
                                  : m));
                              } catch (err) {
                                console.error('Status update failed', err);
                              } finally {
                                setUpdatingStatus({});
                              }
                            }}
                            disabled={updatingStatus[match.applicantId]}
                            style={{
                              padding:"10px 18px", borderRadius:10,
                              background:"#22c55e", color:"#fff", border:"none", fontWeight:600,
                              fontSize:13, cursor:"pointer", flex:1,
                            }}
                          >
                            {updatingStatus[match.applicantId] ? '...' : 'Accept'}
                          </button>
                          <button 
                            onClick={async () => {
                              setUpdatingStatus(prev => ({...prev, [match.applicantId]: 'rejected'}));
                              try {
                                await updateApplicantStatus(opportunityId, match.applicantId, 'rejected');
                                setMatches(prev => prev.map(m => m.applicantId === match.applicantId 
                                  ? {...m, status: 'rejected'} 
                                  : m));
                              } catch (err) {
                                console.error('Status update failed', err);
                              } finally {
                                setUpdatingStatus({});
                              }
                            }}
                            disabled={updatingStatus[match.applicantId]}
                            style={{
                              padding:"10px 18px", borderRadius:10,
                              background:"#ef4444", color:"#fff", border:"none", fontWeight:600,
                              fontSize:13, cursor:"pointer", flex:1,
                            }}
                          >
                            {updatingStatus[match.applicantId] ? '...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchView;

