# BlockNote (intern assignment)

Day 1 delivers **auth**, **document list**, **PostgreSQL schema** (`User`, `Document`, `Block` with `order_index` as `Float`), a **Node.js Express API**, and a **Next.js** front end (JavaScript) ready to deploy.

## Local setup

1. **PostgreSQL** — from the repo root:

   ```bash
   docker compose up -d
   ```

2. **API** — in `backend/`:

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env: set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to long random strings
   npm install
   npm run db:push
   npm run dev
   ```

   The API listens on [http://127.0.0.1:4000](http://127.0.0.1:4000) by default (`PORT` in `.env`).

3. **Web** — in `web/` (second terminal):

   ```bash
   cd web
   cp .env.example .env
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). `/api/*` is proxied to the Express server (`API_PROXY_TARGET` in `web/.env`).

Environment variables are documented in `backend/.env.example` and `web/.env.example`.

## Public URL (Day 1 milestone)

Deploy **web** to a host that supports Next.js and **backend** to a Node-capable host (or the same platform). Use a managed Postgres (for example Neon). Set `backend` env vars like `.env.example`. Set `web`’s `API_PROXY_TARGET` to your deployed API base URL (no trailing slash).

## Project layout

| Path | Purpose |
|------|--------|
| `plan.md` | Assignment spec |
| `docker-compose.yml` | Local Postgres 16 |
| `backend/` | Express REST API + Prisma |
| `web/` | Next.js 16 app (UI only; `/api` proxied to backend) |

## Day 1 features implemented

- Register (password ≥ 8 chars, ≥ 1 digit) and login  
- JWT access token (Bearer) + httpOnly refresh cookie; `POST /api/auth/refresh` rotates refresh  
- Document dashboard: list (with last updated), create, delete, inline title rename  
- Document routes enforce ownership (403 if not yours)

The block editor, slash menu, drag reorder, auto-save, and sharing are planned for later days per `plan.md`.
