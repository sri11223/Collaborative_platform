# Scalability & Production Considerations

## Current Architecture

The application runs as a single Node.js process serving both HTTP API requests and WebSocket connections, backed by a single SQLite file. This is perfectly adequate for development, demos, and small team deployments.

This document outlines the changes necessary to scale the platform for larger workloads.

## Database Layer

### Migrating from SQLite to PostgreSQL

The Prisma schema is database-agnostic. Switching to PostgreSQL requires:

1. Change `provider` in `schema.prisma` from `"sqlite"` to `"postgresql"`.
2. Update `DATABASE_URL` to a PostgreSQL connection string.
3. Run `npx prisma migrate dev` to generate new migrations.
4. Prisma handles the SQL dialect differences automatically.

**Why PostgreSQL:**
- Concurrent write support (SQLite is single-writer).
- Full-text search via `tsvector` for task/comment search.
- JSONB columns for the `metadata` fields (currently stored as JSON strings).
- Row-level locking for safer concurrent updates.

### Connection Pooling

Use PgBouncer or Prisma Accelerate to pool connections. A typical Node.js server can maintain 10-20 connections; pooling allows thousands of request-per-second throughput without exhausting database connections.

### Read Replicas

For read-heavy workloads (activity feeds, notification counts, search):
- Set up one or more PostgreSQL read replicas.
- Route `GET` requests to replicas, `POST/PUT/DELETE` to the primary.
- Prisma supports this through its `$extends` API or by using separate client instances.

### Table Partitioning

High-volume tables to consider partitioning:

| Table | Partition Strategy | Reasoning |
|-------|-------------------|-----------|
| Activity | By `createdAt` (monthly) | Audit logs grow indefinitely |
| Notification | By `createdAt` (monthly) | Old notifications are rarely queried |
| DirectMessage | By `createdAt` (monthly) | Message history accumulates quickly |

## Application Layer

### Horizontal Scaling

To run multiple server instances behind a load balancer:

```
                    ┌──────────────┐
                    │  Load        │
                    │  Balancer    │
                    │  (nginx)     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌─────────┐ ┌─────────┐ ┌─────────┐
         │ Node.js  │ │ Node.js  │ │ Node.js  │
         │ Server 1 │ │ Server 2 │ │ Server 3 │
         └────┬─────┘ └────┬─────┘ └────┬─────┘
              │            │            │
              └────────────┼────────────┘
                           ▼
                    ┌──────────────┐
                    │    Redis     │
                    │  (pub/sub +  │
                    │   sessions)  │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    └──────────────┘
```

Key requirements:

1. **Socket.IO Redis Adapter** — `@socket.io/redis-adapter` shares room state across instances. Events emitted on Server 1 reach clients on Server 2.
2. **Sticky sessions** — The load balancer must route WebSocket upgrade requests to the same server (nginx `ip_hash` or cookie-based affinity).
3. **Stateless JWT** — Already in place. No server-side session store needed.

### Caching

Introduce Redis for frequently-read, rarely-changed data:

| Data | Cache Strategy | TTL |
|------|---------------|-----|
| User profile | Cache-aside | 5 min |
| Board member list | Cache-aside, invalidate on member change | 2 min |
| Notification unread count | Write-through (update on notification create/read) | Real-time |
| Workspace list | Cache-aside | 5 min |

Cache invalidation happens in controllers alongside the Socket event emission — when a board member is added, invalidate the member list cache and emit the `member:added` event.

### Background Jobs

Move heavy or non-urgent work off the request path:

| Job | Trigger | Tool |
|-----|---------|------|
| Email notifications | Task assignment, invitation created | BullMQ + Redis |
| Invitation expiry cleanup | Daily cron | node-cron or BullMQ repeatable |
| Activity log cleanup | Weekly cron | BullMQ |
| Report generation | User request | BullMQ |

### Rate Limiting

Add `express-rate-limit` with Redis store:

```typescript
// Auth endpoints: 10 req/min per IP
// API endpoints: 100 req/min per user
// File uploads: 5 req/min per user
```

## Real-Time Sync at Scale

### Current Approach
Last-write-wins with full-refresh on reconnect. Simple, no data loss for current patterns.

### Operational Transform / CRDT (Future)

For true collaborative editing (e.g., multiple users editing a task description simultaneously):

- **Yjs** — CRDT library that integrates with TipTap for real-time collaborative document editing.
- A Yjs server (`y-websocket`) can run alongside the main Socket.IO server.
- Task descriptions and documents would use Yjs for conflict-free merging.

### Event Sourcing (Future)

Instead of storing only the current state, store every mutation as an event:

```
TaskCreated → TaskTitleUpdated → TaskMoved → TaskAssigned → ...
```

Benefits:
- Perfect audit trail.
- Ability to replay or undo operations.
- Can rebuild any point-in-time state.

Trade-off: More complex querying (need projections/materialized views).

## Frontend Optimization

### Code Splitting

Already implemented via React.lazy. Each route loads its own chunk. Further gains from:
- Dynamic imports for heavy components (TipTap editor, date picker).
- Splitting the vendor bundle (React, Socket.IO, Zustand stay in a shared chunk).

### Asset CDN

In production, serve the Vite build output through a CDN (CloudFront, Cloudflare). The hashed filenames already support aggressive caching.

### Service Worker

Add a service worker for:
- Offline-capable task viewing (read-only).
- Push notifications for mentions and assignments.
- Background sync for actions taken offline.

## Monitoring & Observability

For production readiness:

| Concern | Tool |
|---------|------|
| Application metrics | Prometheus + Grafana |
| Error tracking | Sentry |
| Request tracing | OpenTelemetry |
| Log aggregation | ELK stack or Datadog |
| Uptime monitoring | Uptime Robot or Pingdom |

### Key Metrics to Track

- API response times (p50, p95, p99)
- WebSocket connection count
- Database query latency
- Error rates by endpoint
- Active user count (DAU/MAU)

## Deployment

### Docker

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

### CI/CD Pipeline

```
Push to main → Lint + Type check → Run tests → Build Docker image → Deploy
```

GitHub Actions or any CI platform can run:
1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm test`
4. `docker build -t taskflow-api .`
5. Push to registry and deploy to Kubernetes / ECS / Railway.

## Summary

The current architecture is intentionally simple — fit for the scope of this project. Each scaling concern maps to a well-understood solution. The layered design (controllers, middleware, Prisma) makes these upgrades additive rather than requiring a rewrite.
