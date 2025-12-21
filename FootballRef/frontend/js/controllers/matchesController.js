import {
  initCalendar,
  destroyCalendar,
  renderMatchesOnDashboard,
  renderPastMatches,
  renderScheduledMatches,
  playerClickHandler,
  officialClickHandler,
} from "../views/matchView.js";

import { loadMatches } from "../models/matchesModel.js";

function highlightSelectedDay(dateStr) {
  // ukloni staru selekciju
  document
    .querySelectorAll(".fc-day-selected")
    .forEach((d) => d.classList.remove("fc-day-selected"));

  // nadji novi element po attribute-u data-date
  const dayCell = document.querySelector(`[data-date="${dateStr}"]`);
  if (dayCell) {
    dayCell.classList.add("fc-day-selected");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  //OVO JE FEJK ZA SADA !!!!!!!!!!!!!!!!!!!!1
  const refereeId = 2; // logged-in user
  const matches = await loadMatches(refereeId);
  renderMatchesOnDashboard(matches, "#matches-panel");
  //console.log(matches);
  // Prebaci matches u format koji FullCalendar ocekuje (event objekti)
  const fcEvents = matches.map((m) => ({
    id: m.id,
    title: `${m.homeTeam} - ${m.awayTeam}`,
    start: m.isoDate || m.datetimeIso,
    extendedProps: { matchId: m.id, status: m.status },
    // moz da se doda className
  }));

  const calendar = initCalendar("#calendar", {
    initialEvents: fcEvents,
    onDateClick(info) {
      console.log("date clicked", info.dateStr);
      highlightSelectedDay(info.dateStr);
      renderMatchesOnDashboard(matches, "#matches-panel");
    },
    onEventClick(event, info) {
      console.log("event clicked", event.id, event.extendedProps);
      // otvori detalje meca -> koristi controller da renderuje detalje
    },
  });

  // za brisanje:
  // destroyCalendar(calendar);
});

// export async function initDashboard() {
//   const matches = await loadMatchesForDate();
//   renderMatchesOnDashboard(matches, "#matches-panel");

//   // prosledi callback koji će otvarati detalje
//   const cleanup = initMatchClickHandler("#matches-panel", (matchId) => {
//     if (!matchId) return;
//     // controller logika: npr. show match detail panel (pozovi matchView ili router)
//     openMatchDetails(matchId);
//   });

//   // ako treba kasnije ukloniti listener:
//   // cleanup();
// }

export async function initMatches() {
  const refereeId = 2; // logged-in user
  const matches = await loadMatches(refereeId);

  //console.log(matches);

  renderPastMatches(matches);
  renderScheduledMatches(matches);
}

export function initPlayerActionsDelegation(rootSelector = ".players") {
  const root = document.querySelector(rootSelector) || document;

  root.addEventListener("click", (e) => {
    const playerEl = e.target.closest(".player-card");
    //EVENT DELEGATION - POGLEDAJ OPET !
    if (!playerEl) return;
    playerClickHandler(playerEl);
  });
}

export function initOfficialActionsDelegation(
  rootSelector = ".officials-list"
) {
  const root = document.querySelector(rootSelector) || document;

  root.addEventListener("click", (e) => {
    const officialEl = e.target.closest(".official-item");
    //EVENT DELEGATION - POGLEDAJ OPET !
    if (!officialEl) return;
    officialClickHandler(officialEl);
  });
}
