// src/pages/Stats.js
import React, { useEffect, useState, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../App.css";

function Stats() {
  const [stats, setStats] = useState([]);
  const [globalData, setGlobalData] = useState({ total: 0, correct: 0 });
  const [message, setMessage] = useState("");

  const pdfRef = useRef(); 

  useEffect(() => {
    const user = localStorage.getItem("user"); // ou une variable user provenant de App.js

    if (!user) return;

    fetch(`http://localhost:3001/stats/${user}`)
  .then((res) => res.json())
  .then((data) => {
    // data est un tableau avec 1 objet : l'utilisateur
    if (data.length === 0) return;

    const userStats = data[0];

    // On peut créer un tableau "categories" factices pour les graphiques
    const formatted = [
      {
        category: "Exercices faits",
        correct: userStats.nbr_exs_reussis,
        total: userStats.nbr_exs_faits,
        rate: userStats.nbr_exs_faits
          ? Math.round((userStats.nbr_exs_reussis / userStats.nbr_exs_faits) * 100)
          : 0,
      },
      {
        category: "Examens blancs",
        correct: userStats.nbr_exams_blancs_faits, // si tu as nbr_exams_blancs_reussis, tu peux faire un taux
        total: userStats.nbr_exams_blancs_faits,
        rate: 100, // si on ne connaît pas les réussites, on met 100%
      },
    ];

    setStats(formatted);

    // Calcul global
    const total = formatted.reduce((a, c) => a + c.total, 0);
    const correct = formatted.reduce((a, c) => a + c.correct, 0);
    setGlobalData({ total, correct });
  })
  .catch((err) => console.error("Erreur fetch stats :", err));

  }, []);

  const COLORS = [
    "#4caf50",
    "#f44336",
    "#2196f3",
    "#ff9800",
    "#9c27b0",
    "#009688",
    "#795548",
  ];

  // Export PDF
  const handleExportPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString();

    pdf.setFontSize(22);
    pdf.text("Rapport de révision", 20, 40);
    pdf.setFontSize(14);
    pdf.text(`Nom : ${localStorage.getItem("user") || "Utilisateur"}`, 20, 60);
    pdf.text(`Date du rapport : ${today}`, 20, 70);

    pdf.addPage();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);

    pdf.save(`rapport_revision_${today.replaceAll("/", "-")}.pdf`);
  };

  const pieData = stats.map((s) => ({
    name: s.category,
    value: s.correct,
  }));

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "1rem" }}>
      <h2>📊 Statistiques générales</h2>

      {stats.length === 0 ? (
        <p>Aucune donnée enregistrée pour le moment.</p>
      ) : (
        <>
          <div ref={pdfRef}>
            {/* Graphique global */}
            <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
              <h3>Taux de réussite global</h3>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique en barres */}
            <div style={{ width: "100%", height: 350 }}>
              <h3>Taux de réussite par catégorie</h3>
              <ResponsiveContainer>
                <BarChart
                  data={stats}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#4caf50" name="Taux de réussite (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tableau récapitulatif */}
            <h3 style={{ marginTop: "2rem" }}>Résumé chiffré</h3>
            <table className="score-table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Taux de réussite</th>
                  <th>Réussies</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={i}>
                    <td>{s.category}</td>
                    <td>{s.rate}%</td>
                    <td>{s.correct}</td>
                    <td>{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Données globales */}
            <div style={{ marginTop: "1.5rem" }}>
              <p>
                <strong>Total d’exercices réalisés :</strong> {globalData.total}
              </p>
              <p>
                <strong>Total de réussites :</strong> {globalData.correct}
              </p>
              <p>
                <strong>Taux de réussite global :</strong>{" "}
                {globalData.total > 0
                  ? Math.round((globalData.correct / globalData.total) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Boutons d’action */}
          <div style={{ marginTop: "2rem" }}>
            <button
              onClick={handleExportPDF}
              style={{
                background: "#2196f3",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "1rem",
                marginRight: "0.5rem",
              }}
            >
              📄 Exporter en PDF
            </button>
          </div>
        </>
      )}

      {message && (
        <p style={{ color: "#4caf50", marginTop: "1rem", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Stats;
