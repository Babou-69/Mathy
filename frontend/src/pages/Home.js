import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import MethodeContent from "../components/MethodeContent";

function Home({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentExo, setCurrentExo] = useState(null);
  const [variables, setVariables] = useState({});
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg: '' }

  // --- LOGIQUE DE GÉNÉRATION (Identique à Exercices.js) ---
  const extractVariables = (text) => {
    const matches = text.match(/{{([a-z0-9_]+)}}/g);
    return matches ? [...new Set(matches.map((m) => m.replace(/{{|}}/g, "")))] : [];
  };

  const generateVariables = (exo) => {
    const vars = extractVariables(exo.enonce + " " + (exo.correction || ""));
    const vals = {};
    vars.forEach((v) => {
      vals[v] = Math.floor(Math.random() * 80) + 10;
    });
    // Contrainte x > y pour éviter les résultats négatifs si besoin
    if (vals.x !== undefined && vals.y !== undefined && vals.x < vals.y) {
        [vals.x, vals.y] = [vals.y, vals.x];
    }
    return vals;
  };

  const replaceVars = (text, vals) => {
  if (!text) return "";
  let t = text;
  Object.keys(vals).forEach((v) => {
    // Remplace {{x}}
    t = t.replace(new RegExp(`{{${v}}}`, "g"), vals[v]);
    // Remplace \var(x) en gérant bien l'échappement des caractères spéciaux
    t = t.replace(new RegExp(`\\\\var\\(${v}\\)`, "g"), vals[v]);
  });
  return t;
};

  // --- ACTIONS ---
  const fetchRecommendation = async () => {
    setLoading(true);
    setFeedback(null);
    setUserAnswer("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3001/recommend-exercise", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.automatisme) {
        const resExos = await fetch(`http://localhost:3001/exercices/${encodeURIComponent(data.automatisme)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const exos = await resExos.json();
        const exo = exos[Math.floor(Math.random() * exos.length)];
        
        const vals = generateVariables(exo);
        setCurrentExo(exo);
        setVariables(vals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  // 1. Calcul du résultat attendu
  let expr = replaceVars(currentExo.reponse_expr, variables);
  expr = expr.replace(/\s/g, "").replace(/,/g, ".");

  let expected;
  try {
    // eslint-disable-next-line no-eval
    expected = eval(expr);
    // Arrondi pour éviter les erreurs de flottants (ex: 0.1 + 0.2)
    expected = Math.round(expected * 100) / 100;
  } catch (err) {
    console.error("Erreur eval:", err);
    expected = null;
  }

  // 2. Nettoyage de la réponse utilisateur
  const cleanedUserAnswer = userAnswer.trim().replace(",", ".");
  const userNum = parseFloat(cleanedUserAnswer);

  // 3. Comparaison stricte
  const isCorrect = !isNaN(userNum) && userNum === expected;

  // 4. SAUVEGARDE EN BDD (Important pour que la recommandation évolue !)
  try {
    const res = await fetch("http://localhost:3001/save-result", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        exercice_numero: currentExo.numero,
        exercice_categorie: currentExo.categorie,
        correct: isCorrect,
        duree: 0 // Optionnel
      }),
    });
    
    if (!res.ok) console.error("Erreur lors de la sauvegarde du score");
  } catch (err) {
    console.error("Erreur réseau sauvegarde:", err);
  }

  // 5. Mise à jour du feedback visuel
  setFeedback({
    type: isCorrect ? "success" : "error",
    message: isCorrect 
      ? "Bravo ! C'est la bonne réponse." 
      : `Dommage. La réponse attendue était ${expected}.`,
    correction: replaceVars(currentExo.correction, variables)
  });
};
  return (
    <div className="container" style={{ textAlign: "center", marginTop: "5vh" }}>
      <h1>Bonjour {user} ! 👋</h1>

      {!currentExo ? (
        <div style={{ marginTop: "2rem" }}>
          <button onClick={fetchRecommendation} className="method-link-btn" disabled={loading}>
            {loading ? "Recherche..." : "🚀 Propose-moi un exercice"}
          </button>
        </div>
      ) : (
        <div className="exo-card" style={{ marginTop: "2rem", padding: "30px", border: "2px solid #6c5ce7", borderRadius: "15px", textAlign: "left", backgroundColor: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
             <span className="badge">Cible : {currentExo.automatisme}</span>
             <button onClick={fetchRecommendation} className="refresh-btn">🔄 Autre exercice</button>
          </div>
          
          <h3 style={{ color: "#2d3436" }}>Exercice n°{currentExo.numero}</h3>
          <div style={{ fontSize: "1.2rem", margin: "20px 0" }}>
  <MethodeContent text={replaceVars(currentExo.enonce, variables)} />
</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input 
              type="text" 
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Ta réponse..."
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", flex: 1 }}
              disabled={feedback !== null}
            />
            <button type="submit" className="categorie-card" style={{ margin: 0 }} disabled={feedback !== null}>
              Valider
            </button>
          </form>

          {feedback && (
            <div style={{ 
              padding: "15px", 
              borderRadius: "8px", 
              backgroundColor: feedback.type === 'success' ? '#dff9fb' : '#ffeaed',
              borderLeft: `5px solid ${feedback.type === 'success' ? '#22a6b3' : '#eb4d4b'}`
            }}>
              <p style={{ fontWeight: "bold", margin: 0 }}>{feedback.message}</p>
             <div style={{ marginTop: "10px", fontSize: "0.95rem", fontStyle: "italic" }}>
  <strong>Explication :</strong>
  <MethodeContent text={feedback.correction} />
</div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button onClick={() => navigate("/exercices")} className="categorie-card">📚 Parcourir tout</button>
        <button onClick={() => navigate("/methodes")} className="categorie-card">📖 Fiches méthodes</button>
      </div>
    </div>
  );
}

export default Home;