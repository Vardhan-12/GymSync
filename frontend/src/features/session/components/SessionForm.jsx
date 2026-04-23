import { useState } from "react";
import { createSession } from "../sessionService";

function SessionForm({ refreshSessions }) {

  // ✅ single datetime input (better UX)
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!startTime || !duration) {
      alert("All fields required");
      return;
    }

    try {
      await createSession({
        startTime,
        duration: Number(duration)
      });

      alert("Session saved");

      // ✅ CLEAR FORM
      setStartTime("");
      setDuration("");

      // ✅ REFRESH FROM BACKEND (IMPORTANT)
      refreshSessions();

    } catch (error) {
      console.log(error);
      alert("Failed to create session");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>

      <h3>Log Gym Session</h3>

      {/* ✅ better input */}
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />

      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <button type="submit">Save Session</button>

    </form>
  );
}

export default SessionForm;