import React, { useEffect, useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { invitationApi } from '../api/invitation.api';
import { BoardCard } from '../components/board/BoardCard';
import { CreateBoardModal } from '../components/board/CreateBoardModal';
import { SearchInput } from '../components/common/SearchInput';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { Avatar } from '../components/common/Avatar';
import { useDebounce } from '../hooks/useDebounce';
import type { Invitation } from '../types';
import {
  Plus, LayoutDashboard, Mail, Check, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { boards, boardsPagination: pagination, boardsLoading: loading, fetchBoards } = useBoardStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchBoards({ page, search: debouncedSearch });
  }, [page, debouncedSearch, fetchBoards]);

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
      toast.success('Invitation accepted');
      fetchBoards({ page, search: debouncedSearch });
    } catch {
      toast.error('Failed to accept invitation');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await invitationApi.declineInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      toast.success('Invitation declined');
    } catch {
      toast.error('Failed to decline invitation');
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your boards and collaborate with your team
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New Board
        </Button>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mb-8 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm font-semibold text-primary-900 dark:text-primary-300">
              Pending Invitations ({invitations.length})
            </h2>
          </div>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={inv.inviter?.name || 'User'} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {inv.board?.title || 'Board'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Invited by {inv.inviter?.name || 'someone'} as {inv.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(inv.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDecline(inv.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search boards..."
        />
      </div>

      {/* Boards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : boards.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboard className="w-12 h-12" />}
          title={search ? 'No boards found' : 'No boards yet'}
          description={
            search
              ? 'Try a different search term'
              : 'Create your first board to start organizing your tasks'
          }
          action={
            !search ? (
              <Button
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Board
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default DashboardPage;
