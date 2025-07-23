from flask import Blueprint, request, jsonify, current_app
from models.user import User, db
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/signup', methods=['POST'])
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
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token, "user": {"id": user.id, "username": user.username, "email": user.email}}), 200
    return jsonify({"message": "Invalid credentials"}), 401 