import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarGroup } from '../common/Avatar';
import { LayoutList, Users } from 'lucide-react';
import type { Board } from '../../types';

interface BoardCardProps {
  board: Board;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/board/${board.id}`)}
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer"
    >
      {/* Color bar */}
      <div
        className="w-full h-2 rounded-full mb-4"
        style={{ backgroundColor: board.color }}
      />

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
        {board.title}
      </h3>

      {board.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{board.description}</p>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <LayoutList className="w-3.5 h-3.5" />
            <span>{board._count?.lists || 0} lists</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>{board.members?.length || 0}</span>
          </div>
        </div>

        {board.members && board.members.length > 0 && (
          <AvatarGroup
            users={board.members.map((m) => ({ name: m.user.name, avatar: m.user.avatar }))}
            max={3}
            size="xs"
          />
        )}
      </div>
    </div>
  );
};
