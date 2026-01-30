const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3001;
const session = require("express-session");

app.use(session({
  secret: "SECRET_KEY_A_CHANGER",
  resave: false,
  saveUninitialized: false, // 👈 important
  cookie: {
    secure: false,
    sameSite: "lax"
  }
}));


app.use(cors({
  origin: "http://localhost:3000", // URL du frontend
  credentials: true
}));

app.use(express.json());

// ===== SQLITE =====
const db = new sqlite3.Database("BDD1.db");

// Middleware pour vérifier si l'utilisateur est connecté
const auth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Non connecté" });
  }
  next();
};

const normalize = (str) =>
  str
    .normalize("NFD")                // enlève les accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/’/g, "'")              // apostrophes typographiques
    .replace(/\s+/g, " ")            // espaces multiples
    .trim()
    .toLowerCase();


app.post("/login", (req, res) => {
  const { user, password } = req.body; // user = identifiant envoyé par le frontend

  db.get("SELECT * FROM Utilisateur WHERE identifiant = ?", [user], (err, dbUser) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!dbUser) return res.status(401).json({ error: "Utilisateur introuvable" });
    if (dbUser.mot_de_passe !== password) return res.status(401).json({ error: "Mot de passe incorrect" });

    req.session.userId = dbUser.id; // ici on prend l'id de la base
    res.json({ success: true, score: dbUser.score || 0 }); // si tu as une colonne score
  });
});

app.get("/methode/:automatisme", (req, res) => {
  const autoClient = normalize(req.params.automatisme);

  db.all(
    "SELECT automatisme, contenu, exemple FROM Methode",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const resultats = rows.filter(
        (r) => normalize(r.automatisme) === autoClient
      );

      if (resultats.length === 0) {
        return res.status(404).json({ error: "Méthode introuvable" });
      }

      res.json(resultats);
    }
  );
});




// SIGNUP
app.post("/register", (req, res) => {
  const { user, password } = req.body;

  db.get("SELECT * FROM Utilisateur WHERE identifiant = ?", [user], (err, dbUser) => {
    if (err) return res.status(500).json({ error: err.message });
    if (dbUser) return res.status(400).json({ error: "Utilisateur déjà existant" });

    db.run(
      "INSERT INTO Utilisateur (identifiant, mot_de_passe) VALUES (?, ?)",
      [user, password],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        req.session.userId = this.lastID;
        res.json({ success: true, score: 0 });
      }
    );
  });
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

app.post("/save-result", (req, res) => {
  console.log("BODY REÇU :", req.body);

  const { user, correct } = req.body;

  if (!user) {
    return res.status(400).json({ message: "Utilisateur manquant" });
  }

  db.get(
    `SELECT * FROM Utilisateur WHERE identifiant = ?`,
    [user],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur DB" });
      }

      if (!row) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }

      db.run(
        `UPDATE Utilisateur
         SET
           nbr_exs_faits = nbr_exs_faits + 1,
           nbr_exs_reussis = nbr_exs_reussis + ?
         WHERE identifiant = ?`,
        [correct ? 1 : 0, user],
        function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur mise à jour" });
          }

          res.json({ message: "Progression enregistrée" });
        }
      );
    }
  );
});

app.post("/increment-score", auth, (req, res) => {
  const userId = req.session.userId;
  db.run(
    "UPDATE Utilisateur SET nbr_exs_faits = nbr_exs_faits + 1 WHERE identifiant = ?",
    [userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT nbr_exs_faits FROM users WHERE identifiant = ?", [userId], (err, row) => {
        res.json({ success: true, score: row.nbr_exs_faits });
      });
    }
  );
});

app.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.json({ logged: false });
  }

  db.get(
    "SELECT identifiant FROM Utilisateur WHERE id = ?",
    [req.session.userId],
    (err, row) => {
      if (err || !row) {
        return res.json({ logged: false });
      }

      res.json({
        logged: true,
        user: row.identifiant
      });
    }
  );
});

app.get("/exercices/:automatisme", (req, res) => {
  const autoClient = normalize(req.params.automatisme);

  db.all(
    `SELECT * FROM Exercices`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const resultats = rows.filter(
  (r) => normalize(r.automatisme) === autoClient
);



      if (resultats.length === 0) {
        return res.status(404).json({ error: "Exercices introuvables" });
      }

      res.json(resultats);
    }
  );
});


// Récupérer tous les automatismes par catégorie
// Récupérer tous les automatismes par catégorie (avec mapping des IDs vers noms)
app.get("/automatismes", (req, res) => {
  const categoriesMap = {
    1: "Calcul numérique et algébrique",
    2: "Proportions et pourcentages",
    3: "Évolutions et variations"
  };

  db.all(
    `SELECT * FROM Exercices ORDER BY categorie, automatisme`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Transformation en map catégorie → liste d'automatismes
      const map = {};
      rows.forEach(r => {
  const cat = categoriesMap[r.categorie] || "Autres";
  if (!map[cat]) map[cat] = [];
  if (!map[cat].includes(r.automatisme) && r.automatisme) {
    map[cat].push(r.automatisme);
  }
});


      res.json(map);
    }
  );
});


app.listen(PORT, () => {
  console.log("Serveur lancé sur http://localhost:" + PORT);
});
