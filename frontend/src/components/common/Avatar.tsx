import React, { useState } from 'react';
import { getInitials, getAvatarColor, cn } from '../../utils/helpers';

/** Generate a DiceBear avataaars URL for a given seed */
export const getDiceBearAvatar = (seed: string): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

/** Curated avatar seed list for the picker */
export const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Sarah', 'Mike', 'Emily', 'Alex', 'Lisa', 'Nolan',
  'Luna', 'Milo', 'Aria', 'Leo', 'Zara', 'Max', 'Ivy', 'Kai',
  'Nova', 'Finn', 'Ruby', 'Oscar', 'Ella', 'Jack', 'Chloe', 'Bear',
  'Willow', 'Sage', 'Storm', 'Rivers', 'Jasper', 'Hazel', 'Ember', 'Atlas',
  'Robin', 'Quinn', 'Rowan', 'Avery', 'Skyler', 'Phoenix', 'Eden', 'Scout',
];

interface AvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, avatar, size = 'md', className }) => {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={cn('rounded-full object-cover bg-gray-100 dark:bg-gray-800', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white',
        sizes[size],
        className
      )}
      style={{ backgroundColor: getAvatarColor(name) }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

interface AvatarGroupProps {
  users: { name: string; avatar?: string | null }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, max = 3, size = 'sm' }) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((user, idx) => (
        <Avatar
          key={idx}
          name={user.name}
          avatar={user.avatar}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-medium text-gray-600 bg-gray-200 ring-2 ring-white',
            size === 'xs' ? 'w-6 h-6 text-[10px]' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
