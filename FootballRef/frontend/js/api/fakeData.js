// api/fakeData.js
export const fakeMatches = [
  {
    id: "m-played-001",
    status: "PLAYED",
    datetime: "23. Nov 2025. 11:00",
    competition: 'Druga kadetska liga "JUG"',
    stadium: "Nis, Cair",
    teams: {
      home: {
        name: "KOPERNIKUS-ZELEZNICAR",
        logo: "../assets/images/team1.jpeg",
      },
      away: { name: "SLOGA LESKOVAC", logo: "../assets/images/team2.png" },
      score: "2:3",
    },
    round: "3",
    officials: [
      "Referee: Zvonko Zvonkovic",
      "1st Assistant Referee: Bogdan Bogdanovic",
      "2nd Assistant Referee: Milan Milanovic",
      "4th Official: Zvonko Zvonkovic",
      "Match delegate: Bogdan Bogdanovic",
      "VAR: Milan Milanovic",
      "AVAR: Milan Milanovic",
    ],
    matchTimes: [
      {
        phase: "1st HALFTIME",
        start: "11:01:44",
        end: "11:47:05",
        extra: "0",
        result: "0:0",
      },
      {
        phase: "2nd HALFTIME",
        start: "11:58:25",
        end: "12:45:09",
        extra: "2",
        result: "2:3",
      },
    ],
    players: {
      home: {
        starting: [
          { num: 11, name: "Nikola Nikolić", action: "Goal (23')" },
          { num: 9, name: "Marko Marković", action: "Yellow card (55')" },
        ],
        substitutes: [{ num: 18, name: "Petar Petrović", action: "On (70')" }],
        officials: [{ role: "Coach", name: "Milan Jovanović" }],
      },
      away: {
        starting: [
          { num: 7, name: "Stefan Stojanović", action: "" },
          { num: 6, name: "Jovan Jović", action: "" },
        ],
        substitutes: [{ num: 19, name: "Milan Marić", action: "" }],
        officials: [{ role: "Assistant", name: "Petar Stanković" }],
      },
    },
  },

  {
    id: "m-sched-002",
    status: "SCHEDULED",
    datetime: "24. Nov 2025. 10:00",
    competition: 'Zona "Centar" FSRIS 25/26',
    stadium: "Leskovac, Main",
    teams: {
      home: { name: "TEAM A", logo: "../assets/images/team1.jpeg" },
      away: { name: "TEAM B", logo: "../assets/images/team2.png" },
      score: "-:-",
    },
    round: "1",
    officials: [
      "Referee: Zvonko Zvonkovic",
      "1st Assistant Referee: Bogdan Bogdanovic",
      "2nd Assistant Referee: Milan Milanovic",
      "4th Official: Zvonko Zvonkovic",
      "Match delegate: Bogdan Bogdanovic",
      "VAR: Milan Milanovic",
      "AVAR: Milan Milanovic",
    ],
    matchTimes: [],
    players: {
      home: {
        starting: [
          { num: 1, name: "Miloš Milošević", action: "" },
          { num: 4, name: "Petar Petković", action: "" },
        ],
        substitutes: [{ num: 14, name: "Ivan Ivanović", action: "" }],
        officials: [{ role: "Coach", name: "Nenad Novaković", action: "" }],
      },
      away: {
        starting: [
          { num: 2, name: "Ivan I.", action: "" },
          { num: 3, name: "Marko M.", action: "" },
        ],
        substitutes: [{ num: 15, name: "Jovan J.", action: "" }],
        officials: [
          { role: "Coach", name: "Dragan D.", action: "Yellow card (55')" },
        ],
      },
    },
  },

  {
    id: "m-live-003",
    status: "LIVE",
    datetime: "24. Nov 2025. 12:00",
    competition: "Prva kadetska liga FSRIS 25/26",
    stadium: "City Stadium",
    teams: {
      home: { name: "RADNIČKI NIŠ", logo: "../assets/images/team2.png" },
      away: { name: "OFK NIŠ", logo: "../assets/images/team1.jpeg" },
      score: "0:0",
    },
    round: "2",
    officials: [
      "Referee: Zvonko Zvonkovic",
      "1st Assistant Referee: Bogdan Bogdanovic",
      "2nd Assistant Referee: Milan Milanovic",
      "4th Official: Zvonko Zvonkovic",
      "Match delegate: Bogdan Bogdanovic",
      "VAR: Milan Milanovic",
      "AVAR: Milan Milanovic",
    ],
    matchTimes: [],
    players: {
      home: {
        starting: [{ num: 5, name: "M. Ilić", action: "" }],
        substitutes: [],
        officials: [],
      },
      away: {
        starting: [{ num: 8, name: "N. Novak", action: "" }],
        substitutes: [],
        officials: [{ role: "Coach", name: "BOBIII.", action: "" },],
      },
    },
  },
];

