import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TaskComments } from './TaskComments';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { taskApi } from '../../api/task.api';
import { authApi } from '../../api/auth.api';
import { PRIORITIES, LABEL_COLORS } from '../../constants';
import { formatDate, timeAgo } from '../../utils/helpers';
import {
  Calendar, Tag, Users, Trash2, Edit3, Check, X,
  AlertCircle, Clock, Flag, UserPlus, Plus
} from 'lucide-react';
import type { Task, User, Comment, Label } from '../../types';
import toast from 'react-hot-toast';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  boardLabels: Label[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task: initialTask,
  boardLabels,
}) => {
  const { updateTask, deleteTask } = useBoardStore();
  const { user: currentUser } = useAuthStore();

  const [task, setTask] = useState<Task | null>(initialTask);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssigneeSearch, setShowAssigneeSearch] = useState(false);
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [saving, setSaving] = useState(false);

  // Load full task details
  useEffect(() => {
    if (initialTask?.id && isOpen) {
      taskApi.getTask(initialTask.id).then(({ data }) => {
        setTask(data.data);
        setComments(data.data.comments || []);
        setEditTitle(data.data.title);
        setEditDesc(data.data.description || '');
        setEditPriority(data.data.priority);
        setEditDueDate(data.data.dueDate ? data.data.dueDate.split('T')[0] : '');
      }).catch(() => {});
    }
  }, [initialTask?.id, isOpen]);

  if (!task) return null;

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle.trim() === task.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      const updated = await updateTask(task.id, { title: editTitle.trim() });
      setTask((prev) => prev ? { ...prev, ...updated } : null);
      setIsEditingTitle(false);
    } catch {
      toast.error('Failed to update title');
    }
  };

  const handleSaveDescription = async () => {
    try {
      const updated = await updateTask(task.id, { description: editDesc });
      setTask((prev) => prev ? { ...prev, ...updated } : null);
      setIsEditingDesc(false);
    } catch {
      toast.error('Failed to update description');
    }
  };

  const handlePriorityChange = async (priority: string) => {
    try {
      const updated = await updateTask(task.id, { priority });
      setTask((prev) => prev ? { ...prev, ...updated } : null);
      setEditPriority(priority);
    } catch {
      toast.error('Failed to update priority');
    }
  };

  const handleDueDateChange = async (date: string) => {
    try {
      const updated = await updateTask(task.id, { dueDate: date || null });
      setTask((prev) => prev ? { ...prev, ...updated } : null);
      setEditDueDate(date);
    } catch {
      toast.error('Failed to update due date');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      onClose();
    } catch {
      toast.error('Failed to delete task');
    }
    setShowDeleteConfirm(false);
  };

  const handleSearchUsers = async (query: string) => {
    setAssigneeQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await authApi.searchUsers(query);
      setSearchResults(data.data);
    } catch {} 
  };

  const handleAddAssignee = async (userId: string) => {
    try {
      await taskApi.addAssignee(task.id, userId);
      const { data } = await taskApi.getTask(task.id);
      setTask(data.data);
      setShowAssigneeSearch(false);
      setAssigneeQuery('');
      toast.success('Assignee added');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add assignee');
    }
  };

  const handleRemoveAssignee = async (userId: string) => {
    try {
      await taskApi.removeAssignee(task.id, userId);
      setTask((prev) =>
        prev ? { ...prev, assignees: prev.assignees.filter((a) => a.userId !== userId) } : null
      );
    } catch {
      toast.error('Failed to remove assignee');
    }
  };

  const handleAddLabel = async (labelId: string) => {
    try {
      await taskApi.addLabel(task.id, labelId);
      const { data } = await taskApi.getTask(task.id);
      setTask(data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add label');
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    try {
      await taskApi.removeLabel(task.id, labelId);
      setTask((prev) =>
        prev ? { ...prev, labels: prev.labels.filter((l) => l.labelId !== labelId) } : null
      );
    } catch {
      toast.error('Failed to remove label');
    }
  };

  const handleCommentAdded = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const priorityConfig = PRIORITIES[task.priority as keyof typeof PRIORITIES] || PRIORITIES.medium;
  const assignedLabelIds = task.labels?.map((l) => l.labelId) || [];
  const availableLabels = boardLabels.filter((l) => !assignedLabelIds.includes(l.id));

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={true} title="">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="mb-4">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 text-xl font-semibold border border-primary-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                  />
                  <button onClick={handleSaveTitle} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsEditingTitle(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h2
                  className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {task.title}
                </h2>
              )}
              <p className="text-xs text-gray-400 mt-1">
                in list <span className="font-medium text-gray-500">{task.list?.title}</span>
                {' · '}created {timeAgo(task.createdAt)}
              </p>
            </div>

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {task.labels.map((tl) => (
                  <Badge
                    key={tl.id}
                    color={tl.label.color}
                    onRemove={() => handleRemoveLabel(tl.labelId)}
                  >
                    {tl.label.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
              </div>
              {isEditingDesc ? (
                <div>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    autoFocus
                    placeholder="Add a description..."
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleSaveDescription}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors min-h-[60px]"
                >
                  {task.description || (
                    <span className="text-gray-400 italic">Click to add a description...</span>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <TaskComments
              taskId={task.id}
              comments={comments}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-56 space-y-4">
            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Priority</label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(PRIORITIES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handlePriorityChange(key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                      task.priority === key
                        ? 'border-current font-semibold shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      color: task.priority === key ? val.color : '#6b7280',
                      backgroundColor: task.priority === key ? val.bg : 'white',
                    }}
                  >
                    <Flag className="w-3 h-3" />
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Due Date</label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Assignees */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Assignees</label>
              <div className="space-y-2">
                {task.assignees?.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 group">
                    <Avatar name={a.user.name} size="xs" avatar={a.user.avatar} />
                    <span className="text-sm text-gray-700 flex-1 truncate">{a.user.name}</span>
                    <button
                      onClick={() => handleRemoveAssignee(a.userId)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {showAssigneeSearch ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={assigneeQuery}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                      placeholder="Search users..."
                      className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 max-h-32 overflow-y-auto">
                        {searchResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleAddAssignee(u.id)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full"
                          >
                            <Avatar name={u.name} size="xs" avatar={u.avatar} />
                            <span className="truncate">{u.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setShowAssigneeSearch(false);
                        setAssigneeQuery('');
                        setSearchResults([]);
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-gray-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAssigneeSearch(true)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add assignee
                  </button>
                )}
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Labels</label>
              <div className="space-y-1.5">
                {task.labels?.map((tl) => (
                  <Badge
                    key={tl.id}
                    color={tl.label.color}
                    size="sm"
                    onRemove={() => handleRemoveLabel(tl.labelId)}
                  >
                    {tl.label.name}
                  </Badge>
                ))}
                {availableLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {availableLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleAddLabel(label.id)}
                        className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
                        {label.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Delete */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full justify-start"
              >
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Delete "${task.title}"? This cannot be undone.`}
        confirmText="Delete"
      />
    </>
  );
};
