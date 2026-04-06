export const DEFAULT_SECTIONS = ['personal', 'summary', 'experience', 'education', 'skills'] as const;
export const ADDITIONAL_SECTIONS = ['projects', 'certifications', 'awards', 'publications', 'languages', 'interests', 'websites'] as const;

export type EditorSectionType = typeof DEFAULT_SECTIONS[number] | typeof ADDITIONAL_SECTIONS[number];
