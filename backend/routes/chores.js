import { Router } from "express"; // so we can split up the different routes into sections
import Chore from "../functions/chore_functions.js"

const router = Router(); // groups together requests

// POST a new chore
router.post('/chores', async (req, res) => {
  const { user_id, chore_name, due_date, room_num, description} = req.body;

  if(!user_id || !chore_name || !due_date || !room_num|| !description) // make sure all values are given
    return res.status(400).json({ error: "Missing value" });

  const chore_id = await Chore.createChore(user_id, chore_name, due_date, room_num, description);
  if(!chore_id) return res.status(406).json({ error: "Unable to create chore"});
  res.status(201).json({ msg: "successfully created chore"})
});

// GET all chores
router.get('/get/chores', async (req, res) => {
  const chores = await Chore.getChores();
  res.status(200).json(chores);
});

// GET chores for a room number
router.get('/get/chores/:roomNum', async (req, res) => {
  const { roomNum } = req.params;
  if(!roomNum ) return res.status(400).json({ error: "Missing roomNum" });

  const chores = await Chore.getRoomChores(roomNum);
  res.status(200).json(chores);
});

// GET chores for a person
router.get('/get/personal/chores/:id', async (req, res) => {
  const { id } = req.params;
  if(!id ) return res.status(400).json({ error: "Missing id" });

  const chores = await Chore.getPersonChores(id);
  res.status(200).json(chores);
});

// GET all chores for all users, sorted by earliest due date
router.get("/chores/sorted", async (req, res) => {
  
    const chores = await Chore.getAllChoresSorted();
    res.status(200).json(chores);
});

// PUT a chore by ID (updating)
router.put('/chores/:id', async (req, res) => {
  const { id } = req.params;
  const { chore_name, description, user_id, due_date, is_finished } = req.body;

  if(!id || !chore_name || !due_date || !user_id|| !description) // make sure all values are given
    return res.status(400).json({ error: "Missing value" });

  await Chore.editChore(id, chore_name, description, user_id, due_date, is_finished);
  res.status(200).json({ message: 'Chore updated!' });
});

// PUT mark a chore as compelted
router.put('/chore/completed/:id', async (req, res) => {
  const { id } = req.params;
  if(!id ) return res.status(400).json({ error: "Missing id" });

  const result = await Chore.markComplete(id);

  if(!result) res.status(400).json({ message: 'There were no chore to complete' });
  res.status(200).json({ message: 'Chore marked complete!' });
});

// DELETE a chore by ID
router.delete('/chores/:id', async (req, res) => {
  const { id } = req.params;
  if(!id ) return res.status(400).json({ error: "Missing id" });

  const result = await Chore.deleteChore(id);

  if(!result) res.status(400).json({ message: 'There were no chores to delete' });
  res.status(200).json({ message: 'Chore deleted!' });
});

export default router;