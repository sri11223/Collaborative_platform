import React, { useEffect, useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { activityApi } from '../../api/invitation.api';
import { Spinner } from '../common/Spinner';
import { Activity as ActivityIcon, RefreshCw } from 'lucide-react';
import type { Activity } from '../../types';

interface ActivityFeedProps {
  boardId: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ boardId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchActivities = async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const { data } = await activityApi.getBoardActivities(boardId, { page: pageNum, limit: 20 });
      const items = data.data.activities || data.data || [];
      const pagination = data.data.pagination;

      if (append) {
        setActivities((prev) => [...prev, ...items]);
      } else {
        setActivities(items);
      }

      setHasMore(pagination ? pagination.page < pagination.totalPages : false);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, [boardId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage, true);
  };

  const refresh = () => {
    setPage(1);
    fetchActivities(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-700">Activity</h3>
        </div>
        <button
          onClick={refresh}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
      ) : (
        <div className="space-y-0">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full mt-3 py-2 text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
};
