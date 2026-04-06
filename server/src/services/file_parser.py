import re
import io
import uuid
from typing import Dict, Any, List
from venv import logger
from pypdf import PdfReader
from docx import Document

class FileParser:
    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> str:
        try:
            reader = PdfReader(io.BytesIO(file_content))
            text = []
            for page in reader.pages:
                text.append(page.extract_text())
            return "\n".join(text)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {str(e)}")

    @staticmethod
    def extract_text_from_docx(file_content: bytes) -> str:
        try:
            doc = Document(io.BytesIO(file_content))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX: {str(e)}")
