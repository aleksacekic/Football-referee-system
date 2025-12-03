//#region
const tabs = document.querySelectorAll(".nav-link");

tabs.forEach((tab) => {
  tab.addEventListener("click", function (event) {
    event.preventDefault();

    // skini active sa svih
    tabs.forEach((t) => t.classList.remove("active"));

    // postavi active samo na kliknuti tab
    this.classList.add("active");
  });
});
//#endregion

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",

    /* da visina bude fleksibilnija */
    height: "auto", // visina se prilagođava sadržaju
    contentHeight: "auto",
    expandRows: true, // da lepo popuni visinu, bez ogromnih praznina

    /* responsive ponašanje */
    handleWindowResize: true,
    windowResizeDelay: 100,

    // početni aspectRatio zavisi od širine prozora
    aspectRatio: window.innerWidth < 768 ? 0.8 : 1.5,

    // kad se promeni širina prozora, prilagodi aspectRatio
    windowResize: function () {
      if (window.innerWidth < 768) {
        calendar.setOption("aspectRatio", 0.8); // uži i viši na mobilnom
      } else {
        calendar.setOption("aspectRatio", 1.5); // širi, “pločastiji” na desktopu
      }
    },
  });

  calendar.render();
});

const leagues = document.querySelectorAll(".league-preview");
const leagueTables = document.querySelectorAll(".league-table");

leagues.forEach((league) => {
  league.addEventListener("click", function () {
    //NAPOMENA: this pokazuje na konkretni .league-preview koji je kliknut
    //ako bi bila arrow funkcija gore kod eventListenera
    //  onda bismo morali da imamo (umesto this jer ne postoji) dole liniju-
    //  const clicked = e.currentTarget;
    const table = league.nextElementSibling;
    if (this.classList.contains("opened")) {
      //ako je vec otvoren, i opet kliknemo na njega.
      this.classList.remove("opened");
      table.classList.remove("active");
      return;
    }

    leagues.forEach((le) => le.classList.remove("opened"));
    leagueTables.forEach((le) => le.classList.remove("active"));

    this.classList.add("opened");
    table.classList.add("active");
  });
});

const teamsOnTable = document.querySelectorAll(".team-table");

teamsOnTable.forEach(team => {
  team.addEventListener("click", () => {
    const teamName = team.querySelector(".team-name-standings").textContent.trim();
    const logo = team.querySelector(".team-logo-standings").src;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
      <div class="team-modal">
        <button class="team-modal__close">&times;</button>
        <div class="team-modal__header">
          <img src="${logo}" class="team-modal__logo" />
          <div class="team-modal__title">${teamName}</div>
        </div>

        <div class="team-modal__body">
          <div class="team-modal__section">
            <strong>Recent matches</strong>
            <div>2025-01-01 vs Team X — 2:1</div>
            <div>2025-01-08 vs Team Y — 0:0</div>
            <div>2025-01-15 vs Team Z — 1:3</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => {
      if (e.target === overlay || e.target.classList.contains("team-modal__close"))
        overlay.remove();
    });
  });
});


