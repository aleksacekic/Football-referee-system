import { canRunGameStep } from "../services/auth-service.js";

// Helper za kreiranje DOM elemenata — koriste ga svi view fajlovi
export function el(tag, opts = {}) {
  const e = document.createElement(tag);
  if (opts.className) e.className = opts.className;
  if (opts.text) e.textContent = opts.text;
  if (opts.html) e.innerHTML = opts.html;
  if (opts.attrs) {
    Object.entries(opts.attrs).forEach(([k, v]) => e.setAttribute(k, v));
  }
  return e;
}

// Natpisi za faze meca i za sledeci korak sudije (vidi nextGameStep u build-match-details.js).
export const PHASE_LABELS = {
  FIRST_HALF: "1st HALF",
  SECOND_HALF: "2nd HALF",
};

const GAME_STEP_LABELS = {
  START_FIRST_HALF: "START GAME",
  END_FIRST_HALF: "END 1st HALF",
  START_SECOND_HALF: "START 2nd HALF",
  END_GAME: "END GAME",
  LOCK: "LOCK MATCH AS PLAYED",
};

// Dugme za sledeci korak meca. Vraca null ako nema koraka ili korisnik nema dozvolu.
// Isto dugme koriste tab "My scheduled matches" i modal sa dashboard-a.
export function createGameStepButton(matchDetails, onGameStep) {
  const step = matchDetails.nextGameStep;
  if (!step || !canRunGameStep(matchDetails)) return null;

  const btn = el("button", {
    className: "start-game-button",
    text: GAME_STEP_LABELS[step],
    attrs: { type: "button", "data-game-step": step },
  });
  btn.addEventListener("click", () => onGameStep(matchDetails.id));
  return btn;
}

// Element sa data-tab="#neki-id" samo "klikne" pravi skriveni Bootstrap tab.
export function bindTabProxy(rootEl) {
  if (!rootEl) return;
  rootEl.addEventListener("click", (e) => {
    const link = e.target.closest("[data-tab]");
    if (!link) return;
    const realTab = document.querySelector(link.dataset.tab);
    if (realTab) realTab.click();
  });
}

// Sinhronizuje "active" klasu na bottom nav-u kad se top tab promeni.
// Ostaje korisno cak i posle uklanjanja hamburger sidebar-a, jer desktop
// korisnik moze da smanji prozor i tako "predje" na mobilni prikaz —
// bottom nav mora da zna koji je tab trenutno aktivan.
function syncBottomNavState() {
  const headerTabs = document.querySelectorAll("#mainTabs .nav-link");
  const bottomLinks = document.querySelectorAll("#bottomNav [data-tab]");

  headerTabs.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", () => {
      const id = `#${tab.id}`;
      bottomLinks.forEach((l) =>
        l.classList.toggle("active", l.dataset.tab === id)
      );
    });
  });
}

export function initBottomNav() {
  syncBottomNavState();
  const bottomNav = document.getElementById("bottomNav");
  bindTabProxy(bottomNav);
}

export function initTabs() {
  // NAMERNO PRAZNO — Bootstrap (data-bs-toggle="tab") vec upravlja
  // prikazom panela i "active" klasom na .nav-link unutar iste .nav grupe.
}