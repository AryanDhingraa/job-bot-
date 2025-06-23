from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, TextAreaField, SelectField, FileField, DateField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length, URL, Optional, ValidationError
from app.models import User

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[
        DataRequired(),
        Length(min=8, message='Password must be at least 8 characters long')
    ])
    password2 = PasswordField('Confirm Password', validators=[
        DataRequired(),
        EqualTo('password', message='Passwords must match')
    ])

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data.lower()).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')

class ResumeForm(FlaskForm):
    title = StringField('Resume Title', validators=[DataRequired(), Length(max=128)])
    resume_file = FileField('Resume File')
    resume_text = TextAreaField('Resume Text')
    is_default = BooleanField('Set as Default Resume')

    def validate(self, extra_validators=None):
        if not super().validate(extra_validators=extra_validators):
            return False
        if not self.resume_file.data and not self.resume_text.data:
            self.resume_text.errors.append('Please either upload a file or enter resume text')
            return False
        return True

class JobApplicationForm(FlaskForm):
    company_name = StringField('Company Name', validators=[DataRequired(), Length(max=128)])
    job_title = StringField('Job Title', validators=[DataRequired(), Length(max=128)])
    job_description = TextAreaField('Job Description', validators=[DataRequired()])
    job_url = StringField('Job URL', validators=[Optional(), URL()])
    resume_id = SelectField('Resume', coerce=int, validators=[DataRequired()])
    cover_letter = TextAreaField('Cover Letter')
    status = SelectField('Status', choices=[
        ('draft', 'Draft'),
        ('applied', 'Applied'),
        ('interview', 'Interview Scheduled'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted')
    ], default='draft')
    application_date = DateField('Application Date', validators=[Optional()])
    notes = TextAreaField('Notes')

class CoverLetterForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(max=128)])
    content = TextAreaField('Content', validators=[DataRequired()])
    is_template = BooleanField('Save as Template')
    template_variables = TextAreaField('Template Variables (one per line)')

class ProfileForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    current_password = PasswordField('Current Password')
    new_password = PasswordField('New Password', validators=[Optional(), Length(min=8)])
    confirm_password = PasswordField('Confirm New Password', validators=[
        Optional(),
        EqualTo('new_password', message='Passwords must match')
    ])

class ResetPasswordRequestForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Request Password Reset')

class ResetPasswordForm(FlaskForm):
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField('Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Reset Password') 