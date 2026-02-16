# Real-Time Synchronization Strategy

## Overview

TaskFlow uses Socket.IO for bidirectional, event-driven communication between the server and connected clients. This enables live collaboration — when one user moves a task or posts a comment, every other user on the same board sees the change instantly.

## Why Socket.IO

- **WebSocket with fallbacks** — automatically degrades to long-polling in restrictive network environments.
- **Room abstraction** — simplifies broadcasting to specific groups (board members, individual users).
- **Built-in reconnection** — handles network interruptions gracefully.
- **Namespace/room separation** — keeps event traffic scoped so users only receive relevant updates.

## Connection Lifecycle

```
Client Login
    │
    ├── Store JWT in localStorage
    │
    └── connectSocket(token)
            │
            ├── socket.io-client connects to server
            │   handshake: { auth: { token } }
            │
            ├── Server middleware verifies JWT
            │   → attaches userId to socket
            │   → joins user:<userId> room
            │
            └── Connection established ✓

Client Logout / Token Expired
    │
    └── disconnectSocket()
            │
            └── socket.disconnect()
```

## Room Architecture

| Room | Format | Who Joins | Purpose |
|------|--------|-----------|---------|
| Personal | `user:<userId>` | Auto-join on connect | Direct notifications, DM delivery |
| Board | `board:<boardId>` | On navigating to `/board/:id` | Board-level events |

### Joining and Leaving Rooms

When a user opens a board page:

```typescript
socket.emit('board:join', boardId);   // Subscribe
// ... user works on the board ...
socket.emit('board:leave', boardId);  // Unsubscribe (on navigate away)
```

This prevents users from receiving events for boards they're not actively viewing.

## Event Catalog

### Board Events (room: `board:<boardId>`)

| Event | Direction | Payload | Trigger |
|-------|-----------|---------|---------|
| `task:created` | Server → Client | `Task` object | New task added |
| `task:updated` | Server → Client | `Task` object | Task title, priority, due date changed |
| `task:deleted` | Server → Client | `{ taskId }` | Task removed |
| `task:moved` | Server → Client | `{ taskId, fromListId, toListId, position }` | Drag-and-drop move |
| `list:created` | Server → Client | `List` object | New list added |
| `list:updated` | Server → Client | `List` object | List renamed |
| `list:deleted` | Server → Client | `{ listId }` | List removed |
| `comment:added` | Server → Client | `Comment` object | New comment on a task |
| `board:updated` | Server → Client | `Board` object | Board title or settings changed |
| `member:added` | Server → Client | `BoardMember` object | New member joined |
| `task:typing` | Client ↔ Server | `{ taskId, userName }` | Typing indicator in task editor |
| `board:presence` | Client ↔ Server | `{ userId, status }` | Online presence signals |

### Personal Events (room: `user:<userId>`)

| Event | Direction | Payload |
|-------|-----------|---------|
| `notification:new` | Server → Client | `Notification` object |
| `dm:new` | Server → Client | `DirectMessage` object |
| `dm:typing` | Client ↔ Server | `{ senderId }` |
| `dm:stop-typing` | Client ↔ Server | `{ senderId }` |
| `invitation:received` | Server → Client | `Invitation` object |

## Server-Side Emission Pattern

Controllers access the Socket.IO server through Express's `app.set('io', io)` pattern:

```typescript
// In task.controller.ts, after creating a task:
const io = req.app.get('io') as Server;
io.to(`board:${boardId}`).emit('task:created', newTask);
```

This approach keeps the controller layer as the single place where both database mutations and real-time events happen, maintaining consistency.

## Client-Side Handling

The board store listens for socket events when a board is active:

```typescript
// Simplified example
socket.on('task:created', (task: Task) => {
  boardStore.getState().addTask(task);
});

socket.on('task:moved', (data) => {
  boardStore.getState().moveTask(data.taskId, data.toListId, data.position);
});
```

The Zustand store updates trigger React re-renders, so the UI reflects changes from other users without explicit DOM manipulation.

## Conflict Resolution

Currently, the system uses a **last-write-wins** strategy. If two users update the same task simultaneously, the second write overwrites the first. This is acceptable for the current feature set because:

- Task moves are position-based and recalculated on each drag.
- Comments are append-only (no conflict).
- Title/description edits are full replacements.

For more advanced conflict handling, see the [SCALABILITY.md](./SCALABILITY.md) doc for discussion on CRDTs and operational transforms.

## Reconnection Behavior

Socket.IO's built-in reconnection:

1. Detects disconnection.
2. Attempts exponential backoff reconnect.
3. On reconnect, the client re-emits `board:join` for the active board.
4. The store refreshes full board data from the REST API to catch up on missed events.

This "reconnect + full refresh" approach is simpler than maintaining an event queue and sufficient for the current scale.

## Scaling Considerations

With a single server process, all sockets share the same in-memory room registry. To scale horizontally:

- Use the `@socket.io/redis-adapter` to share room state across multiple server instances.
- A Redis pub/sub layer ensures events emitted on one server reach clients connected to another.
- See [SCALABILITY.md](./SCALABILITY.md) for the full horizontal scaling plan.
