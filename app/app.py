from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt, migrate, limiter

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    with app.app_context():
        from app.models.user import User
        from app.routes.auth import auth_bp
        app.register_blueprint(auth_bp)
    return app

def get_app():
    return create_app() 