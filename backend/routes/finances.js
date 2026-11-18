import { Router } from 'express';
import pool from "../functions/pool.js";
import { requireLogin } from "../functions/auth.js";

const router = Router();
router.use(requireLogin);

router.post("/receipt/upload", async (req, res) => {

    const { name, total } = req.body;
    const room_num = req.session.roomNum;

    if (!room_num || !name || total == null) 
      return res.status(400).json({ error: "Missing required fields" });

    try {
      const [result] = await pool.query(
        "INSERT INTO finances (room_num, name, total) VALUES (?, ?, ?)",
        [room_num, name, total]
      );
      res.status(201).json({
        message: "Receipt saved successfully",
        id: result.insertId,
      });
    } catch (error) {
      console.error("Could not save receipt:", error);
      return res.status(500).json({ error: "Failed to save receipt" });
    }

});

router.get("/receipt/:room_num", async (req, res) => {

    const room_num = req.session.roomNum;
    if (!room_num) return res.status(400).json({ error: "Room is not configured" });

    try {
      const [receipts] = await pool.query(
        "SELECT * FROM finances WHERE room_num = ?",
        [room_num]
      );
      return res.status(200).json({ receipts });
    } catch (error) {
      console.error("Could not load receipts:", error);
      return res.status(500).json({ error: "Failed to select receipts" });
    }

});

export default router;
