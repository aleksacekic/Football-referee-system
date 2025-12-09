import {
  initCalendar,
  destroyCalendar,
  renderMatchesOnDashboard,
  initMatchClickHandler,
  renderPastMatches,
  renderScheduledMatches,
} from "../views/matchView.js";
import { playerClickHandler } from "../views/matchView.js";
import { loadMatchesForDate, loadMatches } from "../models/matchesModel.js";

document.addEventListener("DOMContentLoaded", async () => {
  const matches = await loadMatchesForDate();
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
      // controller logika: npr. filtriraj matches za taj datum, renderuj listu u sidebar
    },
    onEventClick(event, info) {
      console.log("event clicked", event.id, event.extendedProps);
      // otvori detalje meca -> koristi controller da renderuje detalje
    },
  });

  // za brisanje:
  // destroyCalendar(calendar);
});

export async function initDashboard() {
  const matches = await loadMatchesForDate();
  renderMatchesOnDashboard(matches, "#matches-panel");

  // prosledi callback koji će otvarati detalje
  const cleanup = initMatchClickHandler("#matches-panel", (matchId) => {
    if (!matchId) return;
    // controller logika: npr. show match detail panel (pozovi matchView ili router)
    openMatchDetails(matchId);
  });

  // ako treba kasnije ukloniti listener:
  // cleanup();
}

export async function initMatches() {
  const matches = await loadMatches();

  //const past = await loadPastMatches();
  renderPastMatches(matches);

  //const scheduled = await loadScheduledMatches();
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
