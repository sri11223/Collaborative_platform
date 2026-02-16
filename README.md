# TaskFlow — Real-Time Task Collaboration Platform

A production-ready, full-stack Kanban project management tool with real-time collaboration, workspaces, direct messaging, AI assistance, and a rich document editor. Built as a single-developer project demonstrating end-to-end full-stack proficiency.

> **Live Demo:** Frontend — [taskflow-collaborative-platform.vercel.app](https://taskflow-collaborative-platform.vercel.app) · Backend — [taskflow-api-mimm.onrender.com](https://taskflow-api-mimm.onrender.com)

---

## Quick Start (Local Development)

```bash
# 1. Clone
git clone https://github.com/sri11223/Collaborative_platform.git
cd Collaborative_platform

# 2. Backend
cd backend
npm install
cp .env.example .env          # defaults work out-of-the-box (SQLite)
npx prisma generate
npx prisma db push            # creates tables in local SQLite
npm run seed                  # seeds 3 users · 7 workspaces · 10 boards · 36 tasks
npm run dev                   # http://localhost:5000

# 3. Frontend (new terminal)
cd ../frontend
npm install
# create .env → VITE_API_URL=http://localhost:5000
echo VITE_API_URL=http://localhost:5000 > .env
npm run dev                   # http://localhost:5173
```

### Demo Credentials (pre-seeded)

| Name             | Email                          | Password  |
|------------------|--------------------------------|-----------|
| Sarah Johnson    | sarah.johnson@taskflow.demo    | Demo123!  |
| Mike Chen        | mike.chen@taskflow.demo        | Demo123!  |
| Emily Rodriguez  | emily.rodriguez@taskflow.demo  | Demo123!  |

All three accounts have pre-populated workspaces, boards, tasks with varied priorities, labels, and comments ready to explore.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Database Schema](#database-schema)
7. [API Contract](#api-contract)
8. [Real-Time Sync Strategy](#real-time-sync-strategy)
9. [Testing](#testing)
10. [Scalability Considerations](#scalability-considerations)
11. [Assumptions & Trade-offs](#assumptions--trade-offs)
12. [Environment Variables](#environment-variables)
13. [Deployment](#deployment)

---

## Features

### Core
- **Kanban Boards** — Create boards with multiple lists and cards. Drag-and-drop tasks between columns with instant position persistence.
- **Workspaces** — Group boards into team workspaces. Each workspace has its own member list and document library.
- **Task Management** — Assign priorities (low / medium / high / urgent), set due dates, attach labels, assign team members, and comment on tasks.
- **Real-Time Collaboration** — All board changes broadcast live via WebSocket. See teammate updates without refreshing.

### Collaboration
- **Board Invitations** — Invite users by email with a unique link. Invitees can accept, decline, or sign up through the invite page.
- **Direct Messages** — Real-time private messaging between workspace members with typing indicators and read receipts.
- **Activity Feed** — Tracks task creation, moves, assignments, and comments on each board with timestamps.
- **Notifications** — In-app notification center for task assignments, mentions, due reminders, and invitation alerts. Mark as read or bulk-clear.

### Productivity
- **My Tasks** — Cross-board view of every task assigned to you, grouped by board.
- **Planner** — Calendar-based timeline view of tasks by due date.
- **Favorites** — Star boards for quick access in the sidebar.
- **Documents** — Rich-text editor (TipTap) for meeting notes, specs, and documentation scoped to a workspace. Supports export to HTML/plain text.
- **AI Assistant** — Gemini-powered AI page for smart suggestions and task assistance.

### Platform
- **JWT Authentication** — Stateless token-based auth with signup, login, and profile management. DiceBear avatar generation.
- **Dark Mode** — Full light/dark theme toggle with system preference detection.
- **Responsive Layout** — Collapsible sidebar, mobile-friendly navigation.
- **Landing Page** — Animated hero with parallax effects and feature showcase.
- **Inline Editing** — Edit board titles and task details without opening modals.
- **Swagger API Docs** — Interactive API explorer served at `/api-docs`.

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | HTTP server & REST API |
| TypeScript | Type safety across the entire stack |
| Prisma | Type-safe ORM with migration support |
| SQLite / PostgreSQL | SQLite locally, PostgreSQL in production |
| Socket.IO | Real-time bidirectional events |
| JSON Web Token | Stateless authentication |
| bcryptjs | Password hashing (10 salt rounds) |
| express-validator | Request validation middleware |
| Swagger UI | Interactive API documentation |
| Helmet | Security headers |
| Morgan | HTTP request logging |
| Gemini AI | AI-powered task assistance |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework with concurrent features |
| Vite | Dev server & bundler |
| TypeScript | Type safety |
| TailwindCSS | Utility-first styling |
| Zustand | Lightweight state management (5 stores) |
| Socket.IO Client | Real-time WebSocket connection |
| @hello-pangea/dnd | Drag-and-drop (maintained fork of react-beautiful-dnd) |
| TipTap | ProseMirror-based rich-text editor |
| React Router v6 | Client-side routing (16 pages) |
| Axios | HTTP client with interceptors |
| Lucide React | Icon library |
| date-fns | Date formatting & manipulation |

---

## Project Structure

```
Collaborative_platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (17 models)
│   │   ├── seed.ts               # CLI seed script (npm run seed)
│   │   └── dev.db                # SQLite database (local dev)
│   ├── src/
│   │   ├── config/               # App config + Swagger OpenAPI spec
│   │   ├── controllers/          # Route handlers (12 controllers)
│   │   ├── middleware/            # Auth, validation, error handling
│   │   ├── routes/               # Route definitions + seed API
│   │   ├── lib/                  # Shared seedDatabase() function
│   │   ├── socket/               # Socket.IO room & event setup
│   │   ├── utils/                # JWT helpers, error classes
│   │   └── index.ts              # Entry point
│   ├── tests/
│   │   ├── globalSetup.ts        # Test DB bootstrap
│   │   ├── auth.test.ts          # 13 auth tests
│   │   └── api.test.ts           # 12 API tests
│   └── package.json
├── frontend/
│   └── src/
│       ├── api/                  # API client modules (8 service files)
│       ├── components/           # UI components by feature domain
│       │   ├── layout/           # AppSidebar, Header, Layout
│       │   ├── board/            # Board, List, Card components
│       │   ├── modals/           # Task detail, invite, create modals
│       │   └── ui/               # Reusable buttons, inputs, dropdowns
│       ├── lib/                  # Axios instance + Socket.IO client
│       ├── pages/                # 16 route-level pages
│       ├── store/                # Zustand stores (auth, board, workspace, notification, theme)
│       ├── types/                # TypeScript interfaces
│       └── App.tsx               # Route definitions + auth guards
├── docs/                         # Architecture documentation (6 files)
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── REALTIME_SYNC.md
│   └── SCALABILITY.md
└── README.md
```

---

## Frontend Architecture

### Routing (React Router v6)

```
/                   → LandingPage (public)
/login              → LoginPage (public)
/signup             → SignupPage (public)
/invite/:token      → InvitePage (public)
/dashboard          → DashboardPage (protected)
/board/:id          → BoardPage (protected)
/my-tasks           → MyTasksPage (protected)
/planner            → PlannerPage (protected)
/inbox              → InboxPage (protected)
/teams              → TeamsPage (protected)
/messages           → DirectMessagesPage (protected)
/docs               → DocsPage (protected)
/ai                 → AiPage (protected)
/settings           → SettingsPage (protected)
/home               → HomePage (protected)
```

Protected routes redirect to `/login` if no valid JWT exists in localStorage.

### State Management (Zustand)

| Store | Responsibilities |
|-------|-----------------|
| `authStore` | JWT token, user profile, login/signup/logout, token refresh |
| `boardStore` | Boards CRUD, lists, tasks, drag-and-drop position sync, stale-response prevention |
| `workspaceStore` | Workspace CRUD, member management, workspace switching |
| `notificationStore` | Notification list, mark read, bulk clear, real-time push |
| `themeStore` | Light/dark mode toggle with localStorage persistence |

### API Layer

All HTTP calls go through a shared Axios instance (`lib/axios.ts`) configured with:
- Base URL from `VITE_API_URL` env var
- JWT token injected via request interceptor
- 401 responses trigger automatic logout

### Real-Time Integration

The frontend establishes a single Socket.IO connection on login. Components subscribe to board-specific rooms. Incoming events trigger Zustand store updates, keeping the UI in sync without polling.

---

## Backend Architecture

### Middleware Pipeline

```
Request → Helmet → CORS → Morgan → JSON Parser → Route Handler
                                         │
                                    Auth Middleware (JWT verify)
                                         │
                                    Validation (express-validator)
                                         │
                                    Controller → Prisma → DB
                                         │
                                    Error Handler → Response
```

### Layered Architecture

| Layer | Responsibility |
|-------|---------------|
| **Routes** | Define endpoints, attach validators and auth middleware |
| **Controllers** | Parse request, call Prisma, format response, emit socket events |
| **Middleware** | `authMiddleware` verifies JWT and attaches `req.user`; `errorHandler` catches all thrown errors |
| **Prisma** | Type-safe database queries with relation loading |
| **Socket** | Room-based event broadcasting scoped to boards and users |

### Authentication Flow

```
Signup: POST /api/auth/register → hash password (bcrypt, 10 rounds) → create user → return JWT
Login:  POST /api/auth/login    → verify password → return JWT
Guard:  Authorization: Bearer <token> → verify → attach user to request
```

JWTs expire after 7 days (`JWT_EXPIRES_IN=7d`). The frontend stores the token in localStorage and attaches it to every API request.

### Error Handling

All controllers are wrapped in try-catch. Errors are normalized into a consistent JSON shape:

```json
{
  "success": false,
  "message": "Board not found",
  "error": "NOT_FOUND"
}
```

---

## Database Schema

### 17 Prisma Models

```
User ──< WorkspaceMember >── Workspace
User ──< BoardMember >── Board
User ──< TaskAssignee >── Task
User ──< Comment >── Task
User ──< Activity
User ──< Notification
User ──< DirectMessage (sender/receiver)
User ──< FavoriteBoard >── Board
User ──< Document >── Workspace
User ──< Invitation >── Board

Workspace ──< Board ──< List ──< Task
Board ──< Label ──< TaskLabel >── Task
```

### Entity-Relationship Overview

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **User** | email (unique, indexed), name, password, avatar | Owns workspaces, boards; member of boards/workspaces |
| **Workspace** | name, color, icon, ownerId | Has boards, members, documents |
| **WorkspaceMember** | workspaceId + userId (unique), role | Join table with role |
| **Board** | title, description, color, ownerId, workspaceId | Has lists, members, labels, activities, invitations |
| **BoardMember** | boardId + userId (unique), role | Join table with role |
| **List** | title, position, boardId | Ordered within board; has tasks |
| **Task** | title, description, position, priority, dueDate, listId | Has assignees, labels, comments, activities |
| **TaskAssignee** | taskId + userId (unique) | Many-to-many join |
| **Label** | name, color, boardId | Board-scoped; linked to tasks via TaskLabel |
| **TaskLabel** | taskId + labelId (unique) | Many-to-many join |
| **Comment** | content, taskId, userId | Threaded on tasks |
| **Activity** | type, description, boardId, userId, taskId?, metadata? | Audit log |
| **Invitation** | boardId, inviterId, inviteeEmail, token (unique), status, expiresAt | Pending/accepted/declined |
| **Notification** | type, title, message, read, userId, boardId?, taskId? | Real-time push |
| **Document** | title, content, workspaceId, createdBy | Rich-text docs |
| **DirectMessage** | content, senderId, receiverId, read | Private messaging |
| **FavoriteBoard** | userId + boardId (unique) | Quick-access bookmarks |

### Indexing Strategy

Every foreign key is indexed. Composite unique constraints on join tables (`@@unique([boardId, userId])`, etc.). Additional indexes on `createdAt`, `position`, `priority`, `email`, `token`, and `read` for query performance.

### Database Provider

- **Local development:** SQLite (`file:./dev.db`) — zero-config, portable
- **Production:** PostgreSQL on Render — connection string via `DATABASE_URL` env var
- **Schema sync:** `npx prisma db push` (no migration files needed for dev)

---

## API Contract

### 76 REST Endpoints across 14 resource groups

#### Authentication (3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user profile |

#### Users (3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/profile` | Update own profile |

#### Workspaces (7)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces` | List user's workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/:id` | Get workspace details |
| PUT | `/api/workspaces/:id` | Update workspace |
| DELETE | `/api/workspaces/:id` | Delete workspace |
| POST | `/api/workspaces/:id/members` | Add member |
| DELETE | `/api/workspaces/:id/members/:userId` | Remove member |

#### Boards (7)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | List boards (with ?workspaceId filter) |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/:id` | Get board with lists & tasks |
| PUT | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |
| POST | `/api/boards/:id/members` | Add board member |
| DELETE | `/api/boards/:id/members/:userId` | Remove board member |

#### Lists (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards/:boardId/lists` | Get lists for board |
| POST | `/api/boards/:boardId/lists` | Create list |
| PUT | `/api/lists/:id` | Update list |
| DELETE | `/api/lists/:id` | Delete list |
| PUT | `/api/lists/reorder` | Reorder lists |

#### Tasks (8)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lists/:listId/tasks` | Get tasks in list |
| POST | `/api/lists/:listId/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task details |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PUT | `/api/tasks/:id/move` | Move task between lists |
| PUT | `/api/tasks/reorder` | Reorder tasks within list |
| GET | `/api/tasks/my-tasks` | Get all tasks assigned to current user |

#### Task Assignees (2)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks/:id/assignees` | Assign user to task |
| DELETE | `/api/tasks/:id/assignees/:userId` | Unassign user |

#### Labels (6)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards/:boardId/labels` | Get board labels |
| POST | `/api/boards/:boardId/labels` | Create label |
| PUT | `/api/labels/:id` | Update label |
| DELETE | `/api/labels/:id` | Delete label |
| POST | `/api/tasks/:taskId/labels` | Attach label to task |
| DELETE | `/api/tasks/:taskId/labels/:labelId` | Detach label |

#### Comments (4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/:taskId/comments` | Get task comments |
| POST | `/api/tasks/:taskId/comments` | Add comment |
| PUT | `/api/comments/:id` | Edit comment |
| DELETE | `/api/comments/:id` | Delete comment |

#### Activities (2)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards/:boardId/activities` | Get board activity feed |
| POST | `/api/boards/:boardId/activities` | Log activity |

#### Invitations (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/boards/:boardId/invitations` | Create invitation |
| GET | `/api/invitations` | List user's invitations |
| GET | `/api/invitations/:token` | Get invitation by token |
| POST | `/api/invitations/:token/accept` | Accept invitation |
| POST | `/api/invitations/:token/decline` | Decline invitation |

#### Notifications (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |
| DELETE | `/api/notifications` | Clear all notifications |

#### Documents (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces/:workspaceId/documents` | List workspace docs |
| POST | `/api/workspaces/:workspaceId/documents` | Create document |
| GET | `/api/documents/:id` | Get document |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |

#### Direct Messages (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | List conversations |
| GET | `/api/messages/:userId` | Get messages with user |
| POST | `/api/messages/:userId` | Send message |
| PUT | `/api/messages/:id/read` | Mark message as read |
| DELETE | `/api/messages/:id` | Delete message |

#### Favorites (3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/favorites` | List favorite boards |
| POST | `/api/favorites/:boardId` | Add to favorites |
| DELETE | `/api/favorites/:boardId` | Remove from favorites |

#### AI (1)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | AI chat (Gemini) |

#### Seed (1)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/seed` | Seed database (requires JWT_SECRET header) |

#### Swagger
- **Swagger UI:** `GET /api-docs`
- **OpenAPI JSON:** `GET /api-docs.json`

---

## Real-Time Sync Strategy

### Architecture: Room-Based Socket.IO

```
Client connects → authenticates via JWT → joins user-specific room (user:{userId})
User opens board → joins board room (board:{boardId})
User leaves board → leaves board room
```

### Event Catalog (7 events)

| Event | Direction | Payload | Scope |
|-------|-----------|---------|-------|
| `task:created` | Server → Client | Full task object | Board room |
| `task:updated` | Server → Client | Updated task fields | Board room |
| `task:deleted` | Server → Client | `{ taskId }` | Board room |
| `task:moved` | Server → Client | `{ taskId, fromListId, toListId, position }` | Board room |
| `list:created` | Server → Client | Full list object | Board room |
| `list:updated` | Server → Client | Updated list fields | Board room |
| `notification:new` | Server → Client | Notification object | User room |

### Why Rooms?

Users only receive events for boards they are actively viewing. A workspace with 50 boards doesn't flood users with events from boards they haven't opened. This keeps bandwidth low and client processing minimal.

### Conflict Resolution

- **Last-write-wins** for field-level updates (task title, description, etc.)
- **Optimistic UI** — drag-and-drop updates the UI first, then persists to the server. On failure, the board state rolls back.
- **Stale response prevention** — the board store uses a request-sequence counter (`_boardFetchId`). If a slow response arrives after a newer request has already completed, it is silently discarded.

---

## Testing

### 25 Test Cases (Jest + Supertest)

```bash
cd backend
npm test
```

#### Auth Tests (13)
- Registration with valid/invalid data
- Duplicate email handling
- Login with correct/incorrect credentials
- JWT token generation and validation
- Protected route access (with/without token)
- Profile retrieval

#### API Tests (12)
- Workspace CRUD operations
- Board creation, listing, filtering by workspace
- List and task CRUD
- Member management
- Invitation flow

### Test Infrastructure
- **Global setup** creates an isolated SQLite test database
- **Supertest** makes real HTTP requests against the Express app
- **ts-jest** compiles TypeScript on the fly
- Tests run in CI via GitHub Actions (`.github/workflows/ci.yml`)

---

## Scalability Considerations

> Full analysis in [docs/SCALABILITY.md](docs/SCALABILITY.md)

### Current Architecture (Single-Server)
- SQLite locally, PostgreSQL in production
- Single Express process with in-memory Socket.IO
- Stateless JWT auth (no session store)

### Scaling Path

| Concern | Current | At Scale |
|---------|---------|----------|
| **Database** | SQLite / single PostgreSQL | Read replicas, connection pooling (PgBouncer) |
| **Real-time** | In-memory Socket.IO | Redis adapter for multi-process pub/sub |
| **File storage** | N/A | S3 + CloudFront CDN |
| **Search** | SQL LIKE queries | Elasticsearch / Meilisearch |
| **Caching** | None | Redis for hot data (board state, user sessions) |
| **Task queues** | Inline processing | Bull/BullMQ for emails, notifications, AI |
| **Horizontal scaling** | Single process | PM2 cluster mode or Kubernetes pods |
| **Monitoring** | Morgan logs | Prometheus + Grafana, Sentry for errors |

### Why These Trade-offs Are Acceptable Now

1. **SQLite for dev** — Zero setup friction. Prisma abstracts the provider; switching to Postgres is a 1-line change.
2. **No Redis** — With < 100 concurrent users, in-memory Socket.IO works fine. Adding Redis adapter is a 5-line change.
3. **No job queue** — Email sending and AI calls are fast enough inline. Bull can be added when latency matters.

---

## Assumptions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| **SQLite for local dev** | Eliminates database setup entirely. No Docker, no PostgreSQL install. `npx prisma db push` and you're running. |
| **Zustand over Redux** | Each store is a plain function — no action types, reducers, or provider wrappers. Fine-grained subscriptions prevent unnecessary re-renders. |
| **@hello-pangea/dnd** | Actively maintained fork of react-beautiful-dnd (archived by Atlassian). Same API, ongoing updates and bug fixes. |
| **TipTap for documents** | Built on ProseMirror — the most extensible rich-text framework for React. Supports mentions, links, and collaborative editing extensions. |
| **JWT in localStorage** | Simple and stateless. For a production app, httpOnly cookies with CSRF protection would be more secure. |
| **Optimistic drag-and-drop** | UI updates instantly, API persists in background. On failure, the board state rolls back. Gives responsive feel on slow connections. |
| **Room-based Socket.IO** | Users only receive events for boards they're viewing. Keeps bandwidth low, avoids processing irrelevant events. |
| **No file uploads** | Kept scope focused on task collaboration. S3 integration is the obvious next step. |
| **DiceBear avatars** | Auto-generated based on user initials. No upload flow needed, consistent visual identity across the app. |

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=file:./dev.db              # SQLite for local dev
PORT=5000                                # API server port
NODE_ENV=development                     # development | production
JWT_SECRET=your-super-secret-jwt-key     # Any random string
JWT_EXPIRES_IN=7d                        # Token expiration
CLIENT_URL=http://localhost:5173         # Frontend URL for CORS
GEMINI_API_KEY=your-gemini-api-key       # Optional: AI features
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000       # Backend URL
```

---

## Deployment

### Production Stack

| Component | Service | URL |
|-----------|---------|-----|
| **Database** | Render PostgreSQL | Managed, auto-configured |
| **Backend** | Render Web Service | [taskflow-api-mimm.onrender.com](https://taskflow-api-mimm.onrender.com) |
| **Frontend** | Vercel | [taskflow-collaborative-platform.vercel.app](https://taskflow-collaborative-platform.vercel.app) |

The `render.yaml` Blueprint auto-creates the database and backend service. The frontend deploys automatically on Vercel from the `main` branch.

---

## Architecture Documentation

| Document | Contents |
|----------|----------|
| [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md) | Component hierarchy, routing, Zustand stores, API layer, real-time integration |
| [Backend Architecture](docs/BACKEND_ARCHITECTURE.md) | Express middleware pipeline, controller pattern, auth flow, error handling |
| [Database Schema](docs/DATABASE_SCHEMA.md) | ER diagram, all 17 models, indexing strategy, relationships |
| [API Documentation](docs/API_DOCUMENTATION.md) | Complete endpoint reference with request/response formats |
| [Real-Time Sync](docs/REALTIME_SYNC.md) | Socket.IO rooms, event catalog, conflict resolution strategy |
| [Scalability](docs/SCALABILITY.md) | Horizontal scaling path, caching, monitoring, deployment topology |

---

*Built as a technical assessment demonstrating full-stack proficiency across React, Node.js, real-time systems, and database design.*
