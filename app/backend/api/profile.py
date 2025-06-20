from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Profile, User
from utils import ImageProcessor
import re
import os

profile_bp = Blueprint('profile', __name__)

# Initialize image processor
image_processor = ImageProcessor()

def validate_profile_data(data):
    """Validate profile update data"""
    errors = []
    
    # Validate string lengths
    if 'first_name' in data and data['first_name'] is not None and len(data['first_name']) > 50:
        errors.append("First name must be 50 characters or less")
    
    if 'last_name' in data and data['last_name'] is not None and len(data['last_name']) > 50:
        errors.append("Last name must be 50 characters or less")
    
    if 'headline' in data and data['headline'] is not None and len(data['headline']) > 100:
        errors.append("Headline must be 100 characters or less")
    
    if 'location' in data and data['location'] is not None and len(data['location']) > 100:
        errors.append("Location must be 100 characters or less")
    
    if 'current_position' in data and data['current_position'] is not None and len(data['current_position']) > 100:
        errors.append("Current position must be 100 characters or less")
    
    if 'company' in data and data['company'] is not None and len(data['company']) > 100:
        errors.append("Company must be 100 characters or less")
    
    if 'industry' in data and data['industry'] is not None and len(data['industry']) > 50:
        errors.append("Industry must be 50 characters or less")
    
    # Validate phone number format (check if field exists and is not empty)
    if 'phone' in data and data['phone'] is not None and data['phone'] != '':
        if not re.match(r'^\+?1?\d{9,15}$', data['phone']):
            errors.append("Invalid phone number format")
    
    # Validate website URL format (check if field exists and is not empty)
    if 'website' in data and data['website'] is not None and data['website'] != '':
        if not re.match(r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$', data['website']):
            errors.append("Invalid website URL format")
    
    # Validate LinkedIn URL format (check if field exists and is not empty)
    if 'linkedin_url' in data and data['linkedin_url'] is not None and data['linkedin_url'] != '':
        if not re.match(r'^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$', data['linkedin_url']):
            errors.append("Invalid LinkedIn URL format")
    
    # Validate GitHub URL format (check if field exists and is not empty)
    if 'github_url' in data and data['github_url'] is not None and data['github_url'] != '':
        if not re.match(r'^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9\-_]+\/?$', data['github_url']):
            errors.append("Invalid GitHub URL format")
    
    # Validate profile visibility
    if 'profile_visibility' in data and data['profile_visibility'] is not None:
        valid_visibilities = ['public', 'private', 'connections']
        if data['profile_visibility'] not in valid_visibilities:
            errors.append("Profile visibility must be one of: public, private, connections")
    
    return errors

@profile_bp.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Update user profile
    PUT /api/profile
    """
    try:
        # Get current user ID from JWT token
        current_user_id = int(get_jwt_identity())
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Get user and profile
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        profile = Profile.query.filter_by(user_id=current_user_id).first()
        if not profile:
            # Auto-create a blank profile if not found
            profile = Profile(user_id=current_user_id)
            db.session.add(profile)
            db.session.commit()
        
        # Validate incoming data
        validation_errors = validate_profile_data(data)
        if validation_errors:
            return jsonify({
                'message': 'Validation errors',
                'errors': validation_errors
            }), 400
        
        # Update profile fields (partial update)
        updateable_fields = [
            'first_name', 'last_name', 'headline', 'bio', 'location',
            'current_position', 'company', 'industry', 'phone', 'website',
            'linkedin_url', 'github_url', 'profile_visibility',
            'profile_picture', 'cover_photo'
        ]
        
        updated_fields = []
        for field in updateable_fields:
            if field in data:
                setattr(profile, field, data[field])
                updated_fields.append(field)
        
        # Save changes to database
        db.session.commit()
        
        # Return updated profile
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict(),
            'updated_fields': updated_fields
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500

@profile_bp.route('/api/profile/image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    """
    Upload profile image
    POST /api/profile/image
    """
    try:
        # Get current user ID from JWT token
        current_user_id = int(get_jwt_identity())
        
        # Get user and profile
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        profile = Profile.query.filter_by(user_id=current_user_id).first()
        if not profile:
            return jsonify({'message': 'Profile not found'}), 404
        
        # Check if file is present in request
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Validate file
        validation_errors = image_processor.validate_file(file)
        if validation_errors:
            return jsonify({
                'message': 'File validation failed',
                'errors': validation_errors
            }), 400
        
        # Delete old profile image if exists
        if profile.profile_picture:
            old_filename = profile.profile_picture.split('/')[-1]
            image_processor.delete_image(old_filename)
        
        # Process and save new image
        image_data = image_processor.process_image(file, current_user_id)
        
        # Update profile with new image URL
        profile.profile_picture = image_data['profile_url']
        db.session.commit()
        
        return jsonify({
            'message': 'Profile image uploaded successfully',
            'image': {
                'filename': image_data['filename'],
                'profile_url': image_data['profile_url'],
                'thumbnail_url': image_data['thumbnail_url'],
                'size': image_data['size']
            },
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Upload failed: {str(e)}'}), 500

@profile_bp.route('/api/profile/image', methods=['DELETE'])
@jwt_required()
def delete_profile_image():
    """
    Delete profile image
    DELETE /api/profile/image
    """
    try:
        # Get current user ID from JWT token
        current_user_id = int(get_jwt_identity())
        
        # Get user and profile
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        profile = Profile.query.filter_by(user_id=current_user_id).first()
        if not profile:
            return jsonify({'message': 'Profile not found'}), 404
        
        # Check if profile has an image
        if not profile.profile_picture:
            return jsonify({'message': 'No profile image to delete'}), 404
        
        # Delete image file
        filename = profile.profile_picture.split('/')[-1]
        if image_processor.delete_image(filename):
            # Update profile
            profile.profile_picture = None
            db.session.commit()
            
            return jsonify({
                'message': 'Profile image deleted successfully',
                'profile': profile.to_dict()
            }), 200
        else:
            return jsonify({'message': 'Failed to delete image file'}), 500
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500

@profile_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get user profile
    GET /api/profile
    """
    try:
        # Get current user ID from JWT token
        current_user_id = int(get_jwt_identity())
        
        # Get user and profile
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        profile = Profile.query.filter_by(user_id=current_user_id).first()
        if not profile:
            return jsonify({'message': 'Profile not found'}), 404
        
        return jsonify({
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# Routes will be implemented here 