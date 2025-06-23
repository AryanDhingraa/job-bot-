from datetime import datetime
from app import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)  # New admin flag
    
    # Relationships
    resumes = db.relationship('Resume', backref='owner', lazy='dynamic')
    applications = db.relationship('JobApplication', backref='applicant', lazy='dynamic')
    cover_letters = db.relationship('CoverLetter', backref='owner', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_administrator(self):
        return self.is_admin

class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    content = db.Column(db.Text, nullable=False)
    parsed_content = db.Column(db.JSON)  # Structured data extracted from resume
    file_path = db.Column(db.String(256))  # Path to stored PDF
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_default = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    applications = db.relationship('JobApplication', backref='resume', lazy='dynamic')

class JobApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(128), nullable=False)
    job_title = db.Column(db.String(128), nullable=False)
    job_description = db.Column(db.Text, nullable=False)
    job_url = db.Column(db.String(512))
    status = db.Column(db.String(32), default='draft')  # draft, applied, interview, rejected, accepted
    application_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'))
    cover_letter_id = db.Column(db.Integer, db.ForeignKey('cover_letter.id'))
    
    # Additional metadata
    skills_matched = db.Column(db.JSON)  # Store matched skills
    application_notes = db.Column(db.Text)
    interview_date = db.Column(db.DateTime)
    follow_up_date = db.Column(db.DateTime)

class CoverLetter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    content = db.Column(db.Text, nullable=False)
    original_content = db.Column(db.Text)  # Store original version
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_template = db.Column(db.Boolean, default=False)
    template_variables = db.Column(db.JSON)  # Store template variables
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    applications = db.relationship('JobApplication', backref='cover_letter', lazy='dynamic')

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256), nullable=False)
    doc_type = db.Column(db.String(20), nullable=False)  # 'cv' or 'cover_letter'
    original_text = db.Column(db.Text)
    tailored_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class JobDescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    company = db.Column(db.String(256))
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    documents = db.relationship('Document', secondary='job_documents', backref='job_descriptions')

# Association table for many-to-many relationship between JobDescription and Document
job_documents = db.Table('job_documents',
    db.Column('job_id', db.Integer, db.ForeignKey('job_description.id'), primary_key=True),
    db.Column('document_id', db.Integer, db.ForeignKey('document.id'), primary_key=True)
)

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id)) 