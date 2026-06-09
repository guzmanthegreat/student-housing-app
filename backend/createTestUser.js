import pool from './functions/pool.js'; // adjust path if needed
import bcrypt from 'bcrypt';

const createTestUser = async () => {
  const username = "testuser";     // change as you like
  const email = "test@example.com";
  const password = "password123";  // plaintext password
  const room_num = 1;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Make sure the room exists
    await pool.query("INSERT IGNORE INTO rooms (id) VALUES (?)", [room_num]);

    // Insert user
    await pool.query(
      "INSERT INTO users (name, email, password, room_num) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, room_num]
    );

    console.log("Test user created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating test user:", err);
    process.exit(1);
  }
};

createTestUser();
