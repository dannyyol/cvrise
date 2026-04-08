export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  jobTitle: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface ProfessionalSummary {
  content: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  link: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  description: string;
  link: string;
}

export interface CustomSectionItem {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  url: string;
}

export type SectionType = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'awards' | 'publications' | 'languages' | 'interests' | 'websites' | 'volunteering' | 'references';

export type TemplateId = string;
export type CoverLetterTemplateId = string;

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';
  lineSpacing?: 'tight' | 'compact' | 'normal' | 'loose' | 'looser';
  templateKey?: CoverLetterTemplateId;
  dateLocale?: string;
}

export interface Template {
  id: string;
  key: string;
  name: string;
  description: string;
  thumbnail: string;
  supports_accent: boolean;
   sidebar_section_keys?: string[];
}

export interface TemplateProps {
  personalDetails: PersonalDetails;
  professionalSummary: ProfessionalSummary;
  workExperiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  publications: Publication[];
  languages: CustomSectionItem[];
  interests: CustomSectionItem[];
  websites: CustomSectionItem[];
  coverLetter?: CoverLetter;
  sections: CVSection[];
  theme: ThemeConfig;
  coverLetterTheme?: ThemeConfig;
}

export interface CoverLetter {
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  content: string;
  jobTitle?: string;
  jobDescription?: string;
  templateKey?: CoverLetterTemplateId;
}

export interface CVSection {
  id: string;
  type: SectionType;
  title: string;
  isVisible: boolean;
  order: number;
}
