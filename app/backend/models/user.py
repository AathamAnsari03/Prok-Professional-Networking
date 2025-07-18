from extensions import db
from .profile import Profile
from werkzeug.security import check_password_hash, generate_password_hash
import re

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    profile = db.relationship('Profile', uselist=False, backref='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    @staticmethod
    def is_password_complex(password):
        # At least 8 characters, one uppercase, one lowercase, one digit
        if len(password) < 8:
            return False
        if not re.search(r'[A-Z]', password):
            return False
        if not re.search(r'[a-z]', password):
            return False
        if not re.search(r'\d', password):
            return False
        return True

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'profile': self.profile.serialize() if self.profile else None
        }

    def __repr__(self):
        return f'<User {self.email}>'
