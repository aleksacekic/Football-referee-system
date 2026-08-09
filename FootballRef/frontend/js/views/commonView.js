// Helper za kreiranje DOM elemenata — koristi ga MatchView.js
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