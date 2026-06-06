Deployment guide
================

This repository contains a full-stack RoomReserve application (Angular frontend + Java booking service). Below are local run instructions and deployment suggestions so you can publish a single app URL.

Run locally with Docker (single link)
-----------------------------------
Requirements: Docker & Docker Compose installed.

1. From the repository root run:

```bash
docker-compose up --build
```

2. Open the frontend at: http://localhost:8081 — the frontend will proxy API calls to the backend at `/api` (backend runs on port 8080 inside the compose network).

Deploy to a cloud host (recommended)
----------------------------------
Option A — Render (recommended for ease)
- Push this repo to GitHub.
- In Render, create a new "Web Service" for the backend:
  - Connect your GitHub repo, point to `RoomReserve/booking-service/booking-service`.
  - Use Dockerfile (we included one) or auto-detect Java; set port 8080.
- Create a static site or web service for the frontend:
  - Point to `RoomReserve/room-reserve-frontend`, use Dockerfile or static site settings.
  - Set an environment variable `ROOM_RESERVE_API_BASE` for the frontend service to your backend URL (e.g. `https://roomreserve-backend.onrender.com`).

Option B — Vercel (frontend) + Render (backend)
- Deploy frontend to Vercel (connect repo and select `room-reserve-frontend`).
- Deploy backend to Render and set the frontend env var `ROOM_RESERVE_API_BASE` to the backend URL.

CI / Auto-deploy
----------------
You can add GitHub Actions to build and push Docker images to a registry, or configure Render to auto-deploy from GitHub on push.

Notes
-----
- For a single public link, host the frontend on a public static host (Vercel/Render) and point it to the backend URL; users will use the frontend link.
- If you want me to deploy this for you I will need access to create cloud services (or an API key) — otherwise I can prepare GitHub Actions and instructions and you can deploy after pushing to your GitHub account.
