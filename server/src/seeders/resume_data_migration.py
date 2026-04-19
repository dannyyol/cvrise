
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.resume import Resume
from src.constants import DEFAULT_RESUME_SECTIONS
from src.seeders.base import BaseSeeder
import logging
import uuid

logger = logging.getLogger(__name__)

class ResumeDataMigrationSeeder(BaseSeeder):
    async def run(self, session: AsyncSession, user_id: str | None = None, commit: bool = True) -> None:
        if not user_id:
            logger.info("Skipping resume_data migration seeding (no user_id).")
            return

        stmt = select(Resume).where(Resume.user_id == user_id).order_by(Resume.updated_at.desc()).limit(1)
        result = await session.execute(stmt)
        resume = result.scalar_one_or_none()

        if not resume:
            logger.warning(f"Resume for {user_id} not found. Skipping resume_data migration.")
            return

        if resume.resume_data:
            logger.info(f"Resume data for {user_id} already exists. Skipping.")
            return

        logger.info(f"Seeding resume_data column for {user_id} resume...")

        resume_data = {
            "personalDetails": {
                "fullName": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1 (555) 123-4567",
                "address": "123 Main Street, San Francisco, CA, United States",
                "jobTitle": "Senior Software Engineer",
                "website": "https://johndoe.dev",
                "linkedin": "https://linkedin.com/in/johndoe",
                "github": ""
            },
            "professionalSummary": {
                "content": "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and driving technical innovation in fast-paced environments. Passionate about clean code, mentoring junior developers, and staying current with emerging technologies."
            },
            "workExperiences": [
                {
                    "id": str(uuid.uuid4()),
                    "company": "Tech Innovators Inc.",
                    "position": "Senior Software Engineer",
                    "location": "San Francisco, CA",
                    "startDate": "2020-03",
                    "endDate": "",
                    "current": True,
                    "description": "Leading development of cloud-native applications serving 10M+ users. Architected microservices infrastructure reducing latency by 40%. Mentoring team of 5 junior engineers and conducting code reviews. Technologies: React, Node.js, AWS, Kubernetes, PostgreSQL."
                },
                {
                    "id": str(uuid.uuid4()),
                    "company": "Digital Solutions Corp",
                    "position": "Software Engineer",
                    "location": "San Francisco, CA",
                    "startDate": "2017-06",
                    "endDate": "2020-02",
                    "current": False,
                    "description": "Developed and maintained enterprise web applications for Fortune 500 clients. Implemented CI/CD pipelines improving deployment frequency by 300%. Collaborated with cross-functional teams to deliver projects on time and within budget."
                },
                {
                    "id": str(uuid.uuid4()),
                    "company": "StartUp Ventures",
                    "position": "Junior Developer",
                    "location": "Palo Alto, CA",
                    "startDate": "2014-07",
                    "endDate": "2017-05",
                    "current": False,
                    "description": "Built responsive web interfaces and RESTful APIs for SaaS platform. Participated in agile sprints and daily standups. Gained experience in full-stack development and legacy JavaScript frameworks."
                },
                {
                    "id": str(uuid.uuid4()),
                    "company": "Global Tech Labs",
                    "position": "Intern - Software Development",
                    "location": "Mountain View, CA",
                    "startDate": "2013-06",
                    "endDate": "2013-08",
                    "current": False,
                    "description": "Worked on internal tools for automation testing and data visualization using Python and Flask. Improved build times by 25% through automated CI pipelines."
                }
            ],
            "education": [
                {
                    "id": str(uuid.uuid4()),
                    "institution": "Stanford University",
                    "degree": "Master of Science",
                    "fieldOfStudy": "Computer Science",
                    "startDate": "2012-09",
                    "endDate": "2014-06",
                    "current": False,
                    "description": "Specialized in distributed systems and machine learning. GPA: 3.9/4.0. Thesis on scalable microservices architecture."
                },
                {
                    "id": str(uuid.uuid4()),
                    "institution": "University of California, Berkeley",
                    "degree": "Bachelor of Science",
                    "fieldOfStudy": "Computer Science",
                    "startDate": "2008-09",
                    "endDate": "2012-06",
                    "current": False,
                    "description": "Dean's List all semesters. President of Computer Science Student Association. Graduated Summa Cum Laude."
                },
                {
                    "id": str(uuid.uuid4()),
                    "institution": "Harvard Extension School",
                    "degree": "Certificate",
                    "fieldOfStudy": "Data Science & Artificial Intelligence",
                    "startDate": "2021-01",
                    "endDate": "2021-12",
                    "current": False,
                    "description": "Completed professional certification in data science and AI. Focused on Python, TensorFlow, and deep learning applications."
                }
            ],
            "skills": [
                {"id": str(uuid.uuid4()), "name": "JavaScript/TypeScript", "level": "Expert"},
                {"id": str(uuid.uuid4()), "name": "React & Next.js", "level": "Expert"},
                {"id": str(uuid.uuid4()), "name": "Node.js & Express", "level": "Expert"},
                {"id": str(uuid.uuid4()), "name": "AWS & Cloud Architecture", "level": "Advanced"},
                {"id": str(uuid.uuid4()), "name": "Docker & Kubernetes", "level": "Advanced"},
                {"id": str(uuid.uuid4()), "name": "PostgreSQL & MongoDB", "level": "Advanced"},
                {"id": str(uuid.uuid4()), "name": "Python", "level": "Intermediate"},
                {"id": str(uuid.uuid4()), "name": "GraphQL", "level": "Intermediate"},
                {"id": str(uuid.uuid4()), "name": "CI/CD (GitHub Actions, Jenkins)", "level": "Advanced"},
                {"id": str(uuid.uuid4()), "name": "Agile/Scrum", "level": "Advanced"}
            ],
            "projects": [
                {
                    "id": str(uuid.uuid4()),
                    "name": "E-Commerce Platform Redesign",
                    "description": "Led complete overhaul of legacy e-commerce platform serving 500K monthly users. Implemented legacy React architecture with TypeScript, reducing page load times by 60% and increasing conversion rates by 25%. Integrated Stripe payment gateway and real-time inventory management.",
                    "technologies": ["React", "TypeScript", "Stripe", "Node.js"],
                    "link": "https://example-ecommerce.com",
                    "startDate": "2023-01",
                    "endDate": "2023-08"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Real-Time Analytics Dashboard",
                    "description": "Built comprehensive analytics dashboard with real-time data visualization using React, D3.js, and WebSockets. Processed millions of events daily with sub-second latency. Enabled business stakeholders to make data-driven decisions faster.",
                    "technologies": ["React", "D3.js", "WebSockets", "Redis"],
                    "link": "https://github.com/johndoe/analytics-dashboard",
                    "startDate": "2022-06",
                    "endDate": "2022-12"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Open Source Contribution - React Toolkit",
                    "description": "Active contributor to popular open-source React state management library. Implemented performance optimizations reducing bundle size by 30%. Authored documentation and helped triage community issues.",
                    "technologies": ["React", "JavaScript", "Jest"],
                    "link": "https://github.com/example/react-toolkit",
                    "startDate": "2021-01",
                    "endDate": ""
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Smart Home IoT Dashboard",
                    "description": "Developed a smart home management dashboard integrating IoT sensors with real-time data visualization. Built using Vue.js, Flask, and MQTT. Improved system reliability and reduced response latency by 35%.",
                    "technologies": ["Vue.js", "Flask", "MQTT", "Python"],
                    "link": "https://github.com/johndoe/smart-home-dashboard",
                    "startDate": "2020-04",
                    "endDate": "2020-10"
                }
            ],
            "certifications": [
                {
                    "id": str(uuid.uuid4()),
                    "name": "AWS Certified Solutions Architect - Professional",
                    "issuer": "Amazon Web Services",
                    "issueDate": "2023-03",
                    "expiryDate": "2026-03",
                    "link": "https://aws.amazon.com/certification/certified-solutions-architect-professional/"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Certified Kubernetes Administrator (CKA)",
                    "issuer": "Cloud Native Computing Foundation",
                    "issueDate": "2022-09",
                    "expiryDate": "2025-09",
                    "link": "https://www.cncf.io/certification/cka/"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Professional Scrum Master I",
                    "issuer": "Scrum.org",
                    "issueDate": "2021-05",
                    "expiryDate": "",
                    "link": "https://www.scrum.org/professional-scrum-master-i-certification"
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Google Cloud Professional Developer",
                    "issuer": "Google Cloud",
                    "issueDate": "2020-08",
                    "expiryDate": "2023-08",
                    "link": "https://cloud.google.com/certification/cloud-developer"
                }
            ],
            "awards": [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Employee of the Year",
                    "issuer": "Tech Innovators Inc.",
                    "date": "2023-12",
                    "description": "Recognized for outstanding leadership and contributions to cloud infrastructure modernization."
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Best Open Source Contributor",
                    "issuer": "React Developer Community",
                    "date": "2022-06",
                    "description": "Awarded for impactful open-source contributions and active engagement in the React community."
                }
            ],
            "publications": [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Optimizing Microservice Architecture for Scalable Web Applications",
                    "publisher": "IEEE Software Engineering Journal",
                    "date": "2023-05",
                    "description": "Authored a peer-reviewed paper on design strategies for distributed microservice systems using event-driven patterns.",
                    "link": "https://ieeexplore.ieee.org/document/1234567"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Leveraging AI for Predictive Cloud Scaling",
                    "publisher": "Medium Technology",
                    "date": "2022-09",
                    "description": "Published an article exploring AI-driven predictive scaling algorithms for AWS-based cloud infrastructure.",
                    "link": "https://medium.com/@johndoe/ai-for-cloud-scaling"
                }
            ],
            "sections": DEFAULT_RESUME_SECTIONS,
            "languages": [],
            "interests": [],
            "websites": [],
            "volunteering": [],
            "references": [],
            "custom": []
        }

        resume.resume_data = resume_data
        if commit:
            await session.commit()
        else:
            await session.flush()
        logger.info("Resume data migration completed successfully.")
