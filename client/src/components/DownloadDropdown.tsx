
import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { exportResumeToPDF } from '@/src/services/pdfService';
import { useCVStore } from '@/src/store/useCVStore';
import { buildCVPayload, buildCoverLetterPayload } from '@/src/lib/payloadBuilder';
import { Toast, type ToastType } from '@/src/components/ui/Toast';

interface DownloadDropdownProps {
  className?: string;
  menuDirection?: 'up' | 'down';
  variant?: 'dropdown' | 'sheet';
}

export default function DownloadDropdown({ className = '', menuDirection = 'down', variant = 'dropdown' }: DownloadDropdownProps) {
  const { cvData, selectedTemplate, activeDocumentMode } = useCVStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== 'dropdown') return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [variant]);

  useEffect(() => {
    if (variant !== 'sheet' || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [variant, isOpen]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const isCoverLetter = activeDocumentMode === 'cover-letter';
      const payload = isCoverLetter
        ? buildCoverLetterPayload(cvData)
        : buildCVPayload(cvData, selectedTemplate);
      const filename = isCoverLetter ? 'cover-letter.pdf' : 'cv.pdf';
      await exportResumeToPDF(payload, filename);
      setToast({ message: `${isCoverLetter ? 'Cover letter' : 'Resume'} exported successfully!`, type: 'success', isVisible: true });
    } catch {
      setToast({ message: 'Failed to export PDF. Please try again.', type: 'error', isVisible: true });
    } finally {
      setIsDownloading(false);
    }
    setIsOpen(false);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
      />
      <button
        onClick={() => setIsOpen(variant === 'dropdown' ? !isOpen : true)}
        disabled={isDownloading}
        className={`bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-600 transition-colors ${className} ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Download className="w-4 h-4" />
        {isDownloading ? 'Generating...' : 'Export'}
        {variant === 'dropdown' && <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && variant === 'dropdown' && (
        <div
          className={`absolute right-0 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 py-1 z-[9999] min-w-[180px] ${
            menuDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            PDF
          </button>
        </div>
      )}
      {isOpen &&
        variant === 'sheet' &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="w-full max-w-md px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 relative">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="absolute right-2 top-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full px-4 py-4 flex items-center gap-4 text-left transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold text-xs tracking-wide">PDF</span>
                  </div>
                  <span className="text-base font-medium text-slate-900">Download as PDF</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
