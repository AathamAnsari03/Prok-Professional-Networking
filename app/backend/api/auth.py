from flask import Blueprint, request, jsonify, current_app
from models import db, User, Profile
from flask_jwt_extended import create_access_token
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from email_validator import validate_email, EmailNotValidError
import re

# Blueprint
auth_bp = Blueprint('auth', __name__)

# Limiter instance (attach to app in record_once)
limiter = Limiter(key_func=get_remote_address)

@auth_bp.record_once
def on_load(state):
    limiter.init_app(state.app)

def is_password_complex(password):
    # At least 8 chars, one uppercase, one lowercase, one digit
    return (
        len(password) >= 8 and
        re.search(r'[A-Z]', password) and
        re.search(r'[a-z]', password) and
        re.search(r'[0-9]', password)
    )

@auth_bp.route('/api/signup', methods=['POST'])
@limiter.limit("5 per minute")
def signup():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    # Input validation
    if not username or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    # Email validation
    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({'message': 'Invalid email address'}), 400

    # Password complexity
    if not is_password_complex(password):
        return jsonify({'message': 'Password must be at least 8 characters and include uppercase, lowercase, and a digit.'}), 400

    # Check uniqueness
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'Username or email already exists'}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Auto-create blank profile for new user
    profile = Profile(user_id=user.id)
    db.session.add(profile)
    db.session.commit()

    return jsonify({'message': 'User and profile created successfully'}), 201

@auth_bp.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json() or {}
    identifier = (data.get('username') or data.get('email') or '').strip()
    password = data.get('password') or ''

    if not identifier or not password:
        return jsonify({'message': 'Missing username/email or password'}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

# Routes will be implemented here 