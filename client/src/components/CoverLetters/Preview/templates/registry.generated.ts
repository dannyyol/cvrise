import type { ComponentType } from 'react';
import type { PersonalDetails, ThemeConfig, CoverLetter } from '../../../../types/resume';

import TemplateAesthetic from './aesthetic/Aesthetic';
import TemplateMono from './mono/Mono';
import TemplateSilhouette from './silhouette/Silhouette';
import TemplateSoftModern from './soft-modern/SoftModern';

type CoverLetterTemplateProps = {
  personalDetails: PersonalDetails;
  coverLetter: CoverLetter;
  theme: ThemeConfig;
};

export const COVER_LETTER_TEMPLATE_COMPONENTS: Record<string, ComponentType<CoverLetterTemplateProps>> = {
  'aesthetic': TemplateAesthetic,
  'mono': TemplateMono,
  'silhouette': TemplateSilhouette,
  'soft-modern': TemplateSoftModern,
};
