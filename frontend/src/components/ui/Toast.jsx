import { X, CheckCircle2, MessageSquare } from "lucide-react";

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
      background: type === "success" ? "#dcfce7" : type === "info" ? "#dbeafe" : "#fee2e2",
border: `1px solid ${type === "success" ? "#86efac" : type === "info" ? "#93c5fd" : "#fca5a5"}`,
color: type === "success" ? "#15803d" : type === "info" ? "#1e40af" : "#b91c1c",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,.15)",
      maxWidth: 340,
    }}

    
  >
{type === "success" ? <CheckCircle2 size={18} /> : type === "info" ? <MessageSquare size={18} /> : <X size={18} />}    <span>{msg}</span>
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
