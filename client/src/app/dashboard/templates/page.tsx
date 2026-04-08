"use client";

import { useState, useEffect, useRef } from 'react';
import { useCVStore } from '@/src/store/useCVStore';
import { CVPreview } from '@/src/components/Resumes/Preview/CVPreview';
import { CoverLetterPreview } from '@/src/components/CoverLetters/Preview/CoverLetterPreview';
import { Check, LayoutTemplate, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '@/src/components/ui/Badge';
import { PageTitle } from '@/src/components/ui/PageTitle';
import { Card } from '@/src/components/ui/Card';
import DownloadDropdown from '@/src/components/DownloadDropdown';
import { isTemplateId } from '@/src/components/Resumes/Preview/templates/registry';
import { isCoverLetterTemplateId } from '@/src/components/CoverLetters/Preview/templates/registry';
import { ThemeSettingsForm } from '@/src/components/Resumes/Editor/Forms/ThemeSettingsForm';

export default function TemplatesPage () {
  const { 
    cvData, 
    selectedTemplate, 
    setTemplate, 
    templates, 
    fetchTemplates, 
    fetchDefaultResume, 
    currentResumeId, 
    saveResume,
    activeDocumentMode,
    setDocumentMode,
    coverLetterTemplates,
    fetchCoverLetterTemplates,
    updateCoverLetterTheme,
    updateCoverLetter
  } = useCVStore();
  
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await Promise.all([
        fetchTemplates(),
        fetchCoverLetterTemplates(),
        currentResumeId ? Promise.resolve() : fetchDefaultResume(),
      ]);
      if (!cancelled) {
        setIsPageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchTemplates, fetchCoverLetterTemplates, fetchDefaultResume, currentResumeId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isReady = !!currentResumeId;
  const isResumeMode = activeDocumentMode === 'resume';
  const isLoading = isPageLoading || !isReady;

  const supportedResumeTemplates = templates.filter(t => isTemplateId(t.key));
  const supportedCoverLetterTemplates = coverLetterTemplates.filter(t => isCoverLetterTemplateId(t.key));
  
  const currentTemplatesList = isResumeMode 
    ? supportedResumeTemplates 
    : supportedCoverLetterTemplates;
  
  const activeTemplateKey = isResumeMode 
    ? selectedTemplate 
    : (cvData.coverLetterTheme?.templateKey || cvData.coverLetter?.templateKey || 'soft-modern');

  const currentTemplate = isReady 
    ? currentTemplatesList.find(t => t.key === activeTemplateKey) 
    : undefined;

  const handleTemplateSelect = (key: string) => {
    if (isResumeMode) {
      if (!isTemplateId(key)) return;
      setTemplate(key);
    } else {
      if (!isCoverLetterTemplateId(key)) return;
      updateCoverLetterTheme({ templateKey: key });
      updateCoverLetter({ templateKey: key });
    }
    saveResume();
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50/50 font-sans">
      {/* Sidebar - Template Selection & Customization */}
      <div className="w-full lg:w-1/2 xl:w-5/12 bg-white flex flex-col h-full overflow-y-auto shrink-0 z-20 scrollbar-thin scrollbar-thumb-slate-200">
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-10">
          <div>
            <PageTitle
              as="h2"
              title="Templates"
              icon={<LayoutTemplate className="w-7 h-7" />}
              description="Choose a professional design that highlights your strengths."
            />
          </div>
          {/* Customization Panel */}
          
          {isLoading ? (
            <>
              <div className="space-y-4 animate-pulse">
                <div className="h-5 w-40 bg-slate-200 rounded-lg" />
                <div className="h-10 w-full bg-slate-100 rounded-xl" />
                <div className="h-10 w-5/6 bg-slate-100 rounded-xl" />
              </div>

              <section className="animate-pulse">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">
                  Select {isResumeMode ? 'Resume' : 'Cover Letter'} Template
                </h2>
                <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                      <div className="w-full aspect-[210/297] bg-slate-100 border-b border-slate-100" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 w-2/3 bg-slate-200 rounded-full" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <ThemeSettingsForm />
              <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">
                  Select {isResumeMode ? 'Resume' : 'Cover Letter'} Template
                </h2>
                <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                  {currentTemplatesList.map((template) => (
                    <Card
                      key={template.id || template.key}
                      variant="accordion"
                      topBorder
                      shadow={false}
                      className={clsx(
                        "group relative transition-all duration-200 overflow-hidden cursor-pointer",
                        isReady && activeTemplateKey === template.key
                          ? "border-blue-600 ring-4 ring-blue-500/10"
                          : "hover:border-slate-300"
                      )}
                      onClick={() => handleTemplateSelect(template.key)}
                    >
                      <div className="w-full aspect-[210/297] bg-slate-100 relative overflow-hidden border-b border-slate-100">
                          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-300">
                              <LayoutTemplate className="w-12 h-12 opacity-20" />
                          </div>

                        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-300">
                            <LayoutTemplate className="w-12 h-12 opacity-20" />
                       </div>
                   {/* Selected Overlay */}
                        {isReady && activeTemplateKey === template.key && (
                          <div className="absolute inset-0 bg-blue-900/5 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="bg-blue-600 text-white p-2.5 rounded-full shadow-xl">
                              <Check className="w-5 h-5" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 w-full bg-white">
                        <div className="flex flex-col gap-1.5 w-full">
                          <h3 className={clsx(
                            "font-bold text-sm tracking-tight",
                            isReady && activeTemplateKey === template.key ? "text-blue-700" : "text-slate-900"
                          )}>
                            {template.name}
                          </h3>
                          {isReady && activeTemplateKey === template.key ? (
                            <Badge variant="default" className="font-bold uppercase tracking-wide w-fit">
                              Active
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium line-clamp-1">
                              {(() => {
                                const description = (template as { description?: unknown }).description;
                                if (typeof description === 'string' && description.trim()) return description;
                                return 'Professional Layout';
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 relative bg-slate-100/50 flex flex-col h-full overflow-hidden">
        {/* Preview Toolbar */}
        <div className="h-20 bg-white/80 backdrop-blur-md border-b border-l border-slate-200/60 px-4 flex justify-between items-center shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3 relative" ref={modeDropdownRef}>
            <button
              onClick={() => {
                if (isLoading) return;
                setIsModeDropdownOpen(!isModeDropdownOpen);
              }}
              disabled={isLoading}
              aria-disabled={isLoading ? "true" : "false"}
              className={clsx(
                "flex items-center gap-2 group",
                isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              )}
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Previewing</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {isResumeMode ? 'Resume' : 'Cover Letter'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </button>

            {isModeDropdownOpen && !isLoading && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { setDocumentMode('resume'); setIsModeDropdownOpen(false); }}
                  className={clsx("w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center justify-between transition-colors", activeDocumentMode === 'resume' ? "text-blue-600 font-medium bg-blue-50/50" : "text-slate-700")}
                >
                  Resume
                  {activeDocumentMode === 'resume' && <Check className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => { setDocumentMode('cover-letter'); setIsModeDropdownOpen(false); }}
                  className={clsx("w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center justify-between transition-colors", activeDocumentMode === 'cover-letter' ? "text-blue-600 font-medium bg-blue-50/50" : "text-slate-700")}
                >
                  Cover Letter
                  {activeDocumentMode === 'cover-letter' && <Check className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="h-8 w-px bg-slate-200 mx-1" />
            <span className="text-sm text-slate-900 font-bold truncate max-w-[200px]">{currentTemplate?.name || 'Selected'} Template</span>
          </div>
          <div className={clsx(isLoading && "opacity-60 pointer-events-none")}>
            <DownloadDropdown />
          </div>
        </div>

        {/* CV Preview Container */}
        <div className="flex-1 overflow-y-auto overflow-x-auto relative bg-gray-200 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
          <div className="min-h-full py-2 flex justify-center relative z-0">
              {isLoading ? (
                <div className="w-full max-w-[720px] px-4 py-6">
                  <div className="aspect-[8.5/11] bg-white/70 border border-gray-300 rounded-lg animate-pulse" />
                </div>
              ) : isResumeMode ? (
                <CVPreview scaleMode="fill" />
              ) : (
                <CoverLetterPreview scaleMode="fill" />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
