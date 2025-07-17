from flask import Blueprint, request, jsonify
from models.user import User, db
from flask_jwt_extended import create_access_token
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash

auth_bp = Blueprint('auth', __name__)
 
# Rate limiter instance (should be created in main.py, but for demo, create here if not already)
limiter = Limiter(get_remote_address)

@auth_bp.route('/api/signup', methods=['POST'])
@limiter.limit("5 per minute")
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Password complexity check
    if not password or len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    # Check for existing user
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"message": "User already exists"}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

@auth_bp.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    user = None
    if username:
        user = User.query.filter_by(username=username).first()
    elif email:
        user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        token = create_access_token(identity=user.id)
        return jsonify({"token": token, "user": {"id": user.id, "username": user.username, "email": user.email}}), 200
    return jsonify({"message": "Invalid credentials"}), 401 