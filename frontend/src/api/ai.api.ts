import apiClient from '../lib/axios';
import type { ApiResponse, Board } from '../types';

// AI calls can take longer due to Gemini processing
const AI_TIMEOUT = 120000;

export interface BugReportResult {
  task: any;
  detectedPriority: string;
  assignedToList: string;
}

export interface BreakdownResult {
  parentTitle: string;
  subtasks: any[];
  count: number;
}

export interface WorkloadAnalysis {
  summary: {
    totalTasks: number;
    totalMembers: number;
    overdueTasks: number;
    dueSoonTasks: number;
    unassignedTasks: number;
    avgTasksPerMember: number;
    priorityDistribution: { low: number; medium: number; high: number; urgent: number };
  };
  memberWorkloads: {
    user: { id: string; name: string; email: string; avatar: string | null };
    totalTasks: number;
    highPriority: number;
    overdue: number;
    dueSoon: number;
    tasksByPriority: Record<string, number>;
  }[];
  insights: string[];
}

export interface StandupReport {
  date: string;
  workspace: string;
  recentActivity: { name: string; actions: string[] }[];
  inProgress: { id: string; title: string; board: string; list: string }[];
  upcoming: { id: string; title: string; dueDate: string | null; board: string }[];
  overdue: { id: string; title: string; dueDate: string | null; board: string }[];
  blockers: string[];
}

export interface SprintPlan {
  sprintDuration: string;
  startDate: string;
  endDate: string;
  teamSize: number;
  capacity: number;
  totalCandidates: number;
  plan: {
    mustDo: SprintTask[];
    shouldDo: SprintTask[];
    couldDo: SprintTask[];
  };
  recommendations: string[];
}

export interface SprintTask {
  id: string;
  title: string;
  priority: string;
  score: number;
  board: string;
  assignees: string[];
  dueDate: string | null;
}

export const aiApi = {
  generateProject: (workspaceId: string, description: string) =>
    apiClient.post<ApiResponse<Board>>('/ai/generate-project', { workspaceId, description }, { timeout: AI_TIMEOUT }),

  createBugReport: (boardId: string, description: string) =>
    apiClient.post<ApiResponse<BugReportResult>>('/ai/bug-report', { boardId, description }, { timeout: AI_TIMEOUT }),

  breakdownTask: (boardId: string, listId: string, parentTitle: string, description: string) =>
    apiClient.post<ApiResponse<BreakdownResult>>('/ai/breakdown', { boardId, listId, parentTitle, description }, { timeout: AI_TIMEOUT }),

  analyzeWorkload: (workspaceId: string) =>
    apiClient.get<ApiResponse<WorkloadAnalysis>>(`/ai/workload/${workspaceId}`, { timeout: AI_TIMEOUT }),

  generateStandup: (workspaceId: string) =>
    apiClient.get<ApiResponse<StandupReport>>(`/ai/standup/${workspaceId}`, { timeout: AI_TIMEOUT }),

  planSprint: (workspaceId: string, days?: number) =>
    apiClient.get<ApiResponse<SprintPlan>>(`/ai/sprint/${workspaceId}`, { params: days ? { days } : {}, timeout: AI_TIMEOUT }),
};
