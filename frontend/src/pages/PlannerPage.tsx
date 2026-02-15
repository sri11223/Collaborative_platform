import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { myTasksApi } from '../api/notification.api';
import { taskApi } from '../api/task.api';
import { useBoardStore } from '../store/boardStore';
import { Spinner } from '../components/common/Spinner';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus,
  AlertCircle, Clock, X, Check,
  LayoutList, Calendar, ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

const PRIORITY_TEXT: Record<string, string> = {
  urgent: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-blue-600 dark:text-blue-400',
};

const PRIORITY_BG: Record<string, string> = {
  urgent: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  high: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  low: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
};

type ViewMode = 'month' | 'agenda';

interface PlanForm {
  title: string;
  priority: string;
  listId: string;
  date: string;
}

const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { boards } = useBoardStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<ViewMode>('month');

  // Add plan state
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [planForm, setPlanForm] = useState<PlanForm>({ title: '', priority: 'medium', listId: '', date: '' });
  const [addingPlan, setAddingPlan] = useState(false);

  // Quick add on cell
  const [quickAddCell, setQuickAddCell] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get all lists from boards for the "Add Plan" form
  const allLists = useMemo(() => {
    const lists: { id: string; title: string; boardTitle: string; boardColor: string }[] = [];
    for (const board of boards) {
      if (board.lists) {
        for (const list of board.lists) {
          lists.push({ id: list.id, title: list.title, boardTitle: board.title, boardColor: board.color });
        }
      }
    }
    return lists;
  }, [boards]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const task of tasks) {
      if (task.dueDate) {
        const key = new Date(task.dueDate).toDateString();
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    }
    return map;
  }, [tasks]);

  const today = new Date();
  const todayStr = today.toDateString();
  const selectedDateStr = selectedDate?.toDateString();
  const selectedTasks = selectedDate ? (tasksByDate[selectedDateStr!] || []) : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && new Date(t.dueDate).toDateString() !== todayStr);
  }, [tasks, todayStr]);

  const dueTodayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === todayStr);
  }, [tasks, todayStr]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate && new Date(t.dueDate) > today)
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 15);
  }, [tasks]);

  // Add plan handlers
  const openAddPlan = (date?: Date) => {
    const d = date || selectedDate || new Date();
    setPlanForm({
      title: '',
      priority: 'medium',
      listId: allLists[0]?.id || '',
      date: d.toISOString().split('T')[0],
    });
    setShowAddPlan(true);
  };

  const handleAddPlan = async () => {
    if (!planForm.title.trim() || !planForm.listId) {
      toast.error('Title and list are required');
      return;
    }
    setAddingPlan(true);
    try {
      await taskApi.createTask(planForm.listId, {
        title: planForm.title.trim(),
        priority: planForm.priority,
        dueDate: new Date(planForm.date).toISOString(),
      });
      toast.success('Plan added!');
      setShowAddPlan(false);
      loadTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add plan');
    } finally {
      setAddingPlan(false);
    }
  };

  const handleQuickAdd = async (dateStr: string) => {
    if (!quickAddTitle.trim() || !allLists[0]) return;
    try {
      const date = new Date(dateStr);
      await taskApi.createTask(allLists[0].id, {
        title: quickAddTitle.trim(),
        dueDate: date.toISOString(),
      });
      toast.success('Task added!');
      setQuickAddCell(null);
      setQuickAddTitle('');
      loadTasks();
    } catch {
      toast.error('Failed to add task');
    }
  };

  const formatRelativeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 7) return `In ${diff} days`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary-500" />
            Planner
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {tasks.length} tasks
            {overdueTasks.length > 0 && (
              <> &middot; <span className="text-red-500 font-medium">{overdueTasks.length} overdue</span></>
            )}
            {dueTodayTasks.length > 0 && (
              <> &middot; <span className="text-amber-500 font-medium">{dueTodayTasks.length} due today</span></>
            )}
            {dueTodayTasks.length === 0 && overdueTasks.length === 0 && tasks.length > 0 && ' · All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setView('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === 'month'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setView('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === 'agenda'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              Agenda
            </button>
          </div>
          <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Today
          </button>
          <button
            onClick={() => openAddPlan()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Plan
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-2 border-b border-gray-100 dark:border-gray-800/50 flex items-center gap-4">
        <StatBadge label="Total" count={tasks.length} color="bg-gray-500" />
        <StatBadge label="Due Today" count={dueTodayTasks.length} color="bg-amber-500" />
        <StatBadge label="Overdue" count={overdueTasks.length} color="bg-red-500" />
        <StatBadge label="Upcoming" count={upcomingTasks.length} color="bg-green-500" />
        <StatBadge label="No Date" count={tasks.filter((t) => !t.dueDate).length} color="bg-gray-400" />
      </div>

      {/* Calendar View */}
      {view === 'month' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Calendar */}
          <div className="flex-1 flex flex-col overflow-auto px-6 py-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
              {calendarDays.map((day, i) => {
                const dateStr = day.date.toDateString();
                const isoStr = day.date.toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDateStr;
                const dayTasks = tasksByDate[dateStr] || [];
                const hasOverdue = dayTasks.some((t: any) => new Date(t.dueDate) < today && dateStr !== todayStr);
                const isQuickAdding = quickAddCell === dateStr;

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(day.date)}
                    className={`min-h-[90px] p-1.5 text-left transition-colors cursor-pointer relative group ${
                      day.isCurrentMonth
                        ? 'bg-white dark:bg-gray-900'
                        : 'bg-gray-50 dark:bg-gray-900/50'
                    } ${isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''} ${
                      isToday ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                    } hover:bg-gray-50 dark:hover:bg-gray-800`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        isToday
                          ? 'bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center'
                          : day.isCurrentMonth
                            ? 'text-gray-900 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {day.date.getDate()}
                      </span>
                      <div className="flex items-center gap-1">
                        {dayTasks.length > 0 && (
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                            hasOverdue
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : isToday
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                          }`}>
                            {dayTasks.length}
                          </span>
                        )}
                        {/* Quick add button */}
                        {day.isCurrentMonth && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (allLists.length > 0) {
                                setQuickAddCell(dateStr);
                                setQuickAddTitle('');
                              } else {
                                openAddPlan(day.date);
                              }
                            }}
                            className="w-4 h-4 rounded flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick add input */}
                    {isQuickAdding && (
                      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={quickAddTitle}
                          onChange={(e) => setQuickAddTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleQuickAdd(isoStr);
                            if (e.key === 'Escape') { setQuickAddCell(null); setQuickAddTitle(''); }
                          }}
                          onBlur={() => { if (!quickAddTitle.trim()) { setQuickAddCell(null); } }}
                          placeholder="Add task..."
                          className="w-full text-[10px] px-1.5 py-1 bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-700 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    )}

                    {/* Task previews */}
                    {!isQuickAdding && (
                      <div className="mt-1 space-y-0.5">
                        {dayTasks.slice(0, 3).map((task: any) => (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/board/${task.list?.boardId || task.list?.board?.id}`);
                            }}
                            className={`text-[10px] truncate rounded px-1.5 py-0.5 border-l-2 cursor-pointer hover:opacity-80 transition-opacity ${
                              task.priority === 'urgent' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300' :
                              task.priority === 'high' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300' :
                              task.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-300' :
                              'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300'
                            }`}
                            title={`${task.title} (${task.priority})`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-[10px] text-gray-400 px-1 font-medium">+{dayTasks.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Urgent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Low</span>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-800 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              {/* Overdue section */}
              {overdueTasks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Overdue ({overdueTasks.length})
                  </h3>
                  <div className="space-y-1">
                    {overdueTasks.slice(0, 5).map((task) => (
                      <TaskItem key={task.id} task={task} navigate={navigate} showDate isOverdue />
                    ))}
                    {overdueTasks.length > 5 && (
                      <p className="text-xs text-red-400 px-3 py-1">+{overdueTasks.length - 5} more overdue</p>
                    )}
                  </div>
                </div>
              )}

              {/* Due today */}
              {dueTodayTasks.length > 0 && !selectedDate && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Due Today ({dueTodayTasks.length})
                  </h3>
                  <div className="space-y-1">
                    {dueTodayTasks.map((task) => (
                      <TaskItem key={task.id} task={task} navigate={navigate} />
                    ))}
                  </div>
                </div>
              )}

              {/* Selected date tasks */}
              {selectedDate ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => openAddPlan(selectedDate)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors"
                      title="Add plan for this date"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedTasks.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedTasks.map((task: any) => (
                        <TaskItem key={task.id} task={task} navigate={navigate} detailed />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">No tasks on this date</p>
                      <button
                        onClick={() => openAddPlan(selectedDate)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Plan
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary-500" />
                    Upcoming
                  </h3>
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-1">
                      {upcomingTasks.map((task) => (
                        <TaskItem key={task.id} task={task} navigate={navigate} showDate />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                      No upcoming tasks
                    </p>
                  )}
                </div>
              )}

              {/* Tasks without dates */}
              {tasks.filter((t) => !t.dueDate).length > 0 && !selectedDate && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    No Due Date ({tasks.filter((t) => !t.dueDate).length})
                  </h3>
                  <div className="space-y-1">
                    {tasks.filter((t) => !t.dueDate).slice(0, 5).map((task) => (
                      <TaskItem key={task.id} task={task} navigate={navigate} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Agenda View */}
      {view === 'agenda' && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Overdue */}
            {overdueTasks.length > 0 && (
              <AgendaSection
                title="Overdue"
                titleColor="text-red-500"
                icon={<AlertCircle className="w-4 h-4" />}
                tasks={overdueTasks}
                navigate={navigate}
                formatDate={formatRelativeDate}
              />
            )}

            {/* Due Today */}
            {dueTodayTasks.length > 0 && (
              <AgendaSection
                title="Today"
                titleColor="text-amber-600 dark:text-amber-400"
                icon={<Clock className="w-4 h-4" />}
                tasks={dueTodayTasks}
                navigate={navigate}
                formatDate={formatRelativeDate}
                onAddPlan={() => openAddPlan(new Date())}
              />
            )}

            {/* Upcoming by date groups */}
            {(() => {
              const futureGrouped: Record<string, any[]> = {};
              tasks
                .filter((t) => t.dueDate && new Date(t.dueDate) > today)
                .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .forEach((t) => {
                  const dateKey = new Date(t.dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                  if (!futureGrouped[dateKey]) futureGrouped[dateKey] = [];
                  futureGrouped[dateKey].push(t);
                });

              return Object.entries(futureGrouped).map(([dateLabel, dateTasks]) => (
                <AgendaSection
                  key={dateLabel}
                  title={dateLabel}
                  titleColor="text-gray-900 dark:text-white"
                  tasks={dateTasks}
                  navigate={navigate}
                  formatDate={formatRelativeDate}
                  onAddPlan={() => openAddPlan(new Date(dateTasks[0].dueDate))}
                />
              ));
            })()}

            {/* No date */}
            {tasks.filter((t) => !t.dueDate).length > 0 && (
              <AgendaSection
                title="No Due Date"
                titleColor="text-gray-500"
                tasks={tasks.filter((t) => !t.dueDate)}
                navigate={navigate}
                formatDate={formatRelativeDate}
              />
            )}

            {tasks.length === 0 && (
              <div className="text-center py-20">
                <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add plans to start organizing your work</p>
                <button
                  onClick={() => openAddPlan()}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Plan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {showAddPlan && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowAddPlan(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-500" />
                Add Plan
              </h3>
              <button onClick={() => setShowAddPlan(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
                <input
                  autoFocus
                  value={planForm.title}
                  onChange={(e) => setPlanForm((p) => ({ ...p, title: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlan()}
                  placeholder="What do you want to plan?"
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={planForm.date}
                  onChange={(e) => setPlanForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlanForm((f) => ({ ...f, priority: p }))}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${
                        planForm.priority === p
                          ? `${PRIORITY_BG[p]} ring-2 ring-offset-1 ${
                              p === 'urgent' ? 'ring-red-500' : p === 'high' ? 'ring-orange-500' : p === 'medium' ? 'ring-yellow-500' : 'ring-blue-500'
                            } ${PRIORITY_TEXT[p]}`
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* List/Board selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add to List</label>
                {allLists.length > 0 ? (
                  <select
                    value={planForm.listId}
                    onChange={(e) => setPlanForm((p) => ({ ...p, listId: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {allLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.boardTitle} → {list.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
                    No boards available. Create a board first to add plans.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => setShowAddPlan(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlan}
                disabled={addingPlan || !planForm.title.trim() || !planForm.listId}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingPlan ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
                Add Plan
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Stat Badge ──────────────────────────────────────────────

const StatBadge: React.FC<{ label: string; count: number; color: string }> = ({ label, count, color }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}:</span>
    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{count}</span>
  </div>
);

// ─── Task Item ───────────────────────────────────────────────

const TaskItem: React.FC<{
  task: any;
  navigate: any;
  showDate?: boolean;
  isOverdue?: boolean;
  detailed?: boolean;
}> = ({ task, navigate, showDate, isOverdue, detailed }) => {
  const pColor = PRIORITY_COLORS[task.priority] || 'bg-gray-300';
  const boardId = task.list?.boardId || task.list?.board?.id;

  return (
    <button
      onClick={() => boardId && navigate(`/board/${boardId}`)}
      className={`flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left transition-colors ${
        isOverdue ? 'bg-red-50/50 dark:bg-red-900/5' : ''
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${pColor} flex-shrink-0 mt-1.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isOverdue ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.list?.board && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <span className="w-2 h-2 rounded" style={{ backgroundColor: task.list.board.color }} />
              {task.list.board.title}
            </span>
          )}
          {task.list?.title && (
            <span className="text-[10px] text-gray-400">&middot; {task.list.title}</span>
          )}
          {showDate && task.dueDate && (
            <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {detailed && task.priority && (
            <span className={`text-[10px] font-medium capitalize ${PRIORITY_TEXT[task.priority] || 'text-gray-400'}`}>
              {task.priority}
            </span>
          )}
        </div>
        {detailed && task.assignees?.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {task.assignees.slice(0, 3).map((a: any) => (
              <span key={a.user?.id || a.id} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
                {a.user?.name?.split(' ')[0]}
              </span>
            ))}
          </div>
        )}
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
    </button>
  );
};

// ─── Agenda Section ──────────────────────────────────────────

const AgendaSection: React.FC<{
  title: string;
  titleColor: string;
  icon?: React.ReactNode;
  tasks: any[];
  navigate: any;
  formatDate: (d: string) => string;
  onAddPlan?: () => void;
}> = ({ title, titleColor, icon, tasks, navigate, formatDate, onAddPlan }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h3 className={`text-sm font-semibold ${titleColor} flex items-center gap-1.5`}>
        {icon}
        {title}
        <span className="text-xs font-normal text-gray-400 ml-1">({tasks.length})</span>
      </h3>
      {onAddPlan && (
        <button
          onClick={onAddPlan}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="space-y-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800/50 overflow-hidden">
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => navigate(`/board/${task.list?.boardId || task.list?.board?.id}`)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_COLORS[task.priority] || 'bg-gray-300'} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white truncate">{task.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {task.list?.board && (
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded" style={{ backgroundColor: task.list.board.color }} />
                  {task.list.board.title} &middot; {task.list.title}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`text-[10px] font-medium capitalize ${PRIORITY_TEXT[task.priority] || 'text-gray-400'}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(task.dueDate)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PlannerPage;
