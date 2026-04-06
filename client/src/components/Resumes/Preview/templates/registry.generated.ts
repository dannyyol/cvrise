import type { ComponentType } from 'react';
import type { TemplateProps } from '../../../../types/resume';

import TemplateChronicle from './chronicle/Chronicle';
import TemplateClassic from './classic/Classic';
import TemplateElegant from './elegant/Elegant';
import TemplateHeritage from './heritage/Heritage';
import TemplateLegacy from './legacy/Legacy';
import TemplateProfessional from './professional/Professional';
import TemplateRegal from './regal/Regal';
import TemplateTimeline from './timeline/Timeline';

export const TEMPLATE_COMPONENTS: Record<string, ComponentType<TemplateProps>> = {
  'chronicle': TemplateChronicle,
  'classic': TemplateClassic,
  'elegant': TemplateElegant,
  'heritage': TemplateHeritage,
  'legacy': TemplateLegacy,
  'professional': TemplateProfessional,
  'regal': TemplateRegal,
  'timeline': TemplateTimeline,
};
