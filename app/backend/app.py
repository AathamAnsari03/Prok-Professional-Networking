from flask import Flask
from config import Config
from flask_cors import CORS
from extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    with app.app_context():
        from routes.auth import auth_bp
        app.register_blueprint(auth_bp)
    return app

def get_app():
    return create_app() 