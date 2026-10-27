import { matches } from "../domain/matches.js";
import { teams } from "../domain/teams.js";
import { leagues } from "../domain/leagues.js";
import { users } from "../domain/users.js";
import { matchTimes } from "../domain/match-times.js";
import { matchLineups } from "../domain/match-lineups.js";
import { teamMembers } from "../domain/team-members.js";
import { getEventsForMatch } from "../domain/match-events.js";
import { formatScore, computeLiveScore } from "./match-score.js";

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

const STAFF_ROLE_LABELS = {
  HEAD_COACH: "Head coach",
  ASSISTANT_COACH: "Assistant coach",
  GOALKEEPER_COACH: "Goalkeeper coach",
  PHYSIO: "Physiotherapist",
  DOCTOR: "Doctor",
  TEAM_MANAGER: "Team manager",
};

// Vraca clana tima po id-ju. Ako ne postoji, upozori u konzoli —
// to znaci da postava pokazuje na nepostojeci id u fake bazi.
function findMember(memberId) {
  const person = teamMembers.find((p) => p.id === memberId);
  if (!person) console.warn(`Team member with id ${memberId} does not exist`);
  return person ?? null;
}

// Stanje igraca u mecu:
//   ON_PITCH   — na terenu (starter ili usao sa klupe)
//   BENCH      — na klupi, jos nije ulazio (moze da udje)
//   SUBBED_OUT — zamenjen (ne moze ponovo da udje)
//   SENT_OFF   — iskljucen crvenim kartonom
// Racuna se iz postave + dogadjaja hronoloski, pa uvek odgovara podacima.
function computePlayerStates(lineup, events) {
  const states = new Map();
  (lineup?.startingPlayers ?? []).forEach((id) => states.set(id, "ON_PITCH"));
  (lineup?.benchPlayers ?? []).forEach((id) => states.set(id, "BENCH"));

  [...events]
    .sort((a, b) => a.minute - b.minute || a.id - b.id)
    .forEach((e) => {
      if (e.type === "SUBSTITUTION") {
        if (states.has(e.playerOutId)) states.set(e.playerOutId, "SUBBED_OUT");
        if (states.has(e.playerInId)) states.set(e.playerInId, "ON_PITCH");
      } else if (e.type === "RED_CARD" && states.has(e.playerId)) {
        states.set(e.playerId, "SENT_OFF");
      }
    });

  return states;
}

function mapPlayers(playerIds, events, states) {
  return playerIds
    .map(findMember)
    .filter(Boolean)
    .map((person) => ({
      id: person.id,
      num: person.number ?? "",
      name: `${person.firstName} ${person.lastName}`,
      action: getPlayerAction(person.id, events),
      state: states.get(person.id),
    }));
}

function mapSide(lineup, events) {
  const states = computePlayerStates(lineup, events);
  return {
    starting: mapPlayers(lineup?.startingPlayers ?? [], events, states),
    substitutes: mapPlayers(lineup?.benchPlayers ?? [], events, states),
    officials: mapOfficials(lineup?.staffIds ?? []),
  };
}

function mapOfficials(staffIds) {
  return staffIds
    .map(findMember)
    .filter(Boolean)
    .map((person) => ({
      id: person.id,
      role: STAFF_ROLE_LABELS[person.staffRole] ?? person.staffRole,
      name: `${person.firstName} ${person.lastName}`,
    }));
}

const PHASE_ORDER = ["FIRST_HALF", "SECOND_HALF"];

// Za prikaz: rezultat POSLE svake faze (zbirno), iako se u podacima cuvaju
// golovi po poluvremenu. Rezultat se prikazuje tek kad se faza zavrsi.
function mapPhases(times) {
  let home = 0;
  let away = 0;
  return [...times]
    .sort((a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase))
    .map((t) => {
      const ended = Boolean(t.end);
      if (ended) {
        home += t.homeGoals ?? 0;
        away += t.awayGoals ?? 0;
      }
      return {
        phase: t.phase,
        start: t.start ?? "",
        end: t.end ?? "",
        extra: ended ? t.extraMinutes ?? 0 : "",
        result: ended ? `${home}:${away}` : "",
      };
    });
}

// Sledeci korak sudije na mecu, na osnovu statusa i upisanih faza:
// START_FIRST_HALF -> END_FIRST_HALF -> START_SECOND_HALF -> END_GAME -> LOCK.
// null = mec je zakljucan (PLAYED), nema vise koraka.
function getNextGameStep(status, times) {
  if (status === "PLAYED") return null;
  const first = times.find((t) => t.phase === "FIRST_HALF");
  const second = times.find((t) => t.phase === "SECOND_HALF");
  if (!first?.start) return "START_FIRST_HALF";
  if (!first.end) return "END_FIRST_HALF";
  if (!second?.start) return "START_SECOND_HALF";
  if (!second.end) return "END_GAME";
  return "LOCK";
}

// Postava pripada paru (mec, tim) — isti tim ima drugu postavu u svakom mecu.
function findLineup(matchId, teamId) {
  return (
    matchLineups.find((l) => l.matchId === matchId && l.teamId === teamId) ??
    null
  );
}

export function buildMatchDetails(match) {
  const league = leagues.find((l) => l.id === match.leagueId);
  const homeTeam = teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match.awayTeamId);
  const homeTeamLineup = findLineup(match.id, match.homeTeamId);
  const awayTeamLineup = findLineup(match.id, match.awayTeamId);
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
    // raw format — koristi ga auth-service.js za permisije
    officialsRaw: match.officials.map((o) => ({
      userId: o.userId,
      role: o.role,
    })),
    matchTimes: mapPhases(times),
    nextGameStep: getNextGameStep(status, times),
    players: {
      home: mapSide(homeTeamLineup, events),
      away: mapSide(awayTeamLineup, events),
    },
  };
}

export function getMatchDetailsById(matchId) {
  const match = matches.find((m) => m.id === Number(matchId));
  return match ? buildMatchDetails(match) : null;
}