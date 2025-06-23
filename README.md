# AI-Powered CV and Cover Letter Tailoring System

This web application helps users tailor their CVs and cover letters to specific job descriptions using AI technology (OpenAI and Google AI).

## Features

- User authentication and profile management
- Upload and manage CVs and cover letters
- Add job descriptions
- AI-powered document tailoring
- Download tailored documents as PDFs
- Multi-user support with secure data isolation

## Tech Stack

- Backend: Flask (Python)
- Database: PostgreSQL (hosted on Supabase)
- AI Services: OpenAI API, Google AI Studio API
- Deployment: Render.com

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd job-bot-
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with the following variables:
```
SECRET_KEY=your-secret-key
DATABASE_URL=your-supabase-postgres-url
OPENAI_API_KEY=your-openai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

5. Initialize the database:
```bash
flask db upgrade
```

6. Run the development server:
```bash
flask run
```

## Deployment

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Get your PostgreSQL connection string from the project settings
3. Update your `.env` file with the connection string

### Render.com Deployment

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app`
4. Add the environment variables from your `.env` file
5. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 