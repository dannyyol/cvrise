"use client";

import React, { useState, useEffect } from "react";
import { useCVStore } from "@/src/store/useCVStore";
import { buildCVPayload } from "@/src/lib/payloadBuilder";
import { submitCVForReview, type AIReviewResponse } from "@/src/services/analysisService";
import { resumeService } from "@/src/services/resumeService";
import type { JobMatchApiResponse } from "@/src/services/resumeService";
import {
  Sparkles, Target, RefreshCw, Loader2, CheckCircle, AlertCircle,
  TrendingUp, TrendingDown, ChevronDown,
  CheckCircle2, XCircle,
} from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Form";
import { Card, CardHeader, CardContent } from "@/src/components/ui/Card";
import { clsx } from "clsx";
import axios from "axios";

// ─── Colour helpers ────────────────────────────────────────────────────────────

function scoreTextColor(n: number) {
  return n >= 80 ? "text-emerald-600" : n >= 60 ? "text-amber-500" : "text-red-500";
}
function scoreRingStroke(n: number) {
  return n >= 80 ? "#10b981" : n >= 60 ? "#f59e0b" : "#ef4444";
}
function scoreRingTrack(n: number) {
  return n >= 80 ? "#d1fae5" : n >= 60 ? "#fef3c7" : "#fee2e2";
}
function scoreBarClass(n: number) {
  return n >= 80 ? "bg-emerald-500" : n >= 60 ? "bg-amber-400" : "bg-red-400";
}
function scorePill(n: number): { label: string; cls: string } {
  if (n >= 80) return { label: "Excellent", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (n >= 60) return { label: "Good",      cls: "text-amber-700  bg-amber-50  border-amber-200"  };
  if (n >= 40) return { label: "Needs Work",cls: "text-orange-700 bg-orange-50 border-orange-200" };
  return              { label: "Poor",      cls: "text-red-700   bg-red-50    border-red-200"    };
}

// ─── Score ring (SVG) ──────────────────────────────────────────────────────────

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const sw = 7;
  const r  = (size - sw) / 2;
  const c  = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const cx = size / 2;
  const { label, cls } = scorePill(score);

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90 absolute inset-0" width={size} height={size}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke={scoreRingTrack(score)} strokeWidth={sw} />
          <circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke={scoreRingStroke(score)}
            strokeWidth={sw}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={clsx("text-[26px] font-bold leading-none tabular-nums", scoreTextColor(score))}>
            {score}
          </span>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5">/ 100</span>
        </div>
      </div>
      <span className={clsx("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border", cls)}>
        {label}
      </span>
    </div>
  );
}

// ─── Horizontal score bar ──────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-500 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-700", scoreBarClass(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={clsx("text-xs font-bold tabular-nums w-7 text-right", scoreTextColor(score))}>
        {score}
      </span>
    </div>
  );
}

// ─── Section accordion ─────────────────────────────────────────────────────────

