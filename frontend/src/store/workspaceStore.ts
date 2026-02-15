import { create } from 'zustand';
import { workspaceApi } from '../api/workspace.api';
import type { Workspace } from '../types';
import toast from 'react-hot-toast';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  fetchWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (ws: Workspace | null) => void;
  createWorkspace: (data: { name: string; color?: string; icon?: string }) => Promise<Workspace>;
  updateWorkspace: (id: string, data: { name?: string; color?: string; icon?: string }) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  loading: false,

  fetchWorkspaces: async () => {
    set({ loading: true });
    try {
      const { data } = await workspaceApi.getWorkspaces();
      const workspaces = data.data || [];
      set({ workspaces, loading: false });
      // Auto-select first workspace if none selected
      if (!get().currentWorkspace && workspaces.length > 0) {
        set({ currentWorkspace: workspaces[0] });
      }
    } catch {
      set({ loading: false });
    }
  },

  setCurrentWorkspace: (ws) => set({ currentWorkspace: ws }),

  createWorkspace: async (data) => {
    const { data: res } = await workspaceApi.createWorkspace(data);
    const ws = res.data;
    set((state) => ({
      workspaces: [ws, ...state.workspaces],
      currentWorkspace: ws,
    }));
    toast.success('Workspace created!');
    return ws;
  },

  updateWorkspace: async (id, data) => {
    const { data: res } = await workspaceApi.updateWorkspace(id, data);
    const updated = res.data;
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
      currentWorkspace: state.currentWorkspace?.id === id ? updated : state.currentWorkspace,
    }));
  },

  deleteWorkspace: async (id) => {
    await workspaceApi.deleteWorkspace(id);
    set((state) => {
      const remaining = state.workspaces.filter((w) => w.id !== id);
      return {
        workspaces: remaining,
        currentWorkspace: state.currentWorkspace?.id === id ? remaining[0] || null : state.currentWorkspace,
      };
    });
    toast.success('Workspace deleted');
  },
}));
