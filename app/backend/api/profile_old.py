from flask import Blueprint, request, jsonify, send_file, current_app, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from PIL import Image
import os
import io
import uuid
from datetime import datetime
from models.user import User
from models.profile import Profile, Experience, Education

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_IMAGE_SIZE_MB = 5
AVATAR_SIZE = (256, 256)

# Helper: allowed file
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper: compress and resize image
def compress_image(file_stream):
    img = Image.open(file_stream)
    img = img.convert('RGB')
    img.thumbnail(AVATAR_SIZE)
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=85)
    output.seek(0)
    return output

@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify(success=False, message='User not found'), 404
        
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            # Auto-create empty profile
            profile = Profile(user_id=user.id)
            db.session.add(profile)
            db.session.commit()
        
        # Build avatar URL
        avatar_url = None
        if profile.avatar:
            if profile.avatar.startswith('http'):
                avatar_url = profile.avatar
            else:
                avatar_url = f"http://localhost:5000{profile.avatar}"
        
        return jsonify(success=True, profile={
            'id': profile.id,
            'user_id': profile.user_id,
            'avatar': avatar_url,
            'name': profile.name or '',
            'title': profile.title or '',
            'bio': profile.bio or '',
            'location': profile.location or '',
            'contact': profile.contact or '',
            'skills': profile.skills or [],
            'socials': profile.socials or {},
            'experiences': [
                {
                    'id': exp.id,
                    'title': exp.title,
                    'company': exp.company,
                    'start_date': exp.start_date.isoformat() if exp.start_date else None,
                    'end_date': exp.end_date.isoformat() if exp.end_date else None,
                    'description': exp.description
                } for exp in profile.experiences
            ],
            'education': [
                {
                    'id': edu.id,
                    'school': edu.school,
                    'degree': edu.degree,
                    'field': edu.field,
                    'start_date': edu.start_date.isoformat() if edu.start_date else None,
                    'end_date': edu.end_date.isoformat() if edu.end_date else None
                } for edu in profile.education
            ]
        })
    except Exception as e:
        print(f"Error getting profile: {e}")
        return jsonify(success=False, message='Failed to get profile'), 500

