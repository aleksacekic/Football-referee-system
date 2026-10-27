import { renderLeagues } from "../views/leagues-view.js";

import { loadLeagues } from "../models/leagues-model.js";
export async function initLeagues() {
  // const leagues = await loadLeagues();

  // renderLeagues(leagues);
  const leagues = await loadLeagues();
  
  renderLeagues(leagues);
}



