import { el } from "./commonView.js";

//DASHBOARD
export function initCalendar(
  selectorOrEl,
  { onDateClick, onEventClick, initialEvents = [] } = {}
) {
  const el =
    typeof selectorOrEl === "string"
      ? document.querySelector(selectorOrEl)
      : selectorOrEl;
  if (!el) throw new Error("Calendar element not found: " + selectorOrEl);

  const calendar = new FullCalendar.Calendar(el, {
    initialView: "dayGridMonth",
    height: "auto",
    contentHeight: "auto",
    expandRows: true,
    handleWindowResize: true,
    windowResizeDelay: 100,
    aspectRatio: window.innerWidth < 768 ? 0.8 : 1.5,
    events: initialEvents, // možeš poslati fake events ili podatke iz modela

    // FullCalendar hooks -> mapiraj na tvoje callback-ove
    dateClick(info) {
      if (typeof onDateClick === "function") onDateClick(info); // info.dateStr itd.
    },
    eventClick(info) {
      if (typeof onEventClick === "function") onEventClick(info.event, info);
    },

    windowResize() {
      const ratio = window.innerWidth < 768 ? 0.8 : 1.5;
      calendar.setOption("aspectRatio", ratio);
    },
  });

  //console.log("SACE RENDER");

  calendar.render();

  // vraćamo instancu da controller može da je cuva / manipulise / unisti
  return calendar;
}

export function destroyCalendar(calendarInstance) {
  if (!calendarInstance) return;
  try {
    calendarInstance.destroy();
  } catch (err) {
    console.warn("Failed to destroy calendar", err);
  }
}

//sidebar na dashboardu

function createMatchNodeOnDashboard(match) {
  const wrap = document.createElement("div");
  wrap.className = "match-item";
  wrap.dataset.matchId = match.id; // korisno za identifikaciju

  const firstRow = document.createElement("div");
  firstRow.className = "matchitem-firstrow";

  const timeSpan = document.createElement("span");
  const timeEl = document.createElement("time");
  timeEl.dateTime = `${match.date}T${match.time}`;
  timeEl.textContent = `${formatDisplayDate(
    `${match.datetime}`
  )} ${match.datetime.slice(10)}`;
  timeSpan.appendChild(timeEl);

  const roundSpan = document.createElement("span");
  roundSpan.textContent = `Round: ${match.round}`;

  firstRow.appendChild(timeSpan);
  firstRow.appendChild(roundSpan);

  const teams = document.createElement("span");
  teams.className = "match-teams";
  teams.textContent = `${match.teams.home.name} - ${match.teams.away.name}`;

  const comp = document.createElement("span");
  comp.textContent = `Competition: ${match.competition}`;

  const stadium = document.createElement("span");
  stadium.textContent = `Stadium: ${match.stadium}`;

  wrap.appendChild(firstRow);
  wrap.appendChild(teams);
  wrap.appendChild(comp);
  wrap.appendChild(stadium);

  return wrap;
}

function formatDisplayDate(isoDate) {
  // jednostavno formatiranje: "23. Nov 2025."
  const d = new Date(isoDate);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" }); // "Nov"
  const year = d.getFullYear();
  return `${String(day).padStart(2, "0")}. ${month} ${year}.`;
}

//BITNO: Exportujemo za Controller, da on moze da ubaci matches iz Modela !!!!!!!!!!!!!
//containerSelector postavljen
export function renderMatchesOnDashboard(
  matches = [],
  containerSelector = "#matches-panel"
) {
  const container = document.querySelector(containerSelector);
  //console.log(container);
  if (!container) {
    console.warn(
      "renderMatchesOnDashboard: container not found:",
      containerSelector
    );
    return;
  }

  container.innerHTML = `<h3 class="matches-title">Matches on selected date</h3>`;
  const frag = document.createDocumentFragment();
  matches.forEach((m) => frag.appendChild(createMatchNodeOnDashboard(m)));
  container.appendChild(frag);

  // Document fragment je predobar za optimizaciju kad imam 1000 elemenata npr - sada bi npr. bolje bilo da radim klasicno. Ostavicu zbog VEZBE - nauceno nesto novo
  /*
  matches.forEach(m => {
    container.appendChild(createMatchNodeOnDashboard(m));
  });
   */

  //objasnjenje gpt: DocumentFragment je mini, nevidljivi DOM koji postoji samo u memoriji i nije deo stranice.Možeš ga zamisliti kao:„kutiju u koju privremeno sklapaš HTML elemente, a na kraju celu kutiju dodaš u DOM u jednom potezu“.
}

