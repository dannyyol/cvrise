import type { TemplateProps } from '../types/resume';
import { mapCVDataToTemplateProps } from '../components/Resumes/Preview/templates/registry';

export interface CVPayload {
  template: string;
  data: TemplateProps;
}

export const buildCVPayload = (cvData: TemplateProps, templateId: string = 'classic'): CVPayload => {
  return {
    template: templateId,
    data: mapCVDataToTemplateProps(cvData)
  };
};

export const buildCoverLetterPayload = (
  cvData: TemplateProps,
  templateKey: string = cvData.coverLetterTheme?.templateKey || cvData.coverLetter?.templateKey || 'soft-modern'
): CVPayload => {
  return {
    template: templateKey,
    data: cvData
  };
};
