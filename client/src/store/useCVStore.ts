import { create } from 'zustand';
import type { CVSection as Section, PersonalDetails, WorkExperience, Education, Skill, Project, Certification, Award, Publication, CustomSectionItem, ThemeConfig, TemplateId, TemplateProps, Template, CoverLetter, CoverLetterTemplateId } from '../types/resume';
import { resumeService } from '../services/resumeService';
import type { CoverLetterItem } from '../services/resumeService';
import type { AIReviewResponse } from '../services/analysisService';

interface CVStore {
  cvData: TemplateProps;
  aiAnalysis: AIReviewResponse | null;
  activeDocumentMode: 'resume' | 'cover-letter';
  templates: Template[];
  coverLetterTemplates: import('../services/resumeService').CoverLetterTemplate[];
  coverLetterGenerationMode: 'local' | 'ai';
  selectedTemplate: TemplateId;
  currentResumeId: string | null;
  lastSaved: Date | null;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  error: string | null;
  coverLetterHistory: CoverLetterItem[];
  isHistoryLoading: boolean;
  historyError: string | null;
  isCLGenerating: boolean;
  
  reset: () => void;
  setCurrentResumeId: (id: string | null) => void;

  fetchTemplates: () => Promise<void>;
  fetchCoverLetterTemplates: () => Promise<void>;
  fetchDefaultResume: () => Promise<void>;
  fetchResumeById: (id: string) => Promise<void>;
  saveResume: () => Promise<void>;
  saveAIAnalysis: (analysis: AIReviewResponse | null) => Promise<void>;
  setTemplate: (id: TemplateId) => void;
  updatePersonalDetails: (details: Partial<PersonalDetails>) => void;
  updateSummary: (summary: string) => void;
  updateCoverLetter: (data: Partial<CoverLetter>) => void;
  setCoverLetterGenerationMode: (mode: 'local' | 'ai') => void;
  createCoverLetter: (data: Partial<CoverLetter> & { title?: string }) => Promise<void>;
  generateCoverLetter: (data: Partial<CoverLetter> & { title?: string; templateKey?: CoverLetterTemplateId; }) => Promise<void>;
  fetchCoverLetterHistory: () => Promise<void>;
  selectCoverLetterFromHistory: (item: CoverLetterItem) => void;
  setDocumentMode: (mode: 'resume' | 'cover-letter') => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  updateCoverLetterTheme: (theme: Partial<ThemeConfig>) => void;
  tailorResume: (data: { jobTitle: string; jobDescription: string; tone?: string }) => Promise<void>;
  
  // Section ordering and visibility
  setSections: (sections: Section[]) => void;
  toggleSectionVisibility: (id: string) => void;
  updateSectionTitle: (id: string, title: string) => void;
  
  // Experience
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<WorkExperience>) => void;
  removeExperience: (id: string) => void;
  moveExperience: (activeId: string, overId: string) => void;
  
  // Education
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  moveEducation: (activeId: string, overId: string) => void;
  
  // Skills
  addSkill: () => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  moveSkill: (activeId: string, overId: string) => void;
  
  // Projects
  addProject: () => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;
  moveProject: (activeId: string, overId: string) => void;

  // Certifications
  addCertification: () => void;
  updateCertification: (id: string, data: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  moveCertification: (activeId: string, overId: string) => void;

  // Awards
  addAward: () => void;
  updateAward: (id: string, data: Partial<Award>) => void;
  removeAward: (id: string) => void;
  moveAward: (activeId: string, overId: string) => void;

  // Publications
  addPublication: () => void;
  updatePublication: (id: string, data: Partial<Publication>) => void;
  removePublication: (id: string) => void;
  movePublication: (activeId: string, overId: string) => void;

  // Languages
  addLanguage: () => void;
  updateLanguage: (id: string, data: Partial<CustomSectionItem>) => void;
  removeLanguage: (id: string) => void;
  moveLanguage: (activeId: string, overId: string) => void;

  // Interests
  addInterest: () => void;
  updateInterest: (id: string, data: Partial<CustomSectionItem>) => void;
  removeInterest: (id: string) => void;
  moveInterest: (activeId: string, overId: string) => void;

  // Websites
  addWebsite: () => void;
  updateWebsite: (id: string, data: Partial<CustomSectionItem>) => void;
  removeWebsite: (id: string) => void;
  moveWebsite: (activeId: string, overId: string) => void;
}

export const initialCVData: TemplateProps = {
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    jobTitle: '',
    website: '',
    linkedin: '',
    github: '',
  },
  professionalSummary: {
    content: '',
  },
  workExperiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  awards: [],
  publications: [],
  languages: [],
  interests: [],
  websites: [],
  coverLetter: {
    recipientName: '',
    recipientTitle: '',
    companyName: '',
    companyAddress: '',
    content: '',
  },
  sections: [],
  theme: {
    primaryColor: '#475569',
    secondaryColor: '#4b5563',
    fontFamily: '',
    fontSize: 'medium',
    letterSpacing: 'normal',
    lineSpacing: 'normal',
    dateLocale: 'en-US',
  },
  coverLetterTheme: {
    primaryColor: '#475569',
    secondaryColor: '#4b5563',
    fontFamily: '',
    fontSize: 'medium',
    letterSpacing: 'normal',
    lineSpacing: 'normal',
    templateKey: 'soft-modern',
    dateLocale: 'en-US',
  },
};

export const useCVStore = create<CVStore>((set, get) => ({
  cvData: initialCVData,
  aiAnalysis: null,
  activeDocumentMode: 'resume',
  templates: [],
  coverLetterTemplates: [],
  coverLetterGenerationMode: 'local',
  selectedTemplate: 'classic',
  currentResumeId: null,
  lastSaved: null,
  isLoading: false,
  isSaving: false,
  isDirty: false,
  error: null,
  coverLetterHistory: [],
  isHistoryLoading: false,
  historyError: null,
  isCLGenerating: false,

  reset: () => set({
    cvData: initialCVData,
    aiAnalysis: null,
    activeDocumentMode: 'resume',
    currentResumeId: null,
    lastSaved: null,
    isLoading: false,
    isSaving: false,
    isDirty: false,
    error: null,
    coverLetterHistory: [],
    isHistoryLoading: false,
    historyError: null,
    isCLGenerating: false,
  }),
  
  setCurrentResumeId: (id) => set({ currentResumeId: id }),

  fetchTemplates: async () => {
    try {
      const templates = await resumeService.getTemplates();
      set({ templates });
    } catch {}
  },
  
  fetchCoverLetterTemplates: async () => {
    try {
      const templates = await resumeService.getCoverLetterTemplates();
      set({ coverLetterTemplates: templates });
    } catch {}
  },

  fetchDefaultResume: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await resumeService.getDefaultResume();
      const { aiAnalysis: nextAIAnalysis, ...resumeData } = data;
      set({ 
        cvData: { 
          ...resumeData,
          coverLetter: {
            recipientName: data.coverLetter?.recipientName ?? '',
            recipientTitle: data.coverLetter?.recipientTitle ?? '',
            companyName: data.coverLetter?.companyName ?? '',
            companyAddress: data.coverLetter?.companyAddress ?? '',
            content: data.coverLetter?.content ?? '',
            jobTitle: data.coverLetter?.jobTitle,
            jobDescription: data.coverLetter?.jobDescription,
            templateKey: (data.coverLetter?.templateKey ?? data.coverLetterTheme?.templateKey ?? 'soft-modern') as CoverLetterTemplateId
          },
          coverLetterTheme: data.coverLetterTheme ?? initialCVData.coverLetterTheme 
        }, 
        aiAnalysis: nextAIAnalysis ?? null,
        selectedTemplate: data.template_key,
        currentResumeId: data.id,
        lastSaved: new Date(data.updatedAt),
        isLoading: false,
        isDirty: false
      });
    } catch {
      set({ error: 'Failed to load resume data', isLoading: false });
    }
  },

  fetchResumeById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await resumeService.getResumeById(id);
      const { aiAnalysis: nextAIAnalysis, ...resumeData } = data;
      set({ 
        cvData: { 
          ...resumeData,
          coverLetter: {
            recipientName: data.coverLetter?.recipientName ?? '',
            recipientTitle: data.coverLetter?.recipientTitle ?? '',
            companyName: data.coverLetter?.companyName ?? '',
            companyAddress: data.coverLetter?.companyAddress ?? '',
            content: data.coverLetter?.content ?? '',
            jobTitle: data.coverLetter?.jobTitle,
            jobDescription: data.coverLetter?.jobDescription,
            templateKey: (data.coverLetter?.templateKey ?? data.coverLetterTheme?.templateKey ?? 'soft-modern') as CoverLetterTemplateId
          },
          coverLetterTheme: data.coverLetterTheme ?? initialCVData.coverLetterTheme 
        }, 
        aiAnalysis: nextAIAnalysis ?? null,
        selectedTemplate: data.template_key,
        currentResumeId: data.id,
        lastSaved: new Date(data.updatedAt),
        isLoading: false,
        isDirty: false
      });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status;
      const errorMessage = status === 404 
        ? 'Resume not found' 
        : 'Failed to load resume data';
      set({ error: errorMessage, isLoading: false });
    }
  },

  saveResume: async () => {
    const { currentResumeId, cvData, selectedTemplate, isSaving } = get();
    if (!currentResumeId || isSaving) return;

    set({ isSaving: true });
    try {
      const payload = {
        ...cvData,
        id: currentResumeId,
        template_id: selectedTemplate,
        template_key: selectedTemplate,
        createdAt: get().lastSaved?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = await resumeService.updateResume(currentResumeId, payload);
      set({ isSaving: false, error: null, lastSaved: new Date(response.updatedAt), isDirty: false });
    } catch (error) {
      set({ isSaving: false, error: 'Failed to save changes' });
      throw error;
    }
  },

  saveAIAnalysis: async (analysis) => {
    const { currentResumeId, cvData, selectedTemplate, isSaving } = get();
    if (!currentResumeId || isSaving) return;

    set({ isSaving: true, aiAnalysis: analysis });
    try {
      const payload = {
        ...cvData,
        id: currentResumeId,
        template_id: selectedTemplate,
        template_key: selectedTemplate,
        aiAnalysis: analysis,
        createdAt: get().lastSaved?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = await resumeService.updateResume(currentResumeId, payload);
      set({ isSaving: false, error: null, lastSaved: new Date(response.updatedAt), isDirty: false });
    } catch (error) {
      set({ isSaving: false, error: 'Failed to save AI analysis' });
      throw error;
    }
  },
  
  setTemplate: (id) => {
    set({ selectedTemplate: id, isDirty: true });
    const { currentResumeId } = get();
    if (currentResumeId) {
      get().saveResume();
    }
  },
  
  updateTheme: (theme) => set((state) => ({
    isDirty: true,
    cvData: { ...state.cvData, theme: { ...state.cvData.theme, ...theme } }
  })),
  
  updateCoverLetterTheme: (theme: Partial<ThemeConfig>) => set((state) => ({
    isDirty: true,
    cvData: { ...state.cvData, coverLetterTheme: { ...state.cvData.coverLetterTheme!, ...theme } }
  })),
  
  updatePersonalDetails: (details) => set((state) => ({
    isDirty: true,
    cvData: { ...state.cvData, personalDetails: { ...state.cvData.personalDetails, ...details } }
  })),
  
  updateSummary: (summary) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      professionalSummary: {
        ...state.cvData.professionalSummary,
        content: summary
      }
    }
  })),

  updateCoverLetter: (data: Partial<CoverLetter>) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      coverLetter: {
        ...state.cvData.coverLetter!,
        ...data
      }
    }
  })),
  setCoverLetterGenerationMode: (mode) => set({ coverLetterGenerationMode: mode }),

  createCoverLetter: async (data) => {
    const { currentResumeId } = get();
    if (!currentResumeId) return;
    const payload = {
      title: data.title,
      recipientName: data.recipientName ?? '',
      recipientTitle: data.recipientTitle ?? '',
      companyName: data.companyName ?? '',
      companyAddress: data.companyAddress ?? '',
      content: data.content ?? '',
      jobTitle: data.jobTitle ?? '',
      jobDescription: data.jobDescription ?? '',
    };
    const created = await resumeService.createCoverLetter(currentResumeId, payload);
    set((state) => ({
      activeDocumentMode: 'cover-letter',
      cvData: {
        ...state.cvData,
        coverLetter: {
          recipientName: created.recipientName,
          recipientTitle: created.recipientTitle,
          companyName: created.companyName,
          companyAddress: created.companyAddress,
          content: created.content,
          jobTitle: created.jobTitle,
          jobDescription: created.jobDescription,
        }
      }
    }));
  },
  
  generateCoverLetter: async (data) => {
    const { currentResumeId, cvData } = get();
    if (!currentResumeId) return;
    set({ isCLGenerating: true });
    const payload = {
      title: data.title,
      recipientName: data.recipientName ?? '',
      recipientTitle: data.recipientTitle ?? '',
      companyName: data.companyName ?? '',
      companyAddress: data.companyAddress ?? '',
      jobTitle: data.jobTitle ?? '',
      jobDescription: data.jobDescription ?? '',
      templateKey: (data.templateKey ?? (cvData.coverLetter?.templateKey as CoverLetterTemplateId) ?? 'soft-modern') as string,
    };
    const generated = await resumeService.generateCoverLetter(currentResumeId, payload);
    set((state) => ({
      activeDocumentMode: 'cover-letter',
      cvData: {
        ...state.cvData,
        coverLetter: {
          templateKey: payload.templateKey as CoverLetterTemplateId,
          recipientName: generated.recipientName,
          recipientTitle: generated.recipientTitle,
          companyName: generated.companyName,
          companyAddress: generated.companyAddress,
          content: generated.content,
          jobTitle: generated.jobTitle,
          jobDescription: generated.jobDescription,
        }
      }
    }));
    set({ isCLGenerating: false });
  },
  
  tailorResume: async (data) => {
    const { currentResumeId } = get();
    if (!currentResumeId) return;
    const payload = {
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      tone: data.tone ?? 'professional',
    };
    const updated = await resumeService.tailorResume(currentResumeId, payload);
    set((state) => ({
      activeDocumentMode: 'resume',
      cvData: {
        ...updated,
        coverLetter: state.cvData.coverLetter ?? updated.coverLetter,
        coverLetterTheme: state.cvData.coverLetterTheme ?? updated.coverLetterTheme,
      },
      selectedTemplate: updated.template_key,
      currentResumeId: updated.id,
      lastSaved: new Date(updated.updatedAt),
      isDirty: false,
      error: null,
    }));
  },
  
  fetchCoverLetterHistory: async () => {
    const { currentResumeId } = get();
    if (!currentResumeId) return;
    set({ isHistoryLoading: true, historyError: null });
    try {
      const items = await resumeService.getCoverLetters(currentResumeId);
      set({ coverLetterHistory: items, isHistoryLoading: false });
    } catch (error) {
      set({ isHistoryLoading: false, historyError: 'Failed to load cover letter history' });
      throw error;
    }
  },

  selectCoverLetterFromHistory: (item) => {
    set((state) => ({
      activeDocumentMode: 'cover-letter',
      cvData: {
        ...state.cvData,
        coverLetter: {
          recipientName: item.recipientName,
          recipientTitle: item.recipientTitle,
          companyName: item.companyName,
          companyAddress: item.companyAddress,
          content: item.content,
          jobTitle: item.jobTitle,
          jobDescription: item.jobDescription,
        }
      }
    }));
  },

  setDocumentMode: (mode) => set({ activeDocumentMode: mode }),
  
  setSections: (sections) => set((state) => ({
    isDirty: true,
    cvData: { ...state.cvData, sections }
  })),
  
  toggleSectionVisibility: (id) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      sections: state.cvData.sections.map((s) => 
        s.id === id ? { ...s, isVisible: !s.isVisible } : s
      )
    }
  })),
  
  updateSectionTitle: (id, title) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      sections: state.cvData.sections.map((s) => 
        s.id === id ? { ...s, title } : s
      )
    }
  })),
  
  addExperience: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      workExperiences: [
        ...state.cvData.workExperiences,
        {
          id: crypto.randomUUID(),
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        }
      ]
    }
  })),
  
  updateExperience: (id, data) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      workExperiences: state.cvData.workExperiences.map((exp) => 
        exp.id === id ? { ...exp, ...data } : exp
      )
    }
  })),
  
  removeExperience: (id) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      workExperiences: state.cvData.workExperiences.filter((exp) => exp.id !== id)
    }
  })),

  moveExperience: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.workExperiences.findIndex((exp) => exp.id === activeId);
    const overIndex = state.cvData.workExperiences.findIndex((exp) => exp.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const workExperiences = [...state.cvData.workExperiences];
    const [moved] = workExperiences.splice(activeIndex, 1);
    workExperiences.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        workExperiences,
      }
    };
  }),
  
  addEducation: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      education: [
        ...state.cvData.education,
        {
          id: crypto.randomUUID(),
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        }
      ]
    }
  })),
  
  updateEducation: (id, data) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      education: state.cvData.education.map((edu) => 
        edu.id === id ? { ...edu, ...data } : edu
      )
    }
  })),
  
  removeEducation: (id) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      education: state.cvData.education.filter((edu) => edu.id !== id)
    }
  })),

  moveEducation: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.education.findIndex((edu) => edu.id === activeId);
    const overIndex = state.cvData.education.findIndex((edu) => edu.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const education = [...state.cvData.education];
    const [moved] = education.splice(activeIndex, 1);
    education.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        education,
      }
    };
  }),

  addSkill: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      skills: [
        ...state.cvData.skills,
        {
          id: crypto.randomUUID(),
          name: '',
          level: 'Intermediate',
        }
      ]
    }
  })),
  
  updateSkill: (id, data) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      skills: state.cvData.skills.map((skill) => 
        skill.id === id ? { ...skill, ...data } : skill
      )
    }
  })),
  
  removeSkill: (id) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      skills: state.cvData.skills.filter((skill) => skill.id !== id)
    }
  })),

  moveSkill: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.skills.findIndex((skill) => skill.id === activeId);
    const overIndex = state.cvData.skills.findIndex((skill) => skill.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const skills = [...state.cvData.skills];
    const [moved] = skills.splice(activeIndex, 1);
    skills.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        skills
      }
    };
  }),
  
  addProject: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      projects: [
        ...state.cvData.projects,
        {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          technologies: [],
          link: '',
        }
      ]
    }
  })),
  
  updateProject: (id, data) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      projects: state.cvData.projects.map((proj) => 
        proj.id === id ? { ...proj, ...data } : proj
      )
    }
  })),
  
  removeProject: (id) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      projects: state.cvData.projects.filter((proj) => proj.id !== id)
    }
  })),

  moveProject: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.projects.findIndex((proj) => proj.id === activeId);
    const overIndex = state.cvData.projects.findIndex((proj) => proj.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const projects = [...state.cvData.projects];
    const [moved] = projects.splice(activeIndex, 1);
    projects.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        projects,
      }
    };
  }),

  addCertification: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      certifications: [
        ...state.cvData.certifications,
        {
          id: crypto.randomUUID(),
          name: '',
          issuer: '',
          issueDate: '',
          link: '',
        }
      ]
    }
  })),
  
  updateCertification: (id, data) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      certifications: state.cvData.certifications.map((cert) => 
        cert.id === id ? { ...cert, ...data } : cert
      )
    }
  })),
  
  removeCertification: (id) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      certifications: state.cvData.certifications.filter((cert) => cert.id !== id)
    }
  })),

  moveCertification: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.certifications.findIndex((cert) => cert.id === activeId);
    const overIndex = state.cvData.certifications.findIndex((cert) => cert.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const certifications = [...state.cvData.certifications];
    const [moved] = certifications.splice(activeIndex, 1);
    certifications.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        certifications,
      }
    };
  }),

  addAward: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      awards: [
        ...state.cvData.awards,
        {
          id: crypto.randomUUID(),
          title: '',
          issuer: '',
          date: '',
          description: '',
        }
      ]
    }
  })),

  updateAward: (id, data) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      awards: state.cvData.awards.map((award) => 
        award.id === id ? { ...award, ...data } : award
      )
    }
  })),

  removeAward: (id) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      awards: state.cvData.awards.filter((award) => award.id !== id)
    }
  })),

  moveAward: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.awards.findIndex((award) => award.id === activeId);
    const overIndex = state.cvData.awards.findIndex((award) => award.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const awards = [...state.cvData.awards];
    const [moved] = awards.splice(activeIndex, 1);
    awards.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        awards,
      }
    };
  }),

  addPublication: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      publications: [
        ...state.cvData.publications,
        {
          id: crypto.randomUUID(),
          title: '',
          publisher: '',
          date: '',
          description: '',
          link: '',
        }
      ]
    }
  })),

  updatePublication: (id, data) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      publications: state.cvData.publications.map((pub) => 
        pub.id === id ? { ...pub, ...data } : pub
      )
    }
  })),

  removePublication: (id) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      publications: state.cvData.publications.filter((pub) => pub.id !== id)
    }
  })),

  movePublication: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.publications.findIndex((pub) => pub.id === activeId);
    const overIndex = state.cvData.publications.findIndex((pub) => pub.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const publications = [...state.cvData.publications];
    const [moved] = publications.splice(activeIndex, 1);
    publications.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        publications,
      }
    };
  }),

  addLanguage: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      languages: [
        ...state.cvData.languages,
        {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          date: '',
          location: '',
          url: '',
        }
      ]
    }
  })),

  updateLanguage: (id: string, data: Partial<CustomSectionItem>) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      languages: state.cvData.languages.map((lang) => 
        lang.id === id ? { ...lang, ...data } : lang
      )
    }
  })),

  removeLanguage: (id: string) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      languages: state.cvData.languages.filter((lang) => lang.id !== id)
    }
  })),

  moveLanguage: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.languages.findIndex((lang) => lang.id === activeId);
    const overIndex = state.cvData.languages.findIndex((lang) => lang.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const languages = [...state.cvData.languages];
    const [moved] = languages.splice(activeIndex, 1);
    languages.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        languages,
      }
    };
  }),

  addInterest: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      interests: [
        ...state.cvData.interests,
        {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          date: '',
          location: '',
          url: '',
        }
      ]
    }
  })),

  updateInterest: (id: string, data: Partial<CustomSectionItem>) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      interests: state.cvData.interests.map((int) => 
        int.id === id ? { ...int, ...data } : int
      )
    }
  })),

  removeInterest: (id: string) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      interests: state.cvData.interests.filter((int) => int.id !== id)
    }
  })),

  moveInterest: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.interests.findIndex((int) => int.id === activeId);
    const overIndex = state.cvData.interests.findIndex((int) => int.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const interests = [...state.cvData.interests];
    const [moved] = interests.splice(activeIndex, 1);
    interests.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        interests,
      }
    };
  }),

  addWebsite: () => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      websites: [
        ...state.cvData.websites,
        {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          date: '',
          location: '',
          url: '',
        }
      ]
    }
  })),

  updateWebsite: (id: string, data: Partial<CustomSectionItem>) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      websites: state.cvData.websites.map((web) => 
        web.id === id ? { ...web, ...data } : web
      )
    }
  })),

  removeWebsite: (id: string) => set((state) => ({
    isDirty: true,
    cvData: {
      ...state.cvData,
      websites: state.cvData.websites.filter((web) => web.id !== id)
    }
  })),

  moveWebsite: (activeId, overId) => set((state) => {
    const activeIndex = state.cvData.websites.findIndex((web) => web.id === activeId);
    const overIndex = state.cvData.websites.findIndex((web) => web.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return state;
    }

    const websites = [...state.cvData.websites];
    const [moved] = websites.splice(activeIndex, 1);
    websites.splice(overIndex, 0, moved);

    return {
      isDirty: true,
      cvData: {
        ...state.cvData,
        websites,
      }
    };
  }),
}));
