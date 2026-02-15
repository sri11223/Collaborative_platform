import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
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
  await prisma.user.deleteMany();

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 12);

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@taskflow.com',
      name: 'Demo User',
      password: hashedPassword,
      avatar: null,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'john@taskflow.com',
      name: 'John Smith',
      password: hashedPassword,
      avatar: null,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'sarah@taskflow.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      avatar: null,
    },
  });

  console.log('✅ Users created');

  // Create boards
  const board1 = await prisma.board.create({
    data: {
      title: 'Product Launch Q1',
      description: 'Tasks for the upcoming product launch in Q1 2026',
      color: '#6366f1',
      ownerId: user1.id,
    },
  });

  const board2 = await prisma.board.create({
    data: {
      title: 'Engineering Sprint',
      description: 'Current sprint tasks and bugs',
      color: '#10b981',
      ownerId: user1.id,
    },
  });

  const board3 = await prisma.board.create({
    data: {
      title: 'Marketing Campaign',
      description: 'Social media and marketing tasks',
      color: '#f59e0b',
      ownerId: user2.id,
    },
  });

  console.log('✅ Boards created');

  // Add members
  await prisma.boardMember.createMany({
    data: [
      { boardId: board1.id, userId: user1.id, role: 'admin' },
      { boardId: board1.id, userId: user2.id, role: 'member' },
      { boardId: board1.id, userId: user3.id, role: 'member' },
      { boardId: board2.id, userId: user1.id, role: 'admin' },
      { boardId: board2.id, userId: user2.id, role: 'member' },
      { boardId: board3.id, userId: user2.id, role: 'admin' },
      { boardId: board3.id, userId: user1.id, role: 'member' },
    ],
  });

  console.log('✅ Board members added');

  // Create labels for board1
  const labels = await Promise.all([
    prisma.label.create({ data: { name: 'Bug', color: '#ef4444', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Feature', color: '#3b82f6', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Enhancement', color: '#8b5cf6', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Documentation', color: '#06b6d4', boardId: board1.id } }),
    prisma.label.create({ data: { name: 'Urgent', color: '#f97316', boardId: board1.id } }),
  ]);

  console.log('✅ Labels created');

  // Create lists for board1
  const list1 = await prisma.list.create({
    data: { title: 'Backlog', position: 0, boardId: board1.id },
  });
  const list2 = await prisma.list.create({
    data: { title: 'To Do', position: 1, boardId: board1.id },
  });
  const list3 = await prisma.list.create({
    data: { title: 'In Progress', position: 2, boardId: board1.id },
  });
  const list4 = await prisma.list.create({
    data: { title: 'Review', position: 3, boardId: board1.id },
  });
  const list5 = await prisma.list.create({
    data: { title: 'Done', position: 4, boardId: board1.id },
  });

  // Create lists for board2
  const list6 = await prisma.list.create({
    data: { title: 'To Do', position: 0, boardId: board2.id },
  });
  const list7 = await prisma.list.create({
    data: { title: 'In Progress', position: 1, boardId: board2.id },
  });
  const list8 = await prisma.list.create({
    data: { title: 'Done', position: 2, boardId: board2.id },
  });

  console.log('✅ Lists created');

  // Create tasks for board1
  const tasks = [
    { title: 'Design landing page mockups', description: 'Create high-fidelity mockups for the new landing page with responsive designs', priority: 'high', listId: list3.id, position: 0 },
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', priority: 'urgent', listId: list3.id, position: 1 },
    { title: 'Write API documentation', description: 'Document all REST endpoints with request/response examples', priority: 'medium', listId: list2.id, position: 0 },
    { title: 'Implement user authentication', description: 'Add JWT-based authentication with refresh tokens', priority: 'high', listId: list5.id, position: 0 },
    { title: 'Database schema optimization', description: 'Review and optimize database indexes for better query performance', priority: 'medium', listId: list2.id, position: 1 },
    { title: 'Create onboarding flow', description: 'Design and implement the new user onboarding experience', priority: 'high', listId: list1.id, position: 0 },
    { title: 'Fix login redirect bug', description: 'Users are not being redirected after successful login on mobile', priority: 'urgent', listId: list4.id, position: 0 },
    { title: 'Add dark mode support', description: 'Implement dark mode theme toggle across all components', priority: 'low', listId: list1.id, position: 1 },
    { title: 'Performance audit', description: 'Run Lighthouse audit and fix performance issues', priority: 'medium', listId: list1.id, position: 2 },
    { title: 'Set up monitoring dashboard', description: 'Configure Grafana dashboards for server monitoring', priority: 'medium', listId: list2.id, position: 2 },
  ];

  const createdTasks = [];
  for (const task of tasks) {
    const created = await prisma.task.create({ data: task });
    createdTasks.push(created);
  }

  // Create tasks for board2
  const sprint_tasks = [
    { title: 'Refactor authentication module', description: 'Clean up auth code and add refresh token support', priority: 'high', listId: list6.id, position: 0 },
    { title: 'Fix memory leak in WebSocket handler', description: 'Investigate and fix the memory leak causing server restarts', priority: 'urgent', listId: list7.id, position: 0 },
    { title: 'Update dependencies', description: 'Update all npm packages to latest stable versions', priority: 'low', listId: list8.id, position: 0 },
  ];

  for (const task of sprint_tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('✅ Tasks created');

  // Assign users to tasks
  await prisma.taskAssignee.createMany({
    data: [
      { taskId: createdTasks[0].id, userId: user1.id },
      { taskId: createdTasks[0].id, userId: user3.id },
      { taskId: createdTasks[1].id, userId: user2.id },
      { taskId: createdTasks[2].id, userId: user1.id },
      { taskId: createdTasks[3].id, userId: user2.id },
      { taskId: createdTasks[3].id, userId: user1.id },
      { taskId: createdTasks[4].id, userId: user3.id },
      { taskId: createdTasks[6].id, userId: user1.id },
    ],
  });

  console.log('✅ Task assignees added');

  // Add labels to tasks
  await prisma.taskLabel.createMany({
    data: [
      { taskId: createdTasks[0].id, labelId: labels[1].id },
      { taskId: createdTasks[1].id, labelId: labels[2].id },
      { taskId: createdTasks[2].id, labelId: labels[3].id },
      { taskId: createdTasks[3].id, labelId: labels[1].id },
      { taskId: createdTasks[6].id, labelId: labels[0].id },
      { taskId: createdTasks[6].id, labelId: labels[4].id },
      { taskId: createdTasks[7].id, labelId: labels[2].id },
    ],
  });

  console.log('✅ Task labels added');

  // Add comments
  await prisma.comment.createMany({
    data: [
      { content: 'Great progress on the mockups! The responsive design looks solid.', taskId: createdTasks[0].id, userId: user2.id },
      { content: 'Can we add a hero section with an animated illustration?', taskId: createdTasks[0].id, userId: user3.id },
      { content: 'I\'ve set up the basic pipeline. Need to add test coverage step.', taskId: createdTasks[1].id, userId: user2.id },
      { content: 'This needs to be done ASAP - blocking other features.', taskId: createdTasks[6].id, userId: user1.id },
      { content: 'Found the root cause - it\'s a race condition in the auth middleware.', taskId: createdTasks[6].id, userId: user2.id },
    ],
  });

  console.log('✅ Comments added');

  // Add activity history
  await prisma.activity.createMany({
    data: [
      { type: 'board_created', description: 'created the board', boardId: board1.id, userId: user1.id },
      { type: 'task_created', description: 'created task "Design landing page mockups"', boardId: board1.id, userId: user1.id, taskId: createdTasks[0].id },
      { type: 'task_created', description: 'created task "Set up CI/CD pipeline"', boardId: board1.id, userId: user2.id, taskId: createdTasks[1].id },
      { type: 'member_joined', description: 'joined the board', boardId: board1.id, userId: user2.id },
      { type: 'member_joined', description: 'joined the board', boardId: board1.id, userId: user3.id },
      { type: 'task_moved', description: 'moved "Implement user authentication" to Done', boardId: board1.id, userId: user2.id, taskId: createdTasks[3].id },
      { type: 'comment_added', description: 'commented on "Design landing page mockups"', boardId: board1.id, userId: user3.id, taskId: createdTasks[0].id },
    ],
  });

  console.log('✅ Activities added');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Email: demo@taskflow.com | Password: demo123');
  console.log('  Email: john@taskflow.com | Password: demo123');
  console.log('  Email: sarah@taskflow.com | Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
