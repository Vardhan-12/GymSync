import { useEffect, useState } from "react";
import {
  getSuggestions,
  sendRequest,
  getMyMatches,
  getIncoming,
} from "../matchService";

function FindPartnerPage() {

  const [suggestions, setSuggestions] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [connectedIds, setConnectedIds] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sugg, matches, incoming] = await Promise.all([
        getSuggestions(),
        getMyMatches(),
        getIncoming(),
      ]);

      setSuggestions(sugg);

      // ✅ mark connected users
      const connected = new Set();
      matches.forEach((m) => {
        const otherUser =
          m.requester._id === localStorage.getItem("userId")
            ? m.recipient._id
            : m.requester._id;

        connected.add(otherUser);
      });

      setConnectedIds(connected);

      // ✅ mark requested users
      const requested = new Set();
      incoming.forEach((r) => {
        requested.add(r.requester._id);
      });

      setRequestedIds(requested);

    } catch (err) {
      console.error("Error loading partners", err);
    }
  };

  const handleRequest = async (userId) => {
    try {
      await sendRequest(userId);

      // update UI instantly
      setRequestedIds((prev) => new Set(prev).add(userId));

    } catch (err) {
      console.log(err);
      alert("Request failed");
    }
  };

  return (
    <div>
      <h2>Find Workout Partners</h2>

      {suggestions.length === 0 ? (
        <p>No suggestions yet. Try adding sessions.</p>
      ) : (
        suggestions.map((item) => {
          const user = item.user;

          const isConnected = connectedIds.has(user._id);
          const isRequested = requestedIds.has(user._id);

          return (
            <div
              key={user._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginTop: "10px",
              }}
            >
              <h3>{user.name}</h3>
              <p>Overlap Score: {item.overlapCount}</p>

              {/* BUTTON STATES */}

              {isConnected ? (
                <button disabled style={{ background: "green", color: "#fff" }}>
                  Connected
                </button>

              ) : isRequested ? (
                <button disabled>
                  Requested
                </button>

              ) : (
                <button onClick={() => handleRequest(user._id)}>
                  Send Request
                </button>
              )}

            </div>
          );
        })
      )}
    </div>
  );
}

export default FindPartnerPage;