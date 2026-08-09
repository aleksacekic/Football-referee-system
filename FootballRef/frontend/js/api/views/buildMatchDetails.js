import { matches } from "../domain/matches.js";
import { teams } from "../domain/teams.js";
import { leagues } from "../domain/leagues.js";
import { users } from "../domain/users.js";
import { matchTimes } from "../domain/matchTimes.js";
import { matchLineups } from "../domain/matchLineups.js";
import { teamMembers } from "../domain/teamMembers.js";
import { getEventsForMatch } from "../domain/matchEvents.js";
import { formatScore, computeLiveScore } from "./matchScore.js";

function getPlayerAction(playerId, events) {
  const relevant = events.filter(
    (e) =>
      e.playerId === playerId ||
      e.playerOutId === playerId ||
      e.playerInId === playerId
  );
  if (relevant.length === 0) return "";

  return relevant
    .map((e) => {
      if (e.type === "SUBSTITUTION") {
        const label = e.playerOutId === playerId ? "OUT" : "IN";
        return `SUBSTITUTION ${label} (${e.minute}')`;
      }
      const reason = e.reason ? ` — ${e.reason}` : "";
      return `${e.type} (${e.minute}')${reason}`;
    })
    .join(", ");
}

function mapPlayers(playerIds, events) {
  return playerIds.map((playerId) => {
    const person = teamMembers.find((p) => p.id === playerId);
    return {
      id: playerId,
      num: person?.number ?? "",
      name: `${person?.firstName} ${person?.lastName}`,
      action: getPlayerAction(playerId, events),
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

export function buildMatchDetails(match) {
  const league = leagues.find((l) => l.id === match.leagueId);
  const homeTeam = teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match.awayTeamId);
  const homeTeamLineup = matchLineups.find((t) => t.teamId === match.homeTeamId);
  const awayTeamLineup = matchLineups.find((t) => t.teamId === match.awayTeamId);
  const times = matchTimes.filter((t) => t.matchId === match.id);
  const events = getEventsForMatch(match.id);
  const status = match.status.toUpperCase();

  const score =
    status === "PLAYED"
      ? formatScore(times)
      : (() => {
          const live = computeLiveScore(
            events,
            match.homeTeamId,
            match.awayTeamId,
            teamMembers
          );
          return `${live.home}:${live.away}`;
        })();

  return {
    id: match.id,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    status,
    datetime: `${match.date} ${match.time}`,
    date: match.date,
    competition: `${league.name} ${league.season}`,
    stadium: match.location,
    teams: {
      home: { name: homeTeam.name, logo: homeTeam.logo },
      away: { name: awayTeam.name, logo: awayTeam.logo },
      score,
    },
    round: match.round,
    // string format — koristi ga postojeci prikaz u match-info panelu
    officials: match.officials.map((o) => {
      const user = users.find((u) => u.id === o.userId);
      return `${o.role}: ${user.firstName}`;
    }),
    // raw format — koristi ga AuthService za permisije
    officialsRaw: match.officials.map((o) => ({
      userId: o.userId,
      role: o.role,
    })),
    matchTimes: times.map((t) => ({
      phase: t.phase,
      start: t.start,
      end: t.end,
      extra: t.extraMinutes,
      result: `${t.homeGoals}:${t.awayGoals}`,
    })),
    players: {
      home: {
        starting: mapPlayers(homeTeamLineup?.startingPlayers ?? [], events),
        substitutes: mapPlayers(homeTeamLineup?.benchPlayers ?? [], events),
        officials: mapOfficials(homeTeamLineup?.staffIds ?? []),
      },
      away: {
        starting: mapPlayers(awayTeamLineup?.startingPlayers ?? [], events),
        substitutes: mapPlayers(awayTeamLineup?.benchPlayers ?? [], events),
        officials: mapOfficials(awayTeamLineup?.staffIds ?? []),
      },
    },
  };
}

export function getMatchDetailsById(matchId) {
  const match = matches.find((m) => m.id === Number(matchId));
  return match ? buildMatchDetails(match) : null;
}