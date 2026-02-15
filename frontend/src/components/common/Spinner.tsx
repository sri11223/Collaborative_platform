import React from 'react';
import { cn } from '../../utils/helpers';
import {
  CheckSquare, ListTodo, Calendar, Zap, Target, BarChart3,
} from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-10 h-10' };

  return (
    <div className={cn('relative', sizes[size], className)}>
      <div className={cn('animate-spin rounded-full border-2 border-primary-200 dark:border-primary-800 border-t-primary-600', sizes[size])} />
    </div>
  );
};

const loadingIcons = [CheckSquare, ListTodo, Calendar, Zap, Target, BarChart3];

export const PageSpinner: React.FC = () => {
  const [iconIndex, setIconIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % loadingIcons.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const IconComponent = loadingIcons[iconIndex];

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-500 animate-spin" />
          {/* Bouncing icon */}
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400 transition-all duration-300" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
};
