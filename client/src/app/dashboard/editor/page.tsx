"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useCVStore } from '@/src/store/useCVStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { clsx } from 'clsx';
import { Eye, Edit3, FileText, Briefcase, Layout, LayoutTemplate } from 'lucide-react';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { CoverLetterForm } from '@/src/components/CoverLetters/Editor/Forms/CoverLetterForm';
import { AIAnalysis } from '@/src/components/Resumes/Editor/AIAnalysis';
import type { CoverLetterTemplateId } from '@/src/types/resume';
import { Plus } from 'lucide-react';
import { JobContextModal } from '@/src/components/Resumes/Editor/JobContextModal';
import { PageTitle } from '@/src/components/ui/PageTitle';
import { ROUTES } from '@/src/lib/routes';
import { ADDITIONAL_SECTIONS, DEFAULT_SECTIONS } from '@/src/components/Resumes/Editor/sectionConfig';
import { SortableSectionItem } from '@/src/components/Resumes/Editor/SortableSectionItem';
import { EditorPreviewPanel } from '@/src/components/Resumes/Editor/EditorPreviewPanel';
import { EditorPageSkeleton } from '@/src/components/Resumes/Editor/EditorPageSkeleton';

export default function EditorPage() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const router = useRouter();
  const { cvData, setSections, saveResume, currentResumeId, selectedTemplate, isDirty, toggleSectionVisibility, activeDocumentMode, setDocumentMode, generateCoverLetter, tailorResume, fetchTemplates, fetchCoverLetterTemplates, fetchDefaultResume, fetchResumeById, error, isLoading, templates, coverLetterTemplates } = useCVStore();
  const currentTemplateName = useMemo(() => {
    if (activeDocumentMode === 'resume') {
      const template = templates.find(t => t.key === selectedTemplate);
      return template?.name;
    } else {
      const templateKey = cvData.coverLetter?.templateKey;
      const template = coverLetterTemplates.find(t => t.key === templateKey);
      return template?.name
    }
  }, [activeDocumentMode, templates, coverLetterTemplates, selectedTemplate, cvData.coverLetterTheme, cvData.coverLetter]);

  const [openSectionId, setOpenSectionId] = useState<string | null>('personal');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showAdditionalSections, setShowAdditionalSections] = useState(false);
  const [isJobContextOpen, setIsJobContextOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  const isLoadError = error && !currentResumeId;
  const isResumeMode = activeDocumentMode === 'resume';

  const sidebarSectionKeys = useMemo(() => {
    const template = templates.find(t => t.key === selectedTemplate);
    return template?.sidebar_section_keys ?? [];
  }, [templates, selectedTemplate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchCoverLetterTemplates();
    if (source === 'cover-letter-history' && currentResumeId) {
      return;
    }
    if (currentResumeId) {
      fetchResumeById(currentResumeId);
    } else {
      fetchDefaultResume();
    }
  }, [fetchTemplates, fetchCoverLetterTemplates, source, currentResumeId, fetchResumeById, fetchDefaultResume]);

  useEffect(() => {
    if (!currentResumeId || !isDirty) return;

    const handler = setTimeout(() => {
      saveResume();
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [cvData, selectedTemplate, saveResume, currentResumeId, isDirty]);

  const handleJobContextGenerate = async (
    jobTitle: string,
    jobDescription: string,
    options: {
      tailorResume: boolean;
      generateCoverLetter: boolean;
      templateKey: CoverLetterTemplateId;
    }
  ) => {
    if (options.generateCoverLetter) {
      const company = jobTitle.split(' at ')[1] || 'Target Company';
      await generateCoverLetter({
        title: `${jobTitle} @ ${company}`,
        jobTitle,
        jobDescription,
        recipientName: 'Hiring Manager',
        recipientTitle: 'Hiring Manager',
        companyName: company,
        companyAddress: '',
        templateKey: options.templateKey,
      });
      setDocumentMode('cover-letter');
    }

    if (options.tailorResume) {
      await tailorResume({
        jobTitle,
        jobDescription,
        tone: 'professional',
      });
      if (!options.generateCoverLetter) {
        setDocumentMode('resume');
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeSection = cvData.sections.find((s) => s.id === active.id);
    const overSection = cvData.sections.find((s) => s.id === over.id);

    if (!activeSection || !overSection) return;

    if (sidebarSectionKeys.length > 0) {
      const activeIsSidebar = sidebarSectionKeys.includes(activeSection.type);
      const overIsSidebar = sidebarSectionKeys.includes(overSection.type);
      if (activeIsSidebar !== overIsSidebar) return;
    }

    const oldIndex = cvData.sections.findIndex((s) => s.id === active.id);
    const newIndex = cvData.sections.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newSections = arrayMove(cvData.sections, oldIndex, newIndex);
    
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setSections(reorderedSections);
  };

  const handleToggle = (id: string) => {
      setOpenSectionId(openSectionId === id ? null : id);
  };

  const orderedEditorSections = cvData.sections
    .filter(s =>
      DEFAULT_SECTIONS.includes(s.type as (typeof DEFAULT_SECTIONS)[number]) ||
      (ADDITIONAL_SECTIONS.includes(s.type as (typeof ADDITIONAL_SECTIONS)[number]) && s.isVisible)
    )
    .sort((a, b) => a.order - b.order);

  const mainEditorSections = orderedEditorSections.filter(
    (s) => !sidebarSectionKeys.includes(s.type)
  );

  const sidebarEditorSections = orderedEditorSections.filter((s) =>
    sidebarSectionKeys.includes(s.type)
  );

  const combinedEditorSections =
    sidebarSectionKeys.length > 0
      ? [...mainEditorSections, ...sidebarEditorSections]
      : orderedEditorSections;

  const hasVisibleAdditionalSections = cvData.sections.some(
    s => ADDITIONAL_SECTIONS.includes(s.type as (typeof ADDITIONAL_SECTIONS)[number]) && s.isVisible
  );

  const availableSectionsList = cvData.sections.filter(
    s => ADDITIONAL_SECTIONS.includes(s.type as (typeof ADDITIONAL_SECTIONS)[number]) && !s.isVisible
  );

  if (isLoading) {
    return (
      <EditorPageSkeleton
        activeTab={activeTab}
        activeDocumentMode={activeDocumentMode}
        isModeDropdownOpen={isModeDropdownOpen}
        setIsModeDropdownOpen={setIsModeDropdownOpen}
        modeDropdownRef={modeDropdownRef}
        setDocumentMode={setDocumentMode}
        currentTemplateName={currentTemplateName}
      />
    );
  }

  if (isLoadError) {
    const isNotFound = error === 'Resume not found';
    return (
      <div className="h-full p-8 bg-gray-50 flex items-center justify-center">
        <ErrorState
          title={isNotFound ? "Resume Not Found" : "Unable to load resume"}
          message={isNotFound ? "The resume you are looking for does not exist or has been deleted." : error}
          onRetry={isNotFound ? () => router.push(ROUTES.DASHBOARD) : () => currentResumeId ? fetchResumeById(currentResumeId) : fetchDefaultResume()}
          retryLabel={isNotFound ? "Return to Dashboard" : "Retry"}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row relative overflow-hidden">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-2 flex gap-2 shrink-0 z-20 shadow-sm">
        <button 
          onClick={() => setActiveTab('editor')}
          className={clsx(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'editor' ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Edit3 className="w-4 h-4" />
          Editor
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={clsx(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'preview' ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Editor Panel */}
      <div className={clsx(
        "w-full lg:w-1/2 xl:w-5/12 flex-1 lg:h-full overflow-hidden flex flex-col lg:border-r border-slate-200/60 bg-white",
        activeTab === 'editor' ? 'flex' : 'hidden lg:flex'
      )}>
        <JobContextModal 
            isOpen={isJobContextOpen} 
            onClose={() => setIsJobContextOpen(false)} 
            onGenerate={handleJobContextGenerate} 
        />

        <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 relative flex items-center justify-center shrink-0 z-10">
           {/* Document Switcher */}
           <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner">
              <button
                onClick={() => setDocumentMode('resume')}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeDocumentMode === 'resume' 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                <FileText className={clsx("w-4 h-4", activeDocumentMode === 'resume' ? "text-blue-600" : "text-slate-400")} />
                Resume
              </button>
              <button
                onClick={() => setDocumentMode('cover-letter')}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeDocumentMode === 'cover-letter' 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                <Layout className={clsx("w-4 h-4", activeDocumentMode === 'cover-letter' ? "text-blue-600" : "text-slate-400")} />
                Cover Letter
              </button>
           </div>

           {/* Tailor to Job Button */}
           <div className="absolute right-4 top-1/2 -translate-y-1/2">
             <Tooltip content="Tailor to Job" position="bottom">
               <button
                 onClick={() => setIsJobContextOpen(true)}
                 className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all border border-blue-200 shadow-none hover:shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
               >
                 <Briefcase className="w-4 h-4" />
               </button>
             </Tooltip>
           </div>
        </div>

        <div className="p-3 md:p-4 flex-1 overflow-y-auto">
          <div className="mb-4 flex justify-between items-start">
              <div className='flex justify-between gap-2'>
                <PageTitle
                    as="h2"
                    title={activeDocumentMode === 'resume' ? 'Resume Editor' : 'Cover Letter'}
                    icon={<LayoutTemplate className="w-7 h-7" />}
                    description={activeDocumentMode === 'resume' 
                        ? 'Customize your CV content and layout.' 
                        : 'Draft a compelling cover letter.'}
                  /> 
              </div>
              <div className="hidden lg:flex items-center">
                <Tooltip content="Tailor to Job" position="bottom">
                  <button
                    onClick={() => setIsJobContextOpen(true)}
                    className="flex items-center justify-center w-9 h-9 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all border border-blue-200 shadow-none hover:shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                  >
                    <Briefcase className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
          </div>

          {activeDocumentMode === 'resume' ? (
            <>
                <AIAnalysis />

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                      items={combinedEditorSections}
                      strategy={verticalListSortingStrategy}
                    >
                      {sidebarSectionKeys.length > 0 ? (
                        <>
                          {mainEditorSections.length > 0 && (
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">
                              Main Column
                            </div>
                          )}
                          {mainEditorSections.map((section) => (
                            <SortableSectionItem
                              key={section.id}
                              section={section}
                              isOpen={openSectionId === section.id}
                              onToggle={() => handleToggle(section.id)}
                              columnLabel="Main"
                            />
                          ))}
                          {sidebarEditorSections.length > 0 && (
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-3">
                              Sidebar
                            </div>
                          )}
                          {sidebarEditorSections.map((section) => (
                            <SortableSectionItem
                              key={section.id}
                              section={section}
                              isOpen={openSectionId === section.id}
                              onToggle={() => handleToggle(section.id)}
                              columnLabel="Sidebar"
                            />
                          ))}
                        </>
                      ) : (
                        combinedEditorSections.map((section) => (
                          <SortableSectionItem
                            key={section.id}
                            section={section}
                            isOpen={openSectionId === section.id}
                            onToggle={() => handleToggle(section.id)}
                          />
                        ))
                      )}
                    </SortableContext>

                    <div className="my-6 border-t border-gray-200 pt-5">
                      {!showAdditionalSections ? (
                        <button
                          onClick={() => setShowAdditionalSections(true)}
                          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                        >
                          <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="font-medium">Add Additional Section</span>
                        </button>
                      ) : (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Additional Sections</h3>
                            <button 
                              onClick={() => setShowAdditionalSections(false)}
                              className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
                            >
                              Hide
                            </button>
                          </div>
                          
                          {!hasVisibleAdditionalSections && availableSectionsList.length === 0 && (
                            <p className="text-sm text-gray-500 mb-4 italic">
                              All sections are already added and visible above.
                            </p>
                          )}

                          {availableSectionsList.length > 0 && (
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Available Sections</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {availableSectionsList.map(section => (
                                  <button
                                    key={section.id}
                                    onClick={() => toggleSectionVisibility(section.id)}
                                    className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm text-gray-600 group"
                                  >
                                    <div className="bg-gray-100 rounded-full p-1 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                      <Plus className="w-3 h-3" />
                                    </div>
                                    {section.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                </DndContext>
            </>
          ) : (
            <>
              <CoverLetterForm />
            </>
          )}
        </div>
      </div>

      <EditorPreviewPanel
        activeTab={activeTab}
        modeDropdownRef={modeDropdownRef}
        isModeDropdownOpen={isModeDropdownOpen}
        setIsModeDropdownOpen={setIsModeDropdownOpen}
        isResumeMode={isResumeMode}
        setDocumentMode={setDocumentMode}
        currentTemplateName={currentTemplateName}
        activeDocumentMode={activeDocumentMode}
      />
    </div>
  );
};
