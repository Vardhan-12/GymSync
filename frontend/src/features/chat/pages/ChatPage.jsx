import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMessages, sendMessage } from "../chatService";
import socket from "../../../socket";

function ChatPage() {
  const { matchId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const myId = localStorage.getItem("userId");
  const bottomRef = useRef(null);

  /* ================== LOAD + SOCKET ================== */
  useEffect(() => {
    loadMessages();

    // join room
    socket.emit("joinRoom", matchId);

    // receive message
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // typing
    socket.on("typing", () => setTyping(true));
    socket.on("stopTyping", () => setTyping(false));

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [matchId]);

  /* ================== LOAD MESSAGES ================== */
  const loadMessages = async () => {
    try {
      const data = await getMessages(matchId);
      setMessages(data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================== AUTO SCROLL ================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================== SEND MESSAGE ================== */
  const handleSend = async () => {
    if (!text.trim()) return;

    const newMsg = text;
    setText("");

    const messageData = {
      matchId,
      text: newMsg,
      sender: {
        _id: myId,
        name: "You",
      },
      createdAt: new Date(),
    };

    try {
      // realtime
      socket.emit("sendMessage", messageData);

      // save in DB
      await sendMessage(matchId, newMsg);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================== TYPING ================== */
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit("typing", matchId);

    setTimeout(() => {
      socket.emit("stopTyping", matchId);
    }, 1000);
  };

  /* ================== UI ================== */
  return (
    <div style={container}>
      <div style={header}>
        <h3>Chat</h3>
      </div>

      {/* CHAT */}
      <div style={chatBox}>
        {messages.map((msg) => {
          const isMe = msg.sender._id === myId;

          return (
            <div
              key={msg._id}
              style={{
                ...messageWrapper,
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...bubble,
                  background: isMe ? "#4CAF50" : "#f1f1f1",
                  color: isMe ? "#fff" : "#000",
                  borderRadius: isMe
                    ? "12px 12px 0 12px"
                    : "12px 12px 12px 0",
                }}
              >
                <div style={name}>
                  {isMe ? "You" : msg.sender.name}
                </div>

                <div style={textStyle}>{msg.text}</div>

                <div style={time}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        {/* typing */}
        {typing && <p style={{ fontSize: "12px" }}>Typing...</p>}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={inputBar}>
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Type a message..."
          style={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <button onClick={handleSend} style={sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ================== STYLES ================== */

const container = {
  display: "flex",
  flexDirection: "column",
  height: "90vh",
  maxWidth: "800px",
  margin: "auto",
  border: "1px solid #ddd",
  borderRadius: "10px",
  overflow: "hidden",
};

const header = {
  padding: "15px",
  borderBottom: "1px solid #eee",
  background: "#fafafa",
};

const chatBox = {
  flex: 1,
  overflowY: "auto",
  padding: "15px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  background: "#f9f9f9",
};

const messageWrapper = {
  display: "flex",
};

const bubble = {
  maxWidth: "60%",
  padding: "10px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const name = {
  fontSize: "11px",
  fontWeight: "bold",
  marginBottom: "2px",
};

const textStyle = {
  fontSize: "14px",
  marginBottom: "4px",
};

const time = {
  fontSize: "10px",
  textAlign: "right",
  opacity: 0.7,
};

const inputBar = {
  display: "flex",
  gap: "10px",
  padding: "10px",
  borderTop: "1px solid #eee",
  background: "#fff",
};

const input = {
  flex: 1,
  padding: "10px",
  borderRadius: "20px",
  border: "1px solid #ccc",
  outline: "none",
};

const sendBtn = {
  padding: "10px 15px",
  border: "none",
  borderRadius: "20px",
  background: "#4CAF50",
  color: "#fff",
  cursor: "pointer",
};

export default ChatPage;