from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, db
from models.profile import Profile, Experience, Education, Achievement, ProfilePhoto

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Get or create profile
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = Profile(user_id=user_id, full_name=user.username)
        db.session.add(profile)
        db.session.commit()
    
    # Get related data
    experiences = Experience.query.filter_by(profile_id=profile.id).all()
    education = Education.query.filter_by(profile_id=profile.id).all()
    achievements = Achievement.query.filter_by(profile_id=profile.id).all()
    photos = ProfilePhoto.query.filter_by(profile_id=profile.id).all()
    
    return jsonify({
        "profile": {
            "id": profile.id,
            "full_name": profile.full_name,
            "bio": profile.bio,
            "location": profile.location,

            "experience": [{
                "id": e.id,
                "title": e.title,
                "company": e.company,
                "start_date": str(e.start_date) if e.start_date else None,
                "end_date": str(e.end_date) if e.end_date else None,
                "description": e.description
            } for e in experiences],
            "education": [{
                "id": ed.id,
                "school": ed.school,
                "degree": ed.degree,
                "field": ed.field_of_study,
                "start_year": ed.start_year,
                "end_year": ed.end_year
            } for ed in education],
            "achievements": [{
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "date": a.date,
                "image_url": a.image_url
            } for a in achievements],
            "photos": [{"id": p.id, "url": p.url} for p in photos]
        },
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 200

@profile_bp.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.session.add(profile)
    
    # Update basic info
    if 'bio' in data:
        profile.bio = data['bio']
    if 'location' in data:
        profile.location = data['location']
    if 'full_name' in data:
        profile.full_name = data['full_name']
    
    db.session.commit()
    
    return jsonify({"message": "Profile updated successfully"}), 200



@profile_bp.route('/api/profile/experience', methods=['POST'])
@jwt_required()
def add_experience():
    """Add experience to user profile"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        user = User.query.get(user_id)
        profile = Profile(user_id=user_id, full_name=user.username)
        db.session.add(profile)
        db.session.commit()
    
    experience = Experience(
        profile_id=profile.id,
        title=data['title'],
        company=data['company'],
        start_date=data['start_date'],
        end_date=data.get('end_date'),
        description=data.get('description', '')
    )
    db.session.add(experience)
    db.session.commit()
    
    return jsonify({
        "message": "Experience added successfully",
        "experience": {
            "id": experience.id,
            "title": experience.title,
            "company": experience.company,
            "start_date": experience.start_date,
            "end_date": experience.end_date,
            "description": experience.description
        }
    }), 201

@profile_bp.route('/api/profile/experience/<int:exp_id>', methods=['DELETE'])
@jwt_required()
def remove_experience(exp_id):
    """Remove experience from user profile"""
    user_id = int(get_jwt_identity())
    
    experience = Experience.query.join(Profile).filter(Experience.id == exp_id, Profile.user_id == user_id).first()
    if not experience:
        return jsonify({"message": "Experience not found"}), 404
    
    db.session.delete(experience)
    db.session.commit()
    
    return jsonify({"message": "Experience removed successfully"}), 200

@profile_bp.route('/api/profile/achievements', methods=['POST'])
@jwt_required()
def add_achievement():
    """Add achievement to user profile"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        user = User.query.get(user_id)
        profile = Profile(user_id=user_id, full_name=user.username)
        db.session.add(profile)
        db.session.commit()
    
    achievement = Achievement(
        profile_id=profile.id,
        title=data['title'],
        description=data.get('description', ''),
        date=data.get('date'),
        image_url=data.get('image_url')
    )
    db.session.add(achievement)
    db.session.commit()
    
    return jsonify({
        "message": "Achievement added successfully",
        "achievement": {
            "id": achievement.id,
            "title": achievement.title,
            "description": achievement.description,
            "date": achievement.date,
            "image_url": achievement.image_url
        }
    }), 201

@profile_bp.route('/api/profile/achievements/<int:achievement_id>', methods=['DELETE'])
@jwt_required()
def remove_achievement(achievement_id):
    """Remove achievement from user profile"""
    user_id = int(get_jwt_identity())
    
    achievement = Achievement.query.join(Profile).filter(Achievement.id == achievement_id, Profile.user_id == user_id).first()
    if not achievement:
        return jsonify({"message": "Achievement not found"}), 404
    
    db.session.delete(achievement)
    db.session.commit()
    
    return jsonify({"message": "Achievement removed successfully"}), 200

@profile_bp.route('/api/profile/photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    """Upload profile photo"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        user = User.query.get(user_id)
        profile = Profile(user_id=user_id, full_name=user.username)
        db.session.add(profile)
        db.session.commit()
    
    # Remove existing photos
    existing_photos = ProfilePhoto.query.filter_by(profile_id=profile.id).all()
    for photo in existing_photos:
        db.session.delete(photo)
    
    # Add new photo
    photo = ProfilePhoto(
        profile_id=profile.id,
        url=data['photo_url']
    )
    db.session.add(photo)
    db.session.commit()
    
    return jsonify({
        "message": "Profile photo uploaded successfully",
        "photo": {
            "id": photo.id,
            "url": photo.url
        }
    }), 201

@profile_bp.route('/api/profile/photo', methods=['DELETE'])
@jwt_required()
def remove_profile_photo():
    """Remove profile photo"""
    user_id = int(get_jwt_identity())
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"message": "Profile not found"}), 404
    
    # Remove all photos for this profile
    photos = ProfilePhoto.query.filter_by(profile_id=profile.id).all()
    for photo in photos:
        db.session.delete(photo)
    
    db.session.commit()
    
    return jsonify({"message": "Profile photo removed successfully"}), 200