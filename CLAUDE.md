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
```

### Database Commands

```bash
npm run db:push     # Push Prisma schema to database
npm run db:seed     # Seed with sample data
npm run db:studio   # Open Prisma Studio GUI
```

## Architecture

**Monorepo structure** using npm workspaces with Turborepo:
- `frontend/` - React 19 + Vite + Tailwind CSS
- `backend/` - Node.js custom API server with Prisma ORM

### Backend API Pattern

The backend uses a file-based routing system (`backend/dev-server.js`). Routes are determined by file paths:
- `backend/books/index.js` → `GET /books`
- `backend/books/[id].js` → `GET /books/:id` (dynamic route parameter parsed from filename)
- `backend/translations/book/[bookId].js` → `GET /translations/book/:bookId`

Each route file exports a default handler function receiving `(req, res)` with Express-like interface. Query params are in `req.query`, body in `req.body`.

### Frontend Structure

- **Routing**: React Router v7 in `App.jsx`
- **State Management**: React Context for auth (`contexts/AuthContext.jsx`)
- **API calls**: `lib/api.js` - axios client configured with `VITE_API_ROOT_URL`
- **Auth flow**: Google OAuth, token validated by backend, session stored in localStorage

### Database Schema (Prisma)

Core models: `User`, `Session`, `Book`, `Translation`, `Bookmark`
- Users own Books and Translations
- Translations belong to Books with language pairs
- Bookmarks can reference either a Translation or a Book

## Environment Variables

**Frontend** (`frontend/.env`):
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_API_ROOT_URL` - Backend URL (http://localhost:3001 for dev)

**Backend** (`backend/.env`):
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `GOOGLE_CLOUD_PROJECT_ID` - For Google Translate API
