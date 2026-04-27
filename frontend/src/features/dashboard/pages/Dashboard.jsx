import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../auth/authContext";
import { getRandomQuote } from "../../../utils/quotes";
import { useNavigate } from "react-router-dom";

import {
  getDensity,
  getBestTime,
  getWeeklySummary,
  getLatestWorkout
} from "../dashboardService";

import WeeklyChart from "../WeeklyChart";
import { getCrowdLevel } from "../crowdLevel";

function Dashboard() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const quote = getRandomQuote();

  const [currentCrowd, setCurrentCrowd] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [latestWorkout, setLatestWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================== FETCH DATA ================== */
  useEffect(() => {

    const fetchData = async () => {
      try {

        const today = new Date().toISOString().split("T")[0];

        const densityData = await getDensity(today);
        const best = await getBestTime();
        const weekly = await getWeeklySummary();
        const latest = await getLatestWorkout();

        setBestTime(best);
        setWeeklyData(weekly);
        setLatestWorkout(latest);

        // 🔥 CURRENT CROWD LOGIC
        const now = new Date();

        const currentWindow = densityData.find((w) => {
          const start = new Date(w.windowStart);
          const end = new Date(start.getTime() + 30 * 60000);
          return now >= start && now < end;
        });

        if (currentWindow) {
          setCurrentCrowd(getCrowdLevel(currentWindow.count));
        }

      } catch (err) {
        console.log("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();

  }, [user]);

  /* ================== UI ================== */

  if (!user) {
    return (
      <div>
        <h1>Welcome to GymSync</h1>
        <p>{quote}</p>
      </div>
    );
  }

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>

      <h1>Dashboard</h1>

      <button
  onClick={() => navigate("/find-partner")}
  style={{
    marginTop: "10px",
    padding: "10px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Find Workout Partner
</button>

      {/* 🔹 TOP SECTION */}
      <h3>Welcome, {user.name}</h3>
      <p>{quote}</p>

      <h3 style={{ marginTop: "20px" }}>Last Workout</h3>
      {latestWorkout ? (
        <div>
          <p><strong>{latestWorkout.title}</strong></p>
          <p>Volume: {latestWorkout.totalVolume}</p>
          <p>
            {new Date(latestWorkout.createdAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p>No workouts yet</p>
      )}

      {/* 🔹 MIDDLE SECTION */}
      <h3 style={{ marginTop: "30px" }}>Gym Status</h3>

      {currentCrowd ? (
        <p style={{ color: currentCrowd.color, fontWeight: "bold" }}>
          {currentCrowd.emoji} {currentCrowd.label}
        </p>
      ) : (
        <p>No data available</p>
      )}

      <h3 style={{ marginTop: "20px" }}>Best Time to Go</h3>

      {bestTime ? (
        <p>
          {bestTime.bestHour}:00 — Expected Crowd: {bestTime.expectedCrowd}
        </p>
      ) : (
        <p>No prediction available</p>
      )}

      {/* 🔹 BOTTOM SECTION */}
      <h3 style={{ marginTop: "30px" }}>Weekly Activity</h3>

      {weeklyData.length ? (
        <WeeklyChart data={weeklyData} />
      ) : (
        <p>No data yet</p>
      )}

    </div>
  );
}

export default Dashboard;