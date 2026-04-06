import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  showRetry?: boolean;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
  showRetry = true,
  retryLabel = 'Retry'
}) => {
  return (
    <div className={clsx("bg-white rounded-xl border border-red-200 shadow-sm p-8 flex flex-col items-center text-center", className)}>
      <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {message && <p className="text-gray-500 mt-2">{message}</p>}
      {showRetry && (
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={onRetry || (() => window.location.reload())}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
