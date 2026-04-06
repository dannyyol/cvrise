import React from 'react';
import type { TemplateProps, WorkExperience, Education, Skill, Certification, CVSection } from '../../../../../types/resume';
import { formatDate, formatDateRange } from '@/src/lib/dateFormatting';
import './styles.css';

// --- Helper Components ---

const SectionHeader = ({ title }: { title: string }) => (
  <div className="cv-elegant-section-header">
    <span className="cv-elegant-section-title">{title}</span>
    <div className="cv-elegant-section-bar" />
  </div>
);

const FormatDate = ({ date, locale }: { date?: string | null; locale: string }) => {
  const label = formatDate(date, locale, 'month-year-numeric');
  return label ? <>{label}</> : null;
};

const HTMLContent = ({ content }: { content: string }) => (
  <div className="cv-elegant-p" dangerouslySetInnerHTML={{ __html: content }} />
);

// --- Section Renderers ---

const ContactSection = ({ personalDetails, title }: { personalDetails: any, title: string }) => {
  const { address, phone, email, website, linkedin, github } = personalDetails;
  
  const renderItem = (label: string, value: string, isLink: boolean = false) => {
    if (!value) return null;
    return (
      <div className="cv-elegant-contact-item">
        <span className="cv-elegant-contact-label">{label}:</span>{' '}
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="cv-elegant-link">
            {value.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          value
        )}
      </div>
    );
  };

  return (
    <div className="cv-elegant-section" data-cv-section data-section-id="personal">
      <SectionHeader title={title || 'Contact'} />
      <div className="cv-elegant-contact-list">
        {renderItem('Address', address)}
        {renderItem('Phone', phone)}
        {renderItem('Email', email)}
        {renderItem('Web', website, true)}
        {renderItem('LinkedIn', linkedin, true)}
        {renderItem('GitHub', github, true)}
      </div>
    </div>
  );
};

const SummarySection = ({ summary, title }: { summary: any, title: string }) => {
  if (!summary?.content) return null;
  return (
    <div className="cv-elegant-section" data-cv-section data-section-id="summary">
      <SectionHeader title={title} />
      <HTMLContent content={summary.content} />
    </div>
  );
};

const ExperienceSection = ({ experiences, title, dateLocale }: { experiences: WorkExperience[], title: string; dateLocale: string }) => {
  if (!experiences?.length) return null;
  return (
    <div className="cv-elegant-section" data-cv-section data-section-id="experience">
      <SectionHeader title={title} />
      {experiences.map(exp => (
        <div key={exp.id} className="cv-elegant-item">
          <div className="cv-elegant-item-header">
            {exp.position}
            {`, ${formatDateRange(exp.startDate, exp.endDate, dateLocale, { current: exp.current, presentLabel: 'Current', style: 'month-year-numeric' })}`}
          </div>
          <div className="cv-elegant-company-location">
            {exp.company} {exp.location && `- ${exp.location}`}
          </div>
          <HTMLContent content={exp.description} />
        </div>
      ))}
    </div>
  );
};

