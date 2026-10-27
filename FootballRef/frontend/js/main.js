import { initTabs, initBottomNav } from "./views/common-view.js";
import {
  //initDashboard,
  initMatches,
  initPlayerActionsDelegation,
  initOfficialActionsDelegation,
  //startGameButton
} from "./controllers/matches-controller.js";
import { initLeagues } from "./controllers/leagues-controller.js";


initTabs();
initBottomNav();

initMatches();
initPlayerActionsDelegation();
initOfficialActionsDelegation();
initLeagues();

