import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
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
