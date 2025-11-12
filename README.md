# Centre404 Community Magazine

A full-stack web platform enabling adults with learning disabilities to share their stories through an accessible digital magazine with admin approval workflows and magazine publishing features.

## 🎯 Project Overview

This platform allows community members to:
- Submit content in multiple formats (text, images, audio, drawings)
- Admin review and approval workflow
- Compile and publish digital magazines
- Access content through an accessible, WCAG 2.1 AA compliant interface
- View published magazines online

**Built with:** Next.js 15, React 19, TypeScript, PostgreSQL, Prisma, Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.17.0
- **PostgreSQL**: 17+ (via Homebrew on macOS)
- **Database**: `community_magazine`

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/community-magazine.git
cd community-magazine
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up PostgreSQL:**

**On macOS:**
```bash
# Install PostgreSQL
brew install postgresql@17

# Start PostgreSQL service
brew services start postgresql@17

# Create database
createdb community_magazine
```

**On other platforms:**
- Install PostgreSQL 17+
- Create a database named `community_magazine`

4. **Set up environment variables:**
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local and set your DATABASE_URL:
# DATABASE_URL="postgresql://your_username@localhost:5432/community_magazine"
#
# For local development, you can use the values from .env.example
```

5. **Set up the database:**
```bash
# Push schema to database
DATABASE_URL="postgresql://your_username@localhost:5432/community_magazine" npm run db:push

# Seed with sample data (optional)
DATABASE_URL="postgresql://your_username@localhost:5432/community_magazine" npm run db:seed
```

6. **Start the development server:**

**Option 1: Use the startup script (Recommended)**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Option 2: Manual start**
```bash
DATABASE_URL="postgresql://your_username@localhost:5432/community_magazine" npm run dev
```

7. **Access the application:**

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Credentials

After seeding the database, you can log in with:
- **Admin Account**: admin@test.com / password123
- **Sample Data**: 4 submissions (3 approved, 1 pending)

### Health Check

Verify your installation at: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 📁 Project Structure

```
community-magazine/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── page.tsx      # Landing page
│   │   ├── admin/        # Admin dashboard
│   │   ├── magazines/    # Magazine viewing pages
│   │   └── api/          # API endpoints
│   │       ├── auth/     # Authentication endpoints
│   │       ├── submissions/  # Submission management
│   │       ├── magazines/    # Magazine operations
│   │       ├── health/   # Health check endpoint
│   │       └── upload/   # File upload handling
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific modules
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (Prisma client, auth helpers)
│   ├── services/         # API service layer
│   ├── stores/           # Zustand state stores
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── public/               # Static assets
├── scripts/              # Utility scripts
├── start-dev.sh          # Development server startup script
└── Dockerfile            # Docker configuration for deployment
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack
- `./start-dev.sh` - Start dev server with correct DATABASE_URL (recommended)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - TypeScript type checking

### Database
- `npm run db:push` - Push schema changes to database (no migrations)
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Regenerate Prisma Client
- `npm run db:check` - Check database connectivity

### Production
- `npm run build` - Build for production
- `npm run start` - Start production server (includes db:push)

### Railway Deployment
- `npm run railway:install` - Install Railway CLI

## 🎨 Key Features

### Accessibility First (WCAG 2.1 AA Compliant)
- ✅ Screen reader support with semantic HTML
- ✅ High contrast mode
- ✅ Adjustable font sizes
- ✅ Keyboard navigation throughout
- ✅ Text-to-speech capabilities
- ✅ Focus management and ARIA labels

### Content Types
- ✍️ Text submissions with rich formatting
- 📷 Image uploads (via Cloudinary or local storage)
- 🎤 Audio recordings
- 🎨 Drawing canvas with color selection
- 😊 Symbol board for enhanced communication

### Admin Features
- 📋 Content moderation queue
- ✅ Approve/reject submissions with notes
- 📰 Magazine compilation and publishing
- 👥 User management with roles (ADMIN, MODERATOR, CONTRIBUTOR)
- 📊 Audit logging for compliance
- 🔍 Advanced filtering and search

### Technical Features
- ⚡ Server-side rendering with Next.js
- 🔐 JWT-based authentication with refresh tokens
- 🗄️ PostgreSQL database with Prisma ORM
- 🎯 Type-safe API with Zod validation
- 📱 Responsive design (mobile-first)
- 🐳 Docker support for deployment

## 🚢 Deployment

### Railway Deployment

This application is configured for deployment on Railway with PostgreSQL.

1. **Create Railway project and add PostgreSQL**
2. **Set environment variables** (see `.env.example`)
3. **Connect GitHub repository**
4. **Deploy automatically via GitHub Actions**

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [RAILWAY_CHECKLIST.md](./RAILWAY_CHECKLIST.md) for detailed instructions.

### Required Environment Variables

Production environment variables needed:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Authentication secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `NEXT_PUBLIC_APP_URL` - Production URL
- `CLOUDINARY_*` - Media storage credentials (optional)
- `SMTP_*` - Email service credentials (optional)

See `.env.example` for the complete list.

## 🔧 Troubleshooting

### Database Connection Issues

If you see "DATABASE_URL must start with protocol `postgresql://`" errors:

1. **Use the startup script:**
   ```bash
   ./start-dev.sh
   ```

2. **Or manually set DATABASE_URL:**
   ```bash
   DATABASE_URL="postgresql://username@localhost:5432/community_magazine" npm run dev
   ```

This is due to a Next.js workspace root inference issue with multiple lockfiles.

### PostgreSQL Not Running

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Start PostgreSQL
brew services start postgresql@17

# Check PostgreSQL status
brew services list | grep postgresql
```

### Port Already in Use

If port 3000 is already in use:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run E2E tests (when implemented)
npm run test:e2e

# Run accessibility tests (configured in CI/CD)
# Automated via GitHub Actions
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI assistant guidance and project context
- **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** - Detailed architecture documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Railway deployment guide
- **[RAILWAY_CHECKLIST.md](./RAILWAY_CHECKLIST.md)** - Deployment checklist
- **[docs/archive/](./docs/archive/)** - Archived planning documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and type checking (`npm run lint && npm run type-check`)
5. Format code (`npm run format`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Maintain WCAG 2.1 AA accessibility compliance
- Follow TypeScript best practices
- Write semantic HTML
- Test with keyboard navigation and screen readers
- Follow the patterns in `CLAUDE.md`

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built for **Centre404**, supporting adults with learning disabilities to share their voices with the community.

## 📞 Support

For questions or support:
- **Issues**: [GitHub Issues](https://github.com/your-org/community-magazine/issues)
- **Email**: support@centre404.org
- **Health Check**: http://localhost:3000/api/health (development)

## 🔐 Security

- JWT authentication with HTTP-only cookies
- Bcrypt password hashing
- Input validation with Zod
- CORS protection
- Rate limiting (configured)
- Audit logging for sensitive operations

## 🎯 Roadmap

- [ ] Email notifications
- [ ] PDF magazine generation
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Offline mode with PWA

---

**Made with ❤️ for accessible community storytelling**
