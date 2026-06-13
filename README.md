# 🏠 Roomies — Student Housing Web Application

A full-stack roommate management app to reduce conflict and keep shared living organized.

## Features

- **Chore Tracker** — assign and track household tasks
- **Bill Splitter** — upload a receipt image to split expenses between roommates
- **Calendar** — manage shared events and reminders
- **Authentication** — Google OAuth for secure login

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Auth:** Google OAuth
- **APIs:** Google API, Veryfi API
- **DevOps:** Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker Desktop

### Setup

1. Clone the repo

```bash
   git clone https://github.com/guzmanthegreat/student-housing-app.git
   cd student-housing-app
```

2. Create your environment file

```bash
   cp backend/.env.example backend/.env
```

Fill in your credentials in `backend/.env`

3. Start the app

```bash
   docker-compose up
```

4. Open [http://localhost:5173](http://localhost:5173)

### Stop the app

```bash
docker-compose down
```

## Design

[Figma](https://www.figma.com/design/BCoKbG9Ufkkairu1vrSdL1/sheCodes-fullStack-Figma?node-id=0-1&p=f&t=VWx5kgCiAMxyJaZj-0)

## Demo

[Video Walkthrough](https://youtu.be/cL8MffrC0oE)
