import { useEffect, useState } from "react";
import {
  getUserExercises,
  getExerciseProgress,
  getExerciseInsights,
  getVolumeProgress
} from "../../workout/workoutService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function ProgressPage() {

  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState("");
  const [progress, setProgress] = useState([]);
  const [insights, setInsights] = useState(null);
  const [volume, setVolume] = useState([]);

  /* ================= LOAD EXERCISES ================= */
  useEffect(() => {
    loadExercises();
    loadVolume();
  }, []);

  const loadExercises = async () => {
    const data = await getUserExercises();
    setExercises(data);
  };

  const loadVolume = async () => {
    const data = await getVolumeProgress();
    setVolume(data);
  };

  /* ================= LOAD PROGRESS ================= */
  useEffect(() => {
    if (!selected) return;

    loadProgress(selected);

  }, [selected]);

  const loadProgress = async (exercise) => {

    const data = await getExerciseProgress(exercise);
    const insightData = await getExerciseInsights(exercise);

    setProgress(data);
    setInsights(insightData);
  };

  return (
    <div>

      <h1>Workout Progress</h1>

      {/* ================= SELECT ================= */}

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Select Exercise</option>

        {exercises.map((ex, i) => (
          <option key={i} value={ex.name}>
            {ex.name}
          </option>
        ))}

      </select>

      {/* ================= GRAPH ================= */}

      {progress.length > 0 && (

        <div style={{ width: "100%", height: 300, marginTop: "20px" }}>

          <ResponsiveContainer>

            <LineChart data={progress}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />
              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="weight"
                stroke="#4CAF50"
              />

            </LineChart>

          </ResponsiveContainer>

        </div>
      )}

      {/* ================= INSIGHTS ================= */}

      {insights && (
        <div style={{ marginTop: "20px" }}>
          <h3>Insights</h3>
          <p>🔥 Best Lift: {insights.bestWeight} kg</p>
          <p>📅 Best Day: {insights.bestDay}</p>
          <p>📊 Total Days: {insights.totalDays}</p>
        </div>
      )}

      {/* ================= VOLUME GRAPH ================= */}

      {volume.length > 0 && (

        <div style={{ marginTop: "40px" }}>

          <h3>Volume Progress</h3>

          <div style={{ width: "100%", height: 300 }}>

            <ResponsiveContainer>

              <LineChart data={volume}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />
                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="totalVolume"
                  stroke="#FF9800"
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>
      )}

    </div>
  );
}

export default ProgressPage;