@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify(success=False, message='User not found'), 404
        
        data = request.json or {}
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
        
        # Validate and update basic fields
        errors = {}
        if 'name' in data and (not isinstance(data['name'], str) or len(data['name']) > 100):
            errors['name'] = 'Name must be a string up to 100 chars.'
        if 'title' in data and (not isinstance(data['title'], str) or len(data['title']) > 100):
            errors['title'] = 'Title must be a string up to 100 chars.'
        if 'location' in data and (not isinstance(data['location'], str) or len(data['location']) > 100):
            errors['location'] = 'Location must be a string up to 100 chars.'
        if 'bio' in data and (not isinstance(data['bio'], str) or len(data['bio']) > 1000):
            errors['bio'] = 'Bio must be a string up to 1000 chars.'
        if 'skills' in data and (not isinstance(data['skills'], list) or len(data['skills']) > 30):
            errors['skills'] = 'Skills must be a list of up to 30 items.'
        if 'contact' in data and (not isinstance(data['contact'], str) or len(data['contact']) > 100):
            errors['contact'] = 'Contact must be a string up to 100 chars.'
        if 'socials' in data and (not isinstance(data['socials'], dict)):
            errors['socials'] = 'Socials must be a dictionary.'
        
        if errors:
            return jsonify(success=False, errors=errors), 400
        
        # Update basic fields
        for field in ['name', 'title', 'bio', 'location', 'contact', 'skills', 'socials']:
            if field in data:
                setattr(profile, field, data[field])
        
        # Handle experiences
        if 'experiences' in data and isinstance(data['experiences'], list):
            # Clear existing experiences
            for exp in profile.experiences:
                db.session.delete(exp)
            
            # Add new experiences
            for exp_data in data['experiences']:
                if exp_data.get('title'):  # Only add if title exists
                    exp = Experience(
                        profile_id=profile.id,
                        title=exp_data.get('title', ''),
                        company=exp_data.get('company', ''),
                        description=exp_data.get('description', ''),
                        start_date=datetime.fromisoformat(exp_data['start_date']) if exp_data.get('start_date') else None,
                        end_date=datetime.fromisoformat(exp_data['end_date']) if exp_data.get('end_date') else None
                    )
                    db.session.add(exp)
        
        # Handle education
        if 'education' in data and isinstance(data['education'], list):
            # Clear existing education
            for edu in profile.education:
                db.session.delete(edu)
            
            # Add new education
            for edu_data in data['education']:
                if edu_data.get('school'):  # Only add if school exists
                    edu = Education(
                        profile_id=profile.id,
                        school=edu_data.get('school', ''),
                        degree=edu_data.get('degree', ''),
                        field=edu_data.get('field', ''),
                        start_date=datetime.fromisoformat(edu_data['start_date']) if edu_data.get('start_date') else None,
                        end_date=datetime.fromisoformat(edu_data['end_date']) if edu_data.get('end_date') else None
                    )
                    db.session.add(edu)
        
        db.session.commit()
        
        # Return updated profile
        avatar_url = None
        if profile.avatar:
            if profile.avatar.startswith('http'):
                avatar_url = profile.avatar
            else:
                avatar_url = f"http://localhost:5000{profile.avatar}"
        
        return jsonify(success=True, profile={
            'id': profile.id,
            'user_id': profile.user_id,
            'avatar': avatar_url,
            'name': profile.name or '',
            'title': profile.title or '',
            'bio': profile.bio or '',
            'location': profile.location or '',
            'contact': profile.contact or '',
            'skills': profile.skills or [],
            'socials': profile.socials or {},
            'experiences': [
                {
                    'id': exp.id,
                    'title': exp.title,
                    'company': exp.company,
                    'start_date': exp.start_date.isoformat() if exp.start_date else None,
                    'end_date': exp.end_date.isoformat() if exp.end_date else None,
                    'description': exp.description
                } for exp in profile.experiences
            ],
            'education': [
                {
                    'id': edu.id,
                    'school': edu.school,
                    'degree': edu.degree,
                    'field': edu.field,
                    'start_date': edu.start_date.isoformat() if edu.start_date else None,
                    'end_date': edu.end_date.isoformat() if edu.end_date else None
                } for edu in profile.education
            ]
        })
    except Exception as e:
        print(f"Error updating profile: {e}")
        db.session.rollback()
        return jsonify(success=False, message='Failed to update profile'), 500

@profile_bp.route('/profile/image', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify(success=False, message='User not found'), 404
    profile = Profile.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()
    if 'file' not in request.files:
        return jsonify(success=False, message='No file part'), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False, message='No selected file'), 400
    if not allowed_file(file.filename):
        return jsonify(success=False, message='Invalid file type. Only jpg/png allowed.'), 400
    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0)
    if file_length > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        return jsonify(success=False, message='File too large. Max 5MB.'), 400
    try:
        compressed = compress_image(file)
        unique_id = str(uuid.uuid4())
        filename = f"avatar_{user.id}_{unique_id}.jpg"
        upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, 'wb') as f:
            f.write(compressed.read())
        profile.avatar = f'/static/uploads/{filename}'
        db.session.commit()
        return jsonify(success=True, url=profile.avatar)
    except Exception:
        return jsonify(success=False, message='Image upload failed. Please try again.'), 500

@profile_bp.route('/profile/resume', methods=['GET'])
def download_resume():
    resume_path = os.path.join(current_app.root_path, 'static', 'resume', 'resume.pdf')
    if not os.path.exists(resume_path):
        # Generate a dummy PDF if not exists
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(resume_path)
        c.drawString(100, 750, 'John Doe Resume')
        c.save()
    return send_file(resume_path, as_attachment=True)

@profile_bp.route('/profile', methods=['OPTIONS'])
def profile_options():
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return response

@profile_bp.route('/profile/image', methods=['OPTIONS'])
def profile_image_options():
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return response

# Routes will be implemented here 