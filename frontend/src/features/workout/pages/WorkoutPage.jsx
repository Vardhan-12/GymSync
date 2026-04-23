import { useEffect, useState } from "react";
import WorkoutForm from "../WorkoutForm";
import {
  getWorkouts,
  deleteWorkout,
  updateWorkout
} from "../workoutService";

function WorkoutPage() {

  /* ================== STATE ================== */

  const [workouts, setWorkouts] = useState([]);
  const [mode, setMode] = useState("library"); // library | create | editor
  const [activeWorkout, setActiveWorkout] = useState(null);

  /* ================== LOAD WORKOUTS ================== */

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const data = await getWorkouts();
    setWorkouts(data || []);
  };

  /* ================== STATS (TOP SECTION) ================== */

  const totalWorkouts = workouts.length;

  const totalVolume = workouts.reduce(
    (sum, w) => sum + (w.totalVolume || 0),
    0
  );

  const lastWorkout =
    workouts.length > 0
      ? new Date(workouts[0].createdAt).toLocaleDateString()
      : "N/A";

  /* ================== ACTIONS ================== */

  const handleWorkoutAdded = async () => {
    await fetchWorkouts();
    setMode("library");
  };

  const handleDelete = async (id) => {
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w._id !== id));
  };

  const openWorkout = (workout) => {
    setActiveWorkout(workout);
    setMode("editor");
  };

  const finishWorkout = async () => {
    try {
      const updatedExercises = activeWorkout.exercises.map(ex => {

  return {
    ...ex,

    // ✅ ALWAYS PUSH PROGRESS ENTRY
    progress: [
      ...(ex.progress || []),
      {
        weight: ex.weight,
        reps: ex.reps,
        sets: ex.sets,
        date: new Date()
      }
    ]
  };
});

await updateWorkout(activeWorkout._id, {
  title: activeWorkout.title,
  exercises: updatedExercises
});

      await fetchWorkouts();

      setActiveWorkout(null);
      setMode("library");

    } catch (error) {
      console.error("Update failed", error);
    }
  };

  /* ================== UI ================== */

  return (
    <div>

      <h1>Workout Tracker</h1>

      {/* ================== TOP: STATS ================== */}

      {mode === "library" && (
        <div style={{ marginBottom: "20px" }}>

          <h3>Stats</h3>

          <p>Total Workouts: {totalWorkouts}</p>
          <p>Total Volume: {totalVolume}</p>
          <p>Last Workout: {lastWorkout}</p>

        </div>
      )}

      {/* ================== LIBRARY ================== */}

      {mode === "library" && (

        <div>

          <h2>Workout Library</h2>

          {workouts.length === 0 && (
            <p>No workouts yet. Start building 💪</p>
          )}

          {workouts.map((workout) => (

            <div
              key={workout._id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginTop: "10px",
                borderRadius: "8px"
              }}
            >

              <h3>{workout.title}</h3>

              <p>Exercises: {workout.exercises.length}</p>
              <p>Volume: {workout.totalVolume}</p>

              <p style={{ fontSize: "12px", color: "gray" }}>
                {new Date(workout.createdAt).toLocaleDateString()}
              </p>

              <button onClick={() => openWorkout(workout)}>
                Open
              </button>

              <button
                onClick={() => handleDelete(workout._id)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>

            </div>

          ))}

          <button
            style={{ marginTop: "20px" }}
            onClick={() => setMode("create")}
          >
            + Create Workout
          </button>

        </div>
      )}

      {/* ================== CREATE ================== */}

      {mode === "create" && (

        <div>

          <button onClick={() => setMode("library")}>
            ← Back
          </button>

          <WorkoutForm onWorkoutAdded={handleWorkoutAdded} />

        </div>
      )}

      {/* ================== EDITOR ================== */}

      {mode === "editor" && activeWorkout && (

        <div>

          <button onClick={() => setMode("library")}>
            ← Back
          </button>

          <h2>{activeWorkout.title}</h2>

          {activeWorkout.exercises.map((ex, index) => (

            <div key={index} style={{ marginBottom: "10px" }}>

              <input
                value={ex.name}
                onChange={(e) => {
                  const updated = [...activeWorkout.exercises];
                  updated[index].name = e.target.value;
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              />

              <input
                type="number"
                value={ex.sets}
                onChange={(e) => {
                  const updated = [...activeWorkout.exercises];
                  updated[index].sets = Number(e.target.value);
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              />

              <input
                type="number"
                value={ex.reps}
                onChange={(e) => {
                  const updated = [...activeWorkout.exercises];
                  updated[index].reps = Number(e.target.value);
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              />

              <input
                type="number"
                value={ex.weight}
                onChange={(e) => {
                  const updated = [...activeWorkout.exercises];
                  updated[index].weight = Number(e.target.value);
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              />

              <button
                onClick={() => {
                  const updated = activeWorkout.exercises.filter((_, i) => i !== index);
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              >
                Delete
              </button>

            </div>

          ))}

          <button
            onClick={() =>
              setActiveWorkout({
                ...activeWorkout,
                exercises: [
                  ...activeWorkout.exercises,
                  { name: "", sets: 0, reps: 0, weight: 0 }
                ]
              })
            }
          >
            + Add Exercise
          </button>

          <button
            onClick={finishWorkout}
            style={{ marginLeft: "10px" }}
          >
            Finish Workout
          </button>

        </div>
      )}

    </div>
  );
}

export default WorkoutPage;