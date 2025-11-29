# backend/routes/scores.py
# essai de code qui peut enregistrer les resultat, à vérifier quand tout sera relié
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import SessionLocal
from models import Score, User

bp = Blueprint("scores", __name__, url_prefix="/scores")

@bp.route("/user", methods=["GET"])
@jwt_required()
def get_user_scores():
    uid = get_jwt_identity()
    db = SessionLocal()
    try:
        # récupère tous les scores de l'utilisateur
        scores = db.query(Score).filter(Score.user_id == uid).all()
        out = {}
        for s in scores:
            out[s.automatisme_id] = {"correct": s.correct, "total": s.total}
        return jsonify(out), 200
    finally:
        db.close()

@bp.route("/update", methods=["POST"])
@jwt_required()
def update_score():
    uid = get_jwt_identity()
    data = request.get_json() or {}
    automatisme_id = data.get("automatisme_id")
    correct = int(data.get("correct", 0))
    total = int(data.get("total", 0))

    if not automatisme_id:
        return jsonify({"msg": "automatisme_id required"}), 400

    db = SessionLocal()
    try:
        # trouver l'entry existante
        s = db.query(Score).filter(Score.user_id == uid, Score.automatisme_id == automatisme_id).first()
        if s:
            # additionner les nouveaux résultats (ou remplacer selon logique)
            s.correct += correct
            s.total += total
        else:
            s = Score(user_id=uid, automatisme_id=automatisme_id, correct=correct, total=total)
            db.add(s)
        db.commit()
        return jsonify({"msg": "saved"}), 200
    finally:
        db.close()

@bp.route("/reset", methods=["POST"])
@jwt_required()
def reset_scores():
    uid = get_jwt_identity()
    db = SessionLocal()
    try:
        db.query(Score).filter(Score.user_id == uid).delete()
        db.commit()
        return jsonify({"msg": "reset"}), 200
    finally:
        db.close()
