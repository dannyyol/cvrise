import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TEMPLATE_COMPONENTS } from '../src/components/Resumes/Preview/templates/registry.generated';
import { DEFAULT_SECTIONS, ADDITIONAL_SECTIONS } from '../src/components/Resumes/Editor/sectionConfig';
import { initialCVData, useCVStore } from '../src/store/useCVStore';

import { PersonalDetailsForm } from '../src/components/Resumes/Editor/Forms/PersonalDetailsForm';
import { SummaryForm } from '../src/components/Resumes/Editor/Forms/SummaryForm';
import { ExperienceForm } from '../src/components/Resumes/Editor/Forms/ExperienceForm';
import { EducationForm } from '../src/components/Resumes/Editor/Forms/EducationForm';
import { SkillsForm } from '../src/components/Resumes/Editor/Forms/SkillsForm';
import { ProjectsForm } from '../src/components/Resumes/Editor/Forms/ProjectsForm';
import { CertificationsForm } from '../src/components/Resumes/Editor/Forms/CertificationsForm';
import { AwardsForm } from '../src/components/Resumes/Editor/Forms/AwardsForm';
import { PublicationsForm } from '../src/components/Resumes/Editor/Forms/PublicationsForm';
import { LanguagesForm } from '../src/components/Resumes/Editor/Forms/LanguagesForm';
import { InterestsForm } from '../src/components/Resumes/Editor/Forms/InterestsForm';
import { WebsitesForm } from '../src/components/Resumes/Editor/Forms/WebsitesForm';

afterEach(() => cleanup());

const TEMPLATE_IDS = Object.keys(TEMPLATE_COMPONENTS).sort((a, b) => a.localeCompare(b));
const SECTION_IDS = [...DEFAULT_SECTIONS, ...ADDITIONAL_SECTIONS];

const SECTION_TITLES = {
  personal: 'Personal Details',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  awards: 'Awards',
  publications: 'Publications',
  languages: 'Languages',
  interests: 'Hobbies & Interests',
  websites: 'Websites & Social Links',
};

function buildAllSectionsVisible() {
  return SECTION_IDS.map((id, index) => ({
    id,
    type: id,
    title: SECTION_TITLES[id] ?? id,
    isVisible: true,
    order: index,
  }));
}

function buildPopulatedTemplateProps() {
  return {
    ...initialCVData,
    personalDetails: {
      fullName: 'TEMPLATE_TEST_FULL_NAME',
      email: 'test@example.com',
      phone: '+1 555 000 0000',
      address: 'Test City',
      jobTitle: 'TEMPLATE_TEST_JOB_TITLE',
      website: 'https://example.com',
      linkedin: 'https://linkedin.com/in/example',
      github: 'https://github.com/example',
    },
    professionalSummary: {
      content: '<p>TEMPLATE_TEST_SUMMARY</p>',
    },
    workExperiences: [
      {
        id: 'exp-1',
        company: 'TEMPLATE_TEST_COMPANY',
        position: 'TEMPLATE_TEST_POSITION',
        location: 'Remote',
        startDate: '2024-01',
        endDate: '2025-01',
        current: false,
        description: '<p>TEMPLATE_TEST_EXPERIENCE_DESC</p>',
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'TEMPLATE_TEST_SCHOOL',
        degree: 'TEMPLATE_TEST_DEGREE',
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01',
        endDate: '2023-01',
        current: false,
        description: '<p>TEMPLATE_TEST_EDU_DESC</p>',
      },
    ],
    skills: [
      { id: 'sk-1', name: 'Languages', items: ['TEMPLATE_TEST_SKILL'], level: '' },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'TEMPLATE_TEST_PROJECT',
        description: '<p>TEMPLATE_TEST_PROJECT_DESC</p>',
        technologies: ['React', 'TypeScript'],
        link: 'https://github.com/example/project',
        startDate: '2023-01',
        endDate: '2023-06',
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'TEMPLATE_TEST_CERT',
        issuer: 'TEMPLATE_TEST_ISSUER',
        issueDate: '2023-01',
        expiryDate: '2026-01',
        credentialId: 'ABC-123',
        link: 'https://example.com/cert',
      },
    ],
    awards: [
      {
        id: 'award-1',
        title: 'TEMPLATE_TEST_AWARD',
        issuer: 'TEMPLATE_TEST_AWARD_ISSUER',
        date: '2022',
        description: '<p>TEMPLATE_TEST_AWARD_DESC</p>',
      },
    ],
    publications: [
      {
        id: 'pub-1',
        title: 'TEMPLATE_TEST_PUBLICATION',
        publisher: 'TEMPLATE_TEST_PUBLISHER',
        date: '2021',
        description: '<p>TEMPLATE_TEST_PUBLICATION_DESC</p>',
        link: 'https://example.com/publication',
      },
    ],
    languages: [
      { id: 'lang-1', name: 'TEMPLATE_TEST_LANGUAGE', description: 'Fluent', date: '', location: '', url: '' },
    ],
    interests: [
      { id: 'int-1', name: 'TEMPLATE_TEST_INTEREST', description: '', date: '', location: '', url: '' },
    ],
    websites: [
      { id: 'web-1', name: 'TEMPLATE_TEST_WEBSITE', description: '', date: '', location: '', url: 'https://template-test-website.invalid' },
    ],
    sections: buildAllSectionsVisible(),
    theme: {
      ...initialCVData.theme,
      primaryColor: '#123456',
      fontFamily: 'Arial, sans-serif',
      dateLocale: 'en-US',
    },
  };
}

