import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";

// Icons
import password_icon from "../assets/password.png";
import user_icon from "../assets/user.png";
import { api } from "../lib/api";

export default function Login({ session, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [action, setAction] = useState("Welcome back.");

  // Track input fields
  const [username, setUsername] = useState(""); // Must be username for backend login
  const [password, setPassword] = useState("");

  // store error message for inline display
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const dest = location.state?.from?.pathname ?? "/";
      navigate(dest, { replace: true });
    }
  }, [session, location, navigate]);

  // Login function
  const handleLogin = async () => {
    try {
      setErrorMessage(""); // clear any old error
      const res = await api("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Safe check
        if (typeof setSession === "function") {
          setSession(true);
        }
        if (data.userId) {
          console.log("signup data: ", data);
          onLogin(data);
          navigate("/dashboard"); // redirect to dashboard after login
          //Store the User ID in local storage for persistence
          localStorage.setItem("userId", data.userId);

          // Pass the ID to the parent state (optional, but good for immediate use)
          if (typeof setUserId === "function") {
            setUserId(data.userId);
          }
        }
      } else {
        setErrorMessage(
          data.error || "Incorrect username or password. Try again!",
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="gil-auth">
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>

        <div className="inputs">
          {/* Name (Sign Up only) */}
          {action === "Welcome back." ? null : (
            <div className="input">
              <img src={user_icon} alt="user" />
              <input type="text" placeholder="Your Full Fetch Name" />
            </div>
          )}

          {/* Username */}
          <div className="input">
            <img src={user_icon} alt="username" />
            <input
              type="text"
              placeholder="Username"
              aria-label="Username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input">
            <img src={password_icon} alt="password" />
            <input
              type="password"
              placeholder="Password"
              aria-label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* inline error message */}
          {errorMessage && <div className="login-error">{errorMessage}</div>}
        </div>

        {action === "Create an Account" ? null : (
          <div className="forgot-password">
            Forgot Your Password? Ugh Same. <span>Click Here, Loser!</span>
          </div>
        )}

        {/* Buttons */}
        <div className="submit-container">
          <button
            type="button"
            className={
              action === "Create an Account" ? "submit gray" : "submit"
            }
            onClick={() => navigate("/signup")} // Redirect to signup
          >
            Create an Account
          </button>
          <button
            type="button"
            className={
              action === "Welcome back." ? "submit gray" : "submit"
            }
            onClick={handleLogin} // Call login
          >
            Log in!
          </button>
        </div>
      </div>
    </div>
  );
}
