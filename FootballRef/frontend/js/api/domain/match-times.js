// Faze meca (poluvremena).
// homeGoals / awayGoals = golovi postignuti U TOM POLUVREMENU (ne zbirno stanje).
// Konacan rezultat = zbir svih faza (vidi computeFinalScore u match-score.js).
// Primer: 1. pol. 1:0, 2. pol. 1:1  ->  konacno 2:1.
export const matchTimes = [
  // Mec 4: Radnicki - Dubocica 2:1
  {
    id: 1,
    matchId: 4,
    phase: "FIRST_HALF",
    start: "15:01",
    end: "15:46",
    extraMinutes: 1,
    homeGoals: 1,
    awayGoals: 0,
  },
  {
    id: 2,
    matchId: 4,
    phase: "SECOND_HALF",
    start: "16:00",
    end: "16:48",
    extraMinutes: 3,
    homeGoals: 1,
    awayGoals: 1,
  },

  // Mec 5: Pirot - Radnicki 1:0
  {
    id: 3,
    matchId: 5,
    phase: "FIRST_HALF",
    start: "16:01",
    end: "16:46",
    extraMinutes: 1,
    homeGoals: 0,
    awayGoals: 0,
  },
  {
    id: 4,
    matchId: 5,
    phase: "SECOND_HALF",
    start: "17:00",
    end: "17:48",
    extraMinutes: 3,
    homeGoals: 1,
    awayGoals: 0,
  },

  // Mec 6: Dubocica - Pirot 1:2
  {
    id: 5,
    matchId: 6,
    phase: "FIRST_HALF",
    start: "12:01",
    end: "12:46",
    extraMinutes: 1,
    homeGoals: 1,
    awayGoals: 1,
  },
  {
    id: 6,
    matchId: 6,
    phase: "SECOND_HALF",
    start: "13:00",
    end: "13:49",
    extraMinutes: 4,
    homeGoals: 0,
    awayGoals: 1,
  },
];

let nextId = matchTimes.length ? Math.max(...matchTimes.map((t) => t.id)) + 1 : 1;

export function getTimesForMatch(matchId) {
  return matchTimes.filter((t) => t.matchId === matchId);
}

// Pocetak faze — kraj i golovi se upisuju kasnije, preko endMatchPhase.
export function startMatchPhase(matchId, phase, start) {
  const time = {
    id: nextId++,
    matchId,
    phase,
    start,
    end: null,
    extraMinutes: 0,
    homeGoals: 0,
    awayGoals: 0,
  };
  matchTimes.push(time);
  return time;
}

export function endMatchPhase(matchId, phase, { end, extraMinutes, homeGoals, awayGoals }) {
  const time = matchTimes.find((t) => t.matchId === matchId && t.phase === phase);
  if (!time) return null;
  Object.assign(time, { end, extraMinutes, homeGoals, awayGoals });
  return time;
}
