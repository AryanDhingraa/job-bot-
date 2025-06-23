from flask import Blueprint, render_template, request, jsonify, current_app, flash, redirect, url_for
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.utils import secure_filename
from app import db
from app.models import User, Document, JobDescription
import os
import openai
import google.generativeai as palm

main = Blueprint('main', __name__)

@main.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return render_template('index.html')

@main.route('/dashboard')
@login_required
def dashboard():
    documents = Document.query.filter_by(user_id=current_user.id).all()
    job_descriptions = JobDescription.query.filter_by(user_id=current_user.id).all()
    return render_template('dashboard.html', documents=documents, job_descriptions=job_descriptions)

@main.route('/upload', methods=['POST'])
@login_required
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    doc_type = request.form.get('type')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Create new document in database
        doc = Document(
            filename=filename,
            doc_type=doc_type,
            user_id=current_user.id
        )
        db.session.add(doc)
        db.session.commit()
        
        return jsonify({'message': 'File uploaded successfully', 'id': doc.id})

@main.route('/job-description', methods=['POST'])
@login_required
def add_job_description():
    data = request.json
    job = JobDescription(
        title=data['title'],
        company=data.get('company', ''),
        description=data['description'],
        user_id=current_user.id
    )
    db.session.add(job)
    db.session.commit()
    return jsonify({'message': 'Job description added successfully', 'id': job.id})

@main.route('/tailor', methods=['POST'])
@login_required
def tailor_document():
    data = request.json
    doc_id = data['document_id']
    job_id = data['job_id']
    
    document = Document.query.get_or_404(doc_id)
    job = JobDescription.query.get_or_404(job_id)
    
    # Set up AI clients
    openai.api_key = current_app.config['OPENAI_API_KEY']
    palm.configure(api_key=current_app.config['GOOGLE_AI_API_KEY'])
    
    # TODO: Implement the AI processing logic here
    # This will use both OpenAI and Google AI to generate tailored content
    
    return jsonify({'message': 'Document tailored successfully'})

# Auth routes
@main.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        user = User(
            username=request.form['username'],
            email=request.form['email']
        )
        user.set_password(request.form['password'])
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('main.login'))
    return render_template('register.html')

@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user and user.check_password(request.form['password']):
            login_user(user)
            return redirect(url_for('main.dashboard'))
        flash('Invalid username or password')
    return render_template('login.html')

@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index')) 