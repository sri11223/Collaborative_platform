import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import { invitationApi } from '../api/invitation.api';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import {
  Inbox, MessageSquare, AtSign, CheckSquare, Star,
  ChevronRight, Mail, Check, X, Clock, Sparkles,
  ArrowRight, Bell, Search,
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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('primary');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const { data } = await invitationApi.getUserInvitations();
      setInvitations(data.data.filter((inv: Invitation) => inv.status === 'pending'));
    } catch {
      // silent
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await invitationApi.acceptInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      toast.success('Invitation accepted!');
    } catch {
      toast.error('Failed to accept');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await invitationApi.declineInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error('Failed to decline');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'primary', label: 'Primary', icon: Inbox },
    { id: 'other', label: 'Other', icon: Bell },
    { id: 'later', label: 'Later', icon: Clock },
    { id: 'cleared', label: 'Cleared', icon: Check },
  ];

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
              {greeting}, {user?.name?.split(' ')[0]}! 👋
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
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Inbox card */}
            <QuickCard
              icon={Inbox}
              title="Inbox"
              count={invitations.length}
              color="bg-blue-500"
              description="Pending notifications and invitations"
              onClick={() => setActiveTab('primary')}
            />
            {/* My Tasks card */}
            <QuickCard
              icon={CheckSquare}
              title="My Tasks"
              count={0}
              color="bg-green-500"
              description="Tasks assigned to you"
              onClick={() => navigate('/dashboard')}
            />
            {/* Recent Boards card */}
            <QuickCard
              icon={Star}
              title="Recent Boards"
              count={boards.length}
              color="bg-purple-500"
              description="Jump back into your boards"
              onClick={() => navigate('/dashboard')}
            />
          </div>
        </div>

        {/* Inbox section */}
        <div className="px-8 pb-10">
          <div className="max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-4 border-b border-gray-200 dark:border-gray-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {activeTab === 'primary' && (
              <div className="space-y-2">
                {invitations.length > 0 ? (
                  invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl px-5 py-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Board Invitation: <span className="text-primary-600 dark:text-primary-400">{inv.board?.title || 'Board'}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {inv.inviter?.name || 'Someone'} invited you as {inv.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAccept(inv.id)}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(inv.id)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyInbox />
                )}
              </div>
            )}

            {activeTab === 'other' && <EmptyInbox message="No other notifications" />}
            {activeTab === 'later' && <EmptyInbox message="Nothing saved for later" />}
            {activeTab === 'cleared' && <EmptyInbox message="All cleared!" />}

            {/* Recent boards list */}
            {boards.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Recently Accessed
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

// ─── Empty Inbox ─────────────────────────────────────────────

const EmptyInbox: React.FC<{ message?: string }> = ({ message = 'You\'re all caught up!' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <Inbox className="w-7 h-7 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{message}</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
      Notifications and updates will appear here
    </p>
  </div>
);

export default HomePage;
