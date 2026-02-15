import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskCard } from '../task/TaskCard';
import { CreateTaskForm } from '../task/CreateTaskForm';
import { Button } from '../common/Button';
import { useBoardStore } from '../../store/boardStore';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MoreHorizontal, Trash2, Edit3, Plus } from 'lucide-react';
import type { List, Task } from '../../types';
import toast from 'react-hot-toast';

interface BoardColumnProps {
  list: List;
  index: number;
  onTaskClick: (task: Task) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ list, index, onTaskClick }) => {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateList, deleteList } = useBoardStore();

  const handleUpdateTitle = async () => {
    if (editTitle.trim() && editTitle.trim() !== list.title) {
      try {
        await updateList(list.id, { title: editTitle.trim() });
      } catch {
        toast.error('Failed to update list');
        setEditTitle(list.title);
      }
    } else {
      setEditTitle(list.title);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteList(list.id);
      toast.success('List deleted');
    } catch {
      toast.error('Failed to delete list');
    }
    setShowDeleteConfirm(false);
  };

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex-shrink-0 w-80"
        >
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 max-h-[calc(100vh-180px)] flex flex-col">
            {/* List Header */}
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between mb-3 px-1"
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle();
                    if (e.key === 'Escape') {
                      setEditTitle(list.title);
                      setIsEditing(false);
                    }
                  }}
                  className="text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-primary-300 dark:border-primary-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              ) : (
                <h3
                  className="text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  onClick={() => setIsEditing(true)}
                >
                  {list.title}
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {list.tasks?.length || 0}
                  </span>
                </h3>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20 animate-slide-in">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete List
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Task List */}
            <Droppable droppableId={list.id} type="TASK">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto space-y-2 min-h-[40px] kanban-column p-0.5 rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  {list.tasks?.map((task, taskIndex) => (
                    <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'dragging' : ''}
                        >
                          <TaskCard task={task} onClick={() => onTaskClick(task)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add Task */}
            {showCreateTask ? (
              <CreateTaskForm
                listId={list.id}
                onClose={() => setShowCreateTask(false)}
              />
            ) : (
              <button
                onClick={() => setShowCreateTask(true)}
                className="mt-2 flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg w-full transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add a task
              </button>
            )}
          </div>

          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="Delete List"
            message={`Delete "${list.title}" and all its tasks? This cannot be undone.`}
            confirmText="Delete"
          />
        </div>
      )}
    </Draggable>
  );
};
