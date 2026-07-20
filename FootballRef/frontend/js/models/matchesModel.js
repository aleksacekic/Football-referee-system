// import { fetchMatches, fetchMatchesForDate } from "../api/domain/fakeData.js";

// let state = {
//   matches: [],
//   matchesForDate: [],
// };

// export async function loadMatches() {
//   const data = await fetchMatches();
//   state.matches = data;
//   return state.matches;
// }

// export async function loadMatchesForDate() {
//   const data = await fetchMatchesForDate();
//   state.matchesForDate = data;
//   return state.matchesForDate;
// }

// //dobra praksa - GETERI
// export function getMatches() {
//   return state.matches;
// }

// export function getMatchesForDate() {
//   return state.matchesForDate;
// }

import { getMatchesForReferee } from "../api/views/getMatchesForReferee.js";

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