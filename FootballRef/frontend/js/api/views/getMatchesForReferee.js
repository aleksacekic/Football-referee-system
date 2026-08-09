import { matches } from "../domain/matches.js";
import { buildMatchDetails } from "./buildMatchDetails.js";

export function getMatchesForReferee(refereeUserId, date = null) {
  return matches
    .filter((match) => match.officials.some((o) => o.userId === refereeUserId))
    .filter((match) => !date || match.date === date)
    .map(buildMatchDetails);
}