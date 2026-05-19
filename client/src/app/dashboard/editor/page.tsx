"use client";

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useCVStore } from '@/src/store/useCVStore';
import { clsx } from 'clsx';
import { Eye, Edit3, ArrowLeft } from 'lucide-react';
import { resumeService } from '@/src/services/resumeService';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';
import { AIInsightsPanel } from '@/src/components/Resumes/Editor/AIInsightsPanel';
import { ROUTES } from '@/src/lib/routes';
import { EditorPreviewPanel } from '@/src/components/Resumes/Editor/EditorPreviewPanel';
import { EditorPageSkeleton } from '@/src/components/Resumes/Editor/EditorPageSkeleton';
import { EditorTopBar } from '@/src/components/Resumes/Editor/EditorTopBar';
import { EditorActivityRail } from '@/src/components/Resumes/Editor/EditorActivityRail';
import type { RailMode } from '@/src/components/Resumes/Editor/EditorActivityRail';
import { EditorLeftPanel } from '@/src/components/Resumes/Editor/EditorLeftPanel';

const AUTOSAVE_DEBOUNCE_MS = 1000;
const AUTOSAVE_MAX_WAIT_MS = 5000;

function EditorPageContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const router = useRouter();

  const {
    cvData,
    saveResume,
    currentResumeId,
    selectedTemplate,
    isDirty,
    activeDocumentMode,
    setDocumentMode,
    fetchTemplates,
    fetchCoverLetterTemplates,
    fetchDefaultResume,
    fetchResumeById,
    error,
    isLoading,
  } = useCVStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [railMode, setRailMode] = useState<RailMode>('sections');
  const [showLoadSampleConfirm, setShowLoadSampleConfirm] = useState(false);

  const isLoadError = error && !currentResumeId;

  useEffect(() => {
    fetchTemplates();
    fetchCoverLetterTemplates();
    if (source === 'cover-letter-history' && currentResumeId) return;
    if (currentResumeId) {
      fetchResumeById(currentResumeId);
    } else {
      fetchDefaultResume();
    }
  }, [fetchTemplates, fetchCoverLetterTemplates, source, currentResumeId, fetchResumeById, fetchDefaultResume]);

  const isDirtyRef = useRef(isDirty);
  const lastEditStartRef = useRef<number | null>(null);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    if (!currentResumeId || !isDirtyRef.current) return;

    if (lastEditStartRef.current === null) {
      lastEditStartRef.current = Date.now();
    }

    const elapsed = Date.now() - lastEditStartRef.current;
    const delay = Math.max(0, Math.min(AUTOSAVE_DEBOUNCE_MS, AUTOSAVE_MAX_WAIT_MS - elapsed));

    const handler = setTimeout(() => {
      lastEditStartRef.current = null;
      saveResume();
    }, delay);

    return () => clearTimeout(handler);
  }, [cvData, selectedTemplate, saveResume, currentResumeId]);

  const handleLoadSample = async () => {
    const sampleData = await resumeService.getSampleData();
    useCVStore.setState({
      cvData: { ...useCVStore.getState().cvData, ...sampleData },
      isDirty: true,
    });
  };

  if (isLoading) {
    return <EditorPageSkeleton activeTab={activeTab} activeDocumentMode={activeDocumentMode} />;
  }

  if (isLoadError) {
    const isNotFound = error === 'Resume not found';
    return (
      <div className="h-full p-8 bg-gray-50 flex items-center justify-center">
        <ErrorState
          title={isNotFound ? 'Resume Not Found' : 'Unable to load resume'}
          message={
            isNotFound
              ? 'The resume you are looking for does not exist or has been deleted.'
              : error
          }
          onRetry={
            isNotFound
              ? () => router.push(ROUTES.DASHBOARD)
              : () => (currentResumeId ? fetchResumeById(currentResumeId) : fetchDefaultResume())
          }
          retryLabel={isNotFound ? 'Return to Dashboard' : 'Retry'}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile tab bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-2 flex items-center gap-2 shrink-0 z-20 shadow-sm">
        <button
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className="flex items-center justify-center w-9 h-9 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={clsx(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'editor' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <Edit3 className="w-4 h-4" />
          Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={clsx(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2',
            activeTab === 'preview' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Desktop top bar */}
      <EditorTopBar
        activeDocumentMode={activeDocumentMode}
        setDocumentMode={setDocumentMode}
      />

      {/* Body row */}
      <div className="flex-1 flex overflow-hidden">
        <EditorActivityRail railMode={railMode} setRailMode={setRailMode} />

        <EditorLeftPanel
          railMode={railMode}
          setRailMode={setRailMode}
          activeTab={activeTab}
          activeDocumentMode={activeDocumentMode}
          setDocumentMode={setDocumentMode}
          aiPanelSlot={<AIInsightsPanel />}
          onLoadSampleClick={() => setShowLoadSampleConfirm(true)}
        />

        <EditorPreviewPanel activeTab={activeTab} activeDocumentMode={activeDocumentMode} />
      </div>

      <ConfirmModal
        isOpen={showLoadSampleConfirm}
        onClose={() => setShowLoadSampleConfirm(false)}
        onConfirm={() => { setShowLoadSampleConfirm(false); handleLoadSample(); }}
        title="Load Sample Data"
        message="This will replace your current resume content with sample data. Are you sure?"
        confirmLabel="Load Sample"
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading editor…</div>}>
      <EditorPageContent />
    </Suspense>
  );
}
