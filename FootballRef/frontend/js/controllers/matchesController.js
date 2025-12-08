// main.js (ili matchesController.js)
import { initCalendar, destroyCalendar } from "../views/matchView.js";
import { loadMatchesForDate } from "../models/matchesModel.js";

document.addEventListener("DOMContentLoaded", async () => {
  const matches = await loadMatchesForDate();
  console.log(matches);
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
