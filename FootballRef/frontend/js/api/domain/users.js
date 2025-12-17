// export const users = [
//   {
//     id: 1,
//     name: "Aleksa Cekić",
//     role: "REFEREE"
//   },
//   {
//     id: 2,
//     name: "Marko Petrović",
//     role: "CLUB_REPRESENTATIVE",
//     teamId: 101
//   }
// ];

export const users = [
  {
    id: 1,
    firstName: "Aleksa",
    lastName: "Cekić",
    email: "aleksa@club.com",
    phone: "+38164111222",
    role: "club-representative",
    teamId: 1,
    photo: "../assets/images/users/aleksa.jpg",
  },
  {
    id: 2,
    firstName: "Marko",
    lastName: "Marković",
    email: "marko.ref@fss.rs",
    phone: "+38163123456",
    role: "referee",

    // referee availability
    inactivityFrom: "2025-03-10",
    inactivityTo: "2025-03-20",
    inactivityReason: "Injury",
    photo: "../assets/images/users/referee1.jpg",
  },
  {
    id: 3,
    firstName: "Admin",
    lastName: "System",
    email: "admin@system.com",
    phone: null,
    role: "super-admin",
    photo: null,
  },
];
