from flask import Flask, send_from_directory, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
import os

# Load environment variables
load_dotenv()

# Import models
from models import db, User, Profile, Skill, Experience, Education, Post, PostMedia
from api import auth_bp, profile_bp, posts_bp, feed_bp, jobs_bp, messaging_bp

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions with proper CORS configuration
CORS(app, 
     origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     supports_credentials=True,
     max_age=3600)

# Initialize database
db.init_app(app)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(posts_bp)
app.register_blueprint(feed_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(messaging_bp)

print('>>> profile_bp is being imported and registered!')
print('>>> All blueprints registered!')

# Global CORS preflight handler
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Max-Age", "3600")
        return response

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory('uploads', filename)

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    return app

# Print all registered routes for debugging
with app.app_context():
    print('>>> Registered routes:')
    for rule in app.url_map.iter_rules():
        print(rule)

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Run the app
    app.run(debug=True) 