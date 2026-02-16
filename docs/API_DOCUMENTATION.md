# API Documentation

## Overview

The backend exposes a RESTful JSON API at `/api`. All responses follow a consistent envelope format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Validation errors include field-level detail:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

## Interactive Documentation

Swagger UI is available at **`/api-docs`** when the server is running. It provides a full interactive explorer where you can try every endpoint with real requests.

The raw OpenAPI 3.0.3 JSON is available at **`/api-docs.json`** for import into Postman or other tools.

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Tokens are obtained from `POST /api/auth/login` or `POST /api/auth/signup` and expire after 7 days.

## Endpoint Summary

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register a new account |
| POST | `/auth/login` | Authenticate and get JWT |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/profile` | Update name or avatar |
| GET | `/auth/users/search?q=` | Search users by name/email |

### Workspaces (`/api/workspaces`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspaces` | List user's workspaces |
| POST | `/workspaces` | Create workspace |
| GET | `/workspaces/:id` | Get workspace details |
| PUT | `/workspaces/:id` | Update workspace |
| DELETE | `/workspaces/:id` | Delete workspace |
| GET | `/workspaces/:id/members` | List members |
| POST | `/workspaces/:id/members` | Add member |
| DELETE | `/workspaces/:id/members/:userId` | Remove member |

### Boards (`/api/boards`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/boards?workspaceId=` | List boards for workspace |
| POST | `/boards` | Create board |
| GET | `/boards/:id` | Full board with lists, tasks, members, labels |
| PUT | `/boards/:id` | Update board title/color |
| DELETE | `/boards/:id` | Delete board |
| POST | `/boards/:id/members` | Add member to board |

### Lists (`/api/boards/:boardId/lists`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/boards/:boardId/lists` | Get lists for board |
| POST | `/boards/:boardId/lists` | Create list |
| PUT | `/lists/:id` | Update list title |
| PUT | `/lists/reorder` | Reorder lists |
| DELETE | `/lists/:id` | Delete list |

### Tasks (`/api/tasks` & `/api/boards/:boardId/tasks`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/boards/:boardId/tasks` | Create task |
| GET | `/tasks/my-tasks` | Get all tasks assigned to me |
| GET | `/tasks/:id` | Task with comments, assignees, labels |
| PUT | `/tasks/:id` | Update task fields |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/move` | Move task to another list/position |
| POST | `/tasks/:id/assignees` | Assign user |
| DELETE | `/tasks/:id/assignees/:userId` | Remove assignee |
| POST | `/tasks/:id/labels` | Attach label |
| DELETE | `/tasks/:id/labels/:labelId` | Remove label |
| GET | `/tasks/:id/comments` | List comments |
| POST | `/tasks/:id/comments` | Add comment |
| DELETE | `/comments/:id` | Delete comment |

### Labels (`/api/boards/:boardId/labels`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/boards/:boardId/labels` | List labels for board |
| POST | `/boards/:boardId/labels` | Create label |
| PUT | `/labels/:id` | Update label |
| DELETE | `/labels/:id` | Delete label |

### Activities (`/api/boards/:boardId/activities`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/boards/:boardId/activities` | Activity feed with pagination |

### Invitations (`/api/invitations`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/invitations` | Create board invitation |
| GET | `/invitations/board/:boardId` | List invitations for board |
| GET | `/invitations/my` | My pending invitations |
| GET | `/invitations/token/:token` | Get invite details by token |
| POST | `/invitations/:id/accept` | Accept invitation |
| POST | `/invitations/:id/decline` | Decline invitation |
| DELETE | `/invitations/:id` | Revoke invitation |

### Notifications (`/api/notifications`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List notifications (paginated) |
| GET | `/notifications/unread-count` | Get unread count |
| PUT | `/notifications/:id/read` | Mark one as read |
| PUT | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete notification |
| DELETE | `/notifications` | Clear all notifications |

### Documents (`/api/documents`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/documents?workspaceId=` | List workspace documents |
| POST | `/documents` | Create document |
| GET | `/documents/:id` | Get document content |
| PUT | `/documents/:id` | Update document |
| DELETE | `/documents/:id` | Delete document |

### Messages (`/api/messages`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/messages/conversations` | List DM conversations |
| GET | `/messages/:userId` | Get messages with a user |
| POST | `/messages` | Send a message |
| PUT | `/messages/read/:userId` | Mark conversation as read |
| GET | `/messages/unread/count` | Unread message count |

### Favorites (`/api/favorites`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/favorites` | User's favorite boards |
| POST | `/favorites/:boardId` | Add board to favorites |
| DELETE | `/favorites/:boardId` | Remove from favorites |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |

## Rate Limiting

Not currently implemented. For production, consider `express-rate-limit` on auth endpoints and expensive queries.

## Pagination

Activity feeds and notifications support cursor-based pagination via `?page=1&limit=20` query parameters. The response includes total count for client-side pagination controls.
