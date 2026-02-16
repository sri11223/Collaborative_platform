# 🌱 Seeding Production Database with Rich Mock Data

## What Gets Seeded

The seed script creates a **realistic, production-ready dataset** with:

- **5 Demo Users** with different roles and avatars
- **3 Workspaces** (Corporate, Marketing, Personal)
- **5 Boards** across different teams
- **16 Tasks** with various statuses (todo, in-progress, done)
- **10+ Comments** with collaborative discussions
- **Task Assignments** to different team members
- **Activity Logs** tracking board changes
- **Notifications** for assignments and mentions
- **Labels & Priorities** for task organization

## Demo User Credentials

All demo users share the same password for testing:

```
Email: [user]@taskflow.demo
Password: Demo123!
```

### Available Demo Accounts

1. **sarah.johnson@taskflow.demo** - Product Manager
2. **mike.chen@taskflow.demo** - Engineering Lead
3. **emily.rodriguez@taskflow.demo** - Designer
4. **alex.kumar@taskflow.demo** - Backend Developer
5. **lisa.martinez@taskflow.demo** - Marketing Manager

## Running the Seed Script

### Option 1: Run in Render Production (Recommended)

1. **Open Render Shell:**
   - Go to https://dashboard.render.com
   - Select your **taskflow-api-mimm** service
   - Click **Shell** tab (or click the `>_` icon)

2. **Run the seed command:**
   ```bash
   npm run seed
   ```

3. **Verify success:**
   - You should see output like:
   ```
   🌱 Starting database seeding...
   🗑️  Clearing existing data...
   👥 Creating users...
   ✅ Created 5 users
   🏢 Creating workspaces...
   ✅ Created 3 workspaces
   📋 Creating boards...
   ✅ Created 5 boards
   ...
   🎉 Seeding completed successfully!
   ```

### Option 2: Run Locally (Testing)

```bash
cd backend

# Make sure you have dependencies
npm install

# Run seed (uses local SQLite database)
npm run seed
```

### Option 3: Run via Prisma CLI

```bash
npx prisma db seed
```

## What the Data Looks Like

### Workspaces & Boards

**Acme Corporation** (Corporate workspace)
- 📋 Product Roadmap Q1 2026 ⭐
  - Tasks about authentication, real-time features, database optimization
- 📋 Website Redesign
  - Tasks about branding, homepage design, CMS migration

**Marketing Team** (Marketing workspace)
- 📋 Q1 Marketing Campaigns ⭐
  - Tasks about influencer partnerships, video content
- 📋 Content Calendar
  - Tasks about blog posts, newsletters

**Side Projects** (Personal workspace)
- 📋 Mobile App Development ⭐
  - Tasks about React Native, offline sync, push notifications

### Sample Tasks

- **"Design new user authentication flow"** - In Progress, High Priority
  - Assigned to Mike Chen
  - Has comments about OAuth implementation
  - Due: March 15, 2026

- **"Implement real-time collaboration features"** - Todo, High Priority
  - Assigned to Alex Kumar
  - Discussion about Socket.IO vs WebSockets

- **"Database optimization and indexing"** - In Progress
  - Assigned to Sarah Johnson
  - Comment showing 80% performance improvement

## Clearing Data Before Seeding

The seed script **automatically clears all existing data** before seeding. It deletes in this order:

1. Notifications
2. Board Activities
3. Comments
4. Task Assignments
5. Tasks
6. Board Members
7. Invitations
8. Boards
9. Workspaces
10. Users

⚠️ **Warning:** This will delete ALL data in your production database. Make sure this is what you want!

## After Seeding

### Test the Application

1. **Login with demo account:**
   - Go to https://taskflow-collaborative-platform.vercel.app/login
   - Email: `sarah.johnson@taskflow.demo`
   - Password: `Demo123!`

2. **Explore the data:**
   - You'll see 3 workspaces
   - Multiple boards with real tasks
   - Comments and activity
   - Notifications in bell icon

### Verify in Prisma Studio

```bash
# In Render Shell
npx prisma studio
```

Then open the URL shown (usually `https://xxx.onrender.com:5555`)

## Modifying the Seed Data

To customize the seed data, edit [backend/prisma/seed.ts](backend/prisma/seed.ts):

```typescript
// Add more users
const newUser = await prisma.user.create({
  data: {
    email: 'john.doe@taskflow.demo',
    name: 'John Doe',
    password: hashedPassword, // Same as others: Demo123!
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
});

// Add more workspaces
const newWorkspace = await prisma.workspace.create({
  data: {
    name: 'Engineering Team',
    description: 'Backend and DevOps work',
    ownerId: newUser.id,
  },
});

// Add more tasks, boards, etc.
```

Then run `npm run seed` again in Render Shell.

## Troubleshooting

### Error: "Cannot find module 'ts-node'"

```bash
# Install dependencies first
npm install
npm run seed
```

### Error: "Table 'User' does not exist"

```bash
# Run migrations first
npx prisma migrate deploy
npm run seed
```

### Error: "Unique constraint failed on User.email"

The seed script should clear data first, but if it fails:

```bash
# Manually reset database
npx prisma migrate reset --force
npx prisma migrate deploy
npm run seed
```

### Want to keep existing data?

Comment out the deletion section in [seed.ts](backend/prisma/seed.ts):

```typescript
// Comment out these lines (lines ~10-21)
/*
await prisma.notification.deleteMany();
await prisma.boardActivity.deleteMany();
// ... etc
*/
```

## Production Best Practices

### For Demo/Staging Environments:
✅ Run seed script to show off features
✅ Great for user testing and presentations
✅ Provides realistic data for UI screenshots

### For Production Environments:
❌ **DO NOT** run seed script
❌ Real user data should not be cleared
✅ Only seed initial/test data on first deploy
✅ Use migrations for schema changes

---

**🎯 TL;DR:**
1. Go to Render → taskflow-api-mimm → Shell
2. Run `npm run seed`
3. Login at production URL with `sarah.johnson@taskflow.demo` / `Demo123!`
4. Enjoy rich, realistic demo data! 🎉
