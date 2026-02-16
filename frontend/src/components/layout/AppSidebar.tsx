import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNotificationStore } from '../../store/notificationStore';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { InviteToWorkspaceModal } from '../board/InviteToWorkspaceModal';
import { Avatar } from '../common/Avatar';
import { favoriteApi } from '../../api/message.api';
import { boardApi } from '../../api/board.api';
import {
  Home, Inbox, CalendarDays, Sparkles, Users2, FileText,
  MoreHorizontal, ChevronRight, ChevronDown, Plus, Search,
  Settings, LogOut, Sun, Moon, LayoutDashboard, Bell,
  Star, MessageSquare, CheckSquare, Hash, PanelLeftClose, PanelLeft,
  UserPlus, StarOff, Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Icon Rail Items ─────────────────────────────────────────
const ICON_RAIL_ITEMS = [
  { id: 'home', icon: Home, label: 'Home', path: '/home' },
  { id: 'inbox', icon: Inbox, label: 'Inbox', path: '/inbox' },
  { id: 'planner', icon: CalendarDays, label: 'Planner', path: '/planner' },
  { id: 'ai', icon: Sparkles, label: 'AI', path: '/ai' },
  { id: 'teams', icon: Users2, label: 'Teams', path: '/teams' },
  { id: 'docs', icon: FileText, label: 'Docs', path: '/docs' },
];

// ─── Board Colors ────────────────────────────────────────────
const BOARD_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6',
];

