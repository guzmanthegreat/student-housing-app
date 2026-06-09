import pool from './pool.js'
import bcrypt from "bcrypt";

class Profile
{
    static async createProfile(name, email, password, room_num)
    {
        try{
          const errors = await this.getErrors(name, password, email, room_num);
          console.log(errors);
          if (errors.length > 0) {
            return { ok: false, errors };
          }
          
          await pool.query("INSERT IGNORE INTO rooms (id) VALUES (?)", [room_num]);
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          const [user] = await pool.query("INSERT into users (name, email, password, room_num) VALUES (?, ?, ?, ?)",
                            [name, email, hashedPassword, room_num]);
          // console.log("user from login: ", user)
          return {ok: true, id : user.insertId, room_num : room_num, name : name};
        }
        catch (error){
          console.error("Error in createProfile:", error);
          return false;
        }
    }

    static async getProfiles()
    {
        try{
            const [rows] = await pool.query("SELECT * from users")
            return rows.length > 0 ? rows : null;
        }
        catch (error) {
            console.error("Error in getProfiles:", error);
            return null;
        }
    }

    static async getProfile(username)
    {
        try{
            const [rows] = await pool.query("SELECT * from users where name = ?", [username])
            return rows.length > 0 ? rows[0] : null;
        }
        catch (error) {
            console.error("Error in getProfile:", error);
            return null;
        }
    }

    static async getProfileById(id) 
    {
      try {
        const [rows] = await pool.query(
          'SELECT id, profile_picture, name, email, room_num, created_at FROM users WHERE id = ?', [id]);
  
        if (rows.length === 0) return { ok: false, error: "Profile not found" };
        return { ok: true, profile: rows[0] };
        
      } catch (err) {
        console.error("Error fetching profile:", err);
        return { ok: false, error: err.message };
      }
    }

    static async getErrors(_username, _password, _email, _room_num)
    {
        const returnString = []; 
        const user = await this.validateUsername(_username);
        const validEmail = this.validateEmail(_email);
        const dupEmail = await this.DuplicateEmail(_email);
        const room_num = this.validateRoomNumber(_room_num);


        if(user)
            returnString.push("Username already exisits")
        if(validEmail)
            returnString.push("Email must be in valid format")
        if(!room_num)
            returnString.push("Room number must contain 3 or 4 digits")
        if(dupEmail)
          returnString.push("Email already exisists")
        if(_password.length < 8)
            returnString.push("Passwords must be at least 8 characters")
        
        return returnString
    }

    static async validateUsername(username)
    {
        try {
            const [rows] = await pool.query("SELECT 1 FROM users WHERE name = ? LIMIT 1", [username]);
            return rows.length > 0; // true if username exists, false otherwise

        } catch (error) {
            console.error("Error in validateUsername:", error);
            return false;
        }
    }

    static validateRoomNumber(room_num) {

      const value = String(room_num).trim();
      return /^\d{3,4}$/.test(value);
    }

    static validateEmail(email) {return (email.length === 0 || !(/^\S+@\S+\.\S+$/.test(email)));}

    static async DuplicateEmail(email) 
    {
        const [rows] = await pool.query("SELECT 1 FROM users WHERE email = ? LIMIT 1", [email]);
        return (rows.length > 0);
    }

    static async findByUsername(username) 
    {
      try {
        const [rows] = await pool.query(
          'SELECT id, name, password, room_num FROM users WHERE name = ? LIMIT 1',
          [username]
        );
        return rows.length ? rows[0] : null;
      } catch (err) {
        console.error('findByUsername error:', err);
        throw err;
      }
    }
  
    static async isValidLogin(username, password) 
    {
      try {
        const user = await this.findByUsername(username);
        if (!user) return { ok: false, error: 'Invalid username or password' };
  
        const match = await bcrypt.compare(password, user.password);
        if (!match) return { ok: false, error: 'Invalid username or password' };

        return { ok: true, user : user};

      } catch (err) {
        console.error('Login error:', err);
        return { ok: false, error: 'Server error' };
      }
    }

