import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import defaultAvatar from "../assets/default_avatar.png";
import { api, API_URL } from "../lib/api";

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
            const r = await api("/api/auth/exchange-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ code }),
            });
            if (!r.ok) throw new Error("exchange-code failed");

            const start = Date.now();
            while (Date.now() - start < 8000) {
              try {
                const s = await api("/api/auth/status", {
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
            window.location.href = "/calendar";
          }
        },
      });
    }
  };

  const handleCalendarClick = async () => {
    try {
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        window.alert("Calendar integration is not configured yet.");
        return;
      }
      api("/api/auth/status")
        .then((r) => r.json())
        .then((j) => {
          if (j?.connected) {
            window.location.href = "/calendar";
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
        const res = await api(`/profile/${userId}`);
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
        const res = await api(
          `/get/chores/${profile.room_num}`
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
  const openChores = chores.filter((chore) => !chore.is_finished);
  const nextChore = [...openChores].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
  const nextDue = nextChore ? new Date(nextChore.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="profile">
          <div className="profile-pic">
            <img
              src={
                profile?.profile_picture
                  ? `${API_URL}${profile.profile_picture}`
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
            <li className="is-active">Overview</li>
            <li onClick={() => navigate("/chores")}>Chores</li>
            <li onClick={() => navigate("/bills")}>Shared bills</li>
            <li onClick={handleCalendarClick}>Calendar</li>
          </ul>
        </nav>
      </aside>

      <main className="main-content dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="section-kicker">ROOM {roomNum || "—"}</p>
            <h1>Hey, {username || "there"}.</h1>
            <p>Here’s what needs attention at home.</p>
          </div>
          <button className="dashboard-primary" onClick={() => navigate("/create-chore", { state: { userId, room_num: roomNum } })}>+ Add chore</button>
        </header>

        <section className="dashboard-stats" aria-label="Household summary">
          <div className="stat-card"><span>Open chores</span><strong>{openChores.length}</strong></div>
          <div className="stat-card"><span>Next due</span><strong>{nextDue}</strong></div>
          <div className="stat-card"><span>Your room</span><strong>{roomNum || "—"}</strong></div>
        </section>

        <section className="chore-card dashboard-panel">
          <div className="panel-heading">
            <div><p className="section-kicker">KEEP THE HOUSE MOVING</p><h2>Chores</h2></div>
            <button className="text-action" onClick={() => navigate("/chores")}>View all</button>
          </div>
          <div className="chore-list">
            {roomNum == null && (
              <p className="chore-empty">Loading your profile…</p>
            )}
            {roomNum != null && chores.length === 0 && (
              <p className="chore-empty">No chores yet</p>
            )}
            {roomNum != null &&
              chores.length > 0 &&
              chores.slice(0, 4).map((chore) => {
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
        </section>
      </main>

      <aside className="right-notes dashboard-aside">
        <section className="house-card">
          <p className="section-kicker">YOUR HOUSEHOLD</p>
          <h2>Room {roomNum || "—"}</h2>
          <p>One place for the things everyone needs to know.</p>
        </section>
        <section className="quick-actions">
          <p className="section-kicker">QUICK ACTIONS</p>
          <button onClick={() => navigate("/create-chore", { state: { userId, room_num: roomNum } })}>Add a chore <span>→</span></button>
          <button onClick={() => navigate("/bills")}>Upload a receipt <span>→</span></button>
          <button onClick={handleCalendarClick}>Plan something <span>→</span></button>
        </section>
      </aside>
    </div>
  );
};

export default Dashboard;
