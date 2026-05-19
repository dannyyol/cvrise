"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  Target,
} from "lucide-react";
import { clsx } from "clsx";
import { Input, TextArea } from "../../ui/Form";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";

export interface JobMatchResult {
  match_score: number;
  summary: string;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: Array<{
    section: string;
    suggestion: string;
    priority: "high" | "medium" | "low";
  }>;
}

interface JobMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyse: (jobTitle: string, jobDescription: string) => Promise<JobMatchResult>;
  onApply: (jobTitle: string, jobDescription: string) => Promise<void>;
}

type Step = "input" | "loading" | "results";

const priorityConfig = {
  high: { label: "High", className: "text-red-600 bg-red-50 border-red-100" },
  medium: { label: "Medium", className: "text-yellow-600 bg-yellow-50 border-yellow-100" },
  low: { label: "Low", className: "text-blue-600 bg-blue-50 border-blue-100" },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const stroke = 7;
  const normalised = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalised;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#16a34a" : score >= 60 ? "#ca8a04" : "#dc2626";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle
          cx="48"
          cy="48"
          r={normalised}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx="48"
          cy="48"
          r={normalised}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="text-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="block text-xs text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

export function JobMatchModal({ isOpen, onClose, onAnalyse, onApply }: JobMatchModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("input");
      setResult(null);
      setErrorMsg(null);
    }, 300);
  };

  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) return;
    setErrorMsg(null);
    setStep("loading");
    try {
      const data = await onAnalyse(jobTitle, jobDescription);
      setResult(data);
      setStep("results");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(detail ?? (err instanceof Error ? err.message : "Analysis failed. Please try again."));
      setStep("input");
    }
  };

  const handleApply = async () => {
    if (!result) return;
    setIsApplying(true);
    try {
      await onApply(jobTitle, jobDescription);
      handleClose();
    } catch {
      setErrorMsg("Failed to apply suggestions. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    Job Match Analysis
                  </h3>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Step: Input */}
                {step === "input" && (
                  <form onSubmit={handleAnalyse} className="p-6 space-y-6 projects-form">
                    {errorMsg && (
                      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                        <p>{errorMsg}</p>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-emerald-100 rounded-full">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900">CV vs Job Description</h4>
                          <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                            See how well your CV matches the role, what keywords are missing, and get specific suggestions to improve your chances.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <Input
                        label="Job Title"
                        name="jobTitle"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        icon={<Briefcase className="w-4 h-4" />}
                        required
                        className="input-field-borderless"
                      />
                      <TextArea
                        label="Job Description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={7}
                        placeholder="Paste the full job description here..."
                        required
                        className="min-h-[160px] rounded-2xl"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        leftIcon={<Target className="w-4 h-4" />}
                        className="rounded-xl"
                      >
                        Analyse Match
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step: Loading */}
                {step === "loading" && (
                  <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">Analysing your CV...</h4>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Comparing your experience and skills against the job description
                    </p>
                  </div>
                )}

                {/* Step: Results */}
                {step === "results" && result && (
                  <div className="p-6 space-y-6">
                    {/* Score + summary */}
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <ScoreRing score={result.match_score} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Match Score</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{result.summary}</p>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Matched */}
                      <div className="rounded-xl border border-green-100 bg-green-50/40 p-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-800">
                            Matched ({result.matched_keywords.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.matched_keywords.length > 0 ? (
                            result.matched_keywords.map((kw) => (
                              <Badge key={kw} variant="success" className="text-xs">
                                {kw}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400">None found</p>
                          )}
                        </div>
                      </div>

                      {/* Missing */}
                      <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-semibold text-red-800">
                            Missing ({result.missing_keywords.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missing_keywords.length > 0 ? (
                            result.missing_keywords.map((kw) => (
                              <Badge key={kw} variant="error" className="text-xs">
                                {kw}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400">None missing</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {result.suggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          Suggestions
                        </h4>
                        <div className="space-y-2">
                          {result.suggestions.map((s, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {s.section}
                                  </span>
                                  <span
                                    className={clsx(
                                      "text-xs font-medium px-2 py-0.5 rounded-full border",
                                      priorityConfig[s.priority].className
                                    )}
                                  >
                                    {priorityConfig[s.priority].label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{s.suggestion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setStep("input")}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ← Try a different job
                      </button>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          Close
                        </button>
                        <Button
                          variant="primary"
                          size="md"
                          isLoading={isApplying}
                          leftIcon={<Sparkles className="w-4 h-4" />}
                          onClick={handleApply}
                          className="rounded-xl"
                        >
                          {isApplying ? "Applying..." : "Tailor CV to This Job"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
