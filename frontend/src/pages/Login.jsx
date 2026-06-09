import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";

// Icons
import password_icon from "../assets/password.png";
import user_icon from "../assets/user.png";

export default function Login({ session, onLogin }) {  
  const navigate = useNavigate();
  const location = useLocation();
  const [action, setAction] = useState("Get In Loser!");

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
      const res = await fetch("http://localhost:3000/login", {
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
			console.log("signup data: ", data)
			onLogin(data);
			navigate("/dashboard"); // redirect to dashboard after login
          //Store the User ID in local storage for persistence
          localStorage.setItem('userId', data.userId); 
          
          // Pass the ID to the parent state (optional, but good for immediate use)
          if (typeof setUserId === "function") {
            setUserId(data.userId);
          }
        }
      } else {

        setErrorMessage(
          data.error || "Incorrect username or password. Try again!"
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
          {action === "Get In Loser!" ? null : (
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
              placeholder="Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input">
            <img src={password_icon} alt="password" />
            <input
              type="password"
              placeholder='Your Totally Not "1234" Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* inline error message */}
          {errorMessage && (
            <div className="login-error">
              {errorMessage}
            </div>
          )}
        </div>

        {action === "Join The Plastics!" ? null : (
          <div className="forgot-password">
            Forgot Your Password? Ugh Same. <span>Click Here, Loser!</span>
          </div>
        )}

        {/* Buttons */}
        <div className="submit-container">
          <div
            className={action === "Join The Plastics!" ? "submit gray" : "submit"}
            onClick={() => navigate("/signup")} // Redirect to signup
          >
            Join The Plastics!
          </div>
          <div
            className={action === "Get In Loser!" ? "submit gray" : "submit"}
            onClick={handleLogin} // Call login
          >
            Get In Loser!
          </div>
        </div>
      </div>
    </div>
  );
}
