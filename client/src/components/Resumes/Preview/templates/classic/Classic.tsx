import React from 'react';
import type { TemplateProps, WorkExperience, Education, Skill, Project, Certification, Award, Publication } from '../registry';
import { formatDateRange } from '@/src/lib/dateFormatting';
import './styles.css'

export default function Classic({
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
}: TemplateProps) {
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

  const appliedFont = theme.fontFamily || '"Times New Roman", Times, serif';
  const dateLocale = theme.dateLocale || 'en-US';

  return (
    <div
      className="cv-html-root cv-classic"
      style={{ 
        '--accent-color': theme.primaryColor,
        '--font-family': appliedFont,
        fontFamily: appliedFont,
      } as React.CSSProperties}
    >
      {/* Sections */}
      {orderedSections.map((section) => {
        switch (section.id) {
          case 'personal': {
            return (
              <section 
                key={section.id} 
                className="cv-classic-header" 
                data-cv-section 
                data-section-id={section.id}
              >
                <div className="cv-classic-header-name">{personalDetails?.fullName || 'Your Name'}</div>
                {personalDetails?.jobTitle && (
                  <div className="cv-classic-header-role">{personalDetails.jobTitle}</div>
                )}
                <div className="cv-classic-header-contact">
                  {personalDetails?.email}
                  {personalDetails?.phone ? <span className="cv-classic-header-dot"> • </span> : null}
                  {personalDetails?.phone}
                  <br />
                  {personalDetails?.website ? <span className="cv-classic-header-dot"> • </span> : null}
                  {personalDetails?.website}
                  {personalDetails?.linkedin ? <span className="cv-classic-header-dot"> • </span> : null}
                  {personalDetails?.linkedin}
                </div>
                <div className="cv-classic-header-divider" />
              </section>
            );
          }
          case 'summary': {
            if (!professionalSummary?.content) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <div
                  className="cv-classic-paragraph"
                  dangerouslySetInnerHTML={{ __html: professionalSummary.content }}
                />
              </section>
            );
          }
          case 'experience': {
            if (!workExperiences.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-list">
                  {workExperiences.map((exp: WorkExperience) => (
                    <li className="cv-classic-list-item" key={exp.id}>
                      <div className="cv-classic-item-title">
                        {exp.position || 'Job Title'}
                        {exp.company ? <span className="cv-classic-item-divider"> — {exp.company}</span> : null}
                      </div>
                      {exp.location ? <div className="cv-classic-item-meta">{exp.location}</div> : null}
                      <div className="cv-classic-item-meta">
                        {formatDateRange(exp.startDate, exp.endDate, dateLocale, { current: exp.current, presentLabel: 'Present' })}
                      </div>
                      {exp.description ? (
                        <div
                          className="cv-classic-paragraph"
                          dangerouslySetInnerHTML={{ __html: exp.description }}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'education': {
            if (!education.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-list">
                  {education.map((ed: Education) => (
                    <li className="cv-classic-list-item" key={ed.id}>
                      <div className="cv-classic-item-title">
                        {ed.degree || 'Degree'}
                        {ed.institution ? <span className="cv-classic-item-divider"> — {ed.institution}</span> : null}
                      </div>
                      <div className="cv-classic-item-meta">
                        {formatDateRange(ed.startDate, ed.endDate, dateLocale, { current: ed.current, presentLabel: 'Present' })}
                      </div>
                      {ed.description ? (
                        <div
                          className="cv-classic-paragraph"
                          dangerouslySetInnerHTML={{ __html: ed.description }}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'skills': {
            if (!skills.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-inline-list">
                  {skills.map((sk: Skill) => (
                    <li key={sk.id} className="cv-classic-inline-item">
                      {sk.name}
                      {sk.level ? <span className="cv-classic-muted"> ({sk.level})</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'projects': {
            if (!projects.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-list">
                  {projects.map((p: Project) => (
                    <li className="cv-classic-list-item" key={p.id}>
                      <div className="cv-classic-item-title">{p.name }</div>
                      {p.link ? <div className="cv-classic-item-meta">{p.link}</div> : null}
                      {p.description ? (
                        <div
                          className="cv-classic-paragraph"
                          dangerouslySetInnerHTML={{ __html: p.description }}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'certifications': {
            if (!certifications.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-list">
                  {certifications.map((c: Certification) => (
                    <li className="cv-classic-list-item" key={c.id}>
                      <div className="cv-classic-item-title">{c.name}</div>
                      {c.issuer ? <div className="cv-classic-item-meta">{c.issuer}</div> : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'awards': {
            if (!awards.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-list">
                  {awards.map((a: Award) => (
                    <li className="cv-classic-list-item" key={a.id}>
                      <div className="cv-classic-item-title">{a.title}</div>
                      {a.issuer ? <div className="cv-classic-item-meta">{a.issuer}</div> : null}
                      <div className="cv-classic-item-meta">{a.date}</div>
                      {a.description ? (
                        <div
                          className="cv-classic-paragraph"
                          dangerouslySetInnerHTML={{ __html: a.description }}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'publications': {
            if (!publications.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-list">
                  {publications.map((p: Publication) => (
                    <li className="cv-classic-list-item" key={p.id}>
                      <div className="cv-classic-item-title">{p.title}</div>
                      {p.publisher ? <div className="cv-classic-item-meta">{p.publisher}</div> : null}
                      <div className="cv-classic-item-meta">{p.date}</div>
                      {p.link ? <div className="cv-classic-item-meta">{p.link}</div> : null}
                      {p.description ? (
                        <div
                          className="cv-classic-paragraph"
                          dangerouslySetInnerHTML={{ __html: p.description }}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'languages': {
            if (!languages.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-inline-list">
                  {languages.map((lang) => (
                    <li key={lang.id} className="cv-classic-inline-item">
                      {lang.name}
                      {lang.description ? <span className="cv-classic-muted"> ({lang.description})</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'interests': {
            if (!interests.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-inline-list">
                  {interests.map((int) => (
                    <li key={int.id} className="cv-classic-inline-item">
                      {int.name}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          case 'websites': {
            if (!websites.length) return null;
            return (
              <section
                key={section.id}
                className="cv-classic-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-classic-section-title">{section.title}</h2>
                <ul className="cv-classic-list">
                  {websites.map((web) => (
                    <li className="cv-classic-list-item" key={web.id}>
                      <div className="cv-classic-item-title">{web.name}</div>
                      {web.url ? (
                        <div className="cv-classic-item-meta">
                          <a href={web.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                            {web.url}
                          </a>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
