import { Router } from "express"; // so we can split up the different routes into sections
import pool from "../functions/pool.js";
import { requireLogin } from "../functions/auth.js";

const router = Router(); // groups together requests
router.use("/chores", requireLogin);
router.use("/chore", requireLogin);
router.use("/get", requireLogin);

// POST a new chore
router.post('/chores', async (req, res) => {
  const { chore_name, due_date, description } = req.body;
  const user_id = req.session.userId;
  const room_num = req.session.roomNum;

  if(!user_id || !room_num || !chore_name || !due_date || !description)
    return res.status(400).json({ error: "Missing value" });

  try {
    const [result] = await pool.query(
      "INSERT INTO chores (user_id, chore_name, description, due_date, room_num, is_finished) VALUES (?, ?, ?, ?, ?, false)",
      [user_id, chore_name, description, due_date, room_num]
    );
    res.status(201).json({ msg: "Chore created", id: result.insertId });
  } catch (error) {
    console.error("Could not create chore:", error);
    res.status(500).json({ error: "Could not create chore" });
  }
});

// GET all chores
router.get('/get/chores', async (req, res) => {
  const [chores] = await pool.query("SELECT * FROM chores WHERE room_num = ?", [req.session.roomNum]);
  res.status(200).json(chores);
});

// GET chores for a room number
router.get('/get/chores/:roomNum', async (req, res) => {
  const roomNum = req.session.roomNum;
  if(!roomNum) return res.status(400).json({ error: "Room is not configured" });

  const [chores] = await pool.query("SELECT * FROM chores WHERE room_num = ?", [roomNum]);
  res.status(200).json(chores);
});

// GET chores for a person
router.get('/get/personal/chores/:id', async (req, res) => {
  const id = req.session.userId;
  if(!id) return res.status(400).json({ error: "Missing user" });

  const [chores] = await pool.query("SELECT * FROM chores WHERE user_id = ?", [id]);
  res.status(200).json(chores);
});

// GET all chores for all users, sorted by earliest due date
router.get("/chores/sorted", async (req, res) => {
  const [chores] = await pool.query("SELECT * FROM chores WHERE room_num = ? ORDER BY due_date ASC", [req.session.roomNum]);
  res.status(200).json(chores);
});

// PUT a chore by ID (updating)
router.put('/chores/:id', async (req, res) => {
  const { id } = req.params;
  const { chore_name, description, due_date, is_finished } = req.body;

  if(!id || !chore_name || !due_date || !description)
    return res.status(400).json({ error: "Missing value" });

  await pool.query(
    "UPDATE chores SET chore_name = ?, description = ?, due_date = ?, is_finished = ? WHERE id = ? AND room_num = ?",
    [chore_name, description, due_date, is_finished ? 1 : 0, id, req.session.roomNum]
  );
  res.status(200).json({ message: 'Chore updated!' });
});

// PUT mark a chore as compelted
router.put('/chore/completed/:id', async (req, res) => {
  const { id } = req.params;
  if(!id ) return res.status(400).json({ error: "Missing id" });

  const [result] = await pool.query(
    "UPDATE chores SET is_finished = NOT is_finished WHERE id = ? AND room_num = ?",
    [id, req.session.roomNum]
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ message: "Chore not found" });
  res.status(200).json({ message: 'Chore marked complete!' });
});

// DELETE a chore by ID
router.delete('/chores/:id', async (req, res) => {
  const { id } = req.params;
  if(!id ) return res.status(400).json({ error: "Missing id" });

  const [result] = await pool.query("DELETE FROM chores WHERE id = ? AND room_num = ?", [id, req.session.roomNum]);
  if (result.affectedRows === 0)
    return res.status(404).json({ message: "Chore not found" });
  res.status(200).json({ message: 'Chore deleted!' });
});

export default router;
