import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change'
    # MySQL configuration for PythonAnywhere
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://username:password@username.mysql.pythonanywhere-services.com/username$dbname'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # OpenAI configuration
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
    # Google AI configuration
    GOOGLE_AI_API_KEY = os.environ.get('GOOGLE_AI_API_KEY')
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size 