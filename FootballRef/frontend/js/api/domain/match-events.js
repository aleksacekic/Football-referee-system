// Dogadjaji na mecu (golovi, kartoni, izmene).
// Golovi ovde moraju da se slazu sa rezultatom poluvremena u match-times.js.
export const matchEvents = [
  // ---------------- Mec 4: Radnicki - Dubocica 2:1 ----------------
  { id: 1, matchId: 4, teamId: 1, playerId: 1, type: "GOAL", minute: 23 },
  { id: 2, matchId: 4, teamId: 1, playerId: 2, type: "YELLOW_CARD", minute: 55, reason: "Rough start" },
  { id: 3, matchId: 4, teamId: 1, playerId: 4, type: "GOAL", minute: 60 },
  {
    id: 4,
    matchId: 4,
    teamId: 1,
    type: "SUBSTITUTION",
    minute: 70,
    playerOutId: 2, // izlazi Marko Markovic (starter)
    playerInId: 9, // ulazi Luka Lukic (sa klupe)
  },
  { id: 5, matchId: 4, teamId: 2, playerId: 3, type: "GOAL", minute: 75 },

  // ---------------- Mec 5: Pirot - Radnicki 1:0 ----------------
  { id: 6, matchId: 5, teamId: 3, playerId: 15, type: "GOAL", minute: 52 },

  // ---------------- Mec 6: Dubocica - Pirot 1:2 ----------------
  { id: 7, matchId: 6, teamId: 2, playerId: 5, type: "GOAL", minute: 30 },
  { id: 8, matchId: 6, teamId: 3, playerId: 6, type: "GOAL", minute: 40 },
  { id: 9, matchId: 6, teamId: 3, playerId: 6, type: "GOAL", minute: 88 },
];

let nextId = matchEvents.length
  ? Math.max(...matchEvents.map((e) => e.id)) + 1
  : 1;

export function addMatchEvent(event) {
  const newEvent = { id: nextId++, ...event };
  matchEvents.push(newEvent);
  return newEvent;
}

export function getEventsForMatch(matchId) {
  return matchEvents.filter((e) => e.matchId === matchId);
}
