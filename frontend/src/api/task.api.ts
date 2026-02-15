import apiClient from '../lib/axios';
import type { ApiResponse, Task, Comment, Label } from '../types';

export const taskApi = {
  getTask: (taskId: string) =>
    apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`),

  createTask: (listId: string, data: { title: string; description?: string; priority?: string; dueDate?: string }) =>
    apiClient.post<ApiResponse<Task>>(`/lists/${listId}/tasks`, data),

  updateTask: (taskId: string, data: { title?: string; description?: string; priority?: string; dueDate?: string | null }) =>
    apiClient.put<ApiResponse<Task>>(`/tasks/${taskId}`, data),

  deleteTask: (taskId: string) =>
    apiClient.delete<ApiResponse<{ message: string; listId: string }>>(`/tasks/${taskId}`),

  moveTask: (taskId: string, data: { toListId: string; position: number }) =>
    apiClient.put<ApiResponse<Task>>(`/tasks/${taskId}/move`, data),

  addAssignee: (taskId: string, userId: string) =>
    apiClient.post<ApiResponse<any>>(`/tasks/${taskId}/assignees`, { userId }),

  removeAssignee: (taskId: string, userId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/tasks/${taskId}/assignees/${userId}`),

  addLabel: (taskId: string, labelId: string) =>
    apiClient.post<ApiResponse<any>>(`/tasks/${taskId}/labels`, { labelId }),

  removeLabel: (taskId: string, labelId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/tasks/${taskId}/labels/${labelId}`),

  addComment: (taskId: string, content: string) =>
    apiClient.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content }),

  deleteComment: (taskId: string, commentId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/tasks/${taskId}/comments/${commentId}`),

  searchTasks: (boardId: string, query: string) =>
    apiClient.get<ApiResponse<Task[]>>(`/boards/${boardId}/tasks/search`, { params: { q: query } }),
};
