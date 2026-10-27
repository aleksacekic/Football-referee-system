import { renderLeagues, showTeamModal } from "../views/leagues-view.js";
import { loadLeagues, loadRecentMatchesForTeam } from "../models/leagues-model.js";

function handleTeamClick(team) {
  showTeamModal(team, loadRecentMatchesForTeam(team.teamId));
}

export async function initLeagues() {
  const leagues = await loadLeagues();
  renderLeagues(leagues, { onTeamClick: handleTeamClick });
}

// Poziva se kad se promeni neki mec (npr. zakljucan kao PLAYED) — tabela se racuna ponovo.
export const refreshLeagues = initLeagues;
