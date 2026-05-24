# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ── Stage 2: build the production bundle ──────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# BACKEND_URL is only needed at runtime (proxy routes call it server-side),
# not at build time — so we don't pass it as a build arg.
RUN npm run build

# ── Stage 3: minimal runtime image (standalone output) ────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Bind on all interfaces so Docker port mapping works
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Next.js standalone puts everything needed into .next/standalone/
COPY --from=builder /app/.next/standalone ./
# Static assets live outside standalone and must be copied separately
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
