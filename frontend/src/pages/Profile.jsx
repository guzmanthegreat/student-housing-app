import { useEffect, useState, useRef } from "react";
import "./Profile.css";

/** Cache-bust helper: append ?v=<timestamp> so the browser refetches */
const withBust = (url, bust = Date.now()) =>
  url ? `${url}${url.includes("?") ? "&" : "?"}v=${bust}` : url;

export default function ProfilePage() {
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [roomNumber, setRoomNumber] = useState(null);
  const [passwordMasked] = useState("********");

  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // 'username' | 'email' | 'password' | 'pic' | 'roomNumber' | null

  // Persisted user id
  const storedUserId = localStorage.getItem("userId");
  const USER_ID = storedUserId ? Number(storedUserId) : null;

  // Server-stored avatar *relative* path (e.g. "/uploads/profile_pictures/user_348.png")
  const [serverAvatarPath, setServerAvatarPath] = useState(null);

  // What we actually render in the UI as the avatar (may be dataURL for instant preview)
  const [avatarSrc, setAvatarSrc] = useState(null);

  const clearErrorAndEdit = (field) => {
    setError("");
    setEditing(field);
  };

  // Load profile info
  useEffect(() => {
    if (!USER_ID) {
      console.error("No user ID found in storage. User must be logged in.");
      return;
    }
    (async () => {
      try {
        const response = await fetch(`http://localhost:3000/profile/${USER_ID}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        setUsername(data.name || "");
        setEmail(data.email || "");
        setRoomNumber(data.room_num || "");

        // Prefer the actual field your API returns; here we assume "profile_picture"
        const relPath = data.profile_picture || null;
        setServerAvatarPath(relPath);

        const fullUrl = relPath ? `http://localhost:3000${relPath}` : null;
        setAvatarSrc(withBust(fullUrl));
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    })();
  }, [USER_ID]);

  /* ----------------- Updaters ----------------- */

  const changeUsername = async (newUsername) => {
    if (!USER_ID) return;
    const confmUsername = newUsername;
    try {
      const response = await fetch("http://localhost:3000/change/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, newUsername, confmUsername }),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        const errorMsg = result.errors ? result.errors.join(", ") : `HTTP ${response.status}`;
        setError(`Username change failed: ${errorMsg}`);
        return;
      }
      setError("");
      setUsername(newUsername);
      setEditing(null);
    } catch (err) {
      setError(`Network error: Could not save username. ${err.message}`);
    }
  };

  const changeEmail = async (newEmail) => {
    const confmEmail = newEmail;
    try {
      const response = await fetch("http://localhost:3000/change/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, newEmail, confmEmail }),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        const errorMsg = result.errors ? result.errors.join(", ") : `HTTP ${response.status}`;
        setError(`Email change failed: ${errorMsg}`);
        return;
      }
      setError("");
      setEmail(newEmail);
      setEditing(null);
    } catch (err) {
      setError(`Network error: Could not save email. ${err.message}`);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    const confmPassword = newPassword;
    try {
      const response = await fetch("http://localhost:3000/change/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          oldPass: oldPassword,
          newPass: newPassword,
          confmPass: confmPassword,
        }),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        const errorMsg = result.errors ? result.errors.join(", ") : `HTTP ${response.status}`;
        setError(`Password change failed: ${errorMsg}`);
        return;
      }
      setError("");
      setEditing(null);
    } catch (err) {
      setError(`Network error: Could not save password. ${err.message}`);
    }
  };

  const changeRoomNum = async (newRoomNum) => {
    if (!USER_ID) return;
    const confmRoomNum = newRoomNum;
    try {
      const response = await fetch("http://localhost:3000/change/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, room_num: confmRoomNum }),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        const errorMsg = result.errors ? result.errors.join(", ") : `HTTP ${response.status}`;
        setError(`Room Number change failed: ${errorMsg}`);
        return;
      }
      setError("");
      setRoomNumber(newRoomNum);
      setEditing(null);
    } catch (err) {
      setError(`Network error: Could not save room number. ${err.message}`);
    }
  };

  /** Upload new profile picture, keep instant preview, then swap to cache-busted server URL */
  const changeProfilePic = async (dataUrl, fileName) => {
    if (!USER_ID) {
      alert("User ID is missing. Please log in again.");
      return;
    }
    try {
      // Convert dataURL to Blob
      const resp = await fetch(dataUrl);
      const blob = await resp.blob();

      const safeName = fileName && fileName.trim() ? fileName : `avatar_${USER_ID}.png`;
      const file = new File([blob], safeName, { type: blob.type || "image/png" });

      const formData = new FormData();
      formData.append("profile_picture", file);

      const res = await fetch(`http://localhost:3000/profile/${USER_ID}/picture`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Unexpected response format:", text);
        throw new Error("Server returned non-JSON response");
      }

      const body = await res.json();
      if (!res.ok) {
        const errorMsg = body?.error || body?.message || `HTTP ${res.status}`;
        setError(`Profile pic change failed: ${errorMsg}`);
        // Revert to previous server image (with new bust)
        const fullServerUrl = serverAvatarPath ? `http://localhost:3000${serverAvatarPath}` : null;
        setAvatarSrc(withBust(fullServerUrl));
        return;
      }

      // Expect server returns { profile_picture: "/uploads/profile_pictures/user_348.png" }
      const newRelPath = body?.profile_picture;
      if (!newRelPath) throw new Error("Server did not return profile_picture path");

      setServerAvatarPath(newRelPath);

      const fullUrl = newRelPath.startsWith("http")
        ? newRelPath
        : `http://localhost:3000${newRelPath}`;

      // IMPORTANT: cache-bust so the newest file shows without a hard reload
      setError("");
      setAvatarSrc(withBust(fullUrl));
      setEditing(null);
      console.log("Profile picture updated successfully:", newRelPath);
    } catch (err) {
      setError(`Network error: Could not save profile pic. ${err.message}`);
      // Revert to previous server image (with bust)
      const fullServerUrl = serverAvatarPath ? `http://localhost:3000${serverAvatarPath}` : null;
      setAvatarSrc(withBust(fullServerUrl));
      alert(`Could not save profile picture: ${err.message}`);
    }
  };

  const onChangePic = () => clearErrorAndEdit("pic");

  return (
    <div className="profile-page">
      {error && (
        <p className="profile-error-message">
          ⚠️ {error}
          <button onClick={() => setError("")} className="close-error-btn">
            &times;
          </button>
        </p>
      )}

      <div className="profile-card">
        <h1 className="profile-title">She Doesn’t Even Go Here!</h1>

        <div className="lips lips--tl" aria-hidden="true">💋</div>

        <div className="profile-left">
          <button
            className="avatar"
            onClick={onChangePic}
            aria-label="Change profile picture"
            style={
              avatarSrc
                ? {
                    backgroundImage: `url(${avatarSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!avatarSrc && <span className="avatar__cta">Change Picture</span>}
            {avatarSrc && <span className="avatar__hover">Change Pic</span>}
          </button>
          <p className="greeting">Hi, {username}!</p>
        </div>

        <div className="profile-right">
          <InfoRow label="Username" value={username} onEdit={() => clearErrorAndEdit("username")} />
          <InfoRow label="Email" value={email} onEdit={() => clearErrorAndEdit("email")} />
          <InfoRow label="Room Number" value={roomNumber} onEdit={() => clearErrorAndEdit("roomNumber")} />
          <InfoRow label="Password" value={passwordMasked} onEdit={() => clearErrorAndEdit("password")} />
        </div>

        <div className="lips lips--br" aria-hidden="true">💋</div>
      </div>

      {/* Overlays */}
      {editing === "username" && (
        <Modal title="Change your name." onClose={() => clearErrorAndEdit(null)}>
          <UsernameForm current={username} onCancel={() => clearErrorAndEdit(null)} onSave={changeUsername} />
        </Modal>
      )}

      {editing === "email" && (
        <Modal title="Change your email." onClose={() => clearErrorAndEdit(null)}>
          <EmailForm current={email} onCancel={() => clearErrorAndEdit(null)} onSave={changeEmail} />
        </Modal>
      )}

      {editing === "roomNumber" && (
        <Modal title="Change your room number." onClose={() => clearErrorAndEdit(null)}>
          <RoomNumberForm current={roomNumber} onCancel={() => clearErrorAndEdit(null)} onSave={changeRoomNum} />
        </Modal>
      )}

      {editing === "password" && (
        <Modal title="Change your password." onClose={() => clearErrorAndEdit(null)}>
          <PasswordForm onCancel={() => clearErrorAndEdit(null)} onSave={changePassword} />
        </Modal>
      )}

      {editing === "pic" && (
        <Modal title="Change your head shot." onClose={() => clearErrorAndEdit(null)}>
          <ProfilePicForm
            onCancel={() => clearErrorAndEdit(null)}
            onSave={async (dataUrl, fileName) => {
              // Instant local preview
              setAvatarSrc(dataUrl);
              // Upload, then swap to cache-busted server URL
              await changeProfilePic(dataUrl, fileName);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

/* ----------------- Presentational components ----------------- */

function InfoRow({ label, value, onEdit }) {
  return (
    <div className="info-row">
      <div className="info-box">
        <span className="info-label">{label}:</span>{" "}
        <span className="info-value">{value}</span>
      </div>
      <button className="profile-edit-btn" onClick={onEdit} aria-label={`Edit ${label}`}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34a1.25 1.25 0 0 0 0-1.77l-2.98-2.98a1.25 1.25 0 0 0-1.77 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      </button>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="popup" onMouseDown={(e) => e.stopPropagation()}>
        <div className="popup-title">{title}</div>
        <div className="popup-content">{children}</div>
      </div>
    </div>
  );
}

function FieldBlock({ label, children, error }) {
  return (
    <div className="field-block">
      <div className="field-label">{label}</div>
      {children}
      <div className="field-error" aria-live="polite">{error || ""}</div>
    </div>
  );
}

function Actions({ canSave, onCancel }) {
  return (
    <div className="popup-actions">
      <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      <button type="submit" className="btn solid" disabled={!canSave}>Save</button>
    </div>
  );
}

/* ----------------- Forms with live validation ----------------- */

function UsernameForm({ onSave, onCancel }) {
  const [v, setV] = useState("");
  const [c, setC] = useState("");
  const [touched, setTouched] = useState({ v: false, c: false });

  const sameOk = v.trim() === c.trim();
  const nonEmpty = !!v.trim();

  const vErr = touched.v && !nonEmpty ? "Name cannot be empty." : "";
  const cErr = touched.c && !sameOk ? "Names do not match." : "";

  const canSave = nonEmpty && sameOk;

  return (
    <form className="popup-form" onSubmit={(e) => { e.preventDefault(); if (canSave) onSave(v.trim()); }}>
      <FieldBlock label="Enter your new name." error={vErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, v: true }))}
        />
      </FieldBlock>

      <FieldBlock label="Confirm your new name." error={cErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          value={c}
          onChange={(e) => setC(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, c: true }))}
        />
      </FieldBlock>

      <Actions canSave={canSave} onCancel={onCancel} />
    </form>
  );
}

function EmailForm({ onSave, onCancel }) {
  const [v, setV] = useState("");
  const [c, setC] = useState("");
  const [touched, setTouched] = useState({ v: false, c: false });

  const emailRegex = /^\S+@\S+\.\S+$/;
  const emailOk = emailRegex.test(v);
  const matchOk = v === c;

  const vErr = touched.v && v && !emailOk ? "Please enter a valid email address." : "";
  const cErr = touched.c && c && !matchOk ? "Emails do not match." : "";

  const canSave = emailOk && matchOk;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(v.trim());
  };

  return (
    <form className="popup-form" onSubmit={handleSubmit}>
      <FieldBlock label="Enter your new email." error={vErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          type="email"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, v: true }))}
        />
      </FieldBlock>

      <FieldBlock label="Confirm your new email." error={cErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          type="email"
          value={c}
          onChange={(e) => setC(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, c: true }))}
        />
      </FieldBlock>

      <Actions canSave={canSave} onCancel={onCancel} />
    </form>
  );
}

function RoomNumberForm({ onSave, onCancel }) {
  const [v, setV] = useState(String(""));
  const [c, setC] = useState(String(""));
  const [touched, setTouched] = useState({ v: false, c: false });

  const nonEmpty = v !== "";
  const matchOk = v === c;

  const vErr = touched.v && !nonEmpty ? "Room number cannot be empty." : "";
  const cErr = touched.c && !matchOk ? "Room numbers do not match." : "";
  const canSave = nonEmpty && matchOk;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(v.toUpperCase());
  };

  return (
    <form className="popup-form" onSubmit={handleSubmit}>
      <FieldBlock label="Enter your new room number." error={vErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, v: true }))}
        />
      </FieldBlock>

      <FieldBlock label="Confirm your new room number." error={cErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          value={c}
          onChange={(e) => setC(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, c: true }))}
        />
      </FieldBlock>

      <Actions canSave={canSave} onCancel={onCancel} />
    </form>
  );
}

function PasswordForm({ onSave, onCancel }) {
  const [oldP, setOldP] = useState("");
  const [newP, setNewP] = useState("");
  const [conf, setConf] = useState("");
  const [touched, setTouched] = useState({ old: false, np: false, cf: false });

  const lenOk = newP.length >= 8;
  const matchOk = newP === conf;

  const oldErr = touched.old && !oldP ? "Please enter your old password." : "";
  const npErr  = touched.np && newP && !lenOk ? "Password must be at least 8 characters." : "";
  const cfErr  = touched.cf && conf && !matchOk ? "New passwords do not match." : "";

  const canSave = !!oldP && lenOk && matchOk;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(oldP, newP);
  };

  return (
    <form className="popup-form" onSubmit={handleSubmit}>
      <FieldBlock label="Enter your old password." error={oldErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          type="password"
          value={oldP}
          onChange={(e) => setOldP(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, old: true }))}
        />
      </FieldBlock>

      <FieldBlock label="Enter your new password." error={npErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          type="password"
          value={newP}
          onChange={(e) => setNewP(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, np: true }))}
        />
      </FieldBlock>

      <FieldBlock label="Confirm your new password." error={cfErr}>
        <input
          className="popup-input"
          style={{ color: "var(--text)" }}
          type="password"
          value={conf}
          onChange={(e) => setConf(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, cf: true }))}
        />
      </FieldBlock>

      <Actions canSave={canSave} onCancel={onCancel} />
    </form>
  );
}

/* ----------------- Picture cropper & uploader ----------------- */

function ProfilePicForm({ onSave, onCancel }) {
  const stageRef = useRef(null);   // circle stage
  const [img, setImg] = useState(null); // HTMLImageElement
  const [fileName, setFileName] = useState("");

  const [zoom, setZoom] = useState(1); // 1..3
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // drag tracking
  const drag = useRef({ active: false, x: 0, y: 0, ox: 0, oy: 0 });
  const startDrag = (e) => {
    const p = "touches" in e ? e.touches[0] : e;
    drag.current = { active: true, x: p.clientX, y: p.clientY, ox: offset.x, oy: offset.y };
  };
  const moveDrag = (e) => {
    if (!drag.current.active) return;
    const p = "touches" in e ? e.touches[0] : e;
    setOffset({
      x: drag.current.ox + (p.clientX - drag.current.x),
      y: drag.current.oy + (p.clientY - drag.current.y),
    });
  };
  const endDrag = () => (drag.current.active = false);

  const onFile = (f) => {
    if (!f) return;
    setFileName(f.name);
    const url = URL.createObjectURL(f);
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = url;
  };

  const canSave = !!img;

  const handleSave = (e) => {
    e.preventDefault();
    if (!img || !stageRef.current) return;

    const D = stageRef.current.clientWidth; // stage diameter in CSS px
    const size = 512; // output resolution
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // base scale to cover the circle
    const baseScale = D / Math.min(img.width, img.height);
    const effScaleCss = baseScale * zoom;
    const cssToCanvas = size / D;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.translate(size / 2 + offset.x * cssToCanvas, size / 2 + offset.y * cssToCanvas);
    ctx.scale(effScaleCss * cssToCanvas, effScaleCss * cssToCanvas);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl, fileName);
  };

  return (
    <form className="popup-form" onSubmit={handleSave}>
      <div className="upload-panel">
        {/* CROP STAGE */}
        <div
          ref={stageRef}
          className="crop-stage"
          onMouseDown={startDrag}
          onMouseMove={moveDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={startDrag}
          onTouchMove={moveDrag}
          onTouchEnd={endDrag}
        >
          {img ? (
            <img
              src={img.src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%,-50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                userSelect: "none",
                pointerEvents: "none",
                maxWidth: "none",
              }}
            />
          ) : (
            <div className="crop-placeholder"></div>
          )}
        </div>

        {/* zoom */}
        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="crop-zoom"
        />
      </div>

      <div className="field-block">
        <label className="btn ghost" style={{ display: "inline-block", cursor: "pointer" }}>
          Choose File
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
            style={{ display: "none" }}
          />
        </label>
        <span style={{ marginLeft: 8 }}>{fileName}</span>
      </div>

      <Actions canSave={canSave} onCancel={onCancel} />
    </form>
  );
}
