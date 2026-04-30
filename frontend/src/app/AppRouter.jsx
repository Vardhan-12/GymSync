import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../features/auth/authContext";

// Layout
import AppLayout from "./AppLayout";

// Pages
import Dashboard from "../features/dashboard/pages/Dashboard";
import SessionPage from "../features/session/pages/SessionPage";
import WorkoutPage from "../features/workout/pages/WorkoutPage";
import ProgressPage from "../features/progress/pages/ProgressPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import ChatPage from "../features/chat/pages/ChatPage";
import ConnectionsPage from "../features/match/pages/ConnectionsPage";

// Auth
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

function AppRouter() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        {!user && (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* ================= PROTECTED ================= */}
        {user && (
          <>
            <Route element={<AppLayout />}>

              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Core Features */}
              <Route path="/sessions" element={<SessionPage />} />
              <Route path="/workouts" element={<WorkoutPage />} />
              <Route path="/progress" element={<ProgressPage />} />

              {/* Social (MERGED PAGE) */}
              <Route path="/connections" element={<ConnectionsPage />} />

              {/* Chat */}
              <Route path="/chat/:matchId" element={<ChatPage />} />

              {/* Profile */}
              <Route path="/profile" element={<ProfilePage />} />

            </Route>

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;