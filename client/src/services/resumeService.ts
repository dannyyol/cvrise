import { api } from '../lib/apiClient';
import type { TemplateProps, TemplateId, Template } from '../types/resume';
import type { AIReviewResponse } from './analysisService';

export interface ResumeApiResponse extends TemplateProps {
  id: string;
  template_id: string;
  template_key: TemplateId;
  aiAnalysis?: AIReviewResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSummary {
  id: string;
  title: string;
  template_id: string;
  template_key: TemplateId;
  createdAt: string;
  updatedAt: string;
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
  tone?: string;
  templateKey?: string;
  length?: string;
}

export interface CoverLetterTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  guidelines: Record<string, any>;
}

export const resumeService = {
  getAllResumes: async (): Promise<ResumeSummary[]> => {
    return api.get<ResumeSummary[]>('/resumes/');
  },

  getResumeById: async (id: string): Promise<ResumeApiResponse> => {
    return api.get<ResumeApiResponse>(`/resumes/${id}`);
  },

  getDefaultResume: async (): Promise<ResumeApiResponse> => {
    return api.get<ResumeApiResponse>('/resumes/default');
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
    return api.get<CoverLetterTemplate[]>('/cover-letter-templates/');
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
  
  tailorResume: async (resumeId: string, data: { jobTitle: string; jobDescription: string; tone?: string }): Promise<ResumeApiResponse> => {
    return api.post<{ jobTitle: string; jobDescription: string; tone?: string }, ResumeApiResponse>(
      `/resumes/${resumeId}/tailor`,
      {
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        tone: data.tone ?? 'professional',
      }
    );
  },
};
