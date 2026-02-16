# TaskFlow — Real-Time Task Collaboration Platform

A full-stack Kanban-style project management tool built for teams. Create workspaces, organize boards, drag tasks between columns, and collaborate in real time with teammates.

Built with React, Node.js, Prisma, and Socket.IO.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Demo Credentials](#demo-credentials)
- [Architecture](#architecture)
- [Testing](#testing)
- [Key Design Decisions](#key-design-decisions)
- [Deployment](#deployment)

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

### Platform
- **JWT Authentication** — Stateless token-based auth with signup, login, and profile management.
- **Dark Mode** — Full light/dark theme toggle with system preference detection.
- **Responsive Layout** — Collapsible sidebar, mobile-friendly navigation.
- **Inline Editing** — Edit board titles and task details without opening modals.
- **Swagger API Docs** — Interactive API explorer served at `/api-docs`.

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | HTTP server & REST API |
| TypeScript | Type safety |
| Prisma | ORM & database migrations |
| SQLite | Database (portable, zero-config) |
| Socket.IO | Real-time bidirectional events |
| JSON Web Token | Stateless authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| Swagger UI | API documentation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Dev server & bundler |
| TypeScript | Type safety |
| TailwindCSS | Utility-first styling |
| Zustand | State management |
| Socket.IO Client | Real-time connection |
| @hello-pangea/dnd | Drag-and-drop (react-beautiful-dnd fork) |
| TipTap | Rich-text document editor |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Lucide React | Icons |
| date-fns | Date formatting |

---

## Project Structure

```
Collaborative_platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (17 models)
│   │   ├── migrations/           # Migration history
│   │   └── dev.db                # SQLite database file
│   └── src/
│       ├── config/               # App config + Swagger spec
│       ├── controllers/          # Route handlers (12 controllers)
│       ├── middleware/           # Auth, validation, error handling
│       ├── routes/               # Route definitions with validators
│       ├── socket/               # Socket.IO room & event setup
│       ├── utils/                # JWT helpers, error classes
│       ├── seed.ts               # Database seeder
│       └── index.ts              # Entry point
├── frontend/
│   └── src/
│       ├── api/                  # API client modules (8 files)
│       ├── components/           # UI components by feature
│       ├── lib/                  # Axios & Socket.IO instances
│       ├── pages/                # Route-level pages (15 pages)
│       ├── store/                # Zustand stores (5 stores)
│       ├── types/                # TypeScript interfaces
│       └── App.tsx               # Route definitions
├── docs/                         # Architecture documentation
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── REALTIME_SYNC.md
│   └── SCALABILITY.md
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node.js)
- Git

### 1. Clone the repository

```bash
git clone <repo-url>
cd Collaborative_platform
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Set up the database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates the SQLite database)
npx prisma migrate dev --name init
```

### 4. Seed with sample data (optional but recommended)

```bash
cd backend
npx ts-node src/seed.ts
```

This creates 6 demo users, 3 workspaces, 7 boards, 70 tasks, comments, messages, and more. See [Demo Credentials](#demo-credentials) for login details.

### 5. Start the servers

Open **two terminal windows**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

All variables have sensible defaults, so the app runs without a `.env` file for local development.

---

## Seeding the Database

The seed script populates the database with realistic test data:

| Entity | Count | Details |
|--------|-------|---------|
| Users | 6 | Various roles and avatars |
| Workspaces | 3 | Engineering, Marketing, Design |
| Boards | 7 | Sprint boards, campaigns, portfolios |
| Lists | ~20 | To Do, In Progress, Review, Done |
| Tasks | 70 | Distributed across lists with due dates |
| Comments | 31 | Threaded discussions on tasks |
| Labels | 22 | Color-coded per board |
| Activities | 27 | Historical action log |
| Invitations | 7 | Various statuses |
| Notifications | 20 | Mixed types |
| Direct Messages | 38 | Multi-conversation threads |
| Documents | 6 | Rich HTML content |
| Favorites | 10 | Board bookmarks |

Run it:

```bash
cd backend
npx ts-node src/seed.ts
```

The script is idempotent — it clears existing data before inserting.

---

## Running the Application

### Development

```bash
# Backend — watches for changes and auto-restarts
cd backend && npm run dev

# Frontend — Vite HMR with API proxy to backend
cd frontend && npm run dev
```

### Production Build

```bash
# Backend
cd backend
npm run build        # Compiles TypeScript to dist/
npm start            # Runs dist/index.js

# Frontend
cd frontend
npm run build        # Outputs to dist/
npm run preview      # Serves the production build locally
```

### Prisma Studio (database GUI)

```bash
cd backend
npx prisma studio    # Opens at http://localhost:5555
```

---

## API Documentation

When the backend is running, visit:

- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **OpenAPI JSON**: [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)

The API covers 50+ endpoints across 12 resource groups. See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for a written summary.

---

## Demo Credentials

After running the seed script, these accounts are available:

| Email | Password | Role |
|-------|----------|------|
| demo@taskflow.com | demo123 | Workspace owner — full access |
| john@taskflow.com | demo123 | Team member |
| sarah@taskflow.com | demo123 | Team member |
| mike@taskflow.com | demo123 | Team member |
| emma@taskflow.com | demo123 | Team member |
| alex@taskflow.com | demo123 | Team member |

Log in with `demo@taskflow.com` for the fullest experience — this account owns workspaces and boards with the most data.

---

## Architecture

Detailed architecture documentation lives in the `docs/` directory:

| Document | Covers |
|----------|--------|
| [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md) | Component structure, routing, state management, API layer |
| [Backend Architecture](docs/BACKEND_ARCHITECTURE.md) | Express middleware pipeline, controllers, error handling |
| [Database Schema](docs/DATABASE_SCHEMA.md) | ER diagram, all 17 models, indexing strategy, migrations |
| [API Documentation](docs/API_DOCUMENTATION.md) | Endpoint reference, request/response formats |
| [Real-Time Sync](docs/REALTIME_SYNC.md) | Socket.IO rooms, event catalog, conflict resolution |
| [Scalability](docs/SCALABILITY.md) | Horizontal scaling, caching, deployment, monitoring |

### High-Level Data Flow

```
Browser (React)
    │
    ├── REST API calls ──→ Express Server ──→ Prisma ──→ SQLite
    │                           │
    └── WebSocket ◄────────► Socket.IO
                                │
                          Room-based events
                       (board:*, user:*, dm:*)
```

---

## Testing

Run the backend tests:

```bash
cd backend
npm test
```

Tests use Jest with `ts-jest` for TypeScript support and `supertest` for HTTP endpoint testing.

---

## Key Design Decisions

**Why SQLite?**
Zero-config setup. No database server to install. The Prisma schema is portable — switching to PostgreSQL is a one-line provider change (see [Scalability docs](docs/SCALABILITY.md)).

**Why Zustand over Redux?**
Less boilerplate. Each store is a plain function with no action types, reducers, or provider wrappers. Fine-grained subscriptions prevent unnecessary re-renders.

**Why @hello-pangea/dnd?**
It's the actively maintained fork of react-beautiful-dnd (which Atlassian archived). Same API, still gets updates and fixes.

**Why TipTap for documents?**
Built on ProseMirror, it's the most extensible rich-text editor for React. Supports mentions, links, and collaborative editing extensions.

**Optimistic updates for drag-and-drop:**
The UI updates instantly on drag. The API call happens in the background. If it fails, the board state rolls back. This gives a responsive feel even on slow connections.

**Room-based Socket.IO:**
Users only receive events for boards they're currently viewing. This keeps bandwidth low and avoids processing irrelevant events.

---

## Deployment

**📖 Full deployment guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

Deploy TaskFlow to production for **$0/month** using:

| Component | Service | Details |
|-----------|---------|---------|
| **Database** | Render PostgreSQL | Free managed database |
| **Backend** | Render Web Service | Node.js API + Socket.IO |
| **Frontend** | Vercel | Global CDN with instant deploys |

The `render.yaml` Blueprint auto-creates both the database and backend service. Just connect your GitHub repo and set your `GEMINI_API_KEY`.

**Quick deploy:**
1. Push to GitHub
2. Render → New Blueprint → connect repo
3. Vercel → Import Project → set `VITE_API_URL` and `VITE_WS_URL`
4. Update `CLIENT_URL` in Render to your Vercel URL

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions with screenshots and troubleshooting.

---

## License

This project was built as part of a technical assessment. Not intended for production use without the scaling changes described in the architecture docs.
