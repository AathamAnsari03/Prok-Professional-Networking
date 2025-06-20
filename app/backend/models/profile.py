from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy import event
from . import db
import re

class Profile(db.Model):
    __tablename__ = 'profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    
    # Personal Information
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    headline = db.Column(db.String(100))
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    
    # Professional Information
    current_position = db.Column(db.String(100))
    company = db.Column(db.String(100))
    industry = db.Column(db.String(50))
    
    # Contact Information
    phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    linkedin_url = db.Column(db.String(200))
    github_url = db.Column(db.String(200))
    
    # Profile Settings
    profile_visibility = db.Column(db.String(20), default='public')  # public, private, connections
    profile_picture = db.Column(db.String(200))
    cover_photo = db.Column(db.String(200))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    skills = relationship('Skill', secondary='profile_skills', backref='profiles')
    experiences = relationship('Experience', backref='profile', cascade='all, delete-orphan')
    education = relationship('Education', backref='profile', cascade='all, delete-orphan')

    def __init__(self, user_id, **kwargs):
        super(Profile, self).__init__(**kwargs)
        self.user_id = user_id

    def validate_phone(self, phone):
        """Validate phone number format"""
        if phone and not re.match(r'^\+?1?\d{9,15}$', phone):
            raise ValueError('Invalid phone number format')
        return phone

    def validate_website(self, website):
        """Validate website URL format"""
        if website and not re.match(r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$', website):
            raise ValueError('Invalid website URL')
        return website

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'headline': self.headline,
            'bio': self.bio,
            'location': self.location,
            'current_position': self.current_position,
            'company': self.company,
            'industry': self.industry,
            'phone': self.phone,
            'website': self.website,
            'linkedin_url': self.linkedin_url,
            'github_url': self.github_url,
            'profile_visibility': self.profile_visibility,
            'profile_picture': self.profile_picture,
            'cover_photo': self.cover_photo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Association table for profile skills
profile_skills = db.Table('profile_skills',
    db.Column('profile_id', db.Integer, db.ForeignKey('profiles.id'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skills.id'), primary_key=True)
)

class Skill(db.Model):
    __tablename__ = 'skills'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(50))

class Experience(db.Model):
    __tablename__ = 'experiences'
    
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    current = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text)

class Education(db.Model):
    __tablename__ = 'education'
    
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    institution = db.Column(db.String(100), nullable=False)
    degree = db.Column(db.String(100), nullable=False)
    field_of_study = db.Column(db.String(100))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    current = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text)

# Event listeners for validation
@event.listens_for(Profile, 'before_insert')
@event.listens_for(Profile, 'before_update')
def validate_profile(mapper, connection, target):
    if target.phone:
        target.phone = target.validate_phone(target.phone)
    if target.website:
        target.website = target.validate_website(target.website)
