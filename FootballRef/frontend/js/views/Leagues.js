let fakeJSON = {
  league: {
    id: "liga-001",
    name: "Prva kadetska",
    season: "2025/2026",
    country: "RS",
    region: "Beograd",
    updatedAt: "2025-11-26T12:30:00Z", // kad je standings poslednji put update-ovan
  },

  teams: [
    {
      id: "team-1",
      name: "KOPERNIKUS Železničar",
      short: "KOP",
      logo: "/assets/logos/kop.png",
    },
    {
      id: "team-2",
      name: "SLOGA Leskovac",
      short: "SLO",
      logo: "/assets/logos/slo.png",
    },
    {
      id: "team-3",
      name: "RADNIČKI Niš",
      short: "RAD",
      logo: "/assets/logos/rad.png",
    },
  ],

  standings: [
    {
      teamId: "team-2",
      position: 1,
      played: 10,
      won: 7,
      draw: 1,
      lost: 2,
      gf: 21,
      ga: 12,
      gd: 9,
      points: 22,
      lastUpdated: "2025-11-26T12:30:00Z", // kada je ova stavka poslednji put promenjena
    },
    {
      teamId: "team-1",
      position: 2,
      played: 10,
      won: 6,
      draw: 2,
      lost: 2,
      gf: 18,
      ga: 11,
      gd: 7,
      points: 20,
      lastUpdated: "2025-11-26T12:30:00Z",
    },
    {
      teamId: "team-3",
      position: 3,
      played: 10,
      won: 4,
      draw: 3,
      lost: 3,
      gf: 15,
      ga: 17,
      gd: -2,
      points: 15,
      lastUpdated: "2025-11-26T12:30:00Z",
    },
  ],

  matches: [
    {
      id: "m-2025-001",
      date: "2025-11-23T11:00:00Z",
      round: 3,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
      homeGoals: 2,
      awayGoals: 3,
      status: "played", // scheduled | live | played | postponed | cancelled
      stadium: "Niš, Čair",
      events: [
        { minute: 23, type: "goal", teamId: "team-2", playerId: "p-45" },
        {
          minute: 70,
          type: "substitution",
          teamId: "team-1",
          in: "p-21",
          out: "p-9",
        },
      ],
      refereeId: "ref-77",
      updatedAt: "2025-11-23T12:00:00Z", // kada je rezultat unesem
    },

    {
      id: "m-2025-002",
      date: "2025-11-30T11:00:00Z",
      round: 4,
      homeTeamId: "team-3",
      awayTeamId: "team-1",
      homeGoals: null,
      awayGoals: null,
      status: "scheduled",
      stadium: "Niš, Stadion X",
      events: [],
      refereeId: null,
      updatedAt: "2025-11-01T09:00:00Z",
    },
  ],
};

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
//------------------------------------------------------------------------------------------------------------------------------------------------------------
// PRAVIMO HTML DEO.

// IN PROGRESS

const leaguesData = [
  {
    leagueName: "Prva kadetska liga FSRIS 25/26",
    standings: [
      {
        pos: 1,
        teamName: "Sloga Leskovac",
        short: "SLO",
        logo: "../assets/images/team1.jpeg",
        played: 10,
        w: 7,
        d: 1,
        l: 2,
        g: "21:12",
        gd: "+9",
        points: 22,
      },
      {
        pos: 2,
        teamName: "Kopernikus Železničar",
        short: "KOP",
        logo: "../assets/images/team2.png",
        played: 10,
        w: 6,
        d: 2,
        l: 2,
        g: "18:11",
        gd: "+7",
        points: 20,
      },
      {
        pos: 3,
        teamName: "Radnički Niš",
        short: "RAD",
        logo: "../assets/images/team2.png",
        played: 10,
        w: 4,
        d: 3,
        l: 3,
        g: "15:17",
        gd: "-2",
        points: 15,
      },
    ],
  },

  {
    leagueName: "Druga kadetska liga FSRIS 25/26",
    standings: [
      {
        pos: 1,
        teamName: "OFK Niš",
        short: "OFK",
        logo: "../assets/images/team1.jpeg",
        played: 11,
        w: 8,
        d: 2,
        l: 1,
        g: "24:9",
        gd: "+15",
        points: 26,
      },
      {
        pos: 2,
        teamName: "Palilulac",
        short: "PAL",
        logo: "../assets/images/team2.png",
        played: 11,
        w: 7,
        d: 1,
        l: 3,
        g: "20:14",
        gd: "+6",
        points: 22,
      },
    ],
  },

  {
    leagueName: "Treća liga 'Sever'",
    standings: [
      {
        pos: 1,
        teamName: "Mladost",
        short: "MLA",
        logo: "../assets/images/team1.jpeg",
        played: 9,
        w: 6,
        d: 2,
        l: 1,
        g: "18:7",
        gd: "+11",
        points: 20,
      },
    ],
  },

  {
    leagueName: "Treća liga 'Jug'",
    standings: [
      {
        pos: 1,
        teamName: "Jedinstvo Kočane",
        short: "JED",
        logo: "../assets/images/team2.png",
        played: 9,
        w: 6,
        d: 1,
        l: 2,
        g: "17:10",
        gd: "+7",
        points: 19,
      },
    ],
  },
];

