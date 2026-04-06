import React from 'react';
import type { 
  PersonalDetails,
  ProfessionalSummary,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  Award,
  Publication,
  CVSection,
  TemplateProps,
  TemplateId
} from '../../../../types/resume';
import { TEMPLATE_COMPONENTS } from './registry.generated';

export {
  type PersonalDetails,
  type ProfessionalSummary,
  type WorkExperience,
  type Education,
  type Skill,
  type Project,
  type Certification,
  type Award,
  type Publication,
  type CVSection,
  type TemplateId,
  type TemplateProps
};

export function isTemplateId(value: string): value is TemplateId {
  return value in TEMPLATE_COMPONENTS;
}

export function getTemplateComponent(id: TemplateId): React.ComponentType<TemplateProps> {
  const component = TEMPLATE_COMPONENTS[id];
  if (!component) {
    throw new Error(`Unknown template: ${id}`);
  }
  return component;
}

export function mapCVDataToTemplateProps(data: TemplateProps): TemplateProps {
  return {
    personalDetails: {
      fullName: data.personalDetails.fullName,
      email: data.personalDetails.email,
      phone: data.personalDetails.phone,
      address: data.personalDetails.address,
      jobTitle: data.personalDetails.jobTitle,
      website: data.personalDetails.website,
      linkedin: data.personalDetails.linkedin,
      github: data.personalDetails.github,
    },
    professionalSummary: {
      content: data.professionalSummary?.content,
    },
    workExperiences: (data.workExperiences ?? []).map(exp => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      location: exp.location || '',
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.description,
    })),
    education: (data.education ?? []).map(edu => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      startDate: edu.startDate,
      endDate: edu.endDate,
      current: edu.current,
      description: edu.description,
    })),
    skills: (data.skills ?? []).map(skill => ({
      id: skill.id,
      name: skill.name,
      level: skill.level,
    })),
    projects: (data.projects ?? []).map(proj => ({
      id: proj.id,
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies,
      link: proj.link,
      startDate: proj.startDate,
      endDate: proj.endDate,
    })),
    certifications: (data.certifications ?? []).map(cert => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      credentialId: cert.credentialId,
      link: cert.link,
    })),
    awards: (data.awards ?? []).map(award => ({
      id: award.id,
      title: award.title,
      issuer: award.issuer,
      date: award.date,
      description: award.description,
    })),
    publications: (data.publications ?? []).map(pub => ({
      id: pub.id,
      title: pub.title,
      publisher: pub.publisher,
      date: pub.date,
      description: pub.description,
      link: pub.link,
    })),
    languages: (data.languages ?? []).map(lang => ({
      id: lang.id,
      name: lang.name,
      description: lang.description,
      date: lang.date,
      location: lang.location,
      url: lang.url,
    })),
    interests: (data.interests ?? []).map(int => ({
      id: int.id,
      name: int.name,
      description: int.description,
      date: int.date,
      location: int.location,
      url: int.url,
    })),
    websites: (data.websites ?? []).map(web => ({
      id: web.id,
      name: web.name,
      description: web.description,
      date: web.date,
      location: web.location,
      url: web.url,
    })),
    sections: (data.sections ?? [])
      .filter(sec => sec.isVisible)
      .map(sec => ({
      id: sec.id,
      type: sec.type,
      title: sec.title,
      isVisible: sec.isVisible,
      order: sec.order,
    })),
    theme: data.theme
  };
}
