import {
  initCalendar,
  destroyCalendar,
  renderMatchesOnDashboard,
  renderPastMatches,
  renderScheduledMatches,
  playerClickHandler,
  officialClickHandler,
} from "../views/matchView.js";

import { loadMatches, loadMatchesForDate } from "../models/matchesModel.js";

function highlightSelectedDay(dateStr) {
  document
    .querySelectorAll(".fc-day-selected")
    .forEach((d) => d.classList.remove("fc-day-selected"));

  const dayCell = document.querySelector(`[data-date="${dateStr}"]`);
  if (dayCell) {
    dayCell.classList.add("fc-day-selected");
  }
}

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const refereeId = 2; // logged-in user

  const allMatches = await loadMatches(refereeId);

  const todayStr = getTodayIsoDate();
  const todaysMatches = await loadMatchesForDate(refereeId, todayStr);
  renderMatchesOnDashboard(todaysMatches, "#matches-panel");

  const fcEvents = allMatches.map((m) => ({
    id: m.id,
    title: `${m.teams.home.name} - ${m.teams.away.name}`,
    start: m.date,
    extendedProps: { matchId: m.id, status: m.status },
  }));

  const calendar = initCalendar("#calendar", {
    initialEvents: fcEvents,
    async onDateClick(info) {
      highlightSelectedDay(info.dateStr);
      const matchesOnDate = await loadMatchesForDate(refereeId, info.dateStr);
      renderMatchesOnDashboard(matchesOnDate, "#matches-panel");
    },
    onEventClick(event, info) {
      console.log("event clicked", event.id, event.extendedProps);
    },
  });

  // za brisanje:
  // destroyCalendar(calendar);
});

export async function initMatches() {
  const refereeId = 2; // logged-in user
  const matches = await loadMatches(refereeId);

  renderPastMatches(matches);
  renderScheduledMatches(matches);
}

export function initPlayerActionsDelegation(rootSelector = ".players") {
  const root = document.querySelector(rootSelector) || document;

  root.addEventListener("click", (e) => {
    const playerEl = e.target.closest(".player-card");
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
    if (!officialEl) return;
    officialClickHandler(officialEl);
  });
}