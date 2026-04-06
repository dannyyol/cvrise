import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export const Tooltip = ({ 
  content, 
  children, 
  position = 'bottom',
  className,
  delay = 0.2
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={delay * 1000}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={position}
            sideOffset={4}
            className={clsx(
              "z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg shadow-xl",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              "border border-slate-700/50 backdrop-blur-sm",
              className
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-slate-800 border-slate-700/50" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
