import React from 'react';
import { clsx } from 'clsx';

type HeadingTag = 'h1' | 'h2';

type PageTitleProps = {
  title: string;
  icon: React.ReactNode;
  description?: string;
  as?: HeadingTag;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function PageTitle({
  title,
  icon,
  description,
  as = 'h1',
  titleClassName,
  descriptionClassName,
}: PageTitleProps) {
  const Heading = as;

  return (
    <div className="flex justify-between gap-2">
      <div className="flex justify-between gap-2 min-w-0">
        <div className="mt-1 p-2 bg-blue-50 h-12 rounded-xl text-blue-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <Heading className={clsx('text-2xl font-semibold tracking-tight text-slate-900', titleClassName)}>{title}</Heading>
        {description ? (
          <p className={clsx('text-sm text-slate-500', descriptionClassName)}>{description}</p>
        ) : null}
        </div>
      </div>
    </div>
  );
}
