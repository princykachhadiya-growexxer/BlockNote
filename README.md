# BlockNote 📄

A block-based document workspace where users can create, edit, organise, and share documents. Built with a Next.js frontend ⚛️, an Express REST API 🚀, Prisma ORM 🔷, and PostgreSQL 🐘.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

[Live Demo](https://block-note-ia8421z5e-princykachhadiya-growexxers-projects.vercel.app)

</div>

<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

## Features 🚀

* 🔐 **Authentication** — Register and login with JWT-based secure cookies  
* 📂 **Document management** — Create, rename, and delete documents easily  
* 🧱 **Block editor** — Build documents using flexible content blocks  
* 🖱️ **Drag & drop** — Reorder blocks smoothly with minimal updates  
* ⭐ **Starring** — Mark important documents and blocks  
* 🗑️♻️ **Trash** — Soft delete with restore option  
* 🔗 **Sharing** — Generate public read-only document links  
* 📊 **Analytics** — View document stats and recent activity  
* 🔍 **Filtering** — Filter documents by block types  
* 🔎 **Search** — Fast search with pagination reset  
* 📌 **Pinned** — Pin documents locally per device  
* 🧭 **Guide** — Built-in page to help users get started  

<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

## Setup Instructions ⚙️

### A. Run with Docker 🐳 (recommended)

**Requirements:** Docker, Docker Compose

This runs the full stack — PostgreSQL 🐘, backend ⚙️, and frontend 💻 — in isolated containers with a single command.

**Step 1 — Clone the repository 📥**

```bash
git clone <your-repo-url>
cd BlockNote
```

**Step 2 — Set up environment variables 🔧**

```bash
cp .env.example .env
```

Open `.env` and update the JWT secrets before running:

```env
JWT_ACCESS_SECRET=your-long-random-secret
JWT_REFRESH_SECRET=your-different-long-random-secret
```

> The Postgres values (`blocknote/blocknote`) are fine as-is for local Docker use 👍.

**Step 3 — Build and start all services ▶️**

```bash
docker compose up --build
```

Migrations run automatically on backend startup.

**Step 4 — Open the app 🌐**

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend API → [http://localhost:4000/api](http://localhost:4000/api)

**Useful Docker commands 🛠️**

```bash
# Run in background
docker compose up --build -d

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend

# Stop all containers
docker compose down

# Stop and delete the database volume (full reset)
docker compose down -v
```

---

### B. Run Locally (without Docker) 💻

**Requirements:** Node.js 20+, npm, PostgreSQL running locally 🐘

**Step 1 — Clone the repository 📥**

```bash
git clone <your-repo-url>
cd BlockNote
```

**Step 2 — Configure backend environment ⚙️**

```bash
cp backend/.env.example backend/.env
```

Fill in your local PostgreSQL connection string and JWT secrets in `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/blocknote"
JWT_ACCESS_SECRET="your-long-random-secret"
JWT_REFRESH_SECRET="your-different-long-random-secret"
PORT=4000
```

**Step 3 — Configure frontend environment ⚙️**

```bash
cp frontend/.env.example frontend/.env
```

**Step 4 — Install and start the backend ▶️**

```bash
cd backend
npm install
npm run db:push      # push schema to your local database
npm run dev          # starts on http://localhost:4000
```

**Step 5 — Install and start the frontend ▶️** (new terminal)

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:3000
```

**Step 6 — Open the app 🌐**

```
http://localhost:3000
```

The frontend proxies all `/api/*` requests to the backend via `API_PROXY_TARGET`, so everything works through port 3000 🔁.

**Useful local commands 🛠️**

```bash
# Backend
npm run db:push       # sync schema without migrations
npm run db:migrate    # run migrations (dev)
npm run db:studio     # open Prisma Studio in browser

# Frontend
npm run build         # production build
npm run lint          # run ESLint
```

<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

## Environment Variables 🔐

### Root `.env` (Docker only) 🐳

Defined in [`.env.example`](.env.example). Used exclusively by `docker-compose.yml`.

| Variable             | Default               | Purpose                                                               |
| -------------------- | --------------------- | --------------------------------------------------------------------- |
| `POSTGRES_DB`        | `blocknote`           | PostgreSQL database name 🐘                                           |
| `POSTGRES_USER`      | `blocknote`           | PostgreSQL username                                                   |
| `POSTGRES_PASSWORD`  | `blocknote`           | PostgreSQL password 🔑                                                |
| `POSTGRES_PORT`      | `5432`                | Host port exposed for Postgres                                        |
| `BACKEND_PORT`       | `4000`                | Host port exposed for the backend                                     |
| `FRONTEND_PORT`      | `3000`                | Host port exposed for the frontend                                    |
| `API_PROXY_TARGET`   | `http://backend:4000` | Internal Docker URL the frontend uses to reach the backend 🔗         |
| `JWT_ACCESS_SECRET`  | *(replace)*           | Secret for signing access tokens — must be long and random 🔐         |
| `JWT_REFRESH_SECRET` | *(replace)*           | Secret for signing refresh tokens — must differ from access secret 🔐 |

### Backend `.env` (local development only) ⚙️

Defined in [`backend/.env.example`](backend/.env.example).

| Variable             | Example                                               | Purpose                                    |
| -------------------- | ----------------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`       | `postgresql://USER:PASSWORD@localhost:5432/blocknote` | Prisma connection string for PostgreSQL 🐘 |
| `JWT_ACCESS_SECRET`  | *(generate)*                                          | Secret for signing access tokens 🔐        |
| `JWT_REFRESH_SECRET` | *(generate)*                                          | Secret for signing refresh tokens 🔐       |
| `PORT`               | `4000`                                                | Port the Express server listens on         |


### Frontend `.env` (local development only) 💻

Defined in [`frontend/.env.example`](frontend/.env.example).

| Variable           | Default                 | Purpose                                                      |
| ------------------ | ----------------------- | ------------------------------------------------------------ |
| `API_PROXY_TARGET` | `http://127.0.0.1:4000` | URL the Next.js rewrite rule proxies `/api/*` requests to 🔁 |

<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

## Architecture Decisions 🏗️

### Tech stack ⚙️

| Layer      | Technology                | Reason                                                                         |
| ---------- | ------------------------- | ------------------------------------------------------------------------------ |
| Frontend   | Next.js 14 + React 18 ⚛️  | App router, server components, built-in API proxying via rewrites              |
| Styling    | Tailwind CSS v4 🎨        | Utility-first, consistent without a heavy component framework                  |
| Backend    | Express 5 🚀              | Lightweight, explicit REST layer suited to this project's scope                |
| ORM        | Prisma 🔷                 | Type-safe queries, easy schema evolution via migrations                        |
| Database   | PostgreSQL 🐘             | Strong fit for relational data — users, documents, blocks, star relationships  |
| Validation | Zod ✅                     | Schema-first validation with clear error messages at the route layer           |
| Auth       | JWT + httpOnly cookies 🍪 | Stateless token auth; tokens stay out of `localStorage` to reduce XSS exposure |

<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

### Key design decisions 🧠

---
* 🔀 **Separated frontend and backend** — UI and API are independent apps. The frontend proxies `/api/*` to the backend, keeping CORS simple in development and making the two independently deployable.
* 🧱 **Block-based document model** — Documents contain ordered blocks rather than raw text. This makes editing operations (split, reorder, type-change) explicit and API-driven.
* 🔢 **`order_index` as Float** — Block ordering uses floating-point gaps so inserts and reorders only update the affected blocks, not the whole document. Auto-renormalization kicks in when gaps collapse below a threshold.
* 🗑️ **Soft delete for documents** — Documents are moved to Trash via `deleted_at` rather than hard-deleted immediately. This supports restore flows and prevents accidental data loss.
* ⭐ **Separate star join tables** — `DocumentStar` and `BlockStar` are dedicated tables with unique constraints per user, keeping starring logic clean and preventing duplicates at the database level.
* 🧪 **Schema feature detection** — The backend checks for the presence of columns like `deleted_at` and `share_count` at runtime. This prevents hard crashes if a developer's local database is behind on migrations.
* ⚖️ **Thin controllers, fat services** — HTTP concerns (request parsing, response shaping) stay in controllers. Business logic and Prisma queries live in service files. Middleware handles auth and share-access checks.
<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

## Edge Case Decisions ⚠️

| Edge case                            | Decision                                                                                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New document is empty                | A default paragraph block is created in the same transaction so the editor always opens in a writable state ✍️                                                       |
| Document moved to Trash              | `share_token` and `is_public` are cleared immediately so trashed documents cannot remain publicly accessible 🔒                                                      |
| Restoring a document                 | `updated_at` is refreshed on restore so the document reappears in the active workspace feed 🔄                                                                       |
| Block `order_index` gaps collapse    | Reorder requests detect gaps below `0.001` and renormalize all blocks in the document to evenly spaced integers 🔢                                                   |
| Cross-user block access              | Document ownership is verified before every block read or write — mismatched `user_id` returns 404, not 403, to avoid leaking existence 🔍                           |
| Shared document with revoked token   | Accessing a share URL after the token is revoked or the document is trashed returns 404 🚫                                                                           |
| Starring the same item twice         | `DocumentStar` and `BlockStar` have a unique constraint on `(user_id, document_id)` and `(user_id, block_id)` — the toggle always reads first and flips the state 🔁 |
| Search input changes while paginated | Pagination resets to page 1 whenever the search query or active filter changes 🔄                                                                                    |
| Filter changes on dashboard          | Block-type filter metadata is fetched in the same query as documents — no additional round-trips ⚡                                                                   |
| 401 on an authenticated request      | `authFetch` transparently attempts one token refresh and retries the original request before propagating the error 🔐                                                |

<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

## Known Issues / Limitations ⚠️

1. ❌ **No automated tests** — The repository does not include a test suite (unit or integration).
2. 📌 **Pinned documents are device-specific** — Pinned state is stored in `localStorage` and does not sync across devices or sessions.
3. 📄 **Client-side pagination** — Pagination is applied on the frontend after the full analytics response is loaded, so it improves display density but not query performance on large datasets.
4. ⚠️ **Schema drift risk** — If local migrations are not up to date, some features (Trash, share count) degrade silently rather than hard-failing at startup.
5. 👀 **Share is read-only from UI** — Collaborators with a share link can view but not edit documents. There is no write-permission sharing model.
6. 📧❌ **No email verification** — User registration does not require email confirmation.
7. 🚫 **No rate limiting** — The API does not currently implement rate limiting on auth or public share endpoints.
<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

## Deployment 🚀

### Backend + PostgreSQL → Render 🌐

The Express backend and PostgreSQL database are deployed on Render.

* The backend is deployed as a **Web Service** on Render.
* PostgreSQL is provisioned as a **Render Managed Database**.
* The `DATABASE_URL` in Render's environment variables points to the managed database using Render's internal connection string (with `sslmode=require`).
* Prisma migrations should be run manually via Render's shell or as a deploy command: `npx prisma migrate deploy`.

**Required environment variables on Render (backend):**

```
DATABASE_URL=<render-internal-postgres-url>?sslmode=require
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
PORT=4000
NODE_ENV=production
```

### Frontend → Vercel ▲

The Next.js frontend is deployed on Vercel.

* Connect the repository to Vercel and set the root directory to `frontend/`.
* Set the following environment variable in Vercel's project settings:

```
API_PROXY_TARGET=https://your-backend.onrender.com
```

* Vercel automatically handles builds via `npm run build` and serves the app globally 🌍.

> The `next.config.mjs` rewrite rule proxies all `/api/*` requests from the frontend to `API_PROXY_TARGET`, so the frontend never exposes the backend URL directly to the browser 🔐.


<hr style="border: none; height: 3px; background-color: #41464e; margin: 32px 0;">

## Development Tips 💡

* **Always use `http://localhost:3000`** during local development 🌐. The frontend's rewrite rule proxies `/api/*` to the backend, so you don't need to call port 4000 directly from the browser.

* **Run migrations, not just `db:push` in production. ⚠️** Use `npm run db:push` only during early local development. For any shared or deployed environment use `npx prisma migrate deploy` to apply tracked migrations.

* **Docker conflicts with local PostgreSQL ⚠️.** If you have PostgreSQL running locally on port `5432`, Docker's postgres container will fail to start. Stop the local service first:

  ```bash
  sudo systemctl stop postgresql
  ```

* **Rebuild Docker images after code changes 🔄.**

  ```bash
  docker compose up --build
  ```

  Subsequent runs without code changes can skip `--build`:

  ```bash
  docker compose up
  ```

* **Prisma Studio 🔍** is useful for inspecting the database during local development:

  ```bash
  cd backend && npm run db:studio
  ```

* **Check Docker logs when something breaks 🛠️.**

  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  docker compose logs -f postgres
  ```

* **The frontend `.env` is ignored by Docker ⚠️.** The `API_PROXY_TARGET` for Docker is set in the root `.env` and passed as a build argument — not from `frontend/.env`.
