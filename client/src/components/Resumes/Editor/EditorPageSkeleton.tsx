import { clsx } from 'clsx';
import { Edit3, Eye } from 'lucide-react';

interface EditorPageSkeletonProps {
  activeTab: 'editor' | 'preview';
  activeDocumentMode: 'resume' | 'cover-letter';
}

export const EditorPageSkeleton = ({ activeTab }: EditorPageSkeletonProps) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile tab bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-2 flex gap-2 shrink-0 shadow-sm">
        <button
          disabled
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 bg-blue-50 text-blue-600 opacity-60 cursor-not-allowed"
        >
          <Edit3 className="w-4 h-4" />
          Editor
        </button>
        <button
          disabled
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 text-gray-400 bg-gray-50 opacity-60 cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Desktop top bar skeleton */}
      <div className="hidden lg:flex h-12 bg-white border-b border-gray-200 items-center px-3 gap-3 shrink-0">
        <div className="h-7 w-7 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-4 w-px bg-gray-200" />
        <div className="h-4 w-48 bg-gray-100 rounded-full animate-pulse" />
        <div className="flex-1" />
        <div className="h-7 w-40 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-4 w-px bg-gray-200" />
        <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-7 w-28 bg-blue-50 rounded-lg animate-pulse" />
        <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity rail skeleton */}
        <div className="hidden lg:flex flex-col w-[52px] shrink-0 bg-white border-r border-gray-200 py-2 gap-1 items-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Editor panel skeleton */}
        <div
          className={clsx(
            'w-full lg:w-[460px] xl:w-[540px] shrink-0 flex flex-col overflow-hidden border-r border-gray-200 bg-white',
            activeTab === 'editor' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <div className="p-3 md:p-4 space-y-3 animate-pulse flex-1 overflow-hidden">
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
            <div className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl bg-slate-50" />
          </div>
        </div>

        {/* Preview panel skeleton */}
        <div
          className={clsx(
            'flex-1 bg-gray-200 overflow-hidden',
            activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <div className="w-full flex justify-center py-6 px-4">
            <div className="w-full max-w-[620px] aspect-[8.5/11] bg-white/70 border border-gray-300 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
