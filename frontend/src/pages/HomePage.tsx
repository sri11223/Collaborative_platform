import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import { useNotificationStore } from '../store/notificationStore';
import { myTasksApi } from '../api/notification.api';
import { invitationApi } from '../api/invitation.api';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import {
  Inbox, CheckSquare, Star, Clock, Sparkles,
  ArrowRight, Search, CalendarDays, AlertTriangle,
} from 'lucide-react';
import type { Invitation } from '../types';
import toast from 'react-hot-toast';

type Tab = 'primary' | 'other' | 'later' | 'cleared';

const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
];

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { boards } = useBoardStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const [myTaskCount, setMyTaskCount] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [dueTodayTasks, setDueTodayTasks] = useState(0);

  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchUnreadCount();
    loadMyTaskStats();
  }, []);

  const loadMyTaskStats = async () => {
    try {
      const { data } = await myTasksApi.getMyTasks();
      const tasks = data.data || [];
      setMyTaskCount(tasks.length);
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      setOverdueTasks(tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < now && t.dueDate.split('T')[0] !== todayStr).length);
      setDueTodayTasks(tasks.filter((t: any) => t.dueDate && t.dueDate.split('T')[0] === todayStr).length);
    } catch {
      // silent
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top search bar */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero section */}
        <div className="px-8 pt-10 pb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {greeting}, {user?.name?.split(' ')[0]}!
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mt-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-sm italic">
                "{quote.text}" — <span className="font-medium">{quote.author}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick access cards */}
        <div className="px-8 pb-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Inbox card */}
            <QuickCard
              icon={Inbox}
              title="Inbox"
              count={unreadCount}
              color="bg-blue-500"
              description="Unread notifications"
              onClick={() => navigate('/inbox')}
            />
            {/* My Tasks card */}
            <QuickCard
              icon={CheckSquare}
              title="My Tasks"
              count={myTaskCount}
              color="bg-green-500"
              description="Tasks assigned to you"
              onClick={() => navigate('/my-tasks')}
            />
            {/* Planner card */}
            <QuickCard
              icon={CalendarDays}
              title="Planner"
              count={dueTodayTasks}
              color="bg-amber-500"
              description={dueTodayTasks > 0 ? `${dueTodayTasks} due today` : 'Calendar view'}
              onClick={() => navigate('/planner')}
            />
            {/* Recent Boards card */}
            <QuickCard
              icon={Star}
              title="Boards"
              count={boards.length}
              color="bg-purple-500"
              description="In this workspace"
              onClick={() => navigate('/dashboard')}
            />
          </div>
        </div>

        {/* Overdue alert */}
        {overdueTasks > 0 && (
          <div className="px-8 pb-4">
            <div className="max-w-5xl mx-auto">
              <button
                onClick={() => navigate('/my-tasks')}
                className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl px-5 py-3 text-left hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    You have {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-500/70">Click to view your tasks</p>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        )}

        {/* Recent boards list */}
        <div className="px-8 pb-10">
          <div className="max-w-5xl mx-auto">
            {boards.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Recent Boards
                </h3>
                <div className="space-y-1">
                  {boards.slice(0, 5).map((board) => (
                    <button
                      key={board.id}
                      onClick={() => navigate(`/board/${board.id}`)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: board.color }}
                      >
                        {board.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{board.title}</p>
                        <p className="text-xs text-gray-400 truncate">{board.description || 'No description'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {boards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Star className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No boards in this workspace</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Create a board from the dashboard to get started
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Card ──────────────────────────────────────────────

const QuickCard: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  count: number;
  color: string;
  description: string;
  onClick: () => void;
}> = ({ icon: Icon, title, count, color, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all text-left group"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {count > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-xs text-gray-400">{description}</p>
  </button>
);

export default HomePage;