//OVO LEPO POGLEDAJ!

export function initMatchClickHandler(
  containerSelector = "#matches-panel",
  onMatchClick = (id) => {}
) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(
      "initMatchClickHandler: container not found:",
      containerSelector
    );
    return () => {};
  }

  function handler(e) {
    const matchEl = e.target.closest(".match-item");
    if (!matchEl || !container.contains(matchEl)) return;
    const id = matchEl.dataset.matchId;
    onMatchClick(id);
  }

  container.addEventListener("click", handler);

  // Cleanup za slučaj SPA ili re-rendera
  return function cleanup() {
    container.removeEventListener("click", handler);
  };
}

function createMatchNode(match, isScheduled = false) {
 // console.log(match);
  const frag = document.createDocumentFragment();

  // preview
  const preview = el("div", {
    className: "match-info-preview",
    attrs: { role: "button", tabindex: "0", "aria-expanded": "false" },
  });
  const left = el("div", { className: "match-info-preview-left" });
  left.appendChild(
    el("span", { html: `Status: <span class="green">${match.status}</span>` })
  );
  left.appendChild(el("span", { text: match.datetime }));
  left.appendChild(el("span", { text: match.competition }));
  left.appendChild(
    el("span", {
      className: "team-name-preview",
      text: `${match.teams.home.name} - ${match.teams.away.name}`,
    })
  );
  const right = el("div", { className: "match-info-preview-right" });
  right.appendChild(
    el("img", {
      className: "icon",
      attrs: { src: "../assets/images/down-arrow.png", alt: "toggle" },
    })
  );
  preview.appendChild(left);
  preview.appendChild(right);
  frag.appendChild(preview);

  // details
  const details = el("div", {
    className: "match-info hidden",
    attrs: { "aria-hidden": "true", "data-match-id": match.id },
  });

  // tabs
  const tabsWrap = el("div", { className: "match-tabs" });
  const tabsUl = el("ul", {
    className: "nav match-tabs-list",
    attrs: { role: "tablist" },
  });
  function makeTabBtn(label, target, isActive = false) {
    const li = el("li");
    li.setAttribute("role", "presentation");
    const btn = el("button", {
      className: isActive ? "nav-link-match active" : "nav-link-match",
      text: label,
      attrs: {
        role: "tab",
        "aria-selected": isActive ? "true" : "false",
        "data-target": target,
      },
    });
    li.appendChild(btn);
    return li;
  }
  tabsUl.appendChild(makeTabBtn("INFO", "info", true));
  tabsUl.appendChild(makeTabBtn("HOME", "home"));
  tabsUl.appendChild(makeTabBtn("AWAY", "away"));
  tabsWrap.appendChild(tabsUl);
  details.appendChild(tabsWrap);

  // panels wrapper
  const panels = el("div", { className: "match-tab-panels" });

  function createResultBlock() {
    const result = el("div", { className: "result" });
    const leftLogo = el("div", { className: "team-logo-container" });
    leftLogo.appendChild(
      el("img", {
        className: "team-logo team-logo1",
        attrs: { src: match.teams.home.logo, alt: match.teams.home.name },
      })
    );
    result.appendChild(leftLogo);
    result.appendChild(
      el("div", {
        className: "team-name team-name1",
        text: match.teams.home.name,
      })
    );
    const scoreWrap = el("div", { className: "result-numbers-container" });
    scoreWrap.appendChild(
      el("div", { className: "result-numbers", text: match.teams.score || "-" })
    );
    result.appendChild(scoreWrap);
    result.appendChild(
      el("div", {
        className: "team-name team-name2",
        text: match.teams.away.name,
      })
    );
    const rightLogo = el("div", { className: "team-logo-container" });
    rightLogo.appendChild(
      el("img", {
        className: "team-logo team-logo2",
        attrs: { src: match.teams.away.logo, alt: match.teams.away.name },
      })
    );
    result.appendChild(rightLogo);
    return result;
  }

  // INFO panel
  const infoPanel = el("div", {
    className: "tab-panel tab-panel--info active",
    attrs: { id: `info-${match.id}`, role: "tabpanel" },
  });
  infoPanel.appendChild(createResultBlock());
  const otherInfo = el("div", { className: "other-info" });
  otherInfo.appendChild(el("span", { html: `Status: ${match.status}` }));
  otherInfo.appendChild(el("span", { text: `Date: ${match.datetime}` }));
  otherInfo.appendChild(el("span", { text: `Round: ${match.round || ""}` }));
  otherInfo.appendChild(
    el("span", { text: `Competition: ${match.competition}` })
  );
  otherInfo.appendChild(el("span", { text: `Stadium: ${match.stadium}` }));
  infoPanel.appendChild(otherInfo);

  // referee-info
  const refBox = el("div", { className: "referee-info" });
  refBox.appendChild(el("h4", { text: "Match Officials" }));
  (match.officials || []).forEach((o) =>
    refBox.appendChild(el("span", { text: o }))
  );
  infoPanel.appendChild(refBox);

  // match-time-info
  const mt = el("div", { className: "match-time-info" });
  mt.appendChild(el("h4", { text: "Match phases" }));
  const mtLabels = el("div", { className: "match-time-labels" });
  mtLabels.appendChild(el("label"));
  mtLabels.appendChild(el("label", { text: "Start" }));
  mtLabels.appendChild(el("label", { text: "End" }));
  mtLabels.appendChild(el("label", { text: "Extra time" }));
  mtLabels.appendChild(el("label", { text: "Result" }));
  mt.appendChild(mtLabels);
  const mtRows = el("div", { className: "match-time" });
  const firstHalf = el("div", {});
  firstHalf.appendChild(el("span", { text: "1st HALFTIME" }));
  firstHalf.appendChild(
    el("span", { text: "", className: "match-time-start1" })
  );
  firstHalf.appendChild(el("span", { text: "", className: "match-time-end1" }));
  firstHalf.appendChild(
    el("span", { text: "0", className: "match-time-extra1" })
  );
  firstHalf.appendChild(
    el("span", { text: "0:0", className: "match-time-result1" })
  );

  const secondHalf = el("div", {});
  secondHalf.appendChild(el("span", { text: "2nd HALFTIME" }));
  secondHalf.appendChild(
    el("span", { text: "", className: "match-time-start2" })
  );
  secondHalf.appendChild(
    el("span", { text: "", className: "match-time-end2" })
  );
  secondHalf.appendChild(
    el("span", { text: "2", className: "match-time-extra2" })
  );
  secondHalf.appendChild(
    el("span", { text: "2:3", className: "match-time-result2" })
  );

  mtRows.appendChild(firstHalf);
  mtRows.appendChild(secondHalf);
  mt.appendChild(mtRows);
  infoPanel.appendChild(mt);

  // ako je scheduled, pokazi button START GAME
  if (isScheduled) {
    const btnWrap = el("div");
    const startBtn = el("button", {
      className: "start-game-button",
      text: "START GAME",
    });
    btnWrap.appendChild(startBtn);
    infoPanel.appendChild(btnWrap);

    startBtn.addEventListener("click", () => {
      console.log(`Start game clicked for ${match.id}`);
      listenForClick(startBtn);
    });
  }

  panels.appendChild(infoPanel);

  // HOME panel
  const homePanel = el("div", {
    className: "tab-panel tab-panel--home hidden",
    attrs: { id: `home-${match.id}`, role: "tabpanel", "aria-hidden": "true" },
  });
  homePanel.appendChild(createResultBlock());
  // build players for HOME (and add click handlers only if scheduled)
  homePanel.appendChild(
    buildPlayersBlockWithHandlers(match.players.home || {})
  );
  panels.appendChild(homePanel);

  // AWAY panel
  const awayPanel = el("div", {
    className: "tab-panel tab-panel--away hidden",
    attrs: { id: `away-${match.id}`, role: "tabpanel", "aria-hidden": "true" },
  });
  awayPanel.appendChild(createResultBlock());
  awayPanel.appendChild(
    buildPlayersBlockWithHandlers(match.players.away || {})
  );
  panels.appendChild(awayPanel);

  details.appendChild(panels);
  frag.appendChild(details);

  // preview toggle
  preview.addEventListener("click", () => {
    const root = isScheduled
      ? document.querySelector(".scheduled-matches-root")
      : document.querySelector(".past-matches-root");
    // zatvori sve
    document.querySelectorAll(".match-info").forEach((d) => {
      if (d !== details) {
        d.classList.add("hidden");
        d.setAttribute("aria-hidden", "true");
      }
    });
    document.querySelectorAll(".match-info-preview").forEach((p) => {
      if (p !== preview) {
        p.setAttribute("aria-expanded", "false");
        p.classList.remove("opened");
      }
    });

    const isOpen = !details.classList.contains("hidden");
    if (isOpen) {
      details.classList.add("hidden");
      details.setAttribute("aria-hidden", "true");
      preview.setAttribute("aria-expanded", "false");
      preview.classList.remove("opened");
    } else {
      details.classList.remove("hidden");
      details.setAttribute("aria-hidden", "false");
      preview.setAttribute("aria-expanded", "true");
      preview.classList.add("opened");
    }
  });

  preview.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      preview.click();
    }
  });

  // tab switching
  details.addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-link-match");
    if (!btn) return;
    const target = btn.dataset.target;
    const allBtns = details.querySelectorAll(".nav-link-match");
    const allPanels = details.querySelectorAll(".tab-panel");
    allBtns.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    allPanels.forEach((p) => {
      p.classList.add("hidden");
      p.classList.remove("active");
      p.setAttribute("aria-hidden", "true");
    });
    const panel =
      details.querySelector(`#${target}-${match.id}`) ||
      details.querySelector(`#${target}`);
    if (panel) {
      panel.classList.remove("hidden");
      panel.classList.add("active");
      panel.setAttribute("aria-hidden", "false");
    }
  });

  return frag;
}

