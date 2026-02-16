# Backend Architecture

## Overview

The server is a Node.js application written in TypeScript. It uses Express for HTTP, Socket.IO for real-time communication, and Prisma as the ORM over SQLite.

## Directory Layout

```
backend/src/
├── config/
│   ├── index.ts          # Centralized env-based config (port, JWT secret, etc.)
│   └── swagger.ts        # OpenAPI 3.0.3 specification
├── controllers/          # Request handlers grouped by domain
│   ├── auth.controller.ts
│   ├── board.controller.ts
│   ├── list.controller.ts
│   ├── task.controller.ts
│   ├── label.controller.ts
│   ├── activity.controller.ts
│   ├── workspace.controller.ts
│   ├── invitation.controller.ts
│   ├── notification.controller.ts
│   ├── document.controller.ts
│   ├── message.controller.ts
│   └── favorite.controller.ts
├── middleware/
│   ├── auth.ts           # JWT verification, attaches req.user
│   ├── validate.ts       # express-validator result checking
│   └── errorHandler.ts   # Global error boundary
├── routes/
│   └── index.ts          # Route registration with validation rules
├── services/             # Business logic layer
│   ├── auth.service.ts
│   ├── board.service.ts
│   ├── list.service.ts
│   ├── task.service.ts
│   ├── label.service.ts
│   ├── activity.service.ts
│   ├── workspace.service.ts
│   ├── invitation.service.ts
│   ├── notification.service.ts
│   ├── document.service.ts
│   ├── message.service.ts
│   └── favorite.service.ts
├── socket/
│   └── index.ts          # Socket.IO setup (auth, rooms, events)
├── utils/
│   ├── errors.ts         # Custom error classes (AppError, NotFoundError, etc.)
│   └── jwt.ts            # Token sign / verify helpers
├── seed.ts               # Database seeding script
└── index.ts              # Application entry point
```

## Request Lifecycle

```
           ┌────────────────────────────────────┐
           │  Incoming HTTP Request              │
           └──────────┬─────────────────────────┘
                      ▼
           ┌──────────────────────┐
           │  Express Middleware   │
           │  (CORS → Helmet →    │
           │   Morgan → JSON)     │
           └──────────┬───────────┘
                      ▼
           ┌──────────────────────┐
           │  Route Matching      │
           │  /api/boards/:id     │
           └──────────┬───────────┘
                      ▼
           ┌──────────────────────┐
           │  Validation Chain    │
           │  express-validator   │
           │  → validate()        │
           └──────────┬───────────┘
                      ▼
           ┌──────────────────────┐
           │  Auth Middleware      │
           │  (if protected)      │
           │  → authenticate()    │
           └──────────┬───────────┘
                      ▼
           ┌──────────────────────┐
           │  Controller          │
           │  Business logic +    │
           │  Prisma queries      │
           └──────────┬───────────┘
                      ▼
           ┌──────────────────────┐
           │  JSON Response       │
           │  { success, data }   │
           └──────────────────────┘
```

If any middleware or controller throws, it falls through to the global `errorHandler`, which formats the response based on the error type.

## Middleware

### Authentication (`auth.ts`)

Extracts a Bearer token from the `Authorization` header, verifies it with `jsonwebtoken`, and populates `req.user` with `{ userId, email }`. Throws `UnauthorizedError` on failure.

### Validation (`validate.ts`)

A thin wrapper around `express-validator`. Each route defines a chain of validators (body, param, query), and the `validate` middleware checks the result. On failure, returns a 400 with field-level error messages.

Example route definition:

```typescript
router.post(
  '/boards',
  authenticate,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('workspaceId').notEmpty(),
  validate,
  boardController.create
);
```

### Error Handler (`errorHandler.ts`)

Catches both expected errors (`AppError` subclasses with HTTP status codes) and unexpected errors. In development, the original error message is returned; in production, a generic "Internal server error" is shown.

## Controllers

Controllers are plain functions that receive `(req, res, next)`. They:

1. Read validated input from `req.body`, `req.params`, `req.query`.
2. Run Prisma queries (create, findMany, update, delete).
3. Optionally emit Socket.IO events via `req.app.get('io')`.
4. Return a JSON envelope: `{ success: true, data: ... }`.

A dedicated **service layer** (`services/`) encapsulates business logic and Prisma queries. Controllers delegate to service classes, keeping route handlers thin. This separation makes it straightforward to unit-test business logic independently from HTTP concerns.

```
Controller  →  Service  →  Prisma Client  →  SQLite
```

Services are singletons exported from each file (e.g., `authService`, `boardService`). They throw custom `AppError` subclasses when validation fails, which the error handler middleware catches.

## Authentication Flow

1. **Signup**: Hash password with `bcryptjs` → store user → generate JWT → return token.
2. **Login**: Find user by email → compare hashed password → generate JWT → return token.
3. **Token**: JWT payload contains `{ userId, email }`, signed with `JWT_SECRET`, expires in 7 days.
4. **Protected routes**: Every request passes through `authenticate` middleware before reaching the controller.

## Socket.IO Integration

The HTTP server is shared between Express and Socket.IO. Socket connections authenticate using the same JWT (passed in `handshake.auth.token`).

Room structure:

| Room Pattern | Purpose |
|---|---|
| `user:<userId>` | Personal notifications, DM delivery |
| `board:<boardId>` | Board-level events (task changes, list updates) |

Controllers emit events after successful mutations:

```typescript
const io = req.app.get('io') as Server;
io.to(`board:${boardId}`).emit('task:created', task);
```

## Error Handling

Custom error classes extend a base `AppError`:

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)

These are thrown from controllers and caught by the error handler middleware.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `DATABASE_URL` | `file:./dev.db` | Prisma database connection |
| `JWT_SECRET` | `taskflow-secret-key` | JWT signing secret |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | `development` | Runtime environment |

## API Documentation

Swagger UI is served at `/api-docs` and the raw OpenAPI JSON at `/api-docs.json`. The spec is defined programmatically in `config/swagger.ts` to stay in sync with the actual route definitions.
