import apiClient from '../lib/axios';
import type { ApiResponse, Invitation, ActivitiesResponse } from '../types';

export const invitationApi = {
  createInvitation: (boardId: string, data: { email: string; role?: string }) =>
    apiClient.post<ApiResponse<Invitation>>(`/boards/${boardId}/invitations`, data),

  getUserInvitations: () =>
    apiClient.get<ApiResponse<Invitation[]>>('/invitations'),

  acceptInvitation: (invitationId: string) =>
    apiClient.put<ApiResponse<{ message: string; boardId: string }>>(`/invitations/${invitationId}/accept`),

  declineInvitation: (invitationId: string) =>
    apiClient.put<ApiResponse<{ message: string }>>(`/invitations/${invitationId}/decline`),

  getBoardInvitations: (boardId: string) =>
    apiClient.get<ApiResponse<Invitation[]>>(`/boards/${boardId}/invitations`),
};

export const activityApi = {
  getBoardActivities: (boardId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<ActivitiesResponse>>(`/boards/${boardId}/activities`, { params }),
};

export const labelApi = {
  getBoardLabels: (boardId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/boards/${boardId}/labels`),

  createLabel: (boardId: string, data: { name: string; color: string }) =>
    apiClient.post<ApiResponse<any>>(`/boards/${boardId}/labels`, data),

  updateLabel: (labelId: string, data: { name?: string; color?: string }) =>
    apiClient.put<ApiResponse<any>>(`/labels/${labelId}`, data),

  deleteLabel: (labelId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/labels/${labelId}`),
};
