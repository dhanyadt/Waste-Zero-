import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMessages, sendMessage } from "../services/api";

const getTimestamp = (message) => {
  const ts =
    message?.createdAt ??
    message?.sentAt ??
    message?.time ??
    0;

  return new Date(ts).getTime();
};

const ChatPage = () => {
  const { socket, user, clearNotifications, setMessagesPageActive } = useAuth();
  const { receiverId } = useParams();

  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessagesPageActive(true);
    clearNotifications();
    return () => setMessagesPageActive(false);
  }, []);

useEffect(() => {
  if (!receiverId) return;

  const loadMessages = async () => {
    try {
      const res = await getMessages(receiverId);
      const fetched = res.data?.messages || [];
      fetched.sort((a, b) => getTimestamp(a) - getTimestamp(b));
      setMessages(fetched);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load messages.");
    }
  };
  loadMessages();
}, [receiverId]);

useEffect(() => {
  if (!receiverId) return;

  setUnreadCounts((prev) => ({
    ...prev,
    [receiverId]: 0,
  }));
}, [receiverId]);

useEffect(() => {
  if (!socket || !user) return;

  const handleIncomingMessage = (msg) => {
    console.log("🔥 CHAT PAGE RECEIVED:", msg);

    const normalized = {
      _id: msg._id,
      sender_id: msg.sender_id || msg.senderId,
      receiver_id: msg.receiver_id || msg.receiverId,
      content: msg.content,
      createdAt:
        msg?.createdAt ??
        msg?.timestamp ??
        new Date().toISOString(),
    };

    setMessages((prev) => {
      const exists = prev.find((m) => m._id === normalized._id);
      if (exists) return prev;

      const updated = [...prev, normalized];

      updated.sort(
        (a, b) => getTimestamp(a) - getTimestamp(b)
      );

      return updated;
    });
  };

  // ✅ IMPORTANT: do NOT remove all listeners
  socket.on("newMessage", handleIncomingMessage);

  return () => {
    socket.off("newMessage", handleIncomingMessage);
  };
}, [socket, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    setSending(true);
    setError("");

    // ✅ Correct field names matching backend
    const payload = {
      receiver_id: receiverId,
      content: draft.trim(),
    };

    try {
      const res = await sendMessage(payload);
      const saved = res.data?.data;
      if (saved) {
        setMessages((prev) => {
          const next = [...prev, saved];
          next.sort((a, b) => getTimestamp(a) - getTimestamp(b));
          return next;
        });
      } else {
        const optimistic = {
  sender_id: user?.id || user?._id,
  receiver_id: receiverId,
  content: draft.trim(),
  createdAt: new Date().toISOString(),
};
        setMessages((prev) => [...prev, optimistic]);
      }
      setDraft("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const myId = user.id || user._id;

if (
  (String(normalized.sender_id) === String(receiverId) &&
    String(normalized.receiver_id) === String(myId)) ||

  (String(normalized.sender_id) === String(myId) &&
    String(normalized.receiver_id) === String(receiverId))
)

  return (
    <div className="page" style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "10px" }}>
  <strong>Chats</strong>

  {Object.keys(unreadCounts).map((id) => (
    <div key={id} style={{ display: "flex", gap: "10px" }}>
      <span>{id}</span>

      {unreadCounts[id] > 0 && (
        <span style={{
          background: "red",
          color: "white",
          borderRadius: "50%",
          padding: "2px 6px",
          fontSize: "12px"
        }}>
          {unreadCounts[id]}
        </span>
      )}
    </div>
  ))}
</div>
      <h1>Messages</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            color: "#c62828", borderRadius: 8, padding: "10px 14px", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {!error && messages.length === 0 && (
          <div style={{ opacity: 0.6 }}>No messages yet.</div>
        )}

        {messages.map((message, idx) => {
          const key = message._id ?? idx;
          const ts = getTimestamp(message);
          const dateStr = ts ? new Date(ts).toLocaleString() : "";
          const senderId = message.sender_id?._id || message.sender_id || message.senderId;
          const isOwn = myId && String(senderId) === String(myId);

          return (
            <div key={key} style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.1)",
              background: isOwn ? "#e8f5e9" : "rgba(255,255,255,0.75)",
            }}>
              <div style={{ fontSize: "0.9rem", opacity: 0.75 }}>
                {isOwn ? "You" : (message.senderName || message.from || "Unknown")} • {dateStr}
              </div>
              <div style={{ marginTop: "6px" }}>
                {message.content ?? message.text ?? message.body}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />

        <form onSubmit={handleSend} style={{ display: "flex", gap: "8px" }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 2, padding: "10px", borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{
              padding: "10px 14px", borderRadius: "10px", border: "none",
              background: sending ? "#9ca3af" : "#1f2937",
              color: "white", cursor: sending ? "not-allowed" : "pointer",
            }}
          >
            {sending ? "..." : "Send"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatPage;