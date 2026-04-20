"use client";

import { useEffect, useRef, useState } from 'react';
import { Briefcase, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

type MenuAction = (e: React.MouseEvent) => void | Promise<void>;

interface ResumeCardMenuProps {
  onTailorToJob: MenuAction;
  onCoverLetter: MenuAction;
  onRename: MenuAction;
  onDelete: MenuAction;
  className?: string;
}

export function ResumeCardMenu({
  onTailorToJob,
  onCoverLetter,
  onRename,
  onDelete,
  className,
}: ResumeCardMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('touchstart', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const wrap =
    (action: MenuAction) =>
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen(false);
      await action(e);
    };

  return (
    <div
      ref={rootRef}
      className={clsx('relative', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={clsx(
          'inline-flex items-center justify-center rounded-full p-2',
          'text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
        )}
        title="Actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          className={clsx(
            'absolute right-0 top-full mt-2 w-56 overflow-hidden',
            'rounded-xl border border-slate-200 bg-white shadow-lg',
            'z-50'
          )}
        >
          <button
            type="button"
            role="menuitem"
            onClick={wrap(onTailorToJob)}
            className={clsx(
              'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm',
              'text-slate-700 hover:bg-slate-50 transition-colors'
            )}
          >
            <Briefcase className="h-4 w-4 text-slate-500" />
            Tailor to Job
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={wrap(onCoverLetter)}
            className={clsx(
              'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm',
              'text-slate-700 hover:bg-slate-50 transition-colors'
            )}
          >
            <FileText className="h-4 w-4 text-slate-500" />
            Cover Letter
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={wrap(onRename)}
            className={clsx(
              'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm',
              'text-slate-700 hover:bg-slate-50 transition-colors'
            )}
          >
            <Pencil className="h-4 w-4 text-slate-500" />
            Rename
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={wrap(onDelete)}
            className={clsx(
              'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm',
              'text-red-600 hover:bg-red-50 transition-colors'
            )}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

