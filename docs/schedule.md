
# 🗓️ Project Schedule — Student Housing App (sheCodes SLP 2025–26)

This file is the single source of truth for our timeline, weekly goals, and assignments.
- **Team meetings:** Every **Sunday @ 8:00 PM PST** (on Zoom).
- **Demo Day:** **Sun, Nov 16, 2025** — 10:00 AM–2:00 PM @ BSC Ursa Minor (in person).

---

## Key Program Dates (from SLP)

- **Check-In #1:** Fri, **Sept 26, 2025** — Project decided & roles assigned  
- **Check-In #2:** Fri, **Oct 10, 2025** — Midpoint; ~50% done  
- **Check-In #3:** Thu, **Oct 30, 2025** — Progress; scale down if needed  
- **Check-In #4:** Fri, **Nov 7, 2025** — Wrap up & prepare for presentations  
- **Demo Day Guidelines:** Thu, **Nov 6, 2025**  
- **Project Submission:** Thu, **Nov 13, 2025**  
- **Demo Day:** Sun, **Nov 16, 2025** — 10:00 AM–2:00 PM

---

## Week-by-Week Plan  

### Week 1 — Setup & Foundations
**Dates:** Sun **Sept 28, 2025** → Sun **Oct 5, 2025**  
**Sunday Meeting (Sept 28, 2025):** Kickoff; finalize tech stack (from Google Form); assign squads; confirm environment setup.

**Goals**
- Repo, scaffolds, basic CI, DB schema, auth pipeline started.
- FE and BE both running locally.

**Assignments**
- **Infra (Support):** GitHub repo, branch rules, ESLint/Prettier, CI build (lint + build).  
- **FE Lead:** React + Tailwind scaffold; routes (Dashboard, Chores, Bills, Calendar).  
- **BE Lead:** Express (or Django) scaffold; `/api/health` test.  
- **DB:** Design schema (Users, Households, Memberships, Chores, Expenses, Splits, Events); first migration.  
- **Auth FE:** Login/Signup pages (UI + validation).  
- **Auth BE:** `/auth/register`, `/auth/login`, password hashing, JWT/session.  
- **Docs:** Create `/docs/meetings`; upload **2025-09-29-week01.pdf** slides.

**Exit Criteria**
- `npm run dev` works for FE/BE; `.env.example` created; initial schema committed.

---

### Week 2 — Auth & Households
**Dates:** Mon **Oct 6, 2025** → Sun **Oct 12, 2025**  
**Sunday Meeting:** Review auth + household flows; assign Week 3.

**Goals**
- Protected routes working.
- Create/join household with code; dashboard shows members.

**Assignments**
- **BE:** Auth middleware (protect routes), Household model & routes (`POST /households`, `POST /households/join`, `GET /households/:id`).  
- **FE:** Connect auth forms to API; Household Dashboard UI; show members.  
- **Support:** Seed users/households for testing; verify flows end-to-end.  
- **Docs:** Upload **2025-10-05-week02.pdf** slides.

**Exit Criteria**
- New user can sign up → create/join household → view members on dashboard.

---

### Week 3 — Chores (Midpoint)
**Dates:** Mon **Oct 13, 2025** → Sun **Oct 19, 2025**  
**SLP Midpoint:** **Thu, Oct 16, 2025**  
**Sunday Meeting:** Demo Chores MVP; plan Bills.

**Goals**
- Chores feature fully end-to-end (CRUD + complete).

**Assignments**
- **Chores Squad (2):**  
  - **BE:** `/chores` (POST add, GET list, PATCH complete, DELETE).  
  - **FE:** Add-chore form, list view, complete button, assignee picker & due date.
- **Bills Prep (2):**  
  - **BE:** Expense base model; `/expenses` scaffold.  
  - **FE:** Bills page skeleton with form placeholders.  
- **Support:** Integration tests for `/chores`; confirm FE↔BE wiring; UI polish.  
- **Docs:** Upload **2025-10-12-week03.pdf** slides.

**Exit Criteria**
- Add → view → complete chore works for a real household.

---

### Week 4 — Bills (Progress Check)
**Dates:** Mon **Oct 20, 2025** → Sun **Oct 26, 2025**  
**SLP Project Progress:** **Thu, Oct 24, 2025**  
**Sunday Meeting:** Demo Bills; begin Calendar.

**Goals**
- Bills feature fully end-to-end, including **split calculations** and summary.

