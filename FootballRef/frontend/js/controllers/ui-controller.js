import { loadCurrentUserProfile } from "../models/user-model.js";

const AVATAR_PLACEHOLDER = "/assets/images/avatar-placeholder.jpg";

// Header: ime i slika ulogovanog korisnika (umesto upisanog "Aleksa").
export function initHeader() {
  const user = loadCurrentUserProfile();
  if (!user) return;

  const fullName = `${user.firstName} ${user.lastName}`;

  const nameEl = document.querySelector(".user-name");
  if (nameEl) nameEl.textContent = fullName;

  const avatarEl = document.querySelector(".user-avatar");
  if (avatarEl) {
    avatarEl.src = user.photo || AVATAR_PLACEHOLDER;
    avatarEl.alt = fullName;
  }
}