const EducationSection = ({ education, title, dateLocale }: { education: Education[], title: string; dateLocale: string }) => {
  if (!education?.length) return null;
  return (
    <div className="cv-elegant-section" data-cv-section data-section-id="education">
      <SectionHeader title={title} />
      {education.map(edu => (
        <div key={edu.id} className="cv-elegant-item">
          <div className="cv-elegant-education-degree">
            {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
          </div>
          <div className="cv-elegant-education-date">
            {formatDateRange(edu.startDate, edu.endDate, dateLocale, { current: edu.current, presentLabel: 'Current', style: 'month-year-numeric' })}
          </div>
          <div className="cv-elegant-education-school">
            {edu.institution}
          </div>
          {edu.description && <HTMLContent content={edu.description} />}
        </div>
      ))}
    </div>
  );
};

const SkillsSection = ({ skills, title }: { skills: Skill[], title: string }) => {
  if (!skills?.length) return null;
  return (
    <div className="cv-elegant-section" data-cv-section data-section-id="skills">
      <SectionHeader title={title} />
      <ul className="cv-elegant-list">
        {skills.map(skill => (
          <li key={skill.id} className="cv-elegant-skill-item">
            <strong>{skill.name}</strong> {skill.level && `(${skill.level})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ListSection = ({ items, title, id, displayField = 'name' }: { items: any[], title: string, id: string, displayField?: string }) => {
  if (!items?.length) return null;
  return (
    <div className="cv-elegant-section" data-cv-section data-section-id={id}>
      <SectionHeader title={title} />
      <ul className="cv-elegant-list">
        {items.map(item => (
          <li key={item.id} className="cv-elegant-list-item">
            {displayField === 'name_level' ? (
               <><strong>{item.name}</strong> {item.level && `- ${item.level}`}</>
            ) : displayField === 'url' ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="cv-elegant-link">
                  {item.url.replace(/^https?:\/\//, '')}
                </a>
            ) : (
               item.name || item.description
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const CertificationsSection = ({ certifications, title, dateLocale }: { certifications: Certification[], title: string; dateLocale: string }) => {
  if (!certifications?.length) return null;
  return (
    <div className="cv-elegant-section" data-cv-section data-section-id="certifications">
      <SectionHeader title={title} />
      {certifications.map(cert => (
        <div key={cert.id} className="cv-elegant-item">
          <div className="cv-elegant-item-header">
            {cert.name} - {cert.issuer}
          </div>
          <div className="cv-elegant-p">
            {cert.issueDate && <>Issued: <FormatDate date={cert.issueDate} locale={dateLocale} /></>}
            {cert.expiryDate && <> | Expires: <FormatDate date={cert.expiryDate} locale={dateLocale} /></>}
          </div>
        </div>
      ))}
    </div>
  );
};

const GenericSection = ({ items, title, id }: { items: any[], title: string, id: string }) => {
    if (!items?.length) return null;
    return (
        <div className="cv-elegant-section" data-cv-section data-section-id={id}>
            <SectionHeader title={title} />
            {items.map((item: any) => (
                <div key={item.id} className="cv-elegant-item">
                     <div className="cv-elegant-item-header">{item.name || item.title}</div>
                     {item.description && <HTMLContent content={item.description} />}
                </div>
            ))}
        </div>
    )
}

// --- Main Component ---

export default function Elegant(props: TemplateProps) {
  const {
    personalDetails,
    professionalSummary,
    workExperiences,
    education,
    skills,
    projects,
    certifications,
    awards,
    publications,
    languages,
    interests,
    websites,
    sections,
    theme
  } = props;

  const dateLocale = theme.dateLocale || 'en-US';
  const appliedFont = theme.fontFamily || 'Roboto, sans-serif';

  // --- Layout Logic ---
  
  // Define which sections live in the sidebar; ordering comes from sections config
  const sidebarSectionIds = ['personal', 'skills', 'languages', 'websites', 'interests', 'references'];

  const sidebarSections: CVSection[] = [];
  const mainSections: CVSection[] = [];

  sections
    .filter(s => s.isVisible)
    .forEach(section => {
      if (sidebarSectionIds.includes(section.id)) {
        sidebarSections.push(section);
      } else {
        mainSections.push(section);
      }
    });

  // Sort sidebar by user-defined order
  sidebarSections.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Sort main column by user-defined order
  mainSections.sort((a, b) => (a.order || 0) - (b.order || 0));

  // --- Render Dispatcher ---

  const renderSectionContent = (section: CVSection) => {
    switch (section.id) {
      case 'personal':
        return <ContactSection key={section.id} personalDetails={personalDetails} title={section.title || 'Contact'} />;
      case 'summary':
        return <SummarySection key={section.id} summary={professionalSummary} title={section.title} />;
      case 'experience':
        return <ExperienceSection key={section.id} experiences={workExperiences} title={section.title} dateLocale={dateLocale} />;
      case 'education':
        return <EducationSection key={section.id} education={education} title={section.title} dateLocale={dateLocale} />;
      case 'skills':
        return <SkillsSection key={section.id} skills={skills} title={section.title} />;
      case 'languages':
        return <ListSection key={section.id} items={languages} title={section.title} id={section.id} displayField="name_level" />;
      case 'websites':
        return <ListSection key={section.id} items={websites} title={section.title} id={section.id} displayField="url" />;
      case 'interests':
        return <ListSection key={section.id} items={interests} title={section.title} id={section.id} />;
      case 'certifications':
        return <CertificationsSection key={section.id} certifications={certifications} title={section.title} dateLocale={dateLocale} />;
      case 'projects':
        return <GenericSection key={section.id} items={projects} title={section.title} id={section.id} />;
      case 'awards':
        return <GenericSection key={section.id} items={awards} title={section.title} id={section.id} />;
      case 'publications':
        return <GenericSection key={section.id} items={publications} title={section.title} id={section.id} />;
      default:
        // Handle custom sections if any
        return null; 
    }
  };

  return (
    <div
      className="cv-html-root cv-elegant"
      style={{
        '--accent-color': theme.primaryColor,
        '--primary-color': theme.primaryColor,
        '--font-family': appliedFont,
        fontFamily: appliedFont,
      } as React.CSSProperties}
    >
      <header>
        <div className="cv-elegant-top-bar" />
        <div className="cv-elegant-header" data-cv-section data-section-id="header">
          <h1 className="cv-elegant-name">{personalDetails.fullName}</h1>
          {personalDetails.jobTitle && <div className="cv-elegant-job-title">{personalDetails.jobTitle}</div>}
        </div>
      </header>

      <div className="cv-elegant-content" data-parallel-pagination="true">
        <div className="cv-elegant-main" data-cv-column="main" data-parallel-column="true">
          {mainSections.map(section => (
            <React.Fragment key={section.id}>
              {renderSectionContent(section)}
            </React.Fragment>
          ))}
        </div>

        <div className="cv-elegant-sidebar" data-cv-column="sidebar" data-parallel-column="true">
          {sidebarSections.map(section => (
            <React.Fragment key={section.id}>
              {renderSectionContent(section)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
