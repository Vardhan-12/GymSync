import { useEffect, useState } from "react";
import SessionForm from "../components/SessionForm";
import SessionList from "../components/SessionList";
import { getSessions } from "../sessionService";

function SessionPage() {

  // Store sessions
  const [sessions, setSessions] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);

  /* ================== FETCH SESSIONS ================== */
  const fetchSessions = async (pageNum = 1) => {
    try {
      setLoading(true);

      const res = await getSessions(pageNum);

      // 🔥 IMPORTANT: adjust based on your backend response
      setSessions(res.data.sessions);

    } catch (error) {
      console.log("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================== INITIAL LOAD ================== */
  useEffect(() => {
    fetchSessions(page);
  }, [page]);

  return (
    <div>

      <h2>Gym Sessions</h2>

      {/* ================== FORM ================== */}
      <SessionForm refreshSessions={fetchSessions} />

      {/* ================== LIST ================== */}
      {loading ? (
        <p>Loading sessions...</p>
      ) : (
        <SessionList
          sessions={sessions}
          refreshSessions={fetchSessions}
        />
      )}

    </div>
  );
}

export default SessionPage;