// src/pages/Exercices.js
import React, { useState, useEffect } from "react";
import MethodeContent from "../components/MethodeContent";
import "../styles/Exercices.css";

/* =========================
   FONCTIONS UTILITAIRES
========================= */

// détecte {{x}} et \var(x)
const extractVariables = (text) => {
  const vars = new Set();
  const braces = /{{([a-z])}}/gi;
  const latex = /\\var\(([^)]+)\)/g;

  let m;
  while ((m = braces.exec(text))) vars.add(m[1]);
  while ((m = latex.exec(text))) vars.add(m[1]);

  return Array.from(vars);
};

// génère des valeurs aléatoires
const generateVariables = (exo) => {
  const vars = extractVariables(
    (exo.enonce || "") + " " + (exo.correction || "")
  );

  const values = {};
  vars.forEach(v => {
    values[v] = Math.floor(Math.random() * 90) + 10; // 10 → 99
  });

  return values;
};

// remplace {{x}} et \var(x) par les valeurs
const replaceVariables = (text, variables) => {
  let result = text;

  Object.entries(variables).forEach(([v, val]) => {
    result = result
      .replace(new RegExp(`{{${v}}}`, "g"), val)
      .replace(new RegExp(`\\\\var\\(${v}\\)`, "g"), val);
  });

  return result;
};

// évalue une expression mathématique simple
const evaluateExpression = (expr, variables) => {
  let e = expr;

  Object.entries(variables).forEach(([v, val]) => {
    e = e.replaceAll(v, val);
  });

  return Function(`return ${e}`)();
};


/* =========================
   COMPOSANT REACT
========================= */

function Exercices() {
  const [categories, setCategories] = useState([]);
  const [automatismesMap, setAutomatismesMap] = useState({});
  const [categorie, setCategorie] = useState(null);
  const [automatismes, setAutomatismes] = useState([]);
  const [selectedAutomatisme, setSelectedAutomatisme] = useState("");

  const [exercicesBDD, setExercicesBDD] = useState([]);
  const [indexExercice, setIndexExercice] = useState(0);

  const [variablesGen, setVariablesGen] = useState({});
  const [enonceFinal, setEnonceFinal] = useState("");
  const [correctionFinal, setCorrectionFinal] = useState("");

  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  /* --- Chargement catégories / automatismes --- */
  useEffect(() => {
    fetch("http://localhost:3001/automatismes", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setCategories(Object.keys(data));
        setAutomatismesMap(data);
      });
  }, []);

  /* --- Sélection catégorie --- */
  const handleCategorieClick = (cat) => {
    setCategorie(cat);
    setAutomatismes(automatismesMap[cat] || []);
    setSelectedAutomatisme("");
    setExercicesBDD([]);
    setEnonceFinal("");
    setCorrectionFinal("");
    setFeedback("");
  };

  /* --- Sélection automatisme --- */
  const handleAutomatismeChange = async (auto) => {
    setSelectedAutomatisme(auto);
    setFeedback("");
    setUserAnswer("");

    if (!auto) return;

    const res = await fetch(
      `http://localhost:3001/exercices/${encodeURIComponent(auto)}`,
      { credentials: "include" }
    );

    const data = await res.json();
    setExercicesBDD(data);
    afficherExercice(data, 0);
  };

  /* --- Affichage exercice --- */
  const afficherExercice = (list, index) => {
    const exo = list[index];
    if (!exo) return;

    const vars = generateVariables(exo);
    setVariablesGen(vars);

    setEnonceFinal(replaceVariables(exo.enonce, vars));
    setCorrectionFinal(replaceVariables(exo.correction, vars));

    setUserAnswer("");
    setFeedback("");
  };

  /* --- Changement exercice --- */
  const selectExercice = (i) => {
    setIndexExercice(i);
    afficherExercice(exercicesBDD, i);
  };

  /* --- Validation réponse --- */
  const handleSubmit = async () => {
  const exo = exercicesBDD[indexExercice];
  if (!exo || !exo.reponse_expr) {
    setFeedback("❌ Réponse non définie");
    return;
  }

  let expected;
  try {
    expected = evaluateExpression(exo.reponse_expr, variablesGen);
  } catch (err) {
    console.error("Erreur évaluation :", err);
    setFeedback("❌ Erreur dans la réponse attendue");
    return;
  }

  const user = parseFloat(userAnswer.replace(",", "."));
  if (isNaN(user)) {
    setFeedback("❌ Réponse invalide");
    return;
  }

  const correct = Math.abs(user - expected) < 0.01;

  setFeedback(
    correct
      ? "✅ Correct !"
      : `❌ Incorrect. Réponse attendue ≈ ${expected}`
  );

  await fetch("http://localhost:3001/save-result", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correct })
  });
};


  return (
    <div className="exercices-page">
      <h2 className="main-title">📘 Exercices</h2>

      {/* Catégories */}
      <div className="categorie-grid">
        {categories.map(cat => (
          <button
            key={cat}
            className={`categorie-card ${categorie === cat ? "active" : ""}`}
            onClick={() => handleCategorieClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Automatismes */}
      {automatismes.length > 0 && (
        <div className="select-wrapper" style={{ marginTop: "1rem" }}>
          <select
            value={selectedAutomatisme}
            onChange={(e) => handleAutomatismeChange(e.target.value)}
          >
            <option value="">-- Choisir un automatisme --</option>
            {automatismes.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      )}

      {/* Onglets exercices */}
      {exercicesBDD.length > 1 && (
        <div className="methodes-tabs">
          {exercicesBDD.map((_, i) => (
            <button
              key={i}
              className={indexExercice === i ? "active" : ""}
              onClick={() => selectExercice(i)}
            >
              Exercice {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Énoncé */}
      {enonceFinal && (
        <div className="exercise-area">
          <MethodeContent text={enonceFinal} />
        </div>
      )}

      {/* Réponse */}
      {enonceFinal && (
        <div className="input-group">
          <input
            type="text"
            placeholder="Ta réponse"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
          <button onClick={handleSubmit}>✔</button>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`feedback-message ${feedback.startsWith("✅") ? "success" : "error"}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}

export default Exercices;
