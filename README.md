# 🏠 Roomies — Student Housing Web App

Roomies is a full-stack web app built for college roommates. Track chores, split bills, manage a shared calendar, and keep the house running without the group chat drama.

---

## Features

- **Chore Tracker** — assign tasks to roommates and track completion
- **Bill Splitter** — upload a receipt photo and split expenses automatically
- **Shared Calendar** — manage house events and reminders in one place
- **Google OAuth** — secure, one-click login with your Google account

---

## Tech Stack

| Layer    | Tools                    |
| -------- | ------------------------ |
| Frontend | React, Vite, CSS         |
| Backend  | Node.js, Express         |
| Database | MySQL 8                  |
| Auth     | Google OAuth 2.0         |
| APIs     | Veryfi (receipt parsing) |
| DevOps   | Docker, Docker Compose   |

---

## Quick Start

The entire app runs in Docker — no need to install Node, MySQL, or anything else manually.

### 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 2. Clone the repo

```bash
git clone https://github.com/guzmanthegreat/student-housing-app.git
cd student-housing-app
```

### 3. Set up your environment file

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in the following:

```
DB_HOST=database
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=SHousing

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=any_random_string

VERYFI_CLIENT_ID=your_veryfi_client_id
VERYFI_CLIENT_SECRET=your_veryfi_client_secret
VERYFI_USERNAME=your_veryfi_username
VERYFI_API_KEY=your_veryfi_api_key
```

### 4. Set up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project and navigate to **APIs & Services > Credentials**
3. Create an **OAuth 2.0 Client ID** (Web application)
4. Add the following as an authorized redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Copy your **Client ID** and **Client Secret** into `backend/.env`

### 5. Start the app

```bash
docker compose up --build
```

This builds and starts three services: frontend, backend, and database.

### 6. Open the app

```
http://localhost:5173
```

> The backend API runs on `http://localhost:3000`

---

## Stopping the App

```bash
docker compose down
```

To also remove the database volume (resets all data):

```bash
docker compose down -v
```

---

## Project Structure

```
student-housing-app/
├── frontend/        # React + Vite
├── backend/         # Node.js + Express API
├── database/        # MySQL init script
├── docker-compose.yml
└── README.md
```

---

## Links

- [Figma Design](https://www.figma.com/design/BCoKbG9Ufkkairu1vrSdL1/sheCodes-fullStack-Figma?node-id=0-1&p=f&t=VWx5kgCiAMxyJaZj-0)
- [Video Walkthrough](https://youtu.be/cL8MffrC0oE)
