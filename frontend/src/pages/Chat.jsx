import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import API, { getMessagesWith, sendMessage } from "../services/api";
import { Send, MessageCircle, Loader2, CheckCheck } from "lucide-react";

const T = {
  gDeep:"#1b5e20", gDark:"#2e7d32", gMid:"#43a047", gLight:"#81c784",
  gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037", bLight:"#8d6e63",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};

const font = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

const css = `
@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
.msg-bubble { animation: fadeUp .3s ease both; }
.msg-bubble.me { animation-name: fadeRight; }
`;

const MessageBubble = ({ msg, isMe, partnerName }) => {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start", marginBottom:16 }}>
      <div className={`msg-bubble ${isMe?"me":""}`} style={{ maxWidth:"75%" }}>

        {!isMe && (
          <div style={{
            position:"absolute",
            left:-42,
            top:8,
            width:32,
            height:32,
            borderRadius:"50%",
            background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:13,
            fontWeight:600,
            color:"#fff",
            boxShadow:"0 2px 8px rgba(67,160,71,.3)"
          }}>
            {partnerName?.split(" ")[0][0]?.toUpperCase()}
          </div>
        )}

        <div style={{
          padding:"12px 18px",
          borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",
          background:isMe?`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`:"#fff",
          color:isMe?"#fff":T.textDark,
          fontSize:14,
          fontFamily:font
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
  const { partnerId } = useParams();
  const { user } = useAuth();

  const [messages,setMessages] = useState([]);
  const [conversations,setConversations] = useState([]);
  const [selectedPartner,setSelectedPartner] = useState(null);
  const [text,setText] = useState("");
  const [sending,setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  };

  useEffect(()=>{scrollToBottom()},[messages]);

  // load conversations
  useEffect(()=>{
    const fetchConversations = async()=>{
      try{
        const res = await API.get("/messages/conversations");
        setConversations(res.data.conversations || []);
      }catch(err){
        console.error(err);
      }
    };
    fetchConversations();
  },[]);

  // select partner
  useEffect(()=>{
    if(partnerId){
      setSelectedPartner(conversations.find(c=>c.partner._id===partnerId) || null);
    }
  },[partnerId,conversations]);

  // load messages
  useEffect(()=>{
    if(!partnerId) return;

    const fetchMessages = async()=>{
      try{
        const res = await getMessagesWith(partnerId);
        setMessages(prev => {
          const newMsgs = res.data.messages || [];
          // Dedupe: filter by content + close timestamp (optimistic sync)
          const deduped = [...prev, ...newMsgs].filter((msg, idx, arr) => 
            idx === arr.findIndex(m => 
              m.content === msg.content && 
              Math.abs(new Date(m.timestamp) - new Date(msg.timestamp)) < 5000
            )
          ).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
          return deduped;
        });
      }catch(err){
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages,4000);
    return ()=>clearInterval(interval);

  },[partnerId]);

  const handleSend = async()=>{
    if(!text.trim() || !partnerId || sending) return;

    const content = text.trim();

    const optimistic = {
      _id:Date.now(),
      sender_id:user._id,
      receiver_id:partnerId,
      content,
      timestamp:new Date().toISOString()
    };

    setText("");
    setSending(true);
    setMessages(prev=>[...prev,optimistic]);

    try{
      await sendMessage(partnerId,content);
    }catch(err){
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Message send failed: ${errorMsg}`);
      setMessages(prev=>prev.filter(m=>m._id!==optimistic._id));
    }finally{
      setSending(false);
    }
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:font}}>
      <style>{css}</style>

      <Sidebar/>

      <div style={{flex:1,display:"flex",flexDirection:"column"}}>

        <div style={{
          padding:"20px",
          borderBottom:"1px solid #eee",
          fontWeight:600
        }}>
          {selectedPartner?.partner?.name || "Select conversation"}
        </div>

        <div style={{flex:1,padding:"20px",overflowY:"auto"}}>
          {messages.length===0 ? (
            <div style={{textAlign:"center",opacity:.5}}>
              <MessageCircle size={50}/>
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map(msg=>(
              <MessageBubble
                key={msg._id}
                msg={msg}
                isMe={msg.sender_id===user._id}
                partnerName={selectedPartner?.partner?.name}
              />
            ))
          )}
          <div ref={messagesEndRef}/>
        </div>

        <div style={{padding:"20px",borderTop:"1px solid #eee",display:"flex",gap:10}}>
          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Type message..."
            style={{flex:1,padding:"12px",borderRadius:20,border:"1px solid #ccc"}}
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
              background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
              color:"#fff",
              display:"flex",
              alignItems:"center",
              justifyContent:"center"
            }}
          >
            {sending ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Chat;