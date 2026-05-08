#!/usr/bin/env python3
"""
Flask Backend for CV Generator
Handles PDF generation and AI-powered features via Groq API
"""

import os
import json
import tempfile
import requests
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from cv_generator import CVGenerator

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["https://cv-generator-ebon.vercel.app"])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama3-8b-8192"


def call_groq(api_key, messages):
    """Call Groq API and return the response text."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": 500,
        "temperature": 0.7
    }
    response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()


@app.route("/api/generate", methods=["POST"])
def generate_cv():
    """
    Accept form data from CVForm, build CV JSON, generate PDF, return it.
    """
    try:
        data = request.form.to_dict()

        # Build structured CV data matching CVGenerator's expected format
        cv_data = {
            "personal": {
                "full_name": data.get("full_name", ""),
                "email": data.get("email", ""),
                "phone": data.get("phone", ""),
                "location": data.get("location", ""),
                "professional_summary": data.get("professional_summary", "")
            },
            "experience": [],
            "education": [],
            "skills": [],
            "certifications": []
        }

        # Parse dynamic experience entries
        exp_count = int(data.get("experience_count", 0))
        for i in range(exp_count):
            cv_data["experience"].append({
                "company": data.get(f"experience_{i}_company", ""),
                "position": data.get(f"experience_{i}_position", ""),
                "start_date": data.get(f"experience_{i}_start", ""),
                "end_date": data.get(f"experience_{i}_end", ""),
                "description": data.get(f"experience_{i}_description", "")
            })

        # Parse dynamic education entries
        edu_count = int(data.get("education_count", 0))
        for i in range(edu_count):
            cv_data["education"].append({
                "institution": data.get(f"education_{i}_institution", ""),
                "degree": data.get(f"education_{i}_degree", ""),
                "field": data.get(f"education_{i}_field", ""),
                "graduation_year": data.get(f"education_{i}_year", "")
            })

        # Parse comma-separated skills and certifications
        raw_skills = data.get("skills", "")
        if raw_skills:
            cv_data["skills"] = [s.strip() for s in raw_skills.split(",") if s.strip()]

        raw_certs = data.get("certifications", "")
        if raw_certs:
            cv_data["certifications"] = [c.strip() for c in raw_certs.split(",") if c.strip()]

        # Generate PDF to a temp file
        template = data.get("template", "modern")
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp_path = tmp.name

        generator = CVGenerator(cv_data, tmp_path, template)
        generator.generate()

        full_name = cv_data["personal"]["full_name"].replace(" ", "_") or "CV"
        filename = f"{full_name}_CV.pdf"

        return send_file(
            tmp_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ai-generate", methods=["POST"])
def ai_generate_description():
    """
    Use Groq to generate a professional job description for a given job title.
    """
    try:
        body = request.get_json()
        job_title = body.get("job_title", "").strip()
        api_key = body.get("api_key", "").strip() or os.getenv("GROQ_API_KEY", "")

        if not job_title:
            return jsonify({"error": "job_title is required"}), 400
        if not api_key:
            return jsonify({"error": "Groq API key is required"}), 400

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a professional resume writer. Write a concise, "
                    "impactful job description bullet point (2-3 sentences) "
                    "for a resume. Focus on achievements and measurable impact. "
                    "Do not include a job title or company name."
                )
            },
            {
                "role": "user",
                "content": f"Write a resume job description for: {job_title}"
            }
        ]

        description = call_groq(api_key, messages)
        return jsonify({"description": description})

    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"Groq API error: {e.response.text}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/cover-letter", methods=["POST"])
def generate_cover_letter():
    """
    Use Groq to generate a professional cover letter.
    """
    try:
        body = request.get_json()
        name = body.get("name", "").strip()
        job_title = body.get("job_title", "").strip()
        company = body.get("company", "").strip()
        skills = body.get("skills", "").strip()
        api_key = body.get("api_key", "").strip() or os.getenv("GROQ_API_KEY", "")

        if not all([name, job_title, company]):
            return jsonify({"error": "name, job_title, and company are required"}), 400
        if not api_key:
            return jsonify({"error": "Groq API key is required"}), 400

        skills_line = f"Key skills: {skills}." if skills else ""

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a professional cover letter writer. "
                    "Write a compelling, concise cover letter (3 short paragraphs). "
                    "Be professional, enthusiastic, and specific. "
                    "Do not use placeholders like [Your Address] — write naturally."
                )
            },
            {
                "role": "user",
                "content": (
                    f"Write a cover letter for {name} applying for the role of "
                    f"{job_title} at {company}. {skills_line}"
                )
            }
        ]

        cover_letter = call_groq(api_key, messages)
        return jsonify({"cover_letter": cover_letter})

    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"Groq API error: {e.response.text}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
