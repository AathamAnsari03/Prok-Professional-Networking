from datetime import datetime
from extensions import db

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(255), nullable=True)
    media_type = db.Column(db.String(50), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    tags = db.Column(db.Text, nullable=True)  # JSON string of tags
    visibility = db.Column(db.String(20), default='public')  # public, private, friends
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Post {self.id} by User {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'media_url': self.media_url,
            'media_type': self.media_type,
            'category': self.category,
            'tags': self.get_tags(),
            'visibility': self.visibility,
            'likes_count': self.likes_count,
            'views_count': self.views_count,
            'comments_count': self.comments_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def get_tags(self):
        """Parse tags from JSON string to list"""
        if not self.tags:
            return []
        try:
            import json
            return json.loads(self.tags)
        except:
            return []

    def set_tags(self, tags_list):
        """Convert tags list to JSON string"""
        if not tags_list:
            self.tags = None
        else:
            import json
            self.tags = json.dumps(tags_list)
