import React, { useState } from "react";
import MethodeContent from "../components/MethodeContent";
import "../App.css";

const METHODES_PAR_CATEGORIE = {
  "Calcul numérique et algébrique": [
    "Effectuer des opérations sur les puissances",
    "Effectuer des opérations et des comparaisons entre des fractions simples",
    "Passer d’une écriture d’un nombre à une autre",
    "Estimer un ordre de grandeur"  ],
  "Proportions et pourcentages": [
    "Déterminer une proportion",
    "Calculer un effectif",
    "Calculer une proportion de proportion"
  ],
  "Évolutions et variations": [
    "Passer d’une formule additive à une formule multiplicative",
    "Calculer un taux d’évolution entre deux valeurs",
    "Appliquer un taux d’évolution pour calculer une valeur de départ ou d’arrivée",
    " Calculer un taux d’évolution global",
    "Calculer un taux d’évolution réciproque"
  ]
};


const CATEGORIES = Object.keys(METHODES_PAR_CATEGORIE);

function Methode() {
  const [categorie, setCategorie] = useState(null);
  const [methodes, setMethodes] = useState([]);
  const [selectedMethode, setSelectedMethode] = useState("");
  const [contenu, setContenu] = useState("");

  const handleCategorieClick = (cat) => {
    setCategorie(cat);
    setMethodes(METHODES_PAR_CATEGORIE[cat] || []);
    setSelectedMethode("");
    setContenu("");
  };

  const handleMethodeChange = (methode) => {
    setSelectedMethode(methode);

    // TEMPORAIRE : contenu factice
    setContenu(`
### ${methode}

Pour résoudre ce type d'exercice :

- Identifier les données
- Appliquer la formule

$$p = \\frac{s}{e}$$

Puis :

$$x = p \\times 100$$
`);
  };

  return (
    <div className="container">
      <h2>📘 Méthodes</h2>
      <h3>Sélectionne une catégorie</h3>

      {/* Boutons catégories */}
      <div className="categorie-grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`categorie-card ${categorie === cat ? "active" : ""}`}
            onClick={() => handleCategorieClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Liste déroulante */}
      {methodes.length > 0 && (
        <div className="methode-select">
          <h3>Méthode</h3>
          <select
            value={selectedMethode}
            onChange={(e) => handleMethodeChange(e.target.value)}
          >
            <option value="">-- Choisir une méthode --</option>
            {methodes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Contenu */}
      {contenu && (
        <div className="methode-contenu">
          <MethodeContent text={contenu} />
        </div>
      )}
    </div>
  );
}

export default Methode;
