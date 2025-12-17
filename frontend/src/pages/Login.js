// src/pages/Tests.js
import React, { useState } from "react";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = () => {
  fetch("http://localhost:3001/save-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user,
      password,
    }),
  })
    .then((res) => res.text())
    .then((data) => console.log(data));
};


  return (
    <div className="container">
      <h2>Page d'identification</h2>

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

      <button onClick={handleSubmit}>Soumettre</button>


      <hr />

      <p>Utilisateur : {user}</p>
      <p>Mot de passe : {password}</p>
    </div>
  );
}
