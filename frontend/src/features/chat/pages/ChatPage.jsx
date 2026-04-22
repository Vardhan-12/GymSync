import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMessages, sendMessage } from "../chatService";
import socket from "../../../socket";

function ChatPage() {
  // 🔹 matchId comes from route: /chat/:matchId
  const { matchId } = useParams();

  // 🔹 state
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 🔹 current user id (stored at login)
  const myId = localStorage.getItem("userId");

  // 🔹 for auto-scroll
  const bottomRef = useRef(null);

  // 🔹 to control typing debounce timer
  const typingTimeoutRef = useRef(null);

  /* ===================================================
     LOAD INITIAL DATA + SOCKET SUBSCRIPTIONS
     =================================================== */
  useEffect(() => {
    // reset pagination when match changes
    setPage(1);
    loadMessages(1);

    // join socket room for this match
    socket.emit("joinRoom", matchId);

    // receive new messages (realtime)
    const onReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    // typing indicators
    const onTyping = () => setTyping(true);
    const onStopTyping = () => setTyping(false);

    socket.on("receiveMessage", (msg) => {
  setMessages((prev) => {
    // ✅ prevent duplicate messages
    const exists = prev.some(
      (m) =>
        m._id === msg._id ||
        (m.text === msg.text && m.createdAt === msg.createdAt)
    );

    if (exists) return prev;

    return [...prev, msg];
  });
});
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);

    // cleanup on unmount / match change
    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
    };
  }, [matchId]);

  /* ===================================================
     LOAD MESSAGES (WITH PAGINATION)
     Backend returns:
     { messages: [], hasMore: true/false }
     =================================================== */
  const loadMessages = async (pageNum = 1) => {
    try {
      // NOTE: your service should call:
      // GET /api/chat/:matchId?page=pageNum&limit=20
      const data = await getMessages(matchId, pageNum);

      if (pageNum === 1) {
        // first page → replace
        setMessages(data.messages || []);
      } else {
        // older messages → prepend
        setMessages((prev) => [...(data.messages || []), ...prev]);
      }

      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      console.log("Load messages error:", err);
    }
  };

  /* ===================================================
     AUTO SCROLL TO BOTTOM WHEN NEW MESSAGE ARRIVES
     =================================================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===================================================
     SEND MESSAGE
     - optimistic UI update
     - emit via socket
     - persist via API
     =================================================== */
  const handleSend = async () => {
    if (!text.trim()) return;

    const newMsg = text.trim();
    setText("");

    // temporary message for instant UI
    const tempMsg = {
      _id: `temp-${Date.now()}`, // unique temp key
      matchId,
      text: newMsg,
      sender: { _id: myId, name: "You" },
      createdAt: new Date().toISOString(),
    };

    try {
      // 1) instant UI
      setMessages((prev) => [...prev, tempMsg]);

      // 2) realtime
      socket.emit("sendMessage", tempMsg);

      // 3) save in DB
      await sendMessage(matchId, newMsg);
    } catch (err) {
      console.log("Send error:", err);
    }
  };

  /* ===================================================
     TYPING HANDLER (DEBOUNCED)
     =================================================== */
  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    // emit typing
    socket.emit("typing", matchId);

    // clear previous timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // stop typing after 800ms of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", matchId);
    }, 800);
  };

  /* ===================================================
     LOAD OLDER MESSAGES (BUTTON)
     =================================================== */
  const loadOlder = () => {
    const next = page + 1;
    setPage(next);
    loadMessages(next);
  };

  /* ===================================================
     UI
     =================================================== */
  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <h3 style={{ margin: 0 }}>Chat</h3>
      </div>

      {/* CHAT AREA */}
      <div style={chatBox}>
        {/* LOAD MORE */}
        {hasMore && (
          <button onClick={loadOlder} style={loadMoreBtn}>
            Load Older Messages
          </button>
        )}

        {/* MESSAGES */}
        {messages.map((msg) => {
          const isMe = String(msg.sender._id) === String(myId);

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
                  {isMe ? "You" : msg.sender?.name}
                </div>

                <div style={textStyle}>{msg.text}</div>

                <div style={time}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        {/* TYPING */}
        {typing && <p style={typingStyle}>Typing...</p>}

        {/* SCROLL ANCHOR */}
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

const loadMoreBtn = {
  alignSelf: "center",
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
  background: "#fff",
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

const typingStyle = {
  fontSize: "12px",
  color: "gray",
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