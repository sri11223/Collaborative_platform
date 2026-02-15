import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { myTasksApi } from '../api/notification.api';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/common/Avatar';
import { Spinner } from '../components/common/Spinner';
import {
  CheckSquare, Circle, Clock, AlertTriangle, ArrowUp, ArrowDown, Minus,
  AlertCircle, ChevronDown, ChevronRight, Filter, LayoutList, CalendarDays,
} from 'lucide-react';
import type { Task } from '../types';

type GroupBy = 'status' | 'priority' | 'board';
type SortBy = 'dueDate' | 'priority' | 'title' | 'createdAt';

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  urgent: { label: 'Urgent', color: 'text-red-500', icon: AlertCircle },
  high: { label: 'High', color: 'text-orange-500', icon: ArrowUp },
  medium: { label: 'Medium', color: 'text-yellow-500', icon: Minus },
  low: { label: 'Low', color: 'text-blue-500', icon: ArrowDown },
};

const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data } = await myTasksApi.getMyTasks();
      setTasks(data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const groupTasks = (tasks: any[]): Record<string, any[]> => {
    const groups: Record<string, any[]> = {};
    for (const task of tasks) {
      let key = '';
      if (groupBy === 'status') {
        key = task.list?.title || 'Unknown';
      } else if (groupBy === 'priority') {
        key = task.priority || 'medium';
      } else if (groupBy === 'board') {
        key = task.list?.board?.title || 'Unknown Board';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    }
    return groups;
  };

  const sortTasks = (tasks: any[]): any[] => {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (order[a.priority as keyof typeof order] ?? 2) - (order[b.priority as keyof typeof order] ?? 2);
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: `${Math.abs(days)}d overdue`, className: 'text-red-500 bg-red-50 dark:bg-red-900/20' };
    if (days === 0) return { text: 'Today', className: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' };
    if (days === 1) return { text: 'Tomorrow', className: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' };
    if (days <= 7) return { text: `${days}d left`, className: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' };
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), className: 'text-gray-500 bg-gray-50 dark:bg-gray-800' };
  };

  const sorted = sortTasks(tasks);
  const grouped = groupTasks(sorted);
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());
  const dueTodayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Group by dropdown */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value="status">Group: Status</option>
              <option value="priority">Group: Priority</option>
              <option value="board">Group: Board</option>
            </select>
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: Name</option>
              <option value="createdAt">Sort: Created</option>
            </select>
          </div>
        </div>

        {/* Stats bar */}
        {tasks.length > 0 && (
          <div className="flex items-center gap-4 mt-3">
            {overdueTasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overdueTasks.length} overdue
              </div>
            )}
            {dueTodayTasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-500">
                <Clock className="w-3.5 h-3.5" />
                {dueTodayTasks.length} due today
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <CheckSquare className="w-3.5 h-3.5" />
              {tasks.length} total
            </div>
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <CheckSquare className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No tasks assigned to you</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Tasks assigned to you across all boards will appear here
            </p>
          </div>
        ) : (
          <div className="px-6 py-3 space-y-4">
            {Object.entries(grouped).map(([groupName, groupTasks]) => {
              const isCollapsed = collapsedGroups.has(groupName);
              const priorityConfig = groupBy === 'priority' ? PRIORITY_CONFIG[groupName] : null;

              return (
                <div key={groupName}>
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className="flex items-center gap-2 mb-2 group w-full text-left"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {priorityConfig ? priorityConfig.label : groupName}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                      {groupTasks.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-1 ml-6">
                      {groupTasks.map((task: any) => {
                        const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                        const PIcon = pConfig.icon;
                        const dueInfo = formatDueDate(task.dueDate);

                        return (
                          <div
                            key={task.id}
                            onClick={() => navigate(`/board/${task.list?.boardId || task.list?.board?.id}`)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                          >
                            <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white truncate">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {task.list?.board && (
                                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <span
                                      className="w-2 h-2 rounded-sm inline-block"
                                      style={{ backgroundColor: task.list.board.color || '#6366f1' }}
                                    />
                                    {task.list.board.title}
                                  </span>
                                )}
                                <span className="text-[11px] text-gray-400">
                                  {task.list?.title}
                                </span>
                              </div>
                            </div>

                            {/* Priority */}
                            <div className={`flex items-center gap-1 ${pConfig.color}`} title={pConfig.label}>
                              <PIcon className="w-3.5 h-3.5" />
                            </div>

                            {/* Due date */}
                            {dueInfo && (
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${dueInfo.className}`}>
                                {dueInfo.text}
                              </span>
                            )}

                            {/* Assignees */}
                            {task.assignees?.length > 0 && (
                              <div className="flex -space-x-1">
                                {task.assignees.slice(0, 3).map((a: any) => (
                                  <Avatar key={a.id} name={a.user?.name || 'U'} size="xs" avatar={a.user?.avatar} />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasksPage;
