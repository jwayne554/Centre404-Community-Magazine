# Centre404 Community Magazine - Deployment Guide

## 🚀 Ready for Deployment!

Your prototype is ready to be deployed. Follow these steps to deploy to Railway:

## Prerequisites
1. GitHub account (create at https://github.com if needed)
2. Railway account (create at https://railway.app)

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository with:
   - Name: `Centre404-Community-Magazine`
   - Description: "Accessible community magazine app for Centre404"
   - Set as Public
   - Don't initialize with README (we already have code)

3. After creating, push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/Centre404-Community-Magazine.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select the `Centre404-Community-Magazine` repository
6. Railway will automatically detect the Next.js app

## Step 3: Configure Environment Variables

In Railway dashboard:
1. Click on your deployed service
2. Go to "Variables" tab
3. Add these environment variables:

```
DATABASE_URL=(Railway will auto-generate this when you add PostgreSQL)
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NODE_ENV=production
```

## Step 4: Add PostgreSQL Database

1. In Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically connect it and set DATABASE_URL

## Step 5: Run Database Migrations

1. In Railway service settings, go to "Deploy" tab
2. Add a deploy command:
```
npx prisma migrate deploy && npm run build
```

## Step 6: Set Up Automatic Deployments

Railway automatically deploys when you push to GitHub main branch.

## 🎉 Your App is Live!

Once deployed, Railway will provide you with a URL like:
`https://centre404-community-magazine.railway.app`

Share this with stakeholders for testing!

## Testing the Deployment

1. Visit the deployed URL
2. Test creating submissions
3. View them in the magazine
4. Test dark mode/accessibility features
5. Test on mobile devices

## Important Notes

- New submissions are auto-approved for testing
- For production, implement proper moderation
- Database is automatically backed up by Railway
- SSL/HTTPS is automatically configured

## Monitoring

- View logs in Railway dashboard
- Check deployment status
- Monitor database usage
- Set up error alerts if needed

## Support

- Railway docs: https://docs.railway.app
- Next.js deployment: https://nextjs.org/docs/deployment
- Prisma with Railway: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway

## Local Development After Deployment

To continue development:
```bash
npm run dev
```

To sync with production database (be careful!):
```bash
DATABASE_URL="your-production-url" npx prisma db pull
```

---

## Quick Deploy Alternative

If you prefer a one-click deploy:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/zapIbl)

(You'll need to update this template URL after creating a Railway template)