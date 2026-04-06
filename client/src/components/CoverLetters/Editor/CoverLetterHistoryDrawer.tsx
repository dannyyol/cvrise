import React, { useEffect } from 'react';
import { useCVStore } from '../../../store/useCVStore';
import { Clock, X } from 'lucide-react';

interface CoverLetterHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: { id: string }) => void;
}

export const CoverLetterHistoryDrawer: React.FC<CoverLetterHistoryDrawerProps> = ({ isOpen, onClose, onSelect }) => {
  const { cvData, coverLetterHistory, isHistoryLoading, historyError, fetchCoverLetterHistory, selectCoverLetterFromHistory } = useCVStore();
  const dateLocale = cvData.coverLetterTheme?.dateLocale || cvData.theme?.dateLocale || 'en-US';

  useEffect(() => {
    if (isOpen) {
      fetchCoverLetterHistory();
    }
  }, [isOpen, fetchCoverLetterHistory]);

  if (!isOpen) return null;

  const formatDate = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-xl border-l border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="font-medium text-slate-800">Cover Letter History</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-2 rounded-md hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isHistoryLoading && (
            <div className="text-sm text-slate-500">Loading history...</div>
          )}
          {historyError && (
            <div className="text-sm text-red-500">{historyError}</div>
          )}
          {!isHistoryLoading && !historyError && coverLetterHistory.length === 0 && (
            <div className="text-sm text-slate-500">No cover letters saved yet.</div>
          )}
          <div className="space-y-3">
            {coverLetterHistory.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  selectCoverLetterFromHistory(item);
                  if (onSelect) {
                    onSelect(item);
                  }
                  onClose();
                }}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="font-medium text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-500 mt-1">{item.jobTitle} {item.companyName ? `@ ${item.companyName}` : ''}</div>
                <div className="text-xs text-slate-400 mt-1">{formatDate(item.updatedAt || item.createdAt)}</div>
                <div className="text-sm text-slate-700 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.content }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
