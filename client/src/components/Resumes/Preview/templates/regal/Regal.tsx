import React from 'react';
import type { TemplateProps, WorkExperience, Education, Skill, Project, Certification, Award, Publication } from '../registry';
import { formatDate, formatDateRange } from '@/src/lib/dateFormatting';
import './styles.css';

export default function Regal({
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

  const appliedFont = theme.fontFamily || 'Georgia, "Times New Roman", Times, serif';
  const dateLocale = theme.dateLocale || 'en-US';

  const contactLine1 = [
    personalDetails?.address,
    personalDetails?.phone && `Phone: ${personalDetails.phone}`,
    personalDetails?.email
  ].filter(Boolean).join(' • ');

  const contactLine2 = [
    personalDetails?.website && `Web: ${personalDetails.website}`,
    personalDetails?.linkedin
  ].filter(Boolean).join(' • ');

  return (
    <div
      className="cv-html-root cv-regal"
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
                className="cv-regal-header" 
                data-cv-section 
                data-section-id={section.id}
              >
                <div className="cv-regal-top-rule" />
                <div className="cv-regal-name">{personalDetails?.fullName || 'Your Name'}</div>
                <div className="cv-regal-bottom-rules">
                  <span className="cv-regal-rule"></span>
                  <span className="cv-regal-rule-bolded"></span>
                </div>
                {contactLine1 ? <div className="cv-regal-contact">{contactLine1}</div> : null}
                {contactLine2 ? <div className="cv-regal-contact">{contactLine2}</div> : null}
              </section>
            );
          }
          case 'summary': {
            if (!professionalSummary?.content) return null;
            return (
              <section
                key={section.id}
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <div
                  className="cv-regal-paragraph"
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
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <ul className="cv-regal-list">
                  {workExperiences.map((exp: WorkExperience) => (
                    <li className="cv-regal-list-item" key={exp.id}>
                      <div className="cv-regal-item-title">
                        {exp.position || 'Job Title'}
                        {exp.company ? <span className="cv-regal-item-divider"> — {exp.company}</span> : null}
                      </div>
                      {exp.location ? <div className="cv-regal-item-meta">{exp.location}</div> : null}
                      {(exp.startDate || exp.endDate || exp.current) ? (
                        <div className="cv-regal-item-meta">
                          {formatDateRange(exp.startDate, exp.endDate, dateLocale, { current: exp.current, presentLabel: 'Present' })}
                        </div>
                      ) : null}
                      {exp.description ? (
                        <div
                          className="cv-regal-paragraph"
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
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <ul className="cv-regal-list">
                  {education.map((ed: Education) => (
                    <li className="cv-regal-list-item" key={ed.id}>
                      <div className="cv-regal-item-title">
                        {ed.degree || 'Degree'}
                        {ed.institution ? <span className="cv-regal-item-divider"> — {ed.institution}</span> : null}
                      </div>
                      {(ed.startDate || ed.endDate || ed.current) ? (
                        <div className="cv-regal-item-meta">
                          {formatDateRange(ed.startDate, ed.endDate, dateLocale, { current: ed.current, presentLabel: 'Present' })}
                        </div>
                      ) : null}
                      {ed.description ? (
                        <div
                          className="cv-regal-paragraph"
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
            const cols = 2;
            const rows = Math.ceil(skills.length / cols);
            const columns: Skill[][] = Array.from({ length: cols }, (_, i) =>
              skills.slice(i * rows, (i + 1) * rows)
            );
            return (
              <section
                key={section.id}
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <div className="cv-regal-skills-grid">
                  {columns.map((col, ci) => (
                    <ul key={ci} className="cv-regal-skills-col">
                      {col.map((sk: Skill) => (
                        <li key={sk.id} className="cv-regal-skill-item">
                          {sk.name}
                          {sk.level ? <span className="cv-regal-muted"> ({sk.level})</span> : null}
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
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <ul className="cv-regal-list">
                  {projects.map((p: Project) => (
                    <li className="cv-regal-list-item" key={p.id}>
                      <div className="cv-regal-item-title">{p.name || 'Project Title'}</div>
                      {p.link ? <div className="cv-regal-item-meta">{p.link}</div> : null}
                      {p.description ? (
                        <div
                          className="cv-regal-paragraph"
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
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <ul className="cv-regal-list">
                  {certifications.map((c: Certification) => (
                    <li className="cv-regal-list-item" key={c.id}>
                      <div className="cv-regal-item-title">{c.name}</div>
                      {c.issuer ? <div className="cv-regal-item-meta">{c.issuer}</div> : null}
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
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <ul className="cv-regal-list">
                  {awards.map((a: Award) => (
                    <li className="cv-regal-list-item" key={a.id}>
                      <div className="cv-regal-item-title">{a.title}</div>
                      <div className="cv-regal-item-meta">{formatDate(a.date, dateLocale)}</div>
                      {a.issuer ? <div className="cv-regal-item-meta">{a.issuer}</div> : null}
                      {a.description ? (
                        <div
                          className="cv-regal-paragraph"
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
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <ul className="cv-regal-list">
                  {publications.map((p: Publication) => (
                    <li className="cv-regal-list-item" key={p.id}>
                      <div className="cv-regal-item-title">{p.title}</div>
                      <div className="cv-regal-item-meta">{formatDate(p.date, dateLocale)}</div>
                      {p.publisher ? <div className="cv-regal-item-meta">{p.publisher}</div> : null}
                      {p.link ? <div className="cv-regal-item-meta">{p.link}</div> : null}
                      {p.description ? (
                        <div
                          className="cv-regal-paragraph"
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
            const cols = 2;
            const rows = Math.ceil(languages.length / cols);
            const columns = Array.from({ length: cols }, (_, i) =>
              languages.slice(i * rows, (i + 1) * rows)
            );
            return (
              <section
                key={section.id}
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <div className="cv-regal-skills-grid">
                  {columns.map((col, ci) => (
                    <ul key={ci} className="cv-regal-skills-col">
                      {col.map((lang) => (
                        <li key={lang.id} className="cv-regal-skill-item">
                          {lang.name}
                          {lang.description ? <span className="cv-regal-muted"> ({lang.description})</span> : null}
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
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <ul className="cv-regal-inline-list">
                  {interests.map((int) => (
                    <li key={int.id} className="cv-regal-inline-item">
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
                className="cv-regal-section"
                data-cv-section
                data-section-id={section.id}
              >
                <h2 className="cv-regal-section-title"><span>{section.title}</span></h2>
                <ul className="cv-regal-list">
                  {websites.map((web) => (
                    <li className="cv-regal-list-item" key={web.id}>
                      <div className="cv-regal-item-title">{web.name}</div>
                      {web.url ? (
                        <div className="cv-regal-item-meta">
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
