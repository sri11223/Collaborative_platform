import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seeding...');

  // ── Clear everything ───────────────────────────────
  console.log('🗑️  Clearing existing data...');
  await prisma.directMessage.deleteMany();
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
  await prisma.document.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // ══════════════════════════════════════════════════
  //  USERS (3 accounts – password: Demo123!)
  // ══════════════════════════════════════════════════
  console.log('👥 Creating users...');
  const pw = await bcrypt.hash('Demo123!', 10);

  const [sarah, mike, emily] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah.johnson@taskflow.demo',
        name: 'Sarah Johnson',
        password: pw,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.chen@taskflow.demo',
        name: 'Mike Chen',
        password: pw,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emily.rodriguez@taskflow.demo',
        name: 'Emily Rodriguez',
        password: pw,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      },
    }),
  ]);
  const users = [sarah, mike, emily];
  console.log('✅ Created 3 users');

  // ══════════════════════════════════════════════════
  //  WORKSPACES  (2-3 per user, 7 total)
  // ══════════════════════════════════════════════════
  console.log('🏢 Creating workspaces...');

  // Sarah's workspaces
  const wsEngineering = await prisma.workspace.create({
    data: { name: 'Engineering', color: '#6366f1', ownerId: sarah.id },
  });
  const wsStartup = await prisma.workspace.create({
    data: { name: 'Startup Ideas', color: '#f59e0b', ownerId: sarah.id },
  });

  // Mike's workspaces
  const wsMarketing = await prisma.workspace.create({
    data: { name: 'Marketing', color: '#ec4899', ownerId: mike.id },
  });
  const wsFreelance = await prisma.workspace.create({
    data: { name: 'Freelance Projects', color: '#14b8a6', ownerId: mike.id },
  });
  const wsSideHustle = await prisma.workspace.create({
    data: { name: 'Side Hustle', color: '#8b5cf6', ownerId: mike.id },
  });

  // Emily's workspaces
  const wsDesign = await prisma.workspace.create({
    data: { name: 'Design Studio', color: '#f43f5e', ownerId: emily.id },
  });
  const wsPersonal = await prisma.workspace.create({
    data: { name: 'Personal', color: '#06b6d4', ownerId: emily.id },
  });

  // Workspace members – cross-collaborate
  await Promise.all([
    // Engineering: all 3
    prisma.workspaceMember.create({ data: { workspaceId: wsEngineering.id, userId: sarah.id, role: 'owner' } }),
    prisma.workspaceMember.create({ data: { workspaceId: wsEngineering.id, userId: mike.id, role: 'member' } }),
    prisma.workspaceMember.create({ data: { workspaceId: wsEngineering.id, userId: emily.id, role: 'member' } }),
    // Startup Ideas: sarah + emily
    prisma.workspaceMember.create({ data: { workspaceId: wsStartup.id, userId: sarah.id, role: 'owner' } }),
    prisma.workspaceMember.create({ data: { workspaceId: wsStartup.id, userId: emily.id, role: 'member' } }),
    // Marketing: mike + emily
    prisma.workspaceMember.create({ data: { workspaceId: wsMarketing.id, userId: mike.id, role: 'owner' } }),
    prisma.workspaceMember.create({ data: { workspaceId: wsMarketing.id, userId: emily.id, role: 'member' } }),
    prisma.workspaceMember.create({ data: { workspaceId: wsMarketing.id, userId: sarah.id, role: 'member' } }),
    // Freelance: mike + sarah
    prisma.workspaceMember.create({ data: { workspaceId: wsFreelance.id, userId: mike.id, role: 'owner' } }),
    prisma.workspaceMember.create({ data: { workspaceId: wsFreelance.id, userId: sarah.id, role: 'member' } }),
    // Side Hustle: mike only
    prisma.workspaceMember.create({ data: { workspaceId: wsSideHustle.id, userId: mike.id, role: 'owner' } }),
    // Design Studio: emily + sarah + mike
    prisma.workspaceMember.create({ data: { workspaceId: wsDesign.id, userId: emily.id, role: 'owner' } }),
    prisma.workspaceMember.create({ data: { workspaceId: wsDesign.id, userId: sarah.id, role: 'member' } }),
    prisma.workspaceMember.create({ data: { workspaceId: wsDesign.id, userId: mike.id, role: 'member' } }),
    // Personal: emily only
    prisma.workspaceMember.create({ data: { workspaceId: wsPersonal.id, userId: emily.id, role: 'owner' } }),
  ]);

  console.log('✅ Created 7 workspaces with members');

  // ══════════════════════════════════════════════════
  //  BOARDS (10 total, spread across workspaces)
  // ══════════════════════════════════════════════════
  console.log('📋 Creating boards...');

  const boardProduct = await prisma.board.create({
    data: { title: 'Product Roadmap Q1', description: 'Sprint board for Q1 feature releases', color: '#3b82f6', workspaceId: wsEngineering.id, ownerId: sarah.id },
  });
  const boardBackend = await prisma.board.create({
    data: { title: 'Backend API', description: 'REST API endpoints and database work', color: '#10b981', workspaceId: wsEngineering.id, ownerId: sarah.id },
  });
  const boardMVP = await prisma.board.create({
    data: { title: 'MVP Launch', description: 'Minimum viable product planning', color: '#f59e0b', workspaceId: wsStartup.id, ownerId: sarah.id },
  });
  const boardCampaigns = await prisma.board.create({
    data: { title: 'Q1 Campaigns', description: 'Marketing campaigns and outreach', color: '#ec4899', workspaceId: wsMarketing.id, ownerId: mike.id },
  });
  const boardSocial = await prisma.board.create({
    data: { title: 'Social Media Calendar', description: 'Content scheduling for all platforms', color: '#f97316', workspaceId: wsMarketing.id, ownerId: mike.id },
  });
  const boardClientA = await prisma.board.create({
    data: { title: 'Client: Acme Corp', description: 'Website redesign project for Acme', color: '#8b5cf6', workspaceId: wsFreelance.id, ownerId: mike.id },
  });
  const boardCrypto = await prisma.board.create({
    data: { title: 'Crypto Tracker App', description: 'Side project – crypto portfolio app', color: '#eab308', workspaceId: wsSideHustle.id, ownerId: mike.id },
  });
  const boardUIKit = await prisma.board.create({
    data: { title: 'UI Kit v2', description: 'Design system components library', color: '#f43f5e', workspaceId: wsDesign.id, ownerId: emily.id },
  });
  const boardBranding = await prisma.board.create({
    data: { title: 'Rebranding 2026', description: 'Full brand identity refresh', color: '#a855f7', workspaceId: wsDesign.id, ownerId: emily.id },
  });
  const boardTravel = await prisma.board.create({
    data: { title: 'Travel Plans', description: 'Trip planning and bucket list', color: '#06b6d4', workspaceId: wsPersonal.id, ownerId: emily.id },
  });

  console.log('✅ Created 10 boards');

  // ── Board Members ──────────────────────────────────
  await Promise.all([
    // Product Roadmap – all 3
    prisma.boardMember.create({ data: { boardId: boardProduct.id, userId: sarah.id, role: 'admin' } }),
    prisma.boardMember.create({ data: { boardId: boardProduct.id, userId: mike.id, role: 'member' } }),
    prisma.boardMember.create({ data: { boardId: boardProduct.id, userId: emily.id, role: 'member' } }),
    // Backend API – sarah + mike
    prisma.boardMember.create({ data: { boardId: boardBackend.id, userId: sarah.id, role: 'admin' } }),
    prisma.boardMember.create({ data: { boardId: boardBackend.id, userId: mike.id, role: 'member' } }),
    // MVP – sarah + emily
    prisma.boardMember.create({ data: { boardId: boardMVP.id, userId: sarah.id, role: 'admin' } }),
    prisma.boardMember.create({ data: { boardId: boardMVP.id, userId: emily.id, role: 'member' } }),
    // Campaigns – all 3
    prisma.boardMember.create({ data: { boardId: boardCampaigns.id, userId: mike.id, role: 'admin' } }),
    prisma.boardMember.create({ data: { boardId: boardCampaigns.id, userId: emily.id, role: 'member' } }),
    prisma.boardMember.create({ data: { boardId: boardCampaigns.id, userId: sarah.id, role: 'member' } }),
    // Social Media – mike + emily
    prisma.boardMember.create({ data: { boardId: boardSocial.id, userId: mike.id, role: 'admin' } }),
    prisma.boardMember.create({ data: { boardId: boardSocial.id, userId: emily.id, role: 'member' } }),
    // Client Acme – mike + sarah
    prisma.boardMember.create({ data: { boardId: boardClientA.id, userId: mike.id, role: 'admin' } }),
    prisma.boardMember.create({ data: { boardId: boardClientA.id, userId: sarah.id, role: 'member' } }),
    // Crypto – mike only
    prisma.boardMember.create({ data: { boardId: boardCrypto.id, userId: mike.id, role: 'admin' } }),
    // UI Kit – emily + sarah + mike
    prisma.boardMember.create({ data: { boardId: boardUIKit.id, userId: emily.id, role: 'admin' } }),
    prisma.boardMember.create({ data: { boardId: boardUIKit.id, userId: sarah.id, role: 'member' } }),
    prisma.boardMember.create({ data: { boardId: boardUIKit.id, userId: mike.id, role: 'member' } }),
    // Branding – emily + sarah
    prisma.boardMember.create({ data: { boardId: boardBranding.id, userId: emily.id, role: 'admin' } }),
    prisma.boardMember.create({ data: { boardId: boardBranding.id, userId: sarah.id, role: 'member' } }),
    // Travel – emily only
    prisma.boardMember.create({ data: { boardId: boardTravel.id, userId: emily.id, role: 'admin' } }),
  ]);

  // ── Favorites (different per user) ─────────────────
  await Promise.all([
    // Sarah's favorites
    prisma.favoriteBoard.create({ data: { userId: sarah.id, boardId: boardProduct.id } }),
    prisma.favoriteBoard.create({ data: { userId: sarah.id, boardId: boardMVP.id } }),
    // Mike's favorites
    prisma.favoriteBoard.create({ data: { userId: mike.id, boardId: boardCampaigns.id } }),
    prisma.favoriteBoard.create({ data: { userId: mike.id, boardId: boardClientA.id } }),
    prisma.favoriteBoard.create({ data: { userId: mike.id, boardId: boardCrypto.id } }),
    // Emily's favorites
    prisma.favoriteBoard.create({ data: { userId: emily.id, boardId: boardUIKit.id } }),
    prisma.favoriteBoard.create({ data: { userId: emily.id, boardId: boardTravel.id } }),
  ]);

  // ══════════════════════════════════════════════════
  //  LISTS  (3-4 per board)
  // ══════════════════════════════════════════════════
  console.log('📝 Creating lists...');

  // Product Roadmap
  const [prTodo, prProgress, prReview, prDone] = await Promise.all([
    prisma.list.create({ data: { title: 'To Do', position: 0, boardId: boardProduct.id } }),
    prisma.list.create({ data: { title: 'In Progress', position: 1, boardId: boardProduct.id } }),
    prisma.list.create({ data: { title: 'Review', position: 2, boardId: boardProduct.id } }),
    prisma.list.create({ data: { title: 'Done', position: 3, boardId: boardProduct.id } }),
  ]);

  // Backend API
  const [beTodo, beProgress, beDone] = await Promise.all([
    prisma.list.create({ data: { title: 'Backlog', position: 0, boardId: boardBackend.id } }),
    prisma.list.create({ data: { title: 'In Dev', position: 1, boardId: boardBackend.id } }),
    prisma.list.create({ data: { title: 'Merged', position: 2, boardId: boardBackend.id } }),
  ]);

  // MVP Launch
  const [mvpIdeas, mvpBuilding, mvpShipped] = await Promise.all([
    prisma.list.create({ data: { title: 'Ideas', position: 0, boardId: boardMVP.id } }),
    prisma.list.create({ data: { title: 'Building', position: 1, boardId: boardMVP.id } }),
    prisma.list.create({ data: { title: 'Shipped', position: 2, boardId: boardMVP.id } }),
  ]);

  // Q1 Campaigns
  const [cmpPlanned, cmpActive, cmpDone] = await Promise.all([
    prisma.list.create({ data: { title: 'Planned', position: 0, boardId: boardCampaigns.id } }),
    prisma.list.create({ data: { title: 'Active', position: 1, boardId: boardCampaigns.id } }),
    prisma.list.create({ data: { title: 'Completed', position: 2, boardId: boardCampaigns.id } }),
  ]);

  // Social Media Calendar
  const [smDraft, smScheduled, smPublished] = await Promise.all([
    prisma.list.create({ data: { title: 'Draft', position: 0, boardId: boardSocial.id } }),
    prisma.list.create({ data: { title: 'Scheduled', position: 1, boardId: boardSocial.id } }),
    prisma.list.create({ data: { title: 'Published', position: 2, boardId: boardSocial.id } }),
  ]);

  // Client Acme
  const [acTodo, acProgress, acReview, acDone] = await Promise.all([
    prisma.list.create({ data: { title: 'To Do', position: 0, boardId: boardClientA.id } }),
    prisma.list.create({ data: { title: 'In Progress', position: 1, boardId: boardClientA.id } }),
    prisma.list.create({ data: { title: 'Client Review', position: 2, boardId: boardClientA.id } }),
    prisma.list.create({ data: { title: 'Approved', position: 3, boardId: boardClientA.id } }),
  ]);

  // Crypto Tracker
  const [crTodo, crProgress, crDone] = await Promise.all([
    prisma.list.create({ data: { title: 'Features', position: 0, boardId: boardCrypto.id } }),
    prisma.list.create({ data: { title: 'Coding', position: 1, boardId: boardCrypto.id } }),
    prisma.list.create({ data: { title: 'Released', position: 2, boardId: boardCrypto.id } }),
  ]);

  // UI Kit v2
  const [uiTodo, uiProgress, uiDone] = await Promise.all([
    prisma.list.create({ data: { title: 'Components', position: 0, boardId: boardUIKit.id } }),
    prisma.list.create({ data: { title: 'Designing', position: 1, boardId: boardUIKit.id } }),
    prisma.list.create({ data: { title: 'Published', position: 2, boardId: boardUIKit.id } }),
  ]);

  // Branding
  const [brResearch, brDesign, brApproved] = await Promise.all([
    prisma.list.create({ data: { title: 'Research', position: 0, boardId: boardBranding.id } }),
    prisma.list.create({ data: { title: 'Design', position: 1, boardId: boardBranding.id } }),
    prisma.list.create({ data: { title: 'Approved', position: 2, boardId: boardBranding.id } }),
  ]);

  // Travel
  const [trBucket, trPlanning, trVisited] = await Promise.all([
    prisma.list.create({ data: { title: 'Bucket List', position: 0, boardId: boardTravel.id } }),
    prisma.list.create({ data: { title: 'Planning', position: 1, boardId: boardTravel.id } }),
    prisma.list.create({ data: { title: 'Visited ✓', position: 2, boardId: boardTravel.id } }),
  ]);

  console.log('✅ Created lists for all boards');

  // ══════════════════════════════════════════════════
  //  LABELS  (per board)
  // ══════════════════════════════════════════════════
  console.log('🏷️  Creating labels...');
  const [lblFeature, lblBug, lblUrgent] = await Promise.all([
    prisma.label.create({ data: { name: 'Feature', color: '#3b82f6', boardId: boardProduct.id } }),
    prisma.label.create({ data: { name: 'Bug', color: '#ef4444', boardId: boardProduct.id } }),
    prisma.label.create({ data: { name: 'Urgent', color: '#f59e0b', boardId: boardProduct.id } }),
  ]);
  const [lblEndpoint, lblDatabase] = await Promise.all([
    prisma.label.create({ data: { name: 'Endpoint', color: '#10b981', boardId: boardBackend.id } }),
    prisma.label.create({ data: { name: 'Database', color: '#6366f1', boardId: boardBackend.id } }),
  ]);
  const lblMVP = await prisma.label.create({ data: { name: 'Core', color: '#f59e0b', boardId: boardMVP.id } });
  const [lblSocial, lblEmail] = await Promise.all([
    prisma.label.create({ data: { name: 'Social', color: '#ec4899', boardId: boardCampaigns.id } }),
    prisma.label.create({ data: { name: 'Email', color: '#8b5cf6', boardId: boardCampaigns.id } }),
  ]);
  const lblDesign = await prisma.label.create({ data: { name: 'Design', color: '#f43f5e', boardId: boardUIKit.id } });
  const lblBrand = await prisma.label.create({ data: { name: 'Brand', color: '#a855f7', boardId: boardBranding.id } });

  console.log('✅ Created labels');

  // ══════════════════════════════════════════════════
  //  TASKS  (30+ tasks spread across boards)
  // ══════════════════════════════════════════════════
  console.log('📝 Creating tasks...');

  // ── Product Roadmap (6 tasks) ─────────────────────
  const t_oauth = await prisma.task.create({ data: { title: 'Implement OAuth login flow', description: 'Add Google and GitHub OAuth with 2FA support.', priority: 'high', dueDate: new Date('2026-03-15'), listId: prProgress.id, position: 0 } });
  const t_realtime = await prisma.task.create({ data: { title: 'Real-time collaboration sync', description: 'WebSocket live cursors and presence indicators.', priority: 'high', dueDate: new Date('2026-03-30'), listId: prTodo.id, position: 0 } });
  const t_dbopt = await prisma.task.create({ data: { title: 'Database query optimization', description: 'Add indexes, cache queries. Target 90% latency cut.', priority: 'medium', dueDate: new Date('2026-02-28'), listId: prReview.id, position: 0 } });
  const t_mobile = await prisma.task.create({ data: { title: 'Mobile responsive fixes', description: 'Audit and fix layouts on tablets and phones.', priority: 'medium', listId: prDone.id, position: 0 } });
  const t_docs = await prisma.task.create({ data: { title: 'API documentation', description: 'OpenAPI 3.0 spec with Swagger playground.', priority: 'low', listId: prDone.id, position: 1 } });
  const t_darkmode = await prisma.task.create({ data: { title: 'Dark mode theme polish', description: 'Fix contrast issues and add smooth transitions.', priority: 'low', dueDate: new Date('2026-03-20'), listId: prTodo.id, position: 1 } });

  // ── Backend API (4 tasks) ─────────────────────────
  const t_userApi = await prisma.task.create({ data: { title: 'User CRUD endpoints', description: 'GET/PUT /users/:id with validation and auth guards.', priority: 'high', listId: beDone.id, position: 0 } });
  const t_boardApi = await prisma.task.create({ data: { title: 'Board permissions middleware', description: 'Role-check middleware for admin/member/viewer access.', priority: 'high', listId: beProgress.id, position: 0 } });
  const t_search = await prisma.task.create({ data: { title: 'Full-text search', description: 'Add search endpoint for tasks, boards, and users.', priority: 'medium', dueDate: new Date('2026-03-10'), listId: beTodo.id, position: 0 } });
  const t_rateLimit = await prisma.task.create({ data: { title: 'Rate limiting', description: 'Add express-rate-limit to protect API from abuse.', priority: 'low', listId: beTodo.id, position: 1 } });

  // ── MVP Launch (3 tasks) ──────────────────────────
  const t_landing = await prisma.task.create({ data: { title: 'Landing page with pricing', description: 'Hero, features, pricing cards, CTA sections.', priority: 'high', listId: mvpShipped.id, position: 0 } });
  const t_onboard = await prisma.task.create({ data: { title: 'Onboarding wizard', description: 'Step-by-step workspace setup for new users.', priority: 'high', listId: mvpBuilding.id, position: 0 } });
  const t_analytics = await prisma.task.create({ data: { title: 'Basic analytics dashboard', description: 'Task velocity, completion rate, team activity.', priority: 'medium', dueDate: new Date('2026-04-01'), listId: mvpIdeas.id, position: 0 } });

  // ── Q1 Campaigns (4 tasks) ─────────────────────────
  const t_valentines = await prisma.task.create({ data: { title: 'Valentine\'s Day campaign', description: 'Email + social media launch for Valentine\'s promo.', priority: 'high', listId: cmpDone.id, position: 0 } });
  const t_influencer = await prisma.task.create({ data: { title: 'Influencer partnerships', description: 'Reach out to 20 micro-influencers in tech.', priority: 'high', dueDate: new Date('2026-03-01'), listId: cmpActive.id, position: 0 } });
  const t_webinar = await prisma.task.create({ data: { title: 'Host productivity webinar', description: 'Free webinar: "Remote Team Productivity" – 500 signups target.', priority: 'medium', dueDate: new Date('2026-03-15'), listId: cmpPlanned.id, position: 0 } });
  const t_newsletter = await prisma.task.create({ data: { title: 'Monthly newsletter – Feb', description: 'Product updates, customer stories, industry news.', priority: 'medium', dueDate: new Date('2026-02-28'), listId: cmpActive.id, position: 1 } });

  // ── Social Media (3 tasks) ─────────────────────────
  const t_tiktok = await prisma.task.create({ data: { title: 'TikTok video series', description: '10 short-form videos demonstrating key features.', priority: 'high', dueDate: new Date('2026-03-20'), listId: smDraft.id, position: 0 } });
  const t_twitter = await prisma.task.create({ data: { title: 'Twitter/X thread campaign', description: 'Weekly threads on productivity and remote work tips.', priority: 'medium', listId: smScheduled.id, position: 0 } });
  const t_caseStudy = await prisma.task.create({ data: { title: 'Case study blog post', description: 'Write "How Acme Corp saved 10 hrs/week with TaskFlow".', priority: 'medium', listId: smPublished.id, position: 0 } });

  // ── Client Acme (4 tasks) ──────────────────────────
  const t_wireframes = await prisma.task.create({ data: { title: 'Homepage wireframes', description: 'Low-fidelity wireframes for client review.', priority: 'high', listId: acDone.id, position: 0 } });
  const t_mockups = await prisma.task.create({ data: { title: 'High-fidelity mockups', description: 'Pixel-perfect Figma designs for all pages.', priority: 'high', dueDate: new Date('2026-03-05'), listId: acProgress.id, position: 0 } });
  const t_frontend = await prisma.task.create({ data: { title: 'Frontend development', description: 'React + Tailwind implementation of approved designs.', priority: 'high', dueDate: new Date('2026-03-25'), listId: acTodo.id, position: 0 } });
  const t_feedback = await prisma.task.create({ data: { title: 'Client feedback round 1', description: 'Collect and incorporate first round of feedback.', priority: 'medium', listId: acReview.id, position: 0 } });

  // ── Crypto Tracker (3 tasks) ───────────────────────
  const t_portfolio = await prisma.task.create({ data: { title: 'Portfolio overview page', description: 'Dashboard showing total value, gains/losses, charts.', priority: 'high', listId: crProgress.id, position: 0 } });
  const t_alerts = await prisma.task.create({ data: { title: 'Price alert notifications', description: 'Push notifications when price hits target.', priority: 'medium', dueDate: new Date('2026-03-15'), listId: crTodo.id, position: 0 } });
  const t_exchange = await prisma.task.create({ data: { title: 'Exchange API integration', description: 'Connect Binance and Coinbase APIs for live data.', priority: 'high', listId: crDone.id, position: 0 } });

  // ── UI Kit v2 (3 tasks) ────────────────────────────
  const t_buttons = await prisma.task.create({ data: { title: 'Button component variants', description: 'Primary, secondary, outline, ghost, danger variants.', priority: 'high', listId: uiDone.id, position: 0 } });
  const t_modals = await prisma.task.create({ data: { title: 'Modal & dialog system', description: 'Accessible modal with focus trap and animations.', priority: 'high', listId: uiProgress.id, position: 0 } });
  const t_forms = await prisma.task.create({ data: { title: 'Form input components', description: 'Text, select, checkbox, radio, toggle, date picker.', priority: 'medium', dueDate: new Date('2026-03-12'), listId: uiTodo.id, position: 0 } });

  // ── Branding (3 tasks) ─────────────────────────────
  const t_colorPalette = await prisma.task.create({ data: { title: 'New color palette', description: 'Define primary, secondary, accent colors with a11y checks.', priority: 'high', listId: brApproved.id, position: 0 } });
  const t_typography = await prisma.task.create({ data: { title: 'Typography scale', description: 'Choose font pairing and define responsive type scale.', priority: 'high', listId: brDesign.id, position: 0 } });
  const t_logoVar = await prisma.task.create({ data: { title: 'Logo variations', description: 'Horizontal, vertical, icon-only, dark/light versions.', priority: 'medium', listId: brResearch.id, position: 0 } });

  // ── Travel Plans (3 tasks) ─────────────────────────
  const t_japan = await prisma.task.create({ data: { title: 'Japan trip – April', description: 'Tokyo → Kyoto → Osaka. Book flights and Airbnb.', priority: 'high', dueDate: new Date('2026-04-01'), listId: trPlanning.id, position: 0 } });
  const t_iceland = await prisma.task.create({ data: { title: 'Iceland – Northern Lights', description: 'Best time: Sept-March. Research ring road itinerary.', priority: 'medium', listId: trBucket.id, position: 0 } });
  const t_bali = await prisma.task.create({ data: { title: 'Bali digital nomad month', description: 'Co-working spaces in Canggu. Budget: $2k/month.', priority: 'low', listId: trVisited.id, position: 0 } });

  const allTasks = [t_oauth, t_realtime, t_dbopt, t_mobile, t_docs, t_darkmode, t_userApi, t_boardApi, t_search, t_rateLimit, t_landing, t_onboard, t_analytics, t_valentines, t_influencer, t_webinar, t_newsletter, t_tiktok, t_twitter, t_caseStudy, t_wireframes, t_mockups, t_frontend, t_feedback, t_portfolio, t_alerts, t_exchange, t_buttons, t_modals, t_forms, t_colorPalette, t_typography, t_logoVar, t_japan, t_iceland, t_bali];
  console.log(`✅ Created ${allTasks.length} tasks`);

  // ══════════════════════════════════════════════════
  //  TASK LABELS
  // ══════════════════════════════════════════════════
  await Promise.all([
    prisma.taskLabel.create({ data: { taskId: t_oauth.id, labelId: lblFeature.id } }),
    prisma.taskLabel.create({ data: { taskId: t_oauth.id, labelId: lblUrgent.id } }),
    prisma.taskLabel.create({ data: { taskId: t_realtime.id, labelId: lblFeature.id } }),
    prisma.taskLabel.create({ data: { taskId: t_dbopt.id, labelId: lblBug.id } }),
    prisma.taskLabel.create({ data: { taskId: t_darkmode.id, labelId: lblFeature.id } }),
    prisma.taskLabel.create({ data: { taskId: t_userApi.id, labelId: lblEndpoint.id } }),
    prisma.taskLabel.create({ data: { taskId: t_boardApi.id, labelId: lblEndpoint.id } }),
    prisma.taskLabel.create({ data: { taskId: t_search.id, labelId: lblDatabase.id } }),
    prisma.taskLabel.create({ data: { taskId: t_onboard.id, labelId: lblMVP.id } }),
    prisma.taskLabel.create({ data: { taskId: t_landing.id, labelId: lblMVP.id } }),
    prisma.taskLabel.create({ data: { taskId: t_influencer.id, labelId: lblSocial.id } }),
    prisma.taskLabel.create({ data: { taskId: t_newsletter.id, labelId: lblEmail.id } }),
    prisma.taskLabel.create({ data: { taskId: t_valentines.id, labelId: lblSocial.id } }),
    prisma.taskLabel.create({ data: { taskId: t_modals.id, labelId: lblDesign.id } }),
    prisma.taskLabel.create({ data: { taskId: t_buttons.id, labelId: lblDesign.id } }),
    prisma.taskLabel.create({ data: { taskId: t_colorPalette.id, labelId: lblBrand.id } }),
    prisma.taskLabel.create({ data: { taskId: t_typography.id, labelId: lblBrand.id } }),
  ]);

  // ══════════════════════════════════════════════════
  //  TASK ASSIGNEES  (spread evenly)
  // ══════════════════════════════════════════════════
  console.log('👨‍💼 Assigning tasks...');
  await Promise.all([
    // Sarah's tasks
    prisma.taskAssignee.create({ data: { taskId: t_realtime.id, userId: sarah.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_dbopt.id, userId: sarah.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_landing.id, userId: sarah.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_boardApi.id, userId: sarah.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_frontend.id, userId: sarah.id } }),
    // Mike's tasks
    prisma.taskAssignee.create({ data: { taskId: t_oauth.id, userId: mike.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_userApi.id, userId: mike.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_influencer.id, userId: mike.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_mockups.id, userId: mike.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_portfolio.id, userId: mike.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_exchange.id, userId: mike.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_newsletter.id, userId: mike.id } }),
    // Emily's tasks
    prisma.taskAssignee.create({ data: { taskId: t_mobile.id, userId: emily.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_onboard.id, userId: emily.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_valentines.id, userId: emily.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_tiktok.id, userId: emily.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_modals.id, userId: emily.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_typography.id, userId: emily.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_japan.id, userId: emily.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_buttons.id, userId: emily.id } }),
    // Multi-assigned
    prisma.taskAssignee.create({ data: { taskId: t_docs.id, userId: sarah.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_docs.id, userId: mike.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_wireframes.id, userId: mike.id } }),
    prisma.taskAssignee.create({ data: { taskId: t_wireframes.id, userId: emily.id } }),
  ]);

  console.log('✅ Assigned tasks');

  // ══════════════════════════════════════════════════
  //  COMMENTS  (15 comments across boards)
  // ══════════════════════════════════════════════════
  console.log('💬 Creating comments...');
  await Promise.all([
    prisma.comment.create({ data: { content: 'Started on OAuth — using Passport.js with Google and GitHub strategies first.', taskId: t_oauth.id, userId: mike.id } }),
    prisma.comment.create({ data: { content: 'Handle email verification and account linking edge cases. I can help with routes.', taskId: t_oauth.id, userId: sarah.id } }),
    prisma.comment.create({ data: { content: 'Query time down from 450ms to 80ms after adding composite indexes! 🚀', taskId: t_dbopt.id, userId: sarah.id } }),
    prisma.comment.create({ data: { content: 'Should we use Socket.IO or raw WebSockets? Socket.IO has better fallback.', taskId: t_realtime.id, userId: mike.id } }),
    prisma.comment.create({ data: { content: 'Let\'s go with Socket.IO — we already use it in the codebase.', taskId: t_realtime.id, userId: sarah.id } }),
    prisma.comment.create({ data: { content: 'Mobile testing done on iPhone, Galaxy, and iPad. All layouts pass! ✨', taskId: t_mobile.id, userId: emily.id } }),
    prisma.comment.create({ data: { content: '8 out of 10 influencers responded positively. Negotiating rates now.', taskId: t_influencer.id, userId: mike.id } }),
    prisma.comment.create({ data: { content: 'Valentine\'s campaign hit 2.5x our target conversion rate! 🎉', taskId: t_valentines.id, userId: emily.id } }),
    prisma.comment.create({ data: { content: 'Wireframes approved by the client. Moving to hi-fi mockups now.', taskId: t_wireframes.id, userId: mike.id } }),
    prisma.comment.create({ data: { content: 'The modal animation feels snappy — 200ms ease-out is perfect.', taskId: t_modals.id, userId: emily.id } }),
    prisma.comment.create({ data: { content: 'New color palette is WCAG AAA compliant. Looks fantastic! 🎨', taskId: t_colorPalette.id, userId: sarah.id } }),
    prisma.comment.create({ data: { content: 'Found some great Airbnbs in Shibuya and Gion. Adding links.', taskId: t_japan.id, userId: emily.id } }),
    prisma.comment.create({ data: { content: 'Binance API integration is live — real-time prices updating every 5s.', taskId: t_exchange.id, userId: mike.id } }),
    prisma.comment.create({ data: { content: 'Onboarding flow tested with 10 new users — avg completion time 45s ✅', taskId: t_onboard.id, userId: emily.id } }),
    prisma.comment.create({ data: { content: 'Blog post draft is at 2500 words. Adding screenshots and graphs.', taskId: t_caseStudy.id, userId: mike.id } }),
  ]);

  console.log('✅ Created 15 comments');

  // ══════════════════════════════════════════════════
  //  NOTIFICATIONS  (8, spread across users)
  // ══════════════════════════════════════════════════
  console.log('🔔 Creating notifications...');
  await Promise.all([
    prisma.notification.create({ data: { userId: mike.id, type: 'task_assigned', title: 'New Task Assigned', message: 'You were assigned to "Implement OAuth login flow"', read: false, boardId: boardProduct.id, taskId: t_oauth.id } }),
    prisma.notification.create({ data: { userId: sarah.id, type: 'comment_added', title: 'New Comment', message: 'Mike Chen commented on "Database query optimization"', read: false, boardId: boardProduct.id, taskId: t_dbopt.id } }),
    prisma.notification.create({ data: { userId: emily.id, type: 'task_assigned', title: 'New Task Assigned', message: 'You were assigned to "Modal & dialog system"', read: false, boardId: boardUIKit.id, taskId: t_modals.id } }),
    prisma.notification.create({ data: { userId: sarah.id, type: 'mention', title: 'You were mentioned', message: 'Emily Rodriguez mentioned you in "New color palette"', read: true, boardId: boardBranding.id, taskId: t_colorPalette.id } }),
    prisma.notification.create({ data: { userId: mike.id, type: 'comment_added', title: 'New Comment', message: 'Sarah replied on "Implement OAuth login flow"', read: true, boardId: boardProduct.id, taskId: t_oauth.id } }),
    prisma.notification.create({ data: { userId: emily.id, type: 'board_update', title: 'Board Updated', message: 'Sarah added a new list "Review" to Product Roadmap Q1', read: false, boardId: boardProduct.id } }),
    prisma.notification.create({ data: { userId: mike.id, type: 'task_due', title: 'Task Due Soon', message: '"Influencer partnerships" is due in 2 days', read: false, boardId: boardCampaigns.id, taskId: t_influencer.id } }),
    prisma.notification.create({ data: { userId: sarah.id, type: 'task_assigned', title: 'New Task Assigned', message: 'You were assigned to "Frontend development"', read: false, boardId: boardClientA.id, taskId: t_frontend.id } }),
  ]);

  console.log('✅ Created 8 notifications');

  // ══════════════════════════════════════════════════
  //  ACTIVITY LOGS (12)
  // ══════════════════════════════════════════════════
  console.log('📊 Creating activity logs...');
  await Promise.all([
    prisma.activity.create({ data: { boardId: boardProduct.id, userId: sarah.id, type: 'board_created', description: 'created board "Product Roadmap Q1"' } }),
    prisma.activity.create({ data: { boardId: boardProduct.id, userId: mike.id, type: 'task_created', description: 'added "Implement OAuth login flow"', taskId: t_oauth.id } }),
    prisma.activity.create({ data: { boardId: boardProduct.id, userId: sarah.id, type: 'task_assigned', description: 'assigned task to Mike Chen', taskId: t_oauth.id } }),
    prisma.activity.create({ data: { boardId: boardProduct.id, userId: mike.id, type: 'task_updated', description: 'moved task to "In Progress"', taskId: t_oauth.id } }),
    prisma.activity.create({ data: { boardId: boardProduct.id, userId: sarah.id, type: 'task_completed', description: 'completed "Mobile responsive fixes"', taskId: t_mobile.id } }),
    prisma.activity.create({ data: { boardId: boardBackend.id, userId: sarah.id, type: 'board_created', description: 'created board "Backend API"' } }),
    prisma.activity.create({ data: { boardId: boardCampaigns.id, userId: mike.id, type: 'board_created', description: 'created board "Q1 Campaigns"' } }),
    prisma.activity.create({ data: { boardId: boardCampaigns.id, userId: emily.id, type: 'task_completed', description: 'completed "Valentine\'s Day campaign"', taskId: t_valentines.id } }),
    prisma.activity.create({ data: { boardId: boardUIKit.id, userId: emily.id, type: 'board_created', description: 'created board "UI Kit v2"' } }),
    prisma.activity.create({ data: { boardId: boardUIKit.id, userId: emily.id, type: 'task_created', description: 'added "Modal & dialog system"', taskId: t_modals.id } }),
    prisma.activity.create({ data: { boardId: boardClientA.id, userId: mike.id, type: 'task_completed', description: 'completed "Homepage wireframes"', taskId: t_wireframes.id } }),
    prisma.activity.create({ data: { boardId: boardBranding.id, userId: emily.id, type: 'task_completed', description: 'completed "New color palette"', taskId: t_colorPalette.id } }),
  ]);

  console.log('✅ Created activity logs');

  // ══════════════════════════════════════════════════
  //  DIRECT MESSAGES  (10 messages, all pairs)
  // ══════════════════════════════════════════════════
  console.log('💌 Creating direct messages...');
  await Promise.all([
    // Sarah ↔ Mike
    prisma.directMessage.create({ data: { senderId: sarah.id, receiverId: mike.id, content: 'Hey Mike, how\'s the OAuth integration going?', read: true } }),
    prisma.directMessage.create({ data: { senderId: mike.id, receiverId: sarah.id, content: 'Going well! Google login is done, working on GitHub now.', read: true } }),
    prisma.directMessage.create({ data: { senderId: sarah.id, receiverId: mike.id, content: 'Nice! Can you also add the rate limiting middleware this week?', read: true } }),
    prisma.directMessage.create({ data: { senderId: mike.id, receiverId: sarah.id, content: 'Sure, I\'ll pick that up after the OAuth PR is merged. 👍', read: false } }),
    // Sarah ↔ Emily
    prisma.directMessage.create({ data: { senderId: emily.id, receiverId: sarah.id, content: 'Brand guidelines doc is ready for review!', read: false } }),
    prisma.directMessage.create({ data: { senderId: sarah.id, receiverId: emily.id, content: 'Looks amazing! The color palette is spot on. 🎨', read: true } }),
    prisma.directMessage.create({ data: { senderId: emily.id, receiverId: sarah.id, content: 'Thanks! I\'ll finalize the typography section today.', read: false } }),
    // Mike ↔ Emily
    prisma.directMessage.create({ data: { senderId: mike.id, receiverId: emily.id, content: 'Emily, can you design the social media templates for Q1?', read: true } }),
    prisma.directMessage.create({ data: { senderId: emily.id, receiverId: mike.id, content: 'Already started! Will share the Figma link by EOD.', read: true } }),
    prisma.directMessage.create({ data: { senderId: mike.id, receiverId: emily.id, content: 'Perfect timing — the Acme client wants similar styles.', read: false } }),
  ]);

  console.log('✅ Created 10 direct messages');

  // ── Summary ────────────────────────────────────────
  console.log('\n🎉 Production seeding completed!\n');
  console.log('📊 Summary:');
  console.log('   👥 Users: 3');
  console.log('   🏢 Workspaces: 7');
  console.log(`   📋 Boards: 10`);
  console.log(`   📝 Tasks: ${allTasks.length}`);
  console.log('   💬 Comments: 15');
  console.log('   🔔 Notifications: 8');
  console.log('   📊 Activities: 12');
  console.log('   💌 Direct Messages: 10');
  console.log('\n✨ Demo credentials (same for all accounts):');
  console.log('   🔑 Password: Demo123!');
  console.log('\n👤 Accounts:');
  console.log('   - sarah.johnson@taskflow.demo  (Engineering lead)');
  console.log('   - mike.chen@taskflow.demo      (Marketing + Freelance)');
  console.log('   - emily.rodriguez@taskflow.demo (Design + Personal)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
