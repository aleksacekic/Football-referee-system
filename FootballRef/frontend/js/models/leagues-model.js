import { buildLeagueStandings } from "../api/views/build-league-standings.js";
import { getRecentMatchesForTeam } from "../api/views/get-recent-matches-for-team.js";

let state = {
  leagues: [],
};

export async function loadLeagues() {
  state.leagues = buildLeagueStandings();
  return state.leagues;
}

export function getLeagues() {
  return state.leagues;
}

export function loadRecentMatchesForTeam(teamId) {
  return getRecentMatchesForTeam(teamId);
}
