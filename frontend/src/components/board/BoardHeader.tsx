import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Avatar, AvatarGroup } from '../common/Avatar';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { boardApi } from '../../api/board.api';
import { favoriteApi } from '../../api/message.api';
import { ArrowLeft, Settings, Users, Trash2, UserPlus, Edit3, Check, X, Star } from 'lucide-react';
import type { Board } from '../../types';
import toast from 'react-hot-toast';

interface BoardHeaderProps {
  board: Board;
  onInvite: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ board, onInvite }) => {
  const navigate = useNavigate();
  const { deleteBoard, fetchBoard } = useBoardStore();
  const { user } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [isFavorite, setIsFavorite] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isOwner = board.ownerId === user?.id;
  const isAdmin = board.members?.some(
    (m) => m.userId === user?.id && (m.role === 'admin' || m.role === 'owner')
  );

  useEffect(() => {
    setEditTitle(board.title);
  }, [board.title]);

  useEffect(() => {
    // Check if board is favorited
    favoriteApi.getFavorites().then(({ data }) => {
      const favs = data.data || [];
      setIsFavorite(favs.some((f: any) => f.boardId === board.id));
    }).catch(() => {});
  }, [board.id]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === board.title) {
      setIsEditingTitle(false);
      setEditTitle(board.title);
      return;
    }
    try {
      await boardApi.updateBoard(board.id, { title: trimmed });
      await fetchBoard(board.id);
      toast.success('Board name updated');
    } catch {
      toast.error('Failed to update board name');
      setEditTitle(board.title);
    }
    setIsEditingTitle(false);
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(board.id);
        setIsFavorite(false);
      } else {
        await favoriteApi.addFavorite(board.id);
        setIsFavorite(true);
      }
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBoard(board.id);
      toast.success('Board deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete board');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-sm"
                style={{ backgroundColor: board.color }}
              />
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') { setIsEditingTitle(false); setEditTitle(board.title); }
                    }}
                    onBlur={handleSaveTitle}
                    className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-primary-500 focus:outline-none px-1 min-w-[120px]"
                  />
                </div>
              ) : (
                <button
                  onClick={() => { if (isOwner || isAdmin) setIsEditingTitle(true); }}
                  className={`text-lg font-semibold text-gray-900 dark:text-white group flex items-center gap-2 ${
                    (isOwner || isAdmin) ? 'hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer' : 'cursor-default'
                  }`}
                  title={(isOwner || isAdmin) ? 'Click to edit board name' : board.title}
                >
                  {board.title}
                  {(isOwner || isAdmin) && (
                    <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
                  )}
                </button>
              )}
              <button
                onClick={handleToggleFavorite}
                className={`p-1 rounded transition-colors ${
                  isFavorite ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Members */}
            <div className="relative">
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <AvatarGroup
                  users={board.members?.map((m) => ({ name: m.user.name, avatar: m.user.avatar })) || []}
                  max={4}
                  size="xs"
                />
                <span className="hidden sm:inline text-xs text-gray-500">
                  {board.members?.length || 0} member{(board.members?.length || 0) !== 1 ? 's' : ''}
                </span>
              </button>

              {showMembers && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-30 animate-slide-in">
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Members</div>
                  {board.members?.map((member) => (
                    <div key={member.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Avatar name={member.user.name} size="sm" avatar={member.user.avatar} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.user.email}</p>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{member.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={onInvite}
            >
              <span className="hidden sm:inline">Invite</span>
            </Button>

            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-400 hover:text-red-600"
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Board"
        message="This will permanently delete this board and all its lists, tasks, and comments. This action cannot be undone."
        confirmText="Delete Board"
        isLoading={deleting}
      />
    </>
  );
};
