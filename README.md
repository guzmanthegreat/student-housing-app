# Roomies

Roomies is a full-stack roommate coordination app for shared chores, receipts, bills, profiles, and Google Calendar events.

## What it demonstrates

- React 19, Vite, and React Router
- Node.js, Express, and MySQL
- Password hashing with bcrypt and server-side sessions
- Google Calendar OAuth
- Receipt OCR through Veryfi
- Docker-based local development
- Render deployment configuration

## Local development

### Prerequisites

- Node.js 20+
- Docker Desktop (recommended)
- MySQL, if running the API without Docker

### Docker

1. Copy `backend/.env.example` to `backend/.env`.
2. Keep the local MySQL values unless you are using an existing database.
3. Start the stack:

```bash
docker compose up --build
```

Open <http://localhost:5173>. The API health check is at <http://localhost:3000/health>.

To reset the local database volume:

```bash
docker compose down -v
```

### Run without Docker

Start MySQL, create the `SHousing` database, then run:

Set `MYSQL_HOST=127.0.0.1` in `backend/.env` when MySQL is running directly on your computer. The Docker value `MYSQL_HOST=database` only works inside Compose.

```bash
cd backend
npm ci
npm run migrate
npm start
```

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend uses `http://localhost:3000` by default. Set `VITE_API_URL` if the API is elsewhere. Google Calendar requires both Google client ID variables; receipt OCR requires all four Veryfi variables.

## Environment variables

Backend variables are documented in [`backend/.env.example`](backend/.env.example). They include MySQL, session, Google OAuth, and Veryfi settings.

Frontend variables:

```text
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

Never commit `.env` files or API credentials.

## Deploy on Render

The repository includes [`render.yaml`](render.yaml) for one static frontend and one Dockerized API. Render does not provide MySQL, so create a managed MySQL database with a provider such as Railway, Aiven, or another MySQL-compatible provider first.

Recommended order:

1. Create the managed MySQL database and confirm it accepts TLS connections.
2. Create the Render Blueprint from this repository.
3. Deploy the static site once so you know its public URL.
4. Set `CORS_ORIGIN` on the API to the exact frontend origin, including `https://` and excluding a trailing slash.
5. Set `VITE_API_URL` on the static site to the exact API URL, then redeploy the static site.

### API service: `roomies-api`

```text
MYSQL_HOST=<database host>
MYSQL_PORT=3306
MYSQL_USER=<database user>
MYSQL_PASSWORD=<database password>
MYSQL_DATABASE=<database name>
MYSQL_SSL=true
SESSION_SECRET=<long random value>
CORS_ORIGIN=https://<frontend-domain>
GOOGLE_CLIENT_ID=<Google web client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth secret>
VERYFI_CLIENT_ID=<optional>
VERYFI_CLIENT_SECRET=<optional>
VERYFI_USERNAME=<optional>
VERYFI_API_KEY=<optional>
```

### Static site: `roomies`

```text
VITE_API_URL=https://<api-domain>
VITE_GOOGLE_CLIENT_ID=<same Google web client ID>
```

After deployment, add the deployed frontend origin to Google Cloud OAuth authorized JavaScript origins. The Google OAuth client must allow the deployed frontend domain.

The Google Calendar flow uses a popup/code exchange, so the deployed frontend origin is the key Google setting. Do not put the Google client secret in frontend variables.

Verify the API:

```bash
curl https://<api-domain>/health
```

The API should return `{ "status": "ok" }`. Then test registration, login, creating a chore, uploading a receipt, profile updates, and calendar connection in a private browser window. If Veryfi is not configured, receipt OCR is expected to fail until those credentials are added.

## Verification commands

```bash
cd frontend && npm ci && npm run build
cd ../backend && npm ci && npm run build && npm test
```

## Project structure

```text
student-housing-app/
├── frontend/             # React/Vite client
├── backend/              # Express API and session auth
├── database/init.sql     # MySQL schema
├── docker-compose.yml    # Local frontend/API/MySQL stack
└── render.yaml           # Render Blueprint
```

## Production notes

- Room and chore access is scoped to the authenticated session.
- Uploaded receipt files are processed temporarily and then removed.
- Profile images currently use local filesystem storage; use object storage before treating profile photos as durable production data.
- Add email verification, password reset, monitoring, backups, and a persistent upload store before a broad public launch.