    static async changePassword(userId, oldPass, newPass, confmPass) 
    {
      try {
        if (!oldPass || !newPass || !confmPass) return { ok: false, errors: ['Missing password fields'] };
        if (oldPass === newPass) return { ok: false, errors: ['Old Password was entered'] };
        if (newPass !== confmPass) return { ok: false, errors: ['New passwords do not match'] };
  
        // Get the user’s current password hash
        const [result] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
        console.log(result)
        if (result.length === 0) return { ok: false, errors: ['User not found'] };
  
        const user = result[0];
  
        // Compare old password
        const match = await bcrypt.compare(oldPass, user.password);
        if (!match) return { ok: false, errors: ['Incorrect old password'] };
  
        // Hash and update new password
        const hashed = await bcrypt.hash(newPass, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId,]);
  
        return { ok: true, msg: 'Password updated successfully' };
      } catch (err) {
        console.error(err);
        return { ok: false, errors: ['Server error while changing password'] };
      }
    }

    static async changeEmail(userId, newEmail, confmEmail) 
    {
      try {
        if (!newEmail || !confmEmail) return { ok: false, errors: ['Missing email fields'] };
        if (newEmail !== confmEmail) return { ok: false, errors: ['Emails do not match'] };
        if (this.validateEmail(newEmail)) return { ok: false, errors: ['Invalid email format'] };
    
        const [userRows] = await pool.query('SELECT email FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return { ok: false, errors: ['User not found'] };
    
        const currentEmail = userRows[0].email;
        if (currentEmail === newEmail) return { ok: false, errors: ['New email cannot be the same as the old email'] };
    
        const isDuplicate = await this.DuplicateEmail(newEmail);
        if (isDuplicate) return { ok: false, errors: ['Email already in use'] };
    
        await pool.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);
        return { ok: true, msg: 'Email updated successfully' };

      } catch (err) {
        console.error('changeEmail error:', err);
        return { ok: false, errors: ['Server error while changing email'] };
      }
    }

    static async changeUsername(userId, newUsername, confmUsername) 
    {
      try {
        if (!userId || !newUsername || !confmUsername) return { ok: false, errors: ['Missing required fields'] };
        if (newUsername !== confmUsername) return { ok: false, errors: ['Usernames do not match'] };
    
        // Check if user exists
        const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return { ok: false, errors: ['User not found'] };
    
        const currentName = userRows[0].name;
        if (currentName === newUsername) return { ok: false, errors: ['New username cannot be the same as the old one'] };
    
        // Check if username is already taken
        const [dupRows] = await pool.query('SELECT id FROM users WHERE name = ? LIMIT 1', [newUsername]);
        if (dupRows.length > 0) return { ok: false, errors: ['Username already in use'] };
    
        // Update username
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [newUsername, userId]);
        return { ok: true, msg: 'Username updated successfully' };

      } catch (err) {
        console.error(err);
        return { ok: false, errors: ['Server error while changing username'] };
      }
    }

    static async changeRoomNumber(userId, room_num) 
    {
      try {
        if (!this.validateRoomNumber(room_num)) 
          return { ok: false, error: "Room number must be 3 or 4 digits" };
  
        await pool.query("INSERT IGNORE INTO rooms (id) VALUES (?)", [room_num]);

        const [updateResult] = await pool.query("UPDATE users SET room_num = ? WHERE id = ?",
          [room_num, userId]);
  
        if (updateResult.affectedRows === 0) return { ok: false, error: "User not found." };

    
        return { ok: true };
  
      } catch (err) {
        console.error("Error updating room number:", err);
        return { ok: false, error: "Database error." };
      }
    }

    static async uploadProfilePicture(userId, profilePicturePath) 
    {
      try {

        const [rows] = await pool.query(`UPDATE users SET profile_picture = ? WHERE id = ?;`, 
          [profilePicturePath, userId]);

        if (rows.length === 0) return { ok: false, error: "User not found" };
  
        return { ok: true, user: "updated profile picture"};
        
      } catch (err) {
        console.error("Error updating profile picture:", err);
        return { ok: false, error: "Database error" };
      }
    }
}

export default Profile;