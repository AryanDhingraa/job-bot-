import os
import requests
from flask import current_app
import PyPDF2
import docx
import re

def call_lmstudio(prompt, system_prompt=None, max_tokens=800, temperature=0.7):
    url = "http://localhost:1234/v1/chat"
    headers = {"Content-Type": "application/json"}
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    data = {
        "model": "google/gemma-3-12b",
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    response = requests.post(url, headers=headers, json=data, timeout=60)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def extract_resume_text(file_path):
    """Extract text from PDF or DOCX resume files."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                text += page.extract_text()
    elif file_ext in ['.doc', '.docx']:
        doc = docx.Document(file_path)
        text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
    else:
        raise ValueError('Unsupported file format')
    
    return text

def analyze_job_description(job_description, resume_text):
    """Analyze job description and compare with resume using LM Studio LLM."""
    # Extract skills from job description
    job_skills_prompt = f"""
    Extract a list of required skills and qualifications from this job description:
    {job_description}
    Return the skills in a comma-separated format.
    """
    job_skills_str = call_lmstudio(job_skills_prompt, system_prompt="You are a helpful assistant that extracts skills from job descriptions.", max_tokens=256)
    job_skills = [skill.strip() for skill in job_skills_str.split(',')]

    # Extract skills from resume
    resume_skills_prompt = f"""
    Extract a list of skills and qualifications from this resume:
    {resume_text}
    Return the skills in a comma-separated format.
    """
    resume_skills_str = call_lmstudio(resume_skills_prompt, system_prompt="You are a helpful assistant that extracts skills from resumes.", max_tokens=256)
    resume_skills = [skill.strip() for skill in resume_skills_str.split(',')]

    # Find matching and missing skills
    matching_skills = [skill for skill in job_skills if any(re.search(re.escape(skill), rs, re.IGNORECASE) for rs in resume_skills)]
    missing_skills = [skill for skill in job_skills if skill not in matching_skills]

    # Get detailed analysis
    analysis_prompt = f"""
    Analyze this job description and resume match:
    Job Description:
    {job_description}
    Resume:
    {resume_text}
    Provide a brief analysis of:
    1. Overall match between the resume and job requirements
    2. Key strengths that align with the role
    3. Areas where the candidate might need to highlight or develop skills
    Keep the response concise and actionable.
    """
    analysis = call_lmstudio(analysis_prompt, system_prompt="You are a career coach.", max_tokens=500)

    return {
        'analysis': analysis,
        'matching_skills': matching_skills,
        'missing_skills': missing_skills
    }

def generate_cover_letter(job_description, resume_text):
    """Generate a tailored cover letter using LM Studio LLM."""
    prompt = f"""
    Generate a professional cover letter based on this job description and resume:
    Job Description:
    {job_description}
    Resume:
    {resume_text}
    Guidelines:
    1. Keep it concise (3-4 paragraphs)
    2. Highlight relevant experience and skills from the resume
    3. Show enthusiasm for the role and company
    4. Maintain a professional tone
    5. Focus on specific achievements that match job requirements
    6. Include a strong call to action in the closing
    Format the letter professionally with proper spacing and paragraphs.
    """
    return call_lmstudio(prompt, system_prompt="You are a professional cover letter writer.", max_tokens=800)

def suggest_resume_improvements(job_description, resume_text):
    """Suggest improvements for the resume based on the job description using LM Studio LLM."""
    prompt = f"""
    Analyze this resume against the job description and suggest specific improvements:
    Job Description:
    {job_description}
    Resume:
    {resume_text}
    Provide specific suggestions for:
    1. Content improvements (skills, experience, achievements to highlight)
    2. Formatting and structure
    3. Keywords to include
    4. Sections to add or modify
    Keep suggestions specific and actionable.
    """
    return call_lmstudio(prompt, system_prompt="You are a resume expert.", max_tokens=800)

def prepare_interview_questions(job_description, resume_text):
    """Generate potential interview questions and suggested answers using LM Studio LLM."""
    prompt = f"""
    Generate a list of potential interview questions and suggested answers based on this job description and resume:
    Job Description:
    {job_description}
    Resume:
    {resume_text}
    Include:
    1. Technical questions specific to the role
    2. Behavioral questions based on required skills
    3. Questions about past experiences from the resume
    4. Questions about handling situations mentioned in job description
    For each question, provide:
    - The question
    - Why it might be asked
    - Key points to include in the answer
    - A sample answer based on the resume
    Format as a structured list with clear sections.
    """
    return call_lmstudio(prompt, system_prompt="You are an expert interview coach.", max_tokens=1500) 