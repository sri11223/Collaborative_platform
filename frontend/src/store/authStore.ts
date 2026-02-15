import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/auth.api';
import { TOKEN_KEY, USER_KEY } from '../constants';
import { connectSocket, disconnectSocket } from '../lib/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  updateProfile: (data: { name?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login({ email, password });
      const { user, token } = data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      connectSocket(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.signup({ email, name, password });
      const { user, token } = data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      connectSocket(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    try {
      const { data } = await authApi.getProfile();
      connectSocket(token);
      set({ user: data.data, isAuthenticated: true, token });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  setUser: (user: User) => {
    set({ user });
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  updateProfile: async (data: { name?: string }) => {
    const { data: res } = await authApi.updateProfile(data);
    const updatedUser = res.data;
    set({ user: updatedUser });
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  },
}));