function SectionRow({ section }: { section: { name: string; score: number; suggestions: string[] } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-800">{section.name}</span>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className={clsx("text-sm font-bold tabular-nums", scoreTextColor(section.score))}>
            {section.score}
          </span>
          <ChevronDown className={clsx("w-4 h-4 text-gray-300 transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>
      {open && section.suggestions.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60 space-y-2.5">
          {section.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-full bg-[#04659A]/40 mt-1.5 shrink-0" />
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CV Score section ──────────────────────────────────────────────────────────

type InsightTab = "strengths" | "improvements" | "sections";

function CVScoreSection() {
  const { cvData, selectedTemplate, aiAnalysis, saveAIAnalysis } = useCVStore();
  const [reviewData, setReviewData]   = useState<AIReviewResponse | null>(aiAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [tab, setTab]                 = useState<InsightTab>("strengths");

  useEffect(() => { setReviewData(aiAnalysis); }, [aiAnalysis]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const { data } = buildCVPayload(cvData, selectedTemplate);
      const result   = await submitCVForReview(data);
      setReviewData(result);
      setTab("strengths");
      try { await saveAIAnalysis(result); } catch { /* best-effort */ }
    } catch (err: unknown) {
      setErrorMsg(
        axios.isAxiosError(err)
          ? (err.response?.data as { detail?: string })?.detail ?? "Analysis failed."
          : "Analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card variant="accordion" topBorder shadow={false}>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#04659A]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#04659A]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">CV Score</p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">ATS, content &amp; formatting</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-5">
        {errorMsg && (
          <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!reviewData && !isAnalyzing && (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#04659A]/10 to-indigo-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#04659A]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Score Your Resume</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px] leading-relaxed mx-auto">
                Get an instant score covering ATS compatibility, content quality, and formatting.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={handleAnalyze}
            >
              Analyse My CV
            </Button>
          </div>
        )}

        {/* ── Loading ── */}
        {isAnalyzing && (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#04659A]/5 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#04659A] animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">Analysing your CV…</p>
              <p className="text-xs text-gray-400 mt-1">Checking ATS, content &amp; formatting</p>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {!isAnalyzing && reviewData && (
          <div className="space-y-5">
            {/* Score row */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <ScoreRing score={reviewData.overall_score} />
              <div className="flex-1 space-y-2.5">
                <ScoreBar label="ATS"     score={reviewData.atsCompatibility.score}   />
                <ScoreBar label="Content" score={reviewData.contentQuality.score}     />
                <ScoreBar label="Format"  score={reviewData.formattingAnalysis.score} />
              </div>
            </div>

            {/* Insight tabs */}
            <div>
              <div className="flex gap-0 border-b border-gray-100 mb-4">
                {(
                  [
                    { key: "strengths"    as const, label: "Strengths"  },
                    { key: "improvements" as const, label: "To Improve" },
                    ...(reviewData.sections.length > 0
                      ? [{ key: "sections" as const, label: "Sections" }]
                      : []),
                  ] satisfies { key: InsightTab; label: string }[]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={clsx(
                      "text-xs font-semibold px-3.5 pb-3 pt-0.5 border-b-2 -mb-px transition-colors",
                      tab === key
                        ? "text-[#04659A] border-[#04659A]"
                        : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "strengths" && (
                <ul className="space-y-2.5">
                  {reviewData.strengths.slice(0, 6).map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
                    </li>
                  ))}
                </ul>
              )}

              {tab === "improvements" && (
                <ul className="space-y-2.5">
                  {reviewData.areas_to_improve.slice(0, 6).map((a, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{a}</p>
                    </li>
                  ))}
                </ul>
              )}

              {tab === "sections" && (
                <div className="space-y-1.5">
                  {reviewData.sections.map((s, i) => (
                    <SectionRow key={i} section={s} />
                  ))}
                </div>
              )}
            </div>

            {/* ATS tips */}
            {reviewData.atsCompatibility.summary.length > 0 && (
              <div className="rounded-xl border border-[#04659A]/15 bg-[#04659A]/5 px-4 py-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#04659A] uppercase tracking-widest mb-3">
                  <Target className="w-3.5 h-3.5" />
                  ATS Tips
                </p>
                <ul className="space-y-2">
                  {reviewData.atsCompatibility.summary.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                      <CheckCircle className="w-3.5 h-3.5 text-[#04659A] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Re-analyse */}
            <button
              onClick={handleAnalyze}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-400 hover:text-[#04659A] rounded-lg transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Re-analyse
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Job Match section ─────────────────────────────────────────────────────────

const priorityConfig = {
  high:   { dot: "bg-red-500",   badge: "text-red-600 bg-red-50 border-red-200",      label: "High" },
  medium: { dot: "bg-amber-400", badge: "text-amber-600 bg-amber-50 border-amber-200", label: "Med"  },
  low:    { dot: "bg-blue-400",  badge: "text-blue-600 bg-blue-50 border-blue-200",    label: "Low"  },
} as const;

function JobMatchSection() {
  const { currentResumeId, tailorResume } = useCVStore();
  const [jobTitle, setJobTitle]             = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult]                 = useState<JobMatchApiResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [isTailoring, setIsTailoring]       = useState(false);
  const [errorMsg, setErrorMsg]             = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResumeId) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      setResult(await resumeService.matchJob(currentResumeId, { jobTitle, jobDescription }));
    } catch (err: unknown) {
      setErrorMsg(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          ?? "Analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailor = async () => {
    setIsTailoring(true);
    try { await tailorResume({ jobTitle, jobDescription }); }
    catch { setErrorMsg("Failed to tailor CV. Please try again."); }
    finally { setIsTailoring(false); }
  };

  const reset = () => { setResult(null); setErrorMsg(null); };

  return (
    <Card variant="accordion" topBorder shadow={false}>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">Job Match</p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">Compare CV to a job posting</p>
          </div>
        </div>
        {result && !isAnalyzing && (
          <button
            onClick={reset}
            className="text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-all"
          >
            ← New job
          </button>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {errorMsg && (
          <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* ── Loading ── */}
        {isAnalyzing && (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">Analysing match…</p>
              <p className="text-xs text-gray-400 mt-1">Comparing your CV to the job description</p>
            </div>
          </div>
        )}

        {/* ── Form ── */}
        {!isAnalyzing && !result && (
          <form onSubmit={handleAnalyze} className="space-y-3.5">
            <p className="text-sm text-gray-500 leading-relaxed">
              Paste a job description to see your match score, missing keywords, and tailored suggestions.
            </p>
            <Input
              label="Job Title"
              name="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="input-field-borderless"
              required
            />
            <div>
              <label className="input-label">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                placeholder="Paste the full job description here…"
                required
                className="w-full bg-slate-100 rounded-2xl border-0 px-4 py-3 text-[13px] text-gray-900 placeholder:text-gray-400 resize-none outline-none min-h-[110px]"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Target className="w-4 h-4" />}
              className="w-full"
            >
              Analyse Match
            </Button>
          </form>
        )}

        {/* ── Results ── */}
        {!isAnalyzing && result && (
          <div className="space-y-4">
            {/* Score + summary */}
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
              <ScoreRing score={result.matchScore} size={80} />
              {result.summary && (
                <p className="flex-1 text-sm text-gray-600 leading-relaxed pt-1">{result.summary}</p>
              )}
            </div>

            {/* Keywords */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-700">
                    Matched
                    <span className="ml-1 font-normal text-gray-400">({result.matchedKeywords.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.length > 0
                    ? result.matchedKeywords.map((kw) => <Badge key={kw} variant="success">{kw}</Badge>)
                    : <span className="text-xs text-gray-400 italic">None found</span>
                  }
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs font-semibold text-gray-700">
                    Missing
                    <span className="ml-1 font-normal text-gray-400">({result.missingKeywords.length})</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.length > 0
                    ? result.missingKeywords.map((kw) => <Badge key={kw} variant="error">{kw}</Badge>)
                    : <span className="text-xs text-gray-400 italic">None missing — great match!</span>
                  }
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#04659A]" />
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Suggestions
                    </span>
                  </div>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => {
                      const p = priorityConfig[s.priority as keyof typeof priorityConfig] ?? priorityConfig.medium;
                      return (
                        <div
                          key={i}
                          className="rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 px-3.5 py-3 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {s.section}
                            </span>
                            <div className="flex items-center gap-1.5 ml-auto">
                              <div className={clsx("w-1.5 h-1.5 rounded-full", p.dot)} />
                              <span className={clsx("text-[11px] font-semibold px-1.5 py-0.5 rounded border", p.badge)}>
                                {p.label}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{s.suggestion}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Tailor CTA */}
            <p className="text-[11px] text-gray-500 leading-relaxed bg-[#04659A]/5 border border-[#04659A]/10 rounded-xl px-3.5 py-3">
              Tailoring applies the suggestions by updating your Summary, Skills, and rewriting existing Experience/Project descriptions. It may also add a new Project if suggested. It will not invent experience, companies, or dates.
            </p>
            <Button
              variant="primary"
              size="md"
              isLoading={isTailoring}
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={handleTailor}
              className="w-full"
            >
              {isTailoring ? "Tailoring…" : "Tailor CV to This Job"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Panel ─────────────────────────────────────────────────────────────────────

export function AIInsightsPanel() {
  return (
    <div className="space-y-5 pb-6">
      <CVScoreSection />
      <JobMatchSection />
    </div>
  );
}
