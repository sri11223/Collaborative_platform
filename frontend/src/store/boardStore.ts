import { create } from 'zustand';
import type { Board, List, Task, Pagination } from '../types';
import { boardApi } from '../api/board.api';
import { listApi } from '../api/list.api';
import { taskApi } from '../api/task.api';

interface BoardState {
  // Dashboard state
  boards: Board[];
  boardsPagination: Pagination | null;
  boardsLoading: boolean;

  // Active board state
  activeBoard: Board | null;
  lists: List[];
  boardLoading: boolean;

  // Dashboard actions
  fetchBoards: (params?: { page?: number; limit?: number; search?: string; workspaceId?: string }) => Promise<void>;
  createBoard: (data: { title: string; description?: string; color?: string; workspaceId?: string }) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;

  // Board actions
  fetchBoard: (id: string) => Promise<void>;
  clearActiveBoard: () => void;
  setLists: (lists: List[]) => void;

  // List actions
  createList: (boardId: string, title: string) => Promise<void>;
  updateList: (listId: string, data: { title?: string }) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;

  // Task actions
  createTask: (listId: string, data: { title: string; description?: string; priority?: string; dueDate?: string }) => Promise<Task>;
  updateTask: (taskId: string, data: { title?: string; description?: string; priority?: string; dueDate?: string | null }) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, toListId: string, position: number) => Promise<void>;

  // Real-time update handlers
  handleTaskCreated: (task: Task) => void;
  handleTaskUpdated: (task: Task) => void;
  handleTaskDeleted: (data: { taskId: string; listId: string }) => void;
  handleTaskMoved: (data: { task: Task; fromListId: string; toListId: string }) => void;
  handleListCreated: (list: List) => void;
  handleListUpdated: (list: List) => void;
  handleListDeleted: (data: { listId: string }) => void;
}

