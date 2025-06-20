from datetime import datetime
from sqlalchemy.dialects.mysql import JSON
from . import db

class PostMedia(db.Model):
    """Model for storing post media files"""
    __tablename__ = 'post_media'
    
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)  # 'image' or 'video'
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    mime_type = db.Column(db.String(100), nullable=False)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    post = db.relationship('Post', back_populates='media')
    
    def to_dict(self):
        """Convert media to dictionary"""
        return {
            'id': self.id,
            'post_id': self.post_id,
            'file_url': self.file_url,
            'file_type': self.file_type,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'thumbnail_url': self.thumbnail_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Post(db.Model):
    """Model for storing user posts"""
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    content_type = db.Column(db.String(20), default='text')  # 'text', 'rich_text', 'html'
    
    # Post metadata
    title = db.Column(db.String(255), nullable=True)
    summary = db.Column(db.Text, nullable=True)
    tags = db.Column(JSON, nullable=True)  # Store as JSON array
    category = db.Column(db.String(50), nullable=True)
    visibility = db.Column(db.String(20), default='public')  # 'public', 'private', 'connections'
    
    # Engagement metrics
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    shares_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)
    
    # Search and indexing
    search_vector = db.Column(db.Text, nullable=True)  # For full-text search
    is_indexed = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime, nullable=True)
    
    # Soft delete
    is_deleted = db.Column(db.Boolean, default=False)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='posts')
    media = db.relationship('PostMedia', back_populates='post', cascade='all, delete-orphan')
    
    def __init__(self, **kwargs):
        super(Post, self).__init__(**kwargs)
        if not self.published_at:
            self.published_at = datetime.utcnow()
    
    def to_dict(self, include_media=True, include_user=True):
        """Convert post to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'content_type': self.content_type,
            'title': self.title,
            'summary': self.summary,
            'tags': self.tags or [],
            'category': self.category,
            'visibility': self.visibility,
            'likes_count': self.likes_count,
            'comments_count': self.comments_count,
            'shares_count': self.shares_count,
            'views_count': self.views_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
        }
        
        if include_media:
            data['media'] = [media.to_dict() for media in self.media]
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'profile': self.user.profile.to_dict() if self.user.profile else None
            }
        
        return data
    
    def update_search_vector(self):
        """Update search vector for full-text search"""
        search_text = []
        if self.content:
            search_text.append(self.content)
        if self.title:
            search_text.append(self.title)
        if self.summary:
            search_text.append(self.summary)
        if self.tags:
            search_text.extend(self.tags)
        
        self.search_vector = ' '.join(search_text)
        self.is_indexed = True
    
    def soft_delete(self):
        """Soft delete the post"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
    
    def restore(self):
        """Restore a soft-deleted post"""
        self.is_deleted = False
        self.deleted_at = None
    
    @classmethod
    def get_public_posts(cls, page=1, per_page=20, user_id=None):
        """Get public posts with pagination"""
        query = cls.query.filter_by(is_deleted=False, visibility='public')
        
        if user_id:
            # Also include posts from the specific user
            query = query.filter(
                db.or_(
                    cls.visibility == 'public',
                    db.and_(cls.user_id == user_id, cls.visibility.in_(['public', 'private', 'connections']))
                )
            )
        
        return query.order_by(cls.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @classmethod
    def get_public_posts_advanced(cls, page=1, per_page=20, user_id=None, 
                                 category=None, visibility=None, search=None, 
                                 tags=None, sort_by='created_at', sort_order='desc'):
        """Get public posts with advanced filtering and sorting"""
        # Build base query
        query = cls.query.filter_by(is_deleted=False)
        
        # Apply visibility filter
        if visibility:
            if visibility == 'public':
                query = query.filter(cls.visibility == 'public')
            elif visibility == 'private' and user_id:
                query = query.filter(
                    db.and_(cls.user_id == user_id, cls.visibility == 'private')
                )
            elif visibility == 'connections' and user_id:
                query = query.filter(
                    db.and_(cls.user_id == user_id, cls.visibility == 'connections')
                )
        else:
            # Default: show public posts and user's own posts
            if user_id:
                query = query.filter(
                    db.or_(
                        cls.visibility == 'public',
                        db.and_(cls.user_id == user_id, cls.visibility.in_(['public', 'private', 'connections']))
                    )
                )
            else:
                query = query.filter(cls.visibility == 'public')
        
        # Apply category filter
        if category:
            query = query.filter(cls.category == category)
        
        # Apply search filter
        if search:
            search_lower = f"%{search.lower()}%"
            query = query.filter(
                db.or_(
                    cls.content.ilike(search_lower),
                    cls.title.ilike(search_lower),
                    cls.summary.ilike(search_lower)
                )
            )
        
        # Apply tags filter
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            for tag in tag_list:
                query = query.filter(cls.tags.contains([tag]))
        
        # Apply sorting
        sort_column = getattr(cls, sort_by, cls.created_at)
        if sort_order == 'asc':
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
        
        return query.paginate(page=page, per_page=per_page, error_out=False)
    
    @classmethod
    def get_user_posts(cls, user_id, page=1, per_page=20, sort_by='created_at', sort_order='desc'):
        """Get posts for a specific user with sorting"""
        query = cls.query.filter_by(user_id=user_id, is_deleted=False)
        
        # Apply sorting
        sort_column = getattr(cls, sort_by, cls.created_at)
        if sort_order == 'asc':
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
        
        return query.paginate(page=page, per_page=per_page, error_out=False)
    
    @classmethod
    def get_categories(cls):
        """Get all unique categories"""
        return db.session.query(cls.category).filter(
            cls.category.isnot(None),
            cls.category != '',
            cls.is_deleted == False
        ).distinct().all()
    
    @classmethod
    def get_popular_tags(cls, limit=10):
        """Get most popular tags"""
        # This is a simplified implementation
        # In production, you might want to use a more sophisticated approach
        all_tags = []
        posts = cls.query.filter_by(is_deleted=False).all()
        for post in posts:
            if post.tags:
                all_tags.extend(post.tags)
        
        # Count tag frequency
        tag_counts = {}
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort by frequency and return top tags
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
        return [tag for tag, count in sorted_tags[:limit]]
