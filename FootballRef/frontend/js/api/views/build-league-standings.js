import { matches } from "../domain/matches.js";
import { teams } from "../domain/teams.js";
import { leagues } from "../domain/leagues.js";
import { matchTimes } from "../domain/match-times.js";
import { computeFinalScore } from "./match-score.js";

function createEmptyStats(team) {
  return {
    teamId: team.id,
    teamName: team.name,
    short: team.short,
    logo: team.logo,
    played: 0,
    w: 0,
    d: 0,
    l: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function addResult(stats, goalsFor, goalsAgainst) {
  stats.played++;
  stats.goalsFor += goalsFor;
  stats.goalsAgainst += goalsAgainst;

  if (goalsFor > goalsAgainst) {
    stats.w++;
    stats.points += 3;
  } else if (goalsFor < goalsAgainst) {
    stats.l++;
  } else {
    stats.d++;
    stats.points++;
  }
}

const goalDiff = (t) => t.goalsFor - t.goalsAgainst;

// Redosled: bodovi -> gol-razlika -> vise datih golova -> ime (abecedno).
function compareStandings(a, b) {
  return (
    b.points - a.points ||
    goalDiff(b) - goalDiff(a) ||
    b.goalsFor - a.goalsFor ||
    a.teamName.localeCompare(b.teamName)
  );
}

export function buildLeagueStandings() {
  return leagues.map((league) => {
    const table = teams.filter((t) => t.leagueId === league.id).map(createEmptyStats);

    // U tabelu ulaze samo odigrani (zakljucani) mecevi.
    matches
      .filter((m) => m.leagueId === league.id && m.status === "PLAYED")
      .forEach((match) => {
        const score = computeFinalScore(matchTimes.filter((t) => t.matchId === match.id));
        if (score.home === null) return; // odigran, ali bez upisanih poluvremena

        const home = table.find((t) => t.teamId === match.homeTeamId);
        const away = table.find((t) => t.teamId === match.awayTeamId);
        if (!home || !away) {
          console.warn(`Match ${match.id}: team is not in league ${league.id}`);
          return;
        }

        addResult(home, score.home, score.away);
        addResult(away, score.away, score.home);
      });

    const standings = table.sort(compareStandings).map((team, index) => ({
      pos: index + 1,
      teamId: team.teamId,
      teamName: team.teamName,
      short: team.short,
      logo: team.logo,
      played: team.played,
      w: team.w,
      d: team.d,
      l: team.l,
      g: `${team.goalsFor}:${team.goalsAgainst}`,
      gd: `${goalDiff(team) >= 0 ? "+" : ""}${goalDiff(team)}`,
      points: team.points,
    }));

    return {
      leagueId: league.id,
      leagueName: league.name,
      standings,
    };
  });
}
