import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Signup.css";

import email_icon from "../assets/email.png";
import password_icon from "../assets/password.png";
import user_icon from "../assets/user.png";
import room_icon from "../assets/room.png";
import { api } from "../lib/api";

export default function Signup({ session, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const action = "Create an Account!";

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

      const res = await api("/register", {
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
              placeholder="First Name"
              aria-label="First name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={room_icon} alt="room" />
            <input
              type="text"
              placeholder="Room Number"
              aria-label="Room number"
              inputMode="numeric"
              value={roomNum}
              onChange={(e) => setRoomNum(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={email_icon} alt="email" />
            <input
              type="email"
              placeholder="Email"
              aria-label="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={password_icon} alt="password" />
            <input
              type="password"
              placeholder={"Create a Password"}
              aria-label="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* messages */}
          {errorMessage && <div className="auth-message">{errorMessage}</div>}
        </div>

        <p className="signup-helper">Create your room and start keeping the household moving.</p>
        <div className="submit-container">
          <button type="button" className="submit" onClick={handleSignup}>
            Create my account
          </button>
        </div>
      </div>
    </div>
  );
}
