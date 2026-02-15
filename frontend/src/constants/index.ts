export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const PRIORITIES = {
  low: { label: 'Low', color: '#22c55e', bg: '#f0fdf4' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  high: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  urgent: { label: 'Urgent', color: '#ef4444', bg: '#fef2f2' },
} as const;

export const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#2563eb', '#7c3aed', '#6d28d9',
];

export const LABEL_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
];

export const TOKEN_KEY = 'taskflow_token';
export const USER_KEY = 'taskflow_user';
