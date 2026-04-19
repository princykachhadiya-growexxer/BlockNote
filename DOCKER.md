# Docker Setup

This project can be run fully through Docker Compose without changing the existing app logic.

## Files added

- `docker-compose.yml`: starts `frontend`, `backend`, and `postgres`
- `.env.example`: example root env file used by Docker Compose
- `backend/Dockerfile`: production image for the Express + Prisma API
- `backend/docker-entrypoint.sh`: waits for PostgreSQL, runs Prisma migrations, then starts the API
- `frontend/Dockerfile`: multi-stage production image for Next.js
- `backend/.dockerignore` and `frontend/.dockerignore`: keep image builds smaller and faster

## How networking works

- Inside Docker Compose, services talk to each other by service name.
- The backend connects to PostgreSQL using `postgres` as the host.
- The frontend proxies `/api/*` to `http://backend:4000`, not `localhost`.
- `localhost` is only used from your browser on the host machine:
  - frontend: `http://localhost:3000`
  - backend: `http://localhost:4000`
  - postgres: `localhost:5432`

## Environment setup

1. Copy the root env file:

```bash
cp .env.example .env
```

2. Update the JWT secrets in `.env`.

Docker Compose loads this root `.env` automatically and uses it for:

- PostgreSQL database/user/password/port
- backend and frontend published ports
- backend JWT secrets

Your existing `backend/.env` and `frontend/.env` can stay as they are for non-Docker local runs.

## Start the stack

```bash
docker compose up --build
```

To run in the background:

```bash
docker compose up --build -d
```

## Stop the stack

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

## What each service does

### `postgres`

- Uses `postgres:16-alpine`
- Stores data in the named volume `postgres_data`
- Exposes port `5432`
- Has a healthcheck so Compose knows when it is ready

### `backend`

- Builds from `backend/Dockerfile`
- Waits for PostgreSQL before starting
- Runs `prisma migrate deploy` on startup
- Starts the Express server on port `4000`
- Uses `DATABASE_URL` with `postgres` as the host

### `frontend`

- Builds from `frontend/Dockerfile`
- Runs a production Next.js build
- Exposes port `3000`
- Proxies `/api/*` requests to `http://backend:4000`

## Common commands

View logs:

```bash
docker compose logs -f
```

Rebuild one service:

```bash
docker compose build backend
docker compose build frontend
```

Run Prisma commands in the backend container:

```bash
docker compose exec backend npx prisma studio
docker compose exec backend npx prisma migrate status
```
