import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../auth/authContext";
import { getRandomQuote } from "../../../utils/quotes";

import {
  getDensity,
  getPeakHours,
  getBestTime,
  getWeeklySummary,
  getLatestWorkout
} from "../dashboardService";

import DensityChart from "../DensityChart";
import WeeklyChart from "../WeeklyChart";
import { getCrowdLevel } from "../crowdLevel";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const quote = getRandomQuote();

  const [density, setDensity] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [bestTime, setBestTime] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [currentCrowd, setCurrentCrowd] = useState(null);
  const [latestWorkout, setLatestWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        const densityData = await getDensity(today);
        const peakData = await getPeakHours();
        const bestData = await getBestTime();
        const weekly = await getWeeklySummary();
        const latest = await getLatestWorkout();

        setDensity(densityData);
        setPeakHours(peakData);
        setBestTime(bestData);
        setWeeklyData(weekly);
        setLatestWorkout(latest);

        // Detect current crowd level
        const now = new Date();

        const currentWindow = densityData.find((w) => {
          const start = new Date(w.windowStart);
          const end = new Date(start.getTime() + 30 * 60000);
          return now >= start && now < end;
        });

        if (currentWindow) {
          setCurrentCrowd(getCrowdLevel(currentWindow.count));
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return (
      <div>
        <h1>Welcome to GymSync</h1>

        <h3>Motivation</h3>
        <p>{quote}</p>

        <p style={{ marginTop: "20px" }}>
          Login to unlock GymSync features.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <h3>Motivation</h3>
      <p>{quote}</p>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          {/* Latest Workout */}

          <h3 style={{ marginTop: "30px" }}>Last Workout</h3>

          {latestWorkout ? (
            <div>
              <p><strong>{latestWorkout.title}</strong></p>
              <p>Volume: {latestWorkout.totalVolume}</p>
              <p>Exercises: {latestWorkout.exercises.length}</p>
              <p>
                Date: {new Date(latestWorkout.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p>No workouts logged yet.</p>
          )}

          {/* Current Gym Status */}

          <h3 style={{ marginTop: "30px" }}>Current Gym Status</h3>

          {currentCrowd ? (
            <p style={{ fontWeight: "bold", color: currentCrowd.color }}>
              {currentCrowd.emoji} {currentCrowd.label}
            </p>
          ) : (
            <p>No data available</p>
          )}

          {/* Weekly Activity */}

          <h3 style={{ marginTop: "30px" }}>Weekly Gym Activity</h3>

          {weeklyData.length === 0 ? (
            <p>No activity data yet.</p>
          ) : (
            <WeeklyChart data={weeklyData} />
          )}

          {/* Best Time Prediction */}

          <h3 style={{ marginTop: "30px" }}>Gym Crowd Prediction</h3>

          <p>
            {bestTime
              ? `${bestTime.bestHour}:00 (Expected Crowd: ${bestTime.expectedCrowd})`
              : "No prediction available"}
          </p>

          {/* Peak Hours */}

          <h4 style={{ marginTop: "20px" }}>Peak Hours</h4>

          {peakHours.length === 0 ? (
            <p>No peak hour data yet.</p>
          ) : (
            peakHours.map((item, index) => (
              <p key={index}>
                {item._id}:00 — {item.totalSessions} sessions
              </p>
            ))
          )}

          {/* Density Chart */}

          <h4 style={{ marginTop: "30px" }}>Gym Crowd Density</h4>

          {density.length === 0 ? (
            <p>No density data yet.</p>
          ) : (
            <DensityChart data={density} />
          )}
        </>
      )}

      {/* About */}

      <h3 style={{ marginTop: "30px" }}>About GymSync</h3>

      <p>
        GymSync helps you track workouts, find gym partners,
        and analyze gym crowd density.
      </p>
    </div>
  );
}

export default Dashboard;