export function fetchMatches() {
  return Promise.resolve(fakeMatches);
}

// ---------------------------------------------------------------------------------------------
export const matchesForDate = [
  {
    id: 1,
    date: "2025-11-23",
    time: "11:00",
    round: 3,
    homeTeam: "Kopernikus Zeleznicar",
    awayTeam: "Sloga Leskovac",
    competition: 'Druga kadetska liga "JUG"',
    stadium: {
      city: "Nis",
      name: "Cair",
    },
  },
  {
    id: 2,
    date: "2025-11-23",
    time: "13:30",
    round: 3,
    homeTeam: "Radnicki Nis",
    awayTeam: "FK Jagodina",
    competition: 'Druga kadetska liga "JUG"',
    stadium: {
      city: "Nis",
      name: "Cair – teren 2",
    },
  },
  {
    id: 3,
    date: "2025-11-23",
    time: "15:00",
    round: 3,
    homeTeam: "OFK Belgrad",
    awayTeam: "TSC Backa Topola",
    competition: "Omladinska liga Srbije",
    stadium: {
      city: "Belgrade",
      name: "Omladinski stadion",
    },
  },
];

export function fetchMatchesForDate() {
  return Promise.resolve(matchesForDate);
}
//----------------------------------------------------------------------------------------------------------
export const fakeJSON = {
  league: {
    id: "liga-001",
    name: "Prva kadetska",
    season: "2025/2026",
    country: "RS",
    region: "Beograd",
    updatedAt: "2025-11-26T12:30:00Z", // kad je standings poslednji put update-ovan
  },

  teams: [
    {
      id: "team-1",
      name: "KOPERNIKUS Železničar",
      short: "KOP",
      logo: "/assets/logos/kop.png",
    },
    {
      id: "team-2",
      name: "SLOGA Leskovac",
      short: "SLO",
      logo: "/assets/logos/slo.png",
    },
    {
      id: "team-3",
      name: "RADNIČKI Niš",
      short: "RAD",
      logo: "/assets/logos/rad.png",
    },
  ],

  standings: [
    {
      teamId: "team-2",
      position: 1,
      played: 10,
      won: 7,
      draw: 1,
      lost: 2,
      gf: 21,
      ga: 12,
      gd: 9,
      points: 22,
      lastUpdated: "2025-11-26T12:30:00Z", // kada je ova stavka poslednji put promenjena
    },
    {
      teamId: "team-1",
      position: 2,
      played: 10,
      won: 6,
      draw: 2,
      lost: 2,
      gf: 18,
      ga: 11,
      gd: 7,
      points: 20,
      lastUpdated: "2025-11-26T12:30:00Z",
    },
    {
      teamId: "team-3",
      position: 3,
      played: 10,
      won: 4,
      draw: 3,
      lost: 3,
      gf: 15,
      ga: 17,
      gd: -2,
      points: 15,
      lastUpdated: "2025-11-26T12:30:00Z",
    },
  ],

  matches: [
    {
      id: "m-2025-001",
      date: "2025-11-23T11:00:00Z",
      round: 3,
      homeTeamId: "team-1",
      awayTeamId: "team-2",
      homeGoals: 2,
      awayGoals: 3,
      status: "played", // scheduled | live | played | postponed | cancelled
      stadium: "Niš, Čair",
      events: [
        { minute: 23, type: "goal", teamId: "team-2", playerId: "p-45" },
        {
          minute: 70,
          type: "substitution",
          teamId: "team-1",
          in: "p-21",
          out: "p-9",
        },
      ],
      refereeId: "ref-77",
      updatedAt: "2025-11-23T12:00:00Z", // kada je rezultat unesem
    },

    {
      id: "m-2025-002",
      date: "2025-11-30T11:00:00Z",
      round: 4,
      homeTeamId: "team-3",
      awayTeamId: "team-1",
      homeGoals: null,
      awayGoals: null,
      status: "scheduled",
      stadium: "Niš, Stadion X",
      events: [],
      refereeId: null,
      updatedAt: "2025-11-01T09:00:00Z",
    },
  ],
};





