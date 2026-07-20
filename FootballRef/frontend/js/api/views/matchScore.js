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