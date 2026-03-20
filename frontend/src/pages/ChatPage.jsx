import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMessages, sendMessage } from "../services/api";

const getTimestamp = (message) => {
  const ts =
    message?.timestamp ??
    message?.createdAt ??
    message?.sentAt ??
    message?.time;
  const parsed = typeof ts === "number" ? ts : Date.parse(ts);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ChatPage = () => {
  const { socket, user, clearNotifications, setMessagesPageActive } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessagesPageActive(true);
    clearNotifications();
    return () => setMessagesPageActive(false);
  }, [clearNotifications, setMessagesPageActive]);

  useEffect(() => {
    if (!user) return;

    const userId = user.id || user._id;

    const loadMessages = async () => {
      try {
        const res = await getMessages(userId);
        const fetched = res.data || [];
        fetched.sort((a, b) => getTimestamp(a) - getTimestamp(b));
        setMessages(fetched);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Failed to fetch messages:", err);
      }
    };

    loadMessages();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages((prev) => {
        const next = [...prev, message];
        next.sort((a, b) => getTimestamp(a) - getTimestamp(b));
        return next;
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !user) return;

    const senderId = user.id || user._id;
    const timestamp = Date.now();
    const payload = {
      senderId,
      receiverId,
      content: draft.trim(),
      text: draft.trim(),
      timestamp,
    };

    try {
      // Persist via API (existing backend endpoint)
      await sendMessage(payload);
    } catch (err) {
      // Ignore API failures; socket still emits to keep UX responsive
      // eslint-disable-next-line no-console
      console.warn("sendMessage API call failed:", err);
    }

    if (socket) {
      socket.emit("sendMessage", payload);
    }

    setMessages((prev) => {
      const next = [...prev, payload];
      next.sort((a, b) => getTimestamp(a) - getTimestamp(b));
      return next;
    });

    setDraft("");
  };

  return (
    <div className="page" style={{ padding: "1rem" }}>
      <h1>Messages</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.length === 0 && (
          <div style={{ opacity: 0.6 }}>No messages yet.</div>
        )}

        {messages.map((message, idx) => {
          const key = message.id ?? message._id ?? idx;
          const ts = getTimestamp(message);
          const dateStr = ts ? new Date(ts).toLocaleString() : "";
          return (
            <div
              key={key}
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.1)",
                background: "rgba(255,255,255,0.75)",
              }}
            >
              <div style={{ fontSize: "0.9rem", opacity: 0.75 }}>
                {message.senderName || message.from || "Unknown"} • {dateStr}
              </div>
              <div style={{ marginTop: "6px" }}>
                {message.text ?? message.body ?? JSON.stringify(message)}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />

        <form onSubmit={handleSend} style={{ display: "flex", gap: "8px" }}>
          <input
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            placeholder="Receiver ID"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 2,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              background: "#1f2937",
              color: "white",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
