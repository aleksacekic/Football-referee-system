import { initTabs, initBottomNav } from "./views/commonView.js";
import {
  //initDashboard,
  initMatches,
  initPlayerActionsDelegation,
  initOfficialActionsDelegation,
  //startGameButton
} from "./controllers/matchesController.js";
import { initLeagues } from "./controllers/leaguesController.js";


initTabs();
initBottomNav();

initMatches();
initPlayerActionsDelegation();
initOfficialActionsDelegation();
initLeagues();

