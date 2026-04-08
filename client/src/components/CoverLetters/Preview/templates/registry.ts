import React from 'react';
import type { PersonalDetails, ThemeConfig, CoverLetter, CoverLetterTemplateId } from '../../../../types/resume';
import { COVER_LETTER_TEMPLATE_COMPONENTS } from './registry.generated';

export { COVER_LETTER_TEMPLATE_COMPONENTS };

export interface CoverLetterTemplateProps {
  personalDetails: PersonalDetails;
  coverLetter: CoverLetter;
  theme: ThemeConfig;
}

export function isCoverLetterTemplateId(value: string): value is CoverLetterTemplateId {
  return value in COVER_LETTER_TEMPLATE_COMPONENTS;
}

export function getCoverLetterTemplateComponent(id: CoverLetterTemplateId): React.ComponentType<CoverLetterTemplateProps> {
  const component = COVER_LETTER_TEMPLATE_COMPONENTS[id] ?? COVER_LETTER_TEMPLATE_COMPONENTS['soft-modern'];
  if (!component) {
    throw new Error(`Unknown cover letter template: ${id}`);
  }
  return component;
}

export function mapCVDataToCLTemplateProps(data: {
  personalDetails: PersonalDetails;
  coverLetter?: CoverLetter;
  theme: ThemeConfig;
  coverLetterTheme?: ThemeConfig;
}): CoverLetterTemplateProps {
  return {
    personalDetails: {
      fullName: data.personalDetails.fullName,
      email: data.personalDetails.email,
      phone: data.personalDetails.phone,
      address: data.personalDetails.address,
      jobTitle: data.personalDetails.jobTitle,
      website: data.personalDetails.website,
      linkedin: data.personalDetails.linkedin,
      github: data.personalDetails.github,
    },
    coverLetter: {
      recipientName: data.coverLetter?.recipientName || '',
      recipientTitle: data.coverLetter?.recipientTitle || '',
      companyName: data.coverLetter?.companyName || '',
      companyAddress: data.coverLetter?.companyAddress || '',
      content: data.coverLetter?.content || '',
      jobTitle: data.coverLetter?.jobTitle,
      jobDescription: data.coverLetter?.jobDescription,
      templateKey: data.coverLetter?.templateKey
    },
    theme: {
      primaryColor: (data.coverLetterTheme?.primaryColor ?? data.theme.primaryColor),
      secondaryColor: (data.coverLetterTheme?.secondaryColor ?? data.theme.secondaryColor),
      fontFamily: (data.coverLetterTheme?.fontFamily ?? data.theme.fontFamily),
      dateLocale: (data.coverLetterTheme?.dateLocale ?? data.theme.dateLocale),
    },
  };
}
