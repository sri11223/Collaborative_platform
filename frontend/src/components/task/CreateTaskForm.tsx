import React, { useState } from 'react';
import { Button } from '../common/Button';
import { useBoardStore } from '../../store/boardStore';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateTaskFormProps {
  listId: string;
  onClose: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ listId, onClose }) => {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createTask } = useBoardStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createTask(listId, { title: title.trim() });
      setTitle('');
      onClose();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title..."
        className="w-full text-sm border-none bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500"
        rows={2}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
          if (e.key === 'Escape') onClose();
        }}
      />
      <div className="flex items-center gap-2 mt-2">
        <Button type="submit" size="sm" isLoading={isLoading}>
          Add Task
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};
