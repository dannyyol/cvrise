import { clsx } from 'clsx';
import { CVPreview } from '@/src/components/Resumes/Preview/CVPreview';
import { CoverLetterPreview } from '@/src/components/CoverLetters/Preview/CoverLetterPreview';
import DownloadDropdown from '@/src/components/DownloadDropdown';

interface EditorPreviewPanelProps {
  activeTab: 'editor' | 'preview';
  activeDocumentMode: 'resume' | 'cover-letter';
}

export const EditorPreviewPanel = ({ activeTab, activeDocumentMode }: EditorPreviewPanelProps) => {
  return (
    <div
      className={clsx(
        'w-full lg:flex-1 lg:h-full bg-gray-200 relative overflow-hidden flex flex-col',
        activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
      )}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gray-200 pb-24 lg:pb-0">
        <div className="min-h-full py-2 flex justify-center">
          {activeDocumentMode === 'resume' ? <CVPreview /> : <CoverLetterPreview />}
        </div>
      </div>

      {/* Mobile download bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] flex">
        <div className="w-full">
          <DownloadDropdown className="w-full justify-center" variant="sheet" />
        </div>
      </div>
    </div>
  );
};
