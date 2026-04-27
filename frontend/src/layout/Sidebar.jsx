import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../features/auth/authContext";
import NavItem from "./NavItem";
import { getMyMatches } from "../features/profile/profileService";

/*
  Sidebar
  - Navigation
  - Unread chat count
*/

function Sidebar() {

  const { user, logout } = useContext(AuthContext);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    loadUnread();
  }, []);

  const loadUnread = async () => {
    try {
      const matches = await getMyMatches();

      let total = 0;

      matches.forEach(m => {
        total += m.unreadCount || 0; // backend should send this
      });

      setUnread(total);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={sidebar}>

      <h2>GymSync</h2>

      <NavItem to="/" label="Dashboard" />
      <NavItem to="/sessions" label="Sessions" />
      <NavItem to="/workouts" label="Workouts" />
      <NavItem to="/progress" label="Progress" />
      <NavItem to="/find-partner" label="Find Partner" />

      {/* 🔥 unread badge */}
      <NavItem to="/chats" label="Chats" badge={unread} />

      <NavItem to="/profiles" label="All Users" />
      <NavItem to="/profile" label="Profile" />

      {user && (
        <div onClick={logout} style={logoutBtn}>
          Logout
        </div>
      )}

    </div>
  );
}

const sidebar = {
  width: "220px",
  height: "100vh",
  padding: "20px",
  background: "#f9f9f9",
  borderRight: "1px solid #ddd",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const logoutBtn = {
  marginTop: "auto",
  color: "red",
  cursor: "pointer"
};

export default Sidebar;