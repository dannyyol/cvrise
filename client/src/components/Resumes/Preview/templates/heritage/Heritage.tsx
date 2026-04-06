import React from 'react';
import type { TemplateProps, WorkExperience, Education, Skill, Project, Certification, Award, Publication, CVSection } from '../registry';
import { formatDateRange } from '@/src/lib/dateFormatting';
import './styles.css';

const HTMLContent = ({ content }: { content: string }) => (
  <div className="cv-heritage-paragraph" dangerouslySetInnerHTML={{ __html: content }} />
);

const ContactSection = ({ personalDetails, title }: { personalDetails: any, title: string }) => {
  const { address, phone, email, website } = personalDetails;
  
  return (
    <section className="cv-heritage-side-group" data-cv-section data-section-id="contact">
      <h3 className="cv-heritage-side-title">{title || 'Contact'}</h3>
      <ul className="cv-heritage-side-list cv-heritage-contact-list">
        {address && (
          <li><span className="cv-heritage-label">Address:</span> {address}</li>
        )}
        {phone && (
          <li><span className="cv-heritage-label">Phone:</span> {phone}</li>
        )}
        {email && (
          <li><span className="cv-heritage-label">Email:</span> {email}</li>
        )}
        {website && (
          <li><span className="cv-heritage-label">Web:</span> {website}</li>
        )}
      </ul>
    </section>
  );
};

