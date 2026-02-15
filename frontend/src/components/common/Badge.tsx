import React from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color,
  bg,
  variant = 'default',
  size = 'sm',
  className,
  onRemove,
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full gap-1',
        sizeStyles,
        variant === 'outline' ? 'border' : '',
        className
      )}
      style={{
        backgroundColor: bg || (variant === 'default' ? `${color}20` : 'transparent'),
        color: color || '#374151',
        borderColor: variant === 'outline' ? color : undefined,
      }}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  );
};
