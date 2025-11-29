// src/components/Navbar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const loc = useLocation();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="brand">📘 Appli Révisions</div>
        <nav className="nav-links">
          <Link className={loc.pathname === "/" ? "active" : ""} to="/">
            Résumé
          </Link>
          <Link
            className={loc.pathname === "/flashcards" ? "active" : ""}
            to="/flashcards"
          >
            Flashcards
          </Link>
          <Link
            className={loc.pathname === "/tests" ? "active" : ""}
            to="/tests"
          >
            Tests
          </Link>
          <Link
            className={loc.pathname === "/stats" ? "active" : ""}
            to="/stats"
          >
            Statistiques
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
