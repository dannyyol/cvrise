import React from 'react';
import type { TemplateProps, WorkExperience, Education, Skill, Project, Certification, Publication, CVSection } from '../registry';
import { User, Briefcase, GraduationCap, Phone, Mail, MapPin, Globe, FolderGit2, Award as AwardIcon, Star, Languages, Link as LinkIcon, BookOpen } from 'lucide-react';
import { formatDateRange } from '@/src/lib/dateFormatting';
import './styles.css';

const SIDEBAR_IDS = ['skills', 'languages', 'interests', 'websites', 'awards', 'certifications'];

export default function Chronicle({
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
  const appliedFont = theme.fontFamily || 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const dateLocale = theme.dateLocale || 'en-US';

  // Helper to get Icon for section
  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'summary': return <User size={16} />;
      case 'experience': return <Briefcase size={16} />;
      case 'education': return <GraduationCap size={16} />;
      case 'projects': return <FolderGit2 size={16} />;
      case 'certifications': return <AwardIcon size={16} />;
      case 'awards': return <Star size={16} />;
      case 'languages': return <Languages size={16} />;
      case 'publications': return <BookOpen size={16} />;
      default: return <Star size={16} />;
    }
  };

  const mainSections = sections
    .filter(s => !SIDEBAR_IDS.includes(s.id) && s.isVisible)
    .sort((a, b) => a.order - b.order);
    
  const sidebarSections = sections
    .filter(s => SIDEBAR_IDS.includes(s.id) && s.isVisible)
    .sort((a, b) => a.order - b.order);

  const renderSectionContent = (section: CVSection) => {
    switch (section.id) {
      case 'summary':
        if (!professionalSummary?.content) return null;
        return (
          <div className="cv-chronicle-paragraph" dangerouslySetInnerHTML={{ __html: professionalSummary.content }} />
        );

      case 'experience':
        if (!workExperiences.length) return null;
        return (
          <div>
            {workExperiences.map((exp: WorkExperience) => (
              <div key={exp.id} className="cv-chronicle-timeline-item">
                <div className="cv-chronicle-item-header">
                  <div className="cv-chronicle-item-title">{exp.company}</div>
                  <div className="cv-chronicle-item-date">
                    {formatDateRange(exp.startDate, exp.endDate, dateLocale, { current: exp.current, presentLabel: 'Present' })}
                  </div>
                </div>
                <div className="cv-chronicle-item-subtitle">
                  {exp.position}
                  {exp.location ? ` • ${exp.location}` : ''}
                </div>
                {exp.description && (
                  <div className="cv-chronicle-paragraph" dangerouslySetInnerHTML={{ __html: exp.description }} />
                )}
              </div>
            ))}
          </div>
        );

      case 'education':
        if (!education.length) return null;
        return (
          <div>
            {education.map((edu: Education) => (
              <div key={edu.id} className="cv-chronicle-timeline-item">
                <div className="cv-chronicle-item-header">
                  <div className="cv-chronicle-item-title">{edu.degree}</div>
                  <div className="cv-chronicle-item-date">
                    {formatDateRange(edu.startDate, edu.endDate, dateLocale, { current: edu.current, presentLabel: 'Present' })}
                  </div>
                </div>
                <div className="cv-chronicle-item-subtitle">{edu.institution}</div>
                {edu.description && (
                  <div className="cv-chronicle-paragraph" dangerouslySetInnerHTML={{ __html: edu.description }} />
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
                    <div key={proj.id} className="cv-chronicle-timeline-item">
                        <div className="cv-chronicle-item-header">
                            <div className="cv-chronicle-item-title">{proj.name}</div>
                            <div className="cv-chronicle-item-date">
                      {formatDateRange(proj.startDate, proj.endDate, dateLocale)}
                            </div>
                        </div>
                        {proj.link && <div className="cv-chronicle-item-subtitle"><a href={proj.link}>{proj.link}</a></div>}
                        {proj.description && (
                            <div className="cv-chronicle-paragraph" dangerouslySetInnerHTML={{ __html: proj.description }} />
                        )}
                    </div>
                ))}
            </div>
        )

      case 'publications':
        if (!publications.length) return null;
        return (
          <div>
            {publications.map((pub: Publication) => (
              <div key={pub.id} className="cv-chronicle-timeline-item">
                <div className="cv-chronicle-item-header">
                  <div className="cv-chronicle-item-title">{pub.title}</div>
                  {pub.date ? (
                    <div className="cv-chronicle-item-date">{pub.date}</div>
                  ) : null}
                </div>
                {pub.publisher ? <div className="cv-chronicle-item-subtitle">{pub.publisher}</div> : null}
                {pub.link ? (
                  <div className="cv-chronicle-item-subtitle">
                    <a href={pub.link} target="_blank" rel="noreferrer">{pub.link}</a>
                  </div>
                ) : null}
                {pub.description && (
                  <div className="cv-chronicle-paragraph" dangerouslySetInnerHTML={{ __html: pub.description }} />
                )}
              </div>
            ))}
          </div>
        );



      default:
        return null;
    }
  };

  const renderSidebarContent = (section: CVSection) => {
    switch (section.id) {
      case 'skills':
        if (!skills.length) return null;
        return (
          <ul className="cv-chronicle-skill-list">
            {skills.map((skill: Skill) => (
              <li key={skill.id} className="cv-chronicle-skill-item">
                <span className="cv-chronicle-skill-bullet" />
                <span>
                  {skill.name}
                  {skill.level && <span className="cv-chronicle-muted"> ({skill.level})</span>}
                </span>
              </li>
            ))}
          </ul>
        );
        
      case 'languages':
        if (!languages.length) return null;
        return (
          <ul className="cv-chronicle-skill-list">
             {languages.map((lang) => (
                 <li key={lang.id} className="cv-chronicle-skill-item">
                    <span className="cv-chronicle-skill-bullet" />
                    <span>{lang.name} {lang.description && `(${lang.description})`}</span>
                 </li>
             ))}
          </ul>
        );

      case 'interests':
        if (!interests.length) return null;
        return (
           <ul className="cv-chronicle-skill-list">
               {interests.map((int) => (
                   <li key={int.id} className="cv-chronicle-skill-item">
                       <span className="cv-chronicle-skill-bullet" />
                       <span>{int.name}</span>
                   </li>
               ))}
           </ul>
        );
        
      case 'websites':
          if (!websites.length) return null;
          return (
              <ul className="cv-chronicle-skill-list">
                  {websites.map(web => (
                      <li key={web.id} className="cv-chronicle-skill-item">
                          <LinkIcon size={12} style={{ marginRight: 8 }} />
                          <a href={web.url} target="_blank" rel="noreferrer">{web.name || web.url}</a>
                      </li>
                  ))}
              </ul>
          );

      case 'awards':
        if (!awards.length) return null;
        return (
          <ul className="cv-chronicle-skill-list">
            {awards.map((award) => (
              <li key={award.id} className="cv-chronicle-skill-item" style={{ alignItems: 'flex-start' }}>
                <span className="cv-chronicle-skill-bullet" style={{ marginTop: '0.4em' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500 }}>{award.title}</span>
                  <span className="cv-chronicle-muted" style={{ fontSize: '0.85em' }}>{award.issuer}</span>
                </div>
              </li>
            ))}
          </ul>
        );

      case 'certifications':
        if (!certifications.length) return null;
        return (
          <ul className="cv-chronicle-skill-list">
            {certifications.map((cert: Certification) => (
              <li key={cert.id} className="cv-chronicle-skill-item" style={{ alignItems: 'flex-start' }}>
                <span className="cv-chronicle-skill-bullet" style={{ marginTop: '0.4em' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500 }}>{cert.name}</span>
                  <div className="cv-chronicle-muted" style={{ fontSize: '0.85em' }}>
                    {cert.issuer}
                    {cert.issueDate && <span> • {cert.issueDate}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="cv-html-root cv-chronicle"
      style={{
        '--accent-color': theme.primaryColor,
        '--font-family': appliedFont,
        fontFamily: appliedFont,
      } as React.CSSProperties}
    >
      <header className="cv-chronicle-header">
        <div className="cv-chronicle-header-name">{personalDetails.fullName || 'Your Name'}</div>
        <div className="cv-chronicle-header-role">{personalDetails.jobTitle || 'Professional Title'}</div>
      </header>

      <div className="cv-chronicle-layout" data-parallel-pagination="true">
        {/* Sidebar */}
        <aside className="cv-chronicle-aside" data-parallel-column="true">
          {/* Contact Details (Fixed at top of sidebar) */}
          <div className="cv-chronicle-sidebar-section">
            <div className="cv-chronicle-sidebar-section-title">Contact</div>
            <div className="cv-chronicle-contact-list">
              {personalDetails.phone && (
                <div className="cv-chronicle-contact-item">
                  <Phone className="cv-chronicle-contact-icon" />
                  <span>{personalDetails.phone}</span>
                </div>
              )}
              {personalDetails.email && (
                <div className="cv-chronicle-contact-item">
                  <Mail className="cv-chronicle-contact-icon" />
                  <span>{personalDetails.email}</span>
                </div>
              )}
              {personalDetails.address && (
                <div className="cv-chronicle-contact-item">
                  <MapPin className="cv-chronicle-contact-icon" />
                  <span>{personalDetails.address}</span>
                </div>
              )}
              {personalDetails.website && (
                <div className="cv-chronicle-contact-item">
                  <Globe className="cv-chronicle-contact-icon" />
                  <span>{personalDetails.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Other Sidebar Sections */}
          {sidebarSections.map(section => {
             const content = renderSidebarContent(section);
             if (!content) return null;
             return (
                 <div key={section.id} className="cv-chronicle-sidebar-section">
                     <div className="cv-chronicle-sidebar-section-title">{section.title}</div>
                     {content}
                 </div>
             )
          })}
        </aside>

        <main className="cv-chronicle-main" data-parallel-column="true">
          {mainSections.map(section => {
            const content = renderSectionContent(section);
            if (!content && section.id !== 'summary') return null;
            if (section.id === 'summary' && !professionalSummary?.content) return null;

            return (
              <section key={section.id} className="cv-chronicle-main-section">
                <div className="cv-chronicle-section-icon-wrapper">
                  <div className="cv-chronicle-section-icon-circle">
                    {getSectionIcon(section.id)}
                  </div>
                </div>
                <div className="cv-chronicle-main-section-header">
                  <h2 className="cv-chronicle-main-section-title">{section.title}</h2>
                </div>
                <div className="cv-chronicle-main-section-content">
                  {content}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
