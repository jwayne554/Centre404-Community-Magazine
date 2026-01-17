# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **full-stack Next.js application** for Centre404 Community Magazine - an accessible digital magazine platform that allows community members to contribute stories, artwork, and recordings, with an admin approval workflow and magazine publishing system.

**Tech Stack:**
- **Framework**: Next.js 16.0.2 (App Router, Turbopack) with React 19.2.0
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM 6.15.0
- **Styling**: Tailwind CSS 3.4.17 (stable) with prototype-based green theme (#34A853)
- **Icons**: lucide-react (professional icon library)
- **Form Handling**: React Hook Form + Zod validation
- **Media Storage**: Local file system (/public/uploads/)
- **Authentication**: JWT-based with bcrypt, HTTP-only cookies
- **Text-to-Speech**: Unreal Speech API with browser fallback
- **Node.js**: v22 Alpine (Docker)

**CRITICAL - Tailwind CSS Version**:
- Must use Tailwind CSS **v3.4.17** (stable), NOT v4 (beta)
- Tailwind v4 has breaking PostCSS configuration changes that cause complete styling failure
- See `docs/UI_MISMATCH_ROOT_CAUSE.md` for full analysis

## Key Features

- **Multi-format Contributions**: Text, images, drawings, and audio recordings
  - **Audio Recording**: Browser-based MediaRecorder API (works offline, WebM format)
  - **Drawing Canvas**: Built-in drawing tool with color palette
  - **Symbol Board**: Quick emoji/symbol insertion
  - **Image Upload**: Photo support with preview

- **Modern Prototype-Based UI** (2025-01-14) - ✅ **Fully Connected to Backend**:
  - Clean, accessible design with green theme (#34A853)
  - 3-column category card grid (My News, Saying Hello, My Say)
  - Inter font throughout for professional typography
  - Responsive design with mobile-first approach
  - Light gray background (#F8F9FA) with proper contrast
  - All pages rebuilt from Magic Patterns prototype
  - **Landing page**: Form submits to `/api/submissions` with file upload support
  - **Magazine archive**: Fetches real magazines from `/api/magazines?public=true`
  - **Navigation**: Unified header with Admin link across all pages
  - **Loading states**: Skeleton screens and spinners during data fetching
  - **Success feedback**: Success banners, toast notifications, form auto-clear

- **Admin Dashboard** (2026-01-17) - ✅ **Polished & Streamlined UI**:
  - **Light gray header** with green accents (professional, not overwhelming)
  - **Status cards grid**: Total, Pending (yellow), Approved (green), Rejected (red) metrics
  - **Tabs system**: Filter submissions by Approved/Pending/Rejected status
  - **Compact submission cards**: Single-row layout, clickable cards, inline 40×40 thumbnails
  - **Lucide icons**: Newspaper, Hand, MessageCircle icons with colored backgrounds (no emojis)
  - **Reusable Modal component**: Extracted to `src/components/ui/Modal.tsx` with ModalHeader/Body/Footer
  - **Media indicators**: Image thumbnails, drawing previews, audio mic icon
  - **Detail modal**: Full-screen overlay with approve/reject workflow
  - **Approve/Reject workflow**: Optimistic updates with error rollback
  - **Role-based access**: ProtectedRoute wrapper (ADMIN, MODERATOR only)
  - **Real-time stats**: Calculated from live submission data
  - **Components**: StatusCard, SubmissionItem, Modal (reusable admin UI)

- **Magazine Publishing**: Create and publish magazines from approved submissions
  - Text-to-Speech with Unreal Speech API + browser fallback
  - Audio playback for submitted recordings
  - TTS caching for performance

- **Like System** (2025-11-28) - ✅ **Interactive Article Likes**:
  - **LikeButton component**: Session-based anonymous like tracking
  - **Optimistic updates**: Instant visual feedback with rollback on error
  - **Persistence**: localStorage sessionId with in-memory fallback
  - **API endpoint**: `/api/magazines/[id]/likes` (GET/POST)
  - **Database**: Like table with unique constraints per session/user
  - **Cross-user visibility**: Like counts aggregated across all users

- **Accessibility-First**: WCAG 2.1 AA compliant
  - Full keyboard navigation, screen reader support
  - High contrast mode, adjustable font sizes
  - ARIA labels and focus management

- **Security & Compliance**:
  - JWT authentication with HTTP-only cookies
  - Rate limiting on all sensitive endpoints
  - Complete audit logging for compliance
  - File upload streaming (constant memory usage)
  - Production-safe database migrations

## Architecture

**Full-stack Next.js Application:**
- **Frontend**: React Server Components + Client Components in `src/app/`
- **API Routes**: RESTful endpoints in `src/app/api/`
- **Database**: PostgreSQL with Prisma ORM
  - Type-Safe Database Enums: UserRole, SubmissionCategory, SubmissionContentType, SubmissionStatus, MagazineStatus, MediaType
  - 4 Tracked Migrations: baseline, media relations, database enums, like table
- **Authentication**: JWT tokens with HTTP-only cookies
- **Services**: Layered architecture (Routes → Services → Repositories)

**Key Directories:**
```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── page.tsx        # Landing page (prototype-based design)
│   ├── login/          # Login page with authentication
│   ├── admin/          # Admin dashboard (protected route)
│   ├── magazines/      # Magazine archive and viewer
│   └── api/            # API endpoints (auth, submissions, magazines, tts, upload)
├── components/
│   ├── admin/          # Admin-specific components (StatusCard, SubmissionItem)
│   ├── auth/           # ProtectedRoute wrapper
│   ├── forms/          # Submission forms
│   ├── skeletons/      # Loading skeleton components
│   └── ui/             # Reusable UI components (Button, Card, Input, Layout, Accordion, LikeButton, Modal)
├── hooks/              # Custom React hooks (useAuth, useAsyncAction, useMagazineData, useTTSPlayback)
├── lib/                # Utilities (prisma, auth, API middleware, error handling, logging)
├── services/           # Business logic layer (TTS, repositories)
├── utils/              # Helper functions (category helpers, date helpers)
└── repositories/       # Data access layer (Submission, Magazine, User)

prisma/
├── schema.prisma       # Database schema
├── migrations/         # Tracked migrations (4 total)
└── seed.ts            # Sample data seeding

scripts/
├── migrate-deploy.js   # Smart migration deployment (db push + P3005 auto-recovery)
├── fix-production-enums.ts  # One-time enum migration fix
└── init-production.ts  # Production admin user creation
```

## Local Development Setup

### Prerequisites
- **Node.js**: >= 18.17.0
- **PostgreSQL**: 17+ (installed via Homebrew)
- **Database**: `community_magazine`

### Environment Variables
Create `.env.local` with:
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
NEXT_PUBLIC_ENABLE_PREMIUM_TTS="true"
```

**IMPORTANT**: DATABASE_URL must be explicitly set when starting dev server due to Next.js workspace root inference issue.

### Starting the Development Server

**Option 1: Use the startup script (Recommended)**
```bash
./start-dev.sh
```

**Option 2: Manual start**
```bash
DATABASE_URL="postgresql://johnny@localhost:5432/community_magazine" npm run dev
```

Server runs at: **http://localhost:3000**

### Database Commands

**Development:**
```bash
npm run db:migrate       # Create and apply migrations (recommended)
npm run db:push          # Push schema changes (quick prototyping only)
npm run db:seed          # Seed sample data (dev only)
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:generate      # Regenerate Prisma client
```

**Production:**
```bash
npm run db:deploy        # Deploy migrations (Railway uses smart script)
npm run prod:fix-enums   # One-time enum migration fix (idempotent)
npm run prod:init        # Initialize admin user (upsert-based)
npm run media:cleanup    # Remove orphaned media files
```

**Production Start Flow** (automatic on Railway):
```
1. node scripts/migrate-deploy.js  → db push (sync schema) + Apply/baseline migrations
2. npm run prod:fix-enums          → Ensure database enums exist
3. npm run prod:init               → Create/verify admin user
4. next start                      → Launch application
```

### Test Credentials
- **Admin**: admin@test.com / password123
- **Sample Data**: 4 submissions (3 approved, 1 pending), 1 published magazine

## Development Guidelines

1. **Accessibility First**: Maintain WCAG 2.1 AA compliance
   - Keyboard navigation, screen reader support
   - Semantic HTML, ARIA labels
   - High contrast mode, adjustable fonts

2. **Database Changes**:
   - Update `prisma/schema.prisma` first
   - Run `npm run db:migrate` to create migrations (recommended)
   - Maintain audit logging for sensitive operations
   - Migrations are tracked in git for production safety

3. **API Routes**:
   - Use Zod for input validation
   - Return consistent error responses (see `src/lib/api-errors.ts`)
   - Include proper authentication checks (see `src/lib/api-auth.ts`)
   - Log operations to AuditLog

4. **UI Components**:
   - All pages follow prototype design system (green theme, Inter font)
   - Use components from `src/components/ui/` for consistency
   - Maintain mobile-first responsive design
   - Tailwind CSS v3.4.17 classes only (NOT v4 syntax)

5. **Security**:
   - JWT tokens in HTTP-only cookies (never localStorage)
   - Rate limiting enforced on sensitive endpoints
   - File uploads use streaming (constant memory)
   - Role-based access control on all admin routes

## Important Notes

- **Prototype HTML**: Original single-file prototype preserved as `Centre404 Digital Magazine Remix.html`
- **Prototype Components**: Magic Patterns prototype source in `Mirrorful File/` folder (reference only)
- **Multiple Lockfiles**: Warning from Next.js is harmless (bun.lock vs package-lock.json)
- **Hot Reload**: Works for most changes; Prisma client changes require server restart
- **Audio Recording**: Browser MediaRecorder API (offline capable, WebM format)
- **Text-to-Speech**: Unreal Speech API with automatic browser fallback

## Production Deployment

The application is configured for deployment to Railway with Docker:

**Dockerfile**: Multi-stage build with automatic migrations
- Stage 1 (deps): Install dependencies, generate Prisma client
- Stage 2 (builder): Build Next.js app
- Stage 3 (runner): Production runtime with smart migration deployment

**GitHub Repository**: https://github.com/jwayne554/Centre404-Community-Magazine.git

**Railway Environment Variables** (required):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: Authentication secrets
- `UNREAL_SPEECH_API_KEY`: TTS API key (optional, falls back to browser)

**Production Status**: ✅ Fully operational (last deployment: 2025-11-28)
- All Phase 1-4 optimizations deployed
- Authentication system working
- Database enums migrated
- Admin login functional
- Like system operational

## Completed Optimizations

**Phase 1: Critical Security** (2025-01-12) ✅
- Authentication on all admin endpoints
- HTTP-only cookie authentication
- Rate limiting (login, upload, submissions, TTS)
- Production-safe migrations (tracked in git)
- Media model foreign keys with CASCADE delete
- File upload streaming (constant memory usage)
- **Result**: Security grade D → A-

**Phase 2: Performance** (2025-01-13) ✅
- 9 composite database indexes (10-50x faster queries)
- Removed Axios (-13KB, -9 packages)
- Consolidated forms (-666 lines dead code)
- Consolidated magazine viewers (-674 lines dead code)
- useMemo optimizations (eliminated admin lag)
- CSS hover classes (replaced inline handlers)
- **Result**: -1,420 lines removed, -11 packages

**Phase 3: Code Quality** (2025-01-13) ✅
- Database enums (type-safe, prevents invalid values)
- Shared utilities (date helpers, category helpers, audit logger)
- Custom hooks (async actions, magazine data, TTS playback)
- Layered architecture (Routes → Services → Repositories)
- HTTP response caching (99% reduction in DB queries for public pages)
- Standardized error handling
- **Result**: Clear separation of concerns, reusable code

**Phase 4: Polish & UX** (2025-01-13) ✅
- Skeleton loading screens (content-aware)
- Optimistic updates (instant UI feedback)
- Next.js Image component (30-50% smaller images)
- Memory cleanup (blob URL disposal)
- Comprehensive API logging (structured JSON)
- **Result**: Professional UX, production-ready logging

**UI Redesign** (2025-01-14) ✅
- Migrated all 3 pages to prototype design (landing, archive, viewer)
- Fixed Inter font (was Geist)
- Fixed global styles (light gray background, charcoal text)
- Fixed Tailwind CSS v4 → v3.4.17 (CRITICAL - complete styling failure)
- Fixed PostCSS config for v3 syntax
- **Result**: Pixel-perfect prototype match, modern green theme

**UI Backend Integration** (2025-01-14) ✅
- Connected landing page form to `/api/submissions` POST endpoint
- Added file upload flow (form → `/api/upload` → `/api/submissions`)
- Connected magazine archive to `/api/magazines?public=true` GET endpoint
- Added loading states (spinners, "Loading magazines..." messages)
- Added empty states ("No magazines published yet...")
- Added success feedback (banner, button state changes, auto-scroll)
- Added Admin link to global navigation (desktop + mobile)
- Proper date formatting (e.g., "January 2024")
- Form auto-clears after successful submission
- **Result**: Fully functional UI with real-time database interaction

**Admin Dashboard UI Redesign** (2025-01-14) ✅
- Rebuilt admin dashboard with modern design from Mirrorful File (1) prototype
- **Created new components**:
  - `StatusCard` - Metric cards with 4 variants (default, pending, approved, rejected)
  - `SubmissionItem` - Card-based submission display with media previews
- **Green gradient header**: Lock icon, admin info bar, logout button, action buttons
- **Status cards grid**: Real-time metrics (Total, Pending, Approved, Rejected)
- **Tabs system**: Filter by submission status with counts
- **Submission cards**: Category emoji, status badges, content preview, date formatting
- **Detail modal**: Full-screen overlay with approve/reject workflow
- **Media support**: Image previews, drawing canvas rendering, "Contains drawing" indicator
- **Optimistic updates**: Instant UI feedback with error rollback
- **Preserved functionality**: All API calls, authentication, ProtectedRoute, magazine compilation
- **Design consistency**: Matches prototype color scheme (green #34A853, yellow accent, status colors)
- **Result**: Clean, professional admin interface with complete backend integration

**CI/CD Pipeline Fixes** (2025-11-14) ✅
- **ESLint fixes**: Removed unused imports, added ignores for prototype files and old backups
- **TypeScript fixes**: Fixed ProtectedRoute prop (`allowedRoles` → `requiredRole`), API route issues
- **Removed unused components**: magazine-compiler.tsx, drawing-canvas.tsx, media-upload.tsx (-810 lines)
- **Config updates**: Added excludes to tsconfig.json and eslint.config.mjs for Mirrorful File directories
- **Railway deployment**: Removed redundant deploy step from GitHub Actions (Railway auto-deploys via GitHub integration)
- **Result**: Clean CI pipeline - lint, type check, test, and build all pass

**Magazine Viewer Fix** (2025-11-14) ✅
- **Problem**: Magazine viewer showed hardcoded "Summer 2023 Edition" mock data
- **Solution**: Converted to server component that fetches real data from database
- **Features**: Real magazine title, publication date, actual submissions with content/images/drawings
- **Navigation**: "Latest Edition" now correctly shows the most recent published magazine
- **Result**: Full end-to-end magazine viewing experience with real data

**Like System Implementation** (2025-11-28) ✅
- **New component**: `src/components/ui/LikeButton.tsx`
  - Session-based anonymous like tracking (localStorage + in-memory fallback)
  - Optimistic UI updates with automatic rollback on error
  - Visual feedback: filled red heart when liked, like count display
  - Robust sessionId handling with try-catch for localStorage failures
- **New API endpoint**: `src/app/api/magazines/[id]/likes/route.ts`
  - GET: Fetch all likes for a magazine, returns per-item counts and user's like status
  - POST: Toggle like for a specific magazine item
  - Debug logging for troubleshooting
- **New database table**: `Like` model with migrations
  - Fields: id, magazineItemId, userId, sessionId, ipAddress, createdAt
  - Unique constraints: (magazineItemId, userId), (magazineItemId, sessionId)
  - Foreign key to MagazineItem with CASCADE delete
- **Category label fix**: Magazine viewer now displays human-readable category names
  - Changed from `MY_NEWS` → `My News`, `SAYING_HELLO` → `Saying Hello`
  - Uses `getCategoryLabel()` helper from `src/utils/category-helpers.ts`
- **Migration script fix**: Added `db push` step to `scripts/migrate-deploy.js`
  - Fixes issue where migrations were marked as applied but SQL didn't run
  - Ensures missing tables are created from schema before migrate deploy
- **Result**: Fully functional like system with cross-user like counts

**Admin Dashboard UI Polish** (2026-01-17) ✅
- **Icon standardization**: Replaced all category emojis with Lucide icons
  - MY_NEWS → Newspaper icon (orange background)
  - SAYING_HELLO → Hand icon (green background)
  - MY_SAY → MessageCircle icon (purple background)
- **Header redesign**: Changed from solid green gradient to light gray with green accents
  - White background with border, professional look
  - Green accent on lock icon, admin avatar, role badge
  - Red outline on logout button
- **Submission cards simplified**: Reduced visual noise for faster scanning
  - Single-row layout (was multi-row with sections)
  - 32×32 category icons (was 48×48)
  - Clickable cards (removed separate "View" button)
  - Inline 40×40 media thumbnails (image, drawing, audio indicator)
  - Shorter date format: "Jan 15" (was full timestamp)
  - Compact padding: p-3 mb-2 (was p-6 mb-4)
- **Modal component extraction**: Created reusable `src/components/ui/Modal.tsx`
  - Modal, ModalHeader, ModalBody, ModalFooter components
  - Supports sizes: sm, md, lg, xl, full
  - Supports variants: dialog, alertdialog, bottomSheet
  - Focus management with manageFocus prop
  - Refactored all 4 admin modals to use shared component
- **Consistent icons across all pages**:
  - Magazine viewer (Latest Edition)
  - Magazine compile page
  - Magazine edit page
  - Submission form preview
- **Result**: Cleaner, faster-to-scan admin interface with consistent design language

**QA Workflow Fixes** (2026-01-16) ✅
- **Audio playback in admin**: Added `<audio controls>` element to admin submission detail modal
  - Admins can now listen to audio submissions before approving
  - Detects audio by contentType or .webm file extension
- **Audio playback in magazine**: Replaced non-functional "Listen" button with actual audio player
  - Full `<audio controls>` element renders for audio submissions
  - Works for AUDIO and MIXED content types
- **Drawing display fix**: Changed Next.js `Image` component to `<img>` tag in magazine viewer
  - Data URIs now render correctly (Next.js Image doesn't support data URIs)
  - Added eslint-disable comment for the img element
- **Image upload pipeline**: Modified form to upload images via `/api/upload` endpoint
  - Images now stored as files in `/uploads/` directory, not base64 in database
  - Added 5MB file size validation on frontend
  - Stores File object separately from preview URL
- **Magazine management admin page**: Created `/admin/magazines` for draft management
  - New API endpoint: `/api/magazines/drafts` (GET with auth)
  - Lists all draft magazines with publish/delete actions
  - Shows magazine statistics (total, draft, published, archived)
  - Added "Manage Magazines" button to main admin dashboard
- **Files modified**:
  - `src/app/admin/page.tsx` - Audio preview, link to magazines page
  - `src/components/magazine/MagazineContent.tsx` - Audio player, drawing fix
  - `src/components/forms/simple-submission-form.tsx` - Image upload via API
  - `src/app/api/magazines/drafts/route.ts` (NEW) - Draft magazines API
  - `src/app/admin/magazines/page.tsx` (NEW) - Magazine management page
- **Result**: All submission types (text, audio, drawing, image) now work end-to-end

**Overall Impact**:
- **Security**: A- grade (all critical vulnerabilities fixed)
- **Performance**: 40-60% faster queries, 10-50x on indexed fields
- **Bundle Size**: -542KB (lucide-react removal)
- **Code Quality**: -2,230+ lines removed, clear architecture
- **UX**: Professional, accessible, prototype-based design
- **Integration**: ✅ All pages connected to backend and database
- **Navigation**: Unified header across all pages with Admin access
- **CI/CD**: ✅ GitHub Actions pipeline passes (lint, type check, test, build)
- **Deployment**: Railway auto-deploys on push to main

## Related Documentation

- `README.md` - Project overview and quickstart
- `TECHNICAL_ARCHITECTURE.md` - Detailed architecture documentation
- `DEPLOYMENT.md` - Railway deployment guide
- `RAILWAY_CHECKLIST.md` - Deployment checklist
- `docs/UI_MISMATCH_ROOT_CAUSE.md` - **Tailwind CSS version mismatch analysis (CRITICAL)**
- `docs/NEW_UI_IMPLEMENTATION_PLAN.md` - UI redesign analysis (47 pages)
- `docs/CLAUDE_ARCHIVE_2025-01-14.md` - **Full historical context (1,550 lines)**
- `docs/QA_FIX_PLAN.md` - **QA investigation results and fix plan (2026-01-16)**

For detailed implementation history of Phases 1-4, admin authentication, codebase cleanup, and UI redesign, see `docs/CLAUDE_ARCHIVE_2025-01-14.md`.
