'use client';

import { useMemo } from 'react';
import PaginatedPreview from '@/src/components/Resumes/Preview/PaginatedPreview';
import { isTemplateId } from '@/src/components/Resumes/Preview/templates/registry';
import { TEMPLATE_COMPONENTS } from '@/src/components/Resumes/Preview/templates/registry.generated';
import { COVER_LETTER_TEMPLATE_COMPONENTS, isCoverLetterTemplateId, mapCVDataToCLTemplateProps } from '@/src/components/CoverLetters/Preview/templates/registry';
import { type TemplateProps } from '@/src/types/resume';
import { ErrorState } from '@/src/components/ui/ErrorState';

function PdfRenderPageContent() {
  const exportPayload = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const w = window as Window & { __CV_EXPORT__?: { token?: string; template?: string; data?: TemplateProps } };
    return w.__CV_EXPORT__ ?? null;
  }, []);

  const templateKey = useMemo<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const w = window as Window & { __CV_EXPORT__?: { template?: string } };
    return w.__CV_EXPORT__?.template ?? new URLSearchParams(window.location.search).get('template');
  }, []);

  const data: TemplateProps | null = exportPayload?.data ?? null;

  const templateInfo = useMemo<{ type: 'resume' | 'cover-letter' | null; key: string | null }>(() => {
    if (!templateKey) return { type: null, key: null };
    if (templateKey.startsWith('r_')) return { type: 'resume', key: templateKey.slice(2) };
    if (templateKey.startsWith('cl_')) return { type: 'cover-letter', key: templateKey.slice(3) };
    if (isCoverLetterTemplateId(templateKey)) return { type: 'cover-letter', key: templateKey };
    if (isTemplateId(templateKey)) return { type: 'resume', key: templateKey };
    return { type: null, key: null };
  }, [templateKey]);

  const ResumeTemplateComponent = useMemo(() => {
    if (templateInfo.type !== 'resume' || !templateInfo.key) return null;
    return TEMPLATE_COMPONENTS[templateInfo.key];
  }, [templateInfo]);

  const CoverLetterTemplateComponent = useMemo(() => {
    if (templateInfo.type !== 'cover-letter' || !templateInfo.key) return null;
    return COVER_LETTER_TEMPLATE_COMPONENTS[templateInfo.key] ?? COVER_LETTER_TEMPLATE_COMPONENTS['soft-modern'];
  }, [templateInfo]);

  if (!templateInfo.key || !templateInfo.type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="w-full max-w-md">
          <ErrorState
            title="PDF Render Failed"
            message="Missing or invalid template"
            showRetry={false}
          />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="w-full max-w-md">
          <ErrorState
            title="No Data"
            message="No preview data available"
            showRetry={false}
          />
        </div>
      </div>
    );
  }

  const isExport = true;

  if (templateInfo.type === 'resume') {
    if (!ResumeTemplateComponent) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
          <div className="w-full max-w-md">
            <ErrorState
              title="PDF Render Failed"
              message="Missing or invalid template"
              showRetry={false}
            />
          </div>
        </div>
      );
    }

    return (
      <PaginatedPreview
        templateId={templateInfo.key}
        accentColor={data.theme.primaryColor}
        fontFamily={data.theme.fontFamily}
        fontSize={data.theme.fontSize}
        letterSpacing={data.theme.letterSpacing}
        lineSpacing={data.theme.lineSpacing}
        renderAll
        debounceTime={200}
        isExport={isExport}
      >
        <ResumeTemplateComponent {...data} />
      </PaginatedPreview>
    );
  }

  const clTheme = data.coverLetterTheme || data.theme;
  if (!CoverLetterTemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="w-full max-w-md">
          <ErrorState
            title="PDF Render Failed"
            message="Missing or invalid template"
            showRetry={false}
          />
        </div>
      </div>
    );
  }
  const props = mapCVDataToCLTemplateProps(data);

  return (
    <PaginatedPreview
      templateId={templateInfo.key}
      accentColor={clTheme.primaryColor || data.theme.primaryColor}
      fontFamily={clTheme.fontFamily || data.theme.fontFamily}
      fontSize={clTheme.fontSize || data.theme.fontSize}
      letterSpacing={clTheme.letterSpacing || data.theme.letterSpacing}
      lineSpacing={clTheme.lineSpacing || data.theme.lineSpacing}
      renderAll
      debounceTime={200}
      isExport={isExport}
    >
      <CoverLetterTemplateComponent {...props} />
    </PaginatedPreview>
  );
}

export default function PdfRenderPage() {
  return <PdfRenderPageContent />;
}
