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

import { getMatchesForReferee } from "../api/views/getMatchesForReferee.js"
let state = {
  matches: [],
};

export async function loadMatches(refereeUserId) {
  state.matches = getMatchesForReferee(refereeUserId);
  //console.log(state.matches);
  return state.matches;
}


export function getMatches() {
  return state.matches;
}