// helper funkcija
function buildPlayersBlockWithHandlers(playersObj = {}) {
  const wrapper = el("div", { className: "players" });

  // STARTING
  const startSection = el("section", {
    className: "players-block starting-lineup-block",
    attrs: { "aria-labelledby": "starting-lineup-title" },
  });
  startSection.appendChild(
    el("h5", {
      className: "players-block-title",
      attrs: { id: "starting-lineup-title" },
      text: "Starting lineup",
    })
  );
  const ulStart = el("ul", {
    className: "players-list",
    attrs: { role: "list" },
  });
  (playersObj.starting || []).forEach((pl) => {
    const li = el("li", {
      className: "player-card",
      attrs: { role: "listitem", "data-player-name": pl.name },
    });
    li.appendChild(
      el("img", {
        className: "player-photo",
        attrs: { src: "../assets/images/random-photo.jpg", alt: pl.name },
      })
    );
    li.appendChild(
      el("div", { className: "player-number", text: String(pl.num || "") })
    );
    const pinfo = el("div", { className: "player-info" });
    pinfo.appendChild(el("div", { className: "player-name", text: pl.name }));
    pinfo.appendChild(
      el("div", { className: "player-action", text: pl.action || "" })
    );
    li.appendChild(pinfo);
    ulStart.appendChild(li);
  });
  startSection.appendChild(ulStart);
  wrapper.appendChild(startSection);

  // SUBSTITUTES
  const subSection = el("section", {
    className: "players-block substitutes-block",
    attrs: { "aria-labelledby": "substitutes-title" },
  });
  subSection.appendChild(
    el("h5", {
      className: "players-block-title",
      attrs: { id: "substitutes-title" },
      text: "Substitutes",
    })
  );
  const ulSubs = el("ul", { className: "players-list" });
  (playersObj.substitutes || []).forEach((pl) => {
    const li = el("li", {
      className: "player-card substitute",
      attrs: { role: "listitem", "data-player-name": pl.name },
    });
    li.appendChild(
      el("img", {
        className: "player-photo",
        attrs: { src: "../assets/images/random-photo.jpg", alt: pl.name },
      })
    );
    li.appendChild(
      el("div", { className: "player-number", text: String(pl.num || "") })
    );
    const pinfo = el("div", { className: "player-info" });
    pinfo.appendChild(el("div", { className: "player-name", text: pl.name }));
    pinfo.appendChild(
      el("div", { className: "player-action", text: pl.action || "" })
    );
    li.appendChild(pinfo);
    ulSubs.appendChild(li);
  });
  subSection.appendChild(ulSubs);
  wrapper.appendChild(subSection);

  // OFFICIALS
  const offSection = el("section", {
    className: "players-block officials-block",
    attrs: { "aria-labelledby": "officials-title" },
  });
  offSection.appendChild(
    el("h5", {
      className: "players-block-title",
      attrs: { id: "officials-title" },
      text: "Team officials",
    })
  );
  const ulOff = el("ul", { className: "officials-list" });
  (playersObj.officials || []).forEach((off) => {
    const li = el("li", { className: "official-item" });
    li.appendChild(
      el("div", { className: "official-role", text: off.role || "Official" })
    );
    li.appendChild(
      el("div", { className: "official-name", text: off.name || "" })
    );
    li.appendChild(
      el("div", { className: "official-action", text: off.action || "" })
    );
    ulOff.appendChild(li);
  });
  offSection.appendChild(ulOff);
  wrapper.appendChild(offSection);

  return wrapper;
}

