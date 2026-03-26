import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMessages,
  sendMessage,
  getMatches,
  getPotentialMatchesForNgo,
} from "../services/api";
import { Send, CheckCheck, User as UserIcon } from "lucide-react";

const formatTime = (ts) => {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getTimestamp = (message) => {
  return new Date(
    message.createdAt ||
    message.timestamp ||
    0
  ).getTime();
};

const normalizeMessage = (msg) => ({
  _id: msg._id,
  sender_id: msg.sender_id || msg.senderId,
  receiver_id: msg.receiver_id || msg.receiverId,
  content: msg.content,
  createdAt: msg.createdAt || msg.timestamp,
});

const ChatPage = () => {
  const { receiverId: urlReceiverId } = useParams();
  const { socket, user, clearNotifications, setMessagesPageActive, onlineUsers } =
    useAuth();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [receiverId, setReceiverId] = useState(urlReceiverId || "");
  const [selectedUser, setSelectedUser] = useState(null);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isOnline = onlineUsers?.includes(String(receiverId));

  useEffect(() => {
    setMessagesPageActive(true);
    clearNotifications();
    return () => setMessagesPageActive(false);
  }, []);

  // ✅ Fetch matches
  useEffect(() => {
    if (!user) return;

    const fetchMatchedUsers = async () => {
      try {
        if (user.role === "volunteer") {
          const res = await getMatches();
          const usersMap = {};

          res.data.matches?.forEach((m) => {
            const ngo = m.opportunity?.createdBy;
            if (ngo && ngo._id) usersMap[ngo._id] = ngo;
          });

          setMatchedUsers(Object.values(usersMap));
        } else {
          const res = await getPotentialMatchesForNgo();
          const usersMap = {};

          res.data.matches?.forEach((m) => {
            const vol = m.volunteer;
            if (vol && vol._id) usersMap[vol._id] = vol;
          });

          setMatchedUsers(Object.values(usersMap));
        }
      } catch (err) {
        console.warn(err);
      }
    };

    fetchMatchedUsers();
  }, [user]);

  // ✅ Select user from URL
  useEffect(() => {
    if (receiverId && matchedUsers.length > 0) {
      const match = matchedUsers.find((u) => u._id === receiverId);
      if (match) setSelectedUser(match);
    }
  }, [receiverId, matchedUsers]);

  // ✅ Load messages
  useEffect(() => {
    if (!receiverId) return;

    const loadMessages = async () => {
      try {
        const res = await getMessages(receiverId);
        const fetched = res.data?.messages || res.data || [];

        fetched.sort((a, b) => getTimestamp(a) - getTimestamp(b));

        setMessages(fetched.map(normalizeMessage));
      } catch (err) {
        console.warn(err);
      }
    };

    loadMessages();
  }, [receiverId]);

  // ✅ Socket handling
  
useEffect(() => {
  if (!socket || !user) return;

  const handleIncomingMessage = (msg) => {
    console.log("🔥 REALTIME:", msg);

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

  // ✅ CORRECT PLACE
  socket.off("newMessage");
  socket.on("newMessage", handleIncomingMessage);

  return () => {
    socket.off("newMessage", handleIncomingMessage);
  };
}, [socket, user]);

  // ✅ Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (e) => {
    setDraft(e.target.value);
  };

const handleSend = async (e) => {
  e.preventDefault();
  if (!draft.trim()) return;

  const senderId = user.id || user._id;

  const tempMsg = {
    _id: Date.now(), // temporary id
    sender_id: senderId,
    receiver_id: receiverId,
    content: draft,
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, tempMsg]);

  try {
    await sendMessage({
  receiver_id: receiverId,
  content: draft,
});
  } catch (err) {
    console.warn(err);
  }

  setDraft("");
};

  // ✅ SORT (IMPORTANT FIX)
  const sortedMessages = [...messages].sort(
    (a, b) => getTimestamp(a) - getTimestamp(b)
  );

  return (
    <div className="flex h-full text-white">

      {/* LEFT */}
      <div className="w-[300px] border-r border-white/10 p-3">
        <h2 className="text-lg font-bold mb-3">Chats</h2>

        {matchedUsers.map((u) => (
          <div
            key={u._id}
            onClick={() => {
              setReceiverId(u._id);
              setSelectedUser(u);
            }}
            className="p-3 cursor-pointer hover:bg-white/10 rounded"
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        {selectedUser && (
          <div className="p-4 border-b border-white/10 font-bold">
            {selectedUser.name}
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedMessages.map((msg, i) => {
            const isMe =
  String(msg.sender_id) === String(user.id || user._id);
            return (
              <div
                key={msg._id || i}
                className={`mb-3 flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-xl ${
                    isMe ? "bg-green-600" : "bg-gray-300 text-black"
                  }`}
                >
                  {msg.content}
                  <div className="text-xs opacity-70 mt-1">
                    {formatTime(getTimestamp(msg))}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}></div>
        </div>

        {/* INPUT */}
        <form onSubmit={handleSend} className="p-3 flex gap-2">
          <input
            value={draft}
            onChange={handleTyping}
            className="flex-1 p-2 rounded bg-black/30"
          />
          <button className="bg-green-600 px-4 rounded">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;