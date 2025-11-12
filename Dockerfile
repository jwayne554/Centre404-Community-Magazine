# Use Node 22 Alpine for smaller image and latest features
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies with clean slate
RUN rm -rf node_modules .next
RUN npm install

# Generate Prisma Client for PostgreSQL
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy everything needed for production
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Ensure migrations are copied (critical for production deployments)
COPY --from=builder /app/prisma/migrations ./prisma/migrations

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Run migrations and start server (npm start handles prisma migrate deploy)
CMD npm start