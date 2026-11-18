-- Roomies database setup
-- Docker runs this file once when the MySQL volume is first created.

CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY,
  room_num INT
);

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  profile_picture VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  room_num INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_num) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS chores (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  chore_name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  due_date DATETIME,
  room_num INT,
  is_finished BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_num) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS finances (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  room_num INT,
  name VARCHAR(255),
  total DECIMAL(10,2),
  FOREIGN KEY (room_num) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS receipt (
  id INT,
  item VARCHAR(255),
  price DOUBLE,
  FOREIGN KEY (id) REFERENCES finances(id)
);
