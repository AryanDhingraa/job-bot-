import os
import streamlit as st
import pdfplumber
from fpdf import FPDF
import requests
import json
from jinja2 import Template
import pdfkit

# --- Helper: Extract text from PDF ---
def extract_text_from_pdf(uploaded_file):
    try:
        with pdfplumber.open(uploaded_file) as pdf:
            pages = [page.extract_text() for page in pdf.pages]
            return "\n".join([p for p in pages if p])
    except Exception as e:
        st.warning(f"Failed to parse PDF: {e}")
        return ""

# --- PDF Download Helper ---
def clean_text_for_pdf(text):
    replacements = {
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "–": "-",
        "—": "-",
        "…": "...",
    }
    for orig, repl in replacements.items():
        text = text.replace(orig, repl)
    return text

def text_to_pdf(text, filename):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)
    text = clean_text_for_pdf(text)
    for line in text.split('\n'):
        pdf.multi_cell(0, 10, line)
    pdf.output(filename)

st.set_page_config(page_title="Tailored CV & Cover Letter Generator", layout="wide")
st.title("Tailored CV & Cover Letter Generator")

# --- Sidebar: Uploads and Settings ---
st.sidebar.header("Upload Your Documents & Settings")
cv_file = st.sidebar.file_uploader("Upload Your CV (PDF or TXT)", type=["pdf", "txt"])
cover_letter_file = st.sidebar.file_uploader("Upload Old Cover Letter (PDF or TXT)", type=["pdf", "txt"])
job_desc_file = st.sidebar.file_uploader("Upload Job Description (PDF or TXT)", type=["pdf", "txt"])
st.sidebar.markdown("---")
st.sidebar.info("This app uses your local LM Studio model for all AI features. No OpenAI or Google AI required.")

# --- Main Area: Extracted Texts ---
st.header("Step 1: Review Extracted Texts")
cv_text = ""
if cv_file:
    if cv_file.type == "application/pdf":
        cv_text = extract_text_from_pdf(cv_file)
    elif cv_file.type == "text/plain":
        cv_text = cv_file.read().decode("utf-8")
    st.subheader("Extracted CV Text")
    st.text_area("CV Text", cv_text, height=200)

cover_letter_text = ""
if cover_letter_file:
    if cover_letter_file.type == "application/pdf":
        cover_letter_text = extract_text_from_pdf(cover_letter_file)
    elif cover_letter_file.type == "text/plain":
        cover_letter_text = cover_letter_file.read().decode("utf-8")
    st.subheader("Extracted Old Cover Letter Text")
    st.text_area("Old Cover Letter Text", cover_letter_text, height=200)

job_desc_text = ""
if job_desc_file:
    if job_desc_file.type == "application/pdf":
        job_desc_text = extract_text_from_pdf(job_desc_file)
    elif job_desc_file.type == "text/plain":
        job_desc_text = job_desc_file.read().decode("utf-8")
    st.subheader("Extracted Job Description Text")
    st.text_area("Job Description Text", job_desc_text, height=200)
else:
    job_desc_text = st.text_area("Paste Job Description Here", "", height=200)

# --- Scenario Injection ---
st.header("Optional: Scenario Injection for CV")
if 'scenario_injection' not in st.session_state:
    st.session_state['scenario_injection'] = ""

col_si1, col_si2 = st.columns([3, 1])
with col_si1:
    scenario_injection = st.text_area(
        "Scenario Injection (e.g., 'Pretend I worked at Coach as a luxury sales associate for 2 years. Add this to my CV and tailor all experience to luxury retail.')",
        st.session_state['scenario_injection'],
        height=100,
        key="scenario_injection_box"
    )
with col_si2:
    if st.button("Suggest Scenario Injection"):
        if job_desc_text.strip():
            try:
                url = "http://localhost:1234/v1/chat/completions"
                prompt = f"Given this job description, suggest a scenario to add to my CV to maximize my chances: {job_desc_text}"
                headers = {"Content-Type": "application/json"}
                data = {
                    "model": "local-model",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 256
                }
                response = requests.post(url, headers=headers, data=json.dumps(data))
                if response.status_code == 200:
                    result = response.json()
                    suggestion = result["choices"][0]["message"]["content"].strip()
                else:
                    suggestion = ""
                if suggestion:
                    st.session_state['scenario_injection'] = suggestion
                    st.experimental_rerun()
                else:
                    st.warning("No suggestion generated. Try again or check your local LLM.")
            except Exception as e:
                st.warning(f"Failed to generate scenario suggestion: {e}")
        else:
            st.warning("Please provide a job description first.")

