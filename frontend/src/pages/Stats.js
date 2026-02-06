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

function Stats({ user }) {
  const [stats, setStats] = useState([]);
  const [globalData, setGlobalData] = useState({ total: 0, correct: 0 });
  const [message, setMessage] = useState("");

  const pdfRef = useRef();

  // ... (imports)
useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");

    fetch("http://localhost:3001/stats", {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
        if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            window.location.href = "/login"; // Force le reload
            return;
        }
        return res.json();
    })
    .then((data) => {
  if (!data || data.length === 0) {
    setStats([]);
    setGlobalData({ total: 0, correct: 0 });
    return;
  }

  // On définit les labels de manière robuste
  const CATEGORY_LABELS = {
    1: "Proportions et pourcentages",
    2: "Évolutions et variations",
    3: "Calcul numérique et algébrique",
  };

  const formatted = data.map((d) => ({
    // On s'assure que d.category est traité comme une clé (nombre ou string)
    category: CATEGORY_LABELS[d.category] || `Catégorie ${d.category}`,
    total: Number(d.total) || 0,
    correct: Number(d.correct) || 0,
    rate: Number(d.rate) || 0,
  }));

  console.log("Données formatées pour Recharts :", formatted); // Vérifie la console du navigateur
  setStats(formatted);

  const total = formatted.reduce((a, c) => a + c.total, 0);
  const correct = formatted.reduce((a, c) => a + c.correct, 0);
  setGlobalData({ total, correct });
})
    .catch(() => setMessage("Erreur de connexion aux statistiques."));
}, [user]);

  const COLORS = [
    "#4caf50",
    "#f44336",
    "#2196f3",
    "#ff9800",
    "#9c27b0",
    "#009688",
    "#795548",
  ];

  const pieData = stats.map((s) => ({
    name: s.category,
    value: s.correct,
  }));

  // --- export PDF inchangé ---
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
    pdf.text(`Nom : ${user || "Utilisateur"}`, 20, 60);
    pdf.text(`Date du rapport : ${today}`, 20, 70);

    pdf.addPage();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);

    pdf.save(`rapport_revision_${today.replaceAll("/", "-")}.pdf`);
  };

  return (
    <div
      className="container"
      style={{ textAlign: "center", marginTop: "1rem" }}
    >
      <h2>📊 Statistiques générales</h2>

      {stats.length === 0 ? (
        <p>Aucune donnée enregistrée pour le moment.</p>
      ) : (
        <>
          <div ref={pdfRef}>
            {/* --- Graphique circulaire --- */}
            <h3>Taux de réussite par catégorie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* --- Graphique en barres --- */}
            <h3>Résultats détaillés</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="correct" fill="#4caf50" name="Réussites" />
                <Bar dataKey="total" fill="#f44336" name="Tentatives" />
              </BarChart>
            </ResponsiveContainer>

            {/* --- Résumé global --- */}
            <h3>Résumé global</h3>
            <p>
              Total tentatives : <strong>{globalData.total}</strong>
            </p>
            <p>
              Total réussites : <strong>{globalData.correct}</strong>
            </p>
            <p>
              Taux global :{" "}
              <strong>
                {globalData.total
                  ? Math.round(
                      (globalData.correct / globalData.total) * 100
                    )
                  : 0}
                %
              </strong>
            </p>
          </div>

          <button onClick={handleExportPDF} style={{ marginTop: "1rem" }}>
            📄 Exporter en PDF
          </button>
        </>
      )}

      {message && (
        <p
          style={{
            color: "#f44336",
            marginTop: "1rem",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default Stats;
