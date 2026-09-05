# Phoneme Activity Builder

A web application for Speech Pathology teachers to build, store and generate
phoneme-based learning activities — **Phoneme Wordle** and **Phoneme Word
Search**. Teachers manage phoneme-based word lists and activity settings in a
database and generate downloadable, self-contained HTML activities from the
stored data.

This repository covers **Assessment 1 (frontend)** and **Assessment 2 (backend
& database)** of CSE3CWA.

---

## Tech stack

| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| Framework    | [Next.js](https://nextjs.org) (App Router, React 19)  |
| Language     | TypeScript                                            |
| Styling      | Tailwind CSS                                          |
| API          | Next.js Route Handlers (`/app/api/*`)                 |
| ORM          | [Prisma](https://www.prisma.io) 6                     |
| Database     | SQLite (file-based)                                   |
| Validation   | [Zod](https://zod.dev) 4                              |
| Container    | Docker / Docker Compose                               |

---

## Database schema

The schema is defined in [`prisma/schema.prisma`](./prisma/schema.prisma) and is
normalised across three models:

```
ActivityConfig 1──* Word 1──* Phoneme
```

- **ActivityConfig** — a stored activity (Wordle or Word Search) with its name,
  type, difficulty, hint toggle, and output settings (`numGuesses` for Wordle,
  `rows`/`cols` for Word Search). Many can be stored.
- **Word** — a word belonging to an activity, with an optional English gloss.
- **Phoneme** — a single phoneme unit within a word. Each phoneme is its own row
  with a `symbol` field, so **multi-character phoneme symbols** such as `tʃ`,
  `dʒ`, `eɪ` and `ʉː` are preserved exactly. The `position` field keeps the
  phonemes in order.

The schema supports storing and retrieving multiple activity configurations,
each with their own word lists and settings.

---

## API

All endpoints return JSON of the form `{ ok, data }` or `{ ok: false, error }`.

| Method | Route                          | Description                                        |
| ------ | ------------------------------ | -------------------------------------------------- |
| GET    | `/health`                      | Health check — `200 OK` + database status          |
| GET    | `/api/health`                  | Alias of the health check                          |
| GET    | `/api/activities`              | List activities (`?activityType=wordle` to filter) |
| POST   | `/api/activities`              | Create an activity with words + phonemes           |
| GET    | `/api/activities/:id`          | Get a single activity                              |
| PUT    | `/api/activities/:id`          | Update an activity (replaces its word list)        |
| DELETE | `/api/activities/:id`          | Delete an activity                                 |
| POST   | `/api/activities/:id/words`    | Add a word to an activity                          |
| PUT    | `/api/words/:id`               | Update a single word                               |
| DELETE | `/api/words/:id`               | Delete a single word                               |

Input is validated with Zod before it reaches the database. Invalid or missing
data returns `400` with a list of issues; unknown records return `404`;
unexpected errors return `500`. Malformed/empty phoneme data is rejected at the
validation layer.

---

## Running locally

Prerequisites: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env              # set DATABASE_URL for local SQLite
npm run db:setup                  # generate client, create schema, seed
npm run dev                       # http://localhost:3000
```

Useful scripts:

```bash
npm run db:studio                 # browse the database in Prisma Studio
npm run db:seed                   # re-seed example data (only if empty)
npm run lint                      # ESLint
```

---

## Running in Docker

The application is fully containerised and reproducible:

```bash
docker compose up --build         # http://localhost:3000
```

- The image is built in three stages (deps → build → runner) using
  `node:20-alpine`.
- Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
  keeps the production image small; the Prisma generated client and query engine
  are copied alongside it.
- A seeded SQLite database is baked into the image and copied into a named
  volume (`builder-data`) on first run, so saved activities persist across
  container restarts.
- `GET /health` returns `200 OK` and confirms the database connection.

To stop and remove the container (the volume is retained):

```bash
docker compose down
```

---

## Features

- **Activity Library** (`/library`) — create, read, update and delete saved
  phoneme activities. Generate downloadable HTML directly from stored data.
- **Wordle builder** (`/wordle`) — build a phoneme Wordle, preview it live, save
  it to the library, or load a saved activity and generate/download the HTML.
- **Word Search builder** (`/wordsearch`) — same workflow for phoneme word
  searches, driven by stored word lists.
- **Health check** (`/health`) — reports service and database status.
- **Settings** (`/settings`) — theme and layout preferences (from Assessment 1).

Generated HTML files are self-contained and runnable offline in any browser.

---

## Project structure

```
prisma/
  schema.prisma        # ActivityConfig / Word / Phoneme data model
  seed.mjs             # example activities (Wordle + Word Search)
src/
  app/
    api/               # CRUD route handlers + health
    health/            # GET /health
    library/           # Activity library (CRUD UI)
    wordle/            # Wordle builder
    wordsearch/        # Word Search builder
  components/          # Shared UI (nav, editor, etc.)
  lib/                 # prisma client, validation, api client
  utils/               # HTML document builders, export helpers
Dockerfile             # multi-stage container build
docker-compose.yml     # one-command run with persistent volume
```

---

## References

- Next.js. (2025). *Next.js documentation*. https://nextjs.org/docs
- React. (2025). *React documentation*. https://react.dev
- Prisma. (2025). *Prisma documentation*. https://www.prisma.io/docs
- Zod. (2025). *Zod documentation*. https://zod.dev
- Docker. (2025). *Docker documentation*. https://docs.docker.com
