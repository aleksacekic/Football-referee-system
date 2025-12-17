import { fetchLeagues } from "../api/domain/fakeData.js";

let state = {
  leagues: [],
};

export async function loadLeagues() {
  const data = await fetchLeagues();
  state.leagues = data;
  return state.leagues;
}

//dobra praksa - GETERI
export function getLeagues() {
  return state.leagues;
}
