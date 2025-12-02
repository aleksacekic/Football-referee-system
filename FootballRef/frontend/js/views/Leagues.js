let fakeJSON = {
  "league": {
    "id": "liga-001",
    "name": "Prva kadetska",
    "season": "2025/2026",
    "country": "RS",
    "region": "Beograd",
    "updatedAt": "2025-11-26T12:30:00Z"     // kad je standings poslednji put update-ovan
  },

  "teams": [
    {"id":"team-1","name":"KOPERNIKUS Železničar","short":"KOP","logo":"/assets/logos/kop.png"},
    {"id":"team-2","name":"SLOGA Leskovac","short":"SLO","logo":"/assets/logos/slo.png"},
    {"id":"team-3","name":"RADNIČKI Niš","short":"RAD","logo":"/assets/logos/rad.png"}
  ],

  "standings": [
    {
      "teamId": "team-2",
      "position": 1,
      "played": 10,
      "won": 7,
      "draw": 1,
      "lost": 2,
      "gf": 21,
      "ga": 12,
      "gd": 9,
      "points": 22,
      "lastUpdated": "2025-11-26T12:30:00Z"   // kada je ova stavka poslednji put promenjena
    },
    {
      "teamId": "team-1",
      "position": 2,
      "played": 10,
      "won": 6,
      "draw": 2,
      "lost": 2,
      "gf": 18,
      "ga": 11,
      "gd": 7,
      "points": 20,
      "lastUpdated": "2025-11-26T12:30:00Z"
    },
    {
      "teamId": "team-3",
      "position": 3,
      "played": 10,
      "won": 4,
      "draw": 3,
      "lost": 3,
      "gf": 15,
      "ga": 17,
      "gd": -2,
      "points": 15,
      "lastUpdated": "2025-11-26T12:30:00Z"
    }
  ],

  "matches": [
    {
      "id": "m-2025-001",
      "date": "2025-11-23T11:00:00Z",
      "round": 3,
      "homeTeamId": "team-1",
      "awayTeamId": "team-2",
      "homeGoals": 2,
      "awayGoals": 3,
      "status": "played",       // scheduled | live | played | postponed | cancelled
      "stadium": "Niš, Čair",
      "events": [
        {"minute":23,"type":"goal","teamId":"team-2","playerId":"p-45"},
        {"minute":70,"type":"substitution","teamId":"team-1","in":"p-21","out":"p-9"}
      ],
      "refereeId": "ref-77",
      "updatedAt": "2025-11-23T12:00:00Z"   // kada je rezultat unesem
    },

    {
      "id": "m-2025-002",
      "date": "2025-11-30T11:00:00Z",
      "round": 4,
      "homeTeamId": "team-3",
      "awayTeamId": "team-1",
      "homeGoals": null,
      "awayGoals": null,
      "status": "scheduled",
      "stadium": "Niš, Stadion X",
      "events": [],
      "refereeId": null,
      "updatedAt": "2025-11-01T09:00:00Z"
    }
  ]
}

