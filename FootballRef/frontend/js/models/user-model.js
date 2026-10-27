import { users } from "../api/domain/users.js";
import { getCurrentUser } from "../services/auth-service.js";

// Profil trenutno ulogovanog korisnika (ime, email, slika...).
export function loadCurrentUserProfile() {
  const { userId } = getCurrentUser();
  return users.find((u) => u.id === userId) ?? null;
}
