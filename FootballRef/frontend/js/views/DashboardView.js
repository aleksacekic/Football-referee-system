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
    //console.log(startingPlayers);

    // KREIRAMO OVERLAY + MINIMALNI MODAL
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
  <div class="team-modal">
    <button class="team-modal__close">&times;</button> 

    <h3 class="team-modal__title">${playerName} — Add action</h3>

    <form id="actionForm" class="team-modal__form">

      <select name="action" class="action-select" required>
        <option value="Goal">Goal</option>
        <option value="OwnGoal">OwnGoal</option>
        <option value="Penalty">Penalty</option>
        <option value="MissedPenalty">Missed penalty</option>
        <option value="YellowCard">Yellow card</option>
        <option value="RedCard">Red card</option>
        ${isSub ? '<option value="Substitution">Substitution</option>' : ""}
      </select>

      <input type="number" name="minute" class="minute-input" placeholder="Minute" />

      <select name="when" class="when-select">
        <option value="DuringMatch">During match</option>
        <option value="BeforeMatch">Before match</option>
        <option value="AfterMatch">After match</option>
      </select>

      <div id="reason-wrapper">
        <select name="reason" class="reason-select">
          <option>Rough start</option>
          <option>Preventing a promising attack</option>
          <option>Preventing obvious opportunity to obtain a goal</option>
          <option>Pausing the game</option>
          <option>Neglecting words or movements</option>
          <option>Frequent violation of the game rules</option>
          <option>Misconduct</option>
        </select>
      </div>

      ${
        isSub
          ? `
            <select name="sub_with" class="sub-with-select">
              ${startingPlayers
                .map((p) => `<option value="${p.value}">${p.label}</option>`)
                .join("")}
            </select>
          `
          : ""
      }

      <div id="desc-wrapper">
        <textarea name="desc" rows="3" class="description-input"
          placeholder="Description (optional)"></textarea>
      </div>

      <button type="submit" class="submit-button">Add action</button>
    </form>
  </div>
`;

    document.body.appendChild(overlay);

    const form = overlay.querySelector("#actionForm");
    //console.log(form);
    const closeBtn = overlay.querySelector(".team-modal__close");

    const actionSelect = overlay.querySelector('select[name="action"]'); // padajuca lista za akcije
    const descWrapper = overlay.querySelector("#desc-wrapper");
    const reasonWrapper = overlay.querySelector("#reason-wrapper");
    const descTextarea = overlay.querySelector('textarea[name="desc"]'); // padajuca lista za opis

    function updateVisibility() {
      // const a = form.elements["action"].value;

      const value = actionSelect.value;

      const isCard = value === "YellowCard" || value === "RedCard";

      // opis i razlog samo za zuti/crveni
      descWrapper.style.display = isCard ? "block" : "none";
      reasonWrapper.style.display = isCard ? "block" : "none";

      form.elements["when"].style.display = isCard ? "block" : "none";

      // ako nije karton — očisti description
      if (!isCard) {
        descTextarea.value = "";
      }

      if (form.elements["sub_with"])
        form.elements["sub_with"].style.display =
          value === "Substitution" ? "block" : "none";
    }

    actionSelect.addEventListener("change", updateVisibility);

    // pozovi odmah da inicijalno podesi vidljivost
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

      if (a === "Goal") text = `Goal (${minute}')`;
      else if (a === "OwnGoal") text = `Own goal (${minute}')`;
      else if (a === "Penalty") text = `Penalty scored (${minute}')`;
      else if (a === "MissedPenalty") text = `Missed penalty (${minute}')`;
      else if (a === "YellowCard")
        text = `Yellow card (${minute}') — ${reason}`;
      else if (a === "RedCard") text = `Red card (${minute}') — ${reason}`;
      else if (a === "Substitution")
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



// ISTO TO, ALI ZA KLUPU
const officialsActions = document.querySelectorAll(".officials-list");

officialsActions.forEach((official) => {
  official.addEventListener("click", function () {
    /* 
    1. napravi overlay
    2. dodaj mu izgled
    3. na klik otvori overlay
    4. na overlay ponudi samo zuti i crveni
    */

    //1
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    //2
    overlay.innerHTML = `
    <div class="team-modal">
    <button class="team-modal__close">&times;</button> 

    <h3 class="team-modal__title">Official — Add action</h3>

    <form id="actionForm" class="team-modal__form">

      <select name="action" class="action-select" required>
        <option value="Yellow card">Yellow card</option>
        <option value="Red card">Red card</option>
      </select>

      <input type="number" name="minute" class="minute-input" placeholder="Minute" required/>

      <select name="when" class="when-select">
        <option value="DuringMatch">During match</option>
        <option value="BeforeMatch">Before match</option>
        <option value="AfterMatch">After match</option>
      </select>

      
      <textarea name="desc" rows="3" class="description-input"
        placeholder="Description (optional)"></textarea>
      

      <button type="submit" class="submit-button">Add action</button>
    </form>
  </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector(".team-modal__close");
    // ZATVARANJE
    const close = () => overlay.remove();
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);

   
    const form = overlay.querySelector("#actionForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let text = "";
      const action = form.elements["action"].value;
      const min = form.elements["minute"].value;
      const when = form.elements["when"].value;
      const desc = form.elements["desc"].value;

      const description = desc ? `- ${desc}` : ``;
      text = `${action} (${min}') ${description}`
      console.log(text);

      const officialAct = document.querySelector(".official-action");
      officialAct.textContent += `; ${text}`;
      close();
    });
  });
});

