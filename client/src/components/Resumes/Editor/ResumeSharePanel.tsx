"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, Eye, Link as LinkIcon, Loader2, RefreshCw, Trash2, Calendar, FileText, Globe, X } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import { useCVStore } from "@/src/store/useCVStore";
import { resumeService } from "@/src/services/resumeService";
import type { ResumeShareLink } from "@/src/types/resume";
import { Toast, type ToastType } from "@/src/components/ui/Toast";

function formatTimestamp(value?: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ResumeSharePanel({
  variant = "dropdown",
  className = "",
}: {
  variant?: "dropdown" | "sheet";
  className?: string;
}) {
  const { currentResumeId, currentResumeTitle } = useCVStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareLink, setShareLink] = useState<ResumeShareLink | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || variant !== "dropdown") return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target || panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, variant]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    setShareLink(null);
    setIsCopied(false);
    setIsOpen(false);
  }, [currentResumeId]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const loadShareLink = async () => {
    if (!currentResumeId) return;
    setIsLoading(true);
    try {
      const data = await resumeService.getResumeShareLink(currentResumeId);
      setShareLink(data);
    } catch {
      showToast("Failed to load share link.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && currentResumeId) {
      await loadShareLink();
    }
  };

  const handleCreate = async (regenerate: boolean = false) => {
    if (!currentResumeId) return;
    setIsMutating(true);
    try {
      const data = await resumeService.createResumeShareLink(currentResumeId, regenerate);
      setShareLink(data);
      setIsCopied(false);
      showToast(regenerate ? "Share link regenerated." : "Share link created.", "success");
    } catch {
      showToast("Failed to create share link.", "error");
    } finally {
      setIsMutating(false);
    }
  };

  const handleRevoke = async () => {
    if (!currentResumeId) return;
    setIsMutating(true);
    try {
      const data = await resumeService.revokeResumeShareLink(currentResumeId);
      setShareLink(data);
      setIsCopied(false);
      showToast("Share link revoked.", "success");
    } catch {
      showToast("Failed to revoke share link.", "error");
    } finally {
      setIsMutating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink?.url) return;
    try {
      await navigator.clipboard.writeText(shareLink.url);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      showToast("Could not copy the share link.", "error");
    }
  };

  const isDisabled = !currentResumeId;
  const activeLink = shareLink?.enabled ? shareLink : null;
  const isSheet = variant === "sheet";

  const renderPanelHeader = ({
    compact = false,
    showCloseButton = false,
  }: {
    compact?: boolean;
    showCloseButton?: boolean;
  } = {}) => (
    <div
      className={clsx(
        "border-b border-slate-100",
        compact ? "flex items-center justify-between bg-white/95 px-5 py-4 backdrop-blur" : "bg-slate-50/50 px-6 py-4"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "flex items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-100",
            compact ? "h-10 w-10" : "h-10 w-10"
          )}
        >
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Public share link</h3>
          <p className={clsx("font-medium text-slate-500", compact ? "text-xs" : "text-[11px]")}>
            Share your CV with a unique public URL
          </p>
        </div>
      </div>
      {showCloseButton ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close share sheet"
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );

  const renderPanelBody = (mobile: boolean) => (
    <div className={clsx("space-y-5", mobile ? "px-5 py-5" : "px-6 py-6")}>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Resume</span>
        </div>
        <p className="truncate text-sm font-bold text-slate-900">{currentResumeTitle || "Untitled Resume"}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary-500" />
          <p className="text-xs font-medium">Fetching link details...</p>
        </div>
      ) : activeLink ? (
        <>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Link is active</p>
                  <p className="text-[11px] font-medium text-slate-500">Publicly accessible</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm shadow-emerald-200">
                LIVE
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Share URL</label>
            <div className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-1.5 transition-all focus-within:border-primary-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50">
              <input
                readOnly
                value={activeLink.url ?? ""}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-slate-700 outline-none"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-primary-600 active:scale-95"
                  title="Copy link"
                >
                  {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => activeLink.url && window.open(activeLink.url, "_blank", "noopener,noreferrer")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white shadow-md shadow-primary-100 transition-all hover:bg-primary-600 active:scale-95"
                  title="Open public page"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Views</span>
              </div>
              <p className="text-2xl font-black tracking-tight text-slate-900">{activeLink.viewCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Last Activity</span>
              </div>
              <p className="text-xs font-bold leading-tight text-slate-900">{formatTimestamp(activeLink.lastViewedAt)}</p>
            </div>
          </div>

          <div className={clsx("gap-4 pt-2", mobile ? "space-y-4" : "flex items-center justify-between")}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created on</span>
              <span className="text-xs font-bold text-slate-600">{formatTimestamp(activeLink.createdAt).split(",")[0]}</span>
            </div>
            <div className={clsx("gap-2", mobile ? "grid grid-cols-2" : "flex items-center")}>
              <button
                type="button"
                disabled={isMutating}
                onClick={() => handleCreate(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Regenerate
              </button>
              <button
                type="button"
                disabled={isMutating}
                onClick={handleRevoke}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Revoke
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <LinkIcon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">Create a shareable CV link</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Your public link uses a short random token and can be revoked anytime.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleCreate(false)}
            disabled={isMutating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-100 transition-all hover:bg-primary-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            Create public link
          </button>
        </div>
      )}
    </div>
  );

  const renderPanelContent = (mobile: boolean) => (
    <>
      {!mobile ? renderPanelHeader() : null}
      {renderPanelBody(mobile)}
    </>
  );

  return (
    <>
      <div ref={panelRef} className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isDisabled}
          aria-haspopup={isSheet ? "dialog" : "menu"}
          aria-expanded={isSheet ? undefined : isOpen}
          className={clsx(
            isSheet
              ? "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
              : "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold shadow-xs transition-all",
            !isSheet &&
              (isDisabled
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : isOpen
                  ? "border-primary-200 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"),
            isSheet && isDisabled && "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
            className
          )}
        >
          <LinkIcon className="h-4 w-4" />
          <span>{isSheet ? "Share" : "Share CV"}</span>
          {!isSheet ? <ChevronDown className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")} /> : null}
        </button>

        <AnimatePresence>
          {isOpen && !isSheet && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-full z-50 mt-3 w-[360px] max-w-[calc(100vw-1rem)] overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] after:absolute after:-top-2 after:right-7 after:h-4 after:w-4 after:rotate-45 after:bg-white/95 after:backdrop-blur-md after:content-[''] after:border-l after:border-t after:border-slate-200/60"
            >
              {renderPanelContent(false)}
          </motion.div>
        )}
      </AnimatePresence>

        {isOpen && isSheet && typeof document !== "undefined"
          ? createPortal(
              <div
                className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40"
                role="dialog"
                aria-modal="true"
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full max-w-md px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="max-h-[85vh] overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white shadow-xl">
                    <div className="sticky top-0 z-10">
                      {renderPanelHeader({ compact: true, showCloseButton: true })}
                    </div>
                    {renderPanelContent(true)}
                  </div>
                </motion.div>
              </div>,
              document.body
            )
          : null}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((current) => ({ ...current, isVisible: false }))}
      />
    </>
  );
}
