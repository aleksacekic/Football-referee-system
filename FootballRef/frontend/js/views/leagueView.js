import { fakeJSON,leaguesData } from "../api/fakeData.js";

function createLeagueNode(league) {
  // wrapper koji sadrzi preview + tabelu
  const wrapper = document.createElement('div');
  wrapper.classList.add('league-block');

  const leaguePreview = document.createElement('div');
  leaguePreview.type = 'div';
  leaguePreview.classList.add('league-preview');
  leaguePreview.textContent = league.leagueName;
  // leaguePreview.setAttribute('aria-expanded', 'false');
  // leaguePreview.setAttribute('aria-controls', `league-table-${id}`);

  const leagueTableWrap = document.createElement('div');
  leagueTableWrap.classList.add('league-table');

  const table = document.createElement('table');
  table.classList.add('standings');
  table.setAttribute('aria-label', `League standings — ${league.leagueName}`);

  //za screen readere
  const caption = document.createElement('caption');
  caption.classList.add('visually-hidden'); // definisi u css ?? OVO JE NEDOVRSENO! ali je dobra praksa.
  caption.textContent = `Standings — ${league.leagueName}`;
  table.appendChild(caption);

  // THEAD
  const thead = document.createElement('thead');
  const headTr = document.createElement('tr');

  const cols = [
    { cls: 'col-pos', text: '#' },
    { cls: 'col-team', text: 'Team' },
    { cls: 'col-played', text: 'M' },
    { cls: 'col-w', text: 'W' },
    { cls: 'col-d', text: 'D' },
    { cls: 'col-l', text: 'L' },
    { cls: 'col-g', text: 'G' },
    { cls: 'col-gd', text: 'GD' },
    { cls: 'col-points', text: 'Pts' }
  ];

  cols.forEach(c => {
    const th = document.createElement('th');
    th.classList.add(c.cls);
    th.setAttribute('scope', 'col');
    th.textContent = c.text;
    headTr.appendChild(th);
  });

  thead.appendChild(headTr);
  table.appendChild(thead);

  // TBODY
  const tbody = document.createElement('tbody');

  league.standings.forEach(team => {
    const tr = document.createElement('tr');
    tr.classList.add('team-table');
    tr.dataset.teamId = team.short || team.teamName;// ??

    const tdPos = document.createElement('td');
    tdPos.classList.add('col-pos');
    tdPos.textContent = String(team.pos);
    tr.appendChild(tdPos);

    const tdTeam = document.createElement('td');
    tdTeam.classList.add('col-team');

    const teamCell = document.createElement('div');
    teamCell.classList.add('team-cell');

    const img = document.createElement('img');
    img.classList.add('team-logo-standings');
    img.setAttribute('src', team.logo || '../assets/images/team1.jpeg');
    img.setAttribute('alt', `Grb ${team.teamName}`);
    teamCell.appendChild(img);

    const meta = document.createElement('div');
    meta.classList.add('team-meta');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('team-name-standings');
    nameDiv.textContent = team.teamName;
    meta.appendChild(nameDiv);

    // optional short code
    if (team.short) {
      const shortDiv = document.createElement('div');
      shortDiv.classList.add('team-short');
      shortDiv.textContent = team.short;
      meta.appendChild(shortDiv);
    }

    teamCell.appendChild(meta);
    tdTeam.appendChild(teamCell);
    tr.appendChild(tdTeam);

    // played, w, d, l, g, gd, points
    const tdPlayed = document.createElement('td'); tdPlayed.classList.add('col-played'); tdPlayed.textContent = String(team.played); tr.appendChild(tdPlayed);
    const tdW = document.createElement('td'); tdW.classList.add('col-w'); tdW.textContent = String(team.w); tr.appendChild(tdW);
    const tdD = document.createElement('td'); tdD.classList.add('col-d'); tdD.textContent = String(team.d); tr.appendChild(tdD);
    const tdL = document.createElement('td'); tdL.classList.add('col-l'); tdL.textContent = String(team.l); tr.appendChild(tdL);
    const tdG = document.createElement('td'); tdG.classList.add('col-g'); tdG.textContent = String(team.g); tr.appendChild(tdG);
    const tdGD = document.createElement('td'); tdGD.classList.add('col-gd'); tdGD.textContent = String(team.gd); tr.appendChild(tdGD);

    const tdPoints = document.createElement('td');
    tdPoints.classList.add('col-points');
    tdPoints.textContent = String(team.points);
    tr.appendChild(tdPoints);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  leagueTableWrap.appendChild(table);

  // assemble wrapper
  wrapper.appendChild(leaguePreview);
  wrapper.appendChild(leagueTableWrap);

  return wrapper;
}

const container = document.querySelector('.leagues-root');
const frag = document.createDocumentFragment();
leaguesData.forEach(league => frag.appendChild(createLeagueNode(league)));
container.appendChild(frag);


//MEHANIZAM OTVARANJA-ZATVARANJA KLIKOM NA PREVIEW
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


//KLIK NA TIM OTVARA OVERLAY
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