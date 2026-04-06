import type { Dispatch, RefObject, SetStateAction } from 'react';
import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import { CVPreview } from '@/src/components/Resumes/Preview/CVPreview';
import { CoverLetterPreview } from '@/src/components/CoverLetters/Preview/CoverLetterPreview';
import DownloadDropdown from '@/src/components/DownloadDropdown';

interface EditorPreviewPanelProps {
  activeTab: 'editor' | 'preview';
  modeDropdownRef: RefObject<HTMLDivElement | null>;
  isModeDropdownOpen: boolean;
  setIsModeDropdownOpen: Dispatch<SetStateAction<boolean>>;
  isResumeMode: boolean;
  setDocumentMode: (mode: 'resume' | 'cover-letter') => void;
  currentTemplateName?: string;
  activeDocumentMode: 'resume' | 'cover-letter';
}

export const EditorPreviewPanel = ({
  activeTab,
  modeDropdownRef,
  isModeDropdownOpen,
  setIsModeDropdownOpen,
  isResumeMode,
  setDocumentMode,
  currentTemplateName,
  activeDocumentMode,
}: EditorPreviewPanelProps) => {
  return (
    <div className={clsx(
      "w-full lg:w-1/2 xl:w-7/12 flex-1 lg:h-full bg-gray-200 relative overflow-hidden flex flex-col",
      activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
    )}>
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
                      {isResumeMode ? 'Resume' : 'Cover Letter'}
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
                      isResumeMode ? "text-blue-600 font-medium bg-blue-50/50" : "text-gray-700"
                    )}
                  >
                    Resume
                    {isResumeMode && <Check className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => { setDocumentMode('cover-letter'); setIsModeDropdownOpen(false); }}
                    className={clsx(
                      "w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors",
                      !isResumeMode ? "text-blue-600 font-medium bg-blue-50/50" : "text-gray-700"
                    )}
                  >
                    Cover Letter
                    {!isResumeMode && <Check className="w-4 h-4" />}
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
        <div className="min-h-full py-2 flex justify-center">
           {activeDocumentMode === 'resume' ? (
              <CVPreview />
           ) : (
              <CoverLetterPreview />
           )}
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] flex">
        <div className="w-full">
          <DownloadDropdown className="w-full justify-center" variant="sheet" />
        </div>
      </div>
    </div>
  );
};
