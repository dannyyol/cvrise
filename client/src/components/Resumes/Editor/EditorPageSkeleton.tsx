import type { Dispatch, RefObject, SetStateAction } from 'react';
import { clsx } from 'clsx';
import { Briefcase, Check, ChevronDown, Edit3, Eye, LayoutTemplate } from 'lucide-react';
import DownloadDropdown from '@/src/components/DownloadDropdown';
import { PageTitle } from '@/src/components/ui/PageTitle';

interface EditorPageSkeletonProps {
  activeTab: 'editor' | 'preview';
  activeDocumentMode: 'resume' | 'cover-letter';
  isModeDropdownOpen: boolean;
  setIsModeDropdownOpen: Dispatch<SetStateAction<boolean>>;
  modeDropdownRef: RefObject<HTMLDivElement | null>;
  setDocumentMode: (mode: 'resume' | 'cover-letter') => void;
  currentTemplateName?: string;
}

export const EditorPageSkeleton = ({
  activeTab,
  activeDocumentMode,
  isModeDropdownOpen,
  setIsModeDropdownOpen,
  modeDropdownRef,
  setDocumentMode,
  currentTemplateName,
}: EditorPageSkeletonProps) => {
  return (
    <div className="h-full flex flex-col lg:flex-row relative overflow-hidden">
      <div className="lg:hidden bg-white border-b border-gray-200 p-2 flex gap-2 shrink-0 z-20 shadow-sm">
        <button
          disabled
          aria-disabled="true"
          className={clsx(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            "bg-blue-50 text-blue-600 shadow-sm opacity-60 cursor-not-allowed"
          )}
        >
          <Edit3 className="w-4 h-4" />
          Editor
        </button>
        <button
          disabled
          aria-disabled="true"
          className={clsx(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            "text-gray-400 bg-gray-50 opacity-60 cursor-not-allowed"
          )}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      <div
        className={clsx(
          "w-full lg:w-1/2 xl:w-5/12 flex-1 lg:h-full overflow-hidden flex flex-col lg:border-r border-slate-200/60 bg-white",
          activeTab === 'editor' ? 'flex' : 'hidden lg:flex'
        )}
      >
        <div className="p-3 md:p-4 flex-1 overflow-y-auto">
          <div className="mb-4 flex justify-between items-start">
            <div className="flex justify-between gap-2">
              <PageTitle
                as="h2"
                title={activeDocumentMode === 'resume' ? 'Resume Editor' : 'Cover Letter'}
                icon={<LayoutTemplate className="w-7 h-7" />}
                description={
                  activeDocumentMode === 'resume'
                    ? 'Customize your CV content and layout.'
                    : 'Draft a compelling cover letter.'
                }
              />
            </div>
            <div className="hidden lg:flex items-center">
              <button
                disabled
                aria-disabled="true"
                className="flex items-center justify-center w-9 h-9 bg-blue-50 text-blue-600 rounded-lg transition-all border border-blue-200 opacity-60 cursor-not-allowed"
                title="Tailor to Job"
              >
                <Briefcase className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="h-4 w-4 bg-slate-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-slate-200 rounded-full" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-5 w-5 bg-slate-100 rounded" />
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <div className="h-10 w-full bg-slate-50 rounded-lg" />
                  <div className="h-10 w-5/6 bg-slate-50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          <div className="my-6 border-t border-gray-200 pt-5 animate-pulse">
            <div className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl bg-slate-50" />
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "w-full lg:w-1/2 xl:w-7/12 flex-1 lg:h-full bg-gray-200 relative overflow-hidden flex flex-col",
          activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
        )}
      >
        <div className="hidden lg:flex bg-white border-b border-gray-200 px-4 py-3 justify-between items-center relative z-30 shrink-0">
          <div className="hidden lg:flex items-center gap-4">
            <div ref={modeDropdownRef} className="relative">
              <button
                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Previewing</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                      {activeDocumentMode === 'resume' ? 'Resume' : 'Cover Letter'}
                    </span>
                    <ChevronDown
                      className={clsx(
                        "w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors",
                        isModeDropdownOpen && "rotate-180"
                      )}
                    />
                  </div>
                </div>
              </button>

              {isModeDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => { setDocumentMode('resume'); setIsModeDropdownOpen(false); }}
                    className={clsx(
                      "w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors",
                      activeDocumentMode === 'resume' ? "text-blue-600 font-medium bg-blue-50/50" : "text-gray-700"
                    )}
                  >
                    Resume
                    {activeDocumentMode === 'resume' && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setDocumentMode('cover-letter'); setIsModeDropdownOpen(false); }}
                    className={clsx(
                      "w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors",
                      activeDocumentMode === 'cover-letter' ? "text-blue-600 font-medium bg-blue-50/50" : "text-gray-700"
                    )}
                  >
                    Cover Letter
                    {activeDocumentMode === 'cover-letter' && <Check className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <span className="font-bold text-gray-900">{currentTemplateName}</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <DownloadDropdown />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gray-200 pb-24 lg:pb-0">
          <div className="min-h-full py-6 flex justify-center">
            <div className="w-full max-w-[720px] px-4">
              <div className="aspect-[8.5/11] bg-white/70 border border-gray-300 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] flex">
          <div className="w-full h-11 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};
