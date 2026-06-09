import { Router } from 'express';
import Finances from "../functions/finance_functions.js"

const router = Router();

router.post("/receipt/upload", async (req, res) => {

    const { room_num, name, total } = req.body;

    if (!room_num || !name || total == null) 
      return res.status(400).json({ error: "Missing required fields" });

    const result = await Finances.addReceipt(room_num, name, total);

    if (!result.ok) 
      return res.status(500).json({ error: "Failed to save receipt" });

    res.status(201).json({message: "Receipt saved successfully",id: result.id,});

});

router.get("/receipt/:room_num", async (req, res) => {

    const {room_num} = req.params;

    const result = await Finances.selectReceipts(room_num);

    if (!result.ok) 
      return res.status(500).json({ error: "Failed to select receipts" });

    return res.status(200).json({ receipts: result.receipts });

});

export default router;