function createLeagueNode(league) {
  const leaguePreview = document.createElement("div");
  leaguePreview.className = "league-preview";
  leaguePreview.textContent = league.leagueName;

  const leagueTable = document.createElement("div");
  leagueTable.className = "league-table";

  const leagueTableTag = document.createElement("table");
  leagueTableTag.className = "standings";
  leagueTableTag.setAttribute("role", "table");
  leagueTableTag.setAttribute("aria-label", "League standings");

  // -------------------------------
  const tableThead = document.createElement("thead");
  const tableHeadTr = document.createElement("tr");

  const thPos = document.createElement("th");
  thPos.className = "col-pos";
  thPos.setAttribute("scope", "col");
  thPos.textContent = "#";

  const thTeam = document.createElement("th");
  thTeam.className = "col-team";
  thTeam.setAttribute("scope", "col");
  thTeam.textContent = "Team";

  const thPlayed = document.createElement("th");
  thPlayed.className = "col-played";
  thPlayed.setAttribute("scope", "col");
  thPlayed.textContent = "M";

  const thWin = document.createElement("th");
  thWin.className = "col-w";
  thWin.setAttribute("scope", "col");
  thWin.textContent = "W";

  const thDraw = document.createElement("th");
  thDraw.className = "col-d";
  thDraw.setAttribute("scope", "col");
  thDraw.textContent = "D";

  const thLose = document.createElement("th");
  thLose.className = "col-l";
  thLose.setAttribute("scope", "col");
  thLose.textContent = "L";

  const thG = document.createElement("th");
  thG.className = "col-g";
  thG.setAttribute("scope", "col");
  thG.textContent = "G";

  const thGD = document.createElement("th");
  thGD.className = "col-gd";
  thGD.setAttribute("scope", "col");
  thGD.textContent = "GD";

  const thPoints = document.createElement("th");
  thPoints.className = "col-points";
  thPoints.setAttribute("scope", "col");
  thPoints.textContent = "Pts";

  tableHeadTr.appendChild(thPos);
  tableHeadTr.appendChild(thTeam);
  tableHeadTr.appendChild(thPlayed);
  tableHeadTr.appendChild(thWin);
  tableHeadTr.appendChild(thDraw);
  tableHeadTr.appendChild(thLose);
  tableHeadTr.appendChild(thG);
  tableHeadTr.appendChild(thGD);
  tableHeadTr.appendChild(thPoints);
  tableThead.appendChild(tableHeadTr);
  // -----------------

  const tableTbody = document.createElement("tbody");

  league.standings.forEach((team) => {
    const tableBodyTr = document.createElement("tr");
    tableBodyTr.className = "team-table";

    const tdPos = document.createElement("td");
    tdPos.className = "col-pos";
    tdPos.textContent = `${team.pos}`;

    const tdTeam = document.createElement("td");
    tdTeam.className = "col-team";
    tdTeam.textContent = `${team.teamName}`;
    const teamCell = document.createElement("div");
    teamCell.className = "team-cell";
    tdTeam.appendChild(teamCell);

    const teamCellImg = document.createElement("img");
    teamCellImg.className = "team-logo-standings";
    teamCellImg.setAttribute("src", "../assets/images/team1.jpeg");
    teamCellImg.setAttribute("alt", "Sloga Leskovac logo");
    teamCell.appendChild(teamCellImg);

    const teamCellDiv = document.createElement("div");
    teamCellDiv.className = "team-meta";
    teamCell.appendChild(teamCellDiv);

    const teamCellDivName = document.createElement("div");
    teamCellDivName.className = "team-name-standings";
    teamCellDiv.appendChild(teamCellDivName);
    // -------------dodaj

    const tdPlayed = document.createElement("td");
    tdPlayed.className = "col-played";
    tdPlayed.textContent = `${team.played}`;

    const tdWin = document.createElement("td");
    tdWin.className = "col-w";
    tdWin.textContent = `${team.w}`;

    const tdDraw = document.createElement("td");
    tdDraw.className = "col-d";
    tdDraw.textContent = `${team.d}`;

    const tdLose = document.createElement("td");
    tdLose.className = "col-l";
    tdLose.textContent = `${team.l}`;

    const tdG = document.createElement("td");
    tdG.className = "col-g";
    tdG.textContent = `${team.g}`;

    const tdGD = document.createElement("td");
    tdGD.className = "col-gd";
    tdGD.textContent = `${team.gd}`;

    tableBodyTr.appendChild(tdPos);
    tableBodyTr.appendChild(tdTeam);
    tableBodyTr.appendChild(tdPlayed);
    tableBodyTr.appendChild(tdWin);
    tableBodyTr.appendChild(tdDraw);
    tableBodyTr.appendChild(tdLose);
    tableBodyTr.appendChild(tdG);
    tableBodyTr.appendChild(tdGD);
    tableBodyTr.appendChild(tdPoints);
    tableTbody.appendChild(tableBodyTr);
  });

  leagueTableTag.appendChild(tableTbody);
  leagueTableTag.appendChild(tableThead);
  leagueTable.appendChild(leagueTableTag);
}

createLeagueNode(lig);
