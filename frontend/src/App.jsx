import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/NavBar";

import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chores from "./pages/Chores";
import Bills from "./pages/Bills";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CreateChore from "./pages/CreateChore";
import EditChore from "./pages/EditChore";
import { api } from "./lib/api";

export default function App() {
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [room_num, setRoomNum] = useState(null);
  const [username, setUsername] = useState(null);

  // Local storage keeps the user logged in after a browser refresh.
  useEffect(() => {
    api("/api/me")
      .then(async (response) => {
        if (!response.ok) {
          localStorage.removeItem("session");
          localStorage.removeItem("userId");
          localStorage.removeItem("room_num");
          localStorage.removeItem("username");
          return;
        }
        const user = await response.json();
        setSession(user);
        setUserId(user.userId);
        setRoomNum(user.room_num);
        setUsername(user.name);
        localStorage.setItem("session", JSON.stringify(user));
        localStorage.setItem("userId", String(user.userId));
        localStorage.setItem("room_num", String(user.room_num));
        localStorage.setItem("username", user.name);
      })
      .catch(() => {});

    const savedUserId = localStorage.getItem("userId");
    const savedRoomNum = localStorage.getItem("room_num");
    const savedUsername = localStorage.getItem("username");

    if (savedUserId) setUserId(Number(savedUserId));
    if (savedRoomNum) setRoomNum(Number(savedRoomNum));
    if (savedUsername) setUsername(savedUsername);
  }, []);

  // Called when login/signup succeeds
  const handleLogin = (userData) => {
    const nameFromUser = userData.name || userData.username || "";

    setSession(userData);
    setUserId(userData.userId);
    setRoomNum(userData.room_num);
    setUsername(nameFromUser);

    localStorage.setItem("session", JSON.stringify(userData));
    localStorage.setItem("userId", String(userData.userId));
    localStorage.setItem("room_num", String(userData.room_num));
    localStorage.setItem("username", nameFromUser);
  };

  // Called when Logout button clicked
  const handleLogout = () => {
    api("/api/logout", { method: "POST" }).catch(() => {});
    setSession(null);
    setUserId(null);
    setRoomNum(null);
    setUsername(null);

    localStorage.removeItem("session");
    localStorage.removeItem("userId");
    localStorage.removeItem("room_num");
    localStorage.removeItem("username");
  };

  return (
    <Router>
      <Navbar session={session} userId={userId} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        {/* Protect dashboard so only logged-in users see it */}
        <Route
          path="/dashboard"
          element={
            session ? (
              <Dashboard userId={userId} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/calendar" element={session ? <Calendar /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" replace />} />
        <Route
          path="/chores"
          element={
            session ? (
              <Chores userId={userId} room_num={room_num} username={username} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/create-chore" element={session ? <CreateChore /> : <Navigate to="/login" replace />} />
        <Route path="/edit-chore" element={session ? <EditChore userId={userId} /> : <Navigate to="/login" replace />} />

        <Route path="/bills" element={session ? <Bills roomNum={room_num} /> : <Navigate to="/login" replace />} />

        {/* Login route */}
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login session={session} onLogin={handleLogin} />
            )
          }
        />

        {/* Signup route */}
        <Route
          path="/signup"
          element={<Signup session={session} onLogin={handleLogin} />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
