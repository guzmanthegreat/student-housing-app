import pool from "./pool.js";

class Chore
{
  static async createChore(user_id, chore_name, due_date, room_num, description)
  {
    try {
      const [result] = await pool.query(
        'INSERT INTO chores (user_id, chore_name, due_date, room_num, is_finished, description) VALUES (?, ?, ?, ?, false, ?)',
        [user_id, chore_name, due_date, room_num, description]);

      const chore_id = result.insertId;  // // Extract and return the id that is generated
      return chore_id;

    } catch (error) {
      console.error("Error in createChore:", error);
      return null;
    }
  }

  static async getChores()
  {
    try {
      const [rows] = await pool.query('SELECT * FROM chores');
      return rows;

    } catch (error) {
      console.error("Error in getChores:", error);
      return null;
    }
  }

  static async getRoomChores(room_num)
  {
    try {
      const [rows] = await pool.query('SELECT * FROM chores WHERE room_num = ?', [room_num]);
      return rows;

    } catch (error) {
      console.error("Error in getRoomChores:", error);
      return null;
    }
  }

  static async editChore(id, chore_name, description, user_id, due_date, is_finished)
  {
    try {
      await pool.query(
        'UPDATE chores SET chore_name = ?, description = ?, user_id = ?, due_date = ?, is_finished = ? WHERE id = ?',
        [chore_name, description, user_id, due_date, is_finished, id]
      );
      return true;

    } catch (error) {
      console.error("Error in editChore:", error);
      return false;
    }
  }

  static async markComplete(id)
  {
    try {
      const [rows] = await pool.query("UPDATE chores SET is_finished = NOT is_finished WHERE id = ?", [id]);
      return rows.affectedRows > 0;

    } catch (error) {
      console.error("Error in markComplete:", error);
      return false;
    }
  }

  static async deleteChore(id)
  {
    try {
      const [rows] = await pool.query('DELETE FROM chores WHERE id = ?', [id]);
      return rows.affectedRows > 0;

    } catch (error) {
      console.error("Error in deleteChores:", error);
      return false;
    }
  }

  static async getPersonChores(user_id)
  {
    try {
      const [rows] = await pool.query('SELECT * FROM chores WHERE user_id = ?', [user_id]);
      return rows;

    } catch (error) {
      console.error("Error in getPersonChores:", error);
      return null;
    }
  }

  static async getAllChoresSorted() 
  {
    try {
      const [rows] = await pool.query('SELECT * FROM chores ORDER BY due_date ASC');
      return rows;
      
    } catch (error) {
      console.error("Error in getAllChoresSorted:", error);
      return null;
    }
  }
}

export default Chore; 