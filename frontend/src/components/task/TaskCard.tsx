import React from 'react';
import { AvatarGroup } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { PRIORITIES } from '../../constants';
import { formatDate, isOverdue, isDueSoon } from '../../utils/helpers';
import { Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const priorityConfig = PRIORITIES[task.priority] || PRIORITIES.medium;
  const overdue = isOverdue(task.dueDate);
  const dueSoon = isDueSoon(task.dueDate);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
    >
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((tl) => (
            <div
              key={tl.id}
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: tl.label.color }}
              title={tl.label.name}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
        {task.title}
      </h4>

      {/* Meta info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <Badge color={priorityConfig.color} size="sm">
            {task.priority === 'urgent' && <AlertCircle className="w-3 h-3" />}
            {priorityConfig.label}
          </Badge>

          {/* Due date */}
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-xs ${
                overdue
                  ? 'text-red-600'
                  : dueSoon
                  ? 'text-amber-600'
                  : 'text-gray-500'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}

          {/* Comments count */}
          {(task._count?.comments || 0) > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <MessageSquare className="w-3 h-3" />
              {task._count?.comments}
            </span>
          )}
        </div>

        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <AvatarGroup
            users={task.assignees.map((a) => ({ name: a.user.name, avatar: a.user.avatar }))}
            max={2}
            size="xs"
          />
        )}
      </div>
    </div>
  );
};
