import React from 'react';
import type { PersonalDetails, ThemeConfig, CoverLetter, CoverLetterTemplateId } from '../../../../types/resume';
import SoftModern from './soft-modern/SoftModern';
import Aesthetic from './aesthetic/Aesthetic';
import Mono from './mono/Mono';
import Silhouette from './silhouette/Silhouette';

export interface CoverLetterTemplateProps {
  personalDetails: PersonalDetails;
  coverLetter: CoverLetter;
  theme: ThemeConfig;
}

export interface CoverLetterTemplateDefinition {
  name: string;
  description: string;
  thumbnail: string;
  component: React.ComponentType<CoverLetterTemplateProps>;
}

export const COVER_LETTER_TEMPLATE_REGISTRY: Record<CoverLetterTemplateId, CoverLetterTemplateDefinition> = {
  'soft-modern': {
    name: 'Soft Modern',
    description: 'Contemporary design with approachable typography.',
    thumbnail: '/thumbnails/cl-professional.png',
    component: SoftModern,
  },
  aesthetic: {
    name: 'Aesthetic',
    description: 'Elegant and refined with attention to visual balance.',
    thumbnail: '/thumbnails/cl-friendly.png',
    component: Aesthetic,
  },
  mono: {
    name: 'Mono',
    description: 'Clean, monospaced typography for a technical look.',
    thumbnail: '/thumbnails/cl-concise.png',
    component: Mono,
  },
  silhouette: {
    name: 'Silhouette',
    description: 'Bold and impactful with strong visual hierarchy.',
    thumbnail: '/thumbnails/cl-narrative.png',
    component: Silhouette,
  },
};

export function isCoverLetterTemplateId(value: string): value is CoverLetterTemplateId {
  return value in COVER_LETTER_TEMPLATE_REGISTRY;
}

export function getCoverLetterTemplateComponent(id: CoverLetterTemplateId): React.ComponentType<CoverLetterTemplateProps> {
  // Default to soft-modern (was professional)
  const def = COVER_LETTER_TEMPLATE_REGISTRY[id] ?? COVER_LETTER_TEMPLATE_REGISTRY['soft-modern'];
  return def.component;
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
      templateKey: data.coverLetter?.templateKey,
      tone: data.coverLetter?.tone,
      length: data.coverLetter?.length,
    },
    theme: {
      primaryColor: (data.coverLetterTheme?.primaryColor ?? data.theme.primaryColor),
      secondaryColor: (data.coverLetterTheme?.secondaryColor ?? data.theme.secondaryColor),
      fontFamily: (data.coverLetterTheme?.fontFamily ?? data.theme.fontFamily),
      dateLocale: (data.coverLetterTheme?.dateLocale ?? data.theme.dateLocale),
    },
  };
}
