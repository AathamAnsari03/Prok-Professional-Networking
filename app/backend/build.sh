#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Set up database
echo "🗄️ Setting up database..."
python -c "
from main import app, db
with app.app_context():
    db.create_all()
    print('✅ Database tables created successfully!')
"

echo "✅ Build completed successfully!" 