export function renderPastMatches(matches) {
  //console.log(matches);
  const container = document.querySelector(".past-matches-root");
  if (!container) return;
  container.innerHTML = "";
  const main = el("main");
  const frag = document.createDocumentFragment();
  matches
    .filter((m) => m.status === "PLAYED")
    .forEach((m) => frag.appendChild(createMatchNode(m, false)));
  main.appendChild(frag);
  container.appendChild(main);
}

export function renderScheduledMatches(matches) {
  const container = document.querySelector(".scheduled-matches-root");
  if (!container) return;
  container.innerHTML = "";
  const main = el("main");
  const frag = document.createDocumentFragment();
  // LIVE i SCHEDULED idu u scheduled tab
  matches
    .filter((m) => m.status === "SCHEDULED" || m.status === "LIVE")
    .forEach((m) => frag.appendChild(createMatchNode(m, true)));
  main.appendChild(frag);
  container.appendChild(main);
}
// ----------------------------------------------------------------------------------------

const matchPreviews = document.querySelectorAll(".match-info-preview");

let currentlyOpen = null;

matchPreviews.forEach((match) => {
  match.addEventListener("click", () => {
    const matchDetails = match.nextElementSibling; // uvek ide preview pa details
    if (!matchDetails) return;

    const previewIcon = match.querySelector(".match-info-preview-right .icon"); // ikonica kod kliknutog
    if (!previewIcon) return;

    // Ako je kliknuti vec otvoren, zatvori ga
    if (currentlyOpen === matchDetails) {
      matchDetails.classList.add("hidden");
      previewIcon.src = "../assets/images/down-arrow.png";
      currentlyOpen = null;
      return;
    }

    // RESENJE PROBLEMA OBJASNJENO:
    /*Ako je kliknuti mec već otvoren, želimo ga zatvoriti.

    -Dodajemo klasu hidden da sakrijemo detalje.

    -Ikonica se vraća na down-arrow.

    -currentlyOpen se resetuje na null.

    -return prekida dalje izvršavanje handler-a.

    Zašto ovo pomaže kod race condition?

    |Ako neko brzo klikne više puta na isti preview, DOM ne mora da proverava classList.contains("hidden").

    |Sve odluke se baziraju samo na currentlyOpen, što je promenljiva u JS-u i sigurno je sinhronizovana. */

    // Zatvori prethodno otvoreni i vrati njegovu ikonicu na down
    if (currentlyOpen) {
      currentlyOpen.classList.add("hidden");
      const prevIcon = currentlyOpen.previousElementSibling.querySelector(
        ".match-info-preview-right .icon"
      );
      if (prevIcon) prevIcon.src = "../assets/images/down-arrow.png";
    }

    // Otvori kliknuti i promeni ikonicu na up
    matchDetails.classList.remove("hidden");
    previewIcon.src = "../assets/images/up-arrow.png";
    currentlyOpen = matchDetails;
  });
});

