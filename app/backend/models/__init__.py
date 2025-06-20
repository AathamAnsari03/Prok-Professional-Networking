from flask_sqlalchemy import SQLAlchemy

# Create a single database instance
db = SQLAlchemy()

# Import all models to ensure they are registered
from .user import User
from .profile import Profile, Skill, Experience, Education, profile_skills
from .post import Post, PostMedia

__all__ = ['db', 'User', 'Profile', 'Skill', 'Experience', 'Education', 'profile_skills', 'Post', 'PostMedia'] 