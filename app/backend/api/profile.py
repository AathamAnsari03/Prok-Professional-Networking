from flask import Blueprint, request, jsonify, send_file, current_app, make_response, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from PIL import Image
import os
import io
import uuid
from datetime import datetime
from models.user import User
from models.profile import Profile, Experience, Education
from flask_cors import CORS
from extensions import db

profile_bp = Blueprint('profile', __name__, url_prefix='/api')
CORS(profile_bp, origins=["http://localhost:5173", "http://localhost:5174"], supports_credentials=True)

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

@profile_bp.before_request
def log_request():
    print(f"[PROFILE API] {request.method} {request.path} Headers: {dict(request.headers)}")

@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 200
    return jsonify({'success': True, 'user': user.serialize()})

@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        if not request.is_json:
            return jsonify(success=False, message='Request must be JSON.'), 422
        user_id = get_jwt_identity()
        print('[PROFILE API] JWT identity:', user_id)
        if not user_id:
            print('[PROFILE API] JWT missing or invalid')
            return jsonify(success=False, message='JWT missing or invalid'), 401
        user = User.query.get(user_id)
        if not user:
            return jsonify(success=False, message='User not found'), 404
        data = request.get_json() or {}
        print('Received profile update:', data)
        print('Request headers:', dict(request.headers))
        print('Request method:', request.method)
        print('Request content type:', request.content_type)
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
        # Validate types for skills and socials
        if 'skills' in data and not isinstance(data['skills'], list):
            return jsonify(success=False, message='Skills must be a list.'), 400
        if 'socials' in data and not isinstance(data['socials'], dict):
            return jsonify(success=False, message='Socials must be an object/dict.'), 400
        # Use last saved value or fallback default for missing/empty fields
        def fallback(field, default=''):
            return data.get(field) if data.get(field) not in [None, ''] else getattr(profile, field, default)
        profile.name = fallback('name')
        profile.title = fallback('title')
        profile.bio = fallback('bio')
        profile.location = fallback('location')
        profile.address = fallback('address')
        # Accept and ignore 'banner' if present (for compatibility with frontend)
        _ = data.get('banner', None)
        profile.skills = data.get('skills') if isinstance(data.get('skills'), list) and data.get('skills') else (profile.skills or [])
        profile.socials = data.get('socials') if isinstance(data.get('socials'), dict) and data.get('socials') else (profile.socials or {})
        # Experiences and education (optional, fallback to existing)
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
                avatar_url = f"/api/uploads/{os.path.basename(profile.avatar)}"
        
        return jsonify(success=True, profile={
            'id': profile.id,
            'user_id': profile.user_id,
            'avatar': avatar_url,
            'name': profile.name or '',
            'title': profile.title or '',
            'bio': profile.bio or '',
            'location': profile.location or '',
            'address': profile.address or '',
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
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            print('[UPLOAD] User not found')
            return jsonify(success=False, message='User not found'), 404
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
            db.session.commit()
        # Accept both 'file' and 'banner' as possible keys
        print('[UPLOAD DEBUG] request.files:', request.files)
        print('[UPLOAD DEBUG] request.form:', request.form)
        if request.files:
            for key in request.files:
                f = request.files[key]
                print(f'[UPLOAD DEBUG] key: {key}, filename: {f.filename}, size: {f.content_length if hasattr(f, "content_length") else "unknown"}')
        file = request.files.get('file') or request.files.get('banner')
        if not file:
            print('[UPLOAD] No file or banner part in request')
            return jsonify(success=False, message='No file or banner part'), 422
        if file.filename == '':
            print('[UPLOAD] No selected file')
            return jsonify(success=False, message='No selected file'), 400
        if not allowed_file(file.filename):
            print('[UPLOAD] Invalid file type:', file.filename)
            return jsonify(success=False, message='Invalid file type. Only jpg/png allowed.'), 400
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_IMAGE_SIZE_MB * 1024 * 1024:
            print('[UPLOAD] File too large:', file_length)
            return jsonify(success=False, message='File too large. Max 5MB.'), 400
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
        avatar_url = f"/api/uploads/{filename}"
        print('[UPLOAD] Avatar uploaded:', avatar_url)
        return jsonify(success=True, url=avatar_url)
    except Exception as e:
        print(f"[UPLOAD] Error uploading avatar: {e}")
        return jsonify(success=False, message='Image upload failed. Please try again.'), 500

@profile_bp.route('/profile/banner', methods=['POST'])
@jwt_required()
def upload_banner():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            print('[UPLOAD] User not found')
            return jsonify(success=False, message='User not found'), 404
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = Profile(user_id=user.id)
            db.session.add(profile)
            db.session.commit()
        file = request.files.get('file')
        if not file:
            print('[UPLOAD] No file part in request')
            return jsonify(success=False, message='No file part'), 422
        if file.filename == '':
            print('[UPLOAD] No selected file')
            return jsonify(success=False, message='No selected file'), 400
        if not allowed_file(file.filename):
            print('[UPLOAD] Invalid file type:', file.filename)
            return jsonify(success=False, message='Invalid file type. Only jpg/png allowed.'), 400
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_IMAGE_SIZE_MB * 1024 * 1024:
            print('[UPLOAD] File too large:', file_length)
            return jsonify(success=False, message='File too large. Max 5MB.'), 400
        # Save banner as-is (no compression)
        unique_id = str(uuid.uuid4())
        filename = f"banner_{user.id}_{unique_id}.jpg"
        upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        profile.banner = f'/static/uploads/{filename}'
        db.session.commit()
        banner_url = f"/api/uploads/{filename}"
        print('[UPLOAD] Banner uploaded:', banner_url)
        return jsonify(success=True, url=banner_url)
    except Exception as e:
        print(f"[UPLOAD] Error uploading banner: {e}")
        return jsonify(success=False, message='Banner upload failed. Please try again.'), 500

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

# Serve uploaded images
@profile_bp.route('/uploads/<filename>', methods=['GET'])
def uploaded_file(filename):
    upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
    return send_from_directory(upload_dir, filename)

@profile_bp.route('/profile', methods=['OPTIONS'])
def profile_options():
    response = make_response()
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@profile_bp.route('/profile/image', methods=['OPTIONS'])
def profile_image_options():
    response = make_response()
    response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response 

@profile_bp.route('/profile/banner', methods=['OPTIONS'])
def banner_options():
    response = make_response()
    response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response 