export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { workspaces, currentWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { boards, fetchBoards } = useBoardStore();
  const { unreadCount, fetchUnreadCount, initSocketListeners } = useNotificationStore();

  const [collapsed, setCollapsed] = useState(false);
  const [spacesOpen, setSpacesOpen] = useState(true);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [dmOpen, setDmOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWorkspaceInvite, setShowWorkspaceInvite] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWorkspaces();
    fetchUnreadCount();
    const cleanup = initSocketListeners();
    return cleanup;
  }, [fetchWorkspaces, fetchUnreadCount, initSocketListeners]);

  // Re-fetch boards and favorites when workspace changes
  useEffect(() => {
    if (!currentWorkspace?.id) return; // wait until workspace is loaded
    fetchBoards({ page: 1, search: '', workspaceId: currentWorkspace.id });
    loadFavorites();
  }, [currentWorkspace?.id, fetchBoards]);

  const loadFavorites = async () => {
    try {
      const { data } = await favoriteApi.getFavorites();
      setFavorites(data.data || []);
      setFavoriteIds(new Set((data.data || []).map((f: any) => f.boardId)));
    } catch { /* silent */ }
  };

  const toggleFavorite = async (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (favoriteIds.has(boardId)) {
        await favoriteApi.removeFavorite(boardId);
        setFavorites((prev) => prev.filter((f) => f.boardId !== boardId));
        setFavoriteIds((prev) => { const n = new Set(prev); n.delete(boardId); return n; });
      } else {
        const { data } = await favoriteApi.addFavorite(boardId);
        setFavorites((prev) => [data.data, ...prev]);
        setFavoriteIds((prev) => new Set(prev).add(boardId));
      }
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startEditingBoard = (boardId: string, currentTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBoardId(boardId);
    setEditingBoardTitle(currentTitle);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const saveEditingBoard = async () => {
    if (!editingBoardId || !editingBoardTitle.trim()) {
      setEditingBoardId(null);
      return;
    }
    try {
      await boardApi.updateBoard(editingBoardId, { title: editingBoardTitle.trim() });
      fetchBoards({ page: 1, search: '', workspaceId: currentWorkspace?.id });
      toast.success('Board renamed');
    } catch {
      toast.error('Failed to rename board');
    }
    setEditingBoardId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEditingBoard();
    if (e.key === 'Escape') setEditingBoardId(null);
  };

  // Boards are already filtered by workspace from the API
  const displayBoards = boards;

  // Filter favorites to only show boards in the current workspace
  const currentBoardIds = new Set(boards.map((b) => b.id));
  const workspaceFavorites = favorites.filter((fav) => currentBoardIds.has(fav.boardId));

  const activeRailItem = ICON_RAIL_ITEMS.find((item) => location.pathname.startsWith(item.path));

  return (
    <div className="flex h-full">
      {/* ─── Icon Rail ─── */}
      <div className="w-[52px] flex-shrink-0 bg-gray-900 dark:bg-gray-950 flex flex-col items-center py-3 gap-1 border-r border-gray-800">
        {/* App logo */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center mb-3 hover:bg-primary-500 transition-colors"
          title="TaskFlow"
        >
          <LayoutDashboard className="w-5 h-5 text-white" />
        </button>

        {/* Rail items */}
        {ICON_RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group relative ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
              title={item.label}
            >
              <Icon className="w-[18px] h-[18px]" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.label}
              </div>
            </button>
          );
        })}

        {/* More button */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all mt-auto"
          title="More"
        >
          <MoreHorizontal className="w-[18px] h-[18px]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="mt-1"
            title={user?.name}
          >
            <Avatar name={user?.name || 'User'} size="sm" avatar={user?.avatar} />
          </button>
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-full ml-2 mb-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5 z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Expandable Sidebar Panel ─── */}
      {!collapsed && (
        <div className="w-[260px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          {/* Workspace Switcher */}
          <div className="px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 relative z-50">
            <WorkspaceSwitcher />
          </div>

          {/* Quick actions */}
          <div className="px-3 py-2 space-y-0.5">
            <SidebarNavItem to="/home" icon={Home} label="Home" />
            <SidebarNavItem to="/inbox" icon={Inbox} label="Inbox" badge={unreadCount} />
            <SidebarNavItem to="/my-tasks" icon={CheckSquare} label="My Tasks" />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 mx-3" />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
            {/* Favorites section */}
            <SidebarSection
              title="Favorites"
              icon={Star}
              open={favoritesOpen}
              onToggle={() => setFavoritesOpen(!favoritesOpen)}
            >
              {workspaceFavorites.length > 0 ? (
                workspaceFavorites.map((fav) => (
                  <NavLink
                    key={fav.boardId}
                    to={`/board/${fav.boardId}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors group ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                    <span className="truncate flex-1">{fav.board?.title || 'Board'}</span>
                    <button
                      onClick={(e) => toggleFavorite(fav.boardId, e)}
                      className="p-0.5 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove from favorites"
                    >
                      <StarOff className="w-3 h-3" />
                    </button>
                  </NavLink>
                ))
              ) : (
                <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-2 italic">
                  Star boards to add favorites
                </div>
              )}
            </SidebarSection>

            {/* Spaces/Boards section */}
            <SidebarSection
              title="Spaces"
              icon={Hash}
              open={spacesOpen}
              onToggle={() => setSpacesOpen(!spacesOpen)}
              action={
                <div className="flex items-center gap-0.5">
                  {currentWorkspace && (
                    <button
                      onClick={() => setShowWorkspaceInvite(true)}
                      className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                      title="Invite to workspace"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                    title="New board"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              }
            >
              {displayBoards.length > 0 ? (
                displayBoards.map((board, i) => (
                  editingBoardId === board.id ? (
                    <div key={board.id} className="flex items-center gap-2 px-2 py-1">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: board.color || BOARD_COLORS[i % BOARD_COLORS.length] }}
                      >
                        {editingBoardTitle.charAt(0).toUpperCase()}
                      </div>
                      <input
                        ref={editInputRef}
                        value={editingBoardTitle}
                        onChange={(e) => setEditingBoardTitle(e.target.value)}
                        onBlur={saveEditingBoard}
                        onKeyDown={handleEditKeyDown}
                        className="flex-1 text-sm bg-white dark:bg-gray-700 border border-indigo-400 rounded px-1.5 py-0.5 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                  <NavLink
                    key={board.id}
                    to={`/board/${board.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors group ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: board.color || BOARD_COLORS[i % BOARD_COLORS.length] }}
                    >
                      {board.title.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate flex-1">{board.title}</span>
                    <button
                      onClick={(e) => startEditingBoard(board.id, board.title, e)}
                      className="p-0.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-indigo-500 transition-all rounded"
                      title="Rename board"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => toggleFavorite(board.id, e)}
                      className={`p-0.5 transition-all rounded ${
                        favoriteIds.has(board.id)
                          ? 'text-amber-400'
                          : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400'
                      }`}
                      title={favoriteIds.has(board.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`w-3 h-3 ${favoriteIds.has(board.id) ? 'fill-amber-400' : ''}`} />
                    </button>
                  </NavLink>
                  )
                ))
              ) : (
                <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-2 italic">
                  No boards yet
                </div>
              )}
            </SidebarSection>

            {/* Direct Messages */}
            <SidebarSection
              title="Direct Messages"
              icon={MessageSquare}
              open={dmOpen}
              onToggle={() => setDmOpen(!dmOpen)}
            >
              {currentWorkspace?.members && currentWorkspace.members.filter(m => m.userId !== user?.id).length > 0 ? (
                <>
                  {currentWorkspace.members
                    .filter((m) => m.userId !== user?.id)
                    .slice(0, 5)
                    .map((member) => (
                      <button
                        key={member.userId}
                        onClick={() => navigate('/messages')}
                        className="flex items-center gap-2 px-2 py-1.5 w-full rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Avatar name={member.user?.name || ''} size="xs" avatar={member.user?.avatar} />
                        <span className="truncate flex-1 text-left">{member.user?.name || 'Member'}</span>
                      </button>
                    ))}
                  <button
                    onClick={() => navigate('/messages')}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    View all messages
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/messages')}
                  className="text-xs text-gray-400 dark:text-gray-500 px-2 py-2 italic hover:text-primary-500 transition-colors"
                >
                  Open Messages
                </button>
              )}
            </SidebarSection>
          </div>

          {/* Collapse button */}
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center gap-2 px-2 py-1.5 w-full rounded-lg text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
              Collapse
            </button>
          </div>
        </div>
      )}

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute left-[52px] top-3 z-30 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Expand sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      )}

      {/* Workspace Invite Modal */}
      {currentWorkspace && (
        <InviteToWorkspaceModal
          isOpen={showWorkspaceInvite}
          onClose={() => setShowWorkspaceInvite(false)}
          workspaceId={currentWorkspace.id}
          workspaceName={currentWorkspace.name}
        />
      )}
    </div>
  );
};

// ─── Sidebar Nav Item ────────────────────────────────────────

const SidebarNavItem: React.FC<{
  to: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  badge?: number;
}> = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`
    }
  >
    <Icon className="w-4 h-4" />
    <span className="flex-1">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </NavLink>
);

// ─── Sidebar Section ─────────────────────────────────────────

const SidebarSection: React.FC<{
  title: string;
  icon: React.FC<{ className?: string }>;
  open: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon: Icon, open, onToggle, action, children }) => (
  <div>
    <div className="flex items-center gap-1 group">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 flex-1 px-2 py-1 rounded text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
        {title}
      </button>
      {action && <div className="opacity-0 group-hover:opacity-100 transition-opacity">{action}</div>}
    </div>
    {open && <div className="mt-1 space-y-0.5">{children}</div>}
  </div>
);
