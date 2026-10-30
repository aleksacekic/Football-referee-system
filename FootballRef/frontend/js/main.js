import { initTabs, initBottomNav } from "./views/common-view.js";
import { initMatches, initMatchTabActions } from "./controllers/matches-controller.js";
import { initLeagues } from "./controllers/leagues-controller.js";
import { initHeader, initLogout } from "./controllers/ui-controller.js";
import { requireLogin } from "./services/auth-service.js";

// Dashboard je za sudije (i admina). Bez prijave -> nazad na login.
if (requireLogin(["referee", "super-admin"])) {
  initHeader();
  initLogout();
  initTabs();
  initBottomNav();

  initMatches();
  initMatchTabActions();
  initLeagues();
}
