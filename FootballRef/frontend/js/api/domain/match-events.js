export const matchEvents = [
  {
    id: 1,
    matchId: 1,
    teamId: 1,
    playerId: 1,
    type: "GOAL",
    minute: 23,
  },
  {
    id: 2,
    matchId: 1,
    teamId: 1,
    playerId: 2,
    type: "YELLOW_CARD",
    minute: 55,
  },
  {
    id: 3,
    matchId: 1,
    teamId: 1,
    type: "SUBSTITUTION",
    minute: 70,
    playerOutId: 11,
    playerInId: 12,
  },
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