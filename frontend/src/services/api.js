import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// ── AUTH ──────────────────────────────────────────────────────
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser    = (data) => API.post("/auth/login", data);

// ── OPPORTUNITIES ─────────────────────────────────────────────
export const getAllOpportunities        = ()         => API.get("/opportunities");
export const getAllOpportunitiesForNgo  = ()         => API.get("/opportunities/my-opportunities");
export const getMyOpportunities        = ()         => API.get("/opportunities/my-opportunities");
export const getOpportunityApplicants  = (id)       => API.get(`/opportunities/${id}/applicants`);
export const getOpportunityById        = (id)       => API.get(`/opportunities/${id}`);
export const createOpportunity         = (data)     => API.post("/opportunities", data);
export const updateOpportunity         = (id, data) => API.put(`/opportunities/${id}`, data);
export const deleteOpportunity         = (id)       => API.delete(`/opportunities/${id}`);
export const applyToOpportunity        = (id, data = {}) => API.post(`/opportunities/${id}/apply`, data);
export const getMyApplications         = ()         => API.get("/opportunities/my-applications");

// Accept or reject a volunteer application (NGO only)
// status: "accepted" | "rejected" | "pending"
export const updateApplicationStatus = (opportunityId, volunteerId, status) =>
  API.patch(`/opportunities/${opportunityId}/applicants/${volunteerId}/status`, { status });

// ── MESSAGING ─────────────────────────────────────────────────
export const sendMessage      = (payload) => API.post("/messages", payload);
export const getMessages      = (userId)  => API.get(`/messages/${userId}`);
export const getConversations = ()        => API.get("/messages");

// ── MATCHES ───────────────────────────────────────────────────
export const getMatches = () => API.get("/matches");