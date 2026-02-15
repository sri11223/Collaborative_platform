import apiClient from '../lib/axios';
import type { ApiResponse } from '../types';

export const messageApi = {
  getWorkspaceMembers: (workspaceId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/workspaces/${workspaceId}/dm-members`),

  getConversation: (userId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ messages: any[]; pagination: any }>>(`/messages/${userId}`, { params }),

  sendMessage: (userId: string, content: string) =>
    apiClient.post<ApiResponse<any>>(`/messages/${userId}`, { content }),

  deleteMessage: (messageId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/messages/msg/${messageId}`),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/messages-unread/count'),
};

export const favoriteApi = {
  getFavorites: () =>
    apiClient.get<ApiResponse<any[]>>('/favorites'),

  addFavorite: (boardId: string) =>
    apiClient.post<ApiResponse<any>>(`/favorites/${boardId}`),

  removeFavorite: (boardId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/favorites/${boardId}`),
};
