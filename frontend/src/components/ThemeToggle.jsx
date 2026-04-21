import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ style = {} }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 12px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13.5px",
        fontWeight: 500,
        background: "transparent",
        color: "rgba(255,255,255,.6)",
        transition: "all .2s",
        textAlign: "left",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!style.background || style.background === "transparent") {
          e.currentTarget.style.background = "rgba(255,255,255,.06)";
        }
        e.currentTarget.style.color = "rgba(255,255,255,.9)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = style.background || "transparent";
        e.currentTarget.style.color = "rgba(255,255,255,.6)";
      }}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "rgba(255,255,255,.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background .2s",
        }}>
        {theme === "dark" ? (
          <Sun size={14} color="#81c784" />
        ) : (
          <Moon size={14} color="#81c784" />
        )}
      </div>
      <span style={{ flex: 1 }}>
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeToggle;