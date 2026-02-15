import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/common/Avatar';
import { Spinner } from '../components/common/Spinner';
import {
  Users2, Crown, Shield, UserCircle, Mail, Search, Plus,
  Settings, ChevronDown, ChevronRight, LayoutDashboard,
} from 'lucide-react';

const TeamsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentWorkspace, workspaces, fetchWorkspaces } = useWorkspaceStore();
  const { boards, fetchBoards } = useBoardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBoards, setExpandedBoards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWorkspaces();
    fetchBoards({ page: 1 });
  }, []);

  const toggleBoard = (id: string) => {
    setExpandedBoards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3.5 h-3.5 text-yellow-500" />;
      case 'admin': return <Shield className="w-3.5 h-3.5 text-blue-500" />;
      default: return <UserCircle className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      member: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      viewer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[role] || colors.member;
  };

  // Collect all unique members across workspace and boards
  const allMembers = new Map<string, { user: any; roles: { context: string; role: string }[] }>();

  // Add workspace members
  if (currentWorkspace?.members) {
    for (const m of currentWorkspace.members) {
      if (!allMembers.has(m.userId)) {
        allMembers.set(m.userId, { user: m.user, roles: [] });
      }
      allMembers.get(m.userId)!.roles.push({ context: 'Workspace', role: m.role });
    }
  }

  // Add board members
  for (const board of boards) {
    if (board.members) {
      for (const m of board.members) {
        if (!allMembers.has(m.userId)) {
          allMembers.set(m.userId, { user: m.user, roles: [] });
        }
        allMembers.get(m.userId)!.roles.push({ context: board.title, role: m.role });
      }
    }
  }

  const filteredMembers = Array.from(allMembers.values()).filter(({ user: u }) =>
    !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users2 className="w-5 h-5 text-primary-500" />
          Teams
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {filteredMembers.length} team member{filteredMembers.length !== 1 ? 's' : ''} across your workspace and boards
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Workspace members section */}
          {currentWorkspace && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: currentWorkspace.color || '#6366f1' }}
                >
                  {currentWorkspace.name.charAt(0).toUpperCase()}
                </div>
                {currentWorkspace.name} — Members
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMembers.map(({ user: member, roles }) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <Avatar name={member.name} size="md" avatar={member.avatar} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                        {member.name}
                        {member.id === user?.id && (
                          <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {roles.slice(0, 3).map((r, i) => (
                          <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getRoleBadge(r.role)}`}>
                            {r.role}
                          </span>
                        ))}
                        {roles.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{roles.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Board members breakdown */}
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-gray-400" />
              Board Members
            </h2>
            <div className="space-y-2">
              {boards.map((board) => {
                const isExpanded = expandedBoards.has(board.id);
                const memberCount = board.members?.length || 0;

                return (
                  <div key={board.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <button
                      onClick={() => toggleBoard(board.id)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: board.color }}
                      >
                        {board.title.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{board.title}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users2 className="w-3 h-3" />
                        {memberCount}
                      </span>
                    </button>
                    {isExpanded && board.members && (
                      <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-2">
                        <div className="space-y-2">
                          {board.members.map((m) => (
                            <div key={m.id} className="flex items-center gap-3">
                              <Avatar name={m.user?.name || 'U'} size="sm" avatar={m.user?.avatar} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-white truncate">{m.user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{m.user?.email}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(m.role)}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getRoleBadge(m.role)}`}>
                                  {m.role}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
