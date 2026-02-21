import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// ============ AUTH ENDPOINTS ============
export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const getUserProfile = () => {
  return API.get("/auth/me");
};

export const updateUserProfile = (data) => {
  return API.put("/auth/me", data);
};

// ============ DASHBOARD ENDPOINTS ============
export const getNgoDashboard = () => {
  return API.get("/users/ngo-dashboard");
};

export const getVolunteerDashboard = () => {
  return API.get("/users/volunteer-dashboard");
};
