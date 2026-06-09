import { google } from 'googleapis';  // official Google API client for Node.js
import { OAuth2Client } from 'google-auth-library';  // handles OAuth2 authentication

// Google Cloud Console credentials
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI = 'postmessage',  // using a one-time code exchange
  CALENDAR_ID = 'primary',  // which Google Calendar to access
} = process.env;

// creates and returns a Google OAuth2 client object
export function getOAuthClient() 
{
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export function getCalendarFromSession(req) 
{
  const tokens = req.session.googleTokens;  // retrieves the user’s saved Google tokens from Express session
  if (!tokens) return null;
  const client = getOAuthClient();  // recreates an OAuth2 client with credentials
  client.setCredentials(tokens);  // restores the user’s access/refresh tokens into that client
  return google.calendar({ version: 'v3', auth: client });  // returns an authenticated Google Calendar API client
}

// checks if the user has authenticated with Google yet:
export function ensureConnected(req, res, next) 
{
  if (!req.session.googleTokens) return res.status(401).json({ error: 'Not connected' });
  next();
}

export { CALENDAR_ID };