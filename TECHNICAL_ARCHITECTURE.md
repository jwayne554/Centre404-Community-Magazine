# Technical Architecture Document
## Centre404 Community Magazine Platform

**Last Updated:** 2025-11-11
**Version:** 1.0 (Production-Ready)
**Stack:** Next.js 15 + React 19 + PostgreSQL + Prisma

---

## System Overview

The Centre404 Community Magazine is a full-stack Next.js application built with accessibility as the primary design principle. The application uses a modern monolithic architecture with Server-Side Rendering (SSR), API Routes, and PostgreSQL for data persistence.

### Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Screen[Screen Reader]
    end

    subgraph "Next.js Application"
        SSR[Server Components]
        CSR[Client Components]
        API[API Routes]
        Middleware[Auth Middleware]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        PG[(PostgreSQL)]
    end

    subgraph "External Services"
        Cloudinary[Cloudinary CDN]
        Email[SMTP Email]
    end

    Browser --> SSR
    Browser --> CSR
    Browser --> API
    Screen --> Browser
    API --> Middleware
    Middleware --> Prisma
    Prisma --> PG
    API --> Cloudinary
    API --> Email
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI library with React Server Components |
| Next.js | 15.5.2 | Full-stack framework (App Router) |
| TypeScript | 5.x | Type safety and developer experience |
| Tailwind CSS | 4.x | Utility-first styling with accessibility |
| Radix UI | Latest | Accessible component primitives |
| Zustand | 5.0.8 | Client-side state management |
| React Hook Form | 7.62.0 | Form handling and validation |
| Zod | 4.1.5 | Schema validation |
| Lucide React | Latest | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 15.5.2 | RESTful API endpoints |
| Prisma | 6.15.0 | Type-safe ORM |
| PostgreSQL | 17+ | Primary database |
| bcrypt | Latest | Password hashing |
| jsonwebtoken | Latest | JWT authentication |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Railway | Hosting platform with PostgreSQL |
| Cloudinary | Media storage and CDN (optional) |
| GitHub Actions | CI/CD pipeline |
| Docker | Containerization |

---

## Application Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── error.tsx                 # Error boundary
│   ├── global-error.tsx          # Global error handler
│   ├── not-found.tsx             # 404 page
│   ├── globals.css               # Global styles
│   │
│   ├── admin/                    # Admin dashboard pages
│   │   ├── page.tsx              # Dashboard home
│   │   ├── submissions/          # Submission review
│   │   ├── magazines/            # Magazine management
│   │   └── layout.tsx            # Admin layout
│   │
│   ├── magazines/                # Public magazine viewing
│   │   ├── page.tsx              # Magazine list
│   │   └── [id]/                 # Individual magazine
│   │
│   └── api/                      # API endpoints
│       ├── auth/                 # Authentication
│       │   ├── login/
│       │   ├── register/
│       │   ├── logout/
│       │   └── refresh/
│       ├── submissions/          # CRUD operations
│       │   ├── route.ts          # List/Create
│       │   ├── [id]/             # Read/Update/Delete
│       │   └── [id]/approve/     # Admin actions
│       ├── magazines/            # Magazine operations
│       │   ├── route.ts
│       │   ├── [id]/
│       │   └── drafts/
│       ├── upload/               # File upload handling
│       │   └── route.ts
│       └── health/               # Health check endpoint
│           └── route.ts
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (Radix wrappers)
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   └── accessibility/            # A11y-specific components
│
├── features/                     # Feature modules
│   ├── submission/               # Submission feature
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── magazine/                 # Magazine feature
│   └── admin/                    # Admin feature
│
├── lib/                          # Core utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # Auth helpers (JWT, bcrypt)
│   └── utils.ts                  # General utilities
│
├── services/                     # API service layer
│   ├── api.ts                    # Axios instance
│   ├── auth.service.ts           # Auth API calls
│   ├── submission.service.ts     # Submission API calls
│   └── magazine.service.ts       # Magazine API calls
│
├── stores/                       # Zustand state stores
│   ├── auth.store.ts             # Authentication state
│   └── ui.store.ts               # UI state (accessibility settings)
│
├── types/                        # TypeScript definitions
│   ├── api.ts                    # API types
│   ├── models.ts                 # Database model types
│   └── forms.ts                  # Form types
│
├── utils/                        # Helper functions
│   └── validation.ts             # Zod schemas
│
└── middleware.ts                 # Next.js middleware (auth checks)

