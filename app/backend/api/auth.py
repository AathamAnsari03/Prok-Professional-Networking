from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from extensions import db
import datetime
from flask_cors import CORS

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Ensure CORS for this blueprint (if not already applied globally)
CORS(auth_bp, origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        if not username or not email or not password:
            return jsonify({'success': False, 'message': 'Username, email and password required'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'message': 'Username already taken'}), 400
        # Password complexity check
        if not User.is_password_complex(password):
            return jsonify({'success': False, 'message': 'Password must be at least 8 chars, with upper, lower, digit.'}), 400
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(days=1))
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            },
            'token': token
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['OPTIONS'])
def login_options():
    from flask import make_response
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response, 200

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        print(f"[LOGIN DEBUG] Received data: {data}")
        identifier = data.get('identifier') or data.get('username') or data.get('email')
        password = data.get('password')
        print(f"[LOGIN DEBUG] identifier: {identifier}, password: {'***' if password else None}")
        if not identifier or not password:
            return jsonify(success=False, message='Username/Email and password required'), 400
        user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
        if not user or not user.check_password(password):
            return jsonify(success=False, message='Invalid credentials'), 401
        token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(days=1))
        return jsonify(success=True, token=token, user={
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 200
    except Exception as e:
        print(f"[Backend] Login error: {e}")
        return jsonify(success=False, message='Internal server error'), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            }
        })
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400

        # Check if user exists
        user = User.query.filter_by(email=email).first()
        if not user:
            # Don't reveal if email exists or not for security
            return jsonify({'success': True, 'message': 'If the email exists, a reset link has been sent'}), 200

        # TODO: Implement actual password reset logic
        # For now, just return success
        # In production, you would:
        # 1. Generate a secure reset token
        # 2. Store it in database with expiration
        # 3. Send email with reset link
        # 4. Log the reset attempt

        return jsonify({
            'success': True,
            'message': 'If the email exists, a reset link has been sent'
        })
    except Exception as e:
        print(f"Forgot password error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        # In production, save user to DB and hash password
        # For now, just return success for any valid email
        if not data or not data.get('email'):
            return jsonify(success=False, error='Email is required'), 400

        token = create_access_token(identity=str(data['email']), expires_delta=datetime.timedelta(days=1))
        return jsonify(success=True, token=token, user={'email': data['email'], 'name': data.get('name', '')})
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify(success=False, error='Internal server error'), 500 