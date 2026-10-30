import { users } from "../api/domain/users.js";

// Fake sesija — zamenice se pravim loginom (JWT / cookie) kad backend proradi.
// Cuva se u sessionStorage: prezivi osvezavanje stranice, brise se zatvaranjem taba.
const SESSION_KEY = "footballref.session";

// Gde korisnik ide posle prijave, prema ulozi naloga.
const HOME_PAGE_BY_ROLE = {
  referee: "/dashboard.html",
  "super-admin": "/dashboard.html",
  "club-representative": "/club-representative.html",
};

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage nije dostupan (npr. privatni prozor) — sesija vazi do osvezavanja
  }
}

let currentSession = readSession(); // { userId, role } ili null

export function getCurrentUser() {
  return currentSession;
}

export function isLoggedIn() {
  return currentSession !== null;
}

export function getHomePage(role = currentSession?.role) {
  return HOME_PAGE_BY_ROLE[role] ?? "/";
}

// Fake prijava: korisnik se trazi po email-u iz users.js, lozinka se jos NE proverava.
// Vraca korisnika ili null ako email ne postoji.
export function login(email) {
  const normalized = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalized);
  if (!user) return null;

  currentSession = { userId: user.id, role: user.role };
  writeSession(currentSession);
  return user;
}

export function logout() {
  currentSession = null;
  writeSession(null);
}

// Stranice koje traze prijavu ovo pozivaju prve. Ako korisnik nije prijavljen
// (ili nema odgovarajucu ulogu), salje ga na login i vraca false.
export function requireLogin(allowedRoles = null) {
  const allowed = isLoggedIn() && (!allowedRoles || allowedRoles.includes(currentSession.role));
  if (!allowed) location.replace("/");
  return allowed;
}

// Koristi ovo rucno u konzoli dok testiras razlicite uloge:
// import { setCurrentUser } from "/js/services/auth-service.js"
export function setCurrentUser(userId, role) {
  currentSession = { userId, role };
  writeSession(currentSession);
}

function getAssignmentForMatch(matchDetails) {
  if (!currentSession) return null;
  const { userId } = currentSession;
  return matchDetails.officialsRaw.find((o) => o.userId === userId) || null;
}

export function canEditMatch(matchDetails) {
  if (!currentSession) return false;
  if (currentSession.role === "super-admin") return true;
  if (matchDetails.status === "PLAYED") return false;

  const assignment = getAssignmentForMatch(matchDetails);
  if (!assignment) return false;

  return ["REFEREE", "DELEGATE"].includes(assignment.role);
}

export function canSetMatchToPlayed(matchDetails) {
  if (matchDetails.status !== "LIVE") return false;

  const assignment = getAssignmentForMatch(matchDetails);
  return assignment?.role === "REFEREE";
}

// Sme li trenutni korisnik da izvrsi sledeci korak meca (START GAME ... LOCK).
// Zakljucavanje (LOCK) sme samo glavni sudija; ostale korake svako ko sme da menja mec.
export function canRunGameStep(matchDetails) {
  const step = matchDetails.nextGameStep;
  if (!step) return false;
  if (step === "LOCK") return canSetMatchToPlayed(matchDetails);
  return canEditMatch(matchDetails);
}
