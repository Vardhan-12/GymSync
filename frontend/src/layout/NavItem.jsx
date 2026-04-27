import { Link, useLocation } from "react-router-dom";

/*
  Reusable navigation item
  - Highlights active route
  - Supports badge (for unread count)
*/

function NavItem({ to, label, badge }) {

  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "5px",
        background: isActive ? "#4CAF50" : "transparent",
        color: isActive ? "#fff" : "#333",
        fontWeight: isActive ? "bold" : "normal"
      }}>
        <span>{label}</span>

        {/* 🔥 badge (unread count) */}
        {badge > 0 && (
          <span style={{
            background: "red",
            color: "#fff",
            borderRadius: "12px",
            padding: "2px 8px",
            fontSize: "12px"
          }}>
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export default NavItem;