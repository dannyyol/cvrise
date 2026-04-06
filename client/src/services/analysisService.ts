import { api } from '../lib/apiClient';
import type { CVPayload } from '../lib/payloadBuilder';

export interface AnalysisResponse {
  overallScore: number;
  atsScore: number;
  insights: string[];
  recommendations: string[];
}

export async function analyzeCV(
  cvData: CVPayload,
  opts?: { mock?: boolean; delayMs?: number; resolver?: (req: CVPayload) => AnalysisResponse }
): Promise<AnalysisResponse> {
  const mockOptions = opts?.mock
    ? {
        mock: true,
        delayMs: opts.delayMs ?? 1200,
        resolver: () =>
          opts?.resolver
            ? opts.resolver(cvData)
            : { overallScore: 0, atsScore: 0, insights: [], recommendations: [] },
      }
    : undefined;

  return api.post<CVPayload, AnalysisResponse>('/analyze', cvData, undefined, mockOptions);
}

export interface AIReviewResponse {
  overall_score: number;
  strengths: string[];
  areas_to_improve: string[];
  sections: Array<{
    name: string;
    score: number;
    suggestions: string[];
  }>;
  atsCompatibility: { score: number; summary: string[] };
  contentQuality: { score: number; summary: string[] };
  formattingAnalysis: { score: number; summary: string[] };
}

export async function submitCVForReview(cvData: CVPayload['data']): Promise<AIReviewResponse> {
  return api.post<CVPayload['data'], AIReviewResponse>('/review', cvData);
}
