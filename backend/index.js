import express from 'express';
import cors from "cors"  // a way for browsers and servers to interact
import session from 'express-session';
import dotenv from 'dotenv';

import ChoresRoute from "./routes/chores.js";
import AuthRoute from './routes/googleAuth.js';
import CalendarRoute from './routes/calendar.js';
import receiptRoutes from './routes/bills.js';
import ProfileRoute from './routes/profile.js';
import receiptRoutes2 from './routes/finances.js';

dotenv.config();

const app = express();

app.use("/uploads", express.static("uploads"));
app.use(express.json()); // To parse JSON request bodies

const allowedOrigins = [process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5175','http://localhost:5176','http://localhost:5177']; // if needed, you can add more origins

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

// create and manage user sessions
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// Route handlers
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
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