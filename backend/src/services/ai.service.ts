import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { NotFoundError } from '../utils/errors';
import { activityService } from './activity.service';

// ─── Gemini Setup ───────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function askGemini(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}

function parseJSON(text: string): any {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
  try {
    return JSON.parse(raw);
  } catch {
    const objMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objMatch) {
      return JSON.parse(objMatch[1]);
    }
    throw new Error('Failed to parse AI response');
  }
}

// ─── AI Service ─────────────────────────────────────────────────────

class AiService {

  // ── 1. Generate Project ─────────────────────────────────────────

  async generateProject(userId: string, workspaceId: string, description: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId } } },
    });
    if (!workspace) throw new NotFoundError('Workspace not found');

    const prompt = `You are a senior project manager. A user wants to create a project board for task management.

Project description: "${description}"

Generate a project board structure as JSON with this EXACT format:
{
  "boardTitle": "Short project name",
  "color": "#hex color that fits the project theme",
  "lists": [
    {
      "title": "List name (e.g., Backlog, In Progress, Review, Done)",
      "tasks": [
        {
          "title": "Specific actionable task",
          "priority": "low|medium|high|urgent",
          "dueOffset": number_of_days_from_now
        }
      ]
    }
  ],
  "labels": [
    { "name": "Label name", "color": "#hex" }
  ]
}

Rules:
- Create 4-6 lists representing workflow stages
- Each list should have 3-6 specific, actionable tasks
- Total 15-25 tasks across all lists
- Priorities should be realistic (most medium, some high, few urgent)
- Due dates as day offsets (1-21 days from now)
- 4-6 relevant labels with distinct colors
- Make tasks specific to the project, not generic
- Return ONLY valid JSON, no explanation`;

    const aiResponse = await askGemini(prompt);
    const plan = parseJSON(aiResponse);

    // Create board
    const board = await prisma.board.create({
      data: {
        title: plan.boardTitle || 'AI Generated Project',
        color: plan.color || '#6366f1',
        workspaceId,
        ownerId: userId,
        members: {
          create: { userId, role: 'admin' },
        },
      },
    });

    // Create labels
    if (plan.labels && Array.isArray(plan.labels)) {
      for (const label of plan.labels) {
        await prisma.label.create({
          data: { name: label.name, color: label.color, boardId: board.id },
        });
      }
    }

    // Create lists and tasks
    const createdLists: any[] = [];
    const lists = plan.lists || [];

    for (let i = 0; i < lists.length; i++) {
      const listData = lists[i];
      const list = await prisma.list.create({
        data: { title: listData.title, position: i, boardId: board.id },
      });

      const tasks: any[] = [];
      for (let j = 0; j < (listData.tasks || []).length; j++) {
        const taskData = listData.tasks[j];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (taskData.dueOffset || 7));

        const task = await prisma.task.create({
          data: {
            title: taskData.title,
            priority: taskData.priority || 'medium',
            position: j,
            listId: list.id,
            dueDate,
          },
        });

        if (['high', 'urgent'].includes(taskData.priority)) {
          await prisma.taskAssignee.create({
            data: { taskId: task.id, userId },
          }).catch(() => {});
        }

        tasks.push(task);
      }

      createdLists.push({ ...list, tasks });
    }

    await activityService.log({
      type: 'board_created',
      description: `AI generated project "${board.title}" with ${createdLists.length} lists`,
      boardId: board.id,
      userId,
    });

    return { ...board, lists: createdLists, aiSummary: plan.boardTitle };
  }

  // ── 2. Smart Bug Report ─────────────────────────────────────────

  async createBugReport(userId: string, boardId: string, description: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { lists: { orderBy: { position: 'asc' } }, labels: true },
    });
    if (!board) throw new NotFoundError('Board not found');

    const prompt = `You are a QA engineer. Analyze this bug report and create a structured ticket.

Bug description: "${description}"

Respond with JSON in this EXACT format:
{
  "title": "Clear, concise bug title (max 80 chars)",
  "priority": "low|medium|high|urgent",
  "severity": "cosmetic|minor|major|critical",
  "stepsToReproduce": ["Step 1", "Step 2", "Step 3"],
  "expectedBehavior": "What should happen",
  "actualBehavior": "What actually happens",
  "possibleCause": "Technical hypothesis of what might be wrong",
  "suggestedFix": "High-level approach to fix this",
  "affectedArea": "Which part of the system is affected",
  "labels": ["Bug", "one more relevant label"]
}

Rules:
- Priority based on impact: crashes/data loss = urgent, broken features = high, UI issues = medium, cosmetic = low
- Be specific and technical in the analysis
- Return ONLY valid JSON`;

    const aiResponse = await askGemini(prompt);
    const analysis = parseJSON(aiResponse);

    const targetList = board.lists.find(
      (l) => /bug|issue|backlog|todo/i.test(l.title)
    ) || board.lists[0];

    if (!targetList) throw new NotFoundError('No lists found in board');

    const richDescription = `## 🐛 Bug Report (AI-Analyzed)

**Severity:** ${analysis.severity || 'unknown'}
**Affected Area:** ${analysis.affectedArea || 'N/A'}

### Steps to Reproduce
${(analysis.stepsToReproduce || []).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

### Expected Behavior
${analysis.expectedBehavior || 'N/A'}

### Actual Behavior
${analysis.actualBehavior || 'N/A'}

### 🔍 AI Analysis
**Possible Cause:** ${analysis.possibleCause || 'Requires investigation'}
**Suggested Fix:** ${analysis.suggestedFix || 'Requires investigation'}

---
*Original report: ${description}*`;

    const maxPos = await prisma.task.count({ where: { listId: targetList.id } });

    const dueDate = new Date();
    const daysMap: Record<string, number> = { urgent: 1, high: 3, medium: 7, low: 14 };
    dueDate.setDate(dueDate.getDate() + (daysMap[analysis.priority] || 7));

    const task = await prisma.task.create({
      data: {
        title: analysis.title || `Bug: ${description.substring(0, 60)}`,
        description: richDescription,
        priority: analysis.priority || 'medium',
        position: maxPos,
        listId: targetList.id,
        dueDate,
      },
    });

    await prisma.taskAssignee.create({
      data: { taskId: task.id, userId },
    }).catch(() => {});

    // Attach existing labels
    for (const labelName of (analysis.labels || ['Bug'])) {
      const existing = board.labels.find((l) => l.name.toLowerCase() === labelName.toLowerCase());
      if (existing) {
        await prisma.taskLabel.create({
          data: { taskId: task.id, labelId: existing.id },
        }).catch(() => {});
      }
    }

    await activityService.log({
      type: 'task_created',
      description: `AI created bug report: "${task.title}" [${analysis.priority}]`,
      boardId: board.id,
      userId,
      taskId: task.id,
    });

    return {
      task,
      detectedPriority: analysis.priority,
      severity: analysis.severity,
      assignedToList: targetList.title,
      aiAnalysis: {
        possibleCause: analysis.possibleCause,
        suggestedFix: analysis.suggestedFix,
        affectedArea: analysis.affectedArea,
      },
    };
  }

  // ── 3. Task Breakdown ───────────────────────────────────────────

  async breakdownTask(
    userId: string,
    boardId: string,
    listId: string,
    parentTitle: string,
    description: string
  ) {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundError('Board not found');

    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundError('List not found');

    const prompt = `You are a senior developer and project planner. Break down this task into smaller subtasks.

Task: "${parentTitle}"
Details: "${description}"

Respond with JSON in this EXACT format:
{
  "subtasks": [
    {
      "title": "Specific subtask title",
      "priority": "low|medium|high|urgent",
      "dueOffset": number_of_days_from_now,
      "estimatedHours": number
    }
  ],
  "totalEstimatedHours": number,
  "approach": "Brief description of the recommended approach",
  "dependencies": "Any dependencies or blockers to be aware of",
  "risks": "Potential risks or challenges"
}

Rules:
- Create 5-10 specific, actionable subtasks
- Order subtasks by dependency/logical sequence
- Each subtask should be completable in 1-8 hours
- Include research, implementation, testing, and review steps
- Priorities should reflect urgency and dependency order
- Return ONLY valid JSON`;

    const aiResponse = await askGemini(prompt);
    const plan = parseJSON(aiResponse);

    const maxPos = await prisma.task.count({ where: { listId } });
    const subtasks: any[] = [];

    for (let i = 0; i < (plan.subtasks || []).length; i++) {
      const sub = plan.subtasks[i];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (sub.dueOffset || (i + 1) * 2));

      const task = await prisma.task.create({
        data: {
          title: sub.title,
          description: sub.estimatedHours ? `Estimated: ${sub.estimatedHours}h` : undefined,
          priority: sub.priority || 'medium',
          position: maxPos + i,
          listId,
          dueDate,
        },
      });
      subtasks.push(task);
    }

    await activityService.log({
      type: 'task_created',
      description: `AI broke down "${parentTitle}" into ${subtasks.length} subtasks`,
      boardId: board.id,
      userId,
    });

    return {
      parentTitle,
      subtasks,
      count: subtasks.length,
      aiPlan: {
        totalEstimatedHours: plan.totalEstimatedHours,
        approach: plan.approach,
        dependencies: plan.dependencies,
        risks: plan.risks,
      },
    };
  }

  // ── 4. Workload Analyzer ────────────────────────────────────────

  async analyzeWorkload(userId: string, workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId } } },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        boards: {
          include: {
            lists: {
              include: {
                tasks: {
                  include: {
                    assignees: { include: { user: { select: { id: true, name: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!workspace) throw new NotFoundError('Workspace not found');

    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Flatten all tasks from boards → lists → tasks
    const allTasks = workspace.boards.flatMap((b) =>
      b.lists.flatMap((l) => l.tasks)
    );

    const memberWorkloads = workspace.members.map((member) => {
      const memberTasks = allTasks.filter((t) =>
        t.assignees.some((a) => a.userId === member.userId)
      );
      return {
        user: member.user,
        totalTasks: memberTasks.length,
        highPriority: memberTasks.filter((t) => ['high', 'urgent'].includes(t.priority)).length,
        overdue: memberTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now).length,
        dueSoon: memberTasks.filter((t) =>
          t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= threeDays
        ).length,
        tasksByPriority: {
          urgent: memberTasks.filter((t) => t.priority === 'urgent').length,
          high: memberTasks.filter((t) => t.priority === 'high').length,
          medium: memberTasks.filter((t) => t.priority === 'medium').length,
          low: memberTasks.filter((t) => t.priority === 'low').length,
        },
      };
    });

    const summary = {
      totalTasks: allTasks.length,
      totalMembers: workspace.members.length,
      overdueTasks: allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now).length,
      dueSoonTasks: allTasks.filter((t) =>
        t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= threeDays
      ).length,
      unassignedTasks: allTasks.filter((t) => t.assignees.length === 0).length,
      avgTasksPerMember: workspace.members.length > 0
        ? Math.round(allTasks.length / workspace.members.length)
        : 0,
      priorityDistribution: {
        urgent: allTasks.filter((t) => t.priority === 'urgent').length,
        high: allTasks.filter((t) => t.priority === 'high').length,
        medium: allTasks.filter((t) => t.priority === 'medium').length,
        low: allTasks.filter((t) => t.priority === 'low').length,
      },
    };

    // Ask Gemini for smart insights
    const insightPrompt = `You are a team productivity analyst. Analyze this team workload data and provide actionable insights.

Team: "${workspace.name}" with ${summary.totalMembers} members
Total Tasks: ${summary.totalTasks}
Overdue: ${summary.overdueTasks}
Due Soon (3 days): ${summary.dueSoonTasks}
Unassigned: ${summary.unassignedTasks}
Priority: urgent=${summary.priorityDistribution.urgent}, high=${summary.priorityDistribution.high}, medium=${summary.priorityDistribution.medium}, low=${summary.priorityDistribution.low}

Member breakdown:
${memberWorkloads.map((m) => `- ${m.user.name}: ${m.totalTasks} tasks (${m.highPriority} high/urgent, ${m.overdue} overdue)`).join('\n')}

Provide exactly 5 actionable insights as a JSON array of strings. Be specific with names and numbers. Focus on:
1. Workload balance between team members
2. Overdue task concerns
3. Priority distribution health
4. Specific recommendations for improvement
5. Risk areas

Return ONLY a JSON array like: ["insight 1", "insight 2", ...]`;

    let insights: string[] = [];
    try {
      const aiResponse = await askGemini(insightPrompt);
      const parsed = parseJSON(aiResponse);
      insights = Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      insights = [];
      if (summary.overdueTasks > 0) insights.push(`⚠️ ${summary.overdueTasks} tasks are overdue and need immediate attention.`);
      if (summary.unassignedTasks > 0) insights.push(`📋 ${summary.unassignedTasks} tasks have no assignee — consider distributing them.`);
      const overloaded = memberWorkloads.filter((m) => m.totalTasks > summary.avgTasksPerMember * 1.5);
      if (overloaded.length > 0) insights.push(`🔥 ${overloaded.map((m) => m.user.name).join(', ')} may be overloaded.`);
      if (insights.length === 0) insights.push('✅ Team workload looks balanced!');
    }

    return { summary, memberWorkloads, insights };
  }

  // ── 5. Standup Generator ────────────────────────────────────────

  async generateStandup(userId: string, workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId } } },
      include: {
        boards: {
          select: { id: true, title: true },
        },
      },
    });
    if (!workspace) throw new NotFoundError('Workspace not found');

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const boardIds = workspace.boards.map((b) => b.id);

    // Get recent activities across all boards in this workspace
    const recentActivities = await prisma.activity.findMany({
      where: { boardId: { in: boardIds }, createdAt: { gte: yesterday } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Group by user
    const activityByUser: Record<string, { name: string; actions: string[] }> = {};
    for (const act of recentActivities) {
      const name = act.user.name;
      if (!activityByUser[name]) activityByUser[name] = { name, actions: [] };
      activityByUser[name].actions.push(`${act.type}: ${act.description}`);
    }

    // Get in-progress tasks (tasks in lists named "In Progress" or similar)
    const inProgressLists = await prisma.list.findMany({
      where: {
        boardId: { in: boardIds },
        title: { contains: 'Progress' },
      },
      select: { id: true },
    });
    const inProgressListIds = inProgressLists.map((l) => l.id);

    const inProgressTasks = inProgressListIds.length > 0
      ? await prisma.task.findMany({
          where: { listId: { in: inProgressListIds } },
          include: {
            list: { include: { board: { select: { title: true } } } },
          },
          take: 15,
        })
      : [];

    // Get upcoming tasks (due in next 3 days)
    const upcomingTasks = await prisma.task.findMany({
      where: {
        list: { boardId: { in: boardIds } },
        dueDate: { gte: now, lte: threeDays },
      },
      include: { list: { include: { board: { select: { title: true } } } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Get overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        list: { boardId: { in: boardIds } },
        dueDate: { lt: now },
      },
      include: { list: { include: { board: { select: { title: true } } } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Ask Gemini for blockers
    let blockers: string[] = [];
    try {
      const blockerPrompt = `Based on this standup data, identify 0-3 potential blockers or concerns:
- ${overdueTasks.length} overdue tasks: ${overdueTasks.map((t) => t.title).slice(0, 5).join(', ') || 'none'}
- ${inProgressTasks.length} tasks in progress
- ${upcomingTasks.length} tasks due in next 3 days

Return ONLY a JSON array of short blocker strings (or empty array if none).
Example: ["3 overdue tasks may block sprint completion", "Too many parallel tasks in progress"]`;

      const aiResponse = await askGemini(blockerPrompt);
      const parsed = parseJSON(aiResponse);
      blockers = Array.isArray(parsed) ? parsed : [];
    } catch {
      if (overdueTasks.length > 3) blockers.push(`${overdueTasks.length} overdue tasks need urgent attention`);
    }

    return {
      date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      workspace: workspace.name,
      recentActivity: Object.values(activityByUser),
      inProgress: inProgressTasks.map((t) => ({
        id: t.id,
        title: t.title,
        board: t.list.board.title,
        list: t.list.title,
      })),
      upcoming: upcomingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate?.toISOString() || null,
        board: t.list.board.title,
      })),
      overdue: overdueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate?.toISOString() || null,
        board: t.list.board.title,
      })),
      blockers,
    };
  }

  // ── 6. Sprint Planner ───────────────────────────────────────────

  async planSprint(userId: string, workspaceId: string, sprintDays: number = 14) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId } } },
      include: {
        members: true,
        boards: {
          include: {
            lists: {
              include: {
                tasks: {
                  include: {
                    assignees: { include: { user: { select: { name: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!workspace) throw new NotFoundError('Workspace not found');

    const now = new Date();
    const sprintEnd = new Date(now.getTime() + sprintDays * 24 * 60 * 60 * 1000);

    // Flatten: boards → lists → tasks
    const allTasks = workspace.boards.flatMap((b) =>
      b.lists.flatMap((l) =>
        l.tasks.map((t) => ({
          ...t,
          boardTitle: b.title,
        }))
      )
    );

    const teamSize = workspace.members.length;
    const capacity = teamSize * Math.ceil(sprintDays / 2);

    // Ask Gemini to plan the sprint
    const taskSummary = allTasks.slice(0, 40).map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      board: t.boardTitle,
      assignees: t.assignees.map((a) => a.user.name),
      dueDate: t.dueDate?.toISOString() || null,
      isOverdue: t.dueDate ? new Date(t.dueDate) < now : false,
    }));

    const sprintPrompt = `You are an agile sprint planner. Plan a ${sprintDays}-day sprint for a team of ${teamSize}.

Sprint capacity: ~${capacity} tasks
Sprint dates: ${now.toISOString().split('T')[0]} to ${sprintEnd.toISOString().split('T')[0]}

Available tasks (${allTasks.length} total, showing top ${taskSummary.length}):
${JSON.stringify(taskSummary, null, 2)}

Respond with JSON in this EXACT format:
{
  "mustDo": ["task_id_1", "task_id_2"],
  "shouldDo": ["task_id_3", "task_id_4"],
  "couldDo": ["task_id_5"],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ]
}

Rules:
- mustDo: Overdue + urgent/high priority tasks (critical path)
- shouldDo: Important tasks that fit within remaining capacity
- couldDo: Stretch goals if team has bandwidth
- Total mustDo + shouldDo should not exceed capacity (${capacity})
- Use actual task IDs from the list above
- Provide 3-5 specific, actionable recommendations
- Return ONLY valid JSON`;

    let plan: any = { mustDo: [], shouldDo: [], couldDo: [] };
    let recommendations: string[] = [];

    try {
      const aiResponse = await askGemini(sprintPrompt);
      const aiPlan = parseJSON(aiResponse);

      const taskMap = new Map(allTasks.map((t) => [t.id, t]));

      const mapTasks = (ids: string[]) =>
        (ids || [])
          .map((id: string) => taskMap.get(id))
          .filter((t): t is NonNullable<typeof t> => t !== undefined)
          .map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            score: t.priority === 'urgent' ? 4 : t.priority === 'high' ? 3 : t.priority === 'medium' ? 2 : 1,
            board: t.boardTitle,
            assignees: t.assignees.map((a) => a.user.name),
            dueDate: t.dueDate?.toISOString() || null,
          }));

      plan.mustDo = mapTasks(aiPlan.mustDo);
      plan.shouldDo = mapTasks(aiPlan.shouldDo);
      plan.couldDo = mapTasks(aiPlan.couldDo);
      recommendations = aiPlan.recommendations || [];
    } catch {
      // Fallback: score-based planning
      const scored = allTasks.map((t) => {
        let score = 0;
        if (t.priority === 'urgent') score += 4;
        else if (t.priority === 'high') score += 3;
        else if (t.priority === 'medium') score += 2;
        else score += 1;
        if (t.dueDate && new Date(t.dueDate) < now) score += 3;
        if (t.dueDate && new Date(t.dueDate) <= sprintEnd) score += 1;
        return {
          id: t.id,
          title: t.title,
          priority: t.priority,
          score,
          board: t.boardTitle,
          assignees: t.assignees.map((a) => a.user.name),
          dueDate: t.dueDate?.toISOString() || null,
        };
      }).sort((a, b) => b.score - a.score);

      const mustCount = Math.min(Math.ceil(capacity * 0.4), scored.length);
      const shouldCount = Math.min(Math.ceil(capacity * 0.4), scored.length - mustCount);

      plan.mustDo = scored.slice(0, mustCount);
      plan.shouldDo = scored.slice(mustCount, mustCount + shouldCount);
      plan.couldDo = scored.slice(mustCount + shouldCount, mustCount + shouldCount + 5);
      recommendations = ['AI recommendations unavailable — using score-based planning.'];
    }

    return {
      sprintDuration: `${sprintDays} days`,
      startDate: now.toISOString(),
      endDate: sprintEnd.toISOString(),
      teamSize,
      capacity,
      totalCandidates: allTasks.length,
      plan,
      recommendations,
    };
  }
}

export const aiService = new AiService();
