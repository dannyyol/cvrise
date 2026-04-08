import React, { useEffect, useState } from 'react';
import { 
  Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, FileText, X 
} from 'lucide-react';
import { type AIReviewResponse } from '../../../services/analysisService';

interface AIAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviewData: AIReviewResponse | null;
}

export const AIAnalysisModal = ({ isOpen, onClose, reviewData }: AIAnalysisModalProps) => {
    if (!isOpen || !reviewData) return null;
    return <AIAnalysisModalBody reviewData={reviewData} onClose={onClose} />;
};

function AIAnalysisModalBody({ reviewData, onClose }: { reviewData: AIReviewResponse; onClose: () => void }) {
    const [visibleSections, setVisibleSections] = useState<number[]>([]);

    useEffect(() => {
        const sections = [0, 1, 2, 3, 4, 5, 6];
        const timers: number[] = [];

        for (const [index, section] of sections.entries()) {
            timers.push(
                window.setTimeout(() => {
                    setVisibleSections((prev) => [...prev, section]);
                }, index * 400)
            );
        }

        return () => {
            for (const timer of timers) window.clearTimeout(timer);
        };
    }, [reviewData]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getBannerVariantClass = (score: number) => {
        if (score >= 80) return 'ai-score-banner ai-score-banner--good';
        if (score >= 60) return 'ai-score-banner ai-score-banner--medium';
        return 'ai-score-banner ai-score-banner--bad';
    };

    const getScoreValueClass = (score: number) => {
        if (score >= 80) return 'ai-score-value ai-score-value--good';
        if (score >= 60) return 'ai-score-value ai-score-value--medium';
        return 'ai-score-value ai-score-value--bad';
    };

    const getProgressFillVariantClass = (score: number) => {
        const base = 'ai-score-progress-fill';
        if (score >= 80) return `${base} ai-score-progress-fill--good`;
        if (score >= 60) return `${base} ai-score-progress-fill--medium`;
        return `${base} ai-score-progress-fill--bad`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gray-50 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Sparkles className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Resume Analysis</h2>
                            <p className="text-sm text-gray-500">Based on industry standards and best practices</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {visibleSections.includes(0) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className={getBannerVariantClass(reviewData.overall_score)}>
                                <div className="ai-flex-between">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white dark:bg-slate-800 border border-neutral-200 dark:border-neutral-700 rounded-full p-3 shadow-sm">
                                            <Sparkles className={`w-8 h-8 ${getScoreColor(reviewData.overall_score)}`} />
                                        </div>
                                        <div>
                                            <h2 className="ai-title-lg mb-1">CV Score</h2>
                                            <p className="text-sm text-gray-600 dark:text-neutral-400">Based on industry standards and best practices</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={getScoreValueClass(reviewData.overall_score)}>{reviewData.overall_score}</div>
                                        <div className="text-sm text-gray-500 dark:text-neutral-400 font-medium">/ 100</div>
                                    </div>
                                </div>
                                <div className="ai-score-progress">
                                    <div
                                        className={getProgressFillVariantClass(reviewData.overall_score)}
                                        style={{ width: `${reviewData.overall_score}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {visibleSections.includes(1) && (
                        <div className="ai-grid-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ScoreCard
                                icon={<Target className="w-5 h-5 text-blue-600" />}
                                label="ATS Compatibility"
                                score={reviewData.atsCompatibility.score}
                                bgColor="bg-blue-50"
                            />
                            <ScoreCard
                                icon={<FileText className="w-5 h-5 text-blue-600" />}
                                label="Content Quality"
                                score={reviewData.contentQuality.score}
                                bgColor="bg-blue-50"
                            />
                            <ScoreCard
                                icon={<FileText className="w-5 h-5 text-orange-600" />}
                                label="Formatting"
                                score={reviewData.formattingAnalysis.score}
                                bgColor="bg-orange-50"
                            />
                        </div>
                    )}

                    {visibleSections.includes(2) && (
                        <div className="ai-grid-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800 rounded-lg p-5">
                                <div className="ai-mini-header">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <h3 className="ai-title-md">Strengths</h3>
                                </div>
                                <ul className="space-y-3">
                                    {reviewData.strengths.slice(0, 10).map((strength, idx) => (
                                        <StrengthItem key={idx} text={strength} />
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800 rounded-lg p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Areas to Improve</h3>
                                </div>
                                <ul className="space-y-3">
                                    {reviewData.areas_to_improve.slice(0, 10).map((area, idx) => (
                                        <WeaknessItem key={idx} text={area} />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {visibleSections.includes(3) && (
                        <div className="ai-card animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="ai-section-header">
                                <FileText className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                                <h3 className="ai-title-lg">Section-by-Section Analysis</h3>
                            </div>
                            <div className="space-y-4">
                                {reviewData.sections.map((section, idx) => (
                                    <SectionAnalysis
                                        key={idx}
                                        section={section.name}
                                        score={section.score}
                                        suggestions={section.suggestions}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {visibleSections.includes(4) && (
                        <div className="ai-ats-card animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-5">
                                <Target className="w-5 h-5 text-blue-700" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">ATS Compatibility Score: {reviewData.atsCompatibility.score}/100</h3>
                            </div>
                            <div className="space-y-4">
                                {reviewData.atsCompatibility.summary.map((item, idx) => (
                                    <ATSCheckItem key={idx} status="pass" text={item} />
                                ))}
                            </div>
                            <div className="mt-4 ai-card-md">
                                <p className="ai-paragraph leading-relaxed">
                                    <strong>What is ATS?</strong> Applicant Tracking Systems scan resumes before humans see them.
                                    A score of 85+ means your CV will likely pass most ATS filters.
                                </p>
                            </div>
                        </div>
                    )}

                    {visibleSections.includes(6) && (
                        <div className="ai-card animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-5">
                                <FileText className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Content Quality Analysis</h3>
                            </div>
                            <div className="space-y-3">
                                {reviewData.contentQuality?.summary?.map((item, idx) => (
                                    <div key={idx} className="ai-ats-item">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-sm text-gray-700 dark:text-neutral-300">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700">
                                <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Formatting Analysis</h4>
                                <div className="space-y-3">
                                    {reviewData.formattingAnalysis?.summary?.map((item, idx) => (
                                        <div key={idx} className="ai-ats-item">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-sm text-gray-700 dark:text-neutral-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ScoreCard({ icon, label, score, bgColor }: { icon: React.ReactNode; label: string; score: number; bgColor: string }) {
    const darkBg =
        bgColor.includes('blue')
            ? 'dark:bg-blue-900/20'
            : bgColor.includes('purple')
            ? 'dark:bg-purple-900/20'
            : bgColor.includes('orange')
            ? 'dark:bg-orange-900/20'
            : 'dark:bg-slate-800';

    return (
        <div className={`ai-card-md ${bgColor} ${darkBg} dark:border-neutral-700`}>
            <div className="ai-mini-header">
                {icon}
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{label}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">{score}</div>
            <div className="text-xs text-gray-500 dark:text-neutral-400 mt-1">/ 100</div>
        </div>
    );
}

function StrengthItem({ text }: { text: string }) {
    return (
        <li className="ai-list-item">
            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{text}</span>
        </li>
    );
}

function WeaknessItem({ text }: { text: string }) {
    return (
        <li className="ai-list-item">
            <TrendingDown className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <span>{text}</span>
        </li>
    );
}

function SectionAnalysis({ section, score, suggestions }: { section: string; score: number; suggestions: string[] }) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="ai-analysis-card">
            <div className="ai-analysis-header">
                <h4 className="ai-subtitle">{section}</h4>
                <div className={`text-xl font-bold ${getScoreColor(score)}`}>{score}/100</div>
            </div>
            <div className="ai-suggestions-list">
                <p className="ai-suggestions-title">Suggestions:</p>
                {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="ai-suggestion-item">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{suggestion}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ATSCheckItem({ status, text }: { status: 'pass' | 'warning' | 'fail'; text: string }) {
    const config = {
        pass: { icon: <CheckCircle className="w-5 h-5 text-green-600" />, color: 'text-gray-700 dark:text-neutral-300' },
        warning: { icon: <AlertCircle className="w-5 h-5 text-yellow-600" />, color: 'text-gray-700 dark:text-neutral-300' },
        fail: { icon: <AlertCircle className="w-5 h-5 text-red-600" />, color: 'text-gray-700 dark:text-neutral-300' },
    };

    return (
        <div className="ai-ats-item">
            {config[status].icon}
            <span className={`text-sm ${config[status].color}`}>{text}</span>
        </div>
    );
}
