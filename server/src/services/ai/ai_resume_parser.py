import json
import uuid
import re
from typing import Dict, Any, Optional
from loguru import logger
from src.services.ai.ai_clients import get_ai_client, TextProcessor, AsyncLLMClient

class AIResumeParser:
    @staticmethod
    async def parse_with_client(
        text: str,
        client: AsyncLLMClient,
        model: str
    ) -> Dict[str, Any]:
        """
        Parses resume text using a provided AI client.
        """
        prompt = (
            "You are an expert Resume Parser. Your task is to extract structured data from the provided resume text.\n"
            "Return ONLY valid JSON matching the following structure. Do not include any explanation or markdown code blocks.\n\n"
            "Schema Structure:\n"
            "{\n"
            '  "personalDetails": {\n'
            '    "fullName": "...",\n'
            '    "email": "...",\n'
            '    "phone": "...",\n'
            '    "address": "...",\n'
            '    "jobTitle": "...",\n'
            '    "website": "...",\n'
            '    "linkedin": "...",\n'
            '    "github": "..."\n'
            '  },\n'
            '  "professionalSummary": {\n'
            '    "content": "..."\n'
            '  },\n'
            '  "workExperiences": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "company": "...",\n'
            '      "position": "...",\n'
            '      "location": "...",\n'
            '      "startDate": "YYYY-MM",\n'
            '      "endDate": "YYYY-MM or Present",\n'
            '      "current": boolean,\n'
            '      "description": "..."\n'
            '    }\n'
            '  ],\n'
            '  "education": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "institution": "...",\n'
            '      "degree": "...",\n'
            '      "fieldOfStudy": "...",\n'
            '      "startDate": "YYYY-MM",\n'
            '      "endDate": "YYYY-MM",\n'
            '      "current": boolean,\n'
            '      "description": "..."\n'
            '    }\n'
            '  ],\n'
            '  "skills": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "name": "...",\n'
            '      "level": "..."\n'
            '    }\n'
            '  ],\n'
            '  "projects": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "name": "...",\n'
            '      "description": "...",\n'
            '      "technologies": ["tech1", "tech2"],\n'
            '      "link": "...",\n'
            '      "startDate": "...",\n'
            '      "endDate": "..."\n'
            '    }\n'
            '  ],\n'
            '  "certifications": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "name": "...",\n'
            '      "issuer": "...",\n'
            '      "issueDate": "...",\n'
            '      "expiryDate": "...",\n'
            '      "credentialId": "...",\n'
            '      "link": "..."\n'
            '    }\n'
            '  ],\n'
            '  "awards": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "title": "...",\n'
            '      "issuer": "...",\n'
            '      "date": "...",\n'
            '      "description": "..."\n'
            '    }\n'
            '  ],\n'
            '  "publications": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "title": "...",\n'
            '      "publisher": "...",\n'
            '      "date": "...",\n'
            '      "description": "...",\n'
            '      "link": "..."\n'
            '    }\n'
            '  ],\n'
            '  "languages": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "name": "Language Name",\n'
            '      "description": "Proficiency Level"\n'
            '    }\n'
            '  ],\n'
            '  "interests": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "name": "Interest Name",\n'
            '      "description": "Details"\n'
            '    }\n'
            '  ],\n'
            '  "websites": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "name": "Site Name",\n'
            '      "url": "..."\n'
            '    }\n'
            '  ],\n'
            '  "references": [\n'
            '    {\n'
            '      "id": "generate-uuid",\n'
            '      "name": "Reference Name",\n'
            '      "description": "Details/Contact"\n'
            '    }\n'
            '  ]\n'
            '}\n\n'
            "Instructions:\n"
            "1. Generate unique UUIDs for all 'id' fields.\n"
            "2. If a field is missing in the text, return empty string or empty list.\n"
            "3. Extract all available sections. If a section like 'volunteering' is present but not in schema, put it in 'projects' or ignore it.\n"
            "4. For 'personalDetails', try to infer 'fullName' accurately (e.g. split across lines).\n"
            "5. 'languages', 'interests', 'websites', 'references' should be mapped to the generic structure shown.\n\n"
            "Resume Text:\n"
            f"\"\"\"\n{text}\n\"\"\""
        )

        try:
            response_text = await client.generate(prompt, model)
            
            parsed_data = TextProcessor.extract_json(response_text)
            if not parsed_data:
                logger.error("Failed to extract valid JSON from AI response")
                raise ValueError("Invalid JSON response from AI")
                
            AIResumeParser._ensure_ids(parsed_data)
            AIResumeParser._normalize_data(parsed_data)
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"AI Parsing failed: {str(e)}")
            raise

    @staticmethod
    async def parse_with_ai(
        text: str, 
        provider: str, 
        api_key: Optional[str], 
        base_url: str, 
        model: str
    ) -> Dict[str, Any]:
        """
        Legacy wrapper for parsing resume text using the specified AI provider and model.
        """
        client = get_ai_client(provider, base_url, api_key)
        return await AIResumeParser.parse_with_client(text, client, model)

    @staticmethod
    def _normalize_data(data: Dict[str, Any]):
        """Ensures all required fields are present with default values."""
        
        if "education" in data and isinstance(data["education"], list):
            for item in data["education"]:
                if isinstance(item, dict):
                    item.setdefault("institution", "")
                    item.setdefault("degree", "")
                    item.setdefault("fieldOfStudy", "")
                    item.setdefault("startDate", "")
                    item.setdefault("endDate", "")
                    item.setdefault("current", False)
                    item.setdefault("description", "")

        if "workExperiences" in data and isinstance(data["workExperiences"], list):
            for item in data["workExperiences"]:
                if isinstance(item, dict):
                    item.setdefault("company", "")
                    item.setdefault("position", "")
                    item.setdefault("location", "")
                    item.setdefault("startDate", "")
                    item.setdefault("endDate", "")
                    item.setdefault("current", False)
                    item.setdefault("description", "")

        if "skills" in data and isinstance(data["skills"], list):
            for item in data["skills"]:
                if isinstance(item, dict):
                    item.setdefault("name", "")
                    item.setdefault("level", "")

        if "projects" in data and isinstance(data["projects"], list):
            for item in data["projects"]:
                if isinstance(item, dict):
                    item.setdefault("name", "")
                    item.setdefault("description", "")
                    item.setdefault("technologies", [])
                    item.setdefault("link", "")
                    item.setdefault("startDate", "")
                    item.setdefault("endDate", "")

        if "certifications" in data and isinstance(data["certifications"], list):
            for item in data["certifications"]:
                if isinstance(item, dict):
                    item.setdefault("name", "")
                    item.setdefault("issuer", "")
                    item.setdefault("issueDate", "")
                    item.setdefault("link", "")

        if "awards" in data and isinstance(data["awards"], list):
            for item in data["awards"]:
                if isinstance(item, dict):
                    item.setdefault("title", "")
                    item.setdefault("issuer", "")
                    item.setdefault("date", "")
                    item.setdefault("description", "")

        if "publications" in data and isinstance(data["publications"], list):
            for item in data["publications"]:
                if isinstance(item, dict):
                    item.setdefault("title", "")
                    item.setdefault("publisher", "")
                    item.setdefault("date", "")
                    item.setdefault("description", "")
                    item.setdefault("link", "")

        custom_lists = ["languages", "interests", "websites", "references", "volunteering", "custom"]
        for field in custom_lists:
            if field in data and isinstance(data[field], list):
                for item in data[field]:
                    if isinstance(item, dict):
                        item.setdefault("name", "")
                        item.setdefault("description", "")
                        item.setdefault("date", "")
                        item.setdefault("location", "")
                        item.setdefault("url", "")

    @staticmethod
    def _ensure_ids(data: Dict[str, Any]):
        """Ensures all list items have an ID."""
        list_fields = [
            "workExperiences", "education", "skills", "projects", 
            "certifications", "awards", "publications", 
            "languages", "interests", "websites", "references"
        ]
        
        for field in list_fields:
            if field in data and isinstance(data[field], list):
                for item in data[field]:
                    if isinstance(item, dict) and (not item.get("id") or item["id"] == "generate-uuid"):
                        item["id"] = str(uuid.uuid4())
