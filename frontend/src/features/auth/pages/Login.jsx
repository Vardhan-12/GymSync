import { useState, useContext } from "react";
import { loginUser } from "../authService";
import { AuthContext } from "../authContext";
import { useNavigate } from "react-router-dom";

function Login() {
  // 🔹 Global user context (used across app)
  const { setUser } = useContext(AuthContext);

  // 🔹 Navigation after login
  const navigate = useNavigate();

  // 🔹 Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ================== LOGIN FUNCTION ================== */
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 🔹 Call API
      const data = await loginUser({ email, password });

      console.log("LOGIN RESPONSE:", data);

      /* ================== VALIDATION ================== */

      // ✅ Check token exists
      if (!data?.accessToken) {
        alert("Login failed: Token missing");
        return;
      }

      // ✅ Check user exists
      if (!data?.user || !data.user._id) {
        alert("Login failed: User data missing");
        console.error("Invalid response:", data);
        return;
      }

      /* ================== SAVE DATA ================== */

      // 🔹 Save JWT token (used for API calls)
      localStorage.setItem("accessToken", data.accessToken);

      // 🔹 Save userId (VERY IMPORTANT for chat + UI)
      localStorage.setItem("userId", data.user._id);

      console.log("Saved userId:", localStorage.getItem("userId"));

      /* ================== SET GLOBAL USER ================== */

      // 🔹 Store full user in context
      setUser(data.user);

      /* ================== NAVIGATE ================== */

      navigate("/");

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert("Invalid email or password");
    }
  };

  /* ================== UI ================== */
  return (
    <div style={container}>
      <h2>Login</h2>

      <form onSubmit={handleLogin} style={form}>
        <div style={field}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={field}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" style={button}>
          Login
        </button>
      </form>
    </div>
  );
}

/* ================== STYLES ================== */

const container = {
  maxWidth: "400px",
  margin: "auto",
  marginTop: "100px",
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "10px",
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const field = {
  display: "flex",
  flexDirection: "column",
};

const button = {
  padding: "10px",
  background: "#4CAF50",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

export default Login;