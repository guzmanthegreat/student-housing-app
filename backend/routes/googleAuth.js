import { Router } from 'express';
import { getOAuthClient } from '../functions/google.js';

const router = Router();

// exchange GIS "code" for tokens: it turns the temperary login approval code into reusable 
// credentials that your server can use to access Google Calendar (or other Google APIs) for that user
router.post('/exchange-code', async (req, res) => {
  try {
    const { code } = req.body || {};  // receives a Google authorization code from the frontend
    if (!code) return res.status(400).json({ error: 'Missing code' });

    const oauth2 = getOAuthClient();
    const { tokens } = await oauth2.getToken({ code, redirect_uri: oauth2.redirectUri });  // exchanges that code for OAuth tokens
    req.session.googleTokens = tokens;  // stores those tokens in the user’s session
    res.sendStatus(204);
  } catch (err) {
    console.error('OAuth exchange failed:', err?.response?.data || err);
    res.status(500).json({ error: 'OAuth exchange failed' });
  }
});

// checks whether the user is connected to Google
router.get('/status', (req, res) => {
  res.json({ connected: !!req.session.googleTokens });
});

// logs the user out by destroying the session
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.sendStatus(204));
});

export default router;