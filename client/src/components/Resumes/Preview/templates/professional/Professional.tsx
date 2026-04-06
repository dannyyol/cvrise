import React from 'react';
import type { TemplateProps, WorkExperience, Education, Skill, Project, Certification, Award, Publication } from '../registry';
import { formatDate, formatDateRange } from '@/src/lib/dateFormatting';
import './styles.css'

export default function Professional({
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

  const appliedFont = theme.fontFamily || 'Georgia, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"';
  const dateLocale = theme.dateLocale || 'en-US';

  return (
    <div
      className="cv-html-root cv-professional"
      style={{ 
        '--accent-color': theme.primaryColor,
        '--font-family': appliedFont,
        fontFamily: appliedFont,
      } as React.CSSProperties}
    >
      {orderedSections.map((section) => {
        switch (section.id) {
          case 'personal': {
            return (
              <section 
                key={section.id} 
                className="cv-professional-header" 
                data-cv-section 
                data-section-id={section.id}
              >
                <div className="cv-professional-header-name">{personalDetails?.fullName || 'Your Name'}</div>
                {personalDetails?.jobTitle && (
                  <div className="cv-professional-header-role">{personalDetails.jobTitle}</div>
                )}
                <div className="cv-professional-header-contact">
                  {personalDetails?.email}
                  {personalDetails?.phone ? <span className="cv-professional-header-dot"> | </span> : null}
                  {personalDetails?.phone}
                  <br />
                  {personalDetails?.website}
                  {personalDetails?.linkedin ? <span className="cv-professional-header-dot"> | </span> : null}
                  {personalDetails?.linkedin}
                </div>
                <div className="cv-professional-header-divider" />
              </section>
            );
          }
          case 'summary': {
            if (!professionalSummary?.content) return null;
            return (
              <section
                key={section.id}
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <div
                  className="cv-professional-paragraph"
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
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <ul className="cv-professional-list">
                  {workExperiences.map((exp: WorkExperience) => (
                    <li className="cv-professional-list-item" key={exp.id}>
                      <div className="cv-professional-item-row">
                        <div className="cv-professional-item-title">
                          {exp.position || 'Job Title'}
                          {exp.company ? <span>, {exp.company}</span>: null}
                        </div>
                        {(exp.startDate || exp.endDate || exp.current) ? (
                          <div className="cv-professional-item-dates">
                            {formatDateRange(exp.startDate, exp.endDate, dateLocale, { current: exp.current, presentLabel: 'Present' })}
                          </div>
                        ) : null}
                      </div>
                      {exp.location ? <div className="cv-professional-item-meta">{exp.location}</div> : null}
                      {exp.description ? (
                        <div
                          className="cv-professional-paragraph"
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
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <ul className="cv-professional-list">
                  {education.map((ed: Education) => (
                    <li className="cv-professional-list-item" key={ed.id}>
                      <div className="cv-professional-item-row">
                        <div className="cv-professional-item-title">
                          {ed.degree || 'Degree'}
                          {ed.institution ? <span className="cv-professional-item-divider"> — {ed.institution}</span> : null}
                        </div>
                        {(ed.startDate || ed.endDate) ? (
                          <div className="cv-professional-item-dates">
                            {formatDateRange(ed.startDate, ed.endDate, dateLocale, { current: ed.current, presentLabel: 'Present' })}
                          </div>
                        ) : null}
                      </div>
                      {ed.description ? (
                        <div
                          className="cv-professional-paragraph"
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
            const cols = 3;
            const rows = Math.ceil(skills.length / cols);
            const columns: Skill[][] = Array.from({ length: cols }, (_, i) =>
              skills.slice(i * rows, (i + 1) * rows)
            );
            return (
              <section
                key={section.id}
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <div className="cv-professional-skills-grid">
                  {columns.map((col, ci) => (
                    <ul key={ci} className="cv-professional-skills-col">
                      {col.map((sk: Skill) => (
                        <li key={sk.id} className="cv-professional-skill-item">
                          {sk.name}
                          {sk.level ? <span className="cv-professional-muted"> ({sk.level})</span> : null}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </section>
            );
          }
          case 'projects': {
            if (!projects.length) return null;
            return (
              <section
                key={section.id}
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <ul className="cv-professional-list">
                  {projects.map((p: Project) => (
                    <li className="cv-professional-list-item" key={p.id}>
                      <div className="cv-professional-item-title">{p.name || 'Project Title'}</div>
                      {p.link ? <div className="cv-professional-item-meta">{p.link}</div> : null}
                      {p.description ? (
                        <div
                          className="cv-professional-paragraph"
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
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <ul className="cv-professional-list">
                  {certifications.map((c: Certification) => (
                    <li className="cv-professional-list-item" key={c.id}>
                      <div className="cv-professional-item-title">{c.name}</div>
                      {c.issuer ? <div className="cv-professional-item-meta">{c.issuer}</div> : null}
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
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <ul className="cv-professional-list">
                  {awards.map((a: Award) => (
                    <li className="cv-professional-list-item" key={a.id}>
                      <div className="cv-professional-item-row">
                        <div className="cv-professional-item-title">{a.title}</div>
                        <div className="cv-professional-item-dates">{formatDate(a.date, dateLocale)}</div>
                      </div>
                      {a.issuer ? <div className="cv-professional-item-meta">{a.issuer}</div> : null}
                      {a.description ? (
                        <div
                          className="cv-professional-paragraph"
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
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <ul className="cv-professional-list">
                  {publications.map((p: Publication) => (
                    <li className="cv-professional-list-item" key={p.id}>
                      <div className="cv-professional-item-row">
                        <div className="cv-professional-item-title">{p.title}</div>
                        <div className="cv-professional-item-dates">{formatDate(p.date, dateLocale)}</div>
                      </div>
                      {p.publisher ? <div className="cv-professional-item-meta">{p.publisher}</div> : null}
                      {p.link ? <div className="cv-professional-item-meta">{p.link}</div> : null}
                      {p.description ? (
                        <div
                          className="cv-professional-paragraph"
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
            const cols = 3;
            const rows = Math.ceil(languages.length / cols);
            const columns = Array.from({ length: cols }, (_, i) =>
              languages.slice(i * rows, (i + 1) * rows)
            );
            return (
              <section
                key={section.id}
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <div className="cv-professional-skills-grid">
                  {columns.map((col, ci) => (
                    <ul key={ci} className="cv-professional-skills-col">
                      {col.map((lang) => (
                        <li key={lang.id} className="cv-professional-skill-item">
                          {lang.name}
                          {lang.description ? <span className="cv-professional-muted"> ({lang.description})</span> : null}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </section>
            );
          }
          case 'interests': {
            if (!interests.length) return null;
            return (
              <section
                key={section.id}
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <ul className="cv-professional-list">
                  {interests.map((int) => (
                    <li className="cv-professional-list-item" key={int.id}>
                      <div className="cv-professional-item-title">{int.name}</div>
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
                className="cv-professional-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-professional-section-title">{section.title}</h2>
                <ul className="cv-professional-list">
                  {websites.map((web) => (
                    <li className="cv-professional-list-item" key={web.id}>
                      <div className="cv-professional-item-title">{web.name}</div>
                      {web.url ? (
                        <div className="cv-professional-item-meta">
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
