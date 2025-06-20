from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound
from sqlalchemy.exc import IntegrityError
import logging
from datetime import datetime
import re
import os
from werkzeug.utils import secure_filename

from models import db, Post, PostMedia, User
from utils.media_processor import media_processor
from utils.cache import cache

posts_bp = Blueprint('posts', __name__, url_prefix='/api/posts')
logger = logging.getLogger(__name__)

def validate_post_content(content: str) -> tuple[bool, str]:
    """Validate post content"""
    if not content or not content.strip():
        return False, "Post content cannot be empty"
    
    # Strip HTML tags for length validation
    text_content = re.sub(r'<[^>]+>', '', content).strip()
    if len(text_content) < 1:
        return False, "Post content cannot be empty"
    
    if len(text_content) > 10000:  # 10KB limit
        return False, "Post content too long. Maximum 10,000 characters allowed."
    
    return True, "Content is valid"

def extract_metadata_from_content(content: str) -> dict:
    """Extract metadata from post content"""
    metadata = {
        'title': None,
        'summary': None,
        'tags': [],
        'category': None
    }
    
    # Extract title from first line if it's short
    lines = content.split('\n')
    if lines and len(lines[0].strip()) <= 100:
        metadata['title'] = lines[0].strip()
    
    # Extract summary (first 200 characters)
    text_content = re.sub(r'<[^>]+>', '', content).strip()
    if text_content:
        metadata['summary'] = text_content[:200] + '...' if len(text_content) > 200 else text_content
    
    # Extract hashtags
    hashtags = re.findall(r'#(\w+)', content)
    metadata['tags'] = list(set(hashtags))  # Remove duplicates
    
    # Determine category based on content
    content_lower = content.lower()
    if any(word in content_lower for word in ['job', 'career', 'work', 'employment']):
        metadata['category'] = 'career'
    elif any(word in content_lower for word in ['tech', 'technology', 'programming', 'coding']):
        metadata['category'] = 'technology'
    elif any(word in content_lower for word in ['business', 'startup', 'entrepreneur']):
        metadata['category'] = 'business'
    elif any(word in content_lower for word in ['education', 'learning', 'course']):
        metadata['category'] = 'education'
    else:
        metadata['category'] = 'general'
    
    return metadata

def invalidate_post_cache():
    """Invalidate post-related cache entries"""
    cache.delete('post_categories')
    # Delete popular tags cache entries (we don't know the exact keys, so we'll let them expire)
    # In a production system, you might want to use a more sophisticated cache invalidation strategy

