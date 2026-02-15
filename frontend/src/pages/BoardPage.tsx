import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DragDropContext,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { useBoardStore } from '../store/boardStore';
import { useSocket } from '../hooks/useSocket';
import { BoardHeader } from '../components/board/BoardHeader';
import { BoardColumn } from '../components/board/BoardColumn';
import { CreateListForm } from '../components/board/CreateListForm';
import { InviteMemberModal } from '../components/board/InviteMemberModal';
import { TaskDetailModal } from '../components/task/TaskDetailModal';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { Spinner } from '../components/common/Spinner';
import { labelApi } from '../api/invitation.api';
import { Activity, PanelRightOpen, PanelRightClose } from 'lucide-react';
import type { Task, Label } from '../types';
import toast from 'react-hot-toast';

const BoardPage: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeBoard: board, lists, boardLoading: loading, fetchBoard, moveTask } = useBoardStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [boardLabels, setBoardLabels] = useState<Label[]>([]);

  // Connect socket for real-time updates
  useSocket(boardId || '');

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId).catch(() => {
        toast.error('Board not found');
        navigate('/dashboard');
      });
      loadLabels();
    }
  }, [boardId]);

  const loadLabels = async () => {
    if (!boardId) return;
    try {
      const { data } = await labelApi.getBoardLabels(boardId);
      setBoardLabels(data.data || []);
    } catch {}
  };

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId, type } = result;

      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      if (type === 'TASK') {
        try {
          await moveTask(
            draggableId,
            destination.droppableId,
            destination.index
          );
        } catch {
          toast.error('Failed to move task');
        }
      }

      // List reordering is handled optimistically via DnD visual only
      // (server-side list reorder can be added later)
    },
    [moveTask]
  );

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  if (loading || !board) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Board Header */}
      <BoardHeader
        board={board}
        onInvite={() => setShowInviteModal(true)}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" type="LIST" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-4 p-4 h-full items-start"
                >
                  {sortedLists.map((list, index) => (
                    <BoardColumn
                      key={list.id}
                      list={list}
                      index={index}
                      onTaskClick={handleTaskClick}
                    />
                  ))}
                  {provided.placeholder}

                  <div className="flex-shrink-0 w-72">
                    <CreateListForm boardId={board.id} />
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Activity Sidebar */}
        <div
          className={`border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300 ${
            showActivity ? 'w-80' : 'w-0'
          } overflow-hidden flex-shrink-0`}
        >
          <div className="w-80 p-4 h-full overflow-y-auto">
            <ActivityFeed boardId={board.id} />
          </div>
        </div>
      </div>

      {/* Activity Toggle */}
      <button
        onClick={() => setShowActivity(!showActivity)}
        className="fixed right-4 bottom-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-xl transition-all z-30"
        title={showActivity ? 'Hide activity' : 'Show activity'}
      >
        {showActivity ? (
          <PanelRightClose className="w-5 h-5" />
        ) : (
          <PanelRightOpen className="w-5 h-5" />
        )}
      </button>

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        boardId={board.id}
      />

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        boardLabels={boardLabels}
      />
    </div>
  );
};

export default BoardPage;
