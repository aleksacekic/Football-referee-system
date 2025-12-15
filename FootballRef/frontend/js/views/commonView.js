export function initTabs() {
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
}

export function el(tag, opts = {}) {
  const e = document.createElement(tag);
  if (opts.className) e.className = opts.className;
  if (opts.text) e.textContent = opts.text;
  if (opts.html) e.innerHTML = opts.html;
  if (opts.attrs) {
    Object.entries(opts.attrs).forEach(([k, v]) => e.setAttribute(k, v));
  }
  return e;
}

function checkActiveTab() {
  const headerTabs = document.querySelectorAll("#mainTabs .nav-link");
  const sidebarLinks = document.querySelectorAll("#mobileSidebar .nav-link");

  headerTabs.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", () => {
      const id = `#${tab.id}`;

      sidebarLinks.forEach((l) => l.classList.remove("active"));

      const activeSide = document.querySelector(
        `#mobileSidebar [data-tab="${id}"]`
      );
      if (activeSide) activeSide.classList.add("active");
    });
  });
}

export function initHamburgerMenu() {
  checkActiveTab();
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("mobileSidebar");

  /* otvaranje / zatvaranje */
  hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  /* KLIK NA SIDEBAR TAB */
  sidebar.addEventListener("click", (e) => {
    const link = e.target.closest(".nav-link");
    if (!link) return;

    const targetTabSelector = link.dataset.tab;
    const realTab = document.querySelector(targetTabSelector);

    if (realTab) {
      realTab.click(); // 🔥 BOOTSTRAP radi sve ostalo
    }

    sidebar.classList.remove("open");
  });
}


