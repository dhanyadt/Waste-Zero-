import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getMessages, sendMessage } from "../services/api";
import { Send, MessageCircle, Loader2, CheckCheck } from "lucide-react";

const T = {
  gMid:"#43a047",
  gDark:"#2e7d32",
  textDark:"#1c1008"
};

const MessageBubble = ({ msg, isMe }) => {
  const time = new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start", marginBottom:16 }}>
      <div style={{ maxWidth:"75%" }}>
        <div style={{
          padding:"12px 18px",
          borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",
          background:isMe?`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`:"#fff",
          color:isMe?"#fff":T.textDark,
          fontSize:14
        }}>
          {msg.content}
        </div>

        <div style={{
          fontSize:11,
          marginTop:4,
          textAlign:isMe?"right":"left",
          display:"flex",
          alignItems:"center",
          gap:4,
          justifyContent:isMe?"flex-end":"flex-start"
        }}>
          {time}
          {isMe && <CheckCheck size={12}/>}
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const { receiverId } = useParams();
  const { user, socket } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // 🔥 Load messages
  useEffect(() => {
    if (!receiverId) return;

    const fetchMessages = async () => {
      try {
        const res = await getMessages(receiverId);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    fetchMessages();
  }, [receiverId]);

  // 🔥 Real-time socket
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (message) => {
      const isRelevant =
        message.sender_id === receiverId ||
        message.receiver_id === receiverId;

      if (isRelevant) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => socket.off("newMessage");
  }, [socket, receiverId]);

  // 🔥 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  // 🔥 Send message
  const handleSend = async () => {
    if (!text.trim() || sending) return;

    const content = text.trim();

    const optimistic = {
      _id: Date.now(),
      sender_id: user._id,
      receiver_id: receiverId,
      content,
      createdAt: new Date()
    };

    setText("");
    setSending(true);
    setMessages(prev => [...prev, optimistic]);

    try {
      await sendMessage({
        receiver_id: receiverId,
        content
      });
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <Sidebar />

      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{
          padding:"20px",
          borderBottom:"1px solid #eee",
          fontWeight:600
        }}>
          Chat
        </div>

        {/* Messages */}
        <div style={{ flex:1, padding:"20px", overflowY:"auto" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign:"center", opacity:.5 }}>
              <MessageCircle size={50}/>
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map(msg => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                isMe={msg.sender_id === user._id}
              />
            ))
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input */}
        <div style={{
          padding:"20px",
          borderTop:"1px solid #eee",
          display:"flex",
          gap:10
        }}>
          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Type message..."
            style={{
              flex:1,
              padding:"12px",
              borderRadius:20,
              border:"1px solid #ccc"
            }}
            onKeyDown={(e)=>{
              if(e.key==="Enter"){
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width:45,
              height:45,
              borderRadius:"50%",
              border:"none",
              background:"#2e7d32",
              color:"#fff",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
          >
            {sending ? <Loader2 size={18}/> : <Send size={18}/>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Chat;