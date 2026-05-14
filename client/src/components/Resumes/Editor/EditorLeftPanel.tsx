"use client";

import { type ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { clsx } from 'clsx';
import {
  FileText, Layout, Sparkles, Plus, Check, LayoutTemplate, Wand2,
} from 'lucide-react';
import { CoverLetterForm } from '@/src/components/CoverLetters/Editor/Forms/CoverLetterForm';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { isTemplateId } from '@/src/components/Resumes/Preview/templates/registry';
import { isCoverLetterTemplateId } from '@/src/components/CoverLetters/Preview/templates/registry';
import { useCVStore } from '@/src/store/useCVStore';
import { ThemeSettingsForm } from './Forms/ThemeSettingsForm';
import { SortableSectionItem } from './SortableSectionItem';
import { useEditorSections } from './useEditorSections';
import type { RailMode } from './EditorActivityRail';

// ─── Design Panel ─────────────────────────────────────────────────────────────

function DesignPanel() {
  const {
    cvData,
    selectedTemplate,
    setTemplate,
    templates,
    coverLetterTemplates,
    activeDocumentMode,
    updateCoverLetterTheme,
    updateCoverLetter,
  } = useCVStore();

  const isResumeMode = activeDocumentMode === 'resume';
  const activeTemplateKey = isResumeMode
    ? selectedTemplate
    : (cvData.coverLetterTheme?.templateKey ?? cvData.coverLetter?.templateKey ?? 'soft-modern');
  const currentTemplatesList = isResumeMode
    ? templates.filter((t) => isTemplateId(t.key))
    : coverLetterTemplates.filter((t) => isCoverLetterTemplateId(t.key));

  const handleTemplateSelect = (key: string) => {
    if (isResumeMode) {
      if (!isTemplateId(key)) return;
      setTemplate(key);
    } else {
      if (!isCoverLetterTemplateId(key)) return;
      updateCoverLetterTheme({ templateKey: key });
      updateCoverLetter({ templateKey: key });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <ThemeSettingsForm />
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">
          {isResumeMode ? 'Resume' : 'Cover Letter'} Templates
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {currentTemplatesList.map((template) => {
            const isActive = activeTemplateKey === template.key;
            return (
              <Card
                key={template.id ?? template.key}
                variant="accordion"
                topBorder
                shadow={false}
                className={clsx(
                  'group relative transition-all duration-200 overflow-hidden cursor-pointer',
                  isActive ? 'border-blue-600 ring-4 ring-blue-500/10' : 'hover:border-slate-300'
                )}
                onClick={() => handleTemplateSelect(template.key)}
              >
                <div className="w-full aspect-[210/297] bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <LayoutTemplate className="w-10 h-10 opacity-20" />
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 bg-blue-900/5 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="bg-blue-600 text-white p-2 rounded-full shadow-xl">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <h3 className={clsx('font-bold text-sm tracking-tight truncate', isActive ? 'text-blue-700' : 'text-slate-900')}>
                    {template.name}
                  </h3>
                  {isActive ? (
                    <Badge variant="default" className="font-bold uppercase tracking-wide text-[10px] mt-1 w-fit">
                      Active
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5 block">
                      {typeof (template as { description?: unknown }).description === 'string'
                        ? (template as { description: string }).description
                        : 'Professional Layout'}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ─── EditorLeftPanel ──────────────────────────────────────────────────────────

export interface EditorLeftPanelProps {
  railMode: RailMode;
  setRailMode: (mode: RailMode) => void;
  activeTab: 'editor' | 'preview';
  activeDocumentMode: 'resume' | 'cover-letter';
  setDocumentMode: (mode: 'resume' | 'cover-letter') => void;
  aiPanelSlot: ReactNode;
  aiPanelSubtitle?: string;
  topBannerSlot?: ReactNode;
  onLoadSampleClick: () => void;
}

export function EditorLeftPanel({
  railMode,
  setRailMode,
  activeTab,
  activeDocumentMode,
  setDocumentMode,
  aiPanelSlot,
  aiPanelSubtitle = 'Analyse and optimise your CV',
  topBannerSlot,
  onLoadSampleClick,
}: EditorLeftPanelProps) {
  const { toggleSectionVisibility } = useCVStore();

  const {
    sensors,
    sidebarSectionKeys,
    collapsedSectionIds,
    showAdditionalSections,
    setShowAdditionalSections,
    handleDragEnd,
    handleToggle,
    mainEditorSections,
    sidebarEditorSections,
    combinedEditorSections,
    hasVisibleAdditionalSections,
    availableSectionsList,
  } = useEditorSections();

  const showSectionsPanel =
    railMode === 'sections' ||
    (activeDocumentMode === 'cover-letter' && railMode !== 'design');

  return (
    <div
      className={clsx(
        'w-full lg:w-[460px] xl:w-[540px] shrink-0 flex flex-col overflow-hidden border-r border-gray-200 bg-white',
        activeTab === 'editor' ? 'flex' : 'hidden lg:flex'
      )}
    >
      {/* Mobile header: doc mode + AI toggle */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setDocumentMode('resume')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeDocumentMode === 'resume'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <FileText className={clsx('w-4 h-4', activeDocumentMode === 'resume' ? 'text-blue-600' : 'text-slate-400')} />
            Resume
          </button>
          <button
            onClick={() => setDocumentMode('cover-letter')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeDocumentMode === 'cover-letter'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Layout className={clsx('w-4 h-4', activeDocumentMode === 'cover-letter' ? 'text-blue-600' : 'text-slate-400')} />
            Cover Letter
          </button>
        </div>

        {activeDocumentMode === 'resume' && (
          <button
            onClick={() => setRailMode(railMode === 'ai' ? 'sections' : 'ai')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
              railMode === 'ai'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI
          </button>
        )}
      </div>

      {topBannerSlot}

      {/* Panel body */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── AI Insights ── */}
        {railMode === 'ai' && activeDocumentMode === 'resume' && (
          <>
            <div className="shrink-0 px-[18px] pt-[18px] pb-3.5 border-b border-gray-100">
              <p className="text-[15px] font-bold text-gray-900">AI Insights</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{aiPanelSubtitle}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {aiPanelSlot}
            </div>
          </>
        )}

        {/* ── Design ── */}
        {railMode === 'design' && (
          <>
            <div className="shrink-0 px-[18px] pt-[18px] pb-3.5 border-b border-gray-100">
              <p className="text-[15px] font-bold text-gray-900">Design &amp; Templates</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Choose a layout and style</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DesignPanel />
            </div>
          </>
        )}

        {/* ── Sections / Cover Letter ── */}
        {showSectionsPanel && (
          <>
            <div className="shrink-0 px-[18px] pt-[18px] pb-3.5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-gray-900">
                  {activeDocumentMode === 'resume' ? 'Resume Sections' : 'Cover Letter'}
                </p>
                {activeDocumentMode === 'resume' && (
                  <button
                    onClick={onLoadSampleClick}
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Wand2 className="w-3 h-3" />
                    Load Sample
                  </button>
                )}
              </div>
              {activeDocumentMode === 'resume' && (
                <p className="text-[12px] text-gray-400 mt-0.5">Drag to reorder · Click to expand</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-3 md:p-[14px]">
                {activeDocumentMode === 'resume' ? (
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
                              isOpen={!collapsedSectionIds.includes(section.id)}
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
                              isOpen={!collapsedSectionIds.includes(section.id)}
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
                            isOpen={!collapsedSectionIds.includes(section.id)}
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
                                {availableSectionsList.map((section) => (
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
                ) : (
                  <CoverLetterForm />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
