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

matchTabs.forEach((tab)=>{
  tab.addEventListener("click", function(){

    // Aktiviraj dugme
    matchTabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    this.classList.add('active');
    this.setAttribute("aria-selected", "true");

    // PROMENA PANELA
    const target = this.dataset.target;
    //console.log(target);

    const container = this.closest('.match-info');
    //console.log(container);
    const panels = container.querySelectorAll('.tab-panel');

    panels.forEach(p => {
      // p.classList.add('hidden');
      p.setAttribute('aria-hidden', 'true');
      p.classList.remove('active');
    });

    const activePanel = container.querySelector(`#${target}`);
    //console.log(activePanel);
    // activePanel.classList.remove('hidden');
    activePanel.classList.add('active');
    activePanel.setAttribute('aria-hidden', 'false');

  })
})

//---------------MENJANJE SADRZAJA TABOVA----------------------------------------------------------
