import os
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change'
    
    # Database configuration
    DB_USER = os.environ.get('PGUSER')
    DB_PASSWORD = urllib.parse.quote_plus(os.environ.get('PGPASSWORD', ''))  # URL encode the password
    DB_HOST = os.environ.get('PGHOST')
    DB_PORT = os.environ.get('PGPORT')
    DB_NAME = os.environ.get('PGDATABASE')
    
    # Construct database URL
    SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # OpenAI configuration
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # Google AI configuration
    GOOGLE_AI_API_KEY = os.environ.get('GOOGLE_AI_API_KEY')
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Ensure upload folder exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER) 