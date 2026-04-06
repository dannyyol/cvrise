import React from 'react';
import { cn } from './Form';

type CardVariant = 'default' | 'accordion';
type Radius = 'lg' | 'xl' | '2xl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  rounded?: Radius;
  topBorder?: boolean;
  shadow?: boolean;
}

export function Card({
  className,
  children,
  variant = 'default',
  rounded = '2xl',
  topBorder = variant === 'accordion',
  shadow = variant === 'default',
  ...props
}: CardProps) {
  const radiusClass = rounded === 'lg' ? 'rounded-lg' : rounded === 'xl' ? 'rounded-xl' : 'rounded-2xl';
  const base = 'bg-white overflow-hidden transition-all duration-200';
  const borders =
    variant === 'accordion'
      ? cn('border-l border-r border-b border-gray-200', topBorder && 'border-t')
      : 'border border-gray-200';
  const shadowClass = shadow ? 'shadow-sm' : 'shadow-none';

  return (
    <div className={cn(base, radiusClass, borders, shadowClass, className)} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between p-4 bg-white hover:bg-gray-50/60 transition-colors', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('p-6 space-y-5', className)} {...props}>
      {children}
    </div>
  );
}
