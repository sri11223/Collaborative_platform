import apiClient from '../lib/axios';
import type { ApiResponse, User } from '../types';

export const authApi = {
  signup: (data: { email: string; name: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),

  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),

  searchUsers: (query: string) =>
    apiClient.get<ApiResponse<User[]>>('/auth/users/search', { params: { q: query } }),
};
