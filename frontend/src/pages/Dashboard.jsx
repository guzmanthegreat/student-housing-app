import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import defaultAvatar from "../assets/default_avatar.png";

const Dashboard = ({ userId }) => {
  const navigate = useNavigate();

  // ====== profile state (name + room_num from backend) ======
  const [profile, setProfile] = useState(null);    
  const [chores, setChores] = useState([]);          // chores list

  // ====== GOOGLE OAUTH (GIS) ======
  const clientRef = useRef(null);
  const loadingScriptRef = useRef(false);

  const ensureGsiScript = () =>
    new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) return resolve();
      if (loadingScriptRef.current) {
        const wait = setInterval(() => {
          if (window.google?.accounts?.oauth2) {
            clearInterval(wait);
            resolve();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(wait);
          if (!window.google?.accounts?.oauth2) reject(new Error("GIS load timeout"));
        }, 6000);
        return;
      }
      loadingScriptRef.current = true;
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Google script"));
      document.head.appendChild(s);
    });

  const ensureCodeClient = async () => {
    await ensureGsiScript();
    if (!clientRef.current) {
      clientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.events",
        ux_mode: "popup",
        callback: async ({ code }) => {
          if (!code) return;
          try {
            const r = await fetch("http://localhost:3000/api/auth/exchange-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ code }),
            });
            if (!r.ok) throw new Error("exchange-code failed");

            const start = Date.now();
            while (Date.now() - start < 8000) {
              try {
                const s = await fetch("http://localhost:3000/api/auth/status", {
                  credentials: "include",
                });
                const j = await s.json();
                if (j?.connected) break;
              } catch {}
              await new Promise((res) => setTimeout(res, 300));
            }
          } catch (err) {
            console.error("OAuth exchange/status check failed:", err);
          } finally {
            window.location.href = "http://localhost:5173/calendar";
          }
        },
      });
    }
  };

  const handleCalendarClick = async () => {
    try {
      fetch("http://localhost:3000/api/auth/status", { credentials: "include" })
        .then((r) => r.json())
        .then((j) => {
          if (j?.connected) {
            window.location.href = "http://localhost:5173/calendar";
          }
        })
        .catch(() => {});

      await ensureCodeClient();
      clientRef.current.requestCode();
    } catch (e) {
      console.error("Calendar click error:", e);
    }
  };


  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/profile/${userId}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        // adjust keys depending on backend response
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [userId]);


  useEffect(() => {
    if (!profile?.room_num) return;
    const fetchChores = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/get/chores/${profile.room_num}`
        );
        if (!res.ok) throw new Error("Failed to load chores");
        const data = await res.json();
        setChores(data);
      } catch (err) {
        console.error("Error fetching chores:", err);
      }
    };
    fetchChores();
  }, [profile?.room_num]);

  const username = profile?.name ?? "";   
  const roomNum = profile?.room_num;

  return (
    <div className="dashboard">
      {/* Sidebar with profile and navigation links */}
      <aside className="sidebar">
        <div className="profile">
          <div className="profile-pic">
            <img
              src={
                userId
                  ? `http://localhost:3000/uploads/profile_pictures/user_${userId}.jpg`
                  : defaultAvatar
              }
              alt={username ? `${username}'s profile` : "Profile"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultAvatar;
              }}
            />
          </div>
          <p className="greeting">
            {username ? `Hey, ${username}` : "Hey there"}
          </p>
        </div>

        <nav className="nav-menu">
          <ul>
            <li onClick={handleCalendarClick}>Calendar</li>
            <li onClick={() => navigate("/chores")}>Chores</li>
            <li onClick={() => navigate("/bills")}>Bills</li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <div className="chore-card">
          <h2>Your Chore List</h2>
          <div className="chore-list">
            {roomNum == null && (
              <p className="chore-empty">Loading your profile…</p>
            )}
            {roomNum != null && chores.length === 0 && (
              <p className="chore-empty">No chores yet</p>
            )}
            {roomNum != null &&
              chores.length > 0 &&
              chores.map((chore) => {
                const due = new Date(chore.due_date).toLocaleDateString();
                const statusClass = chore.is_finished ? "done" : "pending";

                return (
                  <div className="chore-item" key={chore.id}>
                    <div className="chore-main-row">
                      <span className="chore-dot">•</span>
                      <div className="chore-text">
                        <span className="chore-name">{chore.chore_name}</span>
                      </div>
                    </div>

                    <div className="chore-meta-row">
                      <span className="chore-due">Due {due}</span>
                      <span className={`chore-status ${statusClass}`}>
                        {chore.is_finished ? "Finished" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </main>

      <aside className="right-notes">
        <div className="quote-card">
          <p>“On Wednesdays, We Wear Pink”</p>
          <p>“That's So Fetch!”</p>
        </div>
        <div className="divider">✧ ✦ ✧</div>
        <div className="bills-card">
          <p><strong>Overdue Charges</strong></p>
          <p><span>Target: $125.17</span></p>
          <p><span>Trader Joe's: $67.67</span></p>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;
