const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ===== SQLITE =====
const db = new sqlite3.Database("BDD1.db");


app.post("/register", (req, res) => {
  const { user, password } = req.body;

  // Vérifier si l'utilisateur existe déjà
  db.get(
    "SELECT * FROM Utilisateur WHERE identifiant = ?",
    [user],
    (err, row) => {
      if (row) {
        return res.status(400).json({ message: "Utilisateur déjà existant" });
      }

      db.run(
        "INSERT INTO Utilisateur (identifiant, mot_de_passe) VALUES (?, ?)",
        [user, password],
        (err) => {
          if (err) {
            return res.status(500).json({ message: "Erreur DB" });
          }
          res.json({ message: "Compte créé avec succès" });
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  const { user, password } = req.body;

  db.get(
    "SELECT * FROM Utilisateur WHERE identifiant = ? AND mot_de_passe = ?",
    [user, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Erreur DB" });
      }

      if (!row) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      res.json({ message: "Connexion réussie" });
    }
  );
});

app.get("/stats/:user", (req, res) => {
  const user = req.params.user;

  db.all(
    `SELECT * FROM Utilisateur
     WHERE identifiant = ?`,
    [user],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

app.post("/save-result", (req, res) => { //Pour l'instant, ne sert à rien, mais vise à aller chercher les infos dans la BDD
  const { user, categorie, correct } = req.body;

  db.get(
    `SELECT * FROM Utilisateur
     WHERE identifiant = ?`,
    [user],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur DB" });
      }

      if (row) {
        db.run(
          `UPDATE Utilisateur
           SET
             nbr_exs_faits = nbr_exs_faits + 1,
             nbr_exs_reussis = nbr_exs_reussis + ?,
           WHERE identifiant = ?`,
          [correct ? 1 : 0, user]
        );
      } else {
        
      }
    }
  );

  res.json({ message: "Progression enregistrée" });
});


app.listen(PORT, () => {
  console.log("Serveur lancé sur http://localhost:" + PORT);
});
