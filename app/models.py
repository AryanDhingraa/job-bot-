from datetime import datetime
from app import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    documents = db.relationship('Document', backref='owner', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

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