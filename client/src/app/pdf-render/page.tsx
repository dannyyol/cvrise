'use client';

import { useEffect, useMemo, useState } from 'react';
import PaginatedPreview from '@/src/components/Resumes/Preview/PaginatedPreview';
import { getTemplateComponent, isTemplateId, type TemplateId } from '@/src/components/Resumes/Preview/templates/registry';
import { getCoverLetterTemplateComponent, isCoverLetterTemplateId, mapCVDataToCLTemplateProps } from '@/src/components/CoverLetters/Preview/templates/registry';
import { type CoverLetterTemplateId, type TemplateProps } from '@/src/types/resume';
import { api } from '@/src/lib/apiClient';
import { ErrorState } from '@/src/components/ui/ErrorState';

function PdfRenderPageContent() {
  const exportPayload = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const w = window as Window & { __CV_EXPORT__?: { token?: string; template?: string; data?: TemplateProps } };
    return w.__CV_EXPORT__ ?? null;
  }, []);

  const [templateKey] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const w = window as Window & { __CV_EXPORT__?: { template?: string } };
    return w.__CV_EXPORT__?.template ?? new URLSearchParams(window.location.search).get('template');
  });

  const [token] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const w = window as Window & { __CV_EXPORT__?: { token?: string } };
    return w.__CV_EXPORT__?.token ?? new URLSearchParams(window.location.search).get('token');
  });

  const [loading, setLoading] = useState(() => !(exportPayload?.data));
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TemplateProps | null>(() => exportPayload?.data ?? null);

  const templateType = useMemo<'resume' | 'cover-letter' | null>(() => {
    if (!templateKey) return null;
    if (isTemplateId(templateKey)) return 'resume';
    if (isCoverLetterTemplateId(templateKey)) return 'cover-letter';
    return null;
  }, [templateKey]);

  useEffect(() => {
    if (!token) {
      setError('Missing token');
      setLoading(false);
      return;
    }
    if (data) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        if (!templateKey) {
          throw new Error('Missing template');
        }
        if (!isTemplateId(templateKey) && !isCoverLetterTemplateId(templateKey)) {
          throw new Error(`Unknown template: ${templateKey}`);
        }
        const res = await api.get<TemplateProps>(`/cv-data/${token}`);
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load preview data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, templateKey, data]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Preparing PDF...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="w-full max-w-md">
          <ErrorState
            title="PDF Render Failed"
            message={error}
            showRetry={false}
          />
        </div>
      </div>
    );
  }

  if (!templateKey || !templateType) {
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

  if (templateType === 'resume') {
    const TemplateComponent = getTemplateComponent(templateKey as TemplateId);

    return (
      <PaginatedPreview
        templateId={templateKey}
        accentColor={data.theme.primaryColor}
        fontFamily={data.theme.fontFamily}
        fontSize={data.theme.fontSize}
        letterSpacing={data.theme.letterSpacing}
        lineSpacing={data.theme.lineSpacing}
        renderAll
        debounceTime={200}
        isExport={isExport}
      >
        <TemplateComponent {...data} />
      </PaginatedPreview>
    );
  }

  const clTheme = data.coverLetterTheme || data.theme;
  const TemplateComponent = getCoverLetterTemplateComponent(templateKey as CoverLetterTemplateId);
  const props = mapCVDataToCLTemplateProps(data);

  return (
    <PaginatedPreview
      templateId={templateKey}
      accentColor={clTheme.primaryColor || data.theme.primaryColor}
      fontFamily={clTheme.fontFamily || data.theme.fontFamily}
      fontSize={clTheme.fontSize || data.theme.fontSize}
      letterSpacing={clTheme.letterSpacing || data.theme.letterSpacing}
      lineSpacing={clTheme.lineSpacing || data.theme.lineSpacing}
      renderAll
      debounceTime={200}
      isExport={isExport}
    >
      <TemplateComponent {...props} />
    </PaginatedPreview>
  );
}

export default function PdfRenderPage() {
  return <PdfRenderPageContent />;
}
