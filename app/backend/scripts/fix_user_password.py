import sys
sys.path.append('app/backend')

from app import create_app
from extensions import db
from models.user import User

EMAIL = 'tharunkumar7379@gmail.com'
NEW_PASSWORD = 'Test@1234'

app = create_app()
with app.app_context():
    user = User.query.filter_by(email=EMAIL).first()
    if user:
        user.set_password(NEW_PASSWORD)
        db.session.commit()
        print(f"Password for {EMAIL} has been reset to '{NEW_PASSWORD}'!")
    else:
        print(f"User with email {EMAIL} not found.") 