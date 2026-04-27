import { useEffect, useState } from "react";
import { getMyMatches } from "../../profile/profileService";
import { useNavigate } from "react-router-dom";

function ChatListPage() {

  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await getMyMatches();

      // 🔥 sort by latest message
      const sorted = (data || []).sort((a, b) => {
        const timeA = a.lastMessage?.createdAt || a.createdAt;
        const timeB = b.lastMessage?.createdAt || b.createdAt;

        return new Date(timeB) - new Date(timeA);
      });

      setMatches(sorted);

    } catch (err) {
      console.log(err);
    }
  };

  const myId = localStorage.getItem("userId");

  return (
    <div>

      <h2>Chats</h2>

      {matches.length === 0 ? (
        <p>No conversations yet</p>
      ) : (
        matches.map((match) => {

          const otherUser =
            match.requester?._id === myId
              ? match.recipient
              : match.requester;

          return (
            <div key={match._id} style={card}>

              <div>
                <p style={{ fontWeight: "bold" }}>
                  {otherUser?.name}
                </p>

                <p style={{ fontSize: "12px", color: "gray" }}>
                  {match.lastMessage
                    ? match.lastMessage.text
                    : "Start conversation"}
                </p>
              </div>

              <button onClick={() => navigate(`/chat/${match._id}`)}>
                Open
              </button>

            </div>
          );
        })
      )}

    </div>
  );
}

const card = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  marginBottom: "10px"
};

export default ChatListPage;