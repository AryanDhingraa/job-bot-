import os
import openai
import google.generativeai as palm
from flask import current_app
import PyPDF2
import docx
import re

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
    """Analyze job description and compare with resume using AI."""
    # Initialize AI clients
    openai.api_key = current_app.config['OPENAI_API_KEY']
    palm.configure(api_key=current_app.config['GOOGLE_AI_API_KEY'])
    
    # Extract skills from job description using OpenAI
    job_skills_prompt = f"""
    Extract a list of required skills and qualifications from this job description:
    {job_description}
    
    Return the skills in a comma-separated format.
    """
    
    job_skills_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that extracts skills from job descriptions."},
            {"role": "user", "content": job_skills_prompt}
        ]
    )
    job_skills = job_skills_response.choices[0].message.content.split(',')
    job_skills = [skill.strip() for skill in job_skills]
    
    # Extract skills from resume using OpenAI
    resume_skills_prompt = f"""
    Extract a list of skills and qualifications from this resume:
    {resume_text}
    
    Return the skills in a comma-separated format.
    """
    
    resume_skills_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that extracts skills from resumes."},
            {"role": "user", "content": resume_skills_prompt}
        ]
    )
    resume_skills = resume_skills_response.choices[0].message.content.split(',')
    resume_skills = [skill.strip() for skill in resume_skills]
    
    # Find matching and missing skills
    matching_skills = [skill for skill in job_skills if any(re.search(re.escape(skill), rs, re.IGNORECASE) for rs in resume_skills)]
    missing_skills = [skill for skill in job_skills if skill not in matching_skills]
    
    # Get detailed analysis using Google PaLM
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
    
    analysis_response = palm.generate_text(
        prompt=analysis_prompt,
        temperature=0.7,
        max_output_tokens=500
    )
    
    return {
        'analysis': analysis_response.result,
        'matching_skills': matching_skills,
        'missing_skills': missing_skills
    }

def generate_cover_letter(job_description, resume_text):
    """Generate a tailored cover letter using AI."""
    # Initialize OpenAI client
    openai.api_key = current_app.config['OPENAI_API_KEY']
    
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
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a professional cover letter writer."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=800
    )
    
    return response.choices[0].message.content

def suggest_resume_improvements(job_description, resume_text):
    """Suggest improvements for the resume based on the job description."""
    # Initialize Google PaLM client
    palm.configure(api_key=current_app.config['GOOGLE_AI_API_KEY'])
    
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
    
    response = palm.generate_text(
        prompt=prompt,
        temperature=0.7,
        max_output_tokens=800
    )
    
    return response.result

def prepare_interview_questions(job_description, resume_text):
    """Generate potential interview questions and suggested answers."""
    # Initialize OpenAI client
    openai.api_key = current_app.config['OPENAI_API_KEY']
    
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
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert interview coach."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1500
    )
    
    return response.choices[0].message.content 