import { useState, useEffect } from 'react';
import { useCVStore } from '@/src/store/useCVStore';
import { buildCVPayload } from '@/src/lib/payloadBuilder';
import { 
  Sparkles, CheckCircle, ChevronRight,
  RefreshCcw, Loader2
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Toast } from '../../ui/Toast';
import { submitCVForReview, type AIReviewResponse } from '../../../services/analysisService';
import { AIAnalysisModal } from './AIAnalysisModal';
import { Card, CardHeader, CardContent } from '../../ui/Card';

export const AIAnalysis = () => {
  const { cvData, selectedTemplate, aiAnalysis, saveAIAnalysis } = useCVStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState<AIReviewResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorToast, setErrorToast] = useState<{ message: string; isVisible: boolean }>({ message: '', isVisible: false });
  
  useEffect(() => {
    setReviewData(aiAnalysis);
  }, [aiAnalysis]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const payload = buildCVPayload(cvData, selectedTemplate);
    try {
        const data = await submitCVForReview(payload.data);
        setReviewData(data);
        try {
          await saveAIAnalysis(data);
        } catch {
          setErrorToast({ message: 'Analysis generated, but failed to save it. Please try again.', isVisible: true });
        }
    } catch {
        setErrorToast({ message: 'Failed to generate AI analysis. Please try again.', isVisible: true });
    } finally {
        setIsAnalyzing(false);
    }
  };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    const getScoreCircleStyle = (score: number) => {
        if (score >= 80) return 'border-green-100 bg-green-50';
        if (score >= 60) return 'border-yellow-100 bg-yellow-50';
        return 'border-red-100 bg-red-50';
    };

    const getButtonColor = (score: number) => {
        if (score >= 80) return 'bg-green-50 text-green-700 hover:bg-green-100';
        if (score >= 60) return 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100';
        return 'bg-red-50 text-red-700 hover:bg-red-100';
    };

  return (
    <>
        <Toast 
            message={errorToast.message}
            type="error"
            isVisible={errorToast.isVisible}
            onClose={() => setErrorToast({ ...errorToast, isVisible: false })}
        />
        {/* Sidebar Summary Card */}
        <Card variant="accordion" topBorder shadow={false} className="mb-6">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">AI Analysis</h3>
                </div>
                {reviewData && !isAnalyzing && (
                    <button 
                        onClick={handleAnalyze}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                        title="Refresh Analysis"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                )}
            </CardHeader>

            {!reviewData && !isAnalyzing ? (
                <CardContent className="relative overflow-hidden py-2 space-y-0">
                    {/* Decorative background blur */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl -z-10" />
                    
                    <div className="text-center">
                        <div className="w-14 h-14 mx-auto mb-4 relative group">
                            <div className="absolute inset-0 bg-purple-200 rounded-2xl rotate-6 transition-transform group-hover:rotate-12" />
                            <div className="absolute inset-0 bg-purple-100 rounded-2xl -rotate-3 transition-transform group-hover:-rotate-6" />
                            <div className="relative bg-white border border-purple-100 rounded-2xl w-full h-full flex items-center justify-center shadow-sm">
                                <Sparkles className="w-7 h-7 text-purple-600" />
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-900 mb-2">AI Resume Review</h4>
                        <p className="text-sm text-gray-500 mb-6 px-1 leading-relaxed">
                            Get detailed feedback on <span className="font-medium text-gray-700">ATS compatibility</span> and <span className="font-medium text-gray-700">content quality</span>.
                        </p>
                        
                        <button
                            onClick={handleAnalyze}
                            className="w-fit mb-6 mx-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-blue-200 shadow-none hover:shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate Analysis
                        </button>

                        <div className="flex flex-wrap justify-center gap-2">
                            {['ATS Optimized', 'Keyword Check', 'Smart Scoring'].map((tag) => (
                                <Badge 
                                    key={tag} 
                                    variant="secondary"
                                    icon={<CheckCircle className="w-3 h-3 text-purple-600" />}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            ) : isAnalyzing ? (
                <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-0">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                    <h4 className="font-semibold text-gray-900">Analyzing your CV...</h4>
                    <p className="text-xs text-gray-500 mt-1">Checking ATS compatibility & content</p>
                </CardContent>
            ) : (
                <CardContent className="space-y-0">
                    <div className="flex items-center justify-between mb-4 animate-in fade-in duration-500">
                        <div className={`relative w-16 h-16 flex items-center justify-center rounded-full border-4 ${getScoreCircleStyle(reviewData!.overall_score)}`}>
                            <span className={`text-xl font-bold ${getScoreColor(reviewData!.overall_score)}`}>{reviewData!.overall_score}</span>
                        </div>
                        <div className="flex-1 ml-4">
                            <div className="text-sm text-gray-500 mb-1">Overall Score</div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(reviewData!.overall_score)}`}
                                    style={{ width: `${reviewData!.overall_score}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center'>
                        <button 
                        onClick={() => setIsModalOpen(true)}
                        className={`sm:w-full lg:w-[250px] py-2 font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${getButtonColor(reviewData!.overall_score)}`}
                    >
                        View Detailed Report
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    </div>
                </CardContent>
            )}
        </Card>

        <AIAnalysisModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            reviewData={reviewData} 
        />
    </>
  );
};
