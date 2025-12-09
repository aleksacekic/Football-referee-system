import { initTabs } from "./views/commonView.js";
import {
  initDashboard,
  initMatches,
  initPlayerActionsDelegation,
} from "./controllers/matchesController.js";

initTabs();
initDashboard();
initMatches();
initPlayerActionsDelegation();
