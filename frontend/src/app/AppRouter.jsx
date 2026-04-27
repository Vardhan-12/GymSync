import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../features/auth/authContext";
import AppLayout from "./AppLayout";
import Dashboard from "../features/dashboard/pages/Dashboard";
import SessionPage from "../features/session/pages/SessionPage";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import WorkoutPage from "../features/workout/pages/WorkoutPage";
import ProgressPage from "../features/progress/pages/ProgressPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import ProfileList from "../features/profile/pages/ProfileList";
import ChatPage from "../features/chat/pages/ChatPage";
import FindPartnerPage from "../features/match/pages/FindPartnerPage";
import ChatListPage from "../features/chat/pages/ChatListPage";

function AppRouter() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        {!user && (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* Protected routes */}
        {user && (
          <>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sessions" element={<SessionPage />} />
              <Route path="/workouts" element={<WorkoutPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profiles" element={<ProfileList />} />
              <Route path="/chat/:matchId" element={<ChatPage />} />
              <Route path="/chats" element={<ChatListPage />} />
              <Route path="/find-partner" element={<FindPartnerPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;