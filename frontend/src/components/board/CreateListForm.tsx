import React, { useState } from 'react';
import { Button } from '../common/Button';
import { useBoardStore } from '../../store/boardStore';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateListFormProps {
  boardId: string;
}

export const CreateListForm: React.FC<CreateListFormProps> = ({ boardId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createList } = useBoardStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createList(boardId, title.trim());
      setTitle('');
      setIsOpen(false);
    } catch {
      toast.error('Failed to create list');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex-shrink-0 w-80 h-12 flex items-center gap-2 px-4 text-sm text-gray-500 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add List
      </button>
    );
  }

  return (
    <div className="flex-shrink-0 w-80">
      <form onSubmit={handleSubmit} className="bg-gray-100 rounded-xl p-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          autoFocus
        />
        <div className="flex items-center gap-2 mt-2">
          <Button type="submit" size="sm" isLoading={isLoading}>
            Add List
          </Button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTitle('');
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
