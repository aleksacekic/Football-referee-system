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

teamsOnTable.forEach((team) => {
  team.addEventListener("click", () => {
    const teamName = team
      .querySelector(".team-name-standings")
      .textContent.trim();
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

    overlay.addEventListener("click", (e) => {
      if (
        e.target === overlay ||
        e.target.classList.contains("team-modal__close")
      )
        overlay.remove();
    });
  });
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------

// SUPER-SIMPLE player action modal
const gamePlayers = document.querySelectorAll(".player-card");

gamePlayers.forEach((playerElement) => {
  playerElement.addEventListener("click", () => {
    const isSub = playerElement.classList.contains("substitute");
    const playerName =
      playerElement.querySelector(".player-name")?.textContent.trim() ||
      "Player";

    // SKUPIMO IGRACE IZ STARTNE POSTAVE — zbog SUBSTITUTION
    const startingPlayers = Array.from(
      document.querySelectorAll(".starting-lineup-block .player-card")
    ).map((p) => {
      const name = p.querySelector(".player-name").textContent.trim();
      const num = p.querySelector(".player-number").textContent.trim();
      return {
        label: `${num} ${name}`,
        value: name,
      };
    });

    // KREIRAMO OVERLAY + MINIMALNI MODAL
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="team-modal" style="max-width:460px;padding:12px;">
        <button class="team-modal__close" style="position:absolute;right:10px;top:8px;border:0;background:transparent;font-size:20px;">&times;</button>

        <h3 style="margin-bottom:10px;">${playerName} — Add action</h3>

        <form id="actionForm" style="display:grid;gap:8px">
          <select name="action" required>
            <option value="GOL">GOL</option>
            <option value="AUTOGOL">AUTOGOL</option>
            <option value="PENAL">PENAL (goal)</option>
            <option value="PROMASEN_PENAL">PROMAŠEN PENAL</option>
            <option value="ZUTI">ŽUTI KARTON</option>
            <option value="CRVENI">CRVENI KARTON</option>
            ${isSub ? '<option value="SUBSTITUTION">SUBSTITUTION</option>' : ""}
          </select>

          <input type="number" name="minute" placeholder="Minute" />

          <select name="when">
            <option value="TOKOM MECA">TOKOM MECA</option>
            <option value="PRE MECA">PRE MECA</option>
            <option value="POSLE MECA">POSLE MECA</option>
          </select>

          <select name="reason">
            <option>Rough start</option>
            <option>Preventing a promising attack</option>
            <option>Preventing obvious opportunity to obtain a goal</option>
            <option>Pausing the game</option>
            <option>Neglecting words or movements</option>
            <option>Frequent violation of the game rules</option>
            <option>Misconduct</option>
          </select>

          ${
            isSub
              ? `
          <select name="sub_with">
            ${startingPlayers
              .map(
                (p) => `<option value="${p.value}">${p.label}</option>`
              )
              .join("")}
          </select>`
              : ""
          }

          <textarea name="desc" rows="3" placeholder="Description (optional)"></textarea>

          <button type="submit" style="background:#0d9488;color:white;border:0;padding:8px;border-radius:6px;cursor:pointer;">
            Add action
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const form = overlay.querySelector("#actionForm");
    const closeBtn = overlay.querySelector(".team-modal__close");

    // PRIKAZ/SKRIVANJE POLJA
    const updateVisibility = () => {
      const a = form.elements["action"].value;

      const isCard = a === "ZUTI" || a === "CRVENI";

      form.elements["when"].style.display = isCard ? "block" : "none";
      form.elements["reason"].style.display = isCard ? "block" : "none";
      form.elements["minute"].style.display = "block";

      if (form.elements["sub_with"])
        form.elements["sub_with"].style.display =
          a === "SUBSTITUTION" ? "block" : "none";
    };

    form.elements["action"].addEventListener("change", updateVisibility);
    updateVisibility();

    // ZATVARANJE
    const close = () => overlay.remove();
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);

    // SUBMIT
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const a = form.elements["action"].value;
      const minute = form.elements["minute"].value;
      const when = form.elements["when"]?.value;
      const reason = form.elements["reason"]?.value;
      const desc = form.elements["desc"].value.trim();
      const subWith = form.elements["sub_with"]?.value;

      let text = "";

      if (a === "GOL") text = `Goal (${minute}')`;
      else if (a === "AUTOGOL") text = `Own goal (${minute}')`;
      else if (a === "PENAL") text = `Penalty scored (${minute}')`;
      else if (a === "PROMASEN_PENAL") text = `Missed penalty (${minute}')`;
      else if (a === "ZUTI") text = `Yellow card (${minute}') — ${reason}`;
      else if (a === "CRVENI") text = `Red card (${minute}') — ${reason}`;
      else if (a === "SUBSTITUTION")
        text = `Substitution: on ${subWith} (${minute}')`;

      if (desc) text += ` — ${desc}`;

      const actionDiv = playerElement.querySelector(".player-action");

      if (actionDiv.textContent.trim() === "") {
        actionDiv.textContent = text;
      } else {
        actionDiv.textContent += "; " + text;
      }

      close();
    });
  });
});
