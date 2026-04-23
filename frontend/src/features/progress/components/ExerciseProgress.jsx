import { useEffect, useState } from "react";
import {
  getUserExercises,
  getExerciseProgress,
  getExerciseInsights
} from "../../workout/workoutService"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function ExerciseProgress() {

  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState("");
  const [progress, setProgress] = useState([]);
  const [insights, setInsights] = useState(null);

  /* ================== LOAD EXERCISES ================== */
  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const data = await getUserExercises();
    setExercises(data);
  };

  /* ================== LOAD PROGRESS ================== */
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

  /* ================== UI ================== */

  return (
    <div style={{ marginTop: "40px" }}>

      <h2>Exercise Progress</h2>

      {/* SELECT DROPDOWN */}
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

      {/* GRAPH */}
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

      {/* INSIGHTS */}
      {insights && (
        <div style={{ marginTop: "15px" }}>
          <p>🏆 Best Weight: {insights.bestWeight}</p>
          <p>📅 Best Day: {insights.bestDay}</p>
          <p>📊 Total Days: {insights.totalDays}</p>
        </div>
      )}

    </div>
  );
}

export default ExerciseProgress;