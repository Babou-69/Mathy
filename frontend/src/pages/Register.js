// src/pages/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register({ onRegister }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3001/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      // Appelle le callback pour mettre à jour App.js
      onRegister(user);

      // Redirige vers la page principale
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Impossible de se connecter au serveur");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Identifiant"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">S'inscrire</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Déjà un compte ?{" "}
  <button onClick={() => navigate("/login")}>
    Se connecter
  </button>
</p>
    </div>
  );
}

export default Register;
