import { matches } from "../domain/matches.js";
import { teams } from "../domain/teams.js";
import { leagues } from "../domain/leagues.js";
import { users } from "../domain/users.js";
import { matchTimes } from "../domain/matchTimes.js";
import { matchLineups } from "../domain/matchLineups.js";
import { teamMembers } from "../domain/teamMembers.js";
import { matchEvents } from "../domain/matchEvents.js";

function parseScore(score) {
  if (!score || score === "-:-") return null;
  const [home, away] = score.split(":").map(Number);
  return { home, away };
}

console.log(parseScore("3:5"));

function createEmptyStats(team) {
  return {
    teamId: team.id,
    teamName: team.name,
    short: team.shortName,
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

export function buildLeagueStandings() {
  return leagues.map((league) => {
    const leagueTeams = teams.filter((t) => t.leagueId === league.id);
    const leagueMatches = matches.filter(
      (m) => m.leagueId === league.id && m.status === "PLAYED"
    );

    const table = leagueTeams.map(createEmptyStats);

    leagueMatches.forEach((match) => {
        //console.log(leagueMatches);
        const matchTajms = matchTimes.filter((t) => t.matchId === match.id);
        const score = {
            away: matchTajms[1].awayGoals,
            home: matchTajms[1].homeGoals,
        }
      if (!score) return;

      const home = table.find((t) => t.teamId === match.homeTeamId);
      const away = table.find((t) => t.teamId === match.awayTeamId);

      home.played++;
      away.played++;

      home.goalsFor += score.home;
      home.goalsAgainst += score.away;

      away.goalsFor += score.away;
      away.goalsAgainst += score.home;

      if (score.home > score.away) {
        home.w++;
        home.points += 3;
        away.l++;
      } else if (score.home < score.away) {
        away.w++;
        away.points += 3;
        home.l++;
      } else {
        home.d++;
        away.d++;
        home.points++;
        away.points++;
      }
    });

    console.log(table);

    const standings = table
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst)
      )
      .map((team, index) => ({
        pos: index + 1,
        teamName: team.teamName,
        short: team.short,
        logo: team.logo,
        played: team.played,
        w: team.w,
        d: team.d,
        l: team.l,
        g: `${team.goalsFor}:${team.goalsAgainst}`,
        gd: `${team.goalsFor - team.goalsAgainst >= 0 ? "+" : ""}${
          team.goalsFor - team.goalsAgainst
        }`,
        points: team.points,
      }));

    return {
      leagueName: league.name,
      standings,
    };
  });
}
