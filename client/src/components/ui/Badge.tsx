import React from 'react';
import { cn } from './Form';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

const variants = {
  default: 'badge-default',
  secondary: 'badge-secondary',
  outline: 'badge-outline',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
};

export const Badge = ({ 
  className, 
  variant = 'default', 
  icon, 
  children, 
  ...props 
}: BadgeProps) => {
  return (
    <span 
      className={cn(
        "badge",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
};
