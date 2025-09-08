# Centre404 Community Magazine

A web platform enabling adults with learning disabilities to share their stories through an accessible digital magazine.

## 🎯 Project Overview

This platform allows community members to:
- Submit content (text, images, audio, drawings)
- View published magazines online
- Access content in multiple accessible formats
- Print magazines for offline distribution

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- Cloudinary account (for media storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/community-magazine.git
cd community-magazine
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your database and service credentials
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed  # Optional: add sample data
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific modules
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   ├── services/        # API service layers
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── server/              # Backend API logic
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations

## 🎨 Key Features

### Accessibility First
- WCAG 2.1 AA compliant
- Screen reader support
- High contrast mode
- Adjustable font sizes
- Keyboard navigation
- Text-to-speech capabilities

### Content Types
- ✍️ Text submissions
- 📷 Image uploads
- 🎤 Audio recordings
- 🎨 Drawing canvas
- 😊 Symbol board for communication

### Admin Features
- Content moderation queue
- Magazine compilation tools
- User management
- Analytics dashboard

## 🚢 Deployment

### Railway Deployment

1. Create a Railway account and new project
2. Add PostgreSQL database
3. Set environment variables in Railway dashboard
4. Connect GitHub repository
5. Deploy with:
```bash
railway up
```

### Environment Variables

Key variables needed for production:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Authentication secret
- `CLOUDINARY_*` - Media storage credentials
- `NEXT_PUBLIC_APP_URL` - Production URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built for Centre404, supporting adults with learning disabilities to share their voices with the community.

## 📞 Support

For questions or support, please contact [support@centre404.org]
