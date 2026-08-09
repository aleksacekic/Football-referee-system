import { getMatchesForReferee } from "../api/views/getMatchesForReferee.js";
import { getMatchDetailsById } from "../api/views/buildMatchDetails.js";
import { addMatchEvent } from "../api/domain/matchEvents.js";
import { matches } from "../api/domain/matches.js";

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