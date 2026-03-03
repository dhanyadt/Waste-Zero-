import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default API;

// Register API
export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

// Login API
export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

// Opportunity APIs
export const createOpportunity = (data) => {
  return API.post("/opportunities", data);
};

export const getMyOpportunities = () => {
  return API.get("/opportunities");
};

export const updateOpportunity = (id, data) => {
  return API.put(`/opportunities/${id}`, data);
};

export const deleteOpportunity = (id) => {
  return API.delete(`/opportunities/${id}`);
};

// Get all opportunities (public - for all users)
export const getAllOpportunities = () => {
  return API.get("/opportunities/all");
};

// Apply to an opportunity (for volunteers)
export const applyToOpportunity = (id) => {
  return API.post(`/opportunities/${id}/apply`);
};

// Get my applications (for volunteers)
export const getMyApplications = () => {
  return API.get("/opportunities/my-applications");
};

// Get all opportunities for NGO (both NGO and volunteer created)
export const getAllOpportunitiesForNgo = () => {
  return API.get("/opportunities/ngo/all");
};
