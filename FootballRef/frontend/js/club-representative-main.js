import { initLogout } from "./controllers/ui-controller.js";
import { requireLogin } from "./services/auth-service.js";

// Ulazna tacka za club-representative.html (kao main.js za dashboard).
if (requireLogin(["club-representative", "super-admin"])) {
  initLogout("#logoutBtn");
}
