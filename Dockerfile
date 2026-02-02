FROM oven/bun:1.2.2-alpine AS base

# 1. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN bun install --frozen-lockfile
RUN bunx prisma generate

# 2. Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy URL for build (Prisma client generation might need it, or code import checks it)
ENV DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
ENV DEV_DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
RUN bun run build

# 3. Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
