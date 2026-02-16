import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: `
TaskFlow is a real-time collaborative task management platform. This API powers 
board creation, task management, real-time updates, team collaboration, and more.

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

Obtain a token via \`POST /api/auth/login\` or \`POST /api/auth/signup\`.

## Rate Limiting
- Standard: 100 requests/minute per user
- Search endpoints: 30 requests/minute

## Real-time Events
WebSocket events are delivered via Socket.IO on the same server.
See the WebSocket documentation section for event schemas.
      `,
      contact: {
        name: 'TaskFlow Engineering',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login or /auth/signup',
        },
      },
      schemas: {
        // ─── Core Models ────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx1a2b3c0000...' },
            email: { type: 'string', format: 'email', example: 'demo@taskflow.com' },
            name: { type: 'string', example: 'Demo User' },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Workspace: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Acme Corp' },
            color: { type: 'string', example: '#6366f1' },
            icon: { type: 'string', nullable: true },
            ownerId: { type: 'string' },
            members: {
              type: 'array',
              items: { $ref: '#/components/schemas/WorkspaceMember' },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkspaceMember: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            workspaceId: { type: 'string' },
            role: { type: 'string', enum: ['owner', 'admin', 'member'] },
            joinedAt: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Board: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string', example: 'Product Launch Q1' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', example: '#6366f1' },
            ownerId: { type: 'string' },
            workspaceId: { type: 'string', nullable: true },
            members: {
              type: 'array',
              items: { $ref: '#/components/schemas/BoardMember' },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        BoardMember: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            boardId: { type: 'string' },
            userId: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'member', 'viewer'] },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        List: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string', example: 'In Progress' },
            position: { type: 'integer', example: 2 },
            boardId: { type: 'string' },
            tasks: {
              type: 'array',
              items: { $ref: '#/components/schemas/Task' },
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string', example: 'Fix login redirect bug' },
            description: { type: 'string', nullable: true },
            position: { type: 'integer' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            listId: { type: 'string' },
            assignees: {
              type: 'array',
              items: { $ref: '#/components/schemas/TaskAssignee' },
            },
            labels: {
              type: 'array',
              items: { $ref: '#/components/schemas/TaskLabel' },
            },
            comments: {
              type: 'array',
              items: { $ref: '#/components/schemas/Comment' },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TaskAssignee: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            taskId: { type: 'string' },
            userId: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            assignedAt: { type: 'string', format: 'date-time' },
          },
        },
        TaskLabel: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            taskId: { type: 'string' },
            labelId: { type: 'string' },
            label: { $ref: '#/components/schemas/Label' },
          },
        },
        Label: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Bug' },
            color: { type: 'string', example: '#ef4444' },
            boardId: { type: 'string' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            taskId: { type: 'string' },
            userId: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['board_created', 'task_created', 'task_moved', 'task_updated', 'task_deleted', 'member_joined', 'comment_added'] },
            description: { type: 'string' },
            boardId: { type: 'string' },
            userId: { type: 'string' },
            taskId: { type: 'string', nullable: true },
            user: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['task_assigned', 'comment_added', 'invitation_received', 'task_due', 'mention', 'board_update', 'task_moved'] },
            title: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean' },
            userId: { type: 'string' },
            boardId: { type: 'string', nullable: true },
            taskId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string', description: 'HTML content from rich text editor' },
            workspaceId: { type: 'string' },
            createdBy: { type: 'string' },
            creator: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        DirectMessage: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            senderId: { type: 'string' },
            receiverId: { type: 'string' },
            read: { type: 'boolean' },
            sender: { $ref: '#/components/schemas/User' },
            receiver: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Invitation: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            boardId: { type: 'string' },
            inviterId: { type: 'string' },
            inviteeEmail: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'member', 'viewer'] },
            status: { type: 'string', enum: ['pending', 'accepted', 'declined'] },
            token: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
        FavoriteBoard: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            boardId: { type: 'string' },
            board: { $ref: '#/components/schemas/Board' },
          },
        },

        // ─── Request/Response Schemas ───────────────────────
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'demo@taskflow.com' },
            password: { type: 'string', minLength: 6, example: 'demo123' },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string', minLength: 2, maxLength: 50 },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', description: 'JWT access token' },
              },
            },
          },
        },
        CreateBoardRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', maxLength: 100, example: 'Sprint Board' },
            description: { type: 'string', maxLength: 500 },
            color: { type: 'string', example: '#6366f1' },
            workspaceId: { type: 'string' },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', maxLength: 200 },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            dueDate: { type: 'string', format: 'date-time' },
          },
        },
        MoveTaskRequest: {
          type: 'object',
          required: ['toListId', 'position'],
          properties: {
            toListId: { type: 'string' },
            position: { type: 'integer', minimum: 0 },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication and user management' },
      { name: 'Workspaces', description: 'Workspace CRUD and membership' },
      { name: 'Boards', description: 'Board management' },
      { name: 'Lists', description: 'List management within boards' },
      { name: 'Tasks', description: 'Task CRUD, assignment, labels, comments' },
      { name: 'Labels', description: 'Board label management' },
      { name: 'Activities', description: 'Activity history feed' },
      { name: 'Invitations', description: 'Board invitation system' },
      { name: 'Notifications', description: 'User notification management' },
      { name: 'Documents', description: 'Workspace document management' },
      { name: 'Messages', description: 'Direct messaging between users' },
      { name: 'Favorites', description: 'Board favorites' },
    ],
    paths: {
      // ═══════════════════════════════════════════════
      // AUTH
      // ═══════════════════════════════════════════════
      '/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: 'Create a new account',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } },
          },
          responses: {
            201: { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            409: { description: 'Email already registered' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Authenticate and get JWT token',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          responses: {
            200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          },
        },
      },
      '/auth/profile': {
        put: {
          tags: ['Auth'],
          summary: 'Update current user profile',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    avatar: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Profile updated' } },
        },
      },
      '/auth/users/search': {
        get: {
          tags: ['Auth'],
          summary: 'Search users by name/email',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query' },
          ],
          responses: { 200: { description: 'Matching users' } },
        },
      },

      // ═══════════════════════════════════════════════
      // WORKSPACES
      // ═══════════════════════════════════════════════
      '/workspaces': {
        get: {
          tags: ['Workspaces'],
          summary: 'List workspaces for current user',
          responses: { 200: { description: 'Array of workspaces with members and boards' } },
        },
        post: {
          tags: ['Workspaces'],
          summary: 'Create a new workspace',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', maxLength: 100 },
                    color: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Workspace created' } },
        },
      },
      '/workspaces/{id}': {
        get: {
          tags: ['Workspaces'],
          summary: 'Get workspace details',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Workspace details with members' } },
        },
        put: {
          tags: ['Workspaces'],
          summary: 'Update workspace',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, color: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'Workspace updated' } },
        },
        delete: {
          tags: ['Workspaces'],
          summary: 'Delete workspace (owner only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Workspace deleted' }, 403: { description: 'Not workspace owner' } },
        },
      },
      '/workspaces/{id}/members': {
        post: {
          tags: ['Workspaces'],
          summary: 'Add member to workspace',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['userId'], properties: { userId: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'Member added' } },
        },
      },
      '/workspaces/{id}/members/{userId}': {
        delete: {
          tags: ['Workspaces'],
          summary: 'Remove member from workspace',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Member removed' } },
        },
      },
      '/workspaces/{id}/invite': {
        post: {
          tags: ['Workspaces'],
          summary: 'Invite user to workspace by email',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } },
          },
          responses: { 200: { description: 'Invitation sent' }, 404: { description: 'User not found' } },
        },
      },

      // ═══════════════════════════════════════════════
      // BOARDS
      // ═══════════════════════════════════════════════
      '/boards': {
        get: {
          tags: ['Boards'],
          summary: 'List boards for current user',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'workspaceId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Paginated board list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } },
        },
        post: {
          tags: ['Boards'],
          summary: 'Create a new board',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBoardRequest' } } },
          },
          responses: { 201: { description: 'Board created' } },
        },
      },
      '/boards/{id}': {
        get: {
          tags: ['Boards'],
          summary: 'Get board with lists, tasks, members, and labels',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Full board data' }, 403: { description: 'Not a board member' } },
        },
        put: {
          tags: ['Boards'],
          summary: 'Update board (title, description, color)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, color: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'Board updated' } },
        },
        delete: {
          tags: ['Boards'],
          summary: 'Delete board (owner only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Board deleted' }, 403: { description: 'Not board owner' } },
        },
      },

      // ═══════════════════════════════════════════════
      // LISTS
      // ═══════════════════════════════════════════════
      '/boards/{boardId}/lists': {
        get: {
          tags: ['Lists'],
          summary: 'Get all lists for a board (with tasks)',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Array of lists with nested tasks' } },
        },
        post: {
          tags: ['Lists'],
          summary: 'Create a new list in a board',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['title'], properties: { title: { type: 'string' } } } } },
          },
          responses: { 201: { description: 'List created' } },
        },
      },
      '/lists/{id}': {
        put: {
          tags: ['Lists'],
          summary: 'Update list title',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'List updated' } },
        },
        delete: {
          tags: ['Lists'],
          summary: 'Delete list and all its tasks',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'List deleted' } },
        },
      },
      '/boards/{boardId}/lists/reorder': {
        put: {
          tags: ['Lists'],
          summary: 'Reorder lists within a board',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['orders'], properties: { orders: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, position: { type: 'integer' } } } } } } } },
          },
          responses: { 200: { description: 'Lists reordered' } },
        },
      },

      // ═══════════════════════════════════════════════
      // TASKS
      // ═══════════════════════════════════════════════
      '/tasks/my-tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'Get all tasks assigned to current user',
          responses: { 200: { description: 'Array of tasks with board and list info' } },
        },
      },
      '/lists/{listId}/tasks': {
        post: {
          tags: ['Tasks'],
          summary: 'Create a new task in a list',
          parameters: [{ name: 'listId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTaskRequest' } } },
          },
          responses: { 201: { description: 'Task created, real-time event emitted' } },
        },
      },
      '/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get task details',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Task with assignees, labels, comments' } },
        },
        put: {
          tags: ['Tasks'],
          summary: 'Update task fields',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] }, dueDate: { type: 'string', format: 'date-time', nullable: true } } } } },
          },
          responses: { 200: { description: 'Task updated, real-time event emitted' } },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete a task',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Task deleted' } },
        },
      },
      '/tasks/{id}/move': {
        put: {
          tags: ['Tasks'],
          summary: 'Move task to another list (drag-and-drop)',
          description: 'Moves a task to a different list at a specific position. Recalculates positions for all affected tasks. Emits real-time task:moved event.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MoveTaskRequest' } } },
          },
          responses: { 200: { description: 'Task moved successfully' } },
        },
      },
      '/tasks/{id}/assignees': {
        post: {
          tags: ['Tasks'],
          summary: 'Assign a user to a task',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['userId'], properties: { userId: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'User assigned, notification sent' } },
        },
      },
      '/tasks/{id}/assignees/{userId}': {
        delete: {
          tags: ['Tasks'],
          summary: 'Remove assignee from task',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Assignee removed' } },
        },
      },
      '/tasks/{id}/labels': {
        post: {
          tags: ['Tasks'],
          summary: 'Add label to task',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['labelId'], properties: { labelId: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'Label added' } },
        },
      },
      '/tasks/{id}/labels/{labelId}': {
        delete: {
          tags: ['Tasks'],
          summary: 'Remove label from task',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'labelId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Label removed' } },
        },
      },
      '/tasks/{id}/comments': {
        post: {
          tags: ['Tasks'],
          summary: 'Add comment to task',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string', maxLength: 2000 } } } } },
          },
          responses: { 201: { description: 'Comment added, real-time event emitted' } },
        },
      },
      '/tasks/{id}/comments/{commentId}': {
        delete: {
          tags: ['Tasks'],
          summary: 'Delete a comment',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'commentId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Comment deleted' } },
        },
      },
      '/boards/{boardId}/tasks/search': {
        get: {
          tags: ['Tasks'],
          summary: 'Search tasks within a board',
          parameters: [
            { name: 'boardId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query' },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] } },
            { name: 'assigneeId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Matching tasks' } },
        },
      },

      // ═══════════════════════════════════════════════
      // LABELS
      // ═══════════════════════════════════════════════
      '/boards/{boardId}/labels': {
        get: {
          tags: ['Labels'],
          summary: 'Get all labels for a board',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Array of labels' } },
        },
        post: {
          tags: ['Labels'],
          summary: 'Create a label',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['name', 'color'], properties: { name: { type: 'string' }, color: { type: 'string' } } } } },
          },
          responses: { 201: { description: 'Label created' } },
        },
      },

      // ═══════════════════════════════════════════════
      // ACTIVITIES
      // ═══════════════════════════════════════════════
      '/boards/{boardId}/activities': {
        get: {
          tags: ['Activities'],
          summary: 'Get activity feed for a board',
          parameters: [
            { name: 'boardId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Paginated activity feed' } },
        },
      },

      // ═══════════════════════════════════════════════
      // INVITATIONS
      // ═══════════════════════════════════════════════
      '/boards/{boardId}/invitations': {
        post: {
          tags: ['Invitations'],
          summary: 'Invite user to board by email',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' }, role: { type: 'string', enum: ['admin', 'member', 'viewer'] } } } } },
          },
          responses: { 201: { description: 'Invitation created with shareable token' } },
        },
        get: {
          tags: ['Invitations'],
          summary: 'Get pending invitations for a board',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Array of invitations' } },
        },
      },
      '/invitations': {
        get: {
          tags: ['Invitations'],
          summary: 'Get invitations for current user',
          responses: { 200: { description: 'Array of pending invitations' } },
        },
      },
      '/invitations/{id}/accept': {
        put: {
          tags: ['Invitations'],
          summary: 'Accept an invitation',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Invitation accepted, user added to board' } },
        },
      },
      '/invitations/{id}/decline': {
        put: {
          tags: ['Invitations'],
          summary: 'Decline an invitation',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Invitation declined' } },
        },
      },
      '/invitations/token/{token}': {
        get: {
          tags: ['Invitations'],
          summary: 'Get invitation details by shareable token',
          security: [],
          parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Invitation info (board name, inviter)' }, 404: { description: 'Invalid or expired token' } },
        },
      },
      '/invitations/token/{token}/accept': {
        post: {
          tags: ['Invitations'],
          summary: 'Accept invitation via shareable link',
          parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Joined the board' } },
        },
      },

      // ═══════════════════════════════════════════════
      // NOTIFICATIONS
      // ═══════════════════════════════════════════════
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Get notifications with pagination',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Paginated notifications' } },
        },
      },
      '/notifications/unread-count': {
        get: {
          tags: ['Notifications'],
          summary: 'Get unread notification count',
          responses: { 200: { description: 'Count of unread notifications' } },
        },
      },
      '/notifications/{id}/read': {
        put: {
          tags: ['Notifications'],
          summary: 'Mark notification as read',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Marked as read' } },
        },
      },
      '/notifications/read-all': {
        put: {
          tags: ['Notifications'],
          summary: 'Mark all notifications as read',
          responses: { 200: { description: 'All marked as read' } },
        },
      },

      // ═══════════════════════════════════════════════
      // DOCUMENTS
      // ═══════════════════════════════════════════════
      '/workspaces/{workspaceId}/documents': {
        get: {
          tags: ['Documents'],
          summary: 'List documents in a workspace',
          parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Array of documents' } },
        },
        post: {
          tags: ['Documents'],
          summary: 'Create a document',
          parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['title'], properties: { title: { type: 'string' }, content: { type: 'string' } } } } },
          },
          responses: { 201: { description: 'Document created' } },
        },
      },
      '/documents/{id}': {
        get: {
          tags: ['Documents'],
          summary: 'Get document by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Document content' } },
        },
        put: {
          tags: ['Documents'],
          summary: 'Update document',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } } } } },
          },
          responses: { 200: { description: 'Document updated' } },
        },
        delete: {
          tags: ['Documents'],
          summary: 'Delete document',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Document deleted' } },
        },
      },

      // ═══════════════════════════════════════════════
      // MESSAGES
      // ═══════════════════════════════════════════════
      '/workspaces/{workspaceId}/dm-members': {
        get: {
          tags: ['Messages'],
          summary: 'Get workspace members for DM sidebar',
          description: 'Returns workspace members with last message preview and unread count for the current user.',
          parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Members with DM metadata' } },
        },
      },
      '/messages/{userId}': {
        get: {
          tags: ['Messages'],
          summary: 'Get conversation with a user',
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Paginated messages (marks as read)' } },
        },
        post: {
          tags: ['Messages'],
          summary: 'Send a direct message',
          description: 'Sends a message and emits dm:new WebSocket event to both sender and receiver.',
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string', maxLength: 5000 } } } } },
          },
          responses: { 201: { description: 'Message sent' } },
        },
      },
      '/messages/msg/{messageId}': {
        delete: {
          tags: ['Messages'],
          summary: 'Delete a message (sender only)',
          parameters: [{ name: 'messageId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Message deleted' } },
        },
      },
      '/messages-unread/count': {
        get: {
          tags: ['Messages'],
          summary: 'Get total unread message count',
          responses: { 200: { description: 'Unread count' } },
        },
      },

      // ═══════════════════════════════════════════════
      // FAVORITES
      // ═══════════════════════════════════════════════
      '/favorites': {
        get: {
          tags: ['Favorites'],
          summary: 'Get user favorite boards',
          responses: { 200: { description: 'Array of favorited boards' } },
        },
      },
      '/favorites/{boardId}': {
        post: {
          tags: ['Favorites'],
          summary: 'Add board to favorites',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Board favorited' } },
        },
        delete: {
          tags: ['Favorites'],
          summary: 'Remove board from favorites',
          parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Favorite removed' } },
        },
      },

      // ═══════════════════════════════════════════════
      // HEALTH
      // ═══════════════════════════════════════════════
      '/health': {
        get: {
          tags: ['Auth'],
          summary: 'Health check',
          security: [],
          responses: { 200: { description: 'API is running' } },
        },
      },
    },
  },
  apis: [], // We defined paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);
