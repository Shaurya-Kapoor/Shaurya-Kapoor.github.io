const form = document.getElementById("speechForm");
const formCard = document.getElementById("formCard");
const resultCard = document.getElementById("resultCard");
const loadingPanel = document.getElementById("loadingPanel");
const loadingText = document.getElementById("loadingText");
const submitBtn = document.getElementById("submitBtn");
const errorLine = document.getElementById("errorLine");

const speechText = document.getElementById("speechText");
const metaCommittee = document.getElementById("metaCommittee");
const metaPortfolio = document.getElementById("metaPortfolio");
const metaAgenda = document.getElementById("metaAgenda");
const wordCountEl = document.getElementById("wordCount");
const estSecondsEl = document.getElementById("estSeconds");
const targetSecondsEl = document.getElementById("targetSeconds");

const copyBtn = document.getElementById("copyBtn");
const newBtn = document.getElementById("newBtn");

const LOADING_MESSAGES = [
  "Consulting the delegation…",
  "Drafting on committee letterhead…",
  "Reviewing parliamentary language…",
  "Finalizing talking points…",
];

let loadingInterval = null;

function cycleLoadingMessages() {
  let i = 0;
  loadingText.textContent = LOADING_MESSAGES[0];
  loadingInterval = setInterval(() => {
    i = (i + 1) % LOADING_MESSAGES.length;
    loadingText.textContent = LOADING_MESSAGES[i];
  }, 1400);
}

function stopLoadingMessages() {
  clearInterval(loadingInterval);
}

function showError(message) {
  errorLine.textContent = message;
  errorLine.hidden = false;
}

function clearError() {
  errorLine.hidden = true;
  errorLine.textContent = "";
}

async function typewriterReveal(el, text, speedMs = 8) {
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "type-cursor";
  el.appendChild(document.createTextNode(""));
  el.appendChild(cursor);

  // Reveal in small chunks for a smooth, non-laggy typewriter feel
  const chunkSize = 3;
  let i = 0;
  return new Promise((resolve) => {
    function step() {
      i += chunkSize;
      const visible = text.slice(0, i);
      el.firstChild.nodeValue = visible;
      el.appendChild(cursor); // keep cursor at the end
      if (i < text.length) {
        setTimeout(step, speedMs);
      } else {
        cursor.remove();
        resolve();
      }
    }
    step();
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const payload = {
    committee: document.getElementById("committee").value.trim(),
    portfolio: document.getElementById("portfolio").value.trim(),
    agenda: document.getElementById("agenda").value.trim(),
    time_limit: document.getElementById("time_limit").value,
  };

  if (!payload.committee || !payload.portfolio || !payload.agenda || !payload.time_limit) {
    showError("Please fill out every field before drafting the speech.");
    return;
  }

  submitBtn.classList.add("stamping");
  submitBtn.disabled = true;

  setTimeout(() => {
    formCard.hidden = true;
    loadingPanel.hidden = false;
    cycleLoadingMessages();
  }, 320);

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    stopLoadingMessages();
    loadingPanel.hidden = true;

    if (!res.ok) {
      formCard.hidden = false;
      submitBtn.classList.remove("stamping");
      submitBtn.disabled = false;
      showError(data.error || "Something went wrong. Please try again.");
      return;
    }

    metaCommittee.textContent = data.committee;
    metaPortfolio.textContent = data.portfolio;
    metaAgenda.textContent = data.agenda;
    wordCountEl.textContent = `${data.word_count} words`;
    estSecondsEl.textContent = `${data.estimated_seconds} sec est.`;
    targetSecondsEl.textContent = `${data.target_seconds} sec limit`;

    resultCard.hidden = false;
    await typewriterReveal(speechText, data.speech);

  } catch (err) {
    stopLoadingMessages();
    loadingPanel.hidden = true;
    formCard.hidden = false;
    submitBtn.classList.remove("stamping");
    submitBtn.disabled = false;
    showError("Could not reach the server. Is the Flask app running?");
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(speechText.textContent);
    const original = copyBtn.textContent;
    copyBtn.textContent = "Copied";
    setTimeout(() => (copyBtn.textContent = original), 1400);
  } catch {
    showError("Could not copy to clipboard.");
  }
});

newBtn.addEventListener("click", () => {
  resultCard.hidden = true;
  formCard.hidden = false;
  submitBtn.classList.remove("stamping");
  submitBtn.disabled = false;
  form.reset();
  clearError();
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('speechForm');
  const formCard = document.getElementById('formCard');
  const loadingPanel = document.getElementById('loadingPanel');
  const resultCard = document.getElementById('resultCard');
  const errorLine = document.getElementById('errorLine');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorLine.hidden = true;
    formCard.hidden = true;
    loadingPanel.hidden = false;

    const payload = {
      committee: document.getElementById('committee').value,
      portfolio: document.getElementById('portfolio').value,
      agenda: document.getElementById('agenda').value,
      time_limit: document.getElementById('time_limit').value,
    };

    try {
      const res = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      document.getElementById('metaCommittee').textContent = data.committee;
      document.getElementById('metaPortfolio').textContent = data.portfolio;
      document.getElementById('metaAgenda').textContent = data.agenda;
      document.getElementById('speechText').textContent = data.speech;

      const words = data.speech.trim().split(/\s+/).length;
      document.getElementById('wordCount').textContent = `${words} words`;
      document.getElementById('estMinutes').textContent = `${(words / 130).toFixed(1)} min est.`;
      document.getElementById('targetMinutes').textContent = `${(data.time_limit / 60).toFixed(1)} min limit`;

      loadingPanel.hidden = true;
      resultCard.hidden = false;
    } catch (err) {
      loadingPanel.hidden = true;
      formCard.hidden = false;
      errorLine.hidden = false;
      errorLine.textContent = err.message;
    }
  });

  document.getElementById('newBtn')?.addEventListener('click', () => {
    resultCard.hidden = true;
    formCard.hidden = false;
    form.reset();
  });

  document.getElementById('copyBtn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('speechText').textContent);
  });
});