
import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { cvData, selectedTemplate, activeDocumentMode, currentResumeTitle } = useCVStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizeNameForFilename = (value: string): string => {
    return value.trim().replace(/\.pdf$/i, '').replace(/\s*pdf$/i, '').trim() || 'CVRise';
  };

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
      const basePayload = isCoverLetter
        ? buildCoverLetterPayload(cvData)
        : buildCVPayload(cvData, selectedTemplate);
      const prefix = isCoverLetter ? 'cl_' : 'r_';
      const template =
        basePayload.template.startsWith('r_') || basePayload.template.startsWith('cl_')
          ? basePayload.template
          : `${prefix}${basePayload.template}`;
      const payload = { ...basePayload, template };
      const baseName = currentResumeTitle?.trim() ? currentResumeTitle : cvData.personalDetails?.fullName ?? '';
      const name = normalizeNameForFilename(baseName);
      const filename = `${name}_${isCoverLetter ? 'CoverLetter' : 'Resume'}.pdf`;
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
        type="button"
        onClick={() => setIsOpen(variant === 'dropdown' ? !isOpen : true)}
        disabled={isDownloading}
        aria-haspopup={variant === 'dropdown' ? 'menu' : 'dialog'}
        aria-expanded={variant === 'dropdown' ? isOpen : undefined}
        className={`bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-600 transition-colors ${className} ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Download className="w-4 h-4" />
        {isDownloading ? 'Generating...' : 'Export'}
        {variant === 'dropdown' && <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      <AnimatePresence>
        {isOpen && variant === 'dropdown' && (
          <motion.div
            initial={{ opacity: 0, y: menuDirection === 'up' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: menuDirection === 'up' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-700 py-1.5 z-[9999] min-w-[200px] ${
              menuDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            <div className="px-3 py-2 mb-1 border-b border-gray-50 dark:border-neutral-700/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                Export Options
              </span>
            </div>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-slate-700/50 flex items-center justify-between group transition-all disabled:opacity-50 disabled:cursor-not-allowed mx-1 rounded-lg w-[calc(100%-8px)]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                  <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 dark:text-slate-100">PDF Document</span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400">Best for sharing</span>
                </div>
              </div>
              {isDownloading && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-slate-900">Download as PDF</span>
                    <span className="text-sm text-slate-500">Export your current document</span>
                  </div>
                  {isDownloading ? <Loader2 className="ml-auto w-5 h-5 animate-spin text-primary-500" /> : null}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}
