"use client";

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { Tooltip } from '@/src/components/ui/Tooltip';

export type DashboardNavItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
};

export const DashboardNavItem = ({ to, icon: Icon, label, active, onClick, isCollapsed }: DashboardNavItemProps) => {
  const content = (
    <Link
      href={to}
      onClick={onClick}
      className={clsx(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
        active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
        isCollapsed && 'justify-center px-2'
      )}
    >
      {active && (
        <motion.div
          layoutId="active-nav-pill"
          className="absolute inset-0 bg-blue-50/80 rounded-xl"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      <Icon className={clsx('w-5 h-5 relative z-10 shrink-0', active && 'stroke-[2.5px]')} />

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="font-medium text-sm relative z-10 whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {active && !isCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600"
        />
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={label} position="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};
