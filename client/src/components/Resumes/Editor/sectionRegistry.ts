import type React from 'react';

import { PersonalDetailsForm } from '@/src/components/Resumes/Editor/Forms/PersonalDetailsForm';
import { SummaryForm } from '@/src/components/Resumes/Editor/Forms/SummaryForm';
import { ExperienceForm } from '@/src/components/Resumes/Editor/Forms/ExperienceForm';
import { EducationForm } from '@/src/components/Resumes/Editor/Forms/EducationForm';
import { SkillsForm } from '@/src/components/Resumes/Editor/Forms/SkillsForm';
import { ProjectsForm } from '@/src/components/Resumes/Editor/Forms/ProjectsForm';
import { CertificationsForm } from '@/src/components/Resumes/Editor/Forms/CertificationsForm';
import { AwardsForm } from '@/src/components/Resumes/Editor/Forms/AwardsForm';
import { PublicationsForm } from '@/src/components/Resumes/Editor/Forms/PublicationsForm';
import { LanguagesForm } from '@/src/components/Resumes/Editor/Forms/LanguagesForm';
import { InterestsForm } from '@/src/components/Resumes/Editor/Forms/InterestsForm';
import { WebsitesForm } from '@/src/components/Resumes/Editor/Forms/WebsitesForm';

import type { EditorSectionType } from '@/src/components/Resumes/Editor/sectionConfig';

export const SECTION_FORMS: Record<EditorSectionType, React.FC> = {
  personal: PersonalDetailsForm,
  summary: SummaryForm,
  experience: ExperienceForm,
  education: EducationForm,
  skills: SkillsForm,
  projects: ProjectsForm,
  certifications: CertificationsForm,
  awards: AwardsForm,
  publications: PublicationsForm,
  languages: LanguagesForm,
  interests: InterestsForm,
  websites: WebsitesForm,
};