let _boardFetchId = 0; // request sequencing to prevent stale responses

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  boardsPagination: null,
  boardsLoading: false,
  activeBoard: null,
  lists: [],
  boardLoading: false,

  // ==================== Dashboard =====================
  fetchBoards: async (params) => {
    const requestId = ++_boardFetchId;
    set({ boardsLoading: true });
    try {
      const { data } = await boardApi.getBoards(params);
      // Ignore stale responses — only apply the latest request
      if (requestId !== _boardFetchId) return;
      set({
        boards: data.data.boards,
        boardsPagination: data.data.pagination,
        boardsLoading: false,
      });
    } catch {
      if (requestId === _boardFetchId) {
        set({ boardsLoading: false });
      }
    }
  },

  createBoard: async (data) => {
    const { data: res } = await boardApi.createBoard(data);
    const board = res.data;
    set((state) => ({ boards: [board, ...state.boards] }));
    return board;
  },

  deleteBoard: async (id) => {
    await boardApi.deleteBoard(id);
    set((state) => ({ boards: state.boards.filter((b) => b.id !== id) }));
  },

  // ==================== Active Board ====================
  fetchBoard: async (id) => {
    set({ boardLoading: true });
    try {
      const { data } = await boardApi.getBoard(id);
      const board = data.data;
      set({
        activeBoard: board,
        lists: board.lists || [],
        boardLoading: false,
      });
    } catch {
      set({ boardLoading: false });
    }
  },

  clearActiveBoard: () => {
    set({ activeBoard: null, lists: [] });
  },

  setLists: (lists) => {
    set({ lists });
  },

  // ==================== List Actions ====================
  createList: async (boardId, title) => {
    const { data } = await listApi.createList(boardId, title);
    const list = data.data;
    set((state) => ({ lists: [...state.lists, { ...list, tasks: list.tasks || [] }] }));
  },

  updateList: async (listId, data) => {
    const { data: res } = await listApi.updateList(listId, data);
    const updated = res.data;
    set((state) => ({
      lists: state.lists.map((l) => (l.id === listId ? { ...l, ...updated } : l)),
    }));
  },

  deleteList: async (listId) => {
    await listApi.deleteList(listId);
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== listId),
    }));
  },

  // ==================== Task Actions ====================
  createTask: async (listId, data) => {
    const { data: res } = await taskApi.createTask(listId, data);
    const task = res.data;
    set((state) => {
      // Prevent duplicate if socket handler already added this task
      const exists = state.lists.some((l) => l.tasks.some((t) => t.id === task.id));
      if (exists) return state;
      return {
        lists: state.lists.map((l) =>
          l.id === listId ? { ...l, tasks: [...l.tasks, task] } : l
        ),
      };
    });
    return task;
  },

  updateTask: async (taskId, data) => {
    const { data: res } = await taskApi.updateTask(taskId, data);
    const task = res.data;
    set((state) => ({
      lists: state.lists.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, ...task } : t)),
      })),
    }));
    return task;
  },

  deleteTask: async (taskId) => {
    await taskApi.deleteTask(taskId);
    set((state) => ({
      lists: state.lists.map((l) => ({
        ...l,
        tasks: l.tasks.filter((t) => t.id !== taskId),
      })),
    }));
  },

  moveTask: async (taskId, toListId, position) => {
    // Optimistic update
    const currentLists = get().lists;
    let movedTask: Task | null = null;
    let fromListId: string | null = null;

    for (const list of currentLists) {
      const found = list.tasks.find((t) => t.id === taskId);
      if (found) {
        movedTask = found;
        fromListId = list.id;
        break;
      }
    }

    if (!movedTask || !fromListId) return;

    // Skip if already in target at same position (prevents dup on socket echo)
    if (fromListId === toListId) {
      const list = currentLists.find((l) => l.id === toListId);
      if (list && list.tasks[position]?.id === taskId) return;
    }

    // Optimistic: remove from source, add to target
    set((state) => {
      const newLists = state.lists.map((l) => {
        if (l.id === fromListId) {
          return { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) };
        }
        if (l.id === toListId) {
          const filteredTasks = l.tasks.filter((t) => t.id !== taskId);
          const updatedTask = { ...movedTask!, listId: toListId, position };
          filteredTasks.splice(position, 0, updatedTask);
          return { ...l, tasks: filteredTasks.map((t, i) => ({ ...t, position: i })) };
        }
        return l;
      });
      return { lists: newLists };
    });

    try {
      await taskApi.moveTask(taskId, { toListId, position });
    } catch {
      // Rollback on error
      set({ lists: currentLists });
    }
  },

  // ==================== Real-time Handlers ====================
  handleTaskCreated: (task) => {
    set((state) => {
      const listExists = state.lists.some((l) => l.id === task.listId);
      if (!listExists) return state;

      const taskExists = state.lists.some((l) =>
        l.tasks.some((t) => t.id === task.id)
      );
      if (taskExists) return state;

      return {
        lists: state.lists.map((l) =>
          l.id === task.listId ? { ...l, tasks: [...l.tasks, task] } : l
        ),
      };
    });
  },

  handleTaskUpdated: (task) => {
    set((state) => ({
      lists: state.lists.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
      })),
    }));
  },

  handleTaskDeleted: ({ taskId, listId }) => {
    set((state) => ({
      lists: state.lists.map((l) => ({
        ...l,
        tasks: l.tasks.filter((t) => t.id !== taskId),
      })),
    }));
  },

  handleTaskMoved: ({ task, fromListId, toListId }) => {
    set((state) => {
      const newLists = state.lists.map((l) => {
        if (l.id === fromListId) {
          return { ...l, tasks: l.tasks.filter((t) => t.id !== task.id) };
        }
        if (l.id === toListId) {
          const exists = l.tasks.some((t) => t.id === task.id);
          if (exists) {
            return { ...l, tasks: l.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)) };
          }
          const newTasks = [...l.tasks, task].sort((a, b) => a.position - b.position);
          return { ...l, tasks: newTasks };
        }
        return l;
      });
      return { lists: newLists };
    });
  },

  handleListCreated: (list) => {
    set((state) => {
      const exists = state.lists.some((l) => l.id === list.id);
      if (exists) return state;
      return { lists: [...state.lists, { ...list, tasks: list.tasks || [] }] };
    });
  },

  handleListUpdated: (list) => {
    set((state) => ({
      lists: state.lists.map((l) => (l.id === list.id ? { ...l, ...list } : l)),
    }));
  },

  handleListDeleted: ({ listId }) => {
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== listId),
    }));
  },
}));