/* Zašto je ovo stabilno i jednostavno

Ne čita DOM stanje (classList.contains) za odluke, što je često uzrok race condition-a.

Sve se radi sinhrono, i uvek je jasno koji je trenutno otvoren.

Ikonice se menjanju samo za relevantne elemente, ne sve na stranici.

Brzi klikovi više ne prave problem, jer currentlyOpen je jedini izvor istine. */

//---------------AKCIJE IGRACA----------------------------------------------------------

function getMatchStatusFromPlayer(playerElement) {
  const details = playerElement.closest(".match-info");
  if (!details) return null;
  const preview = details.previousElementSibling; // očekujemo da je .match-info-preview
  if (!preview) return null;
  const statusEl = preview.querySelector(".green");
  return statusEl ? statusEl.textContent.trim().toUpperCase() : null;
}

export function playerClickHandler(playerElement) {
  const matchStatus = getMatchStatusFromPlayer(playerElement);
  if (matchStatus === "PLAYED") {
    console.log("Match finished — cannot add actions.");
    return;
  }

  const isSub = playerElement.classList.contains("substitute");
  const playerName =
    playerElement.querySelector(".player-name")?.textContent.trim() || "Player";

  // SKUPIMO IGRACE IZ STARTNE POSTAVE — zbog SUBSTITUTION
  const playersContainer = playerElement.closest(".players");
  const startingPlayers = playersContainer
    ? Array.from(
        playersContainer.querySelectorAll(".starting-lineup-block .player-card")
      ).map((p) => {
        const name = p.querySelector(".player-name")?.textContent.trim() || "";
        const num = p.querySelector(".player-number")?.textContent.trim() || "";
        return {
          label: `${num} ${name}`.trim(),
          value: name,
        };
      })
    : [];

  // KREIRAMO OVERLAY + MINIMALNI MODAL
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "team-modal";

  // close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "team-modal__close";
  closeBtn.setAttribute("aria-label", "Close modal");
  closeBtn.type = "button";
  closeBtn.textContent = "×";

  // title
  const title = document.createElement("h3");
  title.className = "team-modal__title";
  title.textContent = `${playerName} — Add action`;

  // form
  const form = document.createElement("form");
  form.id = "actionForm";
  form.className = "team-modal__form";

  // ACTION select
  const actionSelect = document.createElement("select");
  actionSelect.name = "action";
  actionSelect.className = "action-select";
  actionSelect.required = true;

  const addOption = (select, value, label) => {
    const o = document.createElement("option");
    o.value = value;
    o.textContent = label ?? value;
    select.appendChild(o);
  };

  addOption(actionSelect, "Goal", "Goal");
  addOption(actionSelect, "OwnGoal", "OwnGoal");
  addOption(actionSelect, "Penalty", "Penalty");
  addOption(actionSelect, "MissedPenalty", "Missed penalty");
  addOption(actionSelect, "YellowCard", "Yellow card");
  addOption(actionSelect, "RedCard", "Red card");
  if (isSub) addOption(actionSelect, "Substitution", "Substitution");

  // minute input
  const minuteInput = document.createElement("input");
  minuteInput.type = "number";
  minuteInput.name = "minute";
  minuteInput.className = "minute-input";
  minuteInput.placeholder = "Minute";

  // when select
  const whenSelect = document.createElement("select");
  whenSelect.name = "when";
  whenSelect.className = "when-select";
  addOption(whenSelect, "DuringMatch", "During match");
  addOption(whenSelect, "BeforeMatch", "Before match");
  addOption(whenSelect, "AfterMatch", "After match");

  // reason wrapper + select
  const reasonWrapper = document.createElement("div");
  reasonWrapper.id = "reason-wrapper";
  const reasonSelect = document.createElement("select");
  reasonSelect.name = "reason";
  reasonSelect.className = "reason-select";
  [
    "Rough start",
    "Preventing a promising attack",
    "Preventing obvious opportunity to obtain a goal",
    "Pausing the game",
    "Neglecting words or movements",
    "Frequent violation of the game rules",
    "Misconduct",
  ].forEach((r) => addOption(reasonSelect, r, r));
  reasonWrapper.appendChild(reasonSelect);

  // sub_with select (only if isSub)
  let subWithWrapper = null;
  let subWithSelect = null;
  if (isSub) {
    subWithWrapper = document.createElement("div");
    subWithWrapper.className = "sub-with-wrapper";
    subWithSelect = document.createElement("select");
    subWithSelect.name = "sub_with";
    subWithSelect.className = "sub-with-select";
    startingPlayers.forEach((p) => addOption(subWithSelect, p.value, p.label));
    subWithWrapper.appendChild(subWithSelect);
  }

  // desc wrapper + textarea
  const descWrapper = document.createElement("div");
  descWrapper.id = "desc-wrapper";
  const descTextarea = document.createElement("textarea");
  descTextarea.name = "desc";
  descTextarea.rows = 3;
  descTextarea.className = "description-input";
  descTextarea.placeholder = "Description (optional)";
  descWrapper.appendChild(descTextarea);

  // submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "submit-button";
  submitButton.textContent = "Add action";

  // append children to form in same order as original markup
  form.appendChild(actionSelect);
  form.appendChild(minuteInput);
  form.appendChild(whenSelect);
  form.appendChild(reasonWrapper);
  if (subWithWrapper) form.appendChild(subWithWrapper);
  form.appendChild(descWrapper);
  form.appendChild(submitButton);

  // assemble modal
  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(form);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // funkcija za update vidljivosti
  function updateVisibility() {
    const value = actionSelect.value;
    const isCard = value === "YellowCard" || value === "RedCard";

    // opis i razlog samo za zuti/crveni
    descWrapper.style.display = isCard ? "block" : "none";
    reasonWrapper.style.display = isCard ? "block" : "none";
    whenSelect.style.display = isCard ? "block" : "none";

    // ako nije karton — očisti description
    if (!isCard) {
      descTextarea.value = "";
    }

    if (subWithSelect) {
      subWithSelect.style.display = value === "Substitution" ? "block" : "none";
    }
  }

  // event listeners
  actionSelect.addEventListener("change", updateVisibility);
  updateVisibility(); // inicijalno

  const close = () => {
    overlay.remove();
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const a = form.elements["action"].value;
    const minute = form.elements["minute"].value;
    const when = form.elements["when"]?.value;
    const reason = form.elements["reason"]?.value;
    const desc = form.elements["desc"].value.trim();
    const subWith = form.elements["sub_with"]?.value;

    let text = "";

    if (a === "Goal") text = `Goal (${minute}')`;
    else if (a === "OwnGoal") text = `Own goal (${minute}')`;
    else if (a === "Penalty") text = `Penalty scored (${minute}')`;
    else if (a === "MissedPenalty") text = `Missed penalty (${minute}')`;
    else if (a === "YellowCard")
      text = `Yellow card (${minute}') — ${reason || ""}`.trim();
    else if (a === "RedCard")
      text = `Red card (${minute}') — ${reason || ""}`.trim();
    else if (a === "Substitution")
      text = `Substitution: on ${subWith} (${minute}')`;

    if (desc) text += ` — ${desc}`;

    const actionDiv = playerElement.querySelector(".player-action");
    if (actionDiv) {
      if (actionDiv.textContent.trim() === "") {
        actionDiv.textContent = text;
      } else {
        actionDiv.textContent += "; " + text;
      }
    }

    close();
  });
}

