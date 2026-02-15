import apiClient from '../lib/axios';
import type { ApiResponse, List } from '../types';

export const listApi = {
  getLists: (boardId: string) =>
    apiClient.get<ApiResponse<List[]>>(`/boards/${boardId}/lists`),

  createList: (boardId: string, title: string) =>
    apiClient.post<ApiResponse<List>>(`/boards/${boardId}/lists`, { title }),

  updateList: (listId: string, data: { title?: string }) =>
    apiClient.put<ApiResponse<List>>(`/lists/${listId}`, data),

  deleteList: (listId: string) =>
    apiClient.delete<ApiResponse<{ message: string; boardId: string }>>(`/lists/${listId}`),

  reorderLists: (boardId: string, orders: { id: string; position: number }[]) =>
    apiClient.put<ApiResponse<List[]>>(`/boards/${boardId}/lists/reorder`, { orders }),
};
