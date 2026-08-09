// Fake sesija — zamenice se pravim loginom kad backend proradi.
const currentSession = {
  userId: 2,
  role: "referee", // tip naloga: referee | club-representative | super-admin
};

export function getCurrentUser() {
  return currentSession;
}

// Koristi ovo rucno u konzoli dok testiras razlicite uloge:
// import { setCurrentUser } from "./js/services/AuthService.js"
export function setCurrentUser(userId, role) {
  currentSession.userId = userId;
  currentSession.role = role;
}

function getAssignmentForMatch(matchDetails) {
  const { userId } = currentSession;
  return (
    matchDetails.officialsRaw.find((o) => o.userId === userId) || null
  );
}

export function canEditMatch(matchDetails) {
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