import { initTabs, initHamburgerMenu } from "./views/commonView.js";
import {
  //initDashboard,
  initMatches,
  initPlayerActionsDelegation,
  initOfficialActionsDelegation,
  //startGameButton
} from "./controllers/matchesController.js";

initTabs();
//initDashboard();
initMatches();
initPlayerActionsDelegation();
initOfficialActionsDelegation();
initHamburgerMenu();
//startGameButton();
