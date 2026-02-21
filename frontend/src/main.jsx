import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// If backend redirected with ?token=..., store it before React mounts so AuthProvider picks it up
(() => {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);

      // remove token from the URL to keep it clean
      params.delete("token");
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
      window.history.replaceState({}, document.title, newUrl);
    }
  } catch (err) {
    console.error("Failed to process token param:", err);
  }
})();
// Apply saved dashboard theme before React mounts but only if on a dashboard route
(() => {
  try {
    const dashboardTheme = localStorage.getItem('dashboardTheme');
    const path = window.location.pathname;
    const isDashboard = path.startsWith('/dashboard') || path.startsWith('/ngo-dashboard') || path.startsWith('/volunteer-dashboard');
    if (isDashboard && dashboardTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // ignore
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
