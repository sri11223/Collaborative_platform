import apiClient from '../lib/axios';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  boardId: string | null;
  taskId: string | null;
  metadata: string | null;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    apiClient.get('/notifications', { params }),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put('/notifications/read-all'),

  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),

  clearAll: () =>
    apiClient.delete('/notifications/clear-all'),
};

export const documentApi = {
  getDocuments: (workspaceId: string) =>
    apiClient.get(`/workspaces/${workspaceId}/documents`),

  getDocument: (id: string) =>
    apiClient.get(`/documents/${id}`),

  createDocument: (workspaceId: string, data: { title: string; content?: string }) =>
    apiClient.post(`/workspaces/${workspaceId}/documents`, data),

  updateDocument: (id: string, data: { title?: string; content?: string }) =>
    apiClient.put(`/documents/${id}`, data),

  deleteDocument: (id: string) =>
    apiClient.delete(`/documents/${id}`),
};

export const myTasksApi = {
  getMyTasks: () =>
    apiClient.get('/tasks/my-tasks'),
};