**Assignments**
- **Bills Squad (2):**  
  - **BE:** `/expenses` (POST, GET), `/splits` compute “who owes who”; settle route.  
  - **FE:** Add bill modal/form; list of expenses; balances summary.
- **Chores Enhancements (2):**  
  - **BE:** Recurring chores (weekly/monthly rotation).  
  - **FE:** Points/leaderboard for completed chores.
- **Support:** Simple charts for expenses per roommate (Recharts/Chart.js); error states/empty states.  
- **Docs:** Upload **2025-10-19-week04.pdf** slides.

**Exit Criteria**
- Add expense → see per-person balances; settlement recorded and reflected in UI.

---

### Week 5 — Calendar
**Dates:** Mon **Oct 27, 2025** → Sun **Nov 3, 2025**  
**Sunday Meeting:** Demo Calendar; lock scope.

**Goals**
- Calendar (events CRUD) with weekly/monthly view.
- Polished Chores & Bills.

**Assignments**
- **Calendar Squad (2):**  
  - **BE:** `/events` (POST, GET, DELETE).  
  - **FE:** Calendar view; create/delete events; color by type (rent, inspection, social).
- **Bills Enhancements (1):** Recurring expenses (monthly rent/utilities).  
- **Chores Enhancements (1):** Rotation settings per chore (assignee cycle).  
- **Support:** Early deploy to Vercel (FE) + Render/Railway (BE); fix env; smoke test.  
- **Docs:** Upload **2025-10-26-week05.pdf** slides.

**Exit Criteria**
- Three sections (Chores, Bills, Calendar) usable on the deployed preview.

---

### Week 6 — Integration & Theme
**Dates:** Tue **Nov 4, 2025** → Sun **Nov 9, 2025**  
**SLP Guidelines:** **Thu, Nov 6, 2025**  
**Wrap-Up Checkpoint:** **Mon, Nov 10, 2025**  
**Sunday Meeting:** Full flow rehearsal; assign final fixes.

**Goals**
- Cohesive app: navigation, consistent styles, copy, and states.
- Initial notifications/reminders.

**Assignments**
- **BE:** Unit tests for chores & bills critical paths; reminder jobs (due chores, upcoming bills).  
- **FE:** Theme pass (pink palette, icons), dashboard summary cards, error/loading states.  
- **Support:** Accessibility sweep (focus order, labels), responsive breakpoints, performance basics.  
- **Docs:** Upload **2025-11-02-week06.pdf** slides.

**Exit Criteria**
- Stable integrated build; demoable from login → household → chores/bills/calendar.

---

### Week 7 — Extras & Submission
**Dates:** Tue **Nov 11, 2025** → Thu **Nov 13, 2025**  
**Submission:** **Thu, Nov 13, 2025**

**Goals**
- Optional small features + final polish.
- Submit on time.

**Assignments**
- **Extras (as capacity allows):**  
  - Shared grocery list (add/view/mark bought) **or** Guest tracker.  
  - Notification UI (reminder banners/toasts).
- **Polish:** Seed demo data; fix priority bugs; final deploy; write release notes.  
- **Docs:** Upload **2025-11-09-week07.pdf** slides.

**Exit Criteria**
- Submitted project; live URL stable; demo account ready.

---

### Week 8–9 — Demo
**Dates:** Fri **Nov 14, 2025** → Sun **Nov 16, 2025**  
**Demo Day:** **Sun, Nov 16, 2025** (10:00 AM–2:00 PM)

**Goals**
- Rehearsed, confident demo with a reliable backup.

**Assignments**
- Final dry runs; time the talk; verify Wi-Fi-free fallback (recorded demo).  
- Print/collect QR to live app & repo.

**Exit Criteria**
- Successful in-person presentation 🎉

---

## Weekly Meeting Template (copy into slides in `/docs/meetings`)
- Wins (what shipped):  
- Demos (screens or short clip):  
- Blockers (help needed):  
- Assignments (owner → deliverable):  
- Risks/Scope decisions:  
- Next steps until next Sunday:

---

## File Conventions
- **Meeting slides:** `/docs/meetings/YYYY-MM-DD-weekNN.pdf`  
- **Branches:** `feature/<area>-<short>`, `fix/<short>`  
- **Issues labels:** `feat`, `bug`, `design`, `docs`, `check-in`, `blocked`, `good first issue`

