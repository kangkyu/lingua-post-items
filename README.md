# Lingua Post - Translation Management Platform

A modern translation management platform built with React and Google Auth, designed to help users create, share, and discover translations in a collaborative environment.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Database](#database)
- [Authentication Setup](#authentication-setup)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

### Core Functionality
- **Translation Management**: Create and organize translations in themed books
- **Multi-language Support**: Support for 12+ languages including English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, and Hindi
- **Book Collections**: Organize translations into books with metadata, covers, and descriptions
- **Social Features**: Like, comment, and bookmark translations
- **Discovery Feed**: Browse and search public translations with filtering options
- **User Profiles**: Track translation activity and statistics

### Authentication
- **Google OAuth**: Secure authentication using Google accounts
- **User Management**: Profile management and session handling

### Current Implementation Status
✅ **Frontend Structure**: Complete React app with routing and UI components  
✅ **Authentication Framework**: Google Auth context and UI integration  
✅ **Backend API**: Node.js dev server with Prisma ORM and CORS support
✅ **Database Schema**: PostgreSQL with Prisma (Supabase integration)
✅ **Google Auth**: Complete implementation with backend token validation
✅ **Translation Service**: Google Translate API integration completed

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library

### Backend
- **Node.js Development Server** - Custom API server with CORS support
- **PostgreSQL** - Primary database (Supabase)
- **Prisma ORM** - Database toolkit and type safety
- **Google OAuth 2.0** - Authentication with backend token validation
- **Google Translate API** - Translation service integration
- **Google Auth Library** - Server-side token verification
- **Node.js 20** - Runtime environment

## Getting Started

### Prerequisites
- Node.js 20+
- npm (turbo for monorepo management)
- PostgreSQL database (Supabase recommended)

### Installation

1. **Clone and install dependencies**:
```bash
cd lingua-post-items
npm install
```

2. **Database setup**:
```bash
# Push schema to database
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

3. **Environment setup**:

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_ROOT_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```env
# Supabase Database
DATABASE_URL="your_supabase_database_url"
DIRECT_URL="your_supabase_direct_url"

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Cloud Translation
GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

4. **Start development servers**:
```bash
# Both frontend and API (recommended)
npm run dev:all

# Or run separately in different terminals:
npm run dev:frontend  # http://localhost:5173 (Terminal 1)
npm run dev:backend   # http://localhost:3001 (Terminal 2)

# Frontend only (if you don't need API)
npm run dev
```

### Development Commands
- `npm run dev` - Start frontend development server
- `npm run dev:all` - Start both frontend and backend servers
- `npm run dev:backend` - Start backend server only
- `npm run build` - Build for production
- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
frontend/src/
├��─ components/
│   ├── ui/           # Reusable UI components (Button, Card, Input, etc.)
│   └── Layout.jsx    # Main app layout with navigation
├── contexts/
│   └── AuthContext.jsx  # Authentication state management
├── pages/            # Route components
│   ├── Feed.jsx      # Translation discovery feed
│   ├── Books.jsx     # Book gallery
│   ├── BookDetail.jsx    # Individual book view
│   ├── Share.jsx     # Translation creation
│   ├── CreateBook.jsx    # Book creation
│   ├── Profile.jsx   # User profile
│   └── Bookmarks.jsx # Saved translations
├── lib/
│   ├── api.js        # API client functions
│   ├── auth.js       # Authentication utilities
│   ├── config.js     # Application configuration
│   └── utils.js      # Utility functions
└── App.jsx          # Main app component with routing

backend/
├── dev-server.js    # Development server with CORS support
├── auth/            # Authentication endpoints
│   ├── index.js     # Auth router
│   └── validate-token.js  # Google token validation
├── books/           # Book CRUD endpoints
│   ├── index.js     # List all books
│   └── [id].js      # Get book by ID
├── translations/    # Translation CRUD endpoints
│   ├── index.js     # List all translations
│   └── book/[bookId].js  # Get translations by book
├── translate.js     # Google Translate API endpoint
├── health.js        # Health check endpoint
├── debug.js         # Debug endpoint
├── lib/
│   ├── prisma.js    # Prisma client setup
│   └── index.js     # Library exports
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.js      # Database seeding script
└── .env             # Backend environment variables
```

## Development

### Local Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/*
- **Health Check**: http://localhost:3001/health
- **Debug**: http://localhost:3001/debug

### Troubleshooting Development Issues

#### If `npm run dev:all` fails:
Run the services separately:
```bash
# Terminal 1
npm run dev:frontend

# Terminal 2  
npm run dev:backend
```

#### If Backend dev fails:
The backend uses a custom Node.js development server:
1. Make sure you have database connection configured in `backend/.env`
2. Run `npm run db:push` to setup database schema
3. Start the server: `cd backend && node dev-server.js`
4. Check environment variables are properly loaded

## Database

### Schema Overview
The database uses PostgreSQL with Prisma ORM and includes:

- **Users**: BigInt ID, email, name, avatar, timestamps
- **Books**: BigInt ID, title, author, cover, description, language
- **Translations**: BigInt ID, original/translated text, languages, context, metadata
- **Bookmarks**: BigInt ID, user/translation/book relationships

### Database Commands
```bash
# Push schema changes
npm run db:push

# Generate Prisma client
npm run db:generate

# Open database browser
npm run db:studio

# Seed with sample data
npm run db:seed
```

## Authentication Setup

### Google OAuth Configuration

#### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google OAuth2 API"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (for development)
     - Add your production domain when deploying

#### Step 2: Configure Environment Variables

**Environment Variables (.env.local):**
```env
# Authentication
VITE_GOOGLE_CLIENT_ID="your_actual_google_client_id_here"
GOOGLE_CLIENT_ID="your_actual_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_actual_google_client_secret_here"

# Database
DATABASE_URL="your_postgresql_connection_string"
```

⚠️ **Important**: Never commit your actual Google credentials to version control.

#### Step 3: Testing Authentication
- Click "Sign In with Google"
- Should redirect to Google, then back to your app with user logged in

### Authentication Flow

1. User clicks "Sign In with Google"
2. Frontend generates Google OAuth URL directly
3. User is redirected to Google's OAuth consent screen
4. After consent, Google redirects back to `/auth/callback` with an authorization code
5. Frontend exchanges the code directly with Google for user info
6. User data is stored in localStorage for session management

## Deployment

### Deploy Frontend to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Deploy Backend to Firebase App Hosting

```bash
git push
```

## API Documentation

### System API
```bash
# Health check
GET /health

# Debug information
GET /debug
```

### Books API
```bash
# Get all books
GET /books

# Get specific book with translations
GET /books/:id
```

### Translations API
```bash
# Get all translations
GET /translations

# Get translations for specific book
GET /translations/book/:bookId

# Translate text
POST /translate
Content-Type: application/json
{
  "text": "Hello world",
  "targetLanguage": "es"
}
```

### Authentication API
```bash
# Validate Google ID token
POST /auth/validate-token
Content-Type: application/json
{
  "idToken": "google_id_token"
}
```

### Profile API
```bash
# Get current user profile with stats and recent translations
GET /profile
Authorization: Bearer <session_token>
```

## Troubleshooting

### Common Issues

#### "Google OAuth not configured" error
- Make sure `VITE_GOOGLE_CLIENT_ID` is set in environment variables
- Restart the development server after changing environment variables
- Check that environment variables start with `VITE_` prefix for frontend

#### Redirect URI mismatch
- Ensure the redirect URI in your Google Console matches exactly:
  - Development: `http://localhost:5173/auth/callback`
  - Production: `https://your-domain.com/auth/callback`

#### Database connection issues
- Verify `DATABASE_URL` is correctly formatted
- Ensure database is accessible from your environment
- Run `npm run db:push` to sync schema

#### API endpoints returning 404
- Ensure API functions are deployed correctly
- Check Vercel deployment logs
- Verify serverless function configuration

#### Build Issues
- Ensure all workspaces have `build` scripts
- Check `turbo.json` task dependencies
- Verify `package.json` workspaces configuration

#### CORS Issues
- CORS is configured in the development server
- For production, ensure proper CORS headers are set

#### Backend Server Issues
- Check that `backend/.env` file exists with proper environment variables
- Ensure `dotenv` is installed: `cd backend && npm install dotenv`
- Verify Prisma client is generated: `npm run postinstall`

## Next Steps

To complete the application, implement:

1. ✅ **Google Auth Setup**: OAuth credentials configured and backend validation complete
2. ✅ **Translation API**: Google Translate service integration complete
3. **File Upload**: Cover image upload functionality (AWS S3/Vercel Blob)
4. **Social Features**: Likes, comments, and user interactions
5. **Real-time Features**: Live updates for likes/comments
6. **Testing**: Unit and integration tests
7. **Performance**: Caching and optimization
8. **Monitoring**: Error tracking and analytics

## Contributing

This is a learning project demonstrating modern React patterns and full-stack architecture. The codebase follows:

- Component composition patterns
- Context for state management
- Tailwind for consistent styling
- Responsive mobile-first design
- RESTful API architecture
- Type-safe database operations with Prisma

## License

MIT License - feel free to use this project for learning and development.
