import { renderLeagues } from "../views/leagueView.js";

import { loadLeagues } from "../models/leaguesModel.js";
export async function initLeagues() {
  // const leagues = await loadLeagues();

  // renderLeagues(leagues);
  const leagues = await loadLeagues();
  
  renderLeagues(leagues);
}



