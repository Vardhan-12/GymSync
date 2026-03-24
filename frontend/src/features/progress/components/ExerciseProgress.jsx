import { useEffect, useState } from "react";
import { getExerciseProgress, getUserExercises } from "../../workout/workoutService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function ExerciseProgress() {
  const [exercise, setExercise] = useState("");
  const [data, setData] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await getUserExercises();
        setExerciseList(res);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExercises();
  }, []);

  const handleFetch = async () => {
    if (!exercise) {
      alert("Please select an exercise");
      return;
    }

    try {
      const res = await getExerciseProgress(exercise);
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <select
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
      >
        <option value="">Select Exercise</option>
        {exerciseList.map((ex, index) => (
          <option key={index} value={ex.name}>
            {ex.name}
          </option>
        ))}
      </select>

      <button onClick={handleFetch}>View Progress</button>

      {data.length > 0 && (
        <LineChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) =>
              new Date(d).toLocaleDateString()
            }
          />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="weight" />
        </LineChart>
      )}
    </div>
  );
}

export default ExerciseProgress;