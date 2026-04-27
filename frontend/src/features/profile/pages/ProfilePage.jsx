import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../profileService";

function ProfilePage() {

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setForm(data); // preload form
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 save profile
  const handleSave = async () => {
    try {
      const res = await updateProfile(form);

      setUser(res.user);   // update UI
      setEditMode(false);  // exit edit mode

    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={container}>

      <h2>My Profile</h2>

      {/* ================= VIEW MODE ================= */}
      {!editMode ? (
        <>
          <div style={card}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Gym:</strong> {user.gymName || "-"}</p>
          </div>

          <div style={card}>
            <h3>Fitness Info</h3>
            <p>Age: {user.age || "-"}</p>
            <p>Height: {user.height || "-"} cm</p>
            <p>Weight: {user.weight || "-"} kg</p>
            <p>Preferred Time: {user.preferredWorkoutTime || "-"}</p>
          </div>

          <button onClick={() => setEditMode(true)} style={btn}>
            Edit Profile
          </button>
        </>
      ) : (

        /* ================= EDIT MODE ================= */
        <>
          <div style={card}>

            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="Name"
            />

            <input
              name="gymName"
              value={form.gymName || ""}
              onChange={handleChange}
              placeholder="Gym Name"
            />

            <input
              name="age"
              value={form.age || ""}
              onChange={handleChange}
              placeholder="Age"
              type="number"
            />

            <input
              name="height"
              value={form.height || ""}
              onChange={handleChange}
              placeholder="Height (cm)"
              type="number"
            />

            <input
              name="weight"
              value={form.weight || ""}
              onChange={handleChange}
              placeholder="Weight (kg)"
              type="number"
            />

            <input
              name="preferredWorkoutTime"
              value={form.preferredWorkoutTime || ""}
              onChange={handleChange}
              placeholder="Preferred Time (Morning / Evening)"
            />

          </div>

          <button onClick={handleSave} style={btn}>
            Save
          </button>

          <button onClick={() => setEditMode(false)} style={btn}>
            Cancel
          </button>
        </>
      )}

    </div>
  );
}


// ================= STYLES =================

const container = {
  maxWidth: "500px",
  margin: "auto",
  padding: "20px",
};

const card = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "15px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const btn = {
  marginRight: "10px",
  padding: "8px 12px",
  cursor: "pointer",
};

export default ProfilePage;