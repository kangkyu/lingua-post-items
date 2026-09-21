# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lingua Post is a translation management platform where users can create, organize, and share translations in themed books. Built with React frontend and Node.js backend, using Google OAuth for authentication and Google Translate API for translations.

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Run frontend only (http://localhost:5173)
npm run dev

# Run both frontend and backend
npm run dev:all

# Run frontend and backend separately (recommended if dev:all fails)
npm run dev:frontend    # Terminal 1 - http://localhost:5173
npm run dev:backend     # Terminal 2 - http://localhost:3001

# Lint frontend
npm run lint

# Build for production
npm run build

# Run backend tests (Vitest + Supertest, uses .env.test)
cd backend && npm run test
```

### Database Commands

```bash
npm run db:push     # Push Prisma schema to database
npm run db:studio   # Open Prisma Studio GUI
```

## Architecture

**Monorepo structure** using npm workspaces with Turborepo:
- `frontend/` - React 19 + Vite + Tailwind CSS v4
- `backend/` - Node.js custom HTTP server with Prisma ORM

### Backend API Pattern

The backend uses a **raw Node.js HTTP server** (not Express) with a custom file-based routing system (`backend/dev-server.js`). Routes are determined by file paths:
- `backend/works/index.js` → `GET /works`
- `backend/works/[id].js` → `GET /works/:id` (dynamic parameter extracted from bracket syntax into `req.query`)
- `backend/passages/[id].js` → `GET /passages/:id`

Each route file exports a default async handler: `export default async function handler(req, res)`. The `res` object uses raw Node.js methods (`res.writeHead(status, headers)`, `res.end(JSON.stringify(data))`), not Express helpers. CORS is handled automatically by the server. Query params are in `req.query`, parsed JSON body in `req.body`.

### Backend Auth Pattern

Protected routes call `authenticateUser(req)` from `backend/auth/middleware.js` at the start of the handler. This validates a JWT from the `Authorization: Bearer <token>` header. Pattern:

```js
const authResult = await authenticateUser(req);
if (authResult.error) {
  res.writeHead(authResult.status, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ error: authResult.error }));
}
const user = authResult.user;
```

### Frontend Structure

- **Routing**: React Router v7 in `App.jsx`
- **State Management**: React Context for auth (`contexts/AuthContext.jsx`), session in localStorage
- **API calls**: `lib/api.js` - native `fetch()` client with `VITE_API_ROOT_URL` base URL. Service modules: `translationService`, `workService`, `passageService`, `bookmarkService`, `commentService`, `profileService`, `userService`
- **Path alias**: `@` → `./src` (configured in `vite.config.js`)
- **Auth flow**: Google OAuth → backend validates token → returns JWT → stored in localStorage

### Database Schema (Prisma)

Core models: `User`, `Session`, `Work`, `Passage`, `Translation`, `Bookmark`, `Comment`

The source text is separate from the translations of it:

- **`Work`** — one source text in its original language. Unique on `(title, language)`, so the same title in two languages is two works.
- **`Passage`** — one sentence/paragraph of a Work, in the original language, ordered by `position` (unique per work), with optional `chapter`, `pageNumber`, `context`. **A passage can have zero translations** — that is how an untranslated chapter is represented.
- **`Translation`** — one person's rendering of one Passage (`text`, `targetLanguage`, `translatorId`). Several translations of the same passage and language are expected, not a conflict; that is the comparison the feed shows.
- `Bookmark` and `Comment` point at a Translation. Composite unique on bookmarks: `(userId, translationId)`.
- Cascade deletes on all foreign keys.
- Prisma client is a singleton via `backend/lib/prisma.js` (uses `globalThis` to prevent multiple instances in dev)

Routes returning translations use `translationInclude` / `serializeTranslation` from `backend/lib/serialize.js`, which flattens Work + Passage + Translation into one object (`originalText`, `translatedText`, `sourceName`, `sourceLanguage`, plus `passageId`/`workId`). Group translations by `passageId`, never by comparing `originalText` strings.

**Migration history is not a source of truth.** The schema was evolved with `prisma db push`, so `prisma/migrations/20250723082325_init` does not describe the live database (it has TEXT ids, camelCase columns and a `books` table; production has SERIAL ids, snake_case and a `comments` table). A fresh environment cannot be built by replaying these migrations.

## Environment Variables

**Frontend** (`frontend/.env`):
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_API_ROOT_URL` - Backend URL (http://localhost:3001 for dev)

**Backend** (`backend/.env`):
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `DIRECT_URL` - Direct DB connection for migrations
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `GOOGLE_CLOUD_PROJECT_ID` - For Google Translate API
- `JWT_SECRET` - Signs session JWT tokens

## Deployment

Only the backend deploys automatically. There are no GitHub Actions workflows in this repo.

- **Backend**: Firebase App Hosting (`apphosting.yaml`), backend id `lingua-stagify-backend`. Deploys on push to `master` — runs `prisma generate`, then `prisma migrate deploy`, then `node server.js`. Pending migrations are applied to the production database on every deploy.
- **Frontend**: Firebase Hosting (SPA rewrite to `/index.html`). **Manual** — a push does nothing. Deploy with:
  ```bash
  cd frontend && npm run build && cd ..
  firebase deploy --only hosting
  ```
  A frontend change merged to `master` is not live until this is run.
