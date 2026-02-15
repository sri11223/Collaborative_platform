import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <Loader2
      className={cn('animate-spin text-primary-600', sizes[size], className)}
    />
  );
};

export const PageSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);
