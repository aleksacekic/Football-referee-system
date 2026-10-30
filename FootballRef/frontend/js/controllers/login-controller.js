import { login, isLoggedIn, getHomePage } from "../services/auth-service.js";

// Ako je korisnik vec prijavljen, nema potrebe za login stranicom.
if (isLoggedIn()) {
  location.replace(getHomePage());
}

const form = document.querySelector(".login-form");
const emailInput = document.getElementById("email");
const errorEl = document.getElementById("loginError");

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  // Fake prijava po email-u (lozinka se proverava tek kad dodje backend).
  const user = login(emailInput.value);
  if (!user) {
    errorEl.textContent = "No account with that email.";
    errorEl.hidden = false;
    return;
  }

  location.href = getHomePage(user.role);
});

emailInput?.addEventListener("input", () => {
  errorEl.hidden = true;
});
