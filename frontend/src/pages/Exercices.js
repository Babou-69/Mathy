// src/pages/Exercices.js
import React, { useState, useEffect } from "react";
import MethodeContent from "../components/MethodeContent";
import "../styles/Exercices.css";
import { useNavigate } from "react-router-dom";


/* =========================
   FONCTIONS UTILITAIRES
========================= */

const injectVariablesInLatex = (latex, variables) => {
  let result = latex;
  Object.entries(variables).forEach(([v, val]) => {
    const re = new RegExp(`\\\\var\\(${v}\\)`, "g");
    result = result.replace(re, val);
  });
  return result;
};


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
  const vars = extractVariables(exo.enonce + " " + (exo.correction || ""));
  const values = {};

  // 1️⃣ Génération par défaut pour TOUTES les variables
  vars.forEach(v => {
    values[v] = Math.floor(Math.random() * 90) + 10;
  });

  // 2️⃣ Règles de cohérence (appliquées après)
  // x ≤ y (effectifs, proportions)
  if (values.x !== undefined && values.y !== undefined) {
    if (values.x > values.y) {
      [values.x, values.y] = [values.y, values.x];
    }
  }

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

// transforme une réponse utilisateur en nombre
// accepte : 12.5 | 12,5 | 3/4 | 1,5/2
const parseUserAnswer = (input) => {
  if (!input) return NaN;

  let s = input.trim();

  // remplace virgule par point
  s = s.replace(",", ".");

  // fraction ?
  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length !== 2) return NaN;

    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);

    if (isNaN(num) || isNaN(den) || den === 0) return NaN;

    return num / den;
  }

  // nombre simple
  return parseFloat(s);
};


const isAnswerCorrect = (userValue, expectedValue) => {
  if (isNaN(userValue) || isNaN(expectedValue)) return false;

  // tolérance absolue
  if (Math.abs(userValue - expectedValue) < 0.01) return true;

  // tolérance relative (1%)
  if (Math.abs(userValue - expectedValue) / Math.abs(expectedValue) < 0.01) {
    return true;
  }

  return false;
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
  const navigate = useNavigate();


  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const isCloseEnough = (user, expected) => {
  if (expected === 0) return Math.abs(user) < 0.01;

  // tolérance relative 1 %
  if (Math.abs(user - expected) / Math.abs(expected) < 0.01) return true;

  // tolérance absolue minimale
  if (Math.abs(user - expected) < 0.01) return true;

  return false;
};


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
    setCorrectionFinal("");
    setFeedback("");
    setUserAnswer("");
  };

  /* --- Changement exercice --- */
  const selectExercice = (i) => {
    setIndexExercice(i);
    afficherExercice(exercicesBDD, i);
  };

  /* --- Validation réponse --- */
   const handleSubmit = async () => {
  const exo = exercicesBDD[indexExercice];

  const expr =
    exo?.reponse_expr ||
    exo?.reponse ||
    exo?.expression_reponse;

  if (!exo || !expr) {
    setFeedback("❌ Correction automatique indisponible pour cet exercice");
    return;
  }

    try {
      const expected = evaluateExpression(exo.reponse_expr, variablesGen);
      const userVal = parseUserAnswer(userAnswer);

if (isNaN(userVal)) {
  setFeedback("❌ Réponse invalide (nombre ou fraction attendue)");
  return;
}


      const correct = isCloseEnough(userVal, expected);
      setFeedback(correct ? "✅ Correct !" : "❌ Incorrect");

      if (!correct) {
        setCorrectionFinal(replaceVariables(exo.correction, variablesGen));
      }

      await fetch("http://localhost:3001/save-result", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correct
        })
      });

    } catch (e) {
      setFeedback("❌ Erreur dans la correction");
    }
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
          className={`exercice-tab ${indexExercice === i ? "active" : ""}`}
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

      {feedback.startsWith("❌") && correctionFinal && (
  <div className="correction-box">
    <h4>Correction détaillée</h4>
    <MethodeContent text={correctionFinal} />

    <button
      className="method-link-btn"
      onClick={() =>
        navigate(
          `/methodes?automatisme=${encodeURIComponent(
            exercicesBDD[indexExercice].automatisme
          )}`
        )
      }
    >
      📘 Revoir la méthode correspondante
    </button>
  </div>
)}

    </div>
  );
}

export default Exercices;
