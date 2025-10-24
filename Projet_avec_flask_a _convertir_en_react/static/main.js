
const select = document.getElementById('exo-select');
const generateBtn = document.getElementById('generate-btn');
const output = document.getElementById('output');
const objectifEl = document.getElementById('objectif');

function renderMath() {
  if (window.MathJax) {
    if (MathJax.typesetPromise) {
      MathJax.typesetPromise([output]).catch(e => console.warn('MathJax', e));
    } else if (MathJax.Hub && MathJax.Hub.Queue) {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, output]);
    }
  }
}

async function renderExercise(exo) {
  output.innerHTML = '<p>⏳ Génération en cours...</p>';
  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({exo})
    });
    const data = await res.json();
    if (data.error) {
      output.innerHTML = `<p style="color:red;">Erreur : ${data.error}</p>`;
      return;
    }
    output.innerHTML = `
      <h2>${exo}</h2>
      <p id="enonce">${data.enonce}</p>
      <textarea id="response" placeholder="Écris ta réponse ici..."></textarea>
      <button id="check-btn">Afficher la correction</button>
      <div class="correction" id="correction"><p>${data.correction}</p></div>
    `;
    renderMath();
    const checkBtn = document.getElementById('check-btn');
    const correctionDiv = document.getElementById('correction');
    checkBtn.addEventListener('click', () => {
      correctionDiv.style.display = correctionDiv.style.display === 'none' ? 'block' : 'none';
      checkBtn.textContent = correctionDiv.style.display === 'none' ? 'Afficher la correction' : 'Masquer la correction';
      renderMath();
    });
  } catch (err) {
    output.innerHTML = `<p style="color:red;">Erreur: ${err.message}</p>`;
  }
}

select.addEventListener('change', () => {
  const obj = objectifs[select.value] || "";
  objectifEl.textContent = obj ? "🎯 Objectif : " + obj : "";
});

generateBtn.addEventListener('click', () => renderExercise(select.value));

// initial display
if (select.value) {
  objectifEl.textContent = objectifs[select.value] ? "🎯 Objectif : " + objectifs[select.value] : "";
  renderExercise(select.value);
}