export function officialClickHandler(officialElement) {
  // ako se klik dešava u okviru match koji je PLAYED -> ne radimo ništa
  // pronalazimo match-info roditelja
  const matchInfo = officialElement.closest(".match-info");
  const preview = matchInfo ? matchInfo.previousElementSibling : null;
  const status = preview
    ? (preview.querySelector(".green")?.textContent || "").trim().toUpperCase()
    : null;
  if (status === "PLAYED") {
    console.log("Match finished — cannot add official actions.");
    return;
  }

  // overlay
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  // modal container
  const modal = document.createElement("div");
  modal.className = "team-modal";
  overlay.appendChild(modal);

  // close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "team-modal__close";
  closeBtn.setAttribute("aria-label", "Close modal");
  closeBtn.type = "button";
  closeBtn.textContent = "×";
  modal.appendChild(closeBtn);

  // title
  const title = document.createElement("h3");
  title.className = "team-modal__title";
  title.textContent = "Official — Add action";
  modal.appendChild(title);

  // form
  const form = document.createElement("form");
  form.id = "actionForm";
  form.className = "team-modal__form";
  modal.appendChild(form);

  // action select
  const actionSelect = document.createElement("select");
  actionSelect.name = "action";
  actionSelect.className = "action-select";
  actionSelect.required = true;
  const optYellow = document.createElement("option");
  optYellow.value = "Yellow card";
  optYellow.textContent = "Yellow card";
  const optRed = document.createElement("option");
  optRed.value = "Red card";
  optRed.textContent = "Red card";
  actionSelect.appendChild(optYellow);
  actionSelect.appendChild(optRed);
  form.appendChild(actionSelect);

  // minute input
  const minuteInput = document.createElement("input");
  minuteInput.type = "number";
  minuteInput.name = "minute";
  minuteInput.className = "minute-input";
  minuteInput.placeholder = "Minute";
  minuteInput.required = true;
  form.appendChild(minuteInput);

  // when select
  const whenSelect = document.createElement("select");
  whenSelect.name = "when";
  whenSelect.className = "when-select";
  const whenOpt1 = document.createElement("option");
  whenOpt1.value = "DuringMatch";
  whenOpt1.textContent = "During match";
  const whenOpt2 = document.createElement("option");
  whenOpt2.value = "BeforeMatch";
  whenOpt2.textContent = "Before match";
  const whenOpt3 = document.createElement("option");
  whenOpt3.value = "AfterMatch";
  whenOpt3.textContent = "After match";
  whenSelect.appendChild(whenOpt1);
  whenSelect.appendChild(whenOpt2);
  whenSelect.appendChild(whenOpt3);
  form.appendChild(whenSelect);

  // description textarea
  const descTextarea = document.createElement("textarea");
  descTextarea.name = "desc";
  descTextarea.rows = 3;
  descTextarea.className = "description-input";
  descTextarea.placeholder = "Description (optional)";
  form.appendChild(descTextarea);

  // submit button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "submit-button";
  submitBtn.textContent = "Add action";
  form.appendChild(submitBtn);

  // append overlay to body
  document.body.appendChild(overlay);

  //const closeBtn = overlay.querySelector(".team-modal__close");
  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);

  //const form = overlay.querySelector("#actionForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let text = "";
    const action = form.elements["action"].value;
    const min = form.elements["minute"].value;
    const when = form.elements["when"].value;
    const desc = form.elements["desc"].value;

    const description = desc ? `- ${desc}` : ``;
    text = `${action} (${min}') ${description}`;

    // ubaci u prvi .official-action ako postoji
    const officialAct = officialElement.querySelector(".official-action");
    if (officialAct) {
      if (officialAct.textContent.trim() === "") officialAct.textContent = text;
      else officialAct.textContent += `; ${text}`;
    } else {
      // ako nema, napravi i dodaj
      const newAct = document.createElement("div");
      newAct.className = "official-action";
      newAct.textContent = text;
      officialElement.appendChild(newAct);
    }
    close();
  });
}

