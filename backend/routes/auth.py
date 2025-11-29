# backend/routes/auth.py
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import User
from utils.security import hash_password, verify_password
from flask_jwt_extended import create_access_token
from datetime import timedelta

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"msg": "username and password required"}), 400

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            return jsonify({"msg": "username already exists"}), 400

        # create user, generate a fake email for internal use
        email = f"{username}@local.app"
        user = User(username=username, email=email, password_hash=hash_password(password))
        db.add(user)
        db.commit()
        db.refresh(user)

        access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=8))
        return jsonify({"access_token": access_token, "user": {"id": user.id, "username": user.username}}), 201
    finally:
        db.close()

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"msg": "username and password required"}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.password_hash):
            return jsonify({"msg": "invalid credentials"}), 401

        access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=8))
        return jsonify({"access_token": access_token, "user": {"id": user.id, "username": user.username}}), 200
    finally:
        db.close()
