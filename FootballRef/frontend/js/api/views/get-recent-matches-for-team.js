import { matches } from "../domain/matches.js";
import { teams } from "../domain/teams.js";
import { getTimesForMatch } from "../domain/match-times.js";
import { computeFinalScore } from "./match-score.js";

// Poslednji odigrani mecevi tima, najnoviji prvi — rezultat iz ugla tog tima.
export function getRecentMatchesForTeam(teamId, limit = 5) {
  return matches
    .filter(
      (m) => m.status === "PLAYED" && (m.homeTeamId === teamId || m.awayTeamId === teamId)
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((m) => {
      const isHome = m.homeTeamId === teamId;
      const opponent = teams.find((t) => t.id === (isHome ? m.awayTeamId : m.homeTeamId));
      const score = computeFinalScore(getTimesForMatch(m.id));
      if (score.home === null) return null; // nema upisanih poluvremena

      const goalsFor = isHome ? score.home : score.away;
      const goalsAgainst = isHome ? score.away : score.home;
      return {
        matchId: m.id,
        date: m.date,
        opponent: opponent?.name ?? "Unknown team",
        venue: isHome ? "H" : "A",
        score: `${goalsFor}:${goalsAgainst}`,
        outcome: goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D",
      };
    })
    .filter(Boolean)
    .slice(0, limit);
}
