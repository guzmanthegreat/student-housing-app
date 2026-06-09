import pool from './pool.js'; // adjust path if needed

class Finances {
  // Insert new receipt record
  static async addReceipt(room_num, name, total) 
  {
    try {
      const [result] = await pool.query(
        'INSERT INTO finances (room_num, name, total) VALUES (?, ?, ?)',
        [room_num, name, total]
      );
      return { ok: true, id: result.insertId };
    } catch (error) {
      console.error("Error in addReceipt:", error);
      return { ok: false, error };
    }
  }

  static async selectReceipts(room_num) 
  {
    try {
      const [result] = await pool.query('SELECT * FROM finances WHERE room_num = ?', [room_num]);
      return { ok: true, receipts: result};
      
    } catch (error) {
      console.error("Error in addReceipt:", error);
      return { ok: false, error };
    }
  }
}

export default Finances;