import { initTabs, initBottomNav } from "./views/common-view.js";
import {
  initMatches,
  initPlayerActionsDelegation,
  initOfficialActionsDelegation,
} from "./controllers/matches-controller.js";
import { initLeagues } from "./controllers/leagues-controller.js";
import { initHeader } from "./controllers/ui-controller.js";

initHeader();
initTabs();
initBottomNav();

initMatches();
initPlayerActionsDelegation();
initOfficialActionsDelegation();
initLeagues();
