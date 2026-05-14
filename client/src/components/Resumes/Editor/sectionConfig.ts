import type { CVSection } from '@/src/types/resume';

export const DEFAULT_SECTIONS = ['personal', 'summary', 'experience', 'education', 'skills'] as const;
export const ADDITIONAL_SECTIONS = ['projects', 'certifications', 'awards', 'publications', 'languages', 'interests', 'websites'] as const;

export type EditorSectionType = typeof DEFAULT_SECTIONS[number] | typeof ADDITIONAL_SECTIONS[number];

export const GUEST_SECTIONS: CVSection[] = [
  { id: 'personal',       type: 'personal',       title: 'Personal Details',          isVisible: true,  order: 0  },
  { id: 'summary',        type: 'summary',         title: 'Professional Summary',      isVisible: true,  order: 1  },
  { id: 'experience',     type: 'experience',      title: 'Work Experience',           isVisible: true,  order: 2  },
  { id: 'education',      type: 'education',       title: 'Education',                 isVisible: true,  order: 3  },
  { id: 'skills',         type: 'skills',          title: 'Skills',                    isVisible: true,  order: 4  },
  { id: 'projects',       type: 'projects',        title: 'Projects',                  isVisible: true,  order: 5  },
  { id: 'certifications', type: 'certifications',  title: 'Certifications',            isVisible: true,  order: 6  },
  { id: 'awards',         type: 'awards',          title: 'Awards',                    isVisible: true,  order: 7  },
  { id: 'publications',   type: 'publications',    title: 'Publications',              isVisible: true,  order: 8  },
  { id: 'languages',      type: 'languages',       title: 'Languages',                 isVisible: false, order: 9  },
  { id: 'interests',      type: 'interests',       title: 'Hobbies & Interests',       isVisible: false, order: 10 },
  { id: 'websites',       type: 'websites',        title: 'Websites & Social Links',   isVisible: false, order: 11 },
];