export const leaguesData = [
  {
    leagueName: "Prva kadetska liga FSRIS 25/26",
    standings: [
      {
        pos: 1,
        teamName: "Sloga Leskovac",
        short: "SLO",
        logo: "../assets/images/team1.jpeg",
        played: 10,
        w: 7,
        d: 1,
        l: 2,
        g: "21:12",
        gd: "+9",
        points: 22,
      },
      {
        pos: 2,
        teamName: "Kopernikus Železničar",
        short: "KOP",
        logo: "../assets/images/team2.png",
        played: 10,
        w: 6,
        d: 2,
        l: 2,
        g: "18:11",
        gd: "+7",
        points: 20,
      },
      {
        pos: 3,
        teamName: "Radnički Niš",
        short: "RAD",
        logo: "../assets/images/team2.png",
        played: 10,
        w: 5,
        d: 0,
        l: 5,
        g: "15:17",
        gd: "-2",
        points: 15,
      },
      {
        pos: 4,
        teamName: "Cicevac",
        short: "CIC",
        logo: "../assets/images/team1.jpeg",
        played: 10,
        w: 7,
        d: 1,
        l: 2,
        g: "21:12",
        gd: "+9",
        points: 12,
      },
      {
        pos: 5,
        teamName: "Cuprija",
        short: "CUP",
        logo: "../assets/images/team2.png",
        played: 10,
        w: 6,
        d: 2,
        l: 2,
        g: "18:11",
        gd: "+7",
        points: 10,
      },
      {
        pos: 6,
        teamName: "Niska Banja",
        short: "NBA",
        logo: "../assets/images/team2.png",
        played: 10,
        w: 4,
        d: 3,
        l: 3,
        g: "15:17",
        gd: "-2",
        points: 9,
      },
    ],
  },

  {
    leagueName: "Druga kadetska liga FSRIS 25/26",
    standings: [
      {
        pos: 1,
        teamName: "OFK Niš",
        short: "OFK",
        logo: "../assets/images/team1.jpeg",
        played: 11,
        w: 8,
        d: 2,
        l: 1,
        g: "24:9",
        gd: "+15",
        points: 26,
      },
      {
        pos: 2,
        teamName: "Palilulac",
        short: "PAL",
        logo: "../assets/images/team2.png",
        played: 11,
        w: 7,
        d: 1,
        l: 3,
        g: "20:14",
        gd: "+6",
        points: 22,
      },
    ],
  },

  {
    leagueName: "Treća liga 'Sever'",
    standings: [
      {
        pos: 1,
        teamName: "Mladost",
        short: "MLA",
        logo: "../assets/images/team1.jpeg",
        played: 9,
        w: 6,
        d: 2,
        l: 1,
        g: "18:7",
        gd: "+11",
        points: 20,
      },
    ],
  },

  {
    leagueName: "Treća liga 'Jug'",
    standings: [
      {
        pos: 1,
        teamName: "Jedinstvo Kočane",
        short: "JED",
        logo: "../assets/images/team2.png",
        played: 9,
        w: 6,
        d: 1,
        l: 2,
        g: "17:10",
        gd: "+7",
        points: 19,
      },
    ],
  },
];