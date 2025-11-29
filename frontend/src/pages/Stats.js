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

  const pdfRef = useRef(); // 🔹 Référence à la section à exporter

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem("scores")) || {};
    const formatted = Object.entries(scores).map(([cat, val]) => ({
      category: cat,
      correct: val.correct,
      total: val.total,
      rate: val.total ? Math.round((val.correct / val.total) * 100) : 0,
    }));

    const total = formatted.reduce((acc, c) => acc + c.total, 0);
    const correct = formatted.reduce((acc, c) => acc + c.correct, 0);

    setStats(formatted);
    setGlobalData({ total, correct });
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

  const handleReset = () => {
    localStorage.removeItem("scores");
    setStats([]);
    setGlobalData({ total: 0, correct: 0 });
    setMessage("✅ Données statistiques réinitialisées !");
    setTimeout(() => setMessage(""), 3000);
  };

  // ✅ Fonction d’export PDF avec page de couverture
const handleExportPDF = async () => {
  const input = pdfRef.current;
  if (!input) return;

  // Capture du contenu principal (graphiques + tableau)
  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  // Initialisation du PDF
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString();

  // 🔹 PAGE 1 : Couverture
  pdf.setFontSize(22);
  pdf.text("Rapport de révision", 20, 40);

  pdf.setFontSize(14);
  pdf.text(`Nom : Milan`, 20, 60); // ✅ Plus tard remplacé par user.username
  pdf.text(`Date du rapport : ${today}`, 20, 70);

  pdf.setFontSize(12);
  pdf.text("Application : Révisions - Première", 20, 85);
  pdf.text("Contenu :", 20, 100);
  pdf.text("- Statistiques globales", 25, 110);
  pdf.text("- Taux de réussite par catégorie", 25, 118);
  pdf.text("- Tableau récapitulatif", 25, 126);

  // Ligne décorative
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.5);
  pdf.line(20, 135, 190, 135);

  pdf.setFontSize(10);
  pdf.text("Généré automatiquement depuis ton application de révision", 20, 150);

  // Saut de page
  pdf.addPage();

  // 🔹 PAGE 2 : Graphiques + tableaux
  const imgProps = pdf.getImageProperties(imgData);
  const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
  pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);

  // Sauvegarde du fichier
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
          {/* 🔹 SECTION À EXPORTER EN PDF */}
          <div ref={pdfRef}>
            {/* --- Graphique global --- */}
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

            {/* --- Graphique à barres --- */}
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

            {/* --- Tableau récapitulatif --- */}
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

            {/* --- Données globales --- */}
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

          {/* --- Boutons d’action --- */}
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

            <button
              onClick={handleReset}
              style={{
                background: "#f44336",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Réinitialiser les données
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
