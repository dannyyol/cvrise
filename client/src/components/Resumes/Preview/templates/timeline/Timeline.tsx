import React from 'react';
import type {
  TemplateProps,
  WorkExperience,
  Education,
  Skill,
  Project,
  Publication,
  CVSection
} from '../registry';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';
import { formatDateRange } from '@/src/lib/dateFormatting';
import './styles.css';

const SIDEBAR_IDS = ['skills', 'languages', 'interests', 'websites', 'awards', 'certifications'];

const getSectionIcon = (id: string) => {
  switch (id) {
    case 'summary':
      return <User size={16} />;
    case 'experience':
      return <Briefcase size={16} />;
    case 'education':
      return <GraduationCap size={16} />;
    case 'projects':
      return <FolderGit2 size={16} />;
    case 'publications':
      return <BookOpen size={16} />;
    default:
      return <User size={16} />;
  }
};

const renderMainSectionContent = (
  section: CVSection,
  props: TemplateProps
) => {
  const { professionalSummary, workExperiences, education, projects, publications } = props;
  const dateLocale = props.theme?.dateLocale || 'en-US';

  switch (section.id) {
    case 'summary':
      if (!professionalSummary?.content) return null;
      return (
        <div
          className="cv-timeline-paragraph"
          dangerouslySetInnerHTML={{ __html: professionalSummary.content }}
        />
      );

    case 'experience':
      if (!workExperiences.length) return null;
      return (
        <div>
          {workExperiences.map((exp: WorkExperience) => (
            <div key={exp.id} className="cv-timeline-item">
              <div className="cv-timeline-item-header">
                <div className="cv-timeline-item-title">
                  {exp.position || 'Job Title'}
                </div>
                <div className="cv-timeline-item-date">
                  {formatDateRange(exp.startDate, exp.endDate, dateLocale, { current: exp.current, presentLabel: 'Present' })}
                </div>
              </div>
              <div className="cv-timeline-item-subtitle">
                {exp.company}
                {exp.location ? ` \u2022 ${exp.location}` : ''}
              </div>
              {exp.description && (
                <div
                  className="cv-timeline-paragraph"
                  dangerouslySetInnerHTML={{ __html: exp.description }}
                />
              )}
            </div>
          ))}
        </div>
      );

    case 'education':
      if (!education.length) return null;
      return (
        <div>
          {education.map((ed: Education) => (
            <div key={ed.id} className="cv-timeline-item">
              <div className="cv-timeline-item-header">
                <div className="cv-timeline-item-title">
                  {ed.degree || 'Degree'}
                </div>
                <div className="cv-timeline-item-date">
                  {formatDateRange(ed.startDate, ed.endDate, dateLocale, { current: ed.current, presentLabel: 'Present' })}
                </div>
              </div>
              <div className="cv-timeline-item-subtitle">
                {ed.institution}
                {ed.fieldOfStudy ? ` \u2022 ${ed.fieldOfStudy}` : ''}
              </div>
              {ed.description && (
                <div
                  className="cv-timeline-paragraph"
                  dangerouslySetInnerHTML={{ __html: ed.description }}
                />
              )}
            </div>
          ))}
        </div>
      );

    case 'projects':
      if (!projects.length) return null;
      return (
        <div>
          {projects.map((proj: Project) => (
            <div key={proj.id} className="cv-timeline-item">
              <div className="cv-timeline-item-header">
                <div className="cv-timeline-item-title">
                  {proj.name || 'Project'}
                </div>
                <div className="cv-timeline-item-date">
                  {formatDateRange(proj.startDate, proj.endDate, dateLocale)}
                </div>
              </div>
              {proj.link && (
                <div className="cv-timeline-item-subtitle">
                  {proj.link}
                </div>
              )}
              {proj.description && (
                <div
                  className="cv-timeline-paragraph"
                  dangerouslySetInnerHTML={{ __html: proj.description }}
                />
              )}
            </div>
          ))}
        </div>
      );

    case 'publications':
      if (!publications.length) return null;
      return (
        <div>
          {publications.map((pub: Publication) => (
            <div key={pub.id} className="cv-timeline-item">
              <div className="cv-timeline-item-header">
                <div className="cv-timeline-item-title">
                  {pub.title || 'Publication'}
                </div>
                {pub.date ? (
                  <div className="cv-timeline-item-date">{pub.date}</div>
                ) : null}
              </div>
              {pub.publisher ? (
                <div className="cv-timeline-item-subtitle">{pub.publisher}</div>
              ) : null}
              {pub.link ? (
                <div className="cv-timeline-item-subtitle">{pub.link}</div>
              ) : null}
              {pub.description ? (
                <div
                  className="cv-timeline-paragraph"
                  dangerouslySetInnerHTML={{ __html: pub.description }}
                />
              ) : null}
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
};

const renderSidebarSectionContent = (
  section: CVSection,
  props: TemplateProps
) => {
  const { skills, languages, interests, websites, certifications, awards } = props;

  switch (section.id) {
    case 'skills':
      if (!skills.length) return null;
      return (
        <ul className="cv-timeline-sidebar-list">
          {skills.map((skill: Skill) => (
            <li key={skill.id} className="cv-timeline-sidebar-item">
              <span>
                {skill.name}
                {skill.level ? (
                  <span className="cv-timeline-muted"> ({skill.level})</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      );

    case 'languages':
      if (!languages.length) return null;
      return (
        <ul className="cv-timeline-sidebar-list">
          {languages.map(lang => (
            <li key={lang.id} className="cv-timeline-sidebar-item">
              <span>
                {lang.name}
                {lang.description ? ` (${lang.description})` : ''}
              </span>
            </li>
          ))}
        </ul>
      );

    case 'interests':
      if (!interests.length) return null;
      return (
        <ul className="cv-timeline-sidebar-list">
          {interests.map(int => (
            <li key={int.id} className="cv-timeline-sidebar-item">
              <span>{int.name}</span>
            </li>
          ))}
        </ul>
      );

    case 'websites':
      if (!websites.length) return null;
      return (
        <ul className="cv-timeline-sidebar-list">
          {websites.map(web => (
            <li key={web.id} className="cv-timeline-sidebar-item">
              <span>
                {web.name || web.url}
              </span>
            </li>
          ))}
        </ul>
      );

    case 'certifications':
      if (!certifications.length) return null;
      return (
        <ul className="cv-timeline-sidebar-list">
          {certifications.map(cert => (
            <li key={cert.id} className="cv-timeline-sidebar-item cv-timeline-sidebar-item-block">
              <div className="cv-timeline-sidebar-text">
                <div className="cv-timeline-sidebar-title">
                  {cert.name}
                </div>
                {cert.issuer ? (
                  <div className="cv-timeline-muted">
                    {cert.issuer}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      );

    case 'awards':
      if (!awards.length) return null;
      return (
        <ul className="cv-timeline-sidebar-list">
          {awards.map(award => (
            <li key={award.id} className="cv-timeline-sidebar-item cv-timeline-sidebar-item-block">
              <div className="cv-timeline-sidebar-text">
                <div className="cv-timeline-sidebar-title">
                  {award.title}
                </div>
                {award.issuer ? (
                  <div className="cv-timeline-muted">
                    {award.issuer}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      );

    default:
      return null;
  }
};

export default function Timeline(props: TemplateProps) {
  const {
    personalDetails,
    sections,
    theme
  } = props;

  const appliedFont =
    theme.fontFamily ||
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  const mainSections = sections
    .filter(section => !SIDEBAR_IDS.includes(section.id) && section.isVisible)
    .sort((a, b) => a.order - b.order);

  const sidebarSections = sections
    .filter(section => SIDEBAR_IDS.includes(section.id) && section.isVisible)
    .sort((a, b) => a.order - b.order);

  const personalSection = sections.find(s => s.id === 'personal' && s.isVisible);

  return (
    <div
      className="cv-html-root cv-timeline"
      style={{
        '--accent-color': theme.primaryColor,
        '--font-family': appliedFont,
        fontFamily: appliedFont
      } as React.CSSProperties}
    >
      {personalSection && (
        <header 
          className="cv-timeline-header" 
          data-cv-section 
          data-section-id="personal"
          // style={{ order: personalSection.order }}
        >
          <div className="cv-timeline-header-name">
            {personalDetails.fullName || 'Your Name'}
          </div>
          {personalDetails.jobTitle ? (
            <div className="cv-timeline-header-role">
              {personalDetails.jobTitle}
            </div>
          ) : null}
          <div className="cv-timeline-header-contact">
            {personalDetails.address ? (
              <span className="cv-timeline-header-contact-item">
                <MapPin className="cv-timeline-header-contact-icon" />
                <span>{personalDetails.address}</span>
              </span>
            ) : null}
            {personalDetails.phone ? (
              <span className="cv-timeline-header-contact-item">
                <Phone className="cv-timeline-header-contact-icon" />
                <span>{personalDetails.phone}</span>
              </span>
            ) : null}
            {personalDetails.email ? (
              <span className="cv-timeline-header-contact-item">
                <Mail className="cv-timeline-header-contact-icon" />
                <span>{personalDetails.email}</span>
              </span>
            ) : null}
            {personalDetails.website ? (
              <span className="cv-timeline-header-contact-item">
                <Globe className="cv-timeline-header-contact-icon" />
                <span>{personalDetails.website}</span>
              </span>
            ) : null}
          </div>
        </header>
      )}

      <div className="cv-timeline-layout" data-parallel-pagination="true">
        <main className="cv-timeline-main" data-parallel-column="true">
          {mainSections.map(section => {
            const content = renderMainSectionContent(section, props);
            if (!content) return null;
            return (
              <section
                key={section.id}
                className="cv-timeline-main-section"
                data-cv-section
                data-section-id={section.id}
              >
                <div className="cv-timeline-section-icon-wrapper">
                  <div className="cv-timeline-section-icon-circle">
                    {getSectionIcon(section.id)}
                  </div>
                </div>
                <div className="cv-timeline-main-section-header">
                  <h2 className="cv-timeline-main-section-title">
                    {section.title}
                  </h2>
                </div>
                <div className="cv-timeline-main-section-content">
                  {content}
                </div>
              </section>
            );
          })}
        </main>

        <aside className="cv-timeline-sidebar" data-parallel-column="true">
          {sidebarSections.map(section => {
            const content = renderSidebarSectionContent(section, props);
            if (!content) return null;
            return (
              <section
                key={section.id}
                className="cv-timeline-sidebar-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h3 className="cv-timeline-sidebar-title">
                  {section.title}
                </h3>
                {content}
              </section>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
