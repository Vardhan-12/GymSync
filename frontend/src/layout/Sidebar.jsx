// src/layout/Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../features/auth/authContext";

function Sidebar() {
  const { logout } = useContext(AuthContext);

  return (
    <div style={container}>

      {/* LOGO / APP NAME */}
      <h2 style={logo}>GymSync</h2>

      {/* MAIN NAVIGATION */}
      <div style={navSection}>
        <NavItem to="/" label="Dashboard" />
        <NavItem to="/sessions" label="Sessions" />
        <NavItem to="/workouts" label="Workouts" />
        <NavItem to="/progress" label="Progress" />
      </div>

      {/* SOCIAL */}
      <div style={navSection}>
        <SectionTitle title="Social" />
        <NavItem to="/connections" label="Connections" />
      </div>

      {/* PROFILE */}
      <div style={navSection}>
        <SectionTitle title="Account" />
        <NavItem to="/profile" label="Profile" />
      </div>

      {/* LOGOUT */}
      <button onClick={logout} style={logoutBtn}>
        Logout
      </button>

    </div>
  );
}

/* 🔹 Reusable Nav Item with ACTIVE styling */
function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...link,
        ...(isActive ? activeLink : {}),
      })}
    >
      {label}
    </NavLink>
  );
}

/* 🔹 Section Title */
function SectionTitle({ title }) {
  return <p style={sectionTitle}>{title}</p>;
}

/* ================= STYLES ================= */

const container = {
  width: "220px",
  height: "100vh",
  padding: "20px",
  background: "#f8f9fa",
  borderRight: "1px solid #e0e0e0",
  display: "flex",
  flexDirection: "column",
};

const logo = {
  marginBottom: "30px",
  fontWeight: "bold",
};

const navSection = {
  marginBottom: "25px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const sectionTitle = {
  fontSize: "12px",
  color: "#888",
  marginBottom: "5px",
};

const link = {
  textDecoration: "none",
  color: "#333",
  padding: "10px",
  borderRadius: "8px",
  transition: "0.2s",
};

const activeLink = {
  background: "#4CAF50",
  color: "#fff",
  fontWeight: "bold",
};

const logoutBtn = {
  marginTop: "auto",
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  background: "#ff4d4f",
  color: "#fff",
  cursor: "pointer",
};

export default Sidebar;