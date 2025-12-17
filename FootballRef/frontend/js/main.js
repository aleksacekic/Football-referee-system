import { initTabs, initHamburgerMenu } from "./views/commonView.js";
import {
  //initDashboard,
  initMatches,
  initPlayerActionsDelegation,
  initOfficialActionsDelegation,
  //startGameButton
} from "./controllers/matchesController.js";
import { initLeagues } from "./controllers/leaguesController.js";

initTabs();
//initDashboard();
initMatches();
initPlayerActionsDelegation();
initOfficialActionsDelegation();
initHamburgerMenu();
initLeagues();