const WebsitesSection = ({ websites, title }: { websites: any[], title: string }) => {
  if (!websites?.length) return null;
  return (
    <section className="cv-heritage-side-group" data-cv-section data-section-id="websites">
      <h3 className="cv-heritage-side-title">{title || 'Websites, Portfolios, Profiles'}</h3>
      <ul className="cv-heritage-side-list cv-heritage-bullets">
        {websites.map((w, i) => (
          <li key={i}>
            <a href={w.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
              {w.url.replace(/^https?:\/\//, '')}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

const SkillsSection = ({ skills, title }: { skills: Skill[], title: string }) => {
  if (!skills?.length) return null;
  return (
    <section className="cv-heritage-side-group" data-cv-section data-section-id="skills">
      <h3 className="cv-heritage-side-title">{title || 'Skills'}</h3>
      <ul className="cv-heritage-side-list">
        {skills.map((sk: Skill) => (
          <li key={sk.id}>
            {sk.name}{sk.level ? ` (${sk.level})` : ''}
          </li>
        ))}
      </ul>
    </section>
  );
};

const LanguagesSection = ({ languages, title }: { languages: any[], title: string }) => {
  if (!languages?.length) return null;
  return (
    <section className="cv-heritage-side-group" data-cv-section data-section-id="languages">
      <h3 className="cv-heritage-side-title">{title || 'Languages'}</h3>
      <ul className="cv-heritage-side-list">
        {languages.map((lang: any) => (
          <li key={lang.id}>
            {lang.name}{lang.description ? ` (${lang.description})` : ''}
          </li>
        ))}
      </ul>
    </section>
  );
};

const InterestsSection = ({ interests, title }: { interests: any[], title: string }) => {
  if (!interests?.length) return null;
  return (
    <section className="cv-heritage-side-group" data-cv-section data-section-id="interests">
      <h3 className="cv-heritage-side-title">{title || 'Hobbies & Interests'}</h3>
      <ul className="cv-heritage-side-list cv-heritage-bullets">
        {interests.map((int: any) => (
          <li key={int.id}>{int.name}</li>
        ))}
      </ul>
    </section>
  );
};

const SummarySection = ({ summary, title }: { summary: any, title: string }) => {
  if (!summary?.content) return null;
  return (
    <section className="cv-heritage-section" data-cv-section data-section-id="summary">
      <h2 className="cv-heritage-section-title">{title || 'Professional Summary'}</h2>
      <HTMLContent content={summary.content} />
    </section>
  );
};

const ExperienceSection = ({ experiences, title, dateLocale }: { experiences: WorkExperience[], title: string; dateLocale: string }) => {
  if (!experiences?.length) return null;
  return (
    <section className="cv-heritage-section" data-cv-section data-section-id="experience">
      <h2 className="cv-heritage-section-title">{title || 'Work History'}</h2>
      <ul className="cv-heritage-list">
        {experiences.map((exp: WorkExperience) => (
          <li className="cv-heritage-list-item" key={exp.id}>
            <div className="cv-heritage-item-head">
              <div className="cv-heritage-item-row-main">
                <span className="cv-heritage-item-title">{exp.position || 'Job Title'}</span>
                {(exp.startDate || exp.endDate || exp.current) ? (
                  <span className="cv-heritage-item-date">
                    {`, ${formatDateRange(exp.startDate, exp.endDate, dateLocale, { current: exp.current, presentLabel: 'Current' })}`}
                  </span>
                ) : null}
              </div>
              <div className="cv-heritage-item-sub">
                {exp.company}{exp.location ? ` - ${exp.location}` : ''}
              </div>
            </div>
            {exp.description && <HTMLContent content={exp.description} />}
          </li>
        ))}
      </ul>
    </section>
  );
};

const EducationSection = ({ education, title, dateLocale }: { education: Education[], title: string; dateLocale: string }) => {
  if (!education?.length) return null;
  return (
    <section className="cv-heritage-section" data-cv-section data-section-id="education">
      <h2 className="cv-heritage-section-title">{title || 'Education'}</h2>
      <ul className="cv-heritage-list">
        {education.map((ed: Education) => (
          <li className="cv-heritage-list-item" key={ed.id}>
            <div className="cv-heritage-item-head">
              <div className="cv-heritage-item-title">
                {ed.degree}
              </div>
              <div className="cv-heritage-item-sub">
                {ed.institution}
              </div>
              {(ed.startDate || ed.endDate || ed.current) ? (
                <div className="cv-heritage-item-meta">
                  {formatDateRange(ed.startDate, ed.endDate, dateLocale, { current: ed.current, presentLabel: 'Present' })}
                </div>
              ) : null}
            </div>
            {ed.description && <HTMLContent content={ed.description} />}
          </li>
        ))}
      </ul>
    </section>
  );
};

const CertificationsSection = ({ certifications, title }: { certifications: Certification[], title: string }) => {
  if (!certifications?.length) return null;
  return (
    <section className="cv-heritage-section" data-cv-section data-section-id="certifications">
      <h2 className="cv-heritage-section-title">{title || 'Certifications'}</h2>
      <ul className="cv-heritage-list">
        {certifications.map((c: Certification) => (
          <li className="cv-heritage-list-item" key={c.id}>
            <div className="cv-heritage-item-title">{c.name}</div>
            {c.issuer ? <div className="cv-heritage-item-sub">{c.issuer}</div> : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

const ProjectsSection = ({ projects, title }: { projects: Project[], title: string }) => {
  if (!projects?.length) return null;
  return (
    <section className="cv-heritage-section" data-cv-section data-section-id="projects">
      <h2 className="cv-heritage-section-title">{title || 'Projects'}</h2>
      <ul className="cv-heritage-list">
        {projects.map((p: Project) => (
          <li className="cv-heritage-list-item" key={p.id}>
            <div className="cv-heritage-item-title">{p.name || 'Project'}</div>
            {p.description && <HTMLContent content={p.description} />}
          </li>
        ))}
      </ul>
    </section>
  );
};

const AwardsSection = ({ awards, title }: { awards: Award[], title: string }) => {
  if (!awards?.length) return null;
  return (
    <section className="cv-heritage-section" data-cv-section data-section-id="awards">
      <h2 className="cv-heritage-section-title">{title || 'Awards'}</h2>
      <ul className="cv-heritage-list">
        {awards.map((award: Award) => (
          <li className="cv-heritage-list-item" key={award.id}>
            <div className="cv-heritage-item-head">
              <div className="cv-heritage-item-row-main">
                <span className="cv-heritage-item-title">{award.title || 'Award'}</span>
                {award.date ? (
                  <span className="cv-heritage-item-date">{award.date}</span>
                ) : null}
              </div>
              {award.issuer ? <div className="cv-heritage-item-sub">{award.issuer}</div> : null}
            </div>
            {award.description && <HTMLContent content={award.description} />}
          </li>
        ))}
      </ul>
    </section>
  );
};

const PublicationsSection = ({ publications, title }: { publications: Publication[], title: string }) => {
  if (!publications?.length) return null;
  return (
    <section className="cv-heritage-section" data-cv-section data-section-id="publications">
      <h2 className="cv-heritage-section-title">{title || 'Publications'}</h2>
      <ul className="cv-heritage-list">
        {publications.map((pub: Publication) => (
          <li className="cv-heritage-list-item" key={pub.id}>
            <div className="cv-heritage-item-head">
              <div className="cv-heritage-item-row-main">
                <span className="cv-heritage-item-title">{pub.title || 'Publication'}</span>
                {pub.date ? (
                  <span className="cv-heritage-item-date">{pub.date}</span>
                ) : null}
              </div>
              {pub.publisher ? <div className="cv-heritage-item-sub">{pub.publisher}</div> : null}
            </div>
            {pub.link ? (
              <div className="cv-heritage-paragraph">
                <a href={pub.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {pub.link.replace(/^https?:\/\//, '')}
                </a>
              </div>
            ) : null}
            {pub.description && <HTMLContent content={pub.description} />}
          </li>
        ))}
      </ul>
    </section>
  );
};

// --- Main Component ---

export default function Heritage(props: TemplateProps) {
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
  const appliedFont = theme.fontFamily || 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

  // --- Layout Logic ---
  
  // Define which sections live in the sidebar; ordering comes from sections config
  // Note: 'websites' maps to our constructed websitesList section
  const sidebarSectionIds = ['personal', 'websites', 'skills', 'languages', 'interests'];

  const sidebarSections: CVSection[] = [];
  const mainSections: CVSection[] = [];

  // We need to ensure 'contact' and 'websites' exist in our sections list or are manually added if not present
  // The props.sections usually comes from DB/State. 'contact' is usually implicit or part of header.
  // In Heritage, Contact is explicitly a sidebar section.
  
  // Let's create a normalized list of sections to render
  // If 'contact' isn't in props.sections, we can mock it or just rely on hardcoded render logic if we want strict ordering.
  // However, to follow Elegant's pattern of sorting, we need them in the list.
  
  // Check if we have explicit section configs for contact/websites, if not, create default placeholders
  const allSections = [...sections];

  allSections
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
      case 'websites':
        return <WebsitesSection key={section.id} websites={websites} title={section.title} />;
      case 'skills':
        return <SkillsSection key={section.id} skills={skills} title={section.title} />;
      case 'languages':
        return <LanguagesSection key={section.id} languages={languages} title={section.title} />;
      case 'interests':
        return <InterestsSection key={section.id} interests={interests} title={section.title} />;
      case 'summary':
        return <SummarySection key={section.id} summary={professionalSummary} title={section.title} />;
      case 'experience':
        return <ExperienceSection key={section.id} experiences={workExperiences} title={section.title} dateLocale={dateLocale} />;
      case 'education':
        return <EducationSection key={section.id} education={education} title={section.title} dateLocale={dateLocale} />;
      case 'certifications':
        return <CertificationsSection key={section.id} certifications={certifications} title={section.title} />;
      case 'projects':
        return <ProjectsSection key={section.id} projects={projects} title={section.title} />;
      case 'awards':
        return <AwardsSection key={section.id} awards={awards} title={section.title} />;
      case 'publications':
        return <PublicationsSection key={section.id} publications={publications} title={section.title} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="cv-html-root cv-heritage"
      style={{
        '--accent-color': theme.primaryColor,
        '--font-family': appliedFont,
        fontFamily: appliedFont,
      } as React.CSSProperties}
    >
      {/* Styles moved to CSS */}
      <header className="cv-heritage-header">
        <div className="cv-heritage-header-name">{personalDetails?.fullName || 'Your Name'}</div>
      </header>

      <div className="cv-heritage-layout" data-parallel-pagination="true">
        <aside className="cv-heritage-sidebar" data-cv-column="sidebar" data-parallel-column="true">
          {sidebarSections.map(section => (
            <React.Fragment key={section.id}>
              {renderSectionContent(section)}
            </React.Fragment>
          ))}
        </aside>
        <main className="cv-heritage-content" data-cv-column="main" data-parallel-column="true">
          {mainSections.map(section => (
            <React.Fragment key={section.id}>
              {renderSectionContent(section)}
            </React.Fragment>
          ))}
        </main>
      </div>
    </div>
  );
}
