import React from 'react';
import type { TemplateProps, WorkExperience, Education, Skill, Project, Certification, Award, Publication } from '../registry';
import { formatDate, formatDateRange } from '@/src/lib/dateFormatting';
import './styles.css';

export default function Legacy({
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

  const appliedFont = theme.fontFamily || '"Source Sans Pro", Roboto, "Segoe UI", -apple-system, system-ui, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"';
  const dateLocale = theme.dateLocale || 'en-US';

  return (
    <div
      className="cv-html-root cv-legacy"
      style={{ 
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
                className="cv-legacy-header--full-bleed" 
                data-cv-section 
                data-section-id={section.id}
                style={{ '--accent-color': theme.primaryColor } as React.CSSProperties}
              >
                <div className="cv-legacy-header-name">{personalDetails?.fullName || 'Your Name'}</div>
                {personalDetails?.jobTitle && (
                  <div className="cv-legacy-header-role">{personalDetails.jobTitle}</div>
                )}
                <div className="cv-legacy-header-contact-grid">
                  <div className="cv-legacy-contact-col">
                    {personalDetails?.phone ? (
                      <div className="cv-legacy-contact-row">
                        <span className="cv-legacy-contact-label">Phone</span>
                        <span className="cv-legacy-contact-value">{personalDetails.phone}</span>
                      </div>
                    ) : null}
                    {personalDetails?.email ? (
                      <div className="cv-legacy-contact-row">
                        <span className="cv-legacy-contact-label">E-mail</span>
                        <span className="cv-legacy-contact-value">{personalDetails.email}</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="cv-legacy-contact-col">
                    {personalDetails?.linkedin ? (
                      <div className="cv-legacy-contact-row">
                        <span className="cv-legacy-contact-label">LinkedIn</span>
                        <span className="cv-legacy-contact-value">{personalDetails.linkedin}</span>
                      </div>
                    ) : null}
                    {personalDetails?.website ? (
                      <div className="cv-legacy-contact-row">
                        <span className="cv-legacy-contact-label">Website</span>
                        <span className="cv-legacy-contact-value">{personalDetails.website}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            );
          }
          case 'summary': {
            if (!professionalSummary?.content) return null;
            return (
              <section
                key={section.id}
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <div
                  className="cv-legacy-paragraph"
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {workExperiences.map((exp: WorkExperience) => (
                    <li className="cv-legacy-list-item" key={exp.id}>
                      <div className="cv-legacy-experience-row">
                        <div className="cv-legacy-exp-dates">
                          {formatDateRange(exp.startDate, exp.endDate, dateLocale, { current: exp.current, presentLabel: 'Present' })}
                        </div>
                        <div className="cv-legacy-exp-content">
                          <div className="cv-legacy-item-title">
                            {exp.position || 'Job Title'}
                            {exp.company ? <span className="cv-legacy-item-divider"> — {exp.company}</span> : null}
                          </div>
                          {exp.location ? <div className="cv-legacy-item-meta">{exp.location}</div> : null}
                          {exp.description ? (
                            <div
                              className="cv-legacy-paragraph"
                              dangerouslySetInnerHTML={{ __html: exp.description }}
                            />
                          ) : null}
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {education.map((ed: Education) => (
                    <li className="cv-legacy-list-item" key={ed.id}>
                      <div className="cv-legacy-education-row">
                        <div className="cv-legacy-edu-dates">
                          {formatDateRange(ed.startDate, ed.endDate, dateLocale, { current: ed.current, presentLabel: 'Present' })}
                        </div>
                        <div className="cv-legacy-edu-content">
                          <div className="cv-legacy-item-title">
                            {ed.degree || 'Degree'}
                            {ed.institution ? <span className="cv-legacy-item-divider"> — {ed.institution}</span> : null}
                          </div>
                          {ed.fieldOfStudy ? (
                            <div className="cv-legacy-item-meta">{ed.fieldOfStudy}</div>
                          ) : null}
                          {ed.description ? (
                            <div
                              className="cv-legacy-paragraph"
                              dangerouslySetInnerHTML={{ __html: ed.description }}
                            />
                          ) : null}
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {skills.map((sk: Skill) => (
                    <li key={sk.id} className="cv-legacy-list-item">
                      <div className="cv-legacy-skill-row">
                        <div className="cv-legacy-skill-spacer" />
                        <div className="cv-legacy-skill-content">
                          <div className="cv-legacy-item-title">
                            {sk.name}
                            {sk.level ? <span className="cv-legacy-muted"> ({sk.level})</span> : null}
                          </div>
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {projects.map((p: Project) => (
                    <li className="cv-legacy-list-item" key={p.id}>
                      <div className="cv-legacy-project-row">
                        <div className="cv-legacy-project-dates">
                          {formatDateRange(p.startDate, p.endDate, dateLocale)}
                        </div>
                        <div className="cv-legacy-project-content">
                          <div className="cv-legacy-item-title">{p.name || 'Project Title'}</div>
                          {p.link ? <div className="cv-legacy-item-meta">{p.link}</div> : null}
                          {p.description ? (
                            <div
                              className="cv-legacy-paragraph"
                              dangerouslySetInnerHTML={{ __html: p.description }}
                            />
                          ) : null}
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {certifications.map((c: Certification) => (
                    <li className="cv-legacy-list-item" key={c.id}>
                      <div className="cv-legacy-cert-row">
                        <div className="cv-legacy-cert-dates">
                          {formatDateRange(c.issueDate, c.expiryDate, dateLocale)}
                        </div>
                        <div className="cv-legacy-cert-content">
                          <div className="cv-legacy-item-title">{c.name}</div>
                          {c.issuer ? <div className="cv-legacy-item-meta">{c.issuer}</div> : null}
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {awards.map((a: Award) => (
                    <li className="cv-legacy-list-item" key={a.id}>
                      <div className="cv-legacy-cert-row">
                        <div className="cv-legacy-cert-dates">
                          {formatDate(a.date, dateLocale)}
                        </div>
                        <div className="cv-legacy-cert-content">
                          <div className="cv-legacy-item-title">{a.title}</div>
                          {a.issuer ? <div className="cv-legacy-item-meta">{a.issuer}</div> : null}
                          {a.description ? (
                            <div
                              className="cv-legacy-paragraph"
                              dangerouslySetInnerHTML={{ __html: a.description }}
                            />
                          ) : null}
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {publications.map((p: Publication) => (
                    <li className="cv-legacy-list-item" key={p.id}>
                      <div className="cv-legacy-cert-row">
                        <div className="cv-legacy-cert-dates">
                          {formatDate(p.date, dateLocale)}
                        </div>
                        <div className="cv-legacy-cert-content">
                          <div className="cv-legacy-item-title">{p.title}</div>
                          {p.publisher ? <div className="cv-legacy-item-meta">{p.publisher}</div> : null}
                          {p.link ? <div className="cv-legacy-item-meta">{p.link}</div> : null}
                          {p.description ? (
                            <div
                              className="cv-legacy-paragraph"
                              dangerouslySetInnerHTML={{ __html: p.description }}
                            />
                          ) : null}
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {languages.map((lang) => (
                    <li className="cv-legacy-list-item" key={lang.id}>
                      <div className="cv-legacy-skill-row">
                        <div className="cv-legacy-skill-spacer" />
                        <div className="cv-legacy-skill-content">
                          <div className="cv-legacy-item-title">
                            {lang.name}
                            {lang.description ? <span className="cv-legacy-muted"> ({lang.description})</span> : null}
                          </div>
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {interests.map((int) => (
                    <li className="cv-legacy-list-item" key={int.id}>
                      <div className="cv-legacy-skill-row">
                        <div className="cv-legacy-skill-spacer" />
                        <div className="cv-legacy-skill-content">
                          <div className="cv-legacy-item-title">
                            {int.name}
                          </div>
                        </div>
                      </div>
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
                className="cv-legacy-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-legacy-section-title">{section.title}</h2>
                <ul className="cv-legacy-list">
                  {websites.map((web) => (
                    <li className="cv-legacy-list-item" key={web.id}>
                      <div className="cv-legacy-skill-row">
                        <div className="cv-legacy-skill-spacer" />
                        <div className="cv-legacy-skill-content">
                          <div className="cv-legacy-item-title">{web.name}</div>
                          {web.url ? (
                            <div className="cv-legacy-item-meta">
                              <a href={web.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                {web.url}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>
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
