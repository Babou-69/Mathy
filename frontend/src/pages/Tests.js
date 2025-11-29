// src/pages/Tests.js
import React, { useState, useEffect } from "react";
import "../styles/Tests.css";

//  Générateurs d'exercices par catégorie , à modifier quand on stockera des énoncées dans la database et on génèerera en python pour être sur d'avoir des résultats calculable de tête (ces exos bateaux sont généré par IA pour l'instant, ce référé aux cahier des charges pour voir ce qu'on implémentera pour le MVP)
function generateExercise(category) {
  switch (category) {
    case "Calcul numérique": {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const op = ["+", "-", "×", "÷"][Math.floor(Math.random() * 4)];
      let question, answer;
      switch (op) {
        case "+": question = `${a} + ${b}`; answer = a + b; break;
        case "-": question = `${a} - ${b}`; answer = a - b; break;
        case "×": question = `${a} × ${b}`; answer = a * b; break;
        case "÷": question = `${a * b} ÷ ${b}`; answer = a; break;
        default: question = ""; answer = 0;
      }
      return { question: `Calcule : ${question}`, answer };
    }

    case "Calcul littéral": {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 5) + 1;
      return {
        question: `Développe : ${a}(x + ${b})`,
        answer: `${a}x + ${a * b}`,
      };
    }

    case "Équations / Inéquations": {
      const a = Math.floor(Math.random() * 8) + 2;
      const x = Math.floor(Math.random() * 10);
      const b = Math.floor(Math.random() * 8);
      const c = a * x + b;
      return {
        question: `Résous : ${a}x + ${b} = ${c}`,
        answer: `${x}`,
      };
    }

    case "Fonctions": {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 10);
      const x = Math.floor(Math.random() * 5) + 1;
      const fx = a * x + b;
      return {
        question: `f(x) = ${a}x + ${b}. Calcule f(${x}).`,
        answer: fx,
      };
    }

    case "Dérivation": {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5);
      return {
        question: `Si f(x) = ${a}x² + ${b}x, calcule f'(x).`,
        answer: `${2 * a}x + ${b}`,
      };
    }

    case "Statistiques & Probabilités": {
      const n = 10;
      const question = `Une pièce est lancée ${n} fois. Quelle est la probabilité d'obtenir pile à chaque lancer ?`;
      const answer = Math.pow(0.5, n).toFixed(4);
      return { question, answer };
    }

    case "Géométrie analytique": {
      const x1 = Math.floor(Math.random() * 10);
      const y1 = Math.floor(Math.random() * 10);
      const x2 = Math.floor(Math.random() * 10);
      const y2 = Math.floor(Math.random() * 10);
      const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2).toFixed(2);
      return {
        question: `Calcule la distance entre A(${x1}, ${y1}) et B(${x2}, ${y2}).`,
        answer: d,
      };
    }

    default:
      return { question: "Choisis une catégorie pour commencer.", answer: null };
  }
}

function Tests() {
  const categories = [
    "Calcul numérique",
    "Calcul littéral",
    "Équations / Inéquations",
    "Fonctions",
    "Dérivation",
    "Statistiques & Probabilités",
    "Géométrie analytique",
  ];

  const [category, setCategory] = useState(categories[0]);
  const [exercise, setExercise] = useState(generateExercise(categories[0]));
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [scores, setScores] = useState(() => {
  // Chargement avec localStorage, à modifier quand on aura la database 
  try {
    const saved = localStorage.getItem("scores");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});

  //  Sauvegarde des scores, attention, ici c'est localstorage, à modifier
  useEffect(() => {
    localStorage.setItem("scores", JSON.stringify(scores));
  }, [scores]);

  // Génère un nouvel exercice
  const handleGenerate = () => {
    setExercise(generateExercise(category));
    setUserAnswer("");
    setFeedback("");
  };

  // Validation de la réponse, à modifier pour prendre plusieurs format de reponse (fraction / décimale)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exercise.answer) return;

    const correct =
      typeof exercise.answer === "number"
        ? Math.abs(Number(userAnswer) - exercise.answer) < 0.001
        : userAnswer.trim() === String(exercise.answer).trim();

    setFeedback(
      correct
        ? "✅ Bonne réponse !"
        : `❌ Mauvaise réponse. Solution : ${exercise.answer}`
    );

    // Mise à jour des scores
    setScores((prev) => {
      const prevStats = prev[category] || { correct: 0, total: 0 };
      return {
        ...prev,
        [category]: {
          correct: prevStats.correct + (correct ? 1 : 0),
          total: prevStats.total + 1,
        },
      };
    });
  };

  // Calcul du taux de réussite pour l'afficher dans la page statistique, à modifier, il faut aussi enregistrer le jour de sauvegarde de ces données pour pouvoir afficher une progression dans le temps
  const getSuccessRate = (cat) => {
    const stat = scores[cat];
    if (!stat || stat.total === 0) return "–";
    return `${Math.round((stat.correct / stat.total) * 100)}%`;
  };

  // Réinitialisation manuelle, utile quand on développe mais à enlever pour le MVP
  const handleResetScores = () => {
    localStorage.removeItem("scores");
    setScores({});
  };

  return (
    <div className="container tests-page">
      <h2>Exercices d’automatismes – Première</h2>

      {/* Sélecteur de catégorie */}
      <div className="category-selector">
        <label htmlFor="category">Catégorie :</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={handleGenerate}>Générer un exercice</button>
      </div>

      {/* Carte d'exercice */}
      <div className="exercise-card">
        <h3>{exercise.question}</h3>
        <form onSubmit={handleSubmit} className="exercise-form">
          <input
            type="text"
            placeholder="Ta réponse"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            required
          />
          <button type="submit">Valider</button>
        </form>
        {feedback && <p className="feedback">{feedback}</p>}
      </div>

      {/* Tableau de scores (qui pourrait n'enregistrer que les score du jour ? à voir)*/} 
      <h3 style={{ marginTop: "2rem" }}>📊 Statistiques personnelles</h3>
      <table className="score-table"> 
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Taux de réussite</th> 
            <th>Réponses correctes</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const stat = scores[cat] || { correct: 0, total: 0 };
            return (
              <tr key={cat}>
                <td>{cat}</td>
                <td>{getSuccessRate(cat)}</td>
                <td>{stat.correct}</td>
                <td>{stat.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button className="reset-btn" onClick={handleResetScores}>
        🔄 Réinitialiser les scores 
      </button> 
    </div>
  );
}

export default Tests;
