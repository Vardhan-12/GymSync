import { deleteSession } from "../sessionService";

function SessionList({ sessions, refreshSessions }) {

  async function handleDelete(id) {
    try {
      await deleteSession(id);

      // ✅ ALWAYS REFRESH FROM BACKEND
      refreshSessions();

    } catch (error) {
      console.log(error);
      alert("Failed to delete");
    }
  }

  if (!sessions.length) {
    return <p>No sessions found</p>;
  }

  return (
    <div>

      <h3>Your Sessions</h3>

      {sessions.map((session) => {

        const date = new Date(session.startTime);

        return (
          <div
            key={session._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px"
            }}
          >

            <p><strong>Date:</strong> {date.toLocaleDateString()}</p>
            <p><strong>Time:</strong> {date.toLocaleTimeString()}</p>
            <p><strong>Duration:</strong> {session.duration} minutes</p>

            <button onClick={() => handleDelete(session._id)}>
              Delete
            </button>

          </div>
        );
      })}

    </div>
  );
}

export default SessionList;