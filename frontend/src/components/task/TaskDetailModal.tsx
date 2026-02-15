import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { taskApi } from '../../api/task.api';
import { authApi } from '../../api/auth.api';
import { PRIORITIES, LABEL_COLORS } from '../../constants';
import { timeAgo } from '../../utils/helpers';
import {
  X, Calendar, Tag, Users, Trash2, Edit3, Check,
  Flag, UserPlus, Plus, MessageCircle, Send,
  Bold, Italic, Link2, List, Hash, AtSign,
  ChevronDown, Clock, AlertCircle, Paperclip
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
  const contentRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [task, setTask] = useState<Task | null>(initialTask);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssigneeSearch, setShowAssigneeSearch] = useState(false);
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [submittingChat, setSubmittingChat] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    if (initialTask?.id && isOpen) {
      taskApi.getTask(initialTask.id).then(({ data }) => {
        setTask(data.data);
        setComments(data.data.comments || []);
        setEditTitle(data.data.title);
        setEditDesc(data.data.description || '');
        setEditDueDate(data.data.dueDate ? data.data.dueDate.split('T')[0] : '');
      }).catch(() => {});
    }
  }, [initialTask?.id, isOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

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
      setShowLabelPicker(false);
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

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setSubmittingChat(true);
    try {
      const { data } = await taskApi.addComment(task.id, chatMessage.trim());
      setComments((prev) => [...prev, data.data]);
      setChatMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSubmittingChat(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await taskApi.deleteComment(task.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const priorityConfig = PRIORITIES[task.priority as keyof typeof PRIORITIES] || PRIORITIES.medium;
  const assignedLabelIds = task.labels?.map((l) => l.labelId) || [];
  const availableLabels = boardLabels.filter((l) => !assignedLabelIds.includes(l.id));

  const statusOptions = [
    { value: 'todo', label: 'To Do', color: '#6b7280', bg: '#f3f4f6' },
    { value: 'in-progress', label: 'In Progress', color: '#3b82f6', bg: '#dbeafe' },
    { value: 'review', label: 'Review', color: '#f59e0b', bg: '#fef3c7' },
    { value: 'done', label: 'Done', color: '#10b981', bg: '#d1fae5' },
  ];

  const currentList = task.list?.title || 'Unknown';

  return (
    <>
      {/* Full-screen modal overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
        onClick={handleBackdropClick}
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal container */}
        <div
          ref={contentRef}
          className="relative w-full max-w-6xl h-[85vh] mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-scale-in"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: priorityConfig.bg, color: priorityConfig.color }}>
                <Flag className="w-3 h-3" />
                {priorityConfig.label}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">in</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {currentList}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(task.createdAt)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main content area */}
          <div className="flex flex-1 overflow-hidden">
            {/* ===== LEFT PANEL ===== */}
            <div className="flex-1 overflow-y-auto border-r border-gray-100 dark:border-gray-800">
              <div className="p-6">
                {/* Task Title */}
                <div className="mb-6">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-2xl font-bold border-b-2 border-primary-500 bg-transparent text-gray-900 dark:text-white px-1 py-1 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') setIsEditingTitle(false);
                        }}
                      />
                      <button onClick={handleSaveTitle} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setIsEditingTitle(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <h1
                      className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors group flex items-center gap-2"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {task.title}
                      <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </h1>
                  )}
                </div>

                {/* Detail fields grid - ClickUp style */}
                <div className="space-y-3 mb-6">
                  {/* Status row */}
                  <div className="flex items-center gap-4 py-2">
                    <span className="w-28 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: statusOptions.find(s => s.label.toLowerCase().replace(' ', '-').includes(currentList.toLowerCase().replace(' ', '-')))?.bg || '#f3f4f6',
                                 color: statusOptions.find(s => s.label.toLowerCase().replace(' ', '-').includes(currentList.toLowerCase().replace(' ', '-')))?.color || '#6b7280' }}
                      >
                        {currentList}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Priority row */}
                  <div className="flex items-center gap-4 py-2 border-t border-gray-50 dark:border-gray-800">
                    <span className="w-28 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Priority</span>
                    <div className="flex items-center gap-1.5">
                      {Object.entries(PRIORITIES).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => handlePriorityChange(key)}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all ${
                            task.priority === key
                              ? 'font-semibold shadow-sm ring-1 ring-current/20'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            color: val.color,
                            backgroundColor: task.priority === key ? val.bg : 'transparent',
                          }}
                        >
                          <Flag className="w-3 h-3" />
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due Date row */}
                  <div className="flex items-center gap-4 py-2 border-t border-gray-50 dark:border-gray-800">
                    <span className="w-28 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Due Date</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => handleDueDateChange(e.target.value)}
                        className="text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Assignees row */}
                  <div className="flex items-start gap-4 py-2 border-t border-gray-50 dark:border-gray-800">
                    <span className="w-28 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide pt-1">Assignees</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {task.assignees?.map((a) => (
                        <div key={a.id} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-2 py-0.5 group">
                          <Avatar name={a.user.name} size="xs" avatar={a.user.avatar} />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{a.user.name}</span>
                          <button
                            onClick={() => handleRemoveAssignee(a.userId)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <X className="w-3 h-3" />
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
                            className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 w-40"
                            autoFocus
                          />
                          {searchResults.length > 0 && (
                            <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 max-h-32 overflow-y-auto">
                              {searchResults.map((u) => (
                                <button
                                  key={u.id}
                                  onClick={() => handleAddAssignee(u.id)}
                                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                                >
                                  <Avatar name={u.name} size="xs" avatar={u.avatar} />
                                  <span className="truncate">{u.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => { setShowAssigneeSearch(false); setAssigneeQuery(''); setSearchResults([]); }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-gray-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAssigneeSearch(true)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors px-2 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-full"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Labels row */}
                  <div className="flex items-start gap-4 py-2 border-t border-gray-50 dark:border-gray-800">
                    <span className="w-28 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide pt-1">Labels</span>
                    <div className="flex flex-wrap items-center gap-1.5">
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
                      <div className="relative">
                        <button
                          onClick={() => setShowLabelPicker(!showLabelPicker)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors px-2 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          Add
                        </button>
                        {showLabelPicker && availableLabels.length > 0 && (
                          <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 max-h-40 overflow-y-auto">
                            {availableLabels.map((label) => (
                              <button
                                key={label.id}
                                onClick={() => handleAddLabel(label.id)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                              >
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                                {label.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-800 my-4" />

                {/* Description section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-gray-400" />
                      Description
                    </h3>
                    {!isEditingDesc && task.description && (
                      <button
                        onClick={() => setIsEditingDesc(true)}
                        className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {isEditingDesc ? (
                    <div>
                      {/* Simple toolbar */}
                      <div className="flex items-center gap-1 p-1.5 border border-gray-200 dark:border-gray-700 border-b-0 rounded-t-lg bg-gray-50 dark:bg-gray-800">
                        <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Bold">
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Italic">
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Link">
                          <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="List">
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                        <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Mention">
                          <AtSign className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Attach">
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={6}
                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-b-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        autoFocus
                        placeholder="Add a detailed description, links, or notes..."
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={handleSaveDescription}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingDesc(true)}
                      className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[80px] border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    >
                      {task.description ? (
                        <div className="whitespace-pre-wrap">{task.description}</div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">Click to add a description, links, or notes...</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Delete action */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                  </button>
                </div>
              </div>
            </div>

            {/* ===== RIGHT PANEL - Chat/Messages ===== */}
            <div className="w-[380px] flex-shrink-0 flex flex-col bg-gray-50 dark:bg-gray-800/30">
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary-500" />
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Messages
                </h3>
                <span className="text-xs text-gray-400 bg-gray-200/60 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {comments.length}
                </span>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No messages yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start the conversation about this task</p>
                  </div>
                ) : (
                  comments.map((comment) => {
                    const isOwn = comment.userId === currentUser?.id;
                    return (
                      <div key={comment.id} className={`flex gap-2.5 group ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <Avatar
                          name={comment.user?.name || 'User'}
                          size="sm"
                          avatar={comment.user?.avatar}
                        />
                        <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? 'justify-end' : ''}`}>
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                              {comment.user?.name || 'User'}
                            </span>
                            <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
                            {isOwn && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className={`inline-block px-3 py-2 rounded-2xl text-sm max-w-[85%] ${
                            isOwn
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-600 rounded-bl-md'
                          }`}>
                            <p className="whitespace-pre-wrap break-words text-left">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <form onSubmit={handleSendChat}>
                  <div className="relative">
                    {/* Formatting toolbar - mini */}
                    <div className="flex items-center gap-0.5 px-2 py-1">
                      <button type="button" className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" title="Bold">
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" title="Italic">
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" title="Mention">
                        <AtSign className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" title="Attach">
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-end gap-2">
                      <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        rows={2}
                        className="flex-1 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChat(e);
                          }
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!chatMessage.trim() || submittingChat}
                        className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">Enter to send · Shift+Enter for new line</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

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
