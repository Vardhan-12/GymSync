import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 existing APIs
import {
  getMyMatches,
  getIncomingRequests,
  respondToRequest,
} from "../../profile/profileService";

// 🔥 NEW APIs (AI suggestions + send request)
import {
  getSuggestions,
  sendRequest,
} from "../matchService";

/*
  CONNECTIONS PAGE

  Tabs:
  1. Discover  → find partners (AI suggestions)
  2. Matches   → accepted users (chat)
  3. Requests  → incoming requests

*/

function ConnectionsPage() {

  /* ================= STATE ================= */

  const [activeTab, setActiveTab] = useState("discover");

  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();
  const myId = localStorage.getItem("userId");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [m, r, s] = await Promise.all([
        getMyMatches(),
        getIncomingRequests(),
        getSuggestions(), // 🔥 AI suggestions
      ]);

      // 🔥 sort matches by latest message
      const sortedMatches = (m || []).sort((a, b) => {
        const timeA = a.lastMessage?.createdAt || a.createdAt;
        const timeB = b.lastMessage?.createdAt || b.createdAt;
        return new Date(timeB) - new Date(timeA);
      });

      setMatches(sortedMatches);
      setRequests(r || []);
      setSuggestions(s || []);

    } catch (err) {
      console.log("Load error:", err);
    }
  };

  /* ================= SEND REQUEST ================= */

  const handleSendRequest = async (userId) => {
    try {
      await sendRequest(userId);
      alert("Request sent");

      // refresh suggestions
      loadData();

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  /* ================= ACCEPT / REJECT ================= */

  const handleResponse = async (id, action) => {
    try {
      await respondToRequest(id, action);

      // remove from UI
      setRequests(prev => prev.filter(r => r._id !== id));

      if (action === "accepted") {
        loadData();
      }

    } catch (err) {
      console.log("Response error:", err);
    }
  };

  /* ================= OPEN CHAT ================= */

  const openChat = (matchId) => {
    navigate(`/chat/${matchId}`);
  };

  /* ================= UI ================= */

  return (
    <div style={container}>

      <h1>Connections</h1>

      {/* 🔥 TABS */}
      <div style={tabContainer}>

        <button
          onClick={() => setActiveTab("discover")}
          style={activeTab === "discover" ? activeTabStyle : tabStyle}
        >
          Discover
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          style={activeTab === "matches" ? activeTabStyle : tabStyle}
        >
          Matches
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          style={activeTab === "requests" ? activeTabStyle : tabStyle}
        >
          Requests ({requests.length})
        </button>

      </div>

      {/* ================= DISCOVER ================= */}
      {activeTab === "discover" && (
        <div>

          {suggestions.length === 0 && <p>No suggestions yet</p>}

          {suggestions.map((item) => (
            <div key={item.user._id} style={card}>

              <div>
                <p style={name}>{item.user.name}</p>

                <p style={subText}>
                  Overlap Score: {item.overlapScore}
                </p>

                <p style={subText}>
                  Match Score: {item.totalScore}
                </p>
              </div>

              <button onClick={() => handleSendRequest(item.user._id)}>
                Send Request
              </button>

            </div>
          ))}

        </div>
      )}

      {/* ================= MATCHES ================= */}
      {activeTab === "matches" && (
        <div>

          {matches.length === 0 && <p>No matches yet</p>}

          {matches.map((match) => {

            const otherUser =
              match.requester?._id === myId
                ? match.recipient
                : match.requester;

            return (
              <div key={match._id} style={card}>

                <div>
                  <p style={name}>
                    {otherUser?.name || "User"}
                  </p>

                  <p style={subText}>
                    {match.lastMessage
                      ? match.lastMessage.text
                      : "No messages yet"}
                  </p>

                  {match.lastMessage && (
                    <p style={time}>
                      {new Date(match.lastMessage.createdAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                <button onClick={() => openChat(match._id)}>
                  Open Chat
                </button>

              </div>
            );
          })}

        </div>
      )}

      {/* ================= REQUESTS ================= */}
      {activeTab === "requests" && (
        <div>

          {requests.length === 0 && <p>No requests</p>}

          {requests.map((req) => (
            <div key={req._id} style={card}>

              <p style={name}>
                {req.requester?.name}
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleResponse(req._id, "accepted")}>
                  Accept
                </button>

                <button onClick={() => handleResponse(req._id, "rejected")}>
                  Reject
                </button>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: "20px",
};

const tabContainer = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
};

const tabStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const activeTabStyle = {
  ...tabStyle,
  background: "#4CAF50",
  color: "#fff",
};

const card = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  marginBottom: "10px",
};

const name = {
  fontWeight: "bold",
};

const subText = {
  fontSize: "13px",
  color: "gray",
};

const time = {
  fontSize: "11px",
  color: "#999",
};

export default ConnectionsPage;