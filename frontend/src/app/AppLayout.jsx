import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";

function AppLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Header /> {/* ✅ ADD THIS */}

        <div style={{ padding: "20px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;