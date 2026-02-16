import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to create dates relative to now
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
function hoursAgo(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

async function main() {
  console.log('🌱 Seeding database with comprehensive test data...\n');

  // ═══════════════════════════════════════════════════════════════
  // CLEAN EVERYTHING
  // ═══════════════════════════════════════════════════════════════
  await prisma.favoriteBoard.deleteMany();
  await prisma.directMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.list.deleteMany();
  await prisma.label.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // ═══════════════════════════════════════════════════════════════
  // 1. USERS (6 users for robust testing)
  // ═══════════════════════════════════════════════════════════════
  const hashedPassword = await bcrypt.hash('demo123', 12);

  const users = await Promise.all([
    prisma.user.create({ data: { email: 'demo@taskflow.com', name: 'Demo User', password: hashedPassword } }),
    prisma.user.create({ data: { email: 'john@taskflow.com', name: 'John Smith', password: hashedPassword } }),
    prisma.user.create({ data: { email: 'sarah@taskflow.com', name: 'Sarah Johnson', password: hashedPassword } }),
    prisma.user.create({ data: { email: 'mike@taskflow.com', name: 'Mike Chen', password: hashedPassword } }),
    prisma.user.create({ data: { email: 'emma@taskflow.com', name: 'Emma Wilson', password: hashedPassword } }),
    prisma.user.create({ data: { email: 'alex@taskflow.com', name: 'Alex Rivera', password: hashedPassword } }),
  ]);

  const [demo, john, sarah, mike, emma, alex] = users;
  console.log(`✅ ${users.length} Users created`);

  // ═══════════════════════════════════════════════════════════════
  // 2. WORKSPACES (3 workspaces)
  // ═══════════════════════════════════════════════════════════════
  const ws1 = await prisma.workspace.create({
    data: { name: 'Acme Corp', color: '#6366f1', ownerId: demo.id },
  });
  const ws2 = await prisma.workspace.create({
    data: { name: 'Side Project', color: '#10b981', ownerId: demo.id },
  });
  const ws3 = await prisma.workspace.create({
    data: { name: 'Design Studio', color: '#f59e0b', ownerId: john.id },
  });

  console.log('✅ 3 Workspaces created');

  // ═══════════════════════════════════════════════════════════════
  // 3. WORKSPACE MEMBERS
  // ═══════════════════════════════════════════════════════════════
  await prisma.workspaceMember.createMany({
    data: [
      // Acme Corp — all 6 users
      { workspaceId: ws1.id, userId: demo.id, role: 'owner' },
      { workspaceId: ws1.id, userId: john.id, role: 'admin' },
      { workspaceId: ws1.id, userId: sarah.id, role: 'member' },
      { workspaceId: ws1.id, userId: mike.id, role: 'member' },
      { workspaceId: ws1.id, userId: emma.id, role: 'member' },
      { workspaceId: ws1.id, userId: alex.id, role: 'member' },
      // Side Project — 3 users
      { workspaceId: ws2.id, userId: demo.id, role: 'owner' },
      { workspaceId: ws2.id, userId: sarah.id, role: 'admin' },
      { workspaceId: ws2.id, userId: mike.id, role: 'member' },
      // Design Studio — john owns, demo and emma are members
      { workspaceId: ws3.id, userId: john.id, role: 'owner' },
      { workspaceId: ws3.id, userId: demo.id, role: 'member' },
      { workspaceId: ws3.id, userId: emma.id, role: 'admin' },
    ],
  });

  console.log('✅ 12 Workspace members added');

  // ═══════════════════════════════════════════════════════════════
  // 4. BOARDS (7 boards across workspaces)
  // ═══════════════════════════════════════════════════════════════

  // --- Acme Corp boards ---
  const board1 = await prisma.board.create({
    data: {
      title: 'Product Launch Q1',
      description: 'Tasks for the upcoming product launch in Q1 2026',
      color: '#6366f1',
      ownerId: demo.id,
      workspaceId: ws1.id,
    },
  });

  const board2 = await prisma.board.create({
    data: {
      title: 'Engineering Sprint',
      description: 'Current sprint tasks and bugs',
      color: '#10b981',
      ownerId: demo.id,
      workspaceId: ws1.id,
    },
  });

  const board3 = await prisma.board.create({
    data: {
      title: 'Marketing Campaign',
      description: 'Social media and marketing tasks',
      color: '#f59e0b',
      ownerId: john.id,
      workspaceId: ws1.id,
    },
  });

  const board4 = await prisma.board.create({
    data: {
      title: 'Customer Support',
      description: 'Track support tickets and customer issues',
      color: '#ef4444',
      ownerId: sarah.id,
      workspaceId: ws1.id,
    },
  });

  // --- Side Project boards ---
  const board5 = await prisma.board.create({
    data: {
      title: 'Mobile App MVP',
      description: 'Build the MVP for the mobile app',
      color: '#8b5cf6',
      ownerId: demo.id,
      workspaceId: ws2.id,
    },
  });

  const board6 = await prisma.board.create({
    data: {
      title: 'Research & Ideas',
      description: 'Brainstorming and research notes',
      color: '#06b6d4',
      ownerId: sarah.id,
      workspaceId: ws2.id,
    },
  });

  // --- Design Studio board ---
  const board7 = await prisma.board.create({
    data: {
      title: 'Client Rebrand 2026',
      description: 'Full rebranding project for TechNova client',
      color: '#ec4899',
      ownerId: john.id,
      workspaceId: ws3.id,
    },
  });

  console.log('✅ 7 Boards created');

  // ═══════════════════════════════════════════════════════════════
  // 5. BOARD MEMBERS
  // ═══════════════════════════════════════════════════════════════
  await prisma.boardMember.createMany({
    data: [
      // Board 1 — Product Launch
      { boardId: board1.id, userId: demo.id, role: 'admin' },
      { boardId: board1.id, userId: john.id, role: 'member' },
      { boardId: board1.id, userId: sarah.id, role: 'member' },
      { boardId: board1.id, userId: mike.id, role: 'member' },
      // Board 2 — Engineering Sprint
      { boardId: board2.id, userId: demo.id, role: 'admin' },
      { boardId: board2.id, userId: john.id, role: 'member' },
      { boardId: board2.id, userId: alex.id, role: 'member' },
      // Board 3 — Marketing Campaign
      { boardId: board3.id, userId: john.id, role: 'admin' },
      { boardId: board3.id, userId: demo.id, role: 'member' },
      { boardId: board3.id, userId: emma.id, role: 'member' },
      // Board 4 — Customer Support
      { boardId: board4.id, userId: sarah.id, role: 'admin' },
      { boardId: board4.id, userId: demo.id, role: 'member' },
      { boardId: board4.id, userId: mike.id, role: 'member' },
      { boardId: board4.id, userId: alex.id, role: 'member' },
      // Board 5 — Mobile App MVP
      { boardId: board5.id, userId: demo.id, role: 'admin' },
      { boardId: board5.id, userId: sarah.id, role: 'member' },
      { boardId: board5.id, userId: mike.id, role: 'member' },
      // Board 6 — Research & Ideas
      { boardId: board6.id, userId: sarah.id, role: 'admin' },
      { boardId: board6.id, userId: demo.id, role: 'member' },
      // Board 7 — Client Rebrand
      { boardId: board7.id, userId: john.id, role: 'admin' },
      { boardId: board7.id, userId: demo.id, role: 'member' },
      { boardId: board7.id, userId: emma.id, role: 'member' },
    ],
  });

  console.log('✅ 22 Board members added');

  // ═══════════════════════════════════════════════════════════════
  // 6. LABELS (across multiple boards)
  // ═══════════════════════════════════════════════════════════════
  const labelsB1 = await Promise.all([
    prisma.label.create({ data: { name: 'Bug', color: '#ef4444', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Feature', color: '#3b82f6', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Enhancement', color: '#8b5cf6', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Documentation', color: '#06b6d4', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Urgent', color: '#f97316', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Design', color: '#ec4899', boardId: board1.id } }),
  ]);

  const labelsB2 = await Promise.all([
    prisma.label.create({ data: { name: 'Hotfix', color: '#ef4444', boardId: board2.id } }),
    prisma.label.create({ data: { name: 'Refactor', color: '#8b5cf6', boardId: board2.id } }),
    prisma.label.create({ data: { name: 'Performance', color: '#f59e0b', boardId: board2.id } }),
    prisma.label.create({ data: { name: 'Security', color: '#dc2626', boardId: board2.id } }),
  ]);

  const labelsB3 = await Promise.all([
    prisma.label.create({ data: { name: 'Social Media', color: '#3b82f6', boardId: board3.id } }),
    prisma.label.create({ data: { name: 'Content', color: '#10b981', boardId: board3.id } }),
    prisma.label.create({ data: { name: 'Analytics', color: '#f59e0b', boardId: board3.id } }),
    prisma.label.create({ data: { name: 'Email', color: '#6366f1', boardId: board3.id } }),
  ]);

  const labelsB4 = await Promise.all([
    prisma.label.create({ data: { name: 'Critical', color: '#ef4444', boardId: board4.id } }),
    prisma.label.create({ data: { name: 'Billing', color: '#f59e0b', boardId: board4.id } }),
    prisma.label.create({ data: { name: 'Technical', color: '#3b82f6', boardId: board4.id } }),
    prisma.label.create({ data: { name: 'Feedback', color: '#10b981', boardId: board4.id } }),
  ]);

  const labelsB5 = await Promise.all([
    prisma.label.create({ data: { name: 'iOS', color: '#6366f1', boardId: board5.id } }),
    prisma.label.create({ data: { name: 'Android', color: '#10b981', boardId: board5.id } }),
    prisma.label.create({ data: { name: 'UI/UX', color: '#ec4899', boardId: board5.id } }),
    prisma.label.create({ data: { name: 'Backend', color: '#f97316', boardId: board5.id } }),
  ]);

  console.log('✅ Labels created across 5 boards');

  // ═══════════════════════════════════════════════════════════════
  // 7. LISTS (for all 7 boards)
  // ═══════════════════════════════════════════════════════════════

  // Board 1 — Product Launch (5 lists)
  const [b1Backlog, b1Todo, b1InProg, b1Review, b1Done] = await Promise.all([
    prisma.list.create({ data: { title: 'Backlog', position: 0, boardId: board1.id } }),
    prisma.list.create({ data: { title: 'To Do', position: 1, boardId: board1.id } }),
    prisma.list.create({ data: { title: 'In Progress', position: 2, boardId: board1.id } }),
    prisma.list.create({ data: { title: 'Review', position: 3, boardId: board1.id } }),
    prisma.list.create({ data: { title: 'Done', position: 4, boardId: board1.id } }),
  ]);

  // Board 2 — Engineering Sprint (4 lists)
  const [b2Todo, b2InProg, b2Testing, b2Done] = await Promise.all([
    prisma.list.create({ data: { title: 'To Do', position: 0, boardId: board2.id } }),
    prisma.list.create({ data: { title: 'In Progress', position: 1, boardId: board2.id } }),
    prisma.list.create({ data: { title: 'Testing', position: 2, boardId: board2.id } }),
    prisma.list.create({ data: { title: 'Done', position: 3, boardId: board2.id } }),
  ]);

  // Board 3 — Marketing Campaign (4 lists)
  const [b3Ideas, b3Planned, b3InProg, b3Published] = await Promise.all([
    prisma.list.create({ data: { title: 'Ideas', position: 0, boardId: board3.id } }),
    prisma.list.create({ data: { title: 'Planned', position: 1, boardId: board3.id } }),
    prisma.list.create({ data: { title: 'In Progress', position: 2, boardId: board3.id } }),
    prisma.list.create({ data: { title: 'Published', position: 3, boardId: board3.id } }),
  ]);

  // Board 4 — Customer Support (4 lists)
  const [b4New, b4InProg, b4Waiting, b4Resolved] = await Promise.all([
    prisma.list.create({ data: { title: 'New Tickets', position: 0, boardId: board4.id } }),
    prisma.list.create({ data: { title: 'In Progress', position: 1, boardId: board4.id } }),
    prisma.list.create({ data: { title: 'Waiting on Customer', position: 2, boardId: board4.id } }),
    prisma.list.create({ data: { title: 'Resolved', position: 3, boardId: board4.id } }),
  ]);

  // Board 5 — Mobile App MVP (4 lists)
  const [b5Backlog, b5Sprint, b5InProg, b5Done] = await Promise.all([
    prisma.list.create({ data: { title: 'Backlog', position: 0, boardId: board5.id } }),
    prisma.list.create({ data: { title: 'Sprint', position: 1, boardId: board5.id } }),
    prisma.list.create({ data: { title: 'In Progress', position: 2, boardId: board5.id } }),
    prisma.list.create({ data: { title: 'Done', position: 3, boardId: board5.id } }),
  ]);

  // Board 6 — Research (3 lists)
  const [b6Research, b6Evaluate, b6Archive] = await Promise.all([
    prisma.list.create({ data: { title: 'Research', position: 0, boardId: board6.id } }),
    prisma.list.create({ data: { title: 'Evaluate', position: 1, boardId: board6.id } }),
    prisma.list.create({ data: { title: 'Archive', position: 2, boardId: board6.id } }),
  ]);

  // Board 7 — Client Rebrand (4 lists)
  const [b7Discovery, b7Design, b7Feedback, b7Approved] = await Promise.all([
    prisma.list.create({ data: { title: 'Discovery', position: 0, boardId: board7.id } }),
    prisma.list.create({ data: { title: 'Design', position: 1, boardId: board7.id } }),
    prisma.list.create({ data: { title: 'Client Feedback', position: 2, boardId: board7.id } }),
    prisma.list.create({ data: { title: 'Approved', position: 3, boardId: board7.id } }),
  ]);

  console.log('✅ Lists created across 7 boards');

  // ═══════════════════════════════════════════════════════════════
  // 8. TASKS (65+ tasks across all boards, with due dates)
  // ═══════════════════════════════════════════════════════════════

  // --- Board 1: Product Launch Q1 (15 tasks) ---
  const b1Tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Design landing page mockups', description: 'Create high-fidelity mockups for the new landing page with responsive designs for desktop, tablet, and mobile', priority: 'high', listId: b1InProg.id, position: 0, dueDate: daysFromNow(3) } }),
    prisma.task.create({ data: { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment to staging and production', priority: 'urgent', listId: b1InProg.id, position: 1, dueDate: daysFromNow(1) } }),
    prisma.task.create({ data: { title: 'Write API documentation', description: 'Document all REST endpoints with request/response examples using OpenAPI spec', priority: 'medium', listId: b1Todo.id, position: 0, dueDate: daysFromNow(7) } }),
    prisma.task.create({ data: { title: 'Implement user authentication', description: 'Add JWT-based authentication with refresh tokens and social login support', priority: 'high', listId: b1Done.id, position: 0, dueDate: daysAgo(5) } }),
    prisma.task.create({ data: { title: 'Database schema optimization', description: 'Review and optimize database indexes for better query performance on user and task tables', priority: 'medium', listId: b1Todo.id, position: 1, dueDate: daysFromNow(10) } }),
    prisma.task.create({ data: { title: 'Create onboarding flow', description: 'Design and implement the new user onboarding experience with interactive tooltips', priority: 'high', listId: b1Backlog.id, position: 0, dueDate: daysFromNow(14) } }),
    prisma.task.create({ data: { title: 'Fix login redirect bug', description: 'Users are not being redirected after successful login on mobile Safari and Chrome', priority: 'urgent', listId: b1Review.id, position: 0, dueDate: daysFromNow(0) } }),
    prisma.task.create({ data: { title: 'Add dark mode support', description: 'Implement dark mode theme toggle across all components with system preference detection', priority: 'low', listId: b1Done.id, position: 1, dueDate: daysAgo(3) } }),
    prisma.task.create({ data: { title: 'Performance audit', description: 'Run Lighthouse audit and fix performance issues. Target: 90+ on all metrics', priority: 'medium', listId: b1Backlog.id, position: 1, dueDate: daysFromNow(21) } }),
    prisma.task.create({ data: { title: 'Set up monitoring dashboard', description: 'Configure Grafana dashboards for server monitoring with alerting', priority: 'medium', listId: b1Todo.id, position: 2, dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'Implement search functionality', description: 'Add full-text search across boards, tasks, and documents using PostgreSQL tsvector', priority: 'high', listId: b1Backlog.id, position: 2, dueDate: daysFromNow(18) } }),
    prisma.task.create({ data: { title: 'Create email templates', description: 'Design and code responsive email templates for notifications, invites, and digests', priority: 'medium', listId: b1InProg.id, position: 2, dueDate: daysFromNow(4) } }),
    prisma.task.create({ data: { title: 'Set up error tracking', description: 'Integrate Sentry for error tracking and alerting in production', priority: 'high', listId: b1Done.id, position: 2, dueDate: daysAgo(7) } }),
    prisma.task.create({ data: { title: 'Migrate to TypeScript strict mode', description: 'Enable strict TypeScript checking and fix all type errors across the codebase', priority: 'low', listId: b1Backlog.id, position: 3, dueDate: daysFromNow(30) } }),
    prisma.task.create({ data: { title: 'Implement file uploads', description: 'Add file upload support for task attachments using S3-compatible storage', priority: 'medium', listId: b1Todo.id, position: 3, dueDate: daysFromNow(12) } }),
  ]);

  // --- Board 2: Engineering Sprint (12 tasks) ---
  const b2Tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Refactor authentication module', description: 'Clean up auth code and add refresh token support with token rotation', priority: 'high', listId: b2Todo.id, position: 0, dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'Fix memory leak in WebSocket handler', description: 'Investigate and fix the memory leak causing server restarts every 4 hours', priority: 'urgent', listId: b2InProg.id, position: 0, dueDate: daysFromNow(1) } }),
    prisma.task.create({ data: { title: 'Update dependencies', description: 'Update all npm packages to latest stable versions, test for breaking changes', priority: 'low', listId: b2Done.id, position: 0, dueDate: daysAgo(2) } }),
    prisma.task.create({ data: { title: 'Add rate limiting middleware', description: 'Implement rate limiting on API endpoints to prevent abuse. Use sliding window algorithm', priority: 'high', listId: b2Todo.id, position: 1, dueDate: daysFromNow(4) } }),
    prisma.task.create({ data: { title: 'Fix N+1 query in task listing', description: 'Optimize Prisma queries to avoid N+1 problem when loading tasks with assignees', priority: 'medium', listId: b2InProg.id, position: 1, dueDate: daysFromNow(2) } }),
    prisma.task.create({ data: { title: 'Implement WebSocket reconnection', description: 'Add automatic reconnection with exponential backoff for Socket.io clients', priority: 'medium', listId: b2Testing.id, position: 0, dueDate: daysFromNow(3) } }),
    prisma.task.create({ data: { title: 'Add input validation', description: 'Add Zod validation schemas for all API request bodies and query params', priority: 'high', listId: b2Todo.id, position: 2, dueDate: daysFromNow(6) } }),
    prisma.task.create({ data: { title: 'Set up database backups', description: 'Configure automated daily backups with point-in-time recovery', priority: 'medium', listId: b2Done.id, position: 1, dueDate: daysAgo(4) } }),
    prisma.task.create({ data: { title: 'Fix CORS issues on Safari', description: 'Safari blocks some cross-origin requests due to stricter cookie policies', priority: 'urgent', listId: b2InProg.id, position: 2, dueDate: daysFromNow(0) } }),
    prisma.task.create({ data: { title: 'Add health check endpoint', description: 'Create /health endpoint that checks DB connectivity and returns server status', priority: 'low', listId: b2Done.id, position: 2, dueDate: daysAgo(6) } }),
    prisma.task.create({ data: { title: 'Implement request logging', description: 'Add structured JSON logging for all API requests with correlation IDs', priority: 'medium', listId: b2Testing.id, position: 1, dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'Security audit fixes', description: 'Address findings from the security audit: XSS, CSRF, header hardening', priority: 'urgent', listId: b2Todo.id, position: 3, dueDate: daysFromNow(2) } }),
  ]);

  // --- Board 3: Marketing Campaign (10 tasks) ---
  const b3Tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Write blog post: Product Vision', description: 'Draft a 1500-word blog post about our product vision and roadmap for 2026', priority: 'high', listId: b3InProg.id, position: 0, dueDate: daysFromNow(2) } }),
    prisma.task.create({ data: { title: 'Design social media assets', description: 'Create branded graphics for Twitter, LinkedIn, and Instagram launch campaign', priority: 'medium', listId: b3Planned.id, position: 0, dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'Set up email newsletter', description: 'Configure Mailchimp automation for weekly product updates and tips', priority: 'medium', listId: b3InProg.id, position: 1, dueDate: daysFromNow(4) } }),
    prisma.task.create({ data: { title: 'Competitor analysis report', description: 'Research and document features, pricing, and positioning of top 5 competitors', priority: 'high', listId: b3Published.id, position: 0, dueDate: daysAgo(3) } }),
    prisma.task.create({ data: { title: 'Create product demo video', description: '3-minute walkthrough video showing key features for the website and social media', priority: 'high', listId: b3Ideas.id, position: 0, dueDate: daysFromNow(10) } }),
    prisma.task.create({ data: { title: 'Launch Twitter/X campaign', description: 'Schedule 20 tweets over 2 weeks with product teasers and launch countdown', priority: 'medium', listId: b3Planned.id, position: 1, dueDate: daysFromNow(7) } }),
    prisma.task.create({ data: { title: 'Write press release', description: 'Draft press release for product launch, target: TechCrunch, TheVerge, ProductHunt', priority: 'high', listId: b3Planned.id, position: 2, dueDate: daysFromNow(6) } }),
    prisma.task.create({ data: { title: 'Set up analytics tracking', description: 'Configure Google Analytics 4, Mixpanel events, and conversion funnels', priority: 'medium', listId: b3Published.id, position: 1, dueDate: daysAgo(1) } }),
    prisma.task.create({ data: { title: 'Influencer outreach list', description: 'Build a list of 50 tech influencers and draft personalized outreach emails', priority: 'low', listId: b3Ideas.id, position: 1, dueDate: daysFromNow(14) } }),
    prisma.task.create({ data: { title: 'A/B test landing page headlines', description: 'Create 3 headline variants and run an A/B test for 1 week', priority: 'medium', listId: b3Ideas.id, position: 2, dueDate: daysFromNow(8) } }),
  ]);

  // --- Board 4: Customer Support (10 tasks) ---
  const b4Tasks = await Promise.all([
    prisma.task.create({ data: { title: 'User cannot export CSV reports', description: 'Customer reports export button returns 500 error. Affects Enterprise plan users.', priority: 'urgent', listId: b4New.id, position: 0, dueDate: daysFromNow(1) } }),
    prisma.task.create({ data: { title: 'Password reset email not received', description: 'Multiple users reporting they never receive password reset emails. Check SMTP config.', priority: 'high', listId: b4InProg.id, position: 0, dueDate: daysFromNow(0) } }),
    prisma.task.create({ data: { title: 'Invoice discrepancy for account #4521', description: 'Customer billed twice for February. Need to issue credit and fix billing system.', priority: 'urgent', listId: b4InProg.id, position: 1, dueDate: daysFromNow(0) } }),
    prisma.task.create({ data: { title: 'Feature request: Gantt chart view', description: 'Multiple enterprise customers requesting Gantt chart view for project planning', priority: 'low', listId: b4Waiting.id, position: 0, dueDate: daysFromNow(30) } }),
    prisma.task.create({ data: { title: 'API rate limit too restrictive', description: 'Customer reports integration failing due to 100 req/min limit. Consider increase for paid plans.', priority: 'medium', listId: b4New.id, position: 1, dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'SSO login failing for Okta users', description: 'SAML assertion errors when using Okta as IDP. Works fine with Azure AD.', priority: 'high', listId: b4New.id, position: 2, dueDate: daysFromNow(2) } }),
    prisma.task.create({ data: { title: 'Mobile app crash on Android 14', description: 'App crashes on launch for Samsung Galaxy S24 users running Android 14.', priority: 'urgent', listId: b4InProg.id, position: 2, dueDate: daysFromNow(1) } }),
    prisma.task.create({ data: { title: 'Resolved: Timezone display bug', description: 'Due dates were showing in UTC instead of user local timezone. Fixed in v2.3.1.', priority: 'medium', listId: b4Resolved.id, position: 0, dueDate: daysAgo(5) } }),
    prisma.task.create({ data: { title: 'Resolved: Webhook delivery delays', description: 'Webhook events were delayed by 5-10 minutes. Fixed by switching to async queue.', priority: 'high', listId: b4Resolved.id, position: 1, dueDate: daysAgo(3) } }),
    prisma.task.create({ data: { title: 'Account deletion request', description: 'User requesting full GDPR data deletion. Need to process within 30 days.', priority: 'medium', listId: b4Waiting.id, position: 1, dueDate: daysFromNow(20) } }),
  ]);

  // --- Board 5: Mobile App MVP (10 tasks) ---
  const b5Tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Set up React Native project', description: 'Initialize React Native project with TypeScript, navigation, and state management', priority: 'high', listId: b5Done.id, position: 0, dueDate: daysAgo(10) } }),
    prisma.task.create({ data: { title: 'Design app wireframes', description: 'Create wireframes for all 12 screens: auth, home, boards, tasks, settings, profile', priority: 'high', listId: b5Done.id, position: 1, dueDate: daysAgo(7) } }),
    prisma.task.create({ data: { title: 'Implement auth screens', description: 'Login, signup, forgot password screens with form validation and biometric support', priority: 'high', listId: b5InProg.id, position: 0, dueDate: daysFromNow(3) } }),
    prisma.task.create({ data: { title: 'Build board list view', description: 'Scrollable list of boards with search, pull-to-refresh, and skeleton loading', priority: 'medium', listId: b5InProg.id, position: 1, dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'Implement push notifications', description: 'Set up Firebase Cloud Messaging for both iOS and Android push notifications', priority: 'high', listId: b5Sprint.id, position: 0, dueDate: daysFromNow(8) } }),
    prisma.task.create({ data: { title: 'Offline mode support', description: 'Cache tasks locally using MMKV and sync when back online', priority: 'medium', listId: b5Backlog.id, position: 0, dueDate: daysFromNow(20) } }),
    prisma.task.create({ data: { title: 'Task drag and drop', description: 'Implement drag-and-drop to reorder tasks and move between lists on mobile', priority: 'medium', listId: b5Sprint.id, position: 1, dueDate: daysFromNow(10) } }),
    prisma.task.create({ data: { title: 'Dark mode support', description: 'Add dark mode following system preference with manual override option', priority: 'low', listId: b5Backlog.id, position: 1, dueDate: daysFromNow(25) } }),
    prisma.task.create({ data: { title: 'App icon and splash screen', description: 'Design and implement app icon (iOS + Android) and animated splash screen', priority: 'medium', listId: b5Sprint.id, position: 2, dueDate: daysFromNow(6) } }),
    prisma.task.create({ data: { title: 'Beta release to TestFlight', description: 'Prepare and submit first beta build to TestFlight and Google Play internal testing', priority: 'high', listId: b5Backlog.id, position: 2, dueDate: daysFromNow(15) } }),
  ]);

  // --- Board 6: Research & Ideas (5 tasks) ---
  const b6Tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Evaluate AI summarization APIs', description: 'Compare OpenAI, Anthropic, and Cohere for automatic task summarization feature', priority: 'medium', listId: b6Research.id, position: 0, dueDate: daysFromNow(14) } }),
    prisma.task.create({ data: { title: 'Research multiplayer collaboration', description: 'Investigate CRDTs vs OT for real-time collaborative editing (like Google Docs)', priority: 'high', listId: b6Research.id, position: 1, dueDate: daysFromNow(10) } }),
    prisma.task.create({ data: { title: 'Evaluate graph databases for tasks', description: 'Test Neo4j and DGraph for modeling task dependencies and project DAGs', priority: 'low', listId: b6Evaluate.id, position: 0, dueDate: daysFromNow(21) } }),
    prisma.task.create({ data: { title: 'POC: Voice commands for task creation', description: 'Build proof of concept using Web Speech API for voice-to-task creation', priority: 'low', listId: b6Research.id, position: 2, dueDate: daysFromNow(28) } }),
    prisma.task.create({ data: { title: 'Archived: Calendar sync research', description: 'Evaluated Google Calendar and Outlook sync. Decision: Defer to Q3.', priority: 'medium', listId: b6Archive.id, position: 0, dueDate: daysAgo(14) } }),
  ]);

  // --- Board 7: Client Rebrand (8 tasks) ---
  const b7Tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Brand discovery workshop notes', description: 'Document findings from 2-day brand workshop with TechNova leadership team', priority: 'high', listId: b7Approved.id, position: 0, dueDate: daysAgo(10) } }),
    prisma.task.create({ data: { title: 'Mood board and style tiles', description: 'Create 3 mood boards exploring different visual directions: modern, bold, playful', priority: 'high', listId: b7Approved.id, position: 1, dueDate: daysAgo(5) } }),
    prisma.task.create({ data: { title: 'Logo design - 5 concepts', description: 'Present 5 logo concepts with rationale. Client prefers wordmark or lettermark style', priority: 'high', listId: b7Feedback.id, position: 0, dueDate: daysFromNow(2) } }),
    prisma.task.create({ data: { title: 'Color palette finalization', description: 'Define primary (2), secondary (3), and neutral colors. Include accessibility checks', priority: 'medium', listId: b7Design.id, position: 0, dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'Typography selection', description: 'Select heading and body typefaces. Must have good screen rendering and language support', priority: 'medium', listId: b7Design.id, position: 1, dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'Business card and stationery design', description: 'Design business cards, letterhead, and envelope with new brand identity', priority: 'low', listId: b7Discovery.id, position: 0, dueDate: daysFromNow(15) } }),
    prisma.task.create({ data: { title: 'Brand guidelines document', description: 'Create comprehensive 40-page brand guidelines PDF covering logo, color, typography, imagery, tone', priority: 'high', listId: b7Discovery.id, position: 1, dueDate: daysFromNow(20) } }),
    prisma.task.create({ data: { title: 'Website redesign mockups', description: 'Full website redesign using new brand. 8 pages: home, about, services, blog, contact, pricing, careers, FAQ', priority: 'high', listId: b7Design.id, position: 2, dueDate: daysFromNow(12) } }),
  ]);

  console.log('✅ 70 Tasks created across 7 boards');

  // ═══════════════════════════════════════════════════════════════
  // 9. TASK ASSIGNEES (comprehensive assignments)
  // ═══════════════════════════════════════════════════════════════
  await prisma.taskAssignee.createMany({
    data: [
      // Board 1 — Product Launch
      { taskId: b1Tasks[0].id, userId: demo.id },
      { taskId: b1Tasks[0].id, userId: sarah.id },
      { taskId: b1Tasks[1].id, userId: john.id },
      { taskId: b1Tasks[1].id, userId: mike.id },
      { taskId: b1Tasks[2].id, userId: demo.id },
      { taskId: b1Tasks[3].id, userId: john.id },
      { taskId: b1Tasks[3].id, userId: demo.id },
      { taskId: b1Tasks[4].id, userId: sarah.id },
      { taskId: b1Tasks[5].id, userId: demo.id },
      { taskId: b1Tasks[6].id, userId: demo.id },
      { taskId: b1Tasks[6].id, userId: mike.id },
      { taskId: b1Tasks[7].id, userId: sarah.id },
      { taskId: b1Tasks[8].id, userId: mike.id },
      { taskId: b1Tasks[9].id, userId: demo.id },
      { taskId: b1Tasks[10].id, userId: demo.id },
      { taskId: b1Tasks[10].id, userId: john.id },
      { taskId: b1Tasks[11].id, userId: sarah.id },
      { taskId: b1Tasks[12].id, userId: john.id },
      { taskId: b1Tasks[13].id, userId: mike.id },
      { taskId: b1Tasks[14].id, userId: demo.id },
      // Board 2 — Engineering Sprint
      { taskId: b2Tasks[0].id, userId: demo.id },
      { taskId: b2Tasks[1].id, userId: alex.id },
      { taskId: b2Tasks[1].id, userId: demo.id },
      { taskId: b2Tasks[2].id, userId: john.id },
      { taskId: b2Tasks[3].id, userId: demo.id },
      { taskId: b2Tasks[4].id, userId: alex.id },
      { taskId: b2Tasks[5].id, userId: john.id },
      { taskId: b2Tasks[6].id, userId: demo.id },
      { taskId: b2Tasks[7].id, userId: alex.id },
      { taskId: b2Tasks[8].id, userId: demo.id },
      { taskId: b2Tasks[9].id, userId: john.id },
      { taskId: b2Tasks[10].id, userId: alex.id },
      { taskId: b2Tasks[11].id, userId: demo.id },
      { taskId: b2Tasks[11].id, userId: john.id },
      // Board 3 — Marketing
      { taskId: b3Tasks[0].id, userId: john.id },
      { taskId: b3Tasks[1].id, userId: emma.id },
      { taskId: b3Tasks[2].id, userId: john.id },
      { taskId: b3Tasks[3].id, userId: emma.id },
      { taskId: b3Tasks[3].id, userId: demo.id },
      { taskId: b3Tasks[4].id, userId: john.id },
      { taskId: b3Tasks[5].id, userId: emma.id },
      { taskId: b3Tasks[6].id, userId: john.id },
      { taskId: b3Tasks[7].id, userId: demo.id },
      { taskId: b3Tasks[8].id, userId: emma.id },
      { taskId: b3Tasks[9].id, userId: john.id },
      // Board 4 — Customer Support
      { taskId: b4Tasks[0].id, userId: sarah.id },
      { taskId: b4Tasks[1].id, userId: mike.id },
      { taskId: b4Tasks[2].id, userId: sarah.id },
      { taskId: b4Tasks[2].id, userId: alex.id },
      { taskId: b4Tasks[3].id, userId: demo.id },
      { taskId: b4Tasks[4].id, userId: alex.id },
      { taskId: b4Tasks[5].id, userId: mike.id },
      { taskId: b4Tasks[6].id, userId: sarah.id },
      { taskId: b4Tasks[6].id, userId: mike.id },
      { taskId: b4Tasks[7].id, userId: alex.id },
      { taskId: b4Tasks[8].id, userId: sarah.id },
      { taskId: b4Tasks[9].id, userId: demo.id },
      // Board 5 — Mobile App
      { taskId: b5Tasks[0].id, userId: demo.id },
      { taskId: b5Tasks[1].id, userId: demo.id },
      { taskId: b5Tasks[1].id, userId: sarah.id },
      { taskId: b5Tasks[2].id, userId: demo.id },
      { taskId: b5Tasks[3].id, userId: mike.id },
      { taskId: b5Tasks[4].id, userId: demo.id },
      { taskId: b5Tasks[5].id, userId: mike.id },
      { taskId: b5Tasks[6].id, userId: demo.id },
      { taskId: b5Tasks[7].id, userId: sarah.id },
      { taskId: b5Tasks[8].id, userId: sarah.id },
      { taskId: b5Tasks[9].id, userId: demo.id },
      // Board 6 — Research
      { taskId: b6Tasks[0].id, userId: sarah.id },
      { taskId: b6Tasks[1].id, userId: demo.id },
      { taskId: b6Tasks[2].id, userId: sarah.id },
      { taskId: b6Tasks[3].id, userId: demo.id },
      { taskId: b6Tasks[4].id, userId: sarah.id },
      // Board 7 — Client Rebrand
      { taskId: b7Tasks[0].id, userId: john.id },
      { taskId: b7Tasks[1].id, userId: emma.id },
      { taskId: b7Tasks[2].id, userId: john.id },
      { taskId: b7Tasks[2].id, userId: emma.id },
      { taskId: b7Tasks[3].id, userId: emma.id },
      { taskId: b7Tasks[4].id, userId: john.id },
      { taskId: b7Tasks[5].id, userId: demo.id },
      { taskId: b7Tasks[6].id, userId: john.id },
      { taskId: b7Tasks[6].id, userId: emma.id },
      { taskId: b7Tasks[7].id, userId: emma.id },
      { taskId: b7Tasks[7].id, userId: demo.id },
    ],
  });

  console.log('✅ Task assignees added');

  // ═══════════════════════════════════════════════════════════════
  // 10. TASK LABELS
  // ═══════════════════════════════════════════════════════════════
  await prisma.taskLabel.createMany({
    data: [
      // Board 1
      { taskId: b1Tasks[0].id, labelId: labelsB1[1].id },  // Feature
      { taskId: b1Tasks[0].id, labelId: labelsB1[5].id },  // Design
      { taskId: b1Tasks[1].id, labelId: labelsB1[2].id },  // Enhancement
      { taskId: b1Tasks[2].id, labelId: labelsB1[3].id },  // Documentation
      { taskId: b1Tasks[3].id, labelId: labelsB1[1].id },  // Feature
      { taskId: b1Tasks[5].id, labelId: labelsB1[1].id },  // Feature
      { taskId: b1Tasks[5].id, labelId: labelsB1[5].id },  // Design
      { taskId: b1Tasks[6].id, labelId: labelsB1[0].id },  // Bug
      { taskId: b1Tasks[6].id, labelId: labelsB1[4].id },  // Urgent
      { taskId: b1Tasks[7].id, labelId: labelsB1[2].id },  // Enhancement
      { taskId: b1Tasks[10].id, labelId: labelsB1[1].id }, // Feature
      { taskId: b1Tasks[11].id, labelId: labelsB1[5].id }, // Design
      { taskId: b1Tasks[12].id, labelId: labelsB1[2].id }, // Enhancement
      { taskId: b1Tasks[14].id, labelId: labelsB1[1].id }, // Feature
      // Board 2
      { taskId: b2Tasks[0].id, labelId: labelsB2[1].id },  // Refactor
      { taskId: b2Tasks[1].id, labelId: labelsB2[0].id },  // Hotfix
      { taskId: b2Tasks[1].id, labelId: labelsB2[2].id },  // Performance
      { taskId: b2Tasks[4].id, labelId: labelsB2[2].id },  // Performance
      { taskId: b2Tasks[8].id, labelId: labelsB2[0].id },  // Hotfix
      { taskId: b2Tasks[11].id, labelId: labelsB2[3].id }, // Security
      // Board 3
      { taskId: b3Tasks[0].id, labelId: labelsB3[1].id },  // Content
      { taskId: b3Tasks[1].id, labelId: labelsB3[0].id },  // Social Media
      { taskId: b3Tasks[2].id, labelId: labelsB3[3].id },  // Email
      { taskId: b3Tasks[5].id, labelId: labelsB3[0].id },  // Social Media
      { taskId: b3Tasks[7].id, labelId: labelsB3[2].id },  // Analytics
      // Board 4
      { taskId: b4Tasks[0].id, labelId: labelsB4[0].id },  // Critical
      { taskId: b4Tasks[0].id, labelId: labelsB4[2].id },  // Technical
      { taskId: b4Tasks[1].id, labelId: labelsB4[2].id },  // Technical
      { taskId: b4Tasks[2].id, labelId: labelsB4[1].id },  // Billing
      { taskId: b4Tasks[2].id, labelId: labelsB4[0].id },  // Critical
      { taskId: b4Tasks[3].id, labelId: labelsB4[3].id },  // Feedback
      { taskId: b4Tasks[5].id, labelId: labelsB4[2].id },  // Technical
      { taskId: b4Tasks[6].id, labelId: labelsB4[0].id },  // Critical
      // Board 5
      { taskId: b5Tasks[2].id, labelId: labelsB5[0].id },  // iOS
      { taskId: b5Tasks[2].id, labelId: labelsB5[1].id },  // Android
      { taskId: b5Tasks[3].id, labelId: labelsB5[2].id },  // UI/UX
      { taskId: b5Tasks[4].id, labelId: labelsB5[3].id },  // Backend
      { taskId: b5Tasks[6].id, labelId: labelsB5[2].id },  // UI/UX
    ],
  });

  console.log('✅ Task labels added');

  // ═══════════════════════════════════════════════════════════════
  // 11. COMMENTS (rich conversation threads)
  // ═══════════════════════════════════════════════════════════════
  await prisma.comment.createMany({
    data: [
      // Board 1 task threads
      { content: 'Great progress on the mockups! The responsive design looks solid.', taskId: b1Tasks[0].id, userId: john.id, createdAt: daysAgo(2) },
      { content: 'Can we add a hero section with an animated illustration? I saw something similar on Linear.', taskId: b1Tasks[0].id, userId: sarah.id, createdAt: daysAgo(2) },
      { content: 'Good idea! I\'ll prototype it with Framer Motion. Should have something by EOD.', taskId: b1Tasks[0].id, userId: demo.id, createdAt: daysAgo(1) },
      { content: 'I\'ve set up the basic pipeline. Need to add test coverage step and deployment gate.', taskId: b1Tasks[1].id, userId: john.id, createdAt: daysAgo(3) },
      { content: 'Make sure to include the lint check before tests. We had issues last sprint.', taskId: b1Tasks[1].id, userId: mike.id, createdAt: daysAgo(3) },
      { content: 'Added! Also configured Codecov for coverage reporting. PR is up for review.', taskId: b1Tasks[1].id, userId: john.id, createdAt: daysAgo(2) },
      { content: 'This needs to be done ASAP - blocking other features and affecting conversion.', taskId: b1Tasks[6].id, userId: demo.id, createdAt: daysAgo(1) },
      { content: 'Found the root cause - it\'s a race condition in the auth middleware. Fix incoming.', taskId: b1Tasks[6].id, userId: mike.id, createdAt: hoursAgo(18) },
      { content: 'Fix is deployed to staging. Can someone verify on iOS Safari?', taskId: b1Tasks[6].id, userId: mike.id, createdAt: hoursAgo(8) },
      { content: 'Tested on iPhone 15. Working correctly now. LGTM for prod deployment!', taskId: b1Tasks[6].id, userId: demo.id, createdAt: hoursAgo(5) },
      { content: 'Sentry is now capturing errors. Already caught 3 unhandled promises in production.', taskId: b1Tasks[12].id, userId: john.id, createdAt: daysAgo(7) },
      { content: 'Should we use Swagger or Redoc for the API docs site?', taskId: b1Tasks[2].id, userId: demo.id, createdAt: daysAgo(1) },
      { content: 'Redoc looks cleaner and supports dark mode. Let\'s go with that.', taskId: b1Tasks[2].id, userId: john.id, createdAt: hoursAgo(20) },
      // Board 2 task threads
      { content: 'Heap snapshot shows event listeners piling up. Each WebSocket connection adds ~50.', taskId: b2Tasks[1].id, userId: alex.id, createdAt: daysAgo(2) },
      { content: 'Found it - we\'re not cleaning up listeners on disconnect. Fix PR: #342', taskId: b2Tasks[1].id, userId: demo.id, createdAt: daysAgo(1) },
      { content: 'Memory usage dropped from 1.2GB to 200MB after the fix. Monitoring for 24hrs.', taskId: b2Tasks[1].id, userId: alex.id, createdAt: hoursAgo(12) },
      { content: 'After 24 hours: stable at 180-220MB. Shipping to production tonight.', taskId: b2Tasks[1].id, userId: alex.id, createdAt: hoursAgo(2) },
      { content: 'Using Zod for runtime validation. Much cleaner than manual checks.', taskId: b2Tasks[6].id, userId: demo.id, createdAt: daysAgo(1) },
      { content: 'OWASP scan results are in. 2 critical, 5 medium findings. Let\'s triage together.', taskId: b2Tasks[11].id, userId: john.id, createdAt: hoursAgo(6) },
      // Board 3 marketing chat
      { content: 'Draft is ready for review. Focused on our collaboration differentiators.', taskId: b3Tasks[0].id, userId: john.id, createdAt: daysAgo(1) },
      { content: 'Love the angle! Can we add a customer quote from the beta program?', taskId: b3Tasks[0].id, userId: emma.id, createdAt: hoursAgo(10) },
      { content: 'ProductHunt launch prep is crucial. Let\'s aim for a Thursday launch for max visibility.', taskId: b3Tasks[6].id, userId: john.id, createdAt: daysAgo(2) },
      // Board 4 support threads
      { content: 'Customer is on Enterprise plan and needs this resolved within 24 hours per SLA.', taskId: b4Tasks[0].id, userId: sarah.id, createdAt: hoursAgo(8) },
      { content: 'Root cause: new CSV library doesn\'t handle null dates. Hotfix deployed.', taskId: b4Tasks[0].id, userId: alex.id, createdAt: hoursAgo(4) },
      { content: 'SMTP logs show emails being sent but bouncing. Checking SPF/DKIM records.', taskId: b4Tasks[1].id, userId: mike.id, createdAt: hoursAgo(6) },
      { content: 'SPF record was missing the Mailgun IP. Updated DNS. Should propagate in 1-2 hours.', taskId: b4Tasks[1].id, userId: mike.id, createdAt: hoursAgo(3) },
      // Board 5 mobile dev
      { content: 'Navigation is set up with React Navigation 6. Using native stack for performance.', taskId: b5Tasks[2].id, userId: demo.id, createdAt: daysAgo(3) },
      { content: 'Added biometric auth with expo-local-authentication. Works on both platforms!', taskId: b5Tasks[2].id, userId: demo.id, createdAt: daysAgo(1) },
      // Board 7 design feedback
      { content: 'Client loved Direction B - the bold geometric approach. Let\'s refine that one.', taskId: b7Tasks[2].id, userId: john.id, createdAt: daysAgo(1) },
      { content: 'Narrowing down to 2 concepts. Scheduling a review call for Thursday.', taskId: b7Tasks[2].id, userId: emma.id, createdAt: hoursAgo(8) },
      { content: 'Accessibility check passed for all color combinations at WCAG AA level.', taskId: b7Tasks[3].id, userId: emma.id, createdAt: hoursAgo(4) },
    ],
  });

  console.log('✅ 31 Comments added');

  // ═══════════════════════════════════════════════════════════════
  // 12. ACTIVITIES (rich audit trail)
  // ═══════════════════════════════════════════════════════════════
  await prisma.activity.createMany({
    data: [
      // Board 1 activities
      { type: 'board_created', description: 'created the board', boardId: board1.id, userId: demo.id, createdAt: daysAgo(30) },
      { type: 'member_joined', description: 'joined the board', boardId: board1.id, userId: john.id, createdAt: daysAgo(29) },
      { type: 'member_joined', description: 'joined the board', boardId: board1.id, userId: sarah.id, createdAt: daysAgo(28) },
      { type: 'member_joined', description: 'joined the board', boardId: board1.id, userId: mike.id, createdAt: daysAgo(27) },
      { type: 'task_created', description: 'created task "Design landing page mockups"', boardId: board1.id, userId: demo.id, taskId: b1Tasks[0].id, createdAt: daysAgo(15) },
      { type: 'task_created', description: 'created task "Set up CI/CD pipeline"', boardId: board1.id, userId: john.id, taskId: b1Tasks[1].id, createdAt: daysAgo(14) },
      { type: 'task_created', description: 'created task "Implement user authentication"', boardId: board1.id, userId: demo.id, taskId: b1Tasks[3].id, createdAt: daysAgo(20) },
      { type: 'task_moved', description: 'moved "Implement user authentication" to Done', boardId: board1.id, userId: john.id, taskId: b1Tasks[3].id, createdAt: daysAgo(5) },
      { type: 'task_moved', description: 'moved "Add dark mode support" to Done', boardId: board1.id, userId: sarah.id, taskId: b1Tasks[7].id, createdAt: daysAgo(3) },
      { type: 'comment_added', description: 'commented on "Design landing page mockups"', boardId: board1.id, userId: sarah.id, taskId: b1Tasks[0].id, createdAt: daysAgo(2) },
      { type: 'task_created', description: 'created task "Create email templates"', boardId: board1.id, userId: demo.id, taskId: b1Tasks[11].id, createdAt: daysAgo(5) },
      { type: 'task_moved', description: 'moved "Fix login redirect bug" to Review', boardId: board1.id, userId: mike.id, taskId: b1Tasks[6].id, createdAt: hoursAgo(8) },
      // Board 2 activities
      { type: 'board_created', description: 'created the board', boardId: board2.id, userId: demo.id, createdAt: daysAgo(25) },
      { type: 'member_joined', description: 'joined the board', boardId: board2.id, userId: john.id, createdAt: daysAgo(24) },
      { type: 'member_joined', description: 'joined the board', boardId: board2.id, userId: alex.id, createdAt: daysAgo(20) },
      { type: 'task_moved', description: 'moved "Update dependencies" to Done', boardId: board2.id, userId: john.id, taskId: b2Tasks[2].id, createdAt: daysAgo(2) },
      { type: 'task_created', description: 'created task "Security audit fixes"', boardId: board2.id, userId: demo.id, taskId: b2Tasks[11].id, createdAt: daysAgo(1) },
      // Board 3 activities
      { type: 'board_created', description: 'created the board', boardId: board3.id, userId: john.id, createdAt: daysAgo(20) },
      { type: 'member_joined', description: 'joined the board', boardId: board3.id, userId: demo.id, createdAt: daysAgo(19) },
      { type: 'member_joined', description: 'joined the board', boardId: board3.id, userId: emma.id, createdAt: daysAgo(18) },
      { type: 'task_moved', description: 'moved "Competitor analysis report" to Published', boardId: board3.id, userId: emma.id, taskId: b3Tasks[3].id, createdAt: daysAgo(3) },
      // Board 4 activities
      { type: 'board_created', description: 'created the board', boardId: board4.id, userId: sarah.id, createdAt: daysAgo(15) },
      { type: 'task_created', description: 'created task "User cannot export CSV reports"', boardId: board4.id, userId: sarah.id, taskId: b4Tasks[0].id, createdAt: hoursAgo(8) },
      // Board 5 activities
      { type: 'board_created', description: 'created the board', boardId: board5.id, userId: demo.id, createdAt: daysAgo(14) },
      { type: 'task_moved', description: 'moved "Set up React Native project" to Done', boardId: board5.id, userId: demo.id, taskId: b5Tasks[0].id, createdAt: daysAgo(10) },
      // Board 7 activities
      { type: 'board_created', description: 'created the board', boardId: board7.id, userId: john.id, createdAt: daysAgo(21) },
      { type: 'task_moved', description: 'moved "Brand discovery workshop notes" to Approved', boardId: board7.id, userId: john.id, taskId: b7Tasks[0].id, createdAt: daysAgo(10) },
    ],
  });

  console.log('✅ 27 Activities added');

  // ═══════════════════════════════════════════════════════════════
  // 13. DOCUMENTS (6 documents across workspaces)
  // ═══════════════════════════════════════════════════════════════
  await prisma.document.createMany({
    data: [
      {
        title: 'Product Requirements Document',
        content: '<h1>Product Requirements Document</h1><h2>1. Overview</h2><p>TaskFlow is a real-time collaborative project management platform designed for modern engineering teams. It combines the simplicity of Trello with the power of Linear.</p><h2>2. Key Features</h2><ul><li><strong>Board Management:</strong> Kanban boards with drag-and-drop task management</li><li><strong>Real-time Collaboration:</strong> WebSocket-powered live updates across all connected clients</li><li><strong>Task Management:</strong> Rich task cards with descriptions, assignees, labels, priorities, and due dates</li><li><strong>Team Communication:</strong> Direct messaging and task comments</li><li><strong>Documents:</strong> Rich text documents for team knowledge base</li></ul><h2>3. Technical Stack</h2><ul><li>Frontend: React 18, TypeScript, TailwindCSS, Zustand</li><li>Backend: Node.js, Express, Prisma, SQLite</li><li>Real-time: Socket.io</li></ul><h2>4. User Personas</h2><p><strong>Engineering Manager:</strong> Needs visibility into team progress, sprint planning, and resource allocation.</p><p><strong>Developer:</strong> Wants a fast, keyboard-friendly interface with minimal friction for task updates.</p><p><strong>Designer:</strong> Needs visual boards with image attachments and design review workflows.</p><h2>5. Success Metrics</h2><ul><li>Daily Active Users &gt; 1000 within 3 months</li><li>Task completion rate &gt; 75%</li><li>Average session duration &gt; 15 minutes</li></ul>',
        workspaceId: ws1.id,
        createdBy: demo.id,
      },
      {
        title: 'API Design Guidelines',
        content: '<h1>API Design Guidelines</h1><h2>REST Conventions</h2><p>All API endpoints follow RESTful conventions with consistent naming and error handling.</p><h2>Authentication</h2><p>All endpoints require a valid JWT token in the Authorization header:</p><p><code>Authorization: Bearer &lt;token&gt;</code></p><h2>Response Format</h2><p>All responses follow this structure:</p><pre><code>{\n  "success": true,\n  "data": { ... },\n  "message": "Operation successful"\n}</code></pre><h2>Error Handling</h2><p>Errors return appropriate HTTP status codes:</p><ul><li><strong>400</strong> - Bad Request (validation errors)</li><li><strong>401</strong> - Unauthorized (invalid/missing token)</li><li><strong>403</strong> - Forbidden (insufficient permissions)</li><li><strong>404</strong> - Not Found</li><li><strong>500</strong> - Internal Server Error</li></ul><h2>Pagination</h2><p>List endpoints support pagination with <code>page</code> and <code>limit</code> query parameters. Default: page=1, limit=20.</p><h2>Rate Limiting</h2><p>API rate limit: 100 requests per minute per user. Enterprise plans: 1000 requests per minute.</p>',
        workspaceId: ws1.id,
        createdBy: demo.id,
      },
      {
        title: 'Sprint Retrospective - Week 6',
        content: '<h1>Sprint Retrospective - Week 6</h1><h2>What went well 🎉</h2><ul><li>Shipped WebSocket real-time updates ahead of schedule</li><li>Zero production incidents this sprint</li><li>New onboarding flow increased activation by 23%</li><li>Code review turnaround improved to &lt; 4 hours</li></ul><h2>What could improve 🔧</h2><ul><li>Need better test coverage for edge cases in drag-and-drop</li><li>Sprint planning estimates were off by 30% - need to re-calibrate</li><li>Documentation is falling behind - need dedicated time each sprint</li></ul><h2>Action Items ✅</h2><ul><li><strong>Demo:</strong> Set up automated E2E tests for critical user flows</li><li><strong>John:</strong> Create estimation guidelines document</li><li><strong>Sarah:</strong> Schedule weekly documentation review sessions</li><li><strong>Mike:</strong> Investigate Playwright for E2E testing</li></ul><h2>Team Velocity</h2><p>Completed: <strong>34 story points</strong> (target: 30)</p><p>Carry over: <strong>8 story points</strong> (2 tasks)</p>',
        workspaceId: ws1.id,
        createdBy: john.id,
      },
      {
        title: 'Mobile App Architecture',
        content: '<h1>Mobile App Architecture</h1><h2>Tech Stack</h2><ul><li><strong>Framework:</strong> React Native 0.73 with Expo SDK 50</li><li><strong>State:</strong> Zustand + React Query for server state</li><li><strong>Navigation:</strong> React Navigation 6 (native stack)</li><li><strong>Storage:</strong> MMKV for local storage</li><li><strong>Networking:</strong> Axios + Socket.io client</li></ul><h2>Project Structure</h2><pre><code>src/\n├── screens/       # Screen components\n├── components/    # Reusable UI components\n├── navigation/    # Navigation configuration\n├── stores/        # Zustand stores\n├── api/          # API client and hooks\n├── hooks/        # Custom hooks\n├── utils/        # Utilities\n└── theme/        # Design tokens</code></pre><h2>Offline Strategy</h2><p>The app uses an offline-first approach:</p><ol><li>All data is cached locally using MMKV</li><li>Mutations are queued when offline</li><li>Automatic sync when connectivity resumes</li><li>Conflict resolution: last-write-wins with user notification</li></ol><h2>Performance Targets</h2><ul><li>Cold start: &lt; 2 seconds</li><li>Screen transitions: &lt; 300ms</li><li>API response rendering: &lt; 500ms</li></ul>',
        workspaceId: ws2.id,
        createdBy: demo.id,
      },
      {
        title: 'Marketing Launch Plan',
        content: '<h1>Marketing Launch Plan 2026</h1><h2>Launch Timeline</h2><ul><li><strong>Week 1-2:</strong> Build anticipation - teaser posts, email waitlist</li><li><strong>Week 3:</strong> Beta access for top 100 waitlist members</li><li><strong>Week 4:</strong> Public launch on ProductHunt + press coverage</li><li><strong>Week 5-8:</strong> Growth phase - paid ads, referral program</li></ul><h2>Channels</h2><ol><li><strong>ProductHunt:</strong> Thursday launch, hunter lined up, prep assets</li><li><strong>Twitter/X:</strong> 20-tweet launch thread + daily tips</li><li><strong>LinkedIn:</strong> Founder story + product demo</li><li><strong>HackerNews:</strong> Show HN post with technical deep-dive</li><li><strong>YouTube:</strong> 3-minute product demo video</li><li><strong>Email:</strong> Drip campaign for waitlist (5 emails over 2 weeks)</li></ol><h2>Budget</h2><ul><li>Paid social: $5,000/month</li><li>Influencer partnerships: $3,000</li><li>ProductHunt ship page: $500</li><li>Total Q1: $18,500</li></ul><h2>KPIs</h2><ul><li>Signups: 5,000 in first month</li><li>WAU: 2,000 by end of Q1</li><li>Conversion free→paid: 5%</li></ul>',
        workspaceId: ws1.id,
        createdBy: emma.id,
      },
      {
        title: 'TechNova Brand Guidelines Draft',
        content: '<h1>TechNova Brand Guidelines</h1><h2>Brand Essence</h2><p>TechNova represents the intersection of technology and innovation. The brand should feel <strong>bold</strong>, <strong>modern</strong>, and <strong>trustworthy</strong>.</p><h2>Logo Usage</h2><p>The TechNova logo comes in three variants:</p><ul><li><strong>Primary:</strong> Full wordmark in brand blue</li><li><strong>Icon:</strong> Geometric "T" mark for small sizes</li><li><strong>Reversed:</strong> White version for dark backgrounds</li></ul><p>Minimum clear space: 1x the height of the "T" on all sides.</p><h2>Color Palette</h2><p><strong>Primary:</strong></p><ul><li>Nova Blue: #2563EB</li><li>Deep Space: #1E293B</li></ul><p><strong>Secondary:</strong></p><ul><li>Electric Cyan: #06B6D4</li><li>Signal Green: #10B981</li><li>Warm Amber: #F59E0B</li></ul><h2>Typography</h2><ul><li><strong>Headings:</strong> Inter Bold/Semi-Bold</li><li><strong>Body:</strong> Inter Regular/Medium</li><li><strong>Code:</strong> JetBrains Mono</li></ul><h2>Voice & Tone</h2><p>TechNova communicates with confidence and clarity. We are technical but accessible, innovative but grounded.</p>',
        workspaceId: ws3.id,
        createdBy: john.id,
      },
    ],
  });

  console.log('✅ 6 Documents created');

  // ═══════════════════════════════════════════════════════════════
  // 14. NOTIFICATIONS (diverse types for demo user)
  // ═══════════════════════════════════════════════════════════════
  await prisma.notification.createMany({
    data: [
      // Unread notifications
      { type: 'task_assigned', title: 'New task assigned', message: 'Sarah assigned you to "Implement search functionality"', userId: demo.id, boardId: board1.id, taskId: b1Tasks[10].id, read: false, createdAt: hoursAgo(1) },
      { type: 'comment_added', title: 'New comment', message: 'Mike commented on "Fix login redirect bug": "Fix is deployed to staging."', userId: demo.id, boardId: board1.id, taskId: b1Tasks[6].id, read: false, createdAt: hoursAgo(2) },
      { type: 'task_due', title: 'Task due today', message: '"Fix login redirect bug" is due today', userId: demo.id, boardId: board1.id, taskId: b1Tasks[6].id, read: false, createdAt: hoursAgo(3) },
      { type: 'task_due', title: 'Task due tomorrow', message: '"Set up CI/CD pipeline" is due tomorrow', userId: demo.id, boardId: board1.id, taskId: b1Tasks[1].id, read: false, createdAt: hoursAgo(4) },
      { type: 'board_update', title: 'Board update', message: 'Alex joined "Engineering Sprint"', userId: demo.id, boardId: board2.id, read: false, createdAt: hoursAgo(5) },
      { type: 'comment_added', title: 'New comment', message: 'Alex commented on "Fix memory leak in WebSocket handler": "Memory usage dropped to 200MB"', userId: demo.id, boardId: board2.id, taskId: b2Tasks[1].id, read: false, createdAt: hoursAgo(6) },
      { type: 'task_assigned', title: 'New task assigned', message: 'John assigned you to "Security audit fixes"', userId: demo.id, boardId: board2.id, taskId: b2Tasks[11].id, read: false, createdAt: hoursAgo(8) },
      { type: 'mention', title: 'You were mentioned', message: 'Emma mentioned you in "Write blog post: Product Vision"', userId: demo.id, boardId: board3.id, taskId: b3Tasks[0].id, read: false, createdAt: hoursAgo(10) },
      { type: 'invitation_received', title: 'Board invitation', message: 'Sarah invited you to "Customer Support" board', userId: demo.id, boardId: board4.id, read: false, createdAt: hoursAgo(12) },
      { type: 'task_due', title: 'Task overdue!', message: '"Fix CORS issues on Safari" is overdue', userId: demo.id, boardId: board2.id, taskId: b2Tasks[8].id, read: false, createdAt: hoursAgo(1) },
      // Read notifications (older)
      { type: 'task_assigned', title: 'New task assigned', message: 'You were assigned to "Add dark mode support"', userId: demo.id, boardId: board1.id, taskId: b1Tasks[7].id, read: true, createdAt: daysAgo(5) },
      { type: 'board_update', title: 'Board update', message: 'Mike joined "Product Launch Q1"', userId: demo.id, boardId: board1.id, read: true, createdAt: daysAgo(7) },
      { type: 'comment_added', title: 'New comment', message: 'John commented on "Set up CI/CD pipeline"', userId: demo.id, boardId: board1.id, taskId: b1Tasks[1].id, read: true, createdAt: daysAgo(3) },
      { type: 'task_moved', title: 'Task completed', message: '"Implement user authentication" was moved to Done', userId: demo.id, boardId: board1.id, taskId: b1Tasks[3].id, read: true, createdAt: daysAgo(5) },
      { type: 'task_moved', title: 'Task completed', message: '"Update dependencies" was moved to Done', userId: demo.id, boardId: board2.id, taskId: b2Tasks[2].id, read: true, createdAt: daysAgo(2) },
      // Notifications for other users too
      { type: 'task_assigned', title: 'New task assigned', message: 'Demo assigned you to "Set up CI/CD pipeline"', userId: john.id, boardId: board1.id, taskId: b1Tasks[1].id, read: false, createdAt: hoursAgo(2) },
      { type: 'comment_added', title: 'New comment', message: 'Demo commented on "Design landing page mockups"', userId: sarah.id, boardId: board1.id, taskId: b1Tasks[0].id, read: false, createdAt: hoursAgo(5) },
      { type: 'task_due', title: 'Task due today', message: '"Password reset email not received" is due today', userId: mike.id, boardId: board4.id, taskId: b4Tasks[1].id, read: false, createdAt: hoursAgo(3) },
      { type: 'task_assigned', title: 'New task assigned', message: 'John assigned you to "Logo design - 5 concepts"', userId: emma.id, boardId: board7.id, taskId: b7Tasks[2].id, read: false, createdAt: hoursAgo(4) },
      { type: 'comment_added', title: 'New comment', message: 'Demo commented on "Fix memory leak in WebSocket handler"', userId: alex.id, boardId: board2.id, taskId: b2Tasks[1].id, read: false, createdAt: hoursAgo(6) },
    ],
  });

  console.log('✅ 20 Notifications created');

  // ═══════════════════════════════════════════════════════════════
  // 15. DIRECT MESSAGES (realistic conversation threads)
  // ═══════════════════════════════════════════════════════════════
  await prisma.directMessage.createMany({
    data: [
      // Demo ↔ John conversation (active, detailed)
      { senderId: john.id, receiverId: demo.id, content: 'Hey! Quick question about the CI/CD pipeline setup.', read: true, createdAt: daysAgo(3) },
      { senderId: demo.id, receiverId: john.id, content: 'Sure, what\'s up?', read: true, createdAt: daysAgo(3) },
      { senderId: john.id, receiverId: demo.id, content: 'Should we use GitHub Actions or GitLab CI? I have experience with both.', read: true, createdAt: daysAgo(3) },
      { senderId: demo.id, receiverId: john.id, content: 'Let\'s go with GitHub Actions since our repo is already on GitHub. Simpler integration.', read: true, createdAt: daysAgo(3) },
      { senderId: john.id, receiverId: demo.id, content: 'Makes sense. I\'ll set up the workflow file today. Should I include deployment to staging?', read: true, createdAt: daysAgo(2) },
      { senderId: demo.id, receiverId: john.id, content: 'Yes please! Auto-deploy to staging on merge to main. Production should require manual approval.', read: true, createdAt: daysAgo(2) },
      { senderId: john.id, receiverId: demo.id, content: 'Pipeline is live! First run passed all checks. PR is up for review: #156', read: true, createdAt: daysAgo(1) },
      { senderId: demo.id, receiverId: john.id, content: 'Nice work! I\'ll review it this afternoon. Also, can we chat about the sprint retro agenda?', read: true, createdAt: daysAgo(1) },
      { senderId: john.id, receiverId: demo.id, content: 'Sure! I was thinking we should discuss the estimation issues from this sprint.', read: true, createdAt: hoursAgo(20) },
      { senderId: john.id, receiverId: demo.id, content: 'Also, the security audit results came back. 2 critical findings we need to discuss.', read: false, createdAt: hoursAgo(6) },
      { senderId: john.id, receiverId: demo.id, content: 'Can you check the audit report when you get a chance? I\'ve shared it in the docs section.', read: false, createdAt: hoursAgo(3) },

      // Demo ↔ Sarah conversation
      { senderId: sarah.id, receiverId: demo.id, content: 'Hi! The landing page mockups are looking great. I have a few UX suggestions.', read: true, createdAt: daysAgo(2) },
      { senderId: demo.id, receiverId: sarah.id, content: 'Thanks! Love to hear your feedback. What do you think needs work?', read: true, createdAt: daysAgo(2) },
      { senderId: sarah.id, receiverId: demo.id, content: 'The CTA button could be more prominent. Also, the form fields need better error states.', read: true, createdAt: daysAgo(2) },
      { senderId: demo.id, receiverId: sarah.id, content: 'Good points. I\'ll increase the button size and add inline validation with red borders.', read: true, createdAt: daysAgo(1) },
      { senderId: sarah.id, receiverId: demo.id, content: 'Perfect! One more thing - can we add a testimonial section below the fold?', read: true, createdAt: daysAgo(1) },
      { senderId: demo.id, receiverId: sarah.id, content: 'Great idea. I\'ll add a carousel with 3 testimonials. Do we have real quotes from beta users?', read: true, createdAt: hoursAgo(18) },
      { senderId: sarah.id, receiverId: demo.id, content: 'Yes! I collected 5 great quotes last week. I\'ll send them over in a doc.', read: false, createdAt: hoursAgo(8) },

      // Demo ↔ Mike conversation
      { senderId: mike.id, receiverId: demo.id, content: 'Found the auth redirect bug. It\'s a race condition between the token refresh and route guard.', read: true, createdAt: daysAgo(1) },
      { senderId: demo.id, receiverId: mike.id, content: 'Ah, I suspected that. Do you have a fix in mind?', read: true, createdAt: daysAgo(1) },
      { senderId: mike.id, receiverId: demo.id, content: 'Yeah, we need to await the token refresh before the navigation guard runs. I\'ll submit a PR.', read: true, createdAt: daysAgo(1) },
      { senderId: mike.id, receiverId: demo.id, content: 'PR #189 is up. Fix is pretty clean - just needed to add an async gate to the router.', read: true, createdAt: hoursAgo(18) },
      { senderId: demo.id, receiverId: mike.id, content: 'Reviewing now... Looks great! One minor comment on the error handling edge case.', read: true, createdAt: hoursAgo(12) },
      { senderId: mike.id, receiverId: demo.id, content: 'Updated! Also deployed to staging for testing. Can you verify on iOS Safari?', read: false, createdAt: hoursAgo(5) },

      // Demo ↔ Emma conversation
      { senderId: emma.id, receiverId: demo.id, content: 'Hey Demo! I finished the social media assets. Want to take a look?', read: true, createdAt: daysAgo(1) },
      { senderId: demo.id, receiverId: emma.id, content: 'Absolutely! Where can I see them?', read: true, createdAt: daysAgo(1) },
      { senderId: emma.id, receiverId: demo.id, content: 'I\'ve uploaded them to the shared Figma. Link is in the Marketing board task.', read: true, createdAt: hoursAgo(22) },
      { senderId: emma.id, receiverId: demo.id, content: 'Also, the blog post draft needs a reviewer. Can you or John take a look?', read: false, createdAt: hoursAgo(10) },

      // Demo ↔ Alex conversation
      { senderId: alex.id, receiverId: demo.id, content: 'Memory leak fix is holding steady in production. Chart looks clean! 📉', read: false, createdAt: hoursAgo(2) },
      { senderId: alex.id, receiverId: demo.id, content: 'Ready to start on the rate limiting middleware next. Any preference for the algorithm?', read: false, createdAt: hoursAgo(1) },

      // John ↔ Sarah conversation
      { senderId: john.id, receiverId: sarah.id, content: 'Sarah, can you review the API docs? I want to make sure the examples are clear.', read: true, createdAt: daysAgo(1) },
      { senderId: sarah.id, receiverId: john.id, content: 'Sure! I\'ll go through them this afternoon. Any specific sections you\'re worried about?', read: true, createdAt: daysAgo(1) },
      { senderId: john.id, receiverId: sarah.id, content: 'The authentication flow section. It\'s complex and I want non-technical PMs to understand it.', read: true, createdAt: hoursAgo(20) },
      { senderId: sarah.id, receiverId: john.id, content: 'Reviewed! Added some comments. Overall very clear. Just a few terminology suggestions.', read: false, createdAt: hoursAgo(6) },

      // John ↔ Emma conversation
      { senderId: emma.id, receiverId: john.id, content: 'John, the logo concepts are ready for the TechNova rebrand. When can we review?', read: false, createdAt: hoursAgo(8) },
      { senderId: john.id, receiverId: emma.id, content: 'Let\'s schedule a call for tomorrow morning. I\'ll send a calendar invite.', read: true, createdAt: hoursAgo(7) },

      // Mike ↔ Alex conversation
      { senderId: mike.id, receiverId: alex.id, content: 'Hey Alex, did you see the WebSocket memory fix? Impressive debugging.', read: true, createdAt: hoursAgo(4) },
      { senderId: alex.id, receiverId: mike.id, content: 'Thanks! The heap snapshot tool in Chrome was super helpful for tracking it down.', read: true, createdAt: hoursAgo(3) },
    ],
  });

  console.log('✅ 38 Direct messages created');

  // ═══════════════════════════════════════════════════════════════
  // 16. FAVORITE BOARDS
  // ═══════════════════════════════════════════════════════════════
  await prisma.favoriteBoard.createMany({
    data: [
      { userId: demo.id, boardId: board1.id },
      { userId: demo.id, boardId: board3.id },
      { userId: demo.id, boardId: board5.id },
      { userId: john.id, boardId: board1.id },
      { userId: john.id, boardId: board7.id },
      { userId: sarah.id, boardId: board4.id },
      { userId: sarah.id, boardId: board6.id },
      { userId: emma.id, boardId: board3.id },
      { userId: emma.id, boardId: board7.id },
      { userId: alex.id, boardId: board2.id },
    ],
  });

  console.log('✅ 10 Favorite boards added');

  // ═══════════════════════════════════════════════════════════════
  // 17. INVITATIONS (pending + expired)
  // ═══════════════════════════════════════════════════════════════
  await prisma.invitation.createMany({
    data: [
      // Pending invitations
      { boardId: board1.id, inviterId: demo.id, inviteeEmail: 'newuser@example.com', role: 'member', status: 'pending', expiresAt: daysFromNow(7) },
      { boardId: board2.id, inviterId: demo.id, inviteeEmail: 'contractor@example.com', role: 'member', status: 'pending', expiresAt: daysFromNow(5) },
      { boardId: board3.id, inviterId: john.id, inviteeEmail: 'freelancer@example.com', role: 'member', status: 'pending', expiresAt: daysFromNow(3) },
      { boardId: board7.id, inviterId: john.id, inviteeEmail: 'designer@example.com', role: 'member', status: 'pending', expiresAt: daysFromNow(7) },
      // Accepted invitations (historical)
      { boardId: board1.id, inviterId: demo.id, inviteeEmail: 'sarah@taskflow.com', role: 'member', status: 'accepted', expiresAt: daysAgo(20) },
      { boardId: board4.id, inviterId: sarah.id, inviteeEmail: 'demo@taskflow.com', role: 'member', status: 'accepted', expiresAt: daysAgo(10) },
      // Expired invitation
      { boardId: board1.id, inviterId: demo.id, inviteeEmail: 'expired@example.com', role: 'member', status: 'pending', expiresAt: daysAgo(1) },
    ],
  });

  console.log('✅ 7 Invitations created');

  // ═══════════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════════════');
  console.log('🎉 Database seeded successfully!');
  console.log('════════════════════════════════════════════════');
  console.log('\n📊 Seed Summary:');
  console.log('   👤 6 Users');
  console.log('   🏢 3 Workspaces (Acme Corp, Side Project, Design Studio)');
  console.log('   📋 7 Boards across workspaces');
  console.log('   📝 70 Tasks with due dates, priorities, descriptions');
  console.log('   🏷️  22 Labels across 5 boards');
  console.log('   💬 31 Comments with threaded conversations');
  console.log('   📢 20 Notifications (10 unread for Demo User)');
  console.log('   ✉️  38 Direct messages across 8 conversations');
  console.log('   ⭐ 10 Favorite boards');
  console.log('   📄 6 Rich documents');
  console.log('   📨 7 Invitations (4 pending, 2 accepted, 1 expired)');
  console.log('   📊 27 Activity log entries');
  console.log('\n📋 Demo Credentials (all passwords: demo123):');
  console.log('   ➜ demo@taskflow.com  (Demo User - Owner of Acme Corp & Side Project)');
  console.log('   ➜ john@taskflow.com  (John Smith - Admin, Owner of Design Studio)');
  console.log('   ➜ sarah@taskflow.com (Sarah Johnson - Admin of Side Project)');
  console.log('   ➜ mike@taskflow.com  (Mike Chen - Member)');
  console.log('   ➜ emma@taskflow.com  (Emma Wilson - Admin of Design Studio)');
  console.log('   ➜ alex@taskflow.com  (Alex Rivera - Member)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
