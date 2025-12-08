import { fetchMatches, fetchMatchesForDate } from "../api/fakeData.js";

let state = {
  matches: [],
  matchesForDate: [],
};

export async function loadMatches() {
  const data = await fetchMatches();
  state.matches = data;
  return state.matches;
}

export async function loadMatchesForDate() {
  const data = await fetchMatchesForDate();
  state.matchesForDate = data;
  return state.matchesForDate;
}

//dobra praksa - GETERI
export function getMatches() {
  return state.matches;
}

export function getMatchesForDate() {
  return state.matchesForDate;
}
