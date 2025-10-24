
Mathalea Python - Bac Techno (v3 fixed)
======================================

Description
-----------
Petit générateur d'exercices pour le programme Bac Techno (automatismes).
Chaque script Python dans le dossier `exos_bac_techno/` génère aléatoirement un énoncé
et affiche la correction. Les énoncés utilisent LaTeX (MathJax) pour un rendu propre.

Lancement
--------
1. Installer Flask si nécessaire :
   pip install flask

2. Lancer le serveur :
   python server.py

3. Ouvrir dans ton navigateur :
   http://localhost:5000

Structure du projet
------------------
- server.py : serveur Flask (debug activé)
- templates/index.html : interface web (MathJax inclus)
- static/style.css, static/main.js : styles et logique front
- exos_bac_techno/ : 10 scripts Python, un par thème sélectionné

Correspondance thèmes ↔ automatismes officiels (BO)
--------------------------------------------------
- Conversion_fraction :
  Passer d’une écriture d’un nombre à une autre (décimale, fractionnaire, pourcentage)

- puissances_operations :
  Effectuer des opérations sur les puissances

- proportion_basic :
  Calculer, appliquer, exprimer une proportion sous différentes formes (fraction, décimale, pourcentage)

- proportion_sous_population :
  Utiliser une proportion pour calculer une partie connaissant le tout

- proportion_of_proportion :
  Calculer une proportion de proportion (enchaînement de proportions, produit de pourcentages)

- taux_evolution_reciproque :
  Calculer le taux d’évolution réciproque

- union_intersection_proportion :
  Utiliser et calculer P(A ∪ B) = P(A) + P(B) - P(A ∩ B)

- probabilites :
  Calculer la probabilité d’un événement simple (cas favorables / cas possibles)

- probabilites_complementaire :
  Calculer la probabilité contraire : P(A^c) = 1 - P(A)

- probabilites_conditionnelles_tableau :
  Calculer des probabilités conditionnelles à partir d’un tableau d'effectifs

Notes
-----
- MathJax est chargé depuis CDN (connexion internet nécessaire pour le rendu LaTeX).
- Les scripts d'exercices sont volontairement simples et conçus pour être modifiables.
- Flask est en mode debug pour faciliter le développement local.

