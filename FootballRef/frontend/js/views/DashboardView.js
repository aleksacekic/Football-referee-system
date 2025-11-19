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
