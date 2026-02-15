import { Express, Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authController } from '../controllers/auth.controller';
import { boardController } from '../controllers/board.controller';
import { listController } from '../controllers/list.controller';
import { taskController } from '../controllers/task.controller';
import { activityController } from '../controllers/activity.controller';
import { invitationController } from '../controllers/invitation.controller';
import { labelController } from '../controllers/label.controller';
import { workspaceController } from '../controllers/workspace.controller';

export function setupRoutes(app: Express) {
  const router = Router();

  // ===================== AUTH =====================
  router.post(
    '/auth/signup',
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
      body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    validate,
    authController.signup
  );

  router.post(
    '/auth/login',
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    authController.login
  );

  router.get('/auth/me', authenticate, authController.getProfile);
  router.put('/auth/profile', authenticate, authController.updateProfile);
  router.get('/auth/users/search', authenticate, authController.searchUsers);

  // ===================== WORKSPACES =====================
  router.get('/workspaces', authenticate, workspaceController.getWorkspaces);
  router.post('/workspaces', authenticate,
    [body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name required (max 100)')],
    validate, workspaceController.createWorkspace);
  router.get('/workspaces/:id', authenticate, workspaceController.getWorkspace);
  router.put('/workspaces/:id', authenticate, workspaceController.updateWorkspace);
  router.delete('/workspaces/:id', authenticate, workspaceController.deleteWorkspace);
  router.post('/workspaces/:id/members', authenticate,
    [body('userId').notEmpty().withMessage('User ID required')],
    validate, workspaceController.addMember);
  router.delete('/workspaces/:id/members/:userId', authenticate, workspaceController.removeMember);

  // ===================== BOARDS =====================
  router.get('/boards', authenticate, boardController.getBoards);

  router.post(
    '/boards',
    authenticate,
    [
      body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 chars)'),
      body('description').optional().trim().isLength({ max: 500 }),
      body('color').optional().isString(),
    ],
    validate,
    boardController.createBoard
  );

  router.get('/boards/:id', authenticate, boardController.getBoard);

  router.put(
    '/boards/:id',
    authenticate,
    [
      body('title').optional().trim().isLength({ min: 1, max: 100 }),
      body('description').optional().trim().isLength({ max: 500 }),
      body('color').optional().isString(),
    ],
    validate,
    boardController.updateBoard
  );

  router.delete('/boards/:id', authenticate, boardController.deleteBoard);
  router.delete('/boards/:id/members/:memberId', authenticate, boardController.removeMember);

  // ===================== LISTS =====================
  router.get('/boards/:boardId/lists', authenticate, listController.getLists);

  router.post(
    '/boards/:boardId/lists',
    authenticate,
    [body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required')],
    validate,
    listController.createList
  );

  router.put(
    '/lists/:id',
    authenticate,
    [body('title').optional().trim().isLength({ min: 1, max: 100 })],
    validate,
    listController.updateList
  );

  router.delete('/lists/:id', authenticate, listController.deleteList);

  router.put(
    '/boards/:boardId/lists/reorder',
    authenticate,
    [body('orders').isArray().withMessage('Orders array required')],
    validate,
    listController.reorderLists
  );

  // ===================== TASKS =====================
  router.post(
    '/lists/:listId/tasks',
    authenticate,
    [
      body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
      body('description').optional().trim(),
      body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
      body('dueDate').optional().isISO8601(),
    ],
    validate,
    taskController.createTask
  );

  router.get('/tasks/:id', authenticate, taskController.getTask);

  router.put(
    '/tasks/:id',
    authenticate,
    [
      body('title').optional().trim().isLength({ min: 1, max: 200 }),
      body('description').optional().trim(),
      body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
      body('dueDate').optional({ nullable: true }),
    ],
    validate,
    taskController.updateTask
  );

  router.delete('/tasks/:id', authenticate, taskController.deleteTask);

  router.put(
    '/tasks/:id/move',
    authenticate,
    [
      body('toListId').notEmpty().withMessage('Target list ID required'),
      body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
    ],
    validate,
    taskController.moveTask
  );

  // Task assignees
  router.post(
    '/tasks/:id/assignees',
    authenticate,
    [body('userId').notEmpty().withMessage('User ID required')],
    validate,
    taskController.addAssignee
  );

  router.delete('/tasks/:id/assignees/:userId', authenticate, taskController.removeAssignee);

  // Task labels
  router.post(
    '/tasks/:id/labels',
    authenticate,
    [body('labelId').notEmpty().withMessage('Label ID required')],
    validate,
    taskController.addLabel
  );

  router.delete('/tasks/:id/labels/:labelId', authenticate, taskController.removeLabel);

  // Task comments
  router.post(
    '/tasks/:id/comments',
    authenticate,
    [body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment content required')],
    validate,
    taskController.addComment
  );

  router.delete('/tasks/:id/comments/:commentId', authenticate, taskController.deleteComment);

  // Task search
  router.get('/boards/:boardId/tasks/search', authenticate, taskController.searchTasks);

  // ===================== LABELS =====================
  router.get('/boards/:boardId/labels', authenticate, labelController.getLabels);

  router.post(
    '/boards/:boardId/labels',
    authenticate,
    [
      body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Label name required'),
      body('color').isString().withMessage('Color required'),
    ],
    validate,
    labelController.createLabel
  );

  router.put(
    '/labels/:id',
    authenticate,
    [
      body('name').optional().trim().isLength({ min: 1, max: 50 }),
      body('color').optional().isString(),
    ],
    validate,
    labelController.updateLabel
  );

  router.delete('/labels/:id', authenticate, labelController.deleteLabel);

  // ===================== ACTIVITIES =====================
  router.get('/boards/:boardId/activities', authenticate, activityController.getBoardActivities);

  // ===================== INVITATIONS =====================
  router.post(
    '/boards/:boardId/invitations',
    authenticate,
    [
      body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
      body('role').optional().isIn(['admin', 'member', 'viewer']),
    ],
    validate,
    invitationController.createInvitation
  );

  router.get('/invitations', authenticate, invitationController.getUserInvitations);
  router.put('/invitations/:id/accept', authenticate, invitationController.acceptInvitation);
  router.put('/invitations/:id/decline', authenticate, invitationController.declineInvitation);
  router.get('/boards/:boardId/invitations', authenticate, invitationController.getBoardInvitations);

  // Token-based invite link (public info, requires auth to accept)
  router.get('/invitations/token/:token', invitationController.getInvitationByToken);
  router.post('/invitations/token/:token/accept', authenticate, invitationController.acceptByToken);

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ success: true, message: 'TaskFlow API is running', timestamp: new Date().toISOString() });
  });

  app.use('/api', router);
}
