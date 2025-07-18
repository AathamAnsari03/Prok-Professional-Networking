from flask import Blueprint

def register_routes(app):
    from api.auth import auth_bp
    from api.profile import profile_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
