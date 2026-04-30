// Dashboard.jsx

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../auth/authContext";
import { getRandomQuote } from "../../../utils/quotes";
import { useNavigate } from "react-router-dom";

// 🔹 API services
import {
  getDensity,
  getBestTime,
  getWeeklySummary,
  getLatestWorkout
} from "../dashboardService";

// 🔹 UI Components
import WeeklyChart from "../WeeklyChart";
import { getCrowdLevel } from "../crowdLevel";

function Dashboard() {

  /* ================== GLOBAL STATE ================== */

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // random motivation quote
  const quote = getRandomQuote();

  /* ================== LOCAL STATE ================== */

  const [currentCrowd, setCurrentCrowd] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [latestWorkout, setLatestWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================== FETCH DASHBOARD DATA ================== */

  useEffect(() => {

    const fetchData = async () => {
      try {

        // 🔹 get today's date (YYYY-MM-DD)
        const today = new Date().toISOString().split("T")[0];

        // 🔹 call backend APIs
        const densityData = await getDensity(today);
        const best = await getBestTime();
        const weekly = await getWeeklySummary();
        const latest = await getLatestWorkout();

        // 🔹 store in state
        setBestTime(best);
        setWeeklyData(weekly);
        setLatestWorkout(latest);

        /* ================== CURRENT CROWD LOGIC ==================
           Find which 30-min window current time falls into
        ========================================================== */

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

  /* ================== UI STATES ================== */

  // 🔹 not logged in
  if (!user) {
    return (
      <div>
        <h1>Welcome to GymSync</h1>
        <p>{quote}</p>
      </div>
    );
  }

  // 🔹 loading state
  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  /* ================== MAIN UI ================== */

  return (
    <div style={container}>

      {/* 🔹 HEADER */}
      <h1>Dashboard</h1>

      {/* 🔥 FIXED: correct route */}
      <button
        onClick={() => navigate("/connections")}
        style={button}
      >
        Find Workout Partner
      </button>

      {/* ================== TOP SECTION ================== */}

      <h3>Welcome, {user.name}</h3>
      <p style={quoteStyle}>{quote}</p>

      {/* 🔹 Latest Workout */}
      <Section title="Last Workout">

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

      </Section>

      {/* ================== MIDDLE SECTION ================== */}

      <Section title="Gym Status">

        {currentCrowd ? (
          <p style={{
            color: currentCrowd.color,
            fontWeight: "bold"
          }}>
            {currentCrowd.emoji} {currentCrowd.label}
          </p>
        ) : (
          <p>No data available</p>
        )}

      </Section>

      {/* 🔥 AI OUTPUT */}
      <Section title="Best Time to Go">

        {bestTime ? (
          <p>
            {bestTime.bestHour}:00 — Expected Crowd: {bestTime.expectedCrowd}
          </p>
        ) : (
          <p>No prediction available</p>
        )}

      </Section>

      {/* ================== BOTTOM SECTION ================== */}

      <Section title="Weekly Activity">

        {weeklyData.length ? (
          <WeeklyChart data={weeklyData} />
        ) : (
          <p>No data yet</p>
        )}

      </Section>

    </div>
  );
}

/* ================== REUSABLE SECTION ================== */

function Section({ title, children }) {
  return (
    <div style={section}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/* ================== STYLES ================== */

const container = {
  padding: "20px",
};

const section = {
  marginTop: "30px",
};

const button = {
  marginTop: "10px",
  padding: "10px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const quoteStyle = {
  color: "#555",
  fontStyle: "italic"
};

export default Dashboard;