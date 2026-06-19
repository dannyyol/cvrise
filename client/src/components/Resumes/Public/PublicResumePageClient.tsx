"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Loader2 } from "lucide-react";

import type { PublicResumeApiResponse } from "@/src/services/resumeService";
import { resumeService } from "@/src/services/resumeService";
import { ErrorState } from "@/src/components/ui/ErrorState";
import { Toast, type ToastType } from "@/src/components/ui/Toast";
import { buildCVPayload } from "@/src/lib/payloadBuilder";
import { exportResumeToPDF, generateResumePDFBlob } from "@/src/services/pdfService";
import { CVPreview } from "@/src/components/Resumes/Preview/CVPreview";

function normalizeNameForFilename(value: string): string {
  return value.trim().replace(/\.pdf$/i, "").replace(/\s*pdf$/i, "").trim() || "CVRise";
}

function getHeaderIdentity(resume: PublicResumeApiResponse | null) {
  const fullName = resume?.personalDetails?.fullName?.trim() || resume?.title?.trim() || "Shared CV";
  const jobTitle = resume?.personalDetails?.jobTitle?.trim() || "";
  return {
    fullName,
    jobTitle,
    heading: jobTitle ? `${fullName} · ${jobTitle}` : fullName,
  };
}

function PublicPageFrame({
  children,
  heading,
  showActions = false,
  isDownloading = false,
  onDownload,
}: {
  children: React.ReactNode;
  heading?: string;
  showActions?: boolean;
  isDownloading?: boolean;
  onDownload?: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-5">
        <header className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                <Link href="/" className="inline-flex items-center gap-1 text-slate-900">
                  <Image src="/images/blue-logo.png" alt="CVRise" width={32} height={32} className="h-8 w-8" priority />
                  <span className="text-base font-extrabold tracking-tight sm:text-lg">
                    CV<span className="text-primary-500">Rise</span>
                  </span>
                </Link>
                {heading ? (
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">{heading}</p>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        Shared via CVRise
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {showActions ? (
              <div className="hidden items-center gap-3 sm:flex">
                <button
                  type="button"
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isDownloading ? "Preparing PDF..." : "Download PDF"}
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Build your resume →
                </Link>
              </div>
            ) : null}
          </div>

          {showActions ? (
            <div className="mt-3 space-y-2.5 sm:hidden">
              <button
                type="button"
                onClick={onDownload}
                disabled={isDownloading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isDownloading ? "Preparing PDF..." : "Download PDF"}
              </button>
              <Link
                href="/"
                className="block rounded-xl bg-primary-50 px-4 py-2.5 text-center text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
              >
                Build your ATS-ready CV for free →
              </Link>
            </div>
          ) : null}
        </header>

        {children}

        <footer className="mt-4 border-t border-slate-200 px-1 py-4 text-center text-sm text-slate-500">
          Made with{" "}
          <Link href="/" className="font-medium text-slate-600 transition-colors hover:text-[#04659A]">
            CVRise
          </Link>{" "}
          - Build your ATS-ready CV for free
        </footer>
      </div>
    </div>
  );
}

export function PublicResumePageClient({ token }: { token: string }) {
  const [resume, setResume] = useState<PublicResumeApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [useCompactPdfView, setUseCompactPdfView] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  useEffect(() => {
    let isMounted = true;

    const loadResume = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await resumeService.getPublicResumeByToken(token);
        if (!isMounted) return;
        setResume(data);
      } catch (error: unknown) {
        if (!isMounted) return;
        const status = (error as { response?: { status?: number } }).response?.status;
        setResume(null);
        setNotFound(status === 404);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadResume();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const previewData = useMemo(() => {
    if (!resume) return null;
    const { title, template_key, ...templateData } = resume;
    void title;
    void template_key;
    return templateData;
  }, [resume]);
  const identity = useMemo(() => getHeaderIdentity(resume), [resume]);

  useEffect(() => {
    if (!resume || !previewData || useCompactPdfView !== false) {
      setPdfUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setPreviewError(false);
      return;
    }

    let isActive = true;
    let nextUrl: string | null = null;

    const loadPdfPreview = async () => {
      setPreviewError(false);

      try {
        const payload = buildCVPayload(previewData, resume.template_key);
        const blob = await generateResumePDFBlob(payload);
        if (!isActive) return;

        nextUrl = URL.createObjectURL(blob);
        setPdfUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return nextUrl;
        });
      } catch {
        if (!isActive) return;

        setPreviewError(true);
        setPdfUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
      } finally {
        if (!isActive && nextUrl) {
          URL.revokeObjectURL(nextUrl);
        }
      }
    };

    void loadPdfPreview();

    return () => {
      isActive = false;
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl);
      }
    };
  }, [previewData, resume, useCompactPdfView]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncCompactView = () => {
      setUseCompactPdfView(mediaQuery.matches);
    };

    syncCompactView();
    mediaQuery.addEventListener("change", syncCompactView);

    return () => {
      mediaQuery.removeEventListener("change", syncCompactView);
    };
  }, []);

  const isViewportModeReady = useCompactPdfView !== null;
  const isMobilePreview = useCompactPdfView === true;

  const pdfViewerHash = useMemo(
    () =>
      isMobilePreview
        ? "#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=page-fit"
        : "#toolbar=0&navpanes=0&scrollbar=1&page=1&zoom=page-width",
    [isMobilePreview],
  );

  const handleDownload = async () => {
    if (!resume || !previewData) return;
    setIsDownloading(true);
    try {
      const payload = buildCVPayload(previewData, resume.template_key);
      const filename = `${normalizeNameForFilename(identity.fullName)}_Resume.pdf`;
      await exportResumeToPDF(payload, filename);
      setToast({ message: "Resume exported successfully!", type: "success", isVisible: true });
    } catch {
      setToast({ message: "Failed to export PDF. Please try again.", type: "error", isVisible: true });
    } finally {
      setIsDownloading(false);
    }
  };

  const isPdfStillPreparing = Boolean(resume && previewData && useCompactPdfView === false && !pdfUrl && !previewError);

  if (isLoading || !isViewportModeReady || isPdfStillPreparing) {
    return (
      <PublicPageFrame>
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((current) => ({ ...current, isVisible: false }))}
        />
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-[#04659A]" />
            <p className="text-sm font-medium">Loading shared CV...</p>
          </div>
        </div>
      </PublicPageFrame>
    );
  }

  if (notFound || !resume || !previewData) {
    return (
      <PublicPageFrame>
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((current) => ({ ...current, isVisible: false }))}
        />
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 shadow-sm">
          <ErrorState
            title="Shared CV not found"
            message="This link may be invalid or it may have been revoked by the owner."
            showRetry={false}
          />
        </div>
      </PublicPageFrame>
    );
  }

  return (
    <PublicPageFrame
      heading={identity.heading}
      showActions
      isDownloading={isDownloading}
      onDownload={handleDownload}
    >
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((current) => ({ ...current, isVisible: false }))}
      />
      <div className="flex min-h-0 flex-1 flex-col rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-200 via-slate-100 to-white p-3 shadow-sm sm:p-5">
        <div className="flex min-h-[68svh] flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-slate-300/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:min-h-[78vh] lg:min-h-[1100px]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{identity.fullName}</p>
              <p className="truncate text-xs text-slate-500">{isMobilePreview ? "Resume preview" : "PDF preview"}</p>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 bg-slate-100">
            {isMobilePreview ? (
              <div className="absolute inset-0 bg-white">
                <CVPreview data={previewData} templateId={resume.template_key} scaleMode="fill" />
              </div>
            ) : null}

            {!isMobilePreview && previewError ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-md rounded-2xl border border-amber-200 bg-white px-6 py-8 text-center shadow-sm">
                  <p className="text-base font-semibold text-slate-900">Preview unavailable</p>
                  <p className="mt-2 text-sm text-slate-500">
                    We couldn&apos;t load the embedded PDF preview right now, but the resume is still available to download.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#04659A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#03517A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {isDownloading ? "Preparing PDF..." : "Download PDF instead"}
                  </button>
                </div>
              </div>
            ) : null}

            {!isMobilePreview && pdfUrl && !previewError ? (
              <object
                aria-label={`${identity.fullName} PDF preview`}
                data={`${pdfUrl}${pdfViewerHash}`}
                type="application/pdf"
                className="absolute inset-0 block h-full w-full"
              >
                <iframe
                  title={`${identity.fullName} PDF resume preview`}
                  src={`${pdfUrl}${pdfViewerHash}`}
                  className="absolute inset-0 block h-full w-full border-0"
                />
              </object>
            ) : null}
          </div>
        </div>
      </div>
    </PublicPageFrame>
  );
}
