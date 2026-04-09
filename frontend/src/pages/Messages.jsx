import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── helpers ──────────────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getDayLabel = (dateStr) => {
  if (!dateStr) return "";
  const msgDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(msgDate, today)) return "Today";
  if (isSameDay(msgDate, yesterday)) return "Yesterday";
  return msgDate.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short", year: "numeric" });
};

const injectDateSeparators = (msgs) => {
  const result = [];
  let lastLabel = null;
  for (const msg of msgs) {
    const label = getDayLabel(msg.createdAt);
    if (label && label !== lastLabel) {
      result.push({ __separator: true, label, key: `sep-${label}` });
      lastLabel = label;
    }
    result.push(msg);
  }
  return result;
};
// ─────────────────────────────────────────────────────────────

const Messages = () => {
  const { setMessagesPageActive, clearNotifications, socket, user } = useAuth();
  const location = useLocation();

  // ✅ FIX: conversations live locally here, not in AuthContext
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  useEffect(() => { clearNotifications(); }, []);
  useEffect(() => {
    setMessagesPageActive(true);
    return () => setMessagesPageActive(false);
  }, []);

  // ✅ FIX: load conversations locally, then preselect — all in one flow
  useEffect(() => {
    const init = async () => {
      try {
        const res = await API.get("/messages");
        const convos = res.data.conversations || [];
        setConversations(convos);

        if (location.state?.preSelectUserId) {
          const targetId = location.state.preSelectUserId;
          const targetName = location.state.preSelectUserName;

          const found = convos.find((c) => String(c.user._id) === String(targetId));
          const userToOpen = found ? found.user : { _id: targetId, name: targetName };

          setSelectedUser(userToOpen);
          loadMessages(targetId);
        }
      } catch (err) {
        console.error("Conversation error", err);
      }
    };
    init();
  }, [location.state?.preSelectUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ✅ Real-time incoming messages
  useEffect(() => {
    if (!socket || !user) return;
    const currentUserId = user?.id || user?._id;

    const handleIncomingMessage = (msg) => {
      const senderId = msg.sender_id || msg.senderId;
      const activeUser = selectedUserRef.current;

      if (activeUser && String(senderId) === String(activeUser._id)) {
        const normalized = {
          _id: msg._id || Date.now(),
          content: msg.content,
          sender_id: senderId,
          createdAt: msg.createdAt || new Date().toISOString(),
          isOwn: String(senderId) === String(currentUserId),
        };
        setMessages((prev) => {
          if (prev.find((m) => m._id === normalized._id)) return prev;
          return [...prev, normalized];
        });
      }
    };

    socket.on("newMessage", handleIncomingMessage);
    return () => socket.off("newMessage", handleIncomingMessage);
  }, [socket, user]);

  const loadMessages = async (userId) => {
    try {
      const res = await API.get(`/messages/${userId}`);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const currentUserId = currentUser?._id || currentUser?.id;

      const msgs = (res.data.messages || [])
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  .map((msg) => {
          // ✅ FIX: safely extract senderId — handles object, string, or undefined
          const senderId =
            msg.sender_id?._id ??
            (typeof msg.sender_id === "string" ? msg.sender_id : null);

          return {
            ...msg,
            createdAt: msg.createdAt || null,
            // ✅ FIX: guard against null senderId before toString
            isOwn: senderId && currentUserId
              ? senderId.toString() === currentUserId.toString()
              : false,
          };
        });

      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!text || !selectedUser) return;
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const tempMessage = {
      _id: Date.now(),
      content: text,
      sender_id: currentUser._id,
      createdAt: new Date().toISOString(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, tempMessage]);
    setConversations((prev) =>
      prev.map((c) =>
        String(c.user._id) === String(selectedUser._id)
          ? { ...c, lastMessage: text }
          : c
      )
    );
    setText("");
    try {
      await API.post("/messages", { receiver_id: selectedUser._id, content: text });
    } catch (err) {
      console.error(err);
    }
  };

  const clearChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Clear all messages with ${selectedUser.name}?`)) return;
    try {
      await API.delete(`/messages/${selectedUser._id}`);
      setMessages([]);
      setConversations((prev) =>
        prev.map((c) =>
          String(c.user._id) === String(selectedUser._id)
            ? { ...c, lastMessage: "" }
            : c
        )
      );
    } catch (err) {
      console.error("Clear chat error", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || "?";
  const messagesWithSeparators = injectDateSeparators(messages);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');
        .msg-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .msg-root { display: flex; height: 100vh; font-family: 'DM Sans', sans-serif; }
        .msg-main { flex: 1; display: flex; background: #0d1f0e; overflow: hidden; }
        .msg-sidebar { width: 290px; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
        .msg-sidebar-header { padding: 24px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .msg-sidebar-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #e8f5e9; letter-spacing: 0.3px; }
        .msg-sidebar-subtitle { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; }
        .msg-convo-list { flex: 1; overflow-y: auto; padding: 12px; scrollbar-width: thin; scrollbar-color: rgba(67,160,71,0.3) transparent; }
        .msg-convo-list::-webkit-scrollbar { width: 4px; }
        .msg-convo-list::-webkit-scrollbar-thumb { background: rgba(67,160,71,0.3); border-radius: 2px; }
        .msg-convo-empty { text-align: center; color: rgba(255,255,255,0.3); font-size: 13px; padding: 30px 16px; }
        .msg-convo-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; margin-bottom: 4px; cursor: pointer; transition: background 0.18s ease; border: 1px solid transparent; }
        .msg-convo-item:hover { background: rgba(67,160,71,0.08); border-color: rgba(67,160,71,0.15); }
        .msg-convo-item.active { background: rgba(67,160,71,0.14); border-color: rgba(67,160,71,0.3); }
        .msg-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #2e7d32, #1b5e20); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #a5d6a7; flex-shrink: 0; border: 1.5px solid rgba(67,160,71,0.3); }
        .msg-convo-info { flex: 1; overflow: hidden; }
        .msg-convo-name { font-size: 14px; font-weight: 600; color: #e8f5e9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-convo-preview { font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-chat { flex: 1; display: flex; flex-direction: column; background: transparent; }
        .msg-chat-header { padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.015); backdrop-filter: blur(10px); }
        .msg-chat-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #388e3c, #1b5e20); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #a5d6a7; border: 1.5px solid rgba(67,160,71,0.35); }
        .msg-chat-header-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #e8f5e9; }
        .msg-chat-header-status { font-size: 11px; color: #66bb6a; margin-top: 1px; }
        .msg-chat-placeholder-header { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.35); }
        .msg-clear-btn { margin-left: auto; padding: 7px 14px; background: rgba(211,47,47,0.12); color: #ef9a9a; border: 1px solid rgba(211,47,47,0.25); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.18s, border-color 0.18s; }
        .msg-clear-btn:hover { background: rgba(211,47,47,0.22); border-color: rgba(211,47,47,0.45); }
        .msg-messages-area { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; scrollbar-width: thin; scrollbar-color: rgba(67,160,71,0.2) transparent; }
        .msg-messages-area::-webkit-scrollbar { width: 4px; }
        .msg-messages-area::-webkit-scrollbar-thumb { background: rgba(67,160,71,0.2); border-radius: 2px; }
        .msg-placeholder { margin: auto; text-align: center; color: rgba(255,255,255,0.2); }
        .msg-placeholder-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
        .msg-placeholder p { font-size: 14px; }
        .msg-date-sep { display: flex; align-items: center; gap: 10px; margin: 8px 0 4px; }
        .msg-date-sep-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .msg-date-sep-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); white-space: nowrap; padding: 0 4px; letter-spacing: 0.5px; }
        .msg-bubble-wrap { display: flex; flex-direction: column; max-width: 62%; }
        .msg-bubble-wrap.sent { align-self: flex-end; align-items: flex-end; }
        .msg-bubble-wrap.received { align-self: flex-start; align-items: flex-start; }
        .msg-bubble { padding: 11px 16px 7px; border-radius: 16px; font-size: 14px; line-height: 1.55; word-break: break-word; animation: bubbleIn 0.18s ease; }
        @keyframes bubbleIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .msg-bubble.received { background: rgba(255,255,255,0.07); color: #e8f5e9; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.07); }
        .msg-bubble.sent { background: linear-gradient(135deg, #2e7d32, #1b5e20); color: #e8f5e9; border-bottom-right-radius: 4px; border: 1px solid rgba(67,160,71,0.3); box-shadow: 0 2px 12px rgba(46,125,50,0.25); }
        .msg-time { font-size: 10.5px; color: rgba(255,255,255,0.35); margin-top: 3px; padding: 0 2px; }
        .msg-input-bar { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.015); }
        .msg-input { flex: 1; padding: 11px 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #e8f5e9; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, background 0.2s; }
        .msg-input::placeholder { color: rgba(255,255,255,0.28); }
        .msg-input:focus { border-color: rgba(67,160,71,0.5); background: rgba(255,255,255,0.08); }
        .msg-send-btn { padding: 11px 20px; background: linear-gradient(135deg, #43a047, #2e7d32); color: #fff; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: opacity 0.18s, transform 0.15s; white-space: nowrap; }
        .msg-send-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .msg-send-btn:active { transform: translateY(0); }
        .msg-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="msg-root">
        <Sidebar />
        <div className="msg-main">

          {/* CONVERSATIONS LIST */}
          <div className="msg-sidebar">
            <div className="msg-sidebar-header">
              <div className="msg-sidebar-title">Messages</div>
              <div className="msg-sidebar-subtitle">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="msg-convo-list">
              {conversations.length === 0 && <div className="msg-convo-empty">No conversations yet</div>}
              {conversations.map((c) => (
                <div
                  key={c.user._id}
                  className={`msg-convo-item ${selectedUser?._id === c.user._id ? "active" : ""}`}
                  onClick={() => { setSelectedUser(c.user); loadMessages(c.user._id); }}
                >
                  <div className="msg-avatar">{getInitial(c.user.name)}</div>
                  <div className="msg-convo-info">
                    <div className="msg-convo-name">{c.user.name}</div>
                    <div className="msg-convo-preview">{c.lastMessage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="msg-chat">
            <div className="msg-chat-header">
              {selectedUser ? (
                <>
                  <div className="msg-chat-avatar">{getInitial(selectedUser.name)}</div>
                  <div>
                    <div className="msg-chat-header-name">{selectedUser.name}</div>
                    <div className="msg-chat-header-status">● Online</div>
                  </div>
                  <button className="msg-clear-btn" onClick={clearChat}>Clear Chat</button>
                </>
              ) : (
                <div className="msg-chat-placeholder-header">Select a conversation</div>
              )}
            </div>

            <div className="msg-messages-area">
              {!selectedUser && (
                <div className="msg-placeholder">
                  <div className="msg-placeholder-icon">💬</div>
                  <p>Select a conversation to start chatting</p>
                </div>
              )}

              {messagesWithSeparators.map((item) => {
                if (item.__separator) {
                  return (
                    <div key={item.key} className="msg-date-sep">
                      <div className="msg-date-sep-line" />
                      <div className="msg-date-sep-label">{item.label}</div>
                      <div className="msg-date-sep-line" />
                    </div>
                  );
                }
                return (
                  <div key={item._id} className={`msg-bubble-wrap ${item.isOwn ? "sent" : "received"}`}>
                    <div className={`msg-bubble ${item.isOwn ? "sent" : "received"}`}>
                      {item.content}
                    </div>
                    <div className="msg-time">{formatTime(item.createdAt)}</div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            <div className="msg-input-bar">
              <input
                className="msg-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={!selectedUser}
              />
              <button className="msg-send-btn" onClick={sendMessage} disabled={!text.trim() || !selectedUser}>
                Send
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Messages;