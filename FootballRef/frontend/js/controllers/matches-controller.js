import {
  initCalendar,
  renderMatchesOnDashboard,
  renderPastMatches,
  renderScheduledMatches,
  initMatchClickHandler,
} from "../views/matches-view.js";
import { showMatchDetailsModal } from "../views/match-details-view.js";
import { openMatchActionForm } from "../views/match-action-form.js";
import {
  loadMatches,
  loadMatchesForDate,
  loadMatchDetails,
  submitMatchEvent,
  advanceGameStep,
} from "../models/matches-model.js";
import { getCurrentUser, canEditMatch } from "../services/auth-service.js";
import { refreshLeagues } from "./leagues-controller.js";

let calendarInstance = null;
let selectedDate = getTodayIsoDate(); // dan izabran u kalendaru (panel desno)

const currentUserId = () => getCurrentUser().userId;

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

function toCalendarEvents(matches) {
  return matches.map((m) => ({
    id: String(m.id),
    title: `${m.teams.home.name} - ${m.teams.away.name}`,
    start: m.date,
    extendedProps: { matchId: m.id, status: m.status },
  }));
}

async function renderDashboardPanel() {
  const matchesOnDate = await loadMatchesForDate(currentUserId(), selectedDate);
  renderMatchesOnDashboard(matchesOnDate, "#matches-panel");
}

// Posle svake promene (dogadjaj na mecu, korak meca) sve prikaze crtamo
// ponovo iz podataka — kalendar, panel, oba taba i tabelu lige.
async function refreshAllViews() {
  const matches = await loadMatches(currentUserId());

  renderPastMatches(matches);
  renderScheduledMatches(matches, { onGameStep: handleGameStep });
  await renderDashboardPanel();

  if (calendarInstance) {
    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(toCalendarEvents(matches));
  }

  await refreshLeagues();
}

// START GAME / END 1st HALF / START 2nd HALF / END GAME / LOCK
function handleGameStep(matchId) {
  advanceGameStep(matchId);
  refreshAllViews();
}

function openMatchModal(matchId) {
  const details = loadMatchDetails(matchId);
  if (!details) return;

  showMatchDetailsModal(details, {
    onActionAdded: (eventPayload) => {
      const updated = submitMatchEvent(eventPayload);
      refreshAllViews();
      return updated;
    },
    onGameStep: handleGameStep,
  });
}

export async function initMatches() {
  const matches = await loadMatches(currentUserId());

  renderPastMatches(matches);
  renderScheduledMatches(matches, { onGameStep: handleGameStep });
  await renderDashboardPanel();

  initMatchClickHandler("#matches-panel", openMatchModal);

  calendarInstance = initCalendar("#calendar", {
    initialEvents: toCalendarEvents(matches),
    async onDateClick(info) {
      selectedDate = info.dateStr;
      highlightSelectedDay(selectedDate);
      await renderDashboardPanel();
    },
    onEventClick(event) {
      openMatchModal(event.extendedProps.matchId);
    },
  });
  highlightSelectedDay(selectedDate);

  const dashboardTab = document.getElementById("tab-dashboard");
  if (dashboardTab) {
    dashboardTab.addEventListener("shown.bs.tab", () => {
      calendarInstance?.updateSize();
    });
  }
}

// Klikovi na igrace/sluzbena lica u tabovima "Scheduled" i "Past".
// Slusamo SAMO na ta dva kontejnera (postoje u HTML-u od starta) — ne na
// celom document-u, jer bi inace hvatali i klikove u modalu sa dashboard-a,
// pa bi se otvarale dve forme jedna preko druge.
const MATCH_TAB_ROOTS = [".scheduled-matches-root", ".past-matches-root"];

// Ista forma kao u modalu; dogadjaj ide u podatke, pa se svi prikazi osveze.
// Da li sme da se menja odlucuje auth-service na osnovu podataka o mecu
// (status + uloga korisnika), a ne tekst sa stranice.
function handleMemberClick(matchId, memberId) {
  const details = loadMatchDetails(matchId);
  if (!details || !canEditMatch(details)) return;

  openMatchActionForm(details, memberId, (eventPayload) => {
    submitMatchEvent(eventPayload);
    refreshAllViews();
  });
}

export function initMatchTabActions(rootSelectors = MATCH_TAB_ROOTS) {
  rootSelectors.forEach((selector) => {
    const root = document.querySelector(selector);
    if (!root) return;
    root.addEventListener("click", (e) => {
      const item = e.target.closest("[data-member-id]");
      const matchId = item?.closest(".match-info")?.dataset.matchId;
      if (item && matchId) handleMemberClick(Number(matchId), Number(item.dataset.memberId));
    });
  });
}
