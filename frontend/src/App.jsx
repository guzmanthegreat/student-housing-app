import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [room_num, setRoomNum] = useState(null);
  const [username, setUsername] = useState(null);

  // Restore from localStorage on first load
  useEffect(() => {
    const savedSession = localStorage.getItem("session");
    const savedUserId = localStorage.getItem("userId");
    const savedRoomNum = localStorage.getItem("room_num");
    const savedUsername = localStorage.getItem("username");

    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch {
        localStorage.removeItem("session");
      }
    }

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
      <Navbar
        session={session}
        userId={userId}
        onLogout={handleLogout}  
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Protect dashboard so only logged-in users see it */}
        <Route
          path="/dashboard"
          element={
            session ? (
              <Dashboard
                userId={userId}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chores" element={
      <Chores
        userId={userId}
        room_num={room_num}
        username={username}
            />
        } />
        <Route path="/create-chore" element={<CreateChore />} />
        <Route path="/edit-chore" element={<EditChore userId={userId}/>} />

        <Route
          path="/bills"
          element={<Bills roomNum={room_num} />}  
        />

        {/* Login route */}
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                session={session}
                onLogin={handleLogin}    
              />
            )
          }
        />

        {/* Signup route */}
        <Route
          path="/signup"
          element={
            <Signup
              session={session}
              onLogin={handleLogin}      
            />
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
