import apiClient from '../lib/axios';

export const workspaceApi = {
  getWorkspaces: () => apiClient.get('/workspaces'),
  getWorkspace: (id: string) => apiClient.get(`/workspaces/${id}`),
  createWorkspace: (data: { name: string; color?: string; icon?: string }) =>
    apiClient.post('/workspaces', data),
  updateWorkspace: (id: string, data: { name?: string; color?: string; icon?: string }) =>
    apiClient.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id: string) => apiClient.delete(`/workspaces/${id}`),
  addMember: (workspaceId: string, userId: string, role?: string) =>
    apiClient.post(`/workspaces/${workspaceId}/members`, { userId, role }),
  removeMember: (workspaceId: string, userId: string) =>
    apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`),
};