# --- Step 2: Generate Tailored Documents ---
st.header("Step 2: Generate Tailored CV & Cover Letter")
if 'tailored_cv' not in st.session_state:
    st.session_state['tailored_cv'] = ""
if 'tailored_cover_letter' not in st.session_state:
    st.session_state['tailored_cover_letter'] = ""

def get_cv_template():
    return (
        """[CV TEMPLATE]\n"
        "Name: [Your Name]\n"
        "Contact: [Your Email] | [Your Phone] | [Your LinkedIn]\n"
        "Professional Summary:\n[Summary tailored to the job]\n\n"
        "Work Experience:\n[Rewrite and select the most relevant experiences for the job, using scenario-based bullet points]\n\n"
        "Education:\n[Education details]\n\n"
        "Skills:\n[List of skills most relevant to the job]\n\n"
        "References available upon request.\n"""
    )

def get_cover_letter_template():
    return (
        """[COVER LETTER TEMPLATE]\n"
        "Dear [Hiring Manager],\n\n"
        "I am excited to apply for the [Job Title] position at [Company]. Based on the job description, I believe my background in [relevant skills/experience] makes me an excellent fit.\n\n"
        "[Write 2-3 scenario-based paragraphs showing how your experience matches the job requirements.]\n\n"
        "Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team.\n\n"
        "Sincerely,\n[Your Name]\n"""
    )

def generate_with_local_llm(cv, cover_letter, job_desc, scenario_injection):
    url = "http://localhost:1234/v1/chat/completions"
    prompt = f"""
You are an expert career coach and resume writer. Given the following:
- My old CV:
{cv}
- My old cover letter:
{cover_letter}
- The job description:
{job_desc}
- Additional scenario instructions:
{scenario_injection}

Rewrite my CV and cover letter to maximize my chances for this job. Use the following templates:
CV:
{get_cv_template()}
Cover Letter:
{get_cover_letter_template()}

Make the CV and cover letter highly tailored, scenario-based, and professional. Output:
CV:\n<CV here>\n\nCOVER LETTER:\n<Cover letter here>
"""
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "local-model",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2048
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    if response.status_code != 200:
        raise Exception(f"Local LLM error: {response.status_code} {response.text}")
    result = response.json()
    text = result["choices"][0]["message"]["content"]
    cv_out, cl_out = "", ""
    if "CV:" in text and "COVER LETTER:" in text:
        parts = text.split("COVER LETTER:")
        cv_out = parts[0].replace("CV:", "").strip()
        cl_out = parts[1].strip()
    else:
        cv_out = text
        cl_out = ""
    return cv_out, cl_out

if st.button("Generate Tailored CV and Cover Letter"):
    if not (cv_text and job_desc_text):
        st.warning("Please upload your CV and a job description.")
    else:
        with st.spinner("Generating with AI..."):
            try:
                cv_out, cl_out = generate_with_local_llm(cv_text, cover_letter_text, job_desc_text, scenario_injection)
                st.session_state['tailored_cv'] = cv_out
                st.session_state['tailored_cover_letter'] = cl_out
                st.success("AI generation complete! Review and edit below.")
            except Exception as e:
                st.error(f"AI generation failed: {e}")

# --- Step 3: Editable Results and Download ---
st.header("Step 3: Review, Edit, and Download")
st.session_state['tailored_cv'] = st.text_area("Tailored CV (editable)", st.session_state.get('tailored_cv', ""), height=300)
st.session_state['tailored_cover_letter'] = st.text_area("Tailored Cover Letter (editable)", st.session_state.get('tailored_cover_letter', ""), height=300)

col1, col2 = st.columns(2)
with col1:
    if st.button("Download Tailored CV as PDF"):
        text_to_pdf(st.session_state['tailored_cv'], "tailored_cv.pdf")
        with open("tailored_cv.pdf", "rb") as f:
            st.download_button("Download CV PDF", f, file_name="tailored_cv.pdf")
with col2:
    if st.button("Download Tailored Cover Letter as PDF"):
        text_to_pdf(st.session_state['tailored_cover_letter'], "tailored_cover_letter.pdf")
        with open("tailored_cover_letter.pdf", "rb") as f:
            st.download_button("Download Cover Letter PDF", f, file_name="tailored_cover_letter.pdf")

