export function computeFinalScore(times) {
  if (!times.length) return { home: null, away: null };
  const home = times.reduce((s, t) => s + t.homeGoals, 0);
  const away = times.reduce((s, t) => s + t.awayGoals, 0);
  return { home, away };
}

export function formatScore(times) {
  const { home, away } = computeFinalScore(times);
  if (home === null) return "-:-";
  return `${home}:${away}`;
}

export function computeLiveScore(events, homeTeamId, awayTeamId, teamMembers) {
  let home = 0;
  let away = 0;

  events.forEach((e) => {
    const type = (e.type || "").toUpperCase();
    const isGoal = type === "GOAL" || type === "PENALTY";
    const isOwnGoal = type === "OWN_GOAL";
    if (!isGoal && !isOwnGoal) return;

    const member = teamMembers.find((m) => m.id === e.playerId);
    if (!member) return;

    const scoringTeamId = isOwnGoal
      ? member.teamId === homeTeamId
        ? awayTeamId
        : homeTeamId
      : member.teamId;

    if (scoringTeamId === homeTeamId) home++;
    else if (scoringTeamId === awayTeamId) away++;
  });

  return { home, away };
}