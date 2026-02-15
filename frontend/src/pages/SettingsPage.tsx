import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useThemeStore } from '../store/themeStore';
import { workspaceApi } from '../api/workspace.api';
import { Avatar } from '../components/common/Avatar';
import { Spinner } from '../components/common/Spinner';
import {
  Settings, User, Palette, Bell, Shield, Globe, Moon, Sun,
  Save, Trash2, Edit3, Plus, UserMinus, Crown, LogOut, Monitor,
  ChevronRight, Mail, Lock, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'workspace' | 'appearance' | 'notifications';

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { currentWorkspace, workspaces, updateWorkspace, deleteWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { theme, toggleTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Workspace form state
  const [wsName, setWsName] = useState('');
  const [wsColor, setWsColor] = useState('');
  const [wsSaving, setWsSaving] = useState(false);
  const [showDeleteWorkspace, setShowDeleteWorkspace] = useState(false);
  const [wsMembers, setWsMembers] = useState<any[]>([]);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    taskAssigned: true,
    commentAdded: true,
    boardUpdates: true,
    invitations: true,
    dueReminders: true,
  });

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (currentWorkspace) {
      setWsName(currentWorkspace.name);
      setWsColor(currentWorkspace.color);
      setWsMembers(currentWorkspace.members || []);
    }
  }, [currentWorkspace]);

  const handleProfileSave = async () => {
    if (!profileName.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: profileName.trim() });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleWorkspaceSave = async () => {
    if (!currentWorkspace || !wsName.trim()) return;
    setWsSaving(true);
    try {
      await updateWorkspace(currentWorkspace.id, { name: wsName.trim(), color: wsColor });
      toast.success('Workspace updated!');
    } catch {
      toast.error('Failed to update workspace');
    } finally {
      setWsSaving(false);
    }
  };

  const handleDeleteWorkspaceConfirm = async () => {
    if (!currentWorkspace) return;
    try {
      await deleteWorkspace(currentWorkspace.id);
      toast.success('Workspace deleted');
      setShowDeleteWorkspace(false);
    } catch {
      toast.error('Failed to delete workspace');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentWorkspace) return;
    try {
      await workspaceApi.removeMember(currentWorkspace.id, userId);
      setWsMembers((prev) => prev.filter((m: any) => m.userId !== userId));
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const TABS = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'workspace' as SettingsTab, label: 'Workspace', icon: Globe },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
  ];

  const WORKSPACE_COLORS = [
    '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6',
    '#84cc16', '#a855f7',
  ];

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-950">
      {/* Settings Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-500" />
            Settings
          </h1>
        </div>
        <nav className="flex-1 p-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Profile Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar name={user?.name || ''} size="lg" avatar={user?.avatar} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleProfileSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE TAB */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Workspace Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage "{currentWorkspace?.name || 'Workspace'}" settings
                </p>
              </div>

              {currentWorkspace ? (
                <>
                  {/* Workspace Info */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      General
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Workspace Name
                      </label>
                      <input
                        type="text"
                        value={wsName}
                        onChange={(e) => setWsName(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {WORKSPACE_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setWsColor(color)}
                            className={`w-8 h-8 rounded-lg transition-all ${
                              wsColor === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleWorkspaceSave}
                        disabled={wsSaving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {wsSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Members ({wsMembers.length})
                      </h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {wsMembers.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-3 py-3">
                          <Avatar name={member.user?.name || ''} size="sm" avatar={member.user?.avatar} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {member.user?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {member.user?.email}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            member.role === 'owner'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              : member.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {member.role === 'owner' && <Crown className="w-3 h-3 inline mr-1" />}
                            {member.role}
                          </span>
                          {currentWorkspace.ownerId === user?.id && member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                              title="Remove member"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  {currentWorkspace.ownerId === user?.id && (
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        Deleting this workspace will remove all its boards, tasks, and data permanently.
                      </p>
                      {showDeleteWorkspace ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleDeleteWorkspaceConfirm}
                            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Yes, Delete Workspace
                          </button>
                          <button
                            onClick={() => setShowDeleteWorkspace(false)}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteWorkspace(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Workspace
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Globe className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No workspace selected</p>
                </div>
              )}
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Appearance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize how TaskFlow looks</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Theme
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light', icon: Sun, selected: theme === 'light' },
                    { id: 'dark', label: 'Dark', icon: Moon, selected: theme === 'dark' },
                    { id: 'system', label: 'System', icon: Monitor, selected: false },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if ((opt.id === 'light' && theme === 'dark') || (opt.id === 'dark' && theme === 'light')) {
                            toggleTheme();
                          }
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          opt.selected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${opt.selected ? 'text-primary-500' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${opt.selected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose what notifications you receive</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                {[
                  { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a task is assigned to you' },
                  { key: 'commentAdded', label: 'New Comments', desc: 'When someone comments on your tasks' },
                  { key: 'boardUpdates', label: 'Board Updates', desc: 'When changes are made to your boards' },
                  { key: 'invitations', label: 'Invitations', desc: 'When you receive a board or workspace invite' },
                  { key: 'dueReminders', label: 'Due Date Reminders', desc: 'Reminders for upcoming due dates' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifPrefs[item.key as keyof typeof notifPrefs]
                          ? 'bg-primary-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notifPrefs[item.key as keyof typeof notifPrefs] ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