//ova fja se koristi gore u createMatchNode
export function listenForClick(element) {
  if (!element) return;

  // inicijalizacija statea po mecu
  if (!element.dataset.count) {
    element.dataset.count = "0";
    element.dataset.start1st = "";
    element.dataset.end1st = "";
    element.dataset.start2nd = "";
    element.dataset.end2nd = "";
  }
  let count = Number(element.dataset.count);

  let options = ["PAUSE", "START 2nd HALF", "END GAME", "FINISHED GAME"];
  if (count < 4) {
    element.textContent = options[count];
    count++;
    element.dataset.count = count;
  }

  const now = new Date();
  const hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  if (seconds.toString().length == 1) {
    seconds = `0${seconds}`;
  }
  if (minutes.toString().length == 1) {
    minutes = `0${minutes}`;
  }

  if (count == 1 && !element.dataset.start1st) {
    element.dataset.start1st = `${hours}:${minutes}:${seconds}`;
  }
  if (count == 2 && !element.dataset.end1st) {
    element.dataset.end1st = `${hours}:${minutes}:${seconds}`;
  }
  if (count == 3 && !element.dataset.start2nd) {
    element.dataset.start2nd = `${hours}:${minutes}:${seconds}`;
  }
  if (count == 4 && !element.dataset.end2nd) {
    element.dataset.end2nd = `${hours}:${minutes}:${seconds}`;
  }

  const details = element.closest(".match-info");
  const startFirst = details.querySelector(".match-time-start1");
  const endFirst = details.querySelector(".match-time-end1");
  const startSecond = details.querySelector(".match-time-start2");
  const endSecond = details.querySelector(".match-time-end2");

  startFirst.textContent = element.dataset.start1st || "";
  endFirst.textContent = element.dataset.end1st || "";
  startSecond.textContent = element.dataset.start2nd || "";
  endSecond.textContent = element.dataset.end2nd || "";

  if (count >= 4) {
    element.disabled = true;
    element.style.cursor = "not-allowed";
    element.style.background = "#93bce3";
    return;
  }
}
