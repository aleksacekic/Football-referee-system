//#region
const tabs = document.querySelectorAll(".nav-link");

tabs.forEach((tab) => {
  tab.addEventListener("click", function (event) {
    event.preventDefault();

    // skini active sa svih
    tabs.forEach((t) => t.classList.remove("active"));

    // postavi active samo na kliknuti tab
    this.classList.add("active");
  });
});
//#endregion

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",

    /* da visina bude fleksibilnija */
    height: "auto", // visina se prilagođava sadržaju
    contentHeight: "auto",
    expandRows: true, // da lepo popuni visinu, bez ogromnih praznina

    /* responsive ponašanje */
    handleWindowResize: true,
    windowResizeDelay: 100,

    // početni aspectRatio zavisi od širine prozora
    aspectRatio: window.innerWidth < 768 ? 0.8 : 1.5,

    // kad se promeni širina prozora, prilagodi aspectRatio
    windowResize: function () {
      if (window.innerWidth < 768) {
        calendar.setOption("aspectRatio", 0.8); // uži i viši na mobilnom
      } else {
        calendar.setOption("aspectRatio", 1.5); // širi, “pločastiji” na desktopu
      }
    },
  });

  calendar.render();
});
