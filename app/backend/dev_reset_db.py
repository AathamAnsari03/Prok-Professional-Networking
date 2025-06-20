#!/usr/bin/env python3
"""
Development Script: Reset Database
==================================

This script is ONLY for development/testing purposes.
It will:
1. Drop all existing database tables
2. Recreate all tables with current schema
3. Create a clean database without sample data

WARNING: This will DELETE ALL DATA in your database!

Usage:
    python dev_reset_db.py

After running this script:
1. Sign up a new user through the frontend
2. Login with the new user credentials
3. Start using the platform with a clean slate
"""

from main import app, db
from models import User, Profile, Skill, Experience, Education, Post, PostMedia

def reset_database():
    """Reset the database to a clean state"""
    with app.app_context():
        # Drop all tables
        print("🗑️  Dropping all tables...")
        db.drop_all()
        
        # Create all tables
        print("🏗️  Creating all tables...")
        db.create_all()
        
        print("✅ Database reset completed successfully!")
        print("📊 Database is now clean and ready for new users")
        print("\n📝 Next steps:")
        print("1. Start the backend server: python main.py")
        print("2. Start the frontend: npm run dev")
        print("3. Go to http://localhost:5173/signup")
        print("4. Create a new user account")
        print("5. Login and start using the platform!")

if __name__ == '__main__':
    reset_database() 