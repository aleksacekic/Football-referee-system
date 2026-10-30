import { el, PHASE_LABELS, createGameStepButton, applyPlayerState } from "./common-view.js";

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

// Tabela "Match phases" — puni se iz podataka (match.matchTimes).
// Uvek prikazuje oba poluvremena; prazna polja = faza jos nije pocela/zavrsena.
function buildPhasesBlock(match) {
  const mt = el("div", { className: "match-time-info" });
  mt.appendChild(el("h4", { text: "Match phases" }));

  const labels = el("div", { className: "match-time-labels" });
  ["", "Start", "End", "Extra time", "Result"].forEach((text) =>
    labels.appendChild(el("label", { text }))
  );
  mt.appendChild(labels);

  const rows = el("div", { className: "match-time" });
  Object.entries(PHASE_LABELS).forEach(([phase, label]) => {
    const data = (match.matchTimes || []).find((t) => t.phase === phase) ?? {};
    const row = el("div", { attrs: { "data-phase": phase } });
    row.appendChild(el("span", { text: label }));
    row.appendChild(el("span", { text: data.start ?? "" }));
    row.appendChild(el("span", { text: data.end ?? "" }));
    row.appendChild(el("span", { text: String(data.extra ?? "") }));
    row.appendChild(el("span", { text: data.result ?? "" }));
    rows.appendChild(row);
  });
  mt.appendChild(rows);

  return mt;
}

// "Status: LIVE" — status je obojen (.green); pravi se bez innerHTML.
function statusLabel(status) {
  const span = el("span", { text: "Status: " });
  span.appendChild(el("span", { className: "green", text: status }));
  return span;
}

