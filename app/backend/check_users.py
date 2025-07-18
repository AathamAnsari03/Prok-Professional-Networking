#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models.user import User
from extensions import db
from werkzeug.security import generate_password_hash

def check_users():
    app = create_app()
    with app.app_context():
        # Get all users
        users = User.query.all()
        print(f"Found {len(users)} users in database:")
        print("-" * 50)
        
        for user in users:
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Created: {user.created_at}")
            print("-" * 30)

def create_test_user():
    app = create_app()
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter_by(email="tharunkumar7379@gmail.com").first()
        if existing_user:
            print(f"User with email tharunkumar7379@gmail.com already exists!")
            print(f"Username: {existing_user.username}")
            print(f"ID: {existing_user.id}")
            return
        
        # Create new user
        new_user = User(
            username="tharun",
            email="tharunkumar7379@gmail.com",
            password_hash=generate_password_hash("Tharun@1")
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        print("✅ New user created successfully!")
        print(f"Username: {new_user.username}")
        print(f"Email: {new_user.email}")
        print(f"ID: {new_user.id}")

def create_monica_user():
    app = create_app()
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter_by(username="Monica").first()
        if existing_user:
            print(f"User with username Monica already exists!")
            print(f"Email: {existing_user.email}")
            print(f"ID: {existing_user.id}")
            return
        
        # Create new user
        new_user = User(
            username="Monica",
            email="monica@example.com",
            password_hash=generate_password_hash("Monica@1")
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        print("✅ Monica user created successfully!")
        print(f"Username: {new_user.username}")
        print(f"Email: {new_user.email}")
        print(f"ID: {new_user.id}")

if __name__ == "__main__":
    print("🔍 Checking existing users...")
    check_users()
    print("\n" + "="*50)
    print("👤 Creating Tharun user...")
    create_test_user()
    print("\n" + "="*50)
    print("👤 Creating Monica user...")
    create_monica_user()
    print("\n" + "="*50)
    print("✅ All done! You can now try logging in with:")
    print("   Email: tharunkumar7379@gmail.com")
    print("   Password: Tharun@1")
    print("   OR")
    print("   Username: Monica")
    print("   Password: Monica@1") 