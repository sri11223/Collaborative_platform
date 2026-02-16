import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.task.deleteMany();
  await prisma.list.deleteMany();
  await prisma.label.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.favoriteBoard.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah.johnson@taskflow.demo',
        name: 'Sarah Johnson',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.chen@taskflow.demo',
        name: 'Mike Chen',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emily.rodriguez@taskflow.demo',
        name: 'Emily Rodriguez',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      },
    }),
    prisma.user.create({
      data: {
        email: 'alex.kumar@taskflow.demo',
        name: 'Alex Kumar',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.martinez@taskflow.demo',
        name: 'Lisa Martinez',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create workspaces
  console.log('🏢 Creating workspaces...');
  const workspace1 = await prisma.workspace.create({
    data: {
      name: 'Acme Corporation',
      color: '#6366f1',
      ownerId: users[0].id,
    },
  });

  const workspace2 = await prisma.workspace.create({
    data: {
      name: 'Marketing Team',
      color: '#ec4899',
      ownerId: users[1].id,
    },
  });

  const workspace3 = await prisma.workspace.create({
    data: {
      name: 'Side Projects',
      color: '#10b981',
      ownerId: users[2].id,
    },
  });

  console.log('✅ Created 3 workspaces');

  // Create boards
  console.log('📋 Creating boards...');
  const board1 = await prisma.board.create({
    data: {
      title: 'Product Roadmap Q1 2026',
      description: 'First quarter product development and feature releases',
      color: '#3b82f6',
      workspaceId: workspace1.id,
      ownerId: users[0].id,
    },
  });

  const board2 = await prisma.board.create({
    data: {
      title: 'Website Redesign',
      description: 'Complete overhaul of company website with new branding',
      color: '#8b5cf6',
      workspaceId: workspace1.id,
      ownerId: users[0].id,
    },
  });

  const board3 = await prisma.board.create({
    data: {
      title: 'Q1 Marketing Campaigns',
      description: 'Campaign planning and execution for Q1',
      color: '#f59e0b',
      workspaceId: workspace2.id,
      ownerId: users[1].id,
    },
  });

  const board4 = await prisma.board.create({
    data: {
      title: 'Content Calendar',
      description: 'Blog posts, social media, and newsletter schedule',
      color: '#ef4444',
      workspaceId: workspace2.id,
      ownerId: users[1].id,
    },
  });

  const board5 = await prisma.board.create({
    data: {
      title: 'Mobile App Development',
      description: 'iOS and Android app development sprint board',
      color: '#06b6d4',
      workspaceId: workspace3.id,
      ownerId: users[2].id,
    },
  });

  console.log('✅ Created 5 boards');

  // Add board members
  console.log('👤 Adding board members...');
  await Promise.all([
    // Board 1 members
    prisma.boardMember.create({
      data: { boardId: board1.id, userId: users[0].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board1.id, userId: users[1].id, role: 'member' },
    }),
    prisma.boardMember.create({
      data: { boardId: board1.id, userId: users[3].id, role: 'member' },
    }),
    // Board 2 members
    prisma.boardMember.create({
      data: { boardId: board2.id, userId: users[0].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board2.id, userId: users[2].id, role: 'member' },
    }),
    // Board 3 members
    prisma.boardMember.create({
      data: { boardId: board3.id, userId: users[1].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board3.id, userId: users[4].id, role: 'member' },
    }),
    // Board 4 members
    prisma.boardMember.create({
      data: { boardId: board4.id, userId: users[1].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board4.id, userId: users[4].id, role: 'member' },
    }),
    // Board 5 members
    prisma.boardMember.create({
      data: { boardId: board5.id, userId: users[2].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board5.id, userId: users[3].id, role: 'member' },
    }),
  ]);

  console.log('✅ Added board members');

  // Add favorites
  console.log('⭐ Adding favorite boards...');
  await Promise.all([
    prisma.favoriteBoard.create({ data: { userId: users[0].id, boardId: board1.id } }),
    prisma.favoriteBoard.create({ data: { userId: users[1].id, boardId: board3.id } }),
    prisma.favoriteBoard.create({ data: { userId: users[2].id, boardId: board5.id } }),
  ]);

  // Create lists for boards
  console.log('📝 Creating lists...');
  const list1_todo = await prisma.list.create({
    data: { title: 'To Do', position: 0, boardId: board1.id },
  });
  const list1_progress = await prisma.list.create({
    data: { title: 'In Progress', position: 1, boardId: board1.id },
  });
  const list1_done = await prisma.list.create({
    data: { title: 'Done', position: 2, boardId: board1.id },
  });

  const list2_todo = await prisma.list.create({
    data: { title: 'Backlog', position: 0, boardId: board2.id },
  });
  const list2_progress = await prisma.list.create({
    data: { title: 'Working On', position: 1, boardId: board2.id },
  });

  const list3_todo = await prisma.list.create({
    data: { title: 'Ideas', position: 0, boardId: board3.id },
  });
  const list3_progress = await prisma.list.create({
    data: { title: 'In Progress', position: 1, boardId: board3.id },
  });
  const list3_done = await prisma.list.create({
    data: { title: 'Completed', position: 2, boardId: board3.id },
  });

  console.log('✅ Created lists');

  // Create labels
  console.log('🏷️  Creating labels...');
  const label_feature = await prisma.label.create({
    data: { name: 'Feature', color: '#3b82f6', boardId: board1.id },
  });
  const label_bug = await prisma.label.create({
    data: { name: 'Bug', color: '#ef4444', boardId: board1.id },
  });
  const label_urgent = await prisma.label.create({
    data: { name: 'Urgent', color: '#f59e0b', boardId: board1.id },
  });
  const label_design = await prisma.label.create({
    data: { name: 'Design', color: '#8b5cf6', boardId: board2.id },
  });

  console.log('✅ Created labels');

  // Create tasks for Board 1 (Product Roadmap)
  console.log('📝 Creating tasks...');
  const task1 = await prisma.task.create({
    data: {
      title: 'Design new user authentication flow',
      description: 'Implement OAuth 2.0 and social login options (Google, GitHub, Microsoft). Include 2FA support and passwordless authentication.',
      priority: 'high',
      dueDate: new Date('2026-03-15'),
      listId: list1_progress.id,
      position: 0,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement real-time collaboration features',
      description: 'Add WebSocket support for live cursors, presence indicators, and collaborative editing.',
      priority: 'high',
      dueDate: new Date('2026-03-30'),
      listId: list1_todo.id,
      position: 0,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Database optimization and indexing',
      description: 'Analyze slow queries, add proper indexes, implement query caching. Target 90% reduction in response time.',
      priority: 'medium',
      dueDate: new Date('2026-02-28'),
      listId: list1_progress.id,
      position: 1,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Mobile responsive UI improvements',
      description: 'Audit all pages for mobile responsiveness. Fix layout issues on tablets and phones.',
      priority: 'medium',
      listId: list1_done.id,
      position: 0,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'API documentation with OpenAPI/Swagger',
      description: 'Complete API documentation using OpenAPI 3.0 spec. Add interactive playground.',
      priority: 'low',
      listId: list1_done.id,
      position: 1,
    },
  });

  // Board 2 tasks (Website Redesign)
  const task6 = await prisma.task.create({
    data: {
      title: 'Create new brand identity guidelines',
      description: 'Define color palette, typography, logo variations, spacing, and visual language.',
      priority: 'high',
      dueDate: new Date('2026-02-25'),
      listId: list2_progress.id,
      position: 0,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Homepage hero section redesign',
      description: 'Design and implement new hero section with animated illustrations and clear CTA.',
      priority: 'high',
      listId: list2_todo.id,
      position: 0,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: 'Migrate to new CMS platform',
      description: 'Evaluate and migrate from WordPress to modern headless CMS (Contentful/Sanity).',
      priority: 'medium',
      dueDate: new Date('2026-03-10'),
      listId: list2_todo.id,
      position: 1,
    },
  });

  // Board 3 tasks (Marketing Campaigns)
  const task9 = await prisma.task.create({
    data: {
      title: 'Launch Valentine\'s Day campaign',
      description: 'Email campaign, social media posts, and landing page for Valentine\'s promotion.',
      priority: 'high',
      listId: list3_done.id,
      position: 0,
    },
  });

  const task10 = await prisma.task.create({
    data: {
      title: 'Q1 influencer partnerships',
      description: 'Reach out to 20 micro-influencers in tech space. Negotiate collaboration terms.',
      priority: 'high',
      dueDate: new Date('2026-03-01'),
      listId: list3_progress.id,
      position: 0,
    },
  });

  console.log('✅ Created 10 tasks');

  // Assign labels to tasks
  console.log('🏷️  Assigning labels to tasks...');
  await Promise.all([
    prisma.taskLabel.create({ data: { taskId: task1.id, labelId: label_feature.id } }),
    prisma.taskLabel.create({ data: { taskId: task1.id, labelId: label_urgent.id } }),
    prisma.taskLabel.create({ data: { taskId: task2.id, labelId: label_feature.id } }),
    prisma.taskLabel.create({ data: { taskId: task3.id, labelId: label_bug.id } }),
    prisma.taskLabel.create({ data: { taskId: task6.id, labelId: label_design.id } }),
    prisma.taskLabel.create({ data: { taskId: task7.id, labelId: label_design.id } }),
  ]);

  // Assign tasks to users
  console.log('👨‍💼 Assigning tasks...');
  await Promise.all([
    prisma.taskAssignee.create({ data: { taskId: task1.id, userId: users[1].id } }),
    prisma.taskAssignee.create({ data: { taskId: task2.id, userId: users[3].id } }),
    prisma.taskAssignee.create({ data: { taskId: task3.id, userId: users[0].id } }),
    prisma.taskAssignee.create({ data: { taskId: task6.id, userId: users[2].id } }),
    prisma.taskAssignee.create({ data: { taskId: task7.id, userId: users[0].id } }),
    prisma.taskAssignee.create({ data: { taskId: task10.id, userId: users[4].id } }),
  ]);

  console.log('✅ Assigned tasks to users');

  // Create comments
  console.log('💬 Creating comments...');
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'I\'ve started working on the OAuth integration. Planning to use Passport.js with strategies for Google and GitHub first.',
        taskId: task1.id,
        userId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Great! Make sure to handle the edge cases for email verification and account linking. I can help with the backend routes.',
        taskId: task1.id,
        userId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'For real-time features, should we use Socket.IO or raw WebSockets? Socket.IO has better fallback support but adds overhead.',
        taskId: task2.id,
        userId: users[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Database query optimization is showing great results! Reduced average query time from 450ms to 80ms on the dashboard endpoint. 🚀',
        taskId: task3.id,
        userId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Love the new color palette! The gradient combinations are modern and accessible. WCAG AAA compliant. 🎨',
        taskId: task6.id,
        userId: users[0].id,
      },
    }),
  ]);

  console.log('✅ Created 5 comments');

  // Create notifications
  console.log('🔔 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[1].id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You were assigned to "Design new user authentication flow"',
        read: false,
        boardId: board1.id,
        taskId: task1.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'comment_added',
        title: 'New Comment',
        message: 'Mike Chen commented on "Database optimization and indexing"',
        read: false,
        boardId: board1.id,
        taskId: task3.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[3].id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You were assigned to "Implement real-time collaboration features"',
        read: true,
        boardId: board1.id,
        taskId: task2.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[4].id,
        type: 'mention',
        title: 'You were mentioned',
        message: 'Sarah Johnson mentioned you in a comment',
        read: false,
      },
    }),
  ]);

  console.log('✅ Created 4 notifications');

  // Create activity logs
  console.log('📊 Creating activity logs...');
  const activities = [
    { boardId: board1.id, userId: users[0].id, type: 'board_created', description: 'created board "Product Roadmap Q1 2026"' },
    { boardId: board1.id, userId: users[1].id, type: 'task_created', description: 'added task "Design new user authentication flow"', taskId: task1.id },
    { boardId: board1.id, userId: users[0].id, type: 'task_assigned', description: 'assigned task to Mike Chen', taskId: task1.id },
    { boardId: board1.id, userId: users[1].id, type: 'task_updated', description: 'moved task to "In Progress"', taskId: task1.id },
    { boardId: board1.id, userId: users[3].id, type: 'comment_added', description: 'commented on "Implement real-time collaboration features"', taskId: task2.id },
    { boardId: board2.id, userId: users[0].id, type: 'board_created', description: 'created board "Website Redesign"' },
    { boardId: board2.id, userId: users[2].id, type: 'task_created', description: 'added task "Create new brand identity guidelines"', taskId: task6.id },
    { boardId: board3.id, userId: users[1].id, type: 'board_created', description: 'created board "Q1 Marketing Campaigns"' },
    { boardId: board3.id, userId: users[4].id, type: 'task_completed', description: 'completed task "Launch Valentine\'s Day campaign"', taskId: task9.id },
  ];

  await Promise.all(
    activities.map((activity) =>
      prisma.activity.create({ data: activity })
    )
  );

  console.log('✅ Created activity logs');

  // Summary
  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🏢 Workspaces: 3`);
  console.log(`   📋 Boards: 5`);
  console.log(`   📝 Tasks: 10`);
  console.log(`   💬 Comments: 5`);
  console.log(`   🔔 Notifications: 4`);
  console.log(`   📊 Activity logs: ${activities.length}`);
  console.log('\n✨ Demo credentials for all users:');
  console.log(`   📧 Email: [any user]@taskflow.demo`);
  console.log(`   🔑 Password: Demo123!`);
  console.log('\n👤 Demo users:');
  users.forEach((user) => {
    console.log(`   - ${user.email}`);
  });
}

  const board2 = await prisma.board.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with new branding',
      workspaceId: workspace1.id,
      isFavorite: false,
    },
  });

  const board3 = await prisma.board.create({
    data: {
      name: 'Q1 Marketing Campaigns',
      description: 'Campaign planning and execution for Q1',
      workspaceId: workspace2.id,
      isFavorite: true,
    },
  });

  const board4 = await prisma.board.create({
    data: {
      name: 'Content Calendar',
      description: 'Blog posts, social media, and newsletter schedule',
      workspaceId: workspace2.id,
      isFavorite: false,
    },
  });

  const board5 = await prisma.board.create({
    data: {
      name: 'Mobile App Development',
      description: 'iOS and Android app development sprint board',
      workspaceId: workspace3.id,
      isFavorite: true,
    },
  });

  console.log('✅ Created 5 boards');

  // Add board members
  console.log('👤 Adding board members...');
  await Promise.all([
    // Board 1 members
    prisma.boardMember.create({
      data: { boardId: board1.id, userId: users[0].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board1.id, userId: users[1].id, role: 'member' },
    }),
    prisma.boardMember.create({
      data: { boardId: board1.id, userId: users[3].id, role: 'member' },
    }),
    // Board 2 members
    prisma.boardMember.create({
      data: { boardId: board2.id, userId: users[0].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board2.id, userId: users[2].id, role: 'member' },
    }),
    // Board 3 members
    prisma.boardMember.create({
      data: { boardId: board3.id, userId: users[1].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board3.id, userId: users[4].id, role: 'member' },
    }),
    // Board 4 members
    prisma.boardMember.create({
      data: { boardId: board4.id, userId: users[1].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board4.id, userId: users[4].id, role: 'member' },
    }),
    // Board 5 members
    prisma.boardMember.create({
      data: { boardId: board5.id, userId: users[2].id, role: 'admin' },
    }),
    prisma.boardMember.create({
      data: { boardId: board5.id, userId: users[3].id, role: 'member' },
    }),
  ]);

  console.log('✅ Added board members');

  // Create tasks for Board 1 (Product Roadmap)
  console.log('📝 Creating tasks...');
  const task1 = await prisma.task.create({
    data: {
      title: 'Design new user authentication flow',
      description: 'Implement OAuth 2.0 and social login options (Google, GitHub, Microsoft). Include 2FA support and passwordless authentication.',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2026-03-15'),
      boardId: board1.id,
      position: 0,
      labels: ['feature', 'security', 'frontend'],
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement real-time collaboration features',
      description: 'Add WebSocket support for live cursors, presence indicators, and collaborative editing. Integrate operational transformation for conflict resolution.',
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2026-03-30'),
      boardId: board1.id,
      position: 1,
      labels: ['feature', 'backend', 'realtime'],
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Database optimization and indexing',
      description: 'Analyze slow queries, add proper indexes, implement query caching, and optimize N+1 queries. Target 90% reduction in response time.',
      status: 'in-progress',
      priority: 'medium',
      dueDate: new Date('2026-02-28'),
      boardId: board1.id,
      position: 2,
      labels: ['performance', 'database', 'backend'],
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Mobile responsive UI improvements',
      description: 'Audit all pages for mobile responsiveness. Fix layout issues on tablets and phones. Ensure touch-friendly interactions.',
      status: 'done',
      priority: 'medium',
      boardId: board1.id,
      position: 3,
      labels: ['ui', 'mobile', 'frontend'],
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'API documentation with OpenAPI/Swagger',
      description: 'Complete API documentation using OpenAPI 3.0 spec. Add interactive playground and code examples in multiple languages.',
      status: 'done',
      priority: 'low',
      boardId: board1.id,
      position: 4,
      labels: ['documentation', 'api'],
    },
  });

  // Board 2 tasks (Website Redesign)
  const task6 = await prisma.task.create({
    data: {
      title: 'Create new brand identity guidelines',
      description: 'Define color palette, typography, logo variations, spacing, and visual language. Include accessibility considerations.',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2026-02-25'),
      boardId: board2.id,
      position: 0,
      labels: ['design', 'branding'],
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Homepage hero section redesign',
      description: 'Design and implement new hero section with animated illustrations, clear CTA, and social proof elements.',
      status: 'todo',
      priority: 'high',
      boardId: board2.id,
      position: 1,
      labels: ['design', 'frontend', 'homepage'],
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: 'Migrate to new CMS platform',
      description: 'Evaluate and migrate from WordPress to modern headless CMS (Contentful/Sanity). Set up content models and migration scripts.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2026-03-10'),
      boardId: board2.id,
      position: 2,
      labels: ['backend', 'cms', 'migration'],
    },
  });

  // Board 3 tasks (Marketing Campaigns)
  const task9 = await prisma.task.create({
    data: {
      title: 'Launch Valentine\'s Day campaign',
      description: 'Email campaign, social media posts, and landing page for Valentine\'s promotion. Track conversion rates.',
      status: 'done',
      priority: 'high',
      boardId: board3.id,
      position: 0,
      labels: ['campaign', 'email', 'social'],
    },
  });

  const task10 = await prisma.task.create({
    data: {
      title: 'Q1 influencer partnerships',
      description: 'Reach out to 20 micro-influencers in tech space. Negotiate collaboration terms and create content calendar.',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2026-03-01'),
      boardId: board3.id,
      position: 1,
      labels: ['partnership', 'social', 'outreach'],
    },
  });

  const task11 = await prisma.task.create({
    data: {
      title: 'Create video tutorial series',
      description: 'Produce 10 short form videos (under 2 min) demonstrating key features. Optimize for TikTok, Instagram Reels, and YouTube Shorts.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2026-03-20'),
      boardId: board3.id,
      position: 2,
      labels: ['content', 'video', 'tutorial'],
    },
  });

  // Board 4 tasks (Content Calendar)
  const task12 = await prisma.task.create({
    data: {
      title: 'Write "10 Productivity Tips" blog post',
      description: 'Research-backed article about productivity techniques for remote teams. Include actionable tips and tool recommendations.',
      status: 'in-progress',
      priority: 'medium',
      dueDate: new Date('2026-02-20'),
      boardId: board4.id,
      position: 0,
      labels: ['blog', 'content'],
    },
  });

  const task13 = await prisma.task.create({
    data: {
      title: 'Monthly newsletter - February edition',
      description: 'Compile product updates, customer success stories, and industry news. Design in Mailchimp and schedule send.',
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2026-02-28'),
      boardId: board4.id,
      position: 1,
      labels: ['newsletter', 'email'],
    },
  });

  // Board 5 tasks (Mobile App)
  const task14 = await prisma.task.create({
    data: {
      title: 'Set up React Native project structure',
      description: 'Initialize RN project with TypeScript, navigation, state management (Redux/Zustand), and testing setup.',
      status: 'done',
      priority: 'high',
      boardId: board5.id,
      position: 0,
      labels: ['setup', 'mobile', 'react-native'],
    },
  });

  const task15 = await prisma.task.create({
    data: {
      title: 'Implement offline-first data sync',
      description: 'Use WatermelonDB or Realm for local storage. Implement conflict resolution and background sync when online.',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2026-03-05'),
      boardId: board5.id,
      position: 1,
      labels: ['feature', 'mobile', 'offline'],
    },
  });

  const task16 = await prisma.task.create({
    data: {
      title: 'Push notifications integration',
      description: 'Set up Firebase Cloud Messaging for Android and APNs for iOS. Handle notification permissions and deep linking.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2026-03-15'),
      boardId: board5.id,
      position: 2,
      labels: ['feature', 'mobile', 'notifications'],
    },
  });

  console.log('✅ Created 16 tasks');

  // Assign tasks to users
  console.log('👨‍💼 Assigning tasks...');
  await Promise.all([
    prisma.taskAssignment.create({ data: { taskId: task1.id, userId: users[1].id } }),
    prisma.taskAssignment.create({ data: { taskId: task2.id, userId: users[3].id } }),
    prisma.taskAssignment.create({ data: { taskId: task3.id, userId: users[0].id } }),
    prisma.taskAssignment.create({ data: { taskId: task6.id, userId: users[2].id } }),
    prisma.taskAssignment.create({ data: { taskId: task7.id, userId: users[0].id } }),
    prisma.taskAssignment.create({ data: { taskId: task10.id, userId: users[4].id } }),
    prisma.taskAssignment.create({ data: { taskId: task11.id, userId: users[1].id } }),
    prisma.taskAssignment.create({ data: { taskId: task12.id, userId: users[4].id } }),
    prisma.taskAssignment.create({ data: { taskId: task15.id, userId: users[3].id } }),
    prisma.taskAssignment.create({ data: { taskId: task16.id, userId: users[2].id } }),
  ]);

  console.log('✅ Assigned tasks to users');

  // Create comments
  console.log('💬 Creating comments...');
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'I\'ve started working on the OAuth integration. Planning to use Passport.js with strategies for Google and GitHub first.',
        taskId: task1.id,
        userId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Great! Make sure to handle the edge cases for email verification and account linking. I can help with the backend routes.',
        taskId: task1.id,
        userId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'For real-time features, should we use Socket.IO or raw WebSockets? Socket.IO has better fallback support but adds overhead.',
        taskId: task2.id,
        userId: users[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Database query optimization is showing great results! Reduced average query time from 450ms to 80ms on the dashboard endpoint. 🚀',
        taskId: task3.id,
        userId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Completed mobile testing on iPhone 13, Samsung Galaxy S23, and iPad Pro. All layouts look perfect! ✨',
        taskId: task4.id,
        userId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Love the new color palette! The gradient combinations are modern and accessible. WCAG AAA compliant. 🎨',
        taskId: task6.id,
        userId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Influencer outreach is going well. 8 out of 10 have responded positively. Negotiating rates now.',
        taskId: task10.id,
        userId: users[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Blog post outline is ready. Planning to include case studies from our top 3 enterprise customers.',
        taskId: task12.id,
        userId: users[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Offline sync is working but needs testing with poor network conditions. Will use Chrome DevTools network throttling.',
        taskId: task15.id,
        userId: users[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Just a heads up - FCM setup requires updating google-services.json. I\'ll handle the iOS side with APNs certificates.',
        taskId: task16.id,
        userId: users[2].id,
      },
    }),
  ]);

  console.log('✅ Created 10 comments');

  // Create board activities
  console.log('📊 Creating activity logs...');
  const activities = [
    { boardId: board1.id, userId: users[0].id, action: 'created board "Product Roadmap Q1 2026"' },
    { boardId: board1.id, userId: users[1].id, action: 'added task "Design new user authentication flow"' },
    { boardId: board1.id, userId: users[0].id, action: 'assigned task to Mike Chen' },
    { boardId: board1.id, userId: users[1].id, action: 'moved task to "In Progress"' },
    { boardId: board1.id, userId: users[3].id, action: 'commented on "Implement real-time collaboration features"' },
    { boardId: board2.id, userId: users[0].id, action: 'created board "Website Redesign"' },
    { boardId: board2.id, userId: users[2].id, action: 'added task "Create new brand identity guidelines"' },
    { boardId: board3.id, userId: users[1].id, action: 'created board "Q1 Marketing Campaigns"' },
    { boardId: board3.id, userId: users[4].id, action: 'completed task "Launch Valentine\'s Day campaign"' },
    { boardId: board4.id, userId: users[1].id, action: 'created board "Content Calendar"' },
    { boardId: board5.id, userId: users[2].id, action: 'created board "Mobile App Development"' },
    { boardId: board5.id, userId: users[3].id, action: 'updated task "Implement offline-first data sync"' },
  ];

  await Promise.all(
    activities.map((activity) =>
      prisma.boardActivity.create({ data: activity })
    )
  );

  console.log('✅ Created activity logs');

  // Create some notifications
  console.log('🔔 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[1].id,
        type: 'task_assigned',
        message: 'You were assigned to "Design new user authentication flow"',
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'comment',
        message: 'Mike Chen commented on "Database optimization and indexing"',
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[3].id,
        type: 'task_assigned',
        message: 'You were assigned to "Implement real-time collaboration features"',
        read: true,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[4].id,
        type: 'mention',
        message: 'Sarah Johnson mentioned you in a comment',
        read: false,
      },
    }),
  ]);

  console.log('✅ Created notifications');

  // Summary
  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🏢 Workspaces: 3`);
  console.log(`   📋 Boards: 5`);
  console.log(`   📝 Tasks: 16`);
  console.log(`   💬 Comments: 10`);
  console.log(`   🔔 Notifications: 4`);
  console.log(`   📊 Activity logs: ${activities.length}`);
  console.log('\n✨ Demo credentials for all users:');
  console.log(`   📧 Email: [any user]@taskflow.demo`);
  console.log(`   🔑 Password: Demo123!`);
  console.log('\n👤 Demo users:');
  users.forEach((user) => {
    console.log(`   - ${user.email}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
