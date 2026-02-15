import { useEffect, useRef } from 'react';
import { getSocket } from '../lib/socket';
import { useBoardStore } from '../store/boardStore';
import { joinBoard, leaveBoard } from '../lib/socket';
import type { Task, List } from '../types';

export function useSocket(boardId: string | null) {
  const socketRef = useRef(getSocket());

  const {
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleTaskMoved,
    handleListCreated,
    handleListUpdated,
    handleListDeleted,
  } = useBoardStore();

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();
    socketRef.current = socket;

    joinBoard(boardId);

    socket.on('task:created', (task: Task) => handleTaskCreated(task));
    socket.on('task:updated', (task: Task) => handleTaskUpdated(task));
    socket.on('task:deleted', (data: { taskId: string; listId: string }) => handleTaskDeleted(data));
    socket.on('task:moved', (data: { task: Task; fromListId: string; toListId: string }) => handleTaskMoved(data));
    socket.on('list:created', (list: List) => handleListCreated(list));
    socket.on('list:updated', (list: List) => handleListUpdated(list));
    socket.on('list:deleted', (data: { listId: string }) => handleListDeleted(data));

    return () => {
      leaveBoard(boardId);
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('task:moved');
      socket.off('list:created');
      socket.off('list:updated');
      socket.off('list:deleted');
    };
  }, [boardId]);

  return socketRef.current;
}
