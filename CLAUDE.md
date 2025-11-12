# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **full-stack Next.js application** for Centre404 Community Magazine - an accessible digital magazine platform that allows community members to contribute stories, artwork, and recordings, with an admin approval workflow and magazine publishing system.

**Tech Stack:**
- **Framework**: Next.js 15.5.2 (App Router) with React 19
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM 6.15.0
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.8
- **Form Handling**: React Hook Form + Zod validation
- **Media Storage**: Cloudinary (configured but optional)
- **Authentication**: JWT-based with bcrypt
- **Text-to-Speech**: Unreal Speech API with browser fallback

## Key Features

- **Multi-format Contributions**: Text, images, drawings, and audio recordings
  - **Audio Recording**: Browser-based MediaRecorder API (works offline, no external services)
  - **Drawing Canvas**: Built-in drawing tool with color palette
  - **Symbol Board**: Quick emoji/symbol insertion for enhanced communication
- **Admin Approval Workflow**: Review, approve/reject submissions with audit logging
  - **Media Preview**: View images, listen to audio recordings in admin dashboard
  - **Drawing Preview**: Full preview of user-submitted drawings
- **Magazine Publishing**: Create and publish magazines from approved submissions
  - **Text-to-Speech**: Natural voice playback using Unreal Speech API with automatic browser fallback
  - **Audio Playback**: Listen to submitted audio recordings in published magazines
- **Accessibility-First**: WCAG 2.1 AA compliant with high contrast mode, adjustable fonts, keyboard navigation, screen reader support
- **Audit Logging**: Complete tracking of all system changes for compliance
- **Role-based Access**: ADMIN, MODERATOR, and CONTRIBUTOR roles

## Architecture

**Full-stack Next.js Application:**
- **Frontend**: React Server Components + Client Components in `src/app/`
- **API Routes**: RESTful endpoints in `src/app/api/`
- **Database**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`)
- **Authentication**: JWT tokens with HTTP-only cookies
- **State Management**: Zustand stores in `src/stores/`
- **Services**: API abstraction layer in `src/services/`

**Key Directories:**
```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── page.tsx        # Landing page
│   ├── admin/          # Admin dashboard
│   ├── magazines/      # Magazine viewing
│   └── api/            # API endpoints (auth, submissions, magazines, health, tts, upload)
├── components/         # Reusable React components
│   └── forms/          # Submission forms (simple, enhanced)
├── features/           # Feature-specific modules
├── lib/                # Utilities (prisma client, auth helpers)
├── services/           # API service layer
│   └── tts.service.ts # Text-to-Speech service with caching and fallback
├── stores/             # Zustand state stores
├── types/              # TypeScript definitions
└── utils/              # Helper functions

prisma/
├── schema.prisma       # Database schema (User, Submission, Magazine, AuditLog, Media)
└── seed.ts            # Database seeding script

public/
└── uploads/            # User-uploaded media (images, audio recordings)
```

## Local Development Setup

### Prerequisites
- **Node.js**: >= 18.17.0
- **PostgreSQL**: 17+ (installed via Homebrew)
- **Database**: `community_magazine`

### Environment Variables
The app requires a `.env` or `.env.local` file with:
```bash
# Database
DATABASE_URL="postgresql://johnny@localhost:5432/community_magazine"

# Authentication
JWT_SECRET="test-jwt-secret"
JWT_REFRESH_SECRET="test-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Centre404 Community Magazine"
NODE_ENV="development"

# Text-to-Speech (Unreal Speech)
UNREAL_SPEECH_API_KEY="your-api-key-here"
NEXT_PUBLIC_ENABLE_PREMIUM_TTS="true"  # Set to "false" to use browser fallback only
```

**IMPORTANT**: Due to a Next.js workspace root inference issue with multiple lockfiles, the DATABASE_URL must be explicitly set when starting the dev server.

### Starting the Development Server

**Option 1: Use the startup script (Recommended)**
```bash
./start-dev.sh
```

**Option 2: Manual start with explicit DATABASE_URL**
```bash
DATABASE_URL="postgresql://johnny@localhost:5432/community_magazine" npm run dev
```

### Database Commands
```bash
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:generate  # Regenerate Prisma client
```

### Test Credentials
- **Admin**: admin@test.com / password123
- **Sample Data**: 4 submissions (3 approved, 1 pending)

## Development Guidelines

When modifying this application:

1. **Accessibility First**: Maintain WCAG 2.1 AA compliance. All features must support:
   - Keyboard navigation
   - Screen readers (semantic HTML, ARIA labels)
   - High contrast mode
   - Adjustable font sizes
   - Focus management

2. **Database Changes**:
   - Always update `prisma/schema.prisma` first
   - Run `npm run db:push` to apply changes
   - Update TypeScript types if needed
   - Maintain audit logging for sensitive operations

3. **API Routes**:
   - Follow RESTful conventions
   - Use Zod for input validation
   - Return consistent error responses
   - Include proper authentication checks
   - Log important operations to AuditLog

4. **Authentication**:
   - JWT tokens stored in HTTP-only cookies
   - Refresh token rotation implemented
   - Role-based access control (ADMIN, MODERATOR, CONTRIBUTOR)
   - See `src/lib/auth.ts` and `src/middleware.ts`

5. **State Management**:
   - Use Zustand stores for client-side state
   - Server components for data fetching
   - Minimize client-side JavaScript

6. **Environment Setup**:
   - PostgreSQL service must be running (`brew services start postgresql@17`)
   - DATABASE_URL must be explicitly set (use `start-dev.sh`)
   - Environment variables loaded from `.env.local` and `.env`

## Important Notes

- **Original HTML Version**: The original single-file HTML prototype is preserved as `Centre404 Digital Magazine Remix.html` for reference
- **Multiple Lockfiles Warning**: Next.js detects multiple lockfiles (`/Users/johnny/bun.lock` and project `package-lock.json`). This is a known issue and doesn't affect functionality.
- **Database URL Issue**: Next.js may not load DATABASE_URL correctly from `.env` files due to workspace root inference. Always use `start-dev.sh` or set DATABASE_URL explicitly.
- **Health Check**: Visit `/api/health` to verify database connectivity and app status
- **Hot Reload**: Works for most changes, but Prisma client changes require server restart
- **Audio Recording**: Uses browser MediaRecorder API (works offline). Microphone permission required. Saves recordings as WebM format.
- **Text-to-Speech**: Unreal Speech API provides natural voices. Automatically falls back to browser Web Speech API if API key is missing or quota exceeded. No internet required for fallback.

## Deployment

The application is configured for deployment to Railway with Docker:
- **Dockerfile**: Multi-stage build with automatic migrations
- **GitHub Actions**: CI/CD pipeline (`.github/workflows/deploy.yml`)
- **Railway**: Primary deployment target
- See `DEPLOYMENT.md` and `RAILWAY_CHECKLIST.md` for details

## Related Documentation

- `README.md` - Project overview and setup
- `TECHNICAL_ARCHITECTURE.md` - Detailed architecture documentation
- `DEPLOYMENT.md` - Railway deployment guide
- `RAILWAY_CHECKLIST.md` - Deployment checklist
- `IMPLEMENTATION_PLAN.md` - Feature roadmap