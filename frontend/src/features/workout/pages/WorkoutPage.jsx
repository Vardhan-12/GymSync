import { useEffect, useState } from "react";
import WorkoutForm from "../WorkoutForm";
import { getWorkouts, deleteWorkout, updateWorkout } from "../workoutService";

function WorkoutPage() {

  // all workouts from backend
  const [workouts, setWorkouts] = useState([]);

  // page mode (library | create | editor)
  const [mode, setMode] = useState("library");

  // currently opened workout
  const [activeWorkout, setActiveWorkout] = useState(null);


  // load workouts when page opens
  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const data = await getWorkouts();
    setWorkouts(data || []);
  };


  // after new workout created → refresh list
  const handleWorkoutAdded = async () => {
    await fetchWorkouts();
    setMode("library");
  };


  // delete workout
  const handleDelete = async (id) => {
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w._id !== id));
  };


  // open workout editor
  const openWorkout = (workout) => {
    setActiveWorkout(workout);
    setMode("editor");
  };


  // finish workout → go back to library
  const finishWorkout = async () => {

  try {

    await updateWorkout(activeWorkout._id, {
      title: activeWorkout.title,
      exercises: activeWorkout.exercises
    });

    // reload workouts from backend
    await fetchWorkouts();

    // reset editor
    setActiveWorkout(null);
    setMode("library");

  } catch (error) {
    console.error("Failed to update workout", error);
  }

};


  return (
    <div>

      <h1>Workout Tracker</h1>
   

      {/* ================= WORKOUT LIBRARY ================= */}

      {mode === "library" && (

        <div>

          <h2>Saved Workouts</h2>

          {workouts.length === 0 && (
            <p>No saved workouts yet.</p>
          )}

          {workouts.map((workout) => (

            <div
              key={workout._id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginTop: "10px"
              }}
            >

              {/* workout title */}
              <h3>{workout.title}</h3>

              {/* number of exercises */}
              <p>{workout?.exercises?.length || 0} exercises</p>

              <button onClick={() => openWorkout(workout)}>
                Open Workout
              </button>

              <button
                style={{ marginLeft: "10px" }}
                onClick={() => handleDelete(workout._id)}
              >
                Delete
              </button>

            </div>

          ))}

          {/* create new workout */}
          <button
            style={{ marginTop: "20px" }}
            onClick={() => setMode("create")}
          >
            + Create New Workout
          </button>

        </div>

      )}


      {/* ================= CREATE WORKOUT ================= */}

      {mode === "create" && (

        <div>

          <button onClick={() => setMode("library")}>
            ← Back
          </button>

          <WorkoutForm onWorkoutAdded={handleWorkoutAdded} />

        </div>

      )}


      {/* ================= WORKOUT EDITOR ================= */}

      {mode === "editor" && activeWorkout && (

        <div>

          <button onClick={() => setMode("library")}>
            ← Back
          </button>

          <h2>{activeWorkout.title}</h2>

          {activeWorkout.exercises.map((ex, index) => (

            <div key={index} style={{ marginBottom: "10px" }}>

              {/* exercise name */}
              <input
                value={ex.name}
                onChange={(e) => {
                  const updated = [...activeWorkout.exercises];
                  updated[index].name = e.target.value;
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              />

              {/* sets */}
              <input
                type="number"
                value={ex.sets}
                onChange={(e) => {
                  const updated = [...activeWorkout.exercises];
                  updated[index].sets = Number(e.target.value);
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              />

              {/* reps */}
              <input
                type="number"
                value={ex.reps}
                onChange={(e) => {
                  const updated = [...activeWorkout.exercises];
                  updated[index].reps = Number(e.target.value);
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              />

              {/* weight */}
              <input
                type="number"
                value={ex.weight}
                onChange={(e) => {
                  const updated = [...activeWorkout.exercises];
                  updated[index].weight = Number(e.target.value);
                  setActiveWorkout({ ...activeWorkout, exercises: updated });
                }}
              />

              {/* delete exercise */}
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

          {/* add new exercise */}
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

          {/* finish workout */}
          <button
            style={{ marginLeft: "10px" }}
            onClick={finishWorkout}
          >
            Finish Workout
          </button>

        </div>

      )}


    </div>
  );
}

export default WorkoutPage;