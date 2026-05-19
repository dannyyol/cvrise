"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Check,
  Loader2,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useCVStore } from '@/src/store/useCVStore';
import { resumeService } from '@/src/services/resumeService';
import type { ResumeSummary } from '@/src/services/resumeService';
import DownloadDropdown from '@/src/components/DownloadDropdown';
import { ROUTES } from '@/src/lib/routes';

interface EditorTopBarProps {
  activeDocumentMode: 'resume' | 'cover-letter';
  setDocumentMode: (mode: 'resume' | 'cover-letter') => void;
}

function relativeDate(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function ResumePicker() {
  const router = useRouter();
  const { currentResumeTitle, currentResumeId, setCurrentResumeId } = useCVStore();
  const [isOpen, setIsOpen] = useState(false);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && resumes.length === 0) {
      setIsFetching(true);
      try {
        const data = await resumeService.getAllResumes();
        setResumes(data);
      } catch {
        // silently fail
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleSelect = (id: string) => {
    setCurrentResumeId(id);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className={clsx(
          'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-sm font-semibold text-gray-900',
          isOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
        )}
      >
        <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="max-w-[200px] truncate">{currentResumeTitle ?? 'Untitled Resume'}</span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
        >
          {/* Dropdown header */}
          <div className="px-3.5 py-3 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Resumes</p>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 text-[#04659A] animate-spin" />
            </div>
          ) : (
            <div className="p-1.5 max-h-52 overflow-y-auto">
              {resumes.map((resume) => {
                const isActive = resume.id === currentResumeId;
                return (
                  <button
                    key={resume.id}
                    onClick={() => handleSelect(resume.id)}
                    className={clsx(
                      'w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors',
                      isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                    )}
                  >
                    {/* Icon box */}
                    <div
                      className={clsx(
                        'w-[34px] h-[34px] rounded-[9px] flex items-center justify-center shrink-0',
                        isActive
                          ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                          : 'bg-gray-100'
                      )}
                    >
                      <FileText
                        className={clsx('w-4 h-4', isActive ? 'text-[#04659A]' : 'text-gray-400')}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 text-left">
                      <p
                        className={clsx(
                          'text-[13px] font-semibold truncate leading-tight',
                          isActive ? 'text-gray-900' : 'text-gray-700'
                        )}
                      >
                        {resume.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {resume.template_key ?? 'Classic'} · {relativeDate(resume.updatedAt)}
                      </p>
                    </div>

                    {/* Active dot */}
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-[#04659A] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="p-2 border-t border-gray-50 space-y-0.5">
            <button
              onClick={() => { router.push(ROUTES.RESUMES); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-[9px] border-[1.5px] border-dashed border-gray-200 text-[12px] font-semibold text-gray-500 hover:border-[#04659A] hover:text-[#04659A] hover:bg-blue-50/50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Resume
            </button>
            <button
              onClick={() => { router.push(ROUTES.RESUMES); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-[12px] font-medium text-gray-400 hover:text-[#04659A] rounded-lg transition-colors"
            >
              View all resumes
              <ChevronDown className="w-3 h-3 -rotate-90" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveStatus() {
  const { isSaving, isDirty, lastSaved } = useCVStore();

  if (isSaving) {
    return (
      <div className="flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors duration-200">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Saving…</span>
      </div>
    );
  }
  if (lastSaved) {
    return (
      <div className={clsx(
        'flex items-center gap-1 text-[13px] font-medium transition-colors duration-300',
        isDirty ? 'text-gray-400' : 'text-green-600'
      )}>
        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span>Saved</span>
      </div>
    );
  }
  return null;
}


export function EditorTopBar({
  activeDocumentMode,
  setDocumentMode,
}: EditorTopBarProps) {
  const router = useRouter();
  const isResumeMode = activeDocumentMode === 'resume';

  return (
    <div
      className="hidden lg:flex h-14 bg-white border-b border-gray-200 items-center px-4 shrink-0 z-30 relative"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      {/* LEFT: Back + Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 shrink-0" />

        <div className="flex items-center gap-1 text-[13px] text-gray-400 min-w-0">
          <span className="whitespace-nowrap">Dashboard</span>
          <ChevronDown className="w-3.5 h-3.5 -rotate-90 shrink-0" />
          <ResumePicker />
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-100 rounded-full p-[3px] gap-0.5">
        <button
          onClick={() => setDocumentMode('resume')}
          className={clsx(
            'text-[13px] font-semibold px-[18px] py-[5px] rounded-full transition-all',
            isResumeMode
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 font-medium hover:text-gray-700'
          )}
          style={isResumeMode ? { boxShadow: '0 1px 4px rgba(0,0,0,0.12)' } : {}}
        >
          Resume
        </button>
        <button
          onClick={() => setDocumentMode('cover-letter')}
          className={clsx(
            'text-[13px] font-semibold px-[18px] py-[5px] rounded-full transition-all',
            !isResumeMode
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 font-medium hover:text-gray-700'
          )}
          style={!isResumeMode ? { boxShadow: '0 1px 4px rgba(0,0,0,0.12)' } : {}}
        >
          Cover Letter
        </button>
      </div>

      {/* RIGHT: Save status + Download */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <SaveStatus />
        <div className="h-5 w-px bg-gray-200" />
        <DownloadDropdown />
      </div>
    </div>
  );
}
