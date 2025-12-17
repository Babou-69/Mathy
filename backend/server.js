// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose(); // <- Ici on importe sqlite

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ======= PARTIE SQLITE =======

// Ouvre ou crée la DB
const db = new sqlite3.Database("users.db");

// Crée la table si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  password TEXT
)`);

// POST /save-user
app.post("/save-user", (req, res) => {
  const { user, password } = req.body;

  db.run(
    `INSERT INTO users (user, password) VALUES (?, ?)`,
    [user, password],
    function (err) {
      if (err) {
        return res.status(500).send("Erreur lors de l'écriture en DB");
      }
      res.send("Utilisateur enregistré en DB !");
    }
  );
});

// ======= FIN SQLITE =======

app.listen(PORT, () => {
  console.log("Serveur lancé sur http://localhost:" + PORT);
});
