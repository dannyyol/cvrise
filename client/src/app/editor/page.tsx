"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '@/src/context/AuthContext';
import { useCVStore, initialCVData } from '@/src/store/useCVStore';
import { resumeService } from '@/src/services/resumeService';
import { LoginModal } from '@/src/components/Auth/LoginModal';
import { GuestAIInsightsPanel } from '@/src/components/Resumes/Editor/GuestAIInsightsPanel';
import { clsx } from 'clsx';
import { Eye, Edit3, ArrowLeft, CloudUpload } from 'lucide-react';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';
import { EditorPreviewPanel } from '@/src/components/Resumes/Editor/EditorPreviewPanel';
import { EditorPageSkeleton } from '@/src/components/Resumes/Editor/EditorPageSkeleton';
import { EditorActivityRail } from '@/src/components/Resumes/Editor/EditorActivityRail';
import type { RailMode } from '@/src/components/Resumes/Editor/EditorActivityRail';
import { EditorLeftPanel } from '@/src/components/Resumes/Editor/EditorLeftPanel';
import DownloadDropdown from '@/src/components/DownloadDropdown';
import { ROUTES } from '@/src/lib/routes';
import { GUEST_SECTIONS } from '@/src/components/Resumes/Editor/sectionConfig';


function GuestEditorTopBar({
  activeDocumentMode,
  setDocumentMode,
  onSaveClick,
}: {
  activeDocumentMode: 'resume' | 'cover-letter';
  setDocumentMode: (mode: 'resume' | 'cover-letter') => void;
  onSaveClick: () => void;
}) {
  const isResumeMode = activeDocumentMode === 'resume';

  return (
    <div
      className="hidden lg:flex h-14 bg-white border-b border-gray-200 items-center px-4 shrink-0 z-30 relative"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-0 text-gray-900 hover:text-[#04659A] transition-colors shrink-0"
        >
          <Image
            src="/images/blue-logo.png"
            alt="CVRise"
            width={28}
            height={28}
            className="w-8 h-8 block shrink-0 -mr-0.5"
            priority
          />
          <span className="text-[1.2rem] font-extrabold tracking-[-0.03em]">
            CV<span className="text-primary-500">Rise</span>
          </span>
        </Link>
        <div className="h-4 w-px bg-gray-200 shrink-0" />
        <span className="text-sm text-gray-400 truncate">Guest Editor</span>
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

      <div className="flex items-center gap-3 flex-1 justify-end">
        <button
          onClick={onSaveClick}
          className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg bg-[#04659A] text-white text-sm font-semibold hover:bg-[#03517A] transition-colors"
        >
          <CloudUpload className="w-4 h-4" />
          Save
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <DownloadDropdown />
      </div>
    </div>
  );
}

function GuestEditorContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    cvData,
    activeDocumentMode,
    setDocumentMode,
    fetchTemplates,
    fetchCoverLetterTemplates,
  } = useCVStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [railMode, setRailMode] = useState<RailMode>('sections');
  const [showLoadSampleConfirm, setShowLoadSampleConfirm] = useState(false);

  useEffect(() => {
    if (authLoading || isSavingDraft) return;
    if (isAuthenticated) {
      router.replace(ROUTES.EDITOR);
      return;
    }

    if (cvData.sections.length === 0) {
      useCVStore.setState({
        cvData: { ...initialCVData, sections: GUEST_SECTIONS },
        currentResumeId: null,
        currentResumeTitle: null,
        isDirty: false,
        isLoading: false,
        isSaving: false,
        error: null,
        aiAnalysis: null,
      });
    }
  }, [isAuthenticated, authLoading, isSavingDraft, router, cvData.sections.length]);

  useEffect(() => {
    useCVStore.setState({
      cvData: { ...initialCVData, sections: GUEST_SECTIONS },
      currentResumeId: null,
      currentResumeTitle: null,
      isDirty: false,
      isLoading: false,
      isSaving: false,
      error: null,
      aiAnalysis: null,
    });
    fetchTemplates();
    fetchCoverLetterTemplates();
  }, [fetchTemplates, fetchCoverLetterTemplates]);

  if (authLoading || cvData.sections.length === 0) {
    return <EditorPageSkeleton activeTab={activeTab} activeDocumentMode={activeDocumentMode} />;
  }

  const handleLoadSample = async () => {
    const sampleData = await resumeService.getSampleData();
    useCVStore.setState({
      cvData: { ...initialCVData, ...sampleData, sections: sampleData.sections ?? GUEST_SECTIONS },
      isDirty: false,
    });
  };

  const handleLoginSuccess = async () => {
    const { cvData: guestCvData, selectedTemplate: tpl } = useCVStore.getState();

    setIsLoginOpen(false);
    setIsSavingDraft(true);

    let createdId: string | null = null;
    let createdTitle: string | null = null;

    try {
      const fullName = guestCvData.personalDetails?.fullName?.trim();
      const title = fullName ? `${fullName}'s Resume` : 'Untitled Resume';

      const created = await resumeService.createResume(title, tpl);
      createdId = created.id;
      createdTitle = created.title;

      await resumeService.updateResume(created.id, {
        ...guestCvData,
        volunteering: guestCvData.volunteering ?? [],
        references: guestCvData.references ?? [],
        custom: guestCvData.custom ?? [],
        id: created.id,
        title: created.title,
        template_id: tpl,
        template_key: tpl,
        createdAt: created.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } catch {}
    finally {
      if (createdId) {
        useCVStore.setState({
          currentResumeId: createdId,
          currentResumeTitle: createdTitle,
          isDirty: false,
        });
      }

      setIsSavingDraft(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Saving draft overlay */}
      {isSavingDraft && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#04659A]/10 flex items-center justify-center">
            <CloudUpload className="w-6 h-6 text-[#04659A] animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Saving your resume…</p>
          <p className="text-xs text-gray-400">Just a moment</p>
        </div>
      )}

      {/* Mobile tab bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-2 flex items-center gap-2 shrink-0 z-20 shadow-sm">
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-md text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
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

      <GuestEditorTopBar
        activeDocumentMode={activeDocumentMode}
        setDocumentMode={setDocumentMode}
        onSaveClick={() => setIsLoginOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <EditorActivityRail railMode={railMode} setRailMode={setRailMode} />

        <EditorLeftPanel
          railMode={railMode}
          setRailMode={setRailMode}
          activeTab={activeTab}
          activeDocumentMode={activeDocumentMode}
          setDocumentMode={setDocumentMode}
          aiPanelSlot={<GuestAIInsightsPanel onLoginClick={() => setIsLoginOpen(true)} />}
          aiPanelSubtitle="Sign in to analyse and optimise your CV"
          topBannerSlot={
            <div className="lg:hidden border-b border-amber-100 bg-amber-50 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
              <p className="text-xs text-amber-700 leading-relaxed">
                Sign in to save your CV and unlock AI features.
              </p>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="shrink-0 text-xs font-semibold text-white bg-[#04659A] hover:bg-[#03517A] px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign in
              </button>
            </div>
          }
          onLoadSampleClick={() => setShowLoadSampleConfirm(true)}
        />

        <EditorPreviewPanel activeTab={activeTab} activeDocumentMode={activeDocumentMode} />
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

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

export default function GuestEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading editor…</div>}>
      <GuestEditorContent />
    </Suspense>
  );
}
