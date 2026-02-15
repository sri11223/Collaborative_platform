import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';
import { invitationApi } from '../api/invitation.api';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/common/Avatar';
import {
  Inbox, Bell, Clock, Check, CheckCheck, Mail, MessageSquare,
  UserPlus, AlertCircle, Trash2, X, Search,
} from 'lucide-react';
import type { Invitation } from '../types';
import type { Notification } from '../api/notification.api';
import toast from 'react-hot-toast';

type Tab = 'all' | 'unread' | 'invitations' | 'cleared';

const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    initSocketListeners,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  useEffect(() => {
    fetchNotifications();
    loadInvitations();
    const cleanup = initSocketListeners();
    return cleanup;
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

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.boardId) {
      if (notif.taskId) {
        navigate(`/board/${notif.boardId}`);
      } else {
        navigate(`/board/${notif.boardId}`);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'comment_added': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'invitation_received': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'task_due': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'board_update': return <Bell className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'all', label: 'All', icon: Inbox, count: notifications.length },
    { id: 'unread', label: 'Unread', icon: Bell, count: unreadCount },
    { id: 'invitations', label: 'Invitations', icon: Mail, count: invitations.length },
    { id: 'cleared', label: 'Cleared', icon: Check },
  ];

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter((n) => !n.read)
    : activeTab === 'cleared'
      ? notifications.filter((n) => n.read)
      : notifications;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => clearAll()}
              className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1">
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
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {/* Invitations tab */}
          {activeTab === 'invitations' && (
            <div className="space-y-2">
              {invitations.length > 0 ? (
                invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl px-5 py-4 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
                <EmptyState icon={Mail} message="No pending invitations" />
              )}
            </div>
          )}

          {/* Notifications tabs */}
          {activeTab !== 'invitations' && (
            <div className="space-y-1">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors group ${
                      notif.read
                        ? 'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                        : 'bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20 border-l-2 border-primary-500'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notif.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                          className="p-1 text-gray-400 hover:text-primary-500 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Delete"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Inbox}
                  message={activeTab === 'unread' ? 'No unread notifications' : activeTab === 'cleared' ? 'No read notifications' : 'No notifications yet'}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ icon: React.FC<{ className?: string }>; message: string }> = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{message}</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
      Notifications and updates will appear here
    </p>
  </div>
);

export default InboxPage;
