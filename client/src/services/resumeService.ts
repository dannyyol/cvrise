import { api } from '../lib/apiClient';
import type { PaginatedResponse } from './planService';
import type { TemplateProps, TemplateId, Template, ResumeShareLink } from '../types/resume';
import type { AIReviewResponse } from './analysisService';

export interface ResumeApiResponse extends TemplateProps {
  id: string;
  title: string;
  template_id: string;
  template_key: TemplateId;
  aiAnalysis?: AIReviewResponse | null;
  shareLink?: ResumeShareLink | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSummary {
  id: string;
  title: string;
  template_id: string;
  template_key: TemplateId;
  shareEnabled: boolean;
  shareViewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicResumeApiResponse extends TemplateProps {
  title: string;
  template_key: TemplateId;
}

export interface CoverLetterItem {
  id: string;
  title: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  content: string;
  jobTitle: string;
  jobDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoverLetterCreate {
  title?: string;
  recipientName?: string;
  recipientTitle?: string;
  companyName?: string;
  companyAddress?: string;
  content?: string;
  jobTitle?: string;
  jobDescription?: string;
}

export interface CoverLetterGenerate {
  title?: string;
  recipientName?: string;
  recipientTitle?: string;
  companyName?: string;
  companyAddress?: string;
  jobTitle?: string;
  jobDescription?: string;
  templateKey?: string;
}

export interface CoverLetterTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  guidelines: Record<string, unknown>;
}

export const resumeService = {
  getSampleData: async (): Promise<Partial<ResumeApiResponse>> => {
    return api.get<Partial<ResumeApiResponse>>('/resumes/sample');
  },

  getAllResumes: async (): Promise<ResumeSummary[]> => {
    return api.get<ResumeSummary[]>('/resumes/');
  },

  getResumeById: async (id: string): Promise<ResumeApiResponse> => {
    return api.get<ResumeApiResponse>(`/resumes/${id}`);
  },

  getDefaultResume: async (): Promise<ResumeApiResponse> => {
    return api.get<ResumeApiResponse>('/resumes/default');
  },

  getResumeShareLink: async (id: string): Promise<ResumeShareLink> => {
    return api.get<ResumeShareLink>(`/resumes/${id}/share-link`);
  },

  createResumeShareLink: async (id: string, regenerate: boolean = false): Promise<ResumeShareLink> => {
    return api.post<{ regenerate: boolean }, ResumeShareLink>(`/resumes/${id}/share-link`, { regenerate });
  },

  revokeResumeShareLink: async (id: string): Promise<ResumeShareLink> => {
    return api.delete<ResumeShareLink>(`/resumes/${id}/share-link`);
  },

  getPublicResumeByToken: async (token: string): Promise<PublicResumeApiResponse> => {
    return api.get<PublicResumeApiResponse>(`/resumes/public/${token}`);
  },

  updateResume: async (id: string, data: ResumeApiResponse): Promise<ResumeApiResponse> => {
    return api.put<ResumeApiResponse, ResumeApiResponse>(`/resumes/${id}`, data);
  },

  createResume: async (
    title: string = 'Untitled Resume',
    templateId: string = 'classic',
    createAndTailor: boolean = false
  ): Promise<ResumeApiResponse> => {
    return api.post<
      { title: string; template_id: string; createAndTailor: boolean },
      ResumeApiResponse
    >('/resumes/', { title, template_id: templateId, createAndTailor });
  },

  uploadResume: async (file: File): Promise<ResumeApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<FormData, ResumeApiResponse>('/resumes/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
  },

  deleteResume: async (id: string): Promise<void> => {
    return api.delete(`/resumes/${id}`);
  },

  getTemplates: async (): Promise<Template[]> => {
    return api.get<Template[]>('/templates/');
  },
  
  getCoverLetterTemplates: async (): Promise<CoverLetterTemplate[]> => {
    return api.get<CoverLetterTemplate[]>('/templates/?document=cover-letter');
  },

  getCoverLetters: async (resumeId: string): Promise<CoverLetterItem[]> => {
    return api.get<CoverLetterItem[]>(`/resumes/${resumeId}/cover-letters`);
  },

  createCoverLetter: async (resumeId: string, data: CoverLetterCreate): Promise<CoverLetterItem> => {
    return api.post<CoverLetterCreate, CoverLetterItem>(`/resumes/${resumeId}/cover-letters`, data);
  },
  
  generateCoverLetter: async (resumeId: string, data: CoverLetterGenerate): Promise<CoverLetterItem> => {
    return api.post<CoverLetterGenerate, CoverLetterItem>(`/resumes/${resumeId}/cover-letters/generate`, data);
  },
  
  tailorResume: async (resumeId: string, data: { jobTitle: string; jobDescription: string; }): Promise<ResumeApiResponse> => {
    return api.post<{ jobTitle: string; jobDescription: string; }, ResumeApiResponse>(
      `/resumes/${resumeId}/tailor`,
      {
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
      }
    );
  },

  matchJob: async (
    resumeId: string,
    data: { jobTitle: string; jobDescription: string }
  ): Promise<JobMatchApiResponse> => {
    return api.post<{ jobTitle: string; jobDescription: string }, JobMatchApiResponse>(
      `/resumes/${resumeId}/match`,
      { jobTitle: data.jobTitle, jobDescription: data.jobDescription }
    );
  },

  getJobMatchHistory: async (
    resumeId: string,
    page: number = 1,
    size: number = 10
  ): Promise<PaginatedResponse<JobMatchHistorySummary>> => {
    return api.get<PaginatedResponse<JobMatchHistorySummary>>(
      `/resumes/${resumeId}/job-matches?page=${page}&size=${size}`
    );
  },

  getJobMatchHistoryItem: async (jobMatchId: string): Promise<JobMatchHistoryItem> => {
    return api.get<JobMatchHistoryItem>(`/resumes/job-matches/${jobMatchId}`);
  },

  deleteJobMatchHistoryItem: async (jobMatchId: string): Promise<void> => {
    return api.delete(`/resumes/job-matches/${jobMatchId}`);
  },
};

export interface JobMatchApiResponse {
  matchScore: number;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: Array<{
    section: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface JobMatchHistorySummary {
  id: string;
  resumeId: string;
  jobTitle: string;
  matchScore: number;
  createdAt?: string | null;
}

export interface JobMatchHistoryItem extends JobMatchApiResponse {
  id: string;
  resumeId: string;
  jobTitle: string;
  jobDescription: string;
  createdAt?: string | null;
}
