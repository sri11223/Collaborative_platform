import React from 'react';
import { Avatar } from '../common/Avatar';
import { timeAgo } from '../../utils/helpers';
import type { Activity } from '../../types';

interface ActivityItemProps {
  activity: Activity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Avatar
        name={activity.user?.name || 'User'}
        size="xs"
        avatar={activity.user?.avatar}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600">
          <span className="font-medium text-gray-900">{activity.user?.name || 'User'}</span>
          {' '}
          {activity.description}
        </p>
        <span className="text-[10px] text-gray-400 mt-0.5 block">
          {timeAgo(activity.createdAt)}
        </span>
      </div>
    </div>
  );
};
