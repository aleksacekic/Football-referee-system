import { getMatchesForReferee } from "../api/views/get-matches-for-referee.js";
import { getMatchDetailsById } from "../api/views/build-match-details.js";
import { addMatchEvent } from "../api/domain/match-events.js";
import { matches } from "../api/domain/matches.js";
import {
  getTimesForMatch,
  startMatchPhase,
  endMatchPhase,
} from "../api/domain/match-times.js";

const HALF_LENGTH_MINUTES = 45;

let state = {
  allMatches: [],
  panelMatches: [],
};

export async function loadMatches(refereeUserId) {
  state.allMatches = getMatchesForReferee(refereeUserId);
  return state.allMatches;
}

export async function loadMatchesForDate(refereeUserId, date) {
  state.panelMatches = getMatchesForReferee(refereeUserId, date);
  return state.panelMatches;
}

export function getMatches() {
  return state.allMatches;
}

export function getPanelMatches() {
  return state.panelMatches;
}

export function loadMatchDetails(matchId) {
  return getMatchDetailsById(matchId);
}

export function submitMatchEvent(eventPayload) {
  addMatchEvent(eventPayload);
  return getMatchDetailsById(eventPayload.matchId);
}

export function updateMatchStatus(matchId, newStatus) {
  const match = matches.find((m) => m.id === Number(matchId));
  if (match) match.status = newStatus;
  return getMatchDetailsById(matchId);
}

// ---------------------------------------------------------------------------
// Tok meca (dugme START GAME / END 1st HALF / ... / LOCK AS PLAYED)
// ---------------------------------------------------------------------------

function nowHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function minutesBetween(startHHMM, endHHMM) {
  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const diff = toMinutes(endHHMM) - toMinutes(startHHMM);
  return diff >= 0 ? diff : diff + 24 * 60; // preko ponoci
}

// Zatvara poluvreme: golovi U TOM poluvremenu = trenutni rezultat (iz dogadjaja)
// minus golovi iz ranije zavrsenih poluvremena.
function finishPhase(matchId, phase, details) {
  const [liveHome, liveAway] = details.teams.score.split(":").map(Number);
  const earlier = getTimesForMatch(matchId).filter((t) => t.phase !== phase && t.end);
  const earlierHome = earlier.reduce((sum, t) => sum + t.homeGoals, 0);
  const earlierAway = earlier.reduce((sum, t) => sum + t.awayGoals, 0);

  const time = getTimesForMatch(matchId).find((t) => t.phase === phase);
  const end = nowHHMM();

  endMatchPhase(matchId, phase, {
    end,
    extraMinutes: Math.max(0, minutesBetween(time.start, end) - HALF_LENGTH_MINUTES),
    homeGoals: liveHome - earlierHome,
    awayGoals: liveAway - earlierAway,
  });
}

// Izvrsava sledeci korak (details.nextGameStep) i vraca osvezene detalje meca.
export function advanceGameStep(matchId) {
  const id = Number(matchId);
  const match = matches.find((m) => m.id === id);
  const details = getMatchDetailsById(id);
  if (!match || !details) return null;

  switch (details.nextGameStep) {
    case "START_FIRST_HALF":
      startMatchPhase(id, "FIRST_HALF", nowHHMM());
      match.status = "LIVE";
      break;
    case "END_FIRST_HALF":
      finishPhase(id, "FIRST_HALF", details);
      break;
    case "START_SECOND_HALF":
      startMatchPhase(id, "SECOND_HALF", nowHHMM());
      break;
    case "END_GAME":
      finishPhase(id, "SECOND_HALF", details);
      break;
    case "LOCK":
      match.status = "PLAYED";
      break;
    default:
      return details; // mec je vec zakljucan
  }

  return getMatchDetailsById(id);
}
