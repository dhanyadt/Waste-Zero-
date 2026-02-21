import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// dashboard-only theme: toggles dark mode only when on dashboard pages
export const ThemeProvider = ({ children }) => {
  const [dashboardTheme, setDashboardTheme] = useState(() => {
    try {
      return localStorage.getItem('dashboardTheme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Utility to know if current path is a dashboard page
  const isDashboardPath = (path) => {
    if (!path) return false;
    return path.startsWith('/dashboard') || path.startsWith('/ngo-dashboard') || path.startsWith('/volunteer-dashboard');
  };

  // Apply or remove the dark class depending on dashboardTheme and current path
  useEffect(() => {
    const applyForPath = () => {
      const root = window.document.documentElement;
      const path = window.location.pathname;
      if (isDashboardPath(path) && dashboardTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyForPath();

    // Listen for navigation changes (back/forward)
    const onPop = () => applyForPath();
    window.addEventListener('popstate', onPop);

    return () => window.removeEventListener('popstate', onPop);
  }, [dashboardTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('dashboardTheme', dashboardTheme);
    } catch (e) {}
  }, [dashboardTheme]);

  const toggleDashboardTheme = () => setDashboardTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ dashboardTheme, setDashboardTheme, toggleDashboardTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
