// src/pages/Login.js
import React, { useState } from "react";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user, password }),
    })
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage("Erreur serveur"));
  };

  return (
    <div className="container">
      <h2>Connexion</h2>

      <input
        type="text"
        placeholder="Utilisateur"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Se connecter</button>

      <p>{message}</p>
    </div>
  );
}
