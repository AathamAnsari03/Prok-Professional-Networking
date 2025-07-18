from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models.post import Post
from models.user import User
from extensions import db
import os
import uuid
import json
from datetime import datetime
from sqlalchemy import desc, asc, or_, and_
from functools import wraps
import time

posts_bp = Blueprint('posts', __name__, url_prefix='/api')

ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'webm'}
MAX_MEDIA_SIZE_MB = 10
UPLOAD_FOLDER = 'static/uploads/posts/'

# Simple in-memory cache for categories and tags
_cache = {
    'categories': None,
    'popular_tags': None,
    'last_updated': 0
}

CACHE_DURATION = 300  # 5 minutes

def cache_result(func):
    """Decorator to cache function results"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        current_time = time.time()
        if (current_time - _cache['last_updated']) > CACHE_DURATION:
            _cache['categories'] = None
            _cache['popular_tags'] = None
            _cache['last_updated'] = current_time
        return func(*args, **kwargs)
    return wrapper

# Helper: allowed file
def allowed_file(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return ext in ALLOWED_IMAGE_EXTENSIONS or ext in ALLOWED_VIDEO_EXTENSIONS

def get_media_type(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return 'image'
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return 'video'
    return None

@posts_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        # Handle multipart form data (file upload)
        content = request.form.get('content', '').strip()
        if not content:
            return jsonify({'success': False, 'message': 'Post content is required.'}), 400
        tags = request.form.get('tags')
        tags = json.loads(tags) if tags else []
        visibility = request.form.get('visibility', 'public')
        category = request.form.get('category')
        media_files = request.files.getlist('media') or []
        media_url = None
        media_type = None
        if media_files:
            file = media_files[0]
            if file and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                unique_id = str(uuid.uuid4())
                filename = f'post_{get_jwt_identity()}_{unique_id}.{ext}'
                upload_dir = os.path.join(current_app.root_path, 'static', 'uploads', 'posts')
                os.makedirs(upload_dir, exist_ok=True)
                filepath = os.path.join(upload_dir, filename)
                file.save(filepath)
                media_url = f'/static/uploads/posts/{filename}'
                media_type = get_media_type(filename)
            else:
                return jsonify({'success': False, 'message': 'Invalid file type.'}), 400
        user_id = get_jwt_identity()
        new_post = Post(
            user_id=user_id,
            content=content,
            media_url=media_url,
            media_type=media_type,
            visibility=visibility,
            category=category
        )
        new_post.set_tags(tags)
        db.session.add(new_post)
        db.session.commit()
        return jsonify({'success': True, 'post': new_post.to_dict()}), 201
    else:
        # Handle JSON
        data = request.get_json() or {}
        content = data.get('content', '').strip()
        if not content:
            return jsonify({'success': False, 'message': 'Post content is required.'}), 400
        tags = data.get('tags', [])
        visibility = data.get('visibility', 'public')
        category = data.get('category')
        media_url = data.get('media_url')
        media_type = data.get('media_type')
        user_id = get_jwt_identity()
        new_post = Post(
            user_id=user_id,
            content=content,
            media_url=media_url,
            media_type=media_type,
            visibility=visibility,
            category=category
        )
        new_post.set_tags(tags)
        db.session.add(new_post)
        db.session.commit()
        return jsonify({'success': True, 'post': new_post.to_dict()}), 201

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)  # Max 50 per page
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        visibility = request.args.get('visibility', '').strip()
        tags = request.args.get('tags', '').strip()
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')

        # Build query
        query = Post.query

        # Apply filters
        if search:
            search_filter = or_(
                Post.content.ilike(f'%{search}%'),
                Post.category.ilike(f'%{search}%')
            )
            query = query.filter(search_filter)

        if category:
            query = query.filter(Post.category == category)

        if visibility:
            query = query.filter(Post.visibility == visibility)

        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            for tag in tag_list:
                query = query.filter(Post.tags.contains(f'"{tag}"'))

        # Apply sorting
        sort_column = getattr(Post, sort_by, Post.created_at)
        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Apply pagination
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        posts_data = [post.to_dict() for post in pagination.items]

        return jsonify({
            'success': True,
            'posts': posts_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200

    except Exception as e:
        print(f'[GET /api/posts] Error: {e}')
        return jsonify(success=False, message='Failed to fetch posts.'), 500

@posts_bp.route('/posts/categories', methods=['GET'])
@cache_result
def get_categories():
    """Get all available categories"""
    try:
        if _cache['categories'] is not None:
            return jsonify(success=True, categories=_cache['categories'])

        categories = db.session.query(Post.category).filter(
            Post.category.isnot(None),
            Post.category != ''
        ).distinct().all()
        
        category_list = [cat[0] for cat in categories if cat[0]]
        _cache['categories'] = category_list
        
        return jsonify(success=True, categories=category_list), 200
    except Exception as e:
        print(f'[GET /api/posts/categories] Error: {e}')
        return jsonify(success=False, message='Failed to fetch categories.'), 500

@posts_bp.route('/posts/popular-tags', methods=['GET'])
@cache_result
def get_popular_tags():
    """Get most popular tags"""
    try:
        if _cache['popular_tags'] is not None:
            return jsonify(success=True, tags=_cache['popular_tags'])

        # Get all posts with tags
        posts_with_tags = Post.query.filter(
            Post.tags.isnot(None),
            Post.tags != ''
        ).all()

        tag_count = {}
        for post in posts_with_tags:
            tags = post.get_tags()
            for tag in tags:
                tag_count[tag] = tag_count.get(tag, 0) + 1

        # Sort by count and get top 20
        popular_tags = sorted(tag_count.items(), key=lambda x: x[1], reverse=True)[:20]
        tag_list = [tag for tag, count in popular_tags]
        
        _cache['popular_tags'] = tag_list
        
        return jsonify(success=True, tags=tag_list), 200
    except Exception as e:
        print(f'[GET /api/posts/popular-tags] Error: {e}')
        return jsonify(success=False, message='Failed to fetch popular tags.'), 500

@posts_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    try:
        user_id = get_jwt_identity()
        post = Post.query.get(post_id)
        
        if not post:
            return jsonify(success=False, message='Post not found.'), 404

        # For now, just increment likes count
        # In a real app, you'd want a separate likes table
        post.likes_count += 1
        db.session.commit()

        return jsonify(success=True, likes_count=post.likes_count), 200
    except Exception as e:
        print(f'[POST /api/posts/{post_id}/like] Error: {e}')
        return jsonify(success=False, message='Failed to like post.'), 500 

@posts_bp.route('/posts', methods=['OPTIONS'])
def posts_options():
    from flask import make_response
    response = make_response()
    response.headers['Access-Control-Allow-Methods'] = 'POST,GET,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response, 200 