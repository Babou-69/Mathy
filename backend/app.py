# backend/app.py
import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from database import init_db
from routes.auth import bp as auth_bp
from routes.scores import bp as scores_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS

load_dotenv()

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret")
    app.config["PROPAGATE_EXCEPTIONS"] = True

    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/auth/*": {"origins": "*"}, r"/scores/*": {"origins": "*"}})

    jwt = JWTManager(app)

    # register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(scores_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    # create tables if needed
    init_db()
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
