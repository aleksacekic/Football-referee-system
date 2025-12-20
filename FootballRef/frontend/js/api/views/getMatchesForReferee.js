import { matches } from "../domain/matches.js";
import { teams } from "../domain/teams.js";
import { leagues } from "../domain/leagues.js";
import { users } from "../domain/users.js";
import { matchTimes } from "../domain/matchTimes.js";
import { matchLineups } from "../domain/matchLineups.js";
import { teamMembers } from "../domain/teamMembers.js";
import { matchEvents } from "../domain/matchEvents.js";

export function getMatchesForReferee(refereeUserId) {
  return matches
    .filter((match) => match.officials.some((o) => o.userId === refereeUserId))
    .map((match) => {
      const league = leagues.find((l) => l.id === match.leagueId);
      const homeTeam = teams.find((t) => t.id === match.homeTeamId);
      const awayTeam = teams.find((t) => t.id === match.awayTeamId);
      const homeTeamLineup = matchLineups.find(
        (t) => t.id === match.homeTeamId
      );
      const awayTeamLineup = matchLineups.find(
        (t) => t.id === match.awayTeamId
      );

      function getPlayerAction(playerId) {
        const events = matchEvents.filter((e) => e.personId === playerId);

        if (events.length === 0) return "";

        return events.map((e) => `${e.type} (${e.minute}')`).join(", ");
      }

      function mapPlayers(playerIds) {
        return playerIds.map((playerId) => {
          const person = teamMembers.find((p) => p.id === playerId);

          return {
            num: person?.number ?? "",
            name: `${person?.firstName} ${person?.lastName}`,
            action: getPlayerAction(playerId),
          };
        });
      }

      function mapOfficials(staffIds) {
        return staffIds.map((staffId) => {
          const person = teamMembers.find((p) => p.id === staffId);

          return {
            role: person?.role,
            name: `${person?.firstName} ${person?.lastName}`,
          };
        });
      }

      const times = matchTimes.filter((t) => t.matchId === match.id);

      return {
        id: match.id,
        status: match.status.toUpperCase(), // SCHEDULED | LIVE | PLAYED
        datetime: `${match.date} ${match.time}`,
        competition: `${league.name} ${league.season}`,
        stadium: match.location,
        teams: {
          home: {
            name: homeTeam.name,
            logo: homeTeam.logo,
          },
          away: {
            name: awayTeam.name,
            logo: awayTeam.logo,
          },
          score: buildScore(times),
        },
        round: match.round,

        officials: match.officials.map((o) => {
          const user = users.find((u) => u.id === o.userId);
          return `${o.role}: ${user.firstName}`;
        }),

        matchTimes: times.map((t) => ({
          phase: t.phase,
          start: t.start,
          end: t.end,
          extra: t.extraMinutes,
          result: `${t.homeGoals}:${t.awayGoals}`,
        })),
        players: {
          home: {
            starting: mapPlayers(homeTeamLineup?.startingPlayers ?? []),
            substitutes: mapPlayers(homeTeamLineup?.benchPlayers ?? []),
            officials: mapOfficials(homeTeamLineup?.staffIds ?? []),
          },
          away: {
            starting: mapPlayers(awayTeamLineup?.startingPlayers ?? []),
            substitutes: mapPlayers(awayTeamLineup?.benchPlayers ?? []),
            officials: mapOfficials(awayTeamLineup?.staffIds ?? []),
          },
        },
      };
    });
}

function buildScore(times) {
  if (!times.length) return "-:-";

  const home = times.reduce((s, t) => s + t.homeGoals, 0);
  const away = times.reduce((s, t) => s + t.awayGoals, 0);
  return `${home}:${away}`;
}
