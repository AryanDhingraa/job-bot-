from flask import Blueprint, render_template, request, jsonify, current_app, flash, redirect, url_for, abort
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.utils import secure_filename
from app import db
from app.models import User, Document, JobDescription, Resume, JobApplication, CoverLetter
import os
import openai
import google.generativeai as palm
from datetime import datetime
import json
from werkzeug.urls import url_parse

from app.forms import (
    LoginForm, RegistrationForm, ResumeForm, JobApplicationForm,
    CoverLetterForm, ProfileForm, ResetPasswordRequestForm, ResetPasswordForm
)
from app.ai_utils import analyze_job_description, generate_cover_letter, extract_resume_text

main = Blueprint('main', __name__)
auth = Blueprint('auth', __name__)

@main.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return render_template('index.html')

@main.route('/dashboard')
@login_required
def dashboard():
    # Get statistics
    stats = {
        'total_applications': JobApplication.query.filter_by(user_id=current_user.id).count(),
        'interviews': JobApplication.query.filter_by(user_id=current_user.id, status='interview').count(),
        'pending': JobApplication.query.filter_by(user_id=current_user.id, status='applied').count(),
        'success_rate': 0  # Calculate based on accepted vs total applications
    }
    
    total = stats['total_applications']
    accepted = JobApplication.query.filter_by(user_id=current_user.id, status='accepted').count()
    stats['success_rate'] = round((accepted / total * 100) if total > 0 else 0)
    
    # Get recent applications
    recent_applications = JobApplication.query.filter_by(user_id=current_user.id)\
        .order_by(JobApplication.created_at.desc())\
        .limit(5).all()
    
    # Get upcoming interviews
    upcoming_interviews = JobApplication.query.filter_by(
        user_id=current_user.id,
        status='interview'
    ).order_by(JobApplication.interview_date.asc()).limit(5).all()
    
    return render_template('dashboard.html',
                         stats=stats,
                         recent_applications=recent_applications,
                         upcoming_interviews=upcoming_interviews)

@main.route('/resumes')
@login_required
def resumes():
    resumes = Resume.query.filter_by(user_id=current_user.id)\
        .order_by(Resume.is_default.desc(), Resume.created_at.desc()).all()
    return render_template('resume/list.html', resumes=resumes)

@main.route('/resume/upload', methods=['GET', 'POST'])
@login_required
def upload_resume():
    form = ResumeForm()
    if form.validate_on_submit():
        resume = Resume(
            title=form.title.data,
            user_id=current_user.id,
            is_default=form.is_default.data
        )
        
        if form.resume_file.data:
            file = form.resume_file.data
            filename = secure_filename(file.filename)
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            resume.file_path = file_path
            resume.content = extract_resume_text(file_path)
        else:
            resume.content = form.resume_text.data
        
        if form.is_default.data:
            # Set all other resumes as non-default
            Resume.query.filter_by(user_id=current_user.id).update({'is_default': False})
        
        db.session.add(resume)
        db.session.commit()
        
        flash('Resume uploaded successfully!', 'success')
        return redirect(url_for('main.resumes'))
    
    return render_template('resume/upload.html', form=form)

@main.route('/applications')
@login_required
def applications():
    applications = JobApplication.query.filter_by(user_id=current_user.id)\
        .order_by(JobApplication.created_at.desc()).all()
    return render_template('application/list.html', applications=applications)

@main.route('/application/new', methods=['GET', 'POST'])
@login_required
def new_application():
    form = JobApplicationForm()
    form.resume_id.choices = [(r.id, r.title) for r in Resume.query.filter_by(user_id=current_user.id).all()]
    
    if form.validate_on_submit():
        application = JobApplication(
            company_name=form.company_name.data,
            job_title=form.job_title.data,
            job_description=form.job_description.data,
            job_url=form.job_url.data,
            resume_id=form.resume_id.data,
            cover_letter=form.cover_letter.data,
            status=form.status.data,
            application_date=form.application_date.data or datetime.utcnow(),
            notes=form.notes.data,
            user_id=current_user.id
        )
        
        db.session.add(application)
        db.session.commit()
        
        if 'save_draft' in request.form:
            flash('Application saved as draft.', 'info')
        else:
            flash('Application submitted successfully!', 'success')
        
        return redirect(url_for('main.applications'))
    
    return render_template('application/new.html', form=form)

@main.route('/application/<int:id>')
@login_required
def view_application(id):
    application = JobApplication.query.get_or_404(id)
    if application.user_id != current_user.id:
        abort(403)
    return render_template('application/view.html', application=application)

@main.route('/application/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_application(id):
    application = JobApplication.query.get_or_404(id)
    if application.user_id != current_user.id:
        abort(403)
    
    form = JobApplicationForm(obj=application)
    form.resume_id.choices = [(r.id, r.title) for r in Resume.query.filter_by(user_id=current_user.id).all()]
    
    if form.validate_on_submit():
        application.company_name = form.company_name.data
        application.job_title = form.job_title.data
        application.job_description = form.job_description.data
        application.job_url = form.job_url.data
        application.resume_id = form.resume_id.data
        application.cover_letter = form.cover_letter.data
        application.status = form.status.data
        application.application_date = form.application_date.data
        application.notes = form.notes.data
        
        db.session.commit()
        flash('Application updated successfully!', 'success')
        return redirect(url_for('main.view_application', id=application.id))
    
    return render_template('application/edit.html', form=form, application=application)

# API routes for AI features
@main.route('/api/analyze', methods=['POST'])
@login_required
def analyze():
    data = request.get_json()
    
    if not data or 'job_description' not in data or 'resume_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    resume = Resume.query.get_or_404(data['resume_id'])
    if resume.user_id != current_user.id:
        abort(403)
    
    analysis = analyze_job_description(data['job_description'], resume.content)
    return jsonify(analysis)

@main.route('/api/generate-cover-letter', methods=['POST'])
@login_required
def generate_cover_letter_api():
    data = request.get_json()
    
    if not data or 'job_description' not in data or 'resume_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    resume = Resume.query.get_or_404(data['resume_id'])
    if resume.user_id != current_user.id:
        abort(403)
    
    cover_letter = generate_cover_letter(data['job_description'], resume.content)
    return jsonify({'cover_letter': cover_letter})

# Auth routes
@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data.lower()).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid email or password', 'danger')
            return redirect(url_for('auth.login'))
        
        login_user(user, remember=form.remember_me.data)
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('main.dashboard')
        return redirect(next_page)
    
    return render_template('auth/login.html', title='Sign In', form=form)

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data.lower())
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now registered!', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/register.html', title='Register', form=form)

@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index')) 