import { create } from 'zustand';
import { notificationApi, type Notification } from '../api/notification.api';
import { getSocket } from '../lib/socket';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  initSocketListeners: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (page = 1) => {
    set({ loading: true });
    try {
      const { data } = await notificationApi.getNotifications({ page, limit: 30 });
      set({
        notifications: data.data.notifications || [],
        unreadCount: data.data.unreadCount || 0,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      set({ unreadCount: data.data.count || 0 });
    } catch {
      // silent
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {
      // silent
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      set((state) => {
        const notif = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notif && !notif.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch {
      // silent
    }
  },

  clearAll: async () => {
    try {
      await notificationApi.clearAll();
      set({ notifications: [], unreadCount: 0 });
    } catch {
      // silent
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  initSocketListeners: () => {
    const socket = getSocket();
    const handler = (notification: Notification) => {
      get().addNotification(notification);
    };
    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  },
}));