function resetStoreForEditor(templateId) {
  useCVStore.setState({
    selectedTemplate: templateId,
    activeDocumentMode: 'resume',
    isDirty: false,
    cvData: {
      ...initialCVData,
      sections: buildAllSectionsVisible(),
    },
  });
}

async function typeIntoFirstRichTextEditor(user, container, text) {
  const editor = container.querySelector('.ProseMirror');
  expect(editor).not.toBeNull();
  await user.click(editor);
  await user.type(editor, text);
}

describe.each(TEMPLATE_IDS)('resume template: %s', (templateId) => {
  it('implements all resume sections in the preview template', () => {
    const TemplateComponent = TEMPLATE_COMPONENTS[templateId];
    const props = buildPopulatedTemplateProps();
    const { container } = render(<TemplateComponent {...props} />);

    for (const sectionId of SECTION_IDS) {
      const selectors =
        sectionId === 'personal'
          ? [
              `[data-cv-section][data-section-id="personal"]`,
              `[data-cv-section][data-section-id="contact"]`,
            ]
          : [`[data-cv-section][data-section-id="${sectionId}"]`];

      const el = selectors.map((s) => container.querySelector(s)).find(Boolean);
      const title = SECTION_TITLES[sectionId];
      const hasTitle = Boolean(title && (container.textContent ?? '').includes(title));
      expect(
        el || hasTitle,
        `Missing section "${sectionId}" in template "${templateId}"`
      ).toBeTruthy();
    }

    const fullText = container.textContent ?? '';
    expect(fullText).toContain('TEMPLATE_TEST_FULL_NAME');
    expect(fullText).toContain('TEMPLATE_TEST_SUMMARY');
    expect(fullText).toContain('TEMPLATE_TEST_POSITION');
    expect(fullText).toContain('TEMPLATE_TEST_COMPANY');
    expect(fullText).toContain('TEMPLATE_TEST_DEGREE');
    expect(fullText).toContain('TEMPLATE_TEST_SCHOOL');
    expect(fullText).toContain('TEMPLATE_TEST_SKILL');
    expect(fullText).toContain('TEMPLATE_TEST_PROJECT');
    expect(fullText).toContain('TEMPLATE_TEST_CERT');
    expect(fullText).toContain('TEMPLATE_TEST_AWARD');
    if (templateId === 'chronicle') {
      expect(fullText).toContain('TEMPLATE_TEST_AWARD_DESC');
    }
    if (templateId === 'timeline') {
      expect(fullText).toContain('TEMPLATE_TEST_AWARD_DESC');
    }
    expect(fullText).toContain('TEMPLATE_TEST_PUBLICATION');
    expect(fullText).toContain('TEMPLATE_TEST_LANGUAGE');
    expect(fullText).toContain('TEMPLATE_TEST_INTEREST');
    expect(fullText).toMatch(/TEMPLATE_TEST_WEBSITE|template-test-website\.invalid/);
    expect(fullText).toMatch(/github\.com\/example/);
  });

  it('has all sections editable in the editor forms', async () => {
    const user = userEvent.setup();
    resetStoreForEditor(templateId);

    {
      const { container, unmount } = render(<PersonalDetailsForm />);
      const fullName = screen.getByPlaceholderText('e.g. John Doe');
      await user.click(fullName);
      await user.clear(fullName);
      await user.type(fullName, 'EDITOR_TEST_FULL_NAME');
      expect(useCVStore.getState().cvData.personalDetails.fullName).toContain('EDITOR_TEST_FULL_NAME');
      unmount();
      cleanup();
      expect(container).toBeTruthy();
    }

    resetStoreForEditor(templateId);
    {
      const { container, unmount } = render(<SummaryForm />);
      await typeIntoFirstRichTextEditor(user, container, 'EDITOR_TEST_SUMMARY');
      expect(useCVStore.getState().cvData.professionalSummary.content).toContain('EDITOR_TEST_SUMMARY');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { container, unmount } = render(<ExperienceForm />);
      await user.click(screen.getByRole('button', { name: /add experience/i }));
      await user.click(screen.getByText('New Position'));
      const position = screen.getByPlaceholderText('e.g. Senior Frontend Developer');
      await user.type(position, 'EDITOR_TEST_POSITION');
      const [exp] = useCVStore.getState().cvData.workExperiences;
      expect(exp?.position).toBe('EDITOR_TEST_POSITION');
      await typeIntoFirstRichTextEditor(user, container, 'EDITOR_TEST_EXPERIENCE_DESC');
      expect(useCVStore.getState().cvData.workExperiences[0]?.description).toContain('EDITOR_TEST_EXPERIENCE_DESC');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { container, unmount } = render(<EducationForm />);
      await user.click(screen.getByRole('button', { name: /add education/i }));
      await user.click(screen.getByText('New Education'));
      const degree = screen.getByPlaceholderText('e.g. Bachelor of Science');
      await user.type(degree, 'EDITOR_TEST_DEGREE');
      expect(useCVStore.getState().cvData.education[0]?.degree).toBe('EDITOR_TEST_DEGREE');
      await typeIntoFirstRichTextEditor(user, container, 'EDITOR_TEST_EDU_DESC');
      expect(useCVStore.getState().cvData.education[0]?.description).toContain('EDITOR_TEST_EDU_DESC');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { unmount } = render(<SkillsForm />);
      await user.click(screen.getByRole('button', { name: /add category/i }));
      const chipInput = screen.getByPlaceholderText('Add skill…');
      await user.type(chipInput, 'EDITOR_TEST_SKILL{Enter}');
      expect(useCVStore.getState().cvData.skills[0]?.items).toContain('EDITOR_TEST_SKILL');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { container, unmount } = render(<ProjectsForm />);
      await user.click(screen.getByRole('button', { name: /add project/i }));
      await user.click(screen.getByText('New Project'));
      const projectName = screen.getByPlaceholderText('e.g. E-commerce Platform');
      await user.type(projectName, 'EDITOR_TEST_PROJECT');
      expect(useCVStore.getState().cvData.projects[0]?.name).toBe('EDITOR_TEST_PROJECT');
      await typeIntoFirstRichTextEditor(user, container, 'EDITOR_TEST_PROJECT_DESC');
      expect(useCVStore.getState().cvData.projects[0]?.description).toContain('EDITOR_TEST_PROJECT_DESC');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { unmount } = render(<CertificationsForm />);
      await user.click(screen.getByRole('button', { name: /add certification/i }));
      await user.click(screen.getByText('New Certification'));
      const certName = screen.getByPlaceholderText('e.g. AWS Certified Solutions Architect');
      await user.type(certName, 'EDITOR_TEST_CERT');
      expect(useCVStore.getState().cvData.certifications[0]?.name).toBe('EDITOR_TEST_CERT');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { container, unmount } = render(<AwardsForm />);
      await user.click(screen.getByRole('button', { name: /add award/i }));
      await user.click(screen.getByText('New Award'));
      const awardTitle = screen.getByPlaceholderText('e.g. Employee of the Year');
      await user.type(awardTitle, 'EDITOR_TEST_AWARD');
      expect(useCVStore.getState().cvData.awards[0]?.title).toBe('EDITOR_TEST_AWARD');
      await typeIntoFirstRichTextEditor(user, container, 'EDITOR_TEST_AWARD_DESC');
      expect(useCVStore.getState().cvData.awards[0]?.description).toContain('EDITOR_TEST_AWARD_DESC');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { container, unmount } = render(<PublicationsForm />);
      await user.click(screen.getByRole('button', { name: /add publication/i }));
      await user.click(screen.getByText('New Publication'));
      const pubTitle = screen.getByPlaceholderText('e.g. Research Paper');
      await user.type(pubTitle, 'EDITOR_TEST_PUBLICATION');
      expect(useCVStore.getState().cvData.publications[0]?.title).toBe('EDITOR_TEST_PUBLICATION');
      await typeIntoFirstRichTextEditor(user, container, 'EDITOR_TEST_PUBLICATION_DESC');
      expect(useCVStore.getState().cvData.publications[0]?.description).toContain('EDITOR_TEST_PUBLICATION_DESC');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { unmount } = render(<LanguagesForm />);
      await user.click(screen.getByRole('button', { name: /add language/i }));
      await user.click(screen.getByText('New Language'));
      const languageName = screen.getByPlaceholderText('e.g. English');
      await user.type(languageName, 'EDITOR_TEST_LANGUAGE');
      expect(useCVStore.getState().cvData.languages[0]?.name).toBe('EDITOR_TEST_LANGUAGE');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { unmount } = render(<InterestsForm />);
      await user.click(screen.getByRole('button', { name: /add interest/i }));
      await user.click(screen.getByText('New Interest'));
      const interestName = screen.getByPlaceholderText('e.g. Photography, Hiking');
      await user.type(interestName, 'EDITOR_TEST_INTEREST');
      expect(useCVStore.getState().cvData.interests[0]?.name).toBe('EDITOR_TEST_INTEREST');
      unmount();
      cleanup();
    }

    resetStoreForEditor(templateId);
    {
      const { unmount } = render(<WebsitesForm />);
      await user.click(screen.getByRole('button', { name: /add link/i }));
      await user.click(screen.getByText('New Link'));
      const websiteName = screen.getByPlaceholderText('e.g. LinkedIn, Portfolio');
      await user.type(websiteName, 'EDITOR_TEST_WEBSITE');
      expect(useCVStore.getState().cvData.websites[0]?.name).toBe('EDITOR_TEST_WEBSITE');
      unmount();
      cleanup();
    }
  });
});
