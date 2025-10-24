
from flask import Flask, render_template, jsonify, request
import subprocess, os, json, sys

app = Flask(__name__)
EXOS_DIR = os.path.join(os.path.dirname(__file__), 'exos_bac_techno')

DISPLAY_MAP = {
    'Conversion_fraction': 'Conversion fraction',
    'puissances_operations': 'Puissances',
    'proportion_basic': 'Proportion simple',
    'proportion_sous_population': 'Proportion de sous-population',
    'proportion_of_proportion': 'Proportion de proportion',
    'taux_evolution_reciproque': 'Taux réciproque',
    'union_intersection_proportion': 'Union et intersection',
    'probabilites': 'Probabilités',
    'probabilites_complementaire': 'Probabilité complémentaire',
    'probabilites_conditionnelles_tableau': 'Probabilités conditionnelles - tableau'
}

OBJECTIFS = {
    "Conversion_fraction": "Passer d’une écriture d’un nombre à une autre (décimale, fractionnaire, pourcentage)",
    "puissances_operations": "Effectuer des opérations sur les puissances",
    "proportion_basic": "Calculer, appliquer, exprimer une proportion sous différentes formes",
    "proportion_sous_population": "Utiliser une proportion pour calculer une partie connaissant le tout",
    "proportion_of_proportion": "Calculer une proportion de proportion (enchaînement de proportions)",
    "taux_evolution_reciproque": "Calculer le taux d’évolution réciproque",
    "union_intersection_proportion": "Calculer P(A ∪ B) = P(A)+P(B)-P(A∩B)",
    "probabilites": "Calculer une probabilité simple : P(A) = cas favorables / cas possibles",
    "probabilites_complementaire": "Calculer la probabilité contraire : P(A^c)=1-P(A)",
    "probabilites_conditionnelles_tableau": "Calculer une probabilité conditionnelle à partir d’un tableau d'effectifs"
}

@app.context_processor
def inject_maps():
    return dict(display_map=DISPLAY_MAP, objectifs=OBJECTIFS)

@app.route('/')
def index():
    files = [f.replace('.py', '') for f in os.listdir(EXOS_DIR) if f.endswith('.py')]
    files.sort()
    return render_template('index.html', exos=files)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    name = data.get('exo')
    path = os.path.join(EXOS_DIR, f"{name}.py")
    if not os.path.exists(path):
        return jsonify({'error': 'Exercice introuvable'}), 404
    try:
        # Use same Python interpreter
        result = subprocess.run([sys.executable, path], capture_output=True, text=True, timeout=10)
        out = result.stdout.strip()
        parts = out.split('CORRECTION:')
        if len(parts) == 2:
            enonce = parts[0].replace('ÉNONCÉ:', '').strip()
            corr = parts[1].strip()
        else:
            enonce = out
            corr = ''
        return jsonify({'enonce': enonce, 'correction': corr})
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Timeout: le script a mis trop de temps.'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
