import Sidebar from "../components/layout/Sidebar";

const Messages = () => {

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Chat Header */}
        <div style={{
          padding: 20,
          borderBottom: "1px solid #ddd",
          fontWeight: 600
        }}>
          Messages
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          padding: 20,
          overflowY: "auto"
        }}>
          <p>No messages yet.</p>
        </div>

        {/* Message Input */}
        <div style={{
          display: "flex",
          padding: 10,
          borderTop: "1px solid #ddd"
        }}>
          <input
            placeholder="Type message..."
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc"
            }}
          />

          <button style={{
            marginLeft: 10,
            padding: "10px 16px",
            background: "#43a047",
            border: "none",
            color: "white",
            borderRadius: 8
          }}>
            Send
          </button>

        </div>

      </div>

    </div>
  );
};

export default Messages;