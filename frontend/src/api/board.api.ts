import apiClient from '../lib/axios';
import type { ApiResponse, Board, BoardsResponse } from '../types';

export const boardApi = {
  getBoards: (params?: { page?: number; limit?: number; search?: string; workspaceId?: string }) =>
    apiClient.get<ApiResponse<BoardsResponse>>('/boards', { params }),

  getBoard: (id: string) =>
    apiClient.get<ApiResponse<Board>>(`/boards/${id}`),

  createBoard: (data: { title: string; description?: string; color?: string; workspaceId?: string }) =>
    apiClient.post<ApiResponse<Board>>('/boards', data),

  updateBoard: (id: string, data: { title?: string; description?: string; color?: string }) =>
    apiClient.put<ApiResponse<Board>>(`/boards/${id}`, data),

  deleteBoard: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/boards/${id}`),

  removeMember: (boardId: string, memberId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/boards/${boardId}/members/${memberId}`),
};