function createMatchNode(match, isScheduled = false, callbacks = {}) {
  const frag = document.createDocumentFragment();

  // preview
  const preview = el("div", {
    className: "match-info-preview",
    attrs: { role: "button", tabindex: "0", "aria-expanded": "false" },
  });
  const left = el("div", { className: "match-info-preview-left" });
  left.appendChild(
    statusLabel(match.status)
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
      attrs: { src: "/assets/images/down-arrow.png", alt: "toggle" },
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
  otherInfo.appendChild(el("span", { text: `Status: ${match.status}` }));
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

  infoPanel.appendChild(buildPhasesBlock(match));

  // Dugme za sledeci korak meca (START GAME -> ... -> LOCK MATCH AS PLAYED).
  // Pojavljuje se samo ako korisnik sme da ga koristi.
  if (isScheduled && callbacks.onGameStep) {
    const stepBtn = createGameStepButton(match, callbacks.onGameStep);
    if (stepBtn) {
      const btnWrap = el("div");
      btnWrap.appendChild(stepBtn);
      infoPanel.appendChild(btnWrap);
    }
  }

  panels.appendChild(infoPanel);

  // HOME panel
  const homePanel = el("div", {
    className: "tab-panel tab-panel--home hidden",
    attrs: { id: `home-${match.id}`, role: "tabpanel", "aria-hidden": "true" },
  });
  homePanel.appendChild(createResultBlock());
  homePanel.appendChild(
    buildPlayersBlock(match.players.home || {}, match.id, "home")
  );
  panels.appendChild(homePanel);

  // AWAY panel
  const awayPanel = el("div", {
    className: "tab-panel tab-panel--away hidden",
    attrs: { id: `away-${match.id}`, role: "tabpanel", "aria-hidden": "true" },
  });
  awayPanel.appendChild(createResultBlock());
  awayPanel.appendChild(
    buildPlayersBlock(match.players.away || {}, match.id, "away")
  );
  panels.appendChild(awayPanel);

  details.appendChild(panels);
  frag.appendChild(details);

  // preview toggle
  preview.addEventListener("click", () => {
    // zatvori ostale kartice — samo u ovom tabu (Scheduled ili Past)
    const root =
      document.querySelector(isScheduled ? SCHEDULED_ROOT : PAST_ROOT) ?? document;
    root.querySelectorAll(".match-info").forEach((d) => {
      if (d !== details) {
        d.classList.add("hidden");
        d.setAttribute("aria-hidden", "true");
      }
    });
    root.querySelectorAll(".match-info-preview").forEach((p) => {
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

// Kartice igraca i sluzbenih lica jednog tima u tabovima "Scheduled" / "Past".
// Klik na karticu hvata matches-controller (data-member-id) i otvara zajednicku formu.
function buildPlayerCard(player, isSub) {
  const li = el("li", {
    className: isSub ? "player-card substitute" : "player-card",
    attrs: { role: "listitem", "data-member-id": String(player.id) },
  });
  applyPlayerState(li, player.state);
  li.appendChild(
    el("img", {
      className: "player-photo",
      attrs: { src: "/assets/images/avatar-placeholder.jpg", alt: player.name },
    })
  );
  li.appendChild(el("div", { className: "player-number", text: String(player.num || "") }));
  const info = el("div", { className: "player-info" });
  info.appendChild(el("div", { className: "player-name", text: player.name }));
  info.appendChild(el("div", { className: "player-action", text: player.action || "" }));
  li.appendChild(info);
  return li;
}

function buildPlayersBlock(playersObj, matchId, side) {
  const wrapper = el("div", { className: "players" });

  // id-jevi naslova moraju biti jedinstveni na stranici (aria-labelledby)
  const section = (className, title, list) => {
    const titleId = `${className}-${matchId}-${side}`;
    const s = el("section", {
      className: `players-block ${className}`,
      attrs: { "aria-labelledby": titleId },
    });
    s.appendChild(el("h5", { className: "players-block-title", text: title, attrs: { id: titleId } }));
    s.appendChild(list);
    return s;
  };

  const ulStart = el("ul", { className: "players-list", attrs: { role: "list" } });
  (playersObj.starting || []).forEach((p) => ulStart.appendChild(buildPlayerCard(p, false)));
  wrapper.appendChild(section("starting-lineup-block", "Starting lineup", ulStart));

  const ulSubs = el("ul", { className: "players-list", attrs: { role: "list" } });
  (playersObj.substitutes || []).forEach((p) => ulSubs.appendChild(buildPlayerCard(p, true)));
  wrapper.appendChild(section("substitutes-block", "Substitutes", ulSubs));

  const ulOff = el("ul", { className: "officials-list" });
  (playersObj.officials || []).forEach((off) => {
    const li = el("li", {
      className: "official-item",
      attrs: { "data-member-id": String(off.id) },
    });
    li.appendChild(el("div", { className: "official-role", text: off.role || "Official" }));
    li.appendChild(el("div", { className: "official-name", text: off.name || "" }));
    li.appendChild(el("div", { className: "official-action", text: off.action || "" }));
    ulOff.appendChild(li);
  });
  wrapper.appendChild(section("officials-block", "Team officials", ulOff));

  return wrapper;
}

const PAST_ROOT = ".past-matches-root";
const SCHEDULED_ROOT = ".scheduled-matches-root";

// Koji mec je otvoren i na kom unutrasnjem tabu (INFO/HOME/AWAY) —
// da posle ponovnog iscrtavanja korisnik ostane tamo gde je bio.
function getOpenMatchState(container) {
  const details = container.querySelector(".match-info:not(.hidden)");
  if (!details) return null;
  return {
    matchId: details.dataset.matchId,
    tab: details.querySelector(".nav-link-match.active")?.dataset.target ?? "info",
  };
}

function restoreOpenMatchState(container, openState) {
  if (!openState) return;
  const details = container.querySelector(
    `.match-info[data-match-id="${openState.matchId}"]`
  );
  if (!details) return; // mec je presao u drugi tab (npr. zakljucan -> Past)
  details.previousElementSibling?.click(); // otvori karticu
  details.querySelector(`.nav-link-match[data-target="${openState.tab}"]`)?.click();
}

function renderMatchList(rootSelector, matches, isScheduled, callbacks) {
  const container = document.querySelector(rootSelector);
  if (!container) return;

  const openState = getOpenMatchState(container);
  container.innerHTML = "";
  const main = el("main");
  matches.forEach((m) => main.appendChild(createMatchNode(m, isScheduled, callbacks)));
  container.appendChild(main);
  restoreOpenMatchState(container, openState);
}

export function renderPastMatches(matches) {
  renderMatchList(
    PAST_ROOT,
    matches.filter((m) => m.status === "PLAYED"),
    false
  );
}

// LIVE i SCHEDULED idu u scheduled tab.
// callbacks.onGameStep(matchId) — klik na dugme START GAME / END 1st HALF / ...
export function renderScheduledMatches(matches, callbacks = {}) {
  renderMatchList(
    SCHEDULED_ROOT,
    matches.filter((m) => m.status === "SCHEDULED" || m.status === "LIVE"),
    true,
    callbacks
  );
}
