import { Router } from 'express';
import { getCalendarFromSession, ensureConnected, CALENDAR_ID } from '../functions/google.js';

const router = Router();

// GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/events', ensureConnected, async (req, res) => {  // makes sure the user is authenticated
  try {
    const calendar = getCalendarFromSession(req);  // creates a calendar API client using the tokens in their session
    const timeMin = req.query.start ? new Date(req.query.start).toISOString() : new Date().toISOString();
    const timeMax = req.query.end ? new Date(req.query.end).toISOString() : undefined;

    const { data } = await calendar.events.list({  // Calls Google Calendar’s events.list endpoint (return events)
      calendarId: CALENDAR_ID,  // which calendar to read
      singleEvents: true,
      orderBy: 'startTime',
      timeMin,  // time window to filter events
      timeMax,  // time window to filter events
      maxResults: 2500,
    });

    const items = (data.items || []).map(ev => ({
      id: ev.id,
      title: ev.summary || '(no title)',
      start: ev.start?.dateTime || ev.start?.date,
      end: ev.end?.dateTime || ev.end?.date,
    }));
    res.json(items);  // Sends that JSON back to the frontend 
  } catch (err) {
    console.error('Calendar fetch failed:', err?.response?.data || err);
    res.status(500).json({ error: 'Calendar fetch failed' });
  }
});

// POST /api/calendar/create { title, startISO, endISO }
router.post('/create', ensureConnected, async (req, res) => {
  try {
    const calendar = getCalendarFromSession(req);
    const { title, startISO, endISO } = req.body || {};  // reads the event details from the request body
    const r = await calendar.events.insert({  // calls Google’s events.insert endpoint to create a new event
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: title || 'Untitled',
        start: { dateTime: startISO },
        end: { dateTime: endISO },
      },
    });
    res.json({ ok: true, id: r.data.id });  // sends back a confirmation with the new event’s ID
  } catch (err) {
    console.error('Create event failed:', err?.response?.data || err);
    res.status(500).json({ error: 'Create event failed' });
  }
});

export default router;