"use client";

import { useState } from "react";
import { Target, Sparkles, RefreshCcw, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "../../ui/Badge";
import { Card, CardHeader, CardContent } from "../../ui/Card";
import { Toast } from "../../ui/Toast";
import { JobMatchModal, type JobMatchResult } from "./JobMatchModal";

interface JobMatchCardProps {
  onAnalyse: (jobTitle: string, jobDescription: string) => Promise<JobMatchResult>;
  onApply: (jobTitle: string, jobDescription: string) => Promise<void>;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getProgressColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function getScoreCircleStyle(score: number) {
  if (score >= 80) return "border-green-100 bg-green-50";
  if (score >= 60) return "border-yellow-100 bg-yellow-50";
  return "border-red-100 bg-red-50";
}

function getButtonColor(score: number) {
  if (score >= 80) return "bg-green-50 text-green-700 hover:bg-green-100";
  if (score >= 60) return "bg-yellow-50 text-yellow-700 hover:bg-yellow-100";
  return "bg-red-50 text-red-700 hover:bg-red-100";
}

export function JobMatchCard({ onAnalyse, onApply }: JobMatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [errorToast, setErrorToast] = useState({ message: "", isVisible: false });

  const handleAnalyse = async (jobTitle: string, jobDescription: string): Promise<JobMatchResult> => {
    setIsAnalysing(true);
    try {
      const data = await onAnalyse(jobTitle, jobDescription);
      setResult(data);
      return data;
    } catch (err) {
      setErrorToast({ message: "Job match analysis failed. Please try again.", isVisible: true });
      throw err;
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <>
      <Toast
        message={errorToast.message}
        type="error"
        isVisible={errorToast.isVisible}
        onClose={() => setErrorToast((t) => ({ ...t, isVisible: false }))}
      />

      <Card variant="accordion" topBorder shadow={false} className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Job Match</h3>
          </div>
          {result && !isAnalysing && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-400 hover:text-emerald-600 transition-colors p-1 rounded-full hover:bg-emerald-50"
              title="Re-analyse"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          )}
        </CardHeader>

        {!result && !isAnalysing ? (
          <CardContent className="relative overflow-hidden py-2 space-y-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-100/40 rounded-full blur-3xl -z-10" />
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 relative group">
                <div className="absolute inset-0 bg-emerald-200 rounded-2xl rotate-6 transition-transform group-hover:rotate-12" />
                <div className="absolute inset-0 bg-emerald-100 rounded-2xl -rotate-3 transition-transform group-hover:-rotate-6" />
                <div className="relative bg-white border border-emerald-100 rounded-2xl w-full h-full flex items-center justify-center shadow-sm">
                  <Target className="w-7 h-7 text-emerald-600" />
                </div>
              </div>

              <h4 className="font-bold text-gray-900 mb-2">Match to a Job</h4>
              <p className="text-sm text-gray-500 mb-6 px-1 leading-relaxed">
                See your <span className="font-medium text-gray-700">match score</span>, missing keywords, and get tailored suggestions.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-fit mb-6 mx-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-emerald-200 shadow-none hover:shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
              >
                <Target className="w-4 h-4" />
                Analyse Match
              </button>

              <div className="flex flex-wrap justify-center gap-2">
                {["Match Score", "Keyword Gap", "AI Suggestions"].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    icon={<Sparkles className="w-3 h-3 text-emerald-600" />}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        ) : isAnalysing ? (
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-0">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
            <h4 className="font-semibold text-gray-900">Analysing match...</h4>
            <p className="text-xs text-gray-500 mt-1">Comparing your CV to the job description</p>
          </CardContent>
        ) : result ? (
          <CardContent className="space-y-0">
            <div className="flex items-center justify-between mb-4 animate-in fade-in duration-500">
              <div
                className={clsx(
                  "relative w-16 h-16 flex items-center justify-center rounded-full border-4",
                  getScoreCircleStyle(result.match_score)
                )}
              >
                <span className={clsx("text-xl font-bold", getScoreColor(result.match_score))}>
                  {result.match_score}
                </span>
              </div>
              <div className="flex-1 ml-4">
                <div className="text-sm text-gray-500 mb-1">Match Score</div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full rounded-full transition-all duration-500", getProgressColor(result.match_score))}
                    style={{ width: `${result.match_score}%` }}
                  />
                </div>
                {result.missing_keywords.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {result.missing_keywords.length} keyword{result.missing_keywords.length !== 1 ? "s" : ""} missing
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className={clsx(
                  "sm:w-full lg:w-[250px] py-2 font-medium rounded-md transition-colors flex items-center justify-center gap-2",
                  getButtonColor(result.match_score)
                )}
              >
                View Full Analysis
                <Target className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        ) : null}
      </Card>

      <JobMatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnalyse={handleAnalyse}
        onApply={onApply}
      />
    </>
  );
}
