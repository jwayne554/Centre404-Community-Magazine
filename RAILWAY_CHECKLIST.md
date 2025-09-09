# Railway Configuration Checklist & Diagnostics

## 🔴 CRITICAL: Check These in Railway Dashboard

### 1. Environment Variables (Settings → Variables)
You MUST have these set:

```
DATABASE_URL = [Auto-set by Railway when PostgreSQL is added]
JWT_SECRET = any-secret-key-here-change-this-123456
NEXT_PUBLIC_APP_URL = https://[your-app-name].railway.app
NODE_ENV = production
```

**⚠️ If DATABASE_URL is missing:**
- Click "New" → "Database" → "Add PostgreSQL" in your Railway project
- Railway will automatically add DATABASE_URL to your app

### 2. Check Railway Logs
In Railway dashboard → Your App → View Logs

Look for these specific messages:
```
POST /api/submissions - Request received
Request body: {...}
Creating submission with data: {...}
Failed to create submission - Full error: [THIS WILL SHOW THE ACTUAL ERROR]
```

### 3. Database Migration Status
Check if migrations ran by looking for this in deploy logs:
```
Prisma schema loaded from prisma/schema.prisma
```

If you see this error:
```
error: Environment variable not found: DATABASE_URL
```
Then DATABASE_URL is not set!

## 🧪 Quick Tests to Run

### Test 1: Check if API is reachable
Open: `https://[your-app].railway.app/api/submissions?status=APPROVED`

Should return:
```json
{
  "submissions": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

If you get 404 → API routes not deployed
If you get 500 → Database connection issue

### Test 2: Check Application Health
Open: `https://[your-app].railway.app/`

- Can you see the main page? ✓
- Can you click "Contribute"? ✓
- When you submit, what exact error do you see?

## 🔍 Common Issues & Fixes

### Issue 1: "Cannot connect to database"
**Fix:** Add PostgreSQL in Railway (New → Database → PostgreSQL)

### Issue 2: "Relation does not exist"
**Fix:** Migrations didn't run. Redeploy after ensuring DATABASE_URL is set.

### Issue 3: "500 Error but no details"
**Fix:** Check Railway logs for the actual error message.

## 📋 What to Send Me

Please provide:
1. Screenshot of Railway Variables tab
2. Copy of the error from Railway logs when you click submit
3. Result of visiting `/api/submissions?status=APPROVED`
4. Your Railway app URL

## 🚀 Emergency Fix Script

If nothing else works, try this in Railway:

1. Go to your app service → Settings → Deploy
2. Add this as "Railway Command":
```
npx prisma db push --accept-data-loss && npm start
```
3. Redeploy

This forces the database schema to be created.

## 🎯 Most Likely Issue

Based on the 500 error pattern, the most likely issue is:

**DATABASE_URL is not connecting to PostgreSQL**

Either:
- PostgreSQL isn't added to your Railway project
- DATABASE_URL isn't set
- Migrations haven't run
- PostgreSQL credentials are wrong

Check Railway logs for the EXACT error when you submit!