st.info("You can review, edit, and download your tailored documents. The AI uses a consistent, professional format for every job!")

def render_cv_html(cv_data):
    # cv_data should be a dict with keys: name, contact, skills, education, summary, career_history, etc.
    html_template = '''
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .header { background: #1857a4; color: #fff; padding: 32px 24px 16px 24px; text-align: left; }
            .header h1 { margin: 0; font-size: 2.5em; }
            .header .contact { font-size: 1.1em; margin-top: 8px; }
            .container { display: flex; padding: 24px; }
            .left { width: 32%; padding-right: 24px; border-right: 2px solid #eee; }
            .right { width: 68%; padding-left: 24px; }
            h2 { color: #1857a4; margin-bottom: 8px; }
            .section { margin-bottom: 24px; }
            ul { margin: 0 0 0 18px; }
            li { margin-bottom: 6px; }
            .job-title { font-weight: bold; }
            .job-dates { font-style: italic; font-size: 0.95em; color: #555; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{{ name }}</h1>
            <div class="contact">{{ contact }}</div>
        </div>
        <div class="container">
            <div class="left">
                <div class="section">
                    <h2>Key skills</h2>
                    <ul>
                    {% for skill in skills %}<li>{{ skill }}</li>{% endfor %}
                    </ul>
                </div>
                <div class="section">
                    <h2>Education</h2>
                    <ul>
                    {% for edu in education %}<li>{{ edu }}</li>{% endfor %}
                    </ul>
                </div>
            </div>
            <div class="right">
                <div class="section">
                    <h2>Summary</h2>
                    <div>{{ summary }}</div>
                </div>
                <div class="section">
                    <h2>Career history</h2>
                    {% for job in career_history %}
                        <div class="job-title">{{ job.title }}</div>
                        <div class="job-dates">{{ job.dates }}</div>
                        <ul>
                        {% for bullet in job.bullets %}<li>{{ bullet }}</li>{% endfor %}
                        </ul>
                    {% endfor %}
                </div>
            </div>
        </div>
    </body>
    </html>
    '''
    template = Template(html_template)
    return template.render(**cv_data)

# Example parser for AI output (very basic, you may want to improve this)
def parse_cv_text_to_data(cv_text):
    # This is a naive parser. For best results, structure your AI output as JSON in the future.
    # For now, split by sections and try to extract lists.
    lines = cv_text.split('\n')
    data = {"name": "Your Name", "contact": "Your Email | Your Phone | Your City", "skills": [], "education": [], "summary": "", "career_history": []}
    section = None
    job = None
    for line in lines:
        l = line.strip()
        if l.lower().startswith("name:"):
            data["name"] = l[5:].strip()
        elif l.lower().startswith("contact:"):
            data["contact"] = l[8:].strip()
        elif l.lower().startswith("professional summary") or l.lower().startswith("summary"):
            section = "summary"
        elif l.lower().startswith("work experience") or l.lower().startswith("career history"):
            section = "career"
        elif l.lower().startswith("education"):
            section = "education"
        elif l.lower().startswith("skills"):
            section = "skills"
        elif section == "summary" and l:
            data["summary"] += l + " "
        elif section == "skills" and l:
            if l.startswith("-"):
                data["skills"].append(l[1:].strip())
            else:
                data["skills"].append(l)
        elif section == "education" and l:
            if l.startswith("-"):
                data["education"].append(l[1:].strip())
            else:
                data["education"].append(l)
        elif section == "career" and l:
            if l.lower().startswith("- ") or l.startswith("•"):
                if job:
                    job["bullets"].append(l[2:].strip())
            elif l:
                if job:
                    data["career_history"].append(job)
                job = {"title": l, "dates": "", "bullets": []}
        elif section == "career" and not l and job:
            data["career_history"].append(job)
            job = None
    if job:
        data["career_history"].append(job)
    return data

# --- Add button to export as PDF with new format ---
st.header("Step 4: Export Beautiful CV as PDF")
if st.button("Export Beautiful CV as PDF"):
    if st.session_state.get('tailored_cv', "").strip():
        cv_data = parse_cv_text_to_data(st.session_state['tailored_cv'])
        html = render_cv_html(cv_data)
        pdfkit.from_string(html, "beautiful_cv.pdf")
        with open("beautiful_cv.pdf", "rb") as f:
            st.download_button("Download Beautiful CV PDF", f, file_name="beautiful_cv.pdf")
    else:
        st.warning("No tailored CV to export.") 