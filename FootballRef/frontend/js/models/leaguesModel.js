// import { fetchLeagues } from "../api/domain/fakeData.js";

// let state = {
//   leagues: [],
// };

// export async function loadLeagues() {
//   const data = await fetchLeagues();
//   state.leagues = data;
//   return state.leagues;
// }

// //dobra praksa - GETERI
// export function getLeagues() {
//   return state.leagues;
// }


import { buildLeagueStandings } from "../api/views/buildLeagueStandings.js";


let state = {
  leagues: [],
};

export async function loadLeagues() {
  state.leagues = buildLeagueStandings();
  //console.log(state.matches);
  return state.leagues;
}


export function getLeagues() {
  return state.leagues;
}
