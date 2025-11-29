// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Flashcards from "./pages/Flashcards";
import Resume from "./pages/Resume";
import Tests from "./pages/Tests";
import "./App.css";
import Stats from "./pages/Stats";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Resume />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/stats" element={<Stats />} /> {/* nouvelle page */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