//----------------------------------------------------ZA DASHBOARD---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------ZA DASHBOARD--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------ZA DASHBOARD--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------ZA DASHBOARD-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------ZA DASHBOARD--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//ZA DASHBOARD

const matchesForDate = [
  {
    id: 1, 
    date: "2025-11-23",
    time: "11:00",
    round: 3,
    homeTeam: "Kopernikus Zeleznicar",
    awayTeam: "Sloga Leskovac",
    competition: 'Druga kadetska liga "JUG"',
    stadium: {
      city: "Nis",
      name: "Cair"
    }
  },
  {
    id: 2,
    date: "2025-11-23",
    time: "13:30",
    round: 3,
    homeTeam: "Radnicki Nis",
    awayTeam: "FK Jagodina",
    competition: 'Druga kadetska liga "JUG"',
    stadium: {
      city: "Nis",
      name: "Cair – teren 2"
    }
  },
  {
    id: 3,
    date: "2025-11-23",
    time: "15:00",
    round: 3,
    homeTeam: "OFK Belgrad",
    awayTeam: "TSC Backa Topola",
    competition: 'Omladinska liga Srbije',
    stadium: {
      city: "Belgrade",
      name: "Omladinski stadion"
    }
  }
];



// ROOT kontejner u HTML-u
// <div id="matches-panel"></div>
const root = document.getElementById('matches-panel');

function createMatchNode(match) {
  const wrap = document.createElement('div');
  wrap.className = 'match-item';
  wrap.dataset.matchId = match.id; // korisno za identifikaciju

  const firstRow = document.createElement('div');
  firstRow.className = 'matchitem-firstrow';

  const timeSpan = document.createElement('span');
  const timeEl = document.createElement('time');
  timeEl.dateTime = `${match.date}T${match.time}`;
  timeEl.textContent = `${formatDisplayDate(match.date)} ${match.time}`;
  timeSpan.appendChild(timeEl);

  const roundSpan = document.createElement('span');
  roundSpan.textContent = `Round: ${match.round}`;

  firstRow.appendChild(timeSpan);
  firstRow.appendChild(roundSpan);

  const teams = document.createElement('span');
  teams.className = 'match-teams';
  teams.textContent = `${match.homeTeam} - ${match.awayTeam}`;

  const comp = document.createElement('span');
  comp.textContent = `Competition: ${match.competition}`;

  const stadium = document.createElement('span');
  stadium.textContent = `Stadium: ${match.stadium.city}, ${match.stadium.name}`;

  wrap.appendChild(firstRow);
  wrap.appendChild(teams);
  wrap.appendChild(comp);
  wrap.appendChild(stadium);

  return wrap;
}

function formatDisplayDate(isoDate) {
  // jednostavno formatiranje: "23. Nov 2025."
  const d = new Date(isoDate);
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' }); // "Nov"
  const year = d.getFullYear();
  return `${String(day).padStart(2,'0')}. ${month} ${year}.`;
}

function renderMatches(matches, container) {
  container.innerHTML = ''; // clear (idempotent)
  const frag = document.createDocumentFragment();
  matches.forEach(m => frag.appendChild(createMatchNode(m)));
  container.appendChild(frag);

  // Document fragment je predobar za optimizaciju kad imam 1000 elemenata npr - sada bi npr. bolje bilo da radim klasicno. Ostavicu zbog VEZBE - nauceno nesto novo
  /*
  matches.forEach(m => {
    container.appendChild(createMatchNode(m));
  });
   */

  //objasnjenje gpt: DocumentFragment je mini, nevidljivi DOM koji postoji samo u memoriji i nije deo stranice.Možeš ga zamisliti kao:„kutiju u koju privremeno sklapaš HTML elemente, a na kraju celu kutiju dodaš u DOM u jednom potezu“.


}

// Event delegation: hvata klik na match-item
root.addEventListener('click', (e) => {
  const matchEl = e.target.closest('.match-item');
  if (!matchEl || !root.contains(matchEl)) return;
  const id = matchEl.dataset.matchId;
  console.log('clicked match id', id);
  openMatchDetails(id); // DODAJ
});

// CALL (render)
renderMatches(matchesForDate, root);
