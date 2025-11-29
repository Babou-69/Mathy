// src/pages/Flashcards.js
import React, { useState, useRef, useEffect } from "react";
import flashcardsData from "../data/flashcards.json";
import "../styles/Flashcards.css";

function Flashcards() {
  const [deck, setDeck] = useState(flashcardsData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [mastered, setMastered] = useState(() => {
    return JSON.parse(localStorage.getItem("mastered")) || [];
  });
  const [toReview, setToReview] = useState(() => {
    return JSON.parse(localStorage.getItem("toReview")) || [];
  });

  const [posX, setPosX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const movedRef = useRef(0);
  const animatingRef = useRef(false);

  const THRESHOLD = 120;
  const SWIPE_OUT_DIST = 1200;

  const card = deck[currentIndex];

  /* --- Sauvegarde automatique --- */
  useEffect(() => {
    localStorage.setItem("mastered", JSON.stringify(mastered));
    localStorage.setItem("toReview", JSON.stringify(toReview));
  }, [mastered, toReview]);

  /* --- Effet vibration sur mobile --- */
  const vibrate = (duration = 40) => {
    if (window.navigator.vibrate) window.navigator.vibrate(duration);
  };

  const handleFlip = () => {
    if (isDragging || Math.abs(movedRef.current) > 10 || animatingRef.current) return;
    setFlipped((f) => !f);
  };

  const handleDragStart = (e) => {
    if (animatingRef.current) return;
    setIsDragging(true);
    movedRef.current = 0;
    startXRef.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const delta = clientX - startXRef.current;
    movedRef.current = delta;
    setPosX(delta);
  };

  const finalizeSwipe = (direction) => {
    animatingRef.current = true;
    setIsSwiping(true);
    const offX = direction === "right" ? SWIPE_OUT_DIST : -SWIPE_OUT_DIST;

    if (direction === "right") {
      setMastered((prev) => [...prev, card]);
    } else {
      setToReview((prev) => [...prev, card]);
    }

    vibrate(35); // petite vibration
    setPosX(offX);

    setTimeout(() => {
      animatingRef.current = false;
      setIsSwiping(false);
      setPosX(0);
      setFlipped(false);

      // Recharger un nouveau deck à la fin
      if (currentIndex + 1 >= deck.length) {
        if (toReview.length > 0 || direction === "left") {
          const newDeck =
            direction === "left" ? [...toReview, card] : toReview;
          setDeck(newDeck);
          setToReview([]);
          setCurrentIndex(0);
        } else {
          alert("🎉 Tu as fini toutes les cartes !");
          setDeck(flashcardsData);
          setMastered([]);
          setCurrentIndex(0);
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (posX > THRESHOLD) {
      finalizeSwipe("right");
    } else if (posX < -THRESHOLD) {
      finalizeSwipe("left");
    } else {
      setPosX(0);
      movedRef.current = 0;
    }
  };

  const handleNext = () => {
    if (animatingRef.current) return;
    setFlipped(false);
    setPosX(0);
    if (currentIndex + 1 >= deck.length) alert("Fin du deck !");
    else setCurrentIndex((p) => p + 1);
  };

  const handlePrev = () => {
    if (animatingRef.current) return;
    setFlipped(false);
    setPosX(0);
    setCurrentIndex((p) => (p === 0 ? deck.length - 1 : p - 1));
  };

  const styleCard = {
    transform: `translateX(${posX}px) rotate(${posX / 20}deg) scale(${isSwiping ? 0.9 : 1})`,
    transition: isDragging || animatingRef.current ? "none" : "transform 0.3s ease",
    opacity: isSwiping ? 0.7 : 1,
  };

  if (!card)
    return (
      <div className="container">
        <h2 style={{ padding: "2rem" }}>Aucune carte disponible</h2>
      </div>
    );

  return (
    <div className="container">
      <div className="flashcards-container">
        <div
          className={`flashcard ${flipped ? "flipped" : ""}`}
          onClick={handleFlip}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => (isDragging ? handleDragEnd() : null)}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={styleCard}
        >
          <div className="flashcard-inner">
            {/* Badges */}
            <div
              className="badge mastered"
              style={{ opacity: posX > 20 ? Math.min(1, posX / 140) : 0 }}
            >
              MAÎTRISÉ
            </div>
            <div
              className="badge review"
              style={{ opacity: posX < -20 ? Math.min(1, -posX / 140) : 0 }}
            >
              À REVOIR
            </div>

            {/* Faces */}
            <div className="flashcard-front">
              <h3>{card.question}</h3>
            </div>
            <div className="flashcard-back">
              <p>{card.answer}</p>
            </div>
          </div>
        </div>

        <div className="flashcard-controls">
          <button onClick={handlePrev}>◀ Précédent</button>
          <div className="counter">
            {currentIndex + 1}/{deck.length}
          </div>
          <button onClick={handleNext}>Suivant ▶</button>
        </div>

        <div className="progress-summary" aria-hidden>
          <small>
            Maîtrisées : {mastered.length} • À revoir : {toReview.length}
          </small>
        </div>
      </div>
    </div>
  );
}

export default Flashcards;
