// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Flashcards from "./pages/Flashcards";
import Methode from "./pages/Methode";
import Exercices from "./pages/Exercices";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Stats from "./pages/Stats";
import "./App.css";
import "katex/dist/katex.min.css";

function App() {
  const [logged, setLogged] = useState(false); // connecté ou non
  const [user, setUser] = useState(null); // identifiant de l'utilisateur
  const [score, setScore] = useState(0); // score de l'utilisateur

  // fonction pour login depuis la page Login
  const handleLogin = (userData, userScore) => {
    setLogged(true);
    setUser(userData);
    setScore(userScore);
  };

  // fonction pour logout
  const handleLogout = () => {
    setLogged(false);
    setUser(null);
    setScore(0);
  };

  // fonction pour signup depuis Register
  const handleRegister = (userData) => {
    setLogged(true);
    setUser(userData);
    setScore(0);
  };

  // fonction pour incrémenter le score (ou n'importe quelle autre action)
  const incrementScore = () => {
    setScore(prev => prev + 1);
  };

  // redirection forcée si non connecté
  const RequireAuth = ({ children }) => {
    return logged ? children : <Navigate to="/login" replace />;
  };
  useEffect(() => {
  // Au chargement de l'app, on demande au serveur si l'utilisateur est connecté
  fetch("http://localhost:3001/me", {
    credentials: "include" // très important pour envoyer le cookie de session
  })
    .then(res => res.json())
    .then(data => {
      if (data.logged) {
        setLogged(true);
        setUser(data.user);
        // tu peux aussi récupérer le score si tu veux
        // setScore(data.score || 0);
      }
    })
    .catch(err => console.error("Erreur récupération session :", err));
}, []);


  return (
    <Router>
      <div className="App">
        {logged && <Navbar onLogout={handleLogout} />} {/* Navbar seulement si connecté */}
        <main className="app-main">
          <Routes>
            {/* Routes accessibles uniquement si connecté */}
            <Route
  path="/methodes"
  element={
    <RequireAuth>
      <Methode score={score} incrementScore={incrementScore} />
    </RequireAuth>
  }
/>

            <Route
              path="/flashcards"
              element={
                <RequireAuth>
                  <Flashcards score={score} incrementScore={incrementScore} />
                </RequireAuth>
              }
            />
            <Route
  path="/Exercices"
  element={
    <RequireAuth>
      <Exercices user={user} />
    </RequireAuth>
  }
/>
            <Route
              path="/stats"
              element={
                <RequireAuth>
                  <Stats user={user} />
                </RequireAuth>
              }
            />

            {/* Routes login / register */}
            <Route
              path="/login"
              element={<Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={<Register onRegister={handleRegister} />}
            />

            {/* Redirection par défaut */}
            <Route
              path="*"
              element={<Navigate to={logged ? "/" : "/login"} replace />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
