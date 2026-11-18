import { Router } from "express"; // so we can split up the different routes into sections
import pool from "../functions/pool.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireLogin } from "../functions/auth.js";

const router = Router(); // groups together requests

// Create the upload folder automatically on a fresh computer.
fs.mkdirSync("uploads/profile_pictures", { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile_pictures"); 
  },
  filename: (req, file, cb) => {
    const userId = req.params.id; // comes from /profile/:id/picture
    const ext = path.extname(file.originalname); // keep original extension
    cb(null, `user_${userId}${ext}`); // always same name -> overwrites old file
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
  },
});

router.post("/profile/:id/picture", requireLogin, upload.single("profile_picture"), async (req, res) => {
  if (Number(req.params.id) !== req.session.userId)
    return res.status(403).json({ error: "Forbidden" });
  const userId = req.params.id;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const relativePath = `/uploads/profile_pictures/${req.file.filename}`;
  const [result] = await pool.query(
    "UPDATE users SET profile_picture = ? WHERE id = ?",
    [relativePath, userId]
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ error: "User not found" });
  res.status(200).json({
    msg: "Profile picture uploaded",
    profile_picture: relativePath,
  });
});

// register a user
router.post('/register', async (req, res) => {
  const { name, email, password, room_num } = req.body;
  if (!name || !email || !password || !room_num) return res.status(400).json({ error: "Missing value" });
  if (password.length < 8)
    return res.status(400).json({ errors: ["Passwords must be at least 8 characters"] });
  if (!/^\d{3,4}$/.test(String(room_num)))
    return res.status(400).json({ errors: ["Room number must contain 3 or 4 digits"] });
  if (!/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ errors: ["Email must be in valid format"] });

  try {
    const [existingEmail] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existingEmail.length)
      return res.status(400).json({ errors: ["Email already exists"] });

    const [existingName] = await pool.query("SELECT id FROM users WHERE name = ? LIMIT 1", [name]);
    if (existingName.length)
      return res.status(400).json({ errors: ["Username already exists"] });

    await pool.query("INSERT IGNORE INTO rooms (id) VALUES (?)", [room_num]);
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, room_num) VALUES (?, ?, ?, ?)",
      [name, email, hash, room_num]
    );

    req.session.userId = result.insertId;
    req.session.username = name;
    req.session.roomNum = Number(room_num);
    res.status(201).json({
      message: "Register successful",
      userId: result.insertId,
      room_num,
      name,
    });
  } catch (error) {
    console.error("Could not register user:", error);
    res.status(500).json({ error: "Could not register user" });
  }
});

// select a profile
router.get('/profile/:id', requireLogin, async (req, res) => {
  if (Number(req.params.id) !== req.session.userId)
    return res.status(403).json({ error: "Forbidden" });
  const { id } = req.params;
  const [rows] = await pool.query(
    "SELECT id, profile_picture, name, email, room_num, created_at FROM users WHERE id = ?",
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: "Profile not found" });
  res.status(200).json(rows[0]);
});

// login a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Missing username or password' });

  const [rows] = await pool.query(
    "SELECT id, name, password, room_num FROM users WHERE name = ? LIMIT 1",
    [username]
  );
  if (!rows.length) return res.status(401).json({ error: "Invalid username or password" });

  const match = await bcrypt.compare(password, rows[0].password);
  if (!match) return res.status(401).json({ error: "Invalid username or password" });

  const user = rows[0];
  req.session.userId = user.id;
  req.session.username = user.name;
  req.session.roomNum = user.room_num;
  res.status(200).json({
    message: "Login successful",
    userId: user.id,
    room_num: user.room_num,
    name: user.name,
  });
});

// change a users password
router.post('/change/password', requireLogin, async (req, res) => {
  if (Number(req.body.userId) !== req.session.userId)
    return res.status(403).json({ error: "Forbidden" });
  const { userId, oldPass, newPass, confmPass } = req.body;
  if (!userId || !oldPass || !newPass || !confmPass)
    return res.status(400).json({ error: 'Missing required fields' });
  if (newPass !== confmPass)
    return res.status(400).json({ errors: ["New passwords do not match"] });

  const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);
  if (!rows.length) return res.status(404).json({ errors: ["User not found"] });
  if (!(await bcrypt.compare(oldPass, rows[0].password)))
    return res.status(400).json({ errors: ["Incorrect old password"] });

  const hash = await bcrypt.hash(newPass, 10);
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, userId]);
  res.status(200).json({ msg: "Password updated successfully" });
});

// change a users room
router.post('/change/room', requireLogin, async (req, res) => {
  if (Number(req.body.userId) !== req.session.userId)
    return res.status(403).json({ error: "Forbidden" });
  const { userId, room_num } = req.body;
  if (!userId || !room_num) return res.status(400).json({ error: 'Missing required fields' });
  if (!/^\d{3,4}$/.test(String(room_num)))
    return res.status(400).json({ error: "Room number must be 3 or 4 digits" });

  await pool.query("INSERT IGNORE INTO rooms (id) VALUES (?)", [room_num]);
  const [result] = await pool.query(
    "UPDATE users SET room_num = ? WHERE id = ?",
    [room_num, userId]
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ error: "User not found" });
  req.session.roomNum = Number(room_num);
  res.status(200).json({ msg: "Room number updated successfully." });
});


// change a users email
router.post('/change/email', requireLogin, async (req, res) => {
  if (Number(req.body.userId) !== req.session.userId)
    return res.status(403).json({ error: "Forbidden" });
  const { userId, newEmail, confmEmail } = req.body;
  if (!userId || !newEmail || !confmEmail)
    return res.status(400).json({ error: 'Missing required fields' });
  if (newEmail !== confmEmail)
    return res.status(400).json({ errors: ["Emails do not match"] });
  if (!/^\S+@\S+\.\S+$/.test(newEmail))
    return res.status(400).json({ errors: ["Invalid email format"] });

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [newEmail]);
  if (existing.length) return res.status(400).json({ errors: ["Email already in use"] });
  await pool.query("UPDATE users SET email = ? WHERE id = ?", [newEmail, userId]);
  res.status(200).json({ msg: "Email updated successfully" });
});

// change a users username
router.post('/change/username', requireLogin, async (req, res) => {
  if (Number(req.body.userId) !== req.session.userId)
    return res.status(403).json({ error: "Forbidden" });
  const { userId, newUsername, confmUsername } = req.body;
  if (!userId || !newUsername || !confmUsername)
    return res.status(400).json({ error: 'Missing required fields' });
  if (newUsername !== confmUsername)
    return res.status(400).json({ errors: ["Usernames do not match"] });

  const [existing] = await pool.query("SELECT id FROM users WHERE name = ? LIMIT 1", [newUsername]);
  if (existing.length) return res.status(400).json({ errors: ["Username already in use"] });
  await pool.query("UPDATE users SET name = ? WHERE id = ?", [newUsername, userId]);
  req.session.username = newUsername;
  res.status(200).json({ msg: "Username updated successfully" });
});


export default router;
