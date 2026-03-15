import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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

// Public listing (volunteers + public)
export const getAllOpportunities = () => API.get("/opportunities");

// NGO: fetch ALL opportunities for their dashboard
export const getAllOpportunitiesForNgo = () => API.get("/opportunities/my-opportunities");

// Any user: fetch only opportunities THEY created
export const getMyOpportunities = () => API.get("/opportunities/my-opportunities");

// NGO: get applicants with skill match for an opportunity
export const getOpportunityApplicants = (id) =>
  API.get(`/opportunities/${id}/applicants`);

// Single opportunity
export const getOpportunityById = (id) => API.get(`/opportunities/${id}`);

// NGO: create / update / delete
export const createOpportunity = (data)      => API.post("/opportunities", data);
export const updateOpportunity = (id, data)  => API.put(`/opportunities/${id}`, data);
export const deleteOpportunity = (id)        => API.delete(`/opportunities/${id}`);

// Volunteer: apply + view own applications
export const applyToOpportunity = (id, data = {}) => API.post(`/opportunities/${id}/apply`, data);
export const getMyApplications  = ()   => API.get("/opportunities/my-applications");