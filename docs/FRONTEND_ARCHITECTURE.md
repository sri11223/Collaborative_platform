# Frontend Architecture

## Overview

The frontend is a single-page application built with React 18 and TypeScript, bundled via Vite. It follows a feature-oriented structure where pages, stores, and API clients stay close to the domain they serve.

## Directory Layout

```
frontend/src/
├── api/                  # HTTP client wrappers per domain
│   ├── auth.api.ts
│   ├── board.api.ts
│   ├── invitation.api.ts
│   ├── list.api.ts
│   ├── message.api.ts
│   ├── notification.api.ts
│   ├── task.api.ts
│   └── workspace.api.ts
├── components/
│   ├── activity/         # Activity feed, timeline items
│   ├── auth/             # ProtectedRoute, login/signup forms
│   ├── board/            # Board header, list columns, cards
│   ├── common/           # Reusable UI primitives (Spinner, Modal, etc.)
│   ├── layout/           # Sidebar, topbar, main layout shell
│   ├── onboarding/       # Welcome & workspace creation wizard
│   └── task/             # Task detail modal, assignee picker, labels
├── lib/
│   ├── axios.ts          # Pre-configured Axios instance with interceptors
│   └── socket.ts         # Socket.IO client singleton
├── pages/                # Route-level components (lazy-loaded)
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx / SignupPage.tsx
│   ├── HomePage.tsx      # Dashboard overview after login
│   ├── DashboardPage.tsx # Workspace-level metrics
│   ├── BoardPage.tsx     # Kanban board with drag-and-drop
│   ├── InboxPage.tsx     # Notification center
│   ├── MyTasksPage.tsx   # Cross-board personal task list
│   ├── PlannerPage.tsx   # Calendar / timeline view
│   ├── TeamsPage.tsx     # Workspace member management
│   ├── DocsPage.tsx      # Rich-text documents per workspace
│   ├── DirectMessagesPage.tsx
│   ├── SettingsPage.tsx
│   ├── InvitePage.tsx    # Accept invite via token
│   └── NotFoundPage.tsx
├── store/                # Zustand state stores
│   ├── authStore.ts
│   ├── boardStore.ts
│   ├── workspaceStore.ts
│   ├── notificationStore.ts
│   └── themeStore.ts
├── types/                # Shared TypeScript interfaces
├── constants/            # Static config values
├── App.tsx               # Route definitions
└── main.tsx              # Entry point
```

## Routing

React Router v6 handles client-side navigation. Routes split into three groups:

| Group | Routes | Guard |
|-------|--------|-------|
| Public | `/`, `/login`, `/signup`, `/invite/:token` | None |
| Protected | `/home`, `/dashboard`, `/board/:id`, `/inbox`, `/my-tasks`, `/planner`, `/teams`, `/docs`, `/messages`, `/settings` | `<ProtectedRoute>` checks `isAuthenticated` |
| Fallback | `*` | 404 page |

All protected routes share a `<Layout>` wrapper that renders the sidebar and top navigation. Page components are **lazy-loaded** with `React.lazy` / `Suspense` to keep the initial bundle small.

## State Management (Zustand)

We chose Zustand for state because it has zero boilerplate compared to Redux and supports fine-grained subscriptions without context re-render issues.

### Store Responsibilities

- **authStore** — JWT token lifecycle, current user object, login/signup/logout actions, auto-loads user on mount from localStorage.
- **boardStore** — Active board data (lists, tasks, labels, members). Handles local optimistic updates for drag-and-drop and rolls back on API failure.
- **workspaceStore** — Workspace list, active workspace selection, member roster.
- **notificationStore** — Unread count badge, notification list, mark-as-read.
- **themeStore** — Light/dark mode toggle (persisted in localStorage).

### Data Flow Pattern

```
User Action → Store Action → API Call → Update Store State → Re-render
                                ↑
                          Socket Event
```

Socket events also write directly into the relevant store, so changes from collaborators appear without polling.

## API Layer

Each domain has a thin API module (`api/*.api.ts`) that wraps Axios calls. A shared Axios instance in `lib/axios.ts` provides:

1. **Base URL** — Points to `/api` (reverse-proxied by Vite in dev).
2. **Request interceptor** — Attaches `Authorization: Bearer <token>` from localStorage.
3. **Response interceptor** — Catches 401 errors to trigger auto-logout.

Example flow for creating a task:

```
TaskModal → taskApi.create(payload) → POST /api/boards/:id/tasks
                                        ↓
                        Server responds { success: true, data: Task }
                                        ↓
                        boardStore.addTask(task) → UI re-renders
```

## Real-Time Integration

A singleton Socket.IO client (`lib/socket.ts`) connects on login and disconnects on logout. The token is passed via `auth.token` in the handshake.

Board pages emit `board:join` / `board:leave` to subscribe to room-based events. Incoming events (`task:created`, `task:updated`, `list:reordered`, etc.) are dispatched to the board store.

Typing indicators (`task:typing`, `dm:typing`) give visual feedback during editing and messaging.

## Drag-and-Drop

We use `@hello-pangea/dnd` (a maintained fork of react-beautiful-dnd). The `BoardPage` renders each list as a `<Droppable>` and each task card as a `<Draggable>`.

On drop, the board store:

1. Calculates new position values.
2. Optimistically re-orders the local state.
3. Fires `PATCH /api/tasks/:id/move` with `{ listId, position }`.
4. Emits a Socket event so other board members see the move immediately.
5. Rolls back on error.

## Rich Text (Documents)

The Docs page uses [TipTap](https://tiptap.dev/) (built on ProseMirror) for collaborative-style rich text editing. Documents are scoped to a workspace and support HTML content, export to plain text or HTML, and share links.

## Styling

TailwindCSS v3.4 handles all styling – no CSS modules or styled-components. Dark mode is implemented via the `class` strategy (`darkMode: 'class'`), toggled by themeStore.

Animations use Tailwind's built-in `transition-*` utilities. Some micro-interactions (hover on cards, sidebar collapse) use simple CSS transforms.

## Build & Bundle

Vite produces an optimized production build with:

- Tree-shaking (ESM)
- Code-splitting per lazy route
- Asset hashing for cache-busting
- Source map generation (disabled in prod)

Dev server proxies `/api` and `/socket.io` to `http://localhost:5000`.
