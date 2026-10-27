// Postava jednog tima na jednom mecu — kljuc je par (matchId, teamId).
// startingPlayers / benchPlayers / staffIds su id-jevi iz team-members.js
// i moraju pripadati tom timu (teamId).
export const matchLineups = [
  // ---------------- MEC 1: Radnicki (1) vs Dubocica (2) ----------------
  {
    id: 1,
    matchId: 1,
    teamId: 1,
    side: "HOME",
    startingPlayers: [1, 2, 4],
    benchPlayers: [9, 10],
    staffIds: [7, 8], // trener, fizioterapeut
    captainPlayerId: 1,
  },
  {
    id: 2,
    matchId: 1,
    teamId: 2,
    side: "AWAY",
    startingPlayers: [3, 5],
    benchPlayers: [11, 12],
    staffIds: [13],
    captainPlayerId: 3,
  },

  // ---------------- MEC 2: Pirot (3) vs Radnicki (1) ----------------
  {
    id: 3,
    matchId: 2,
    teamId: 3,
    side: "HOME",
    startingPlayers: [14, 6, 15],
    benchPlayers: [16],
    staffIds: [17],
    captainPlayerId: 14,
  },
  {
    id: 4,
    matchId: 2,
    teamId: 1,
    side: "AWAY",
    startingPlayers: [1, 2, 4],
    benchPlayers: [9, 10],
    staffIds: [7, 8],
    captainPlayerId: 1,
  },

  // ---------------- MEC 3: Dubocica (2) vs Pirot (3) ----------------
  {
    id: 5,
    matchId: 3,
    teamId: 2,
    side: "HOME",
    startingPlayers: [3, 5],
    benchPlayers: [11, 12],
    staffIds: [13],
    captainPlayerId: 3,
  },
  {
    id: 6,
    matchId: 3,
    teamId: 3,
    side: "AWAY",
    startingPlayers: [14, 6, 15],
    benchPlayers: [16],
    staffIds: [17],
    captainPlayerId: 14,
  },

  // ---------------- MEC 4 (odigran): Radnicki (1) vs Dubocica (2) ----------------
  {
    id: 7,
    matchId: 4,
    teamId: 1,
    side: "HOME",
    startingPlayers: [1, 2, 4],
    benchPlayers: [9, 10],
    staffIds: [7, 8],
    captainPlayerId: 1,
  },
  {
    id: 8,
    matchId: 4,
    teamId: 2,
    side: "AWAY",
    startingPlayers: [3, 5],
    benchPlayers: [11, 12],
    staffIds: [13],
    captainPlayerId: 3,
  },

  // ---------------- MEC 5 (odigran): Pirot (3) vs Radnicki (1) ----------------
  {
    id: 9,
    matchId: 5,
    teamId: 3,
    side: "HOME",
    startingPlayers: [14, 6, 15],
    benchPlayers: [16],
    staffIds: [17],
    captainPlayerId: 14,
  },
  {
    id: 10,
    matchId: 5,
    teamId: 1,
    side: "AWAY",
    startingPlayers: [1, 2, 4],
    benchPlayers: [9, 10],
    staffIds: [7, 8],
    captainPlayerId: 1,
  },

  // ---------------- MEC 6 (odigran): Dubocica (2) vs Pirot (3) ----------------
  {
    id: 11,
    matchId: 6,
    teamId: 2,
    side: "HOME",
    startingPlayers: [3, 5],
    benchPlayers: [11, 12],
    staffIds: [13],
    captainPlayerId: 3,
  },
  {
    id: 12,
    matchId: 6,
    teamId: 3,
    side: "AWAY",
    startingPlayers: [14, 6, 15],
    benchPlayers: [16],
    staffIds: [17],
    captainPlayerId: 14,
  },
];
