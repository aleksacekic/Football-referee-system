const matchPreviews = document.querySelectorAll(".match-info-preview");

let currentlyOpen = null;

matchPreviews.forEach((match) => {
  match.addEventListener("click", () => {
    const matchDetails = match.nextElementSibling; // uvek ide preview pa details
    if (!matchDetails) return;

    const previewIcon = match.querySelector(".match-info-preview-right .icon"); // ikonica kod kliknutog
    if (!previewIcon) return;

    // Ako je kliknuti vec otvoren, zatvori ga
    if (currentlyOpen === matchDetails) {
      matchDetails.classList.add("hidden");
      previewIcon.src = "../assets/images/down-arrow.png";
      currentlyOpen = null;
      return;
    }

    // RESENJE PROBLEMA OBJASNJENO:
    /*Ako je kliknuti mec već otvoren, želimo ga zatvoriti.

    -Dodajemo klasu hidden da sakrijemo detalje.

    -Ikonica se vraća na down-arrow.

    -currentlyOpen se resetuje na null.

    -return prekida dalje izvršavanje handler-a.

    Zašto ovo pomaže kod race condition?

    |Ako neko brzo klikne više puta na isti preview, DOM ne mora da proverava classList.contains("hidden").

    |Sve odluke se baziraju samo na currentlyOpen, što je promenljiva u JS-u i sigurno je sinhronizovana. */

    // Zatvori prethodno otvoreni i vrati njegovu ikonicu na down
    if (currentlyOpen) {
      currentlyOpen.classList.add("hidden");
      const prevIcon = currentlyOpen.previousElementSibling.querySelector(
        ".match-info-preview-right .icon"
      );
      if (prevIcon) prevIcon.src = "../assets/images/down-arrow.png";
    }

    // Otvori kliknuti i promeni ikonicu na up
    matchDetails.classList.remove("hidden");
    previewIcon.src = "../assets/images/up-arrow.png";
    currentlyOpen = matchDetails;
  });
});

/* Zašto je ovo stabilno i jednostavno

Ne čita DOM stanje (classList.contains) za odluke, što je često uzrok race condition-a.

Sve se radi sinhrono, i uvek je jasno koji je trenutno otvoren.

Ikonice se menjanju samo za relevantne elemente, ne sve na stranici.

Brzi klikovi više ne prave problem, jer currentlyOpen je jedini izvor istine. */


//--------------MENJANJE TABOVA------------------------------------------------------------
const matchTabs = document.querySelectorAll('.nav-link-match');

matchTabs.forEach((tab) => {
  tab.addEventListener("click", function () {
    // Aktiviraj dugme (taj work i za sve kopije)
    matchTabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    this.classList.add('active');
    this.setAttribute("aria-selected", "true");

    // PROMENA PANELA
    const target = this.dataset.target; // "info" | "home" | "away"

    // pronadji kontejner (detalji koji sadrze tabove/panele)
    const container = this.closest('.match-info');
    if (!container) return; // bezbednosna provera

    // sakrij sve panele u tom kontejneru (ako ih ima)
    const panels = container.querySelectorAll('.tab-panel');
    panels.forEach(p => {
      p.classList.add('hidden');
      p.setAttribute('aria-hidden', 'true');
      p.classList.remove('active');
    });

    // POKUSAJ DA NADJES PANEL:
    // 1) exact id (#info) - radi u statičkom HTML
    // 2) id sa sufiksom (#info-<matchId>) - radi u dinamičkom
    // 3) fallback na klasu .tab-panel--info (ako koristiš takvu klasu)
    let activePanel = container.querySelector(`#${target}`);
    if (!activePanel) {
      // ako kontejner ima data-match-id (preporučeno kada generišeš dinamiku),
      // pokušaj sa sufiksom: #info-<matchId>
      const matchId = container.dataset.matchId || container.getAttribute('data-match-id');
      if (matchId) {
        activePanel = container.querySelector(`#${target}-${matchId}`);
      }
    }
    if (!activePanel) {
      // fallback prema klasi (npr .tab-panel--info)
      activePanel = container.querySelector(`.tab-panel--${target}`);
    }

    if (!activePanel) {
      // ništa nije nalazeno — izloguj radi debug-a i izađi bez greške
      console.warn('Tab panel nije pronađen za target:', target, 'u containeru:', container);
      return;
    }

    // aktiviraj panel
    activePanel.classList.remove('hidden');
    activePanel.classList.add('active');
    activePanel.setAttribute('aria-hidden', 'false');
  });
});

//---------------MENJANJE SADRZAJA TABOVA----------------------------------------------------------
