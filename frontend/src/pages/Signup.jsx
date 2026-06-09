import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Signup.css";

import email_icon from "../assets/email.png";
import password_icon from "../assets/password.png";
import user_icon from "../assets/user.png";
import room_icon from "../assets/room.png";

export default function JoinPlastics({ session, onLogin }) { 
  const navigate = useNavigate();
  const location = useLocation();
  const action = "Join The Plastics!";

  // form state
  const [name, setName] = useState("");
  const [roomNum, setRoomNum] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI messages
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const dest = location.state?.from?.pathname ?? "/";
      navigate(dest, { replace: true });
    }
  }, [session, location, navigate]);

  const handleSignup = async () => {
    if (!name || !roomNum || !email || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      setErrorMessage("");

      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          room_num: roomNum,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
        

        // clear form
        setName("");
        setRoomNum("");
        setEmail("");
        setPassword("");

        // send them to dashboard page
        navigate("/dashboard");
      } else {
        const msg =
          data.error ||
          (Array.isArray(data.errors) ? data.errors.join(", ") : null) ||
          "Could not register. Try again!";
        setErrorMessage(msg);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="jp-auth">
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>

        <div className="inputs">
          <div className="input">
            <img src={user_icon} alt="user" />
            <input
              type="text"
              placeholder="Your Full Fetch Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={room_icon} alt="room" />
            <input
              type="text"
              placeholder="Your Fetch Room Number"
              value={roomNum}
              onChange={(e) => setRoomNum(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={email_icon} alt="email" />
            <input
              type="email"
              placeholder="Your Super Secret Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={password_icon} alt="password" />
            <input
              type="password"
              placeholder={'Your Totally Not "1234" Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* messages */}
          {errorMessage && (
            <div className="auth-message">{errorMessage}</div>
          )}
        </div>

        <div className="submit-container">
          {/* actually sign up */}
          <div className="submit" onClick={handleSignup}>
            Join The Plastics!
          </div>

          {/* go to login */}
          <div className="submit gray" onClick={() => navigate("/login")}>
            Get In Loser!
          </div>
        </div>
      </div>
    </div>
  );
}
