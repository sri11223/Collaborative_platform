import React, { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { taskApi } from '../../api/task.api';
import { useAuthStore } from '../../store/authStore';
import { timeAgo } from '../../utils/helpers';
import { MessageSquare, Trash2, Send } from 'lucide-react';
import type { Comment } from '../../types';
import toast from 'react-hot-toast';

interface TaskCommentsProps {
  taskId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({
  taskId,
  comments,
  onCommentAdded,
  onCommentDeleted,
}) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await taskApi.addComment(taskId, content.trim());
      onCommentAdded(data.data);
      setContent('');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await taskApi.deleteComment(taskId, commentId);
      onCommentDeleted(commentId);
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-3">
          {user && <Avatar name={user.name} size="sm" avatar={user.avatar} />}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder-gray-400 dark:placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-xs text-gray-400">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to send
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim()}
                isLoading={submitting}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <Avatar
              name={comment.user?.name || 'User'}
              size="sm"
              avatar={comment.user?.avatar}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.user?.name || 'User'}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                {comment.userId === user?.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No comments yet</p>
        )}
      </div>
    </div>
  );
};