prisma/
├── schema.prisma                 # Database schema
└── seed.ts                       # Seed script
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Submission : creates
    User ||--o{ Magazine : creates
    User ||--o{ AuditLog : performs
    Submission ||--o{ MagazineItem : contains
    Magazine ||--o{ MagazineItem : includes
    Submission ||--o{ Media : has

    User {
        uuid id PK
        string email UK
        string name
        string password
        enum role
        json accessibilityPrefs
        datetime createdAt
    }

    Submission {
        uuid id PK
        uuid userId FK
        enum category
        string title
        text content
        enum status
        text imageUrl
        text audioUrl
        text drawingData
        datetime createdAt
        datetime reviewedAt
        uuid reviewedBy FK
    }

    Magazine {
        uuid id PK
        uuid createdBy FK
        string title
        text description
        string slug UK
        enum status
        datetime publishedAt
    }

    MagazineItem {
        uuid id PK
        uuid magazineId FK
        uuid submissionId FK
        int displayOrder
    }

    Media {
        uuid id PK
        uuid submissionId FK
        enum type
        string url
        int size
        string metadata
    }

    AuditLog {
        uuid id PK
        uuid userId FK
        string action
        string entityType
        uuid entityId
        json changes
        datetime timestamp
    }
```

### Key Schema Details

**User Model:**
- Supports multiple roles: ADMIN, MODERATOR, CONTRIBUTOR
- Stores accessibility preferences as JSON
- Bcrypt-hashed passwords
- Nullable email (supports anonymous contributors)

**Submission Model:**
- Multi-format content (text, image, audio, drawing)
- Status workflow: PENDING → APPROVED/REJECTED
- Soft-delete support (deletedAt field)
- Admin review tracking

**Magazine Model:**
- Draft and published states
- URL-friendly slugs
- Ordered items via MagazineItem junction table

**AuditLog Model:**
- Compliance and tracking
- Records all sensitive operations
- JSON change tracking

---

## Authentication & Authorization

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Prisma
    participant DB

    Client->>API: POST /api/auth/login {email, password}
    API->>Prisma: findUnique(email)
    Prisma->>DB: SELECT * FROM User
    DB-->>Prisma: User data
    Prisma-->>API: User object
    API->>API: bcrypt.compare(password)
    API->>API: jwt.sign({userId, role})
    API-->>Client: {accessToken, refreshToken} + HTTP-only cookies

    Note over Client,API: Subsequent requests

    Client->>API: GET /api/submissions (with JWT cookie)
    API->>API: Middleware: verifyToken(JWT)
    API->>API: Check role permissions
    API->>Prisma: findMany()
    Prisma->>DB: SELECT * FROM Submission
    DB-->>Client: Submissions data
```

### Token Strategy

- **Access Token**: Short-lived (15 min), stored in HTTP-only cookie
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie
- **Rotation**: Refresh tokens are rotated on each use
- **Revocation**: Logout clears cookies and invalidates tokens

### Authorization Levels

| Role | Permissions |
|------|------------|
| **ADMIN** | Full access: create, read, update, delete all entities |
| **MODERATOR** | Approve/reject submissions, create magazines |
| **CONTRIBUTOR** | Create submissions, view own submissions |

### Middleware Protection

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')

  // Public routes
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect('/login')
  }

  try {
    const decoded = verifyToken(token.value)

    // Role-based checks
    if (isAdminRoute(request.nextUrl.pathname)) {
      if (decoded.role !== 'ADMIN') {
        return NextResponse.redirect('/unauthorized')
      }
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect('/login')
  }
}
```

---

## API Design

### RESTful Conventions

All API routes follow REST principles:

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/register` | New user registration | Public |
| POST | `/api/auth/logout` | User logout | Authenticated |
| POST | `/api/auth/refresh` | Refresh access token | Authenticated |
| GET | `/api/submissions` | List submissions | Authenticated |
| POST | `/api/submissions` | Create submission | Authenticated |
| GET | `/api/submissions/:id` | Get single submission | Authenticated |
| PATCH | `/api/submissions/:id` | Update submission | Owner/Admin |
| DELETE | `/api/submissions/:id` | Delete submission | Owner/Admin |
| PATCH | `/api/submissions/:id/approve` | Approve submission | Admin/Mod |
| PATCH | `/api/submissions/:id/reject` | Reject submission | Admin/Mod |
| GET | `/api/magazines` | List published magazines | Public |
| POST | `/api/magazines` | Create magazine | Admin |
| GET | `/api/magazines/:id` | Get magazine details | Public |
| PATCH | `/api/magazines/:id` | Update magazine | Admin |
| POST | `/api/magazines/:id/publish` | Publish magazine | Admin |
| POST | `/api/upload` | Upload media file | Authenticated |
| GET | `/api/health` | Health check | Public |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Validation with Zod

All API endpoints use Zod for input validation:

```typescript
import { z } from 'zod'

const submissionSchema = z.object({
  category: z.enum(['MY_NEWS', 'SAYING_HELLO', 'MY_SAY']),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  drawingData: z.string().optional()
})

// Usage in API route
export async function POST(request: Request) {
  const body = await request.json()
  const validated = submissionSchema.parse(body) // Throws if invalid
  // ... proceed with validated data
}
```

---

## Frontend Architecture

### Server vs Client Components

**Server Components (Default):**
- Page layouts
- Data fetching components
- Static content rendering

**Client Components ('use client'):**
- Interactive forms
- State management
- Event handlers
- Drawing canvas
- Audio recorder

### State Management Strategy

**Server State (Database):**
- Fetched via Server Components or API routes
- No client-side caching (rely on Next.js cache)

**Client State (Zustand):**
```typescript
// stores/auth.store.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}))

// stores/ui.store.ts
export const useUIStore = create<UIState>((set) => ({
  highContrast: false,
  fontSize: 'medium',
  toggleHighContrast: () => set((state) => ({
    highContrast: !state.highContrast
  }))
}))
```

### Accessibility Implementation

**WCAG 2.1 AA Compliance Checklist:**

✅ **Semantic HTML**: All components use proper HTML5 elements
✅ **ARIA Labels**: All interactive elements have descriptive labels
✅ **Keyboard Navigation**: Full keyboard support with visible focus indicators
✅ **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
✅ **Screen Reader Support**: Tested with NVDA and VoiceOver
✅ **Focus Management**: Logical tab order and focus traps in modals
✅ **Error Identification**: Clear error messages with suggestions
✅ **Adjustable Text**: Font size controls (small, medium, large)
✅ **High Contrast Mode**: Toggle for enhanced visibility

**Example Accessible Component:**
```tsx
<button
  onClick={handleSubmit}
  aria-label="Submit your story"
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
  disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? (
    <>
      <span className="sr-only">Submitting...</span>
      <Spinner aria-hidden="true" />
    </>
  ) : (
    'Submit Story'
  )}
</button>
```

---

## Deployment Architecture

### Railway Deployment

**Environment:**
- **Platform**: Railway (managed PostgreSQL + web service)
- **Region**: us-west (configurable)
- **Scaling**: Vertical scaling (configurable memory/CPU)

**Deployment Flow:**
```mermaid
graph LR
    Git[GitHub Push] --> Actions[GitHub Actions]
    Actions --> Build[Docker Build]
    Build --> Test[Run Tests & Lint]
    Test --> Deploy[Railway CLI Deploy]
    Deploy --> Migrate[Prisma Migrate]
    Migrate --> Start[Next.js Start]
    Start --> Health[Health Check]
    Health --> Live[Production]
```

### Docker Configuration

```dockerfile
# Multi-stage build
FROM node:18-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start command (includes migration)
CMD ["npm", "start"]
```

### Environment Variables

**Required for Production:**
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="production-secret-key"
JWT_REFRESH_SECRET="production-refresh-secret"
NEXT_PUBLIC_APP_URL="https://magazine.centre404.org"
```

**Optional:**
```bash
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
SMTP_HOST="smtp.gmail.com"
SMTP_USER="..."
SMTP_PASS="..."
```

---

## Performance Considerations

### Optimization Strategies

1. **Server-Side Rendering**: Pages render on server for faster initial load
2. **Static Generation**: Public magazine pages use ISR (Incremental Static Regeneration)
3. **Image Optimization**: Next.js Image component with lazy loading
4. **Code Splitting**: Automatic route-based splitting
5. **Database Indexing**: Indexes on frequently queried fields
6. **Caching**: Next.js built-in cache for API routes

### Database Indexes

```prisma
model Submission {
  // ... fields

  @@index([userId])
  @@index([status])
  @@index([category])
  @@index([createdAt])
}

model Magazine {
  // ... fields

  @@index([slug])
  @@index([status])
  @@index([publishedAt])
}
```

---

## Security Measures

| Layer | Implementation |
|-------|---------------|
| **Authentication** | JWT with HTTP-only cookies, bcrypt password hashing |
| **Authorization** | Role-based access control (RBAC) |
| **Input Validation** | Zod schema validation on all endpoints |
| **SQL Injection** | Prevented by Prisma parameterized queries |
| **XSS** | React auto-escaping, CSP headers |
| **CSRF** | SameSite cookies, token validation |
| **Rate Limiting** | Configurable limits on API routes |
| **CORS** | Restricted to allowed origins |
| **Audit Logging** | All sensitive operations logged |

---

## Monitoring & Observability

### Health Check Endpoint

**GET `/api/health`**

Returns system status:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-11T07:00:00Z",
  "environment": {
    "NODE_ENV": "production",
    "DATABASE_URL": "SET ✓",
    "JWT_SECRET": "SET ✓"
  },
  "database": {
    "connected": true,
    "tablesExist": true,
    "submissionCount": 42
  }
}
```

### Metrics to Monitor

- Database connection health
- API response times
- Error rates
- Authentication failures
- Submission approval rate
- Magazine publication frequency

---

## Future Architecture Considerations

### Planned Enhancements

1. **Redis Caching**: Add Redis for session storage and API caching
2. **Message Queue**: Implement background job processing (email notifications)
3. **CDN**: CloudFlare or Fastly for global content delivery
4. **PDF Generation**: Server-side magazine PDF export
5. **WebSocket**: Real-time admin notifications
6. **GraphQL**: Consider GraphQL API for complex data fetching
7. **Microservices**: Split media processing into separate service

### Scalability Path

**Current Capacity**: 100-1,000 concurrent users
**Scaling Strategy**: Vertical → Horizontal (multiple Next.js instances behind load balancer)

---

## Conclusion

This architecture provides:
- **Accessibility-first** design for users with disabilities
- **Type-safe** development with TypeScript and Prisma
- **Secure** authentication and authorization
- **Scalable** foundation for growth
- **Maintainable** codebase with clear separation of concerns
- **Production-ready** deployment with Docker and Railway

For implementation details, see:
- [CLAUDE.md](./CLAUDE.md) - Development guidelines
- [README.md](./README.md) - Setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
