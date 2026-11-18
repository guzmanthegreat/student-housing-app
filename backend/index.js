import express from 'express';
import cors from "cors"  // a way for browsers and servers to interact
import session from 'express-session';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import pool from './functions/pool.js';

import ChoresRoute from "./routes/chores.js";
import AuthRoute from './routes/googleAuth.js';
import CalendarRoute from './routes/calendar.js';
import receiptRoutes from './routes/bills.js';
import ProfileRoute from './routes/profile.js';
import receiptRoutes2 from './routes/finances.js';

dotenv.config();

const app = express();
app.set("trust proxy", 1);
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in production");
}
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

const require = createRequire(import.meta.url);
const MySQLStoreFactory = require("express-mysql-session")(session);

const sessionStoreOptions = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  createDatabaseTable: true,
};
if (process.env.MYSQL_SSL === "true") {
  sessionStoreOptions.ssl = { rejectUnauthorized: true };
}
const sessionStore = new MySQLStoreFactory(sessionStoreOptions);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Uploaded profile pictures are served directly from this folder.
app.use("/uploads", express.static("uploads"));
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

// Google login tokens are stored in a server-side session.
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  }
}));

// Render and deployment platforms use this endpoint for health checks.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Basic current-user and logout endpoints use the server session.
app.get("/api/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
  res.json({
    userId: req.session.userId,
    name: req.session.username,
    room_num: req.session.roomNum,
  });
});

app.post("/api/logout", authLimiter, (req, res) => {
  req.session.destroy(() => res.sendStatus(204));
});

// Route handlers
app.use(['/login', '/register'], authLimiter);
app.use(ChoresRoute);
app.use(ProfileRoute);
app.use(receiptRoutes2);
app.use('/api/auth', AuthRoute);      // /api/auth/...
app.use('/api/calendar', CalendarRoute); // /api/calendar/...
app.use('/api/receipts', receiptRoutes);  // /api/receipts/...

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

async function start() {
  // External databases start empty, so create tables once before accepting users.
  const sql = fs.readFileSync(new URL("../database/init.sql", import.meta.url), "utf8");
  await pool.query(sql);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Database startup failed:", error);
  process.exit(1);
});

/**
 * Status Code Reference:
 * 200 --> OK
 * 201 --> Created
 * 400 --> Bad Request
 * 401 --> Unauthorized
 * 404 --> Not Found
 * 406 --> Not Acceptable
 * 500 --> Internal Server Error
 */
