import React from 'react';
import { clsx } from 'clsx';

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  iconContainerClassName?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  iconContainerClassName,
}) => {
  return (
    <div className={clsx('empty-state-dashed', className)}>
      <div className={clsx('empty-state-icon-dashed', iconContainerClassName)}>{icon}</div>
      <p className="font-semibold tracking-tight text-slate-900 mb-2 text-base">{title}</p>
      {description ? (
        <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">{description}</p>
      ) : null}
      {action}
    </div>
  );
};