@posts_bp.route('/', methods=['POST'])
@jwt_required()
def create_post():
    """Create a new post with optional media"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get form data
        content = request.form.get('content', '').strip()
        visibility = request.form.get('visibility', 'public')
        content_type = request.form.get('content_type', 'text')
        
        # Validate content
        is_valid, error_message = validate_post_content(content)
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Validate visibility
        if visibility not in ['public', 'private', 'connections']:
            return jsonify({'error': 'Invalid visibility setting'}), 400
        
        # Extract metadata from content
        metadata = extract_metadata_from_content(content)
        
        # Create post
        post = Post(
            user_id=current_user_id,
            content=content,
            content_type=content_type,
            title=metadata['title'],
            summary=metadata['summary'],
            tags=metadata['tags'],
            category=metadata['category'],
            visibility=visibility
        )
        
        # Process media files if any
        media_files = request.files.getlist('media')
        if media_files and any(f.filename for f in media_files):
            for file in media_files:
                if file.filename:  # Skip empty files
                    success, message, file_info = media_processor.save_file(file, 'posts')
                    
                    if success:
                        # Create PostMedia record
                        post_media = PostMedia(
                            post_id=post.id,  # Will be set after post is saved
                            file_url=file_info['file_url'],
                            file_type=file_info['file_type'],
                            file_name=file_info['original_filename'],
                            file_size=file_info['file_size'],
                            mime_type=file_info['mime_type'],
                            thumbnail_url=file_info['thumbnail_url']
                        )
                        post.media.append(post_media)
                    else:
                        logger.warning(f"Failed to save media file: {message}")
        
        # Save post to database
        db.session.add(post)
        db.session.commit()
        
        # Update search vector
        post.update_search_vector()
        db.session.commit()
        
        # Invalidate cache
        invalidate_post_cache()
        
        # Return created post
        return jsonify({
            'message': 'Post created successfully',
            'post': post.to_dict(include_media=True, include_user=True)
        }), 201
        
    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Database integrity error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating post: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/', methods=['GET'])
@jwt_required()
def get_posts():
    """Get posts with pagination, filtering, and sorting"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
        user_id = request.args.get('user_id', type=int)
        category = request.args.get('category')
        search = request.args.get('search')
        visibility = request.args.get('visibility')  # public, private, connections
        sort_by = request.args.get('sort_by', 'created_at')  # created_at, likes_count, views_count, comments_count
        sort_order = request.args.get('sort_order', 'desc')  # asc, desc
        tags = request.args.get('tags')  # comma-separated tags
        
        # Validate sort parameters
        valid_sort_fields = ['created_at', 'likes_count', 'views_count', 'comments_count', 'updated_at']
        if sort_by not in valid_sort_fields:
            sort_by = 'created_at'
        
        if sort_order not in ['asc', 'desc']:
            sort_order = 'desc'
        
        # Build base query
        if user_id:
            # Get posts from specific user
            query = Post.get_user_posts(user_id, page, per_page, sort_by, sort_order)
        else:
            # Get public posts with advanced filtering
            query = Post.get_public_posts_advanced(
                page, per_page, current_user_id, 
                category=category, 
                visibility=visibility,
                search=search,
                tags=tags,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        # Convert to response format
        posts_data = [post.to_dict(include_media=True, include_user=True) for post in query.items]
        
        return jsonify({
            'posts': posts_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': query.total,
                'pages': query.pages,
                'has_next': query.has_next,
                'has_prev': query.has_prev
            },
            'filters': {
                'category': category,
                'visibility': visibility,
                'search': search,
                'tags': tags,
                'sort_by': sort_by,
                'sort_order': sort_order
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post(post_id):
    """Get a specific post by ID"""
    try:
        current_user_id = get_jwt_identity()
        
        post = Post.query.filter_by(id=post_id, is_deleted=False).first()
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check visibility
        if post.visibility == 'private' and post.user_id != current_user_id:
            return jsonify({'error': 'Post not accessible'}), 403
        
        # Increment view count
        post.views_count += 1
        db.session.commit()
        
        return jsonify({
            'post': post.to_dict(include_media=True, include_user=True)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching post {post_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """Update a post"""
    try:
        current_user_id = get_jwt_identity()
        
        post = Post.query.filter_by(id=post_id, is_deleted=False).first()
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check ownership
        if post.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get form data
        content = request.form.get('content', '').strip()
        visibility = request.form.get('visibility')
        content_type = request.form.get('content_type')
        
        # Validate content if provided
        if content:
            is_valid, error_message = validate_post_content(content)
            if not is_valid:
                return jsonify({'error': error_message}), 400
            
            post.content = content
            post.content_type = content_type or post.content_type
            
            # Update metadata
            metadata = extract_metadata_from_content(content)
            post.title = metadata['title']
            post.summary = metadata['summary']
            post.tags = metadata['tags']
            post.category = metadata['category']
        
        # Update visibility if provided
        if visibility and visibility in ['public', 'private', 'connections']:
            post.visibility = visibility
        
        # Update timestamps
        post.updated_at = datetime.utcnow()
        
        # Update search vector
        post.update_search_vector()
        
        db.session.commit()
        
        # Invalidate cache
        invalidate_post_cache()
        
        return jsonify({
            'message': 'Post updated successfully',
            'post': post.to_dict(include_media=True, include_user=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating post {post_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Delete a post (soft delete)"""
    try:
        current_user_id = get_jwt_identity()
        
        post = Post.query.filter_by(id=post_id, is_deleted=False).first()
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check ownership
        if post.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Soft delete
        post.soft_delete()
        db.session.commit()
        
        # Invalidate cache
        invalidate_post_cache()
        
        return jsonify({'message': 'Post deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting post {post_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    """Like/unlike a post"""
    try:
        current_user_id = get_jwt_identity()
        
        post = Post.query.filter_by(id=post_id, is_deleted=False).first()
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check visibility
        if post.visibility == 'private' and post.user_id != current_user_id:
            return jsonify({'error': 'Post not accessible'}), 403
        
        # TODO: Implement like/unlike logic with a separate Like model
        # For now, just increment the counter
        post.likes_count += 1
        db.session.commit()
        
        # Invalidate cache
        invalidate_post_cache()
        
        return jsonify({
            'message': 'Post liked successfully',
            'likes_count': post.likes_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error liking post {post_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/search', methods=['GET'])
@jwt_required()
def search_posts():
    """Search posts by content, title, or tags"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        q = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        if not q:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Simple search implementation
        # TODO: Implement full-text search with proper indexing
        search_terms = q.lower().split()
        
        # Get public posts
        posts = Post.query.filter_by(is_deleted=False, visibility='public').all()
        
        # Filter by search terms
        matching_posts = []
        for post in posts:
            post_text = f"{post.content} {post.title or ''} {' '.join(post.tags or [])}".lower()
            if all(term in post_text for term in search_terms):
                matching_posts.append(post)
        
        # Sort by relevance (simple implementation)
        matching_posts.sort(key=lambda p: p.created_at, reverse=True)
        
        # Pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_posts = matching_posts[start_idx:end_idx]
        
        posts_data = [post.to_dict(include_media=True, include_user=True) for post in paginated_posts]
        
        return jsonify({
            'posts': posts_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': len(matching_posts),
                'pages': (len(matching_posts) + per_page - 1) // per_page,
                'has_next': end_idx < len(matching_posts),
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error searching posts: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/upload/media', methods=['POST'])
@jwt_required()
def upload_media():
    """Upload media files for posts"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file.filename:
            return jsonify({'error': 'No file selected'}), 400
        
        # Process file
        success, message, file_info = media_processor.save_file(file, 'posts')
        
        if success:
            return jsonify({
                'message': 'File uploaded successfully',
                'file_info': file_info
            }), 201
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        logger.error(f"Error uploading media: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all available categories"""
    try:
        # Try to get from cache first
        cache_key = 'post_categories'
        cached_categories = cache.get(cache_key)
        
        if cached_categories is not None:
            return jsonify({
                'categories': cached_categories
            }), 200
        
        # If not in cache, fetch from database
        categories = Post.get_categories()
        category_list = [cat[0] for cat in categories if cat[0]]
        
        # Cache for 5 minutes
        cache.set(cache_key, category_list, ttl=300)
        
        return jsonify({
            'categories': category_list
        }), 200
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/popular-tags', methods=['GET'])
@jwt_required()
def get_popular_tags():
    """Get most popular tags"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # Try to get from cache first
        cache_key = f'popular_tags_{limit}'
        cached_tags = cache.get(cache_key)
        
        if cached_tags is not None:
            return jsonify({
                'tags': cached_tags
            }), 200
        
        # If not in cache, fetch from database
        tags = Post.get_popular_tags(limit)
        
        # Cache for 10 minutes
        cache.set(cache_key, tags, ttl=600)
        
        return jsonify({
            'tags': tags
        }), 200
    except Exception as e:
        logger.error(f"Error fetching popular tags: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500 