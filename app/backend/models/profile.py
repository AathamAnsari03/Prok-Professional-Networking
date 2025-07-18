from extensions import db

class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    avatar = db.Column(db.String(256), default=None)
    banner = db.Column(db.String(256), default=None)
    title = db.Column(db.String(120), default='')
    bio = db.Column(db.Text, default='')
    location = db.Column(db.String(120), default='')
    address = db.Column(db.String(200), default='')  # New address field
    skills = db.Column(db.JSON, default=list)  # List of skill names or dicts
    socials = db.Column(db.JSON, default=dict) # Dict of social links
    name = db.Column(db.String(100), default='')
    # Relationships
    experiences = db.relationship('Experience', backref='profile', cascade='all, delete-orphan')
    education = db.relationship('Education', backref='profile', cascade='all, delete-orphan')

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'avatar': self.avatar,
            'banner': self.banner,
            'title': self.title,
            'bio': self.bio,
            'location': self.location,
            'address': self.address,
            'skills': self.skills,
            'socials': self.socials,
            'name': self.name,
            'experiences': [
                {
                    'id': exp.id,
                    'title': exp.title,
                    'company': exp.company,
                    'start_date': exp.start_date.isoformat() if exp.start_date else None,
                    'end_date': exp.end_date.isoformat() if exp.end_date else None,
                    'description': exp.description
                } for exp in self.experiences
            ],
            'education': [
                {
                    'id': edu.id,
                    'school': edu.school,
                    'degree': edu.degree,
                    'field': edu.field,
                    'start_date': edu.start_date.isoformat() if edu.start_date else None,
                    'end_date': edu.end_date.isoformat() if edu.end_date else None
                } for edu in self.education
            ]
        }

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)

class Experience(db.Model):
    __tablename__ = 'experiences'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    description = db.Column(db.Text)

class Education(db.Model):
    __tablename__ = 'education'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    school = db.Column(db.String(120))
    degree = db.Column(db.String(120))
    field = db.Column(db.String(120))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
