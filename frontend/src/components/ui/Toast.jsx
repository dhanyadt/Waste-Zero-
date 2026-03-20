import { X, CheckCircle2 } from "lucide-react";

const Toast = ({ msg, type = "success", onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 24,
      right: 24,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 18px",
      borderRadius: 12,
      background: type === "success" ? "#dcfce7" : "#fee2e2",
      border: `1px solid ${type === "success" ? "#86efac" : "#fca5a5"}`,
      color: type === "success" ? "#15803d" : "#b91c1c",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,.15)",
      maxWidth: 340,
    }}
  >
    {type === "success" ? <CheckCircle2 size={18} /> : <X size={18} />}
    <span>{msg}</span>
    <button
      onClick={onClose}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        marginLeft: 4,
        opacity: 0.6,
        lineHeight: 1,
      }}
    >
      <X size={14} />
    </button>
  </div>
);

export default Toast;
