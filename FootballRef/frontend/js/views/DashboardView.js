import { fetchMatches, fetchMatchesForDate } from "../api/fakeData.js";

let state = {
  matches: [],
  matchesForDate: [],
};

export async function loadMatches() {
  const data = await fetchMatches();
  state.matches = data;
  return state.matches;
}

export async function loadMatchesForDate() {
  const data = await fetchMatchesForDate();
  state.matchesForDate = data;
  return state.matchesForDate;
}

// document.addEventListener("DOMContentLoaded", function () {
//   const calendarEl = document.getElementById("calendar");

//   const calendar = new FullCalendar.Calendar(calendarEl, {
//     initialView: "dayGridMonth",

//     /* da visina bude fleksibilnija */
//     height: "auto", // visina se prilagođava sadržaju
//     contentHeight: "auto",
//     expandRows: true, // da lepo popuni visinu, bez ogromnih praznina

//     /* responsive ponašanje */
//     handleWindowResize: true,
//     windowResizeDelay: 100,

//     // početni aspectRatio zavisi od širine prozora
//     aspectRatio: window.innerWidth < 768 ? 0.8 : 1.5,

//     // kad se promeni širina prozora, prilagodi aspectRatio
//     windowResize: function () {
//       if (window.innerWidth < 768) {
//         calendar.setOption("aspectRatio", 0.8); // uži i viši na mobilnom
//       } else {
//         calendar.setOption("aspectRatio", 1.5); // širi, “pločastiji” na desktopu
//       }
//     },
//   });

//   calendar.render();
// });

// ------------------------------------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------ZA DASHBOARD---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------ZA DASHBOARD--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------ZA DASHBOARD--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------ZA DASHBOARD-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------ZA DASHBOARD--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ROOT kontejner u HTML-u
// <div id="matches-panel"></div>
const root = document.getElementById("matches-panel");

function createMatchNodeOnDashboard(match) {
  const wrap = document.createElement("div");
  wrap.className = "match-item";
  wrap.dataset.matchId = match.id; // korisno za identifikaciju

  const firstRow = document.createElement("div");
  firstRow.className = "matchitem-firstrow";

  const timeSpan = document.createElement("span");
  const timeEl = document.createElement("time");
  timeEl.dateTime = `${match.date}T${match.time}`;
  timeEl.textContent = `${formatDisplayDate(match.date)} ${match.time}`;
  timeSpan.appendChild(timeEl);

  const roundSpan = document.createElement("span");
  roundSpan.textContent = `Round: ${match.round}`;

  firstRow.appendChild(timeSpan);
  firstRow.appendChild(roundSpan);

  const teams = document.createElement("span");
  teams.className = "match-teams";
  teams.textContent = `${match.homeTeam} - ${match.awayTeam}`;

  const comp = document.createElement("span");
  comp.textContent = `Competition: ${match.competition}`;

  const stadium = document.createElement("span");
  stadium.textContent = `Stadium: ${match.stadium.city}, ${match.stadium.name}`;

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

function renderMatchesOnDashboard(matches, container) {
  container.innerHTML = ""; // clear (idempotent)
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

// Event delegation: hvata klik na match-item
root.addEventListener("click", (e) => {
  const matchEl = e.target.closest(".match-item");
  if (!matchEl || !root.contains(matchEl)) return;
  const id = matchEl.dataset.matchId;
  //console.log("clicked match id", id);
  openMatchDetails(id); // DODAJ
});

// CALL (render)
await loadMatchesForDate();
renderMatchesOnDashboard(state.matchesForDate, root);

// ---------- HELPERS ----------
function el(tag, opts = {}) {
  const e = document.createElement(tag);
  if (opts.className) e.className = opts.className;
  if (opts.text) e.textContent = opts.text;
  if (opts.html) e.innerHTML = opts.html;
  if (opts.attrs) {
    Object.entries(opts.attrs).forEach(([k, v]) => e.setAttribute(k, v));
  }
  return e;
}

function appendPlayerAction(playerLi, text) {
  const actionDiv = playerLi.querySelector(".player-action");
  if (!actionDiv) {
    const wrapper = el("div", { className: "player-info" });
    wrapper.appendChild(el("div", { className: "player-action", text }));
    playerLi.appendChild(wrapper);
    return;
  }
  // if empty -> set, else append with comma
  const existing = actionDiv.textContent.trim();
  actionDiv.textContent = existing ? `${existing}, ${text}` : text;
}

// ---------- BUILD MATCH NODE----------------------------------------------------------------------
function createMatchNode(match, isScheduled = false) {
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
  (match.matchTimes || []).forEach((row) => {
    const r = el("div");
    r.appendChild(el("span", { text: row.phase }));
    r.appendChild(el("span", { text: row.start }));
    r.appendChild(el("span", { text: row.end }));
    r.appendChild(el("span", { text: row.extra }));
    r.appendChild(el("span", { text: row.result }));
    mtRows.appendChild(r);
  });
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
      // DODAJ: promeni status, radi sa backendom itd
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
      p.setAttribute("aria-hidden", "true");
    });
    const panel =
      details.querySelector(`#${target}-${match.id}`) ||
      details.querySelector(`#${target}`);
    if (panel) {
      panel.classList.remove("hidden");
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

// ---------- RENDERING ----------

function renderPastMatches(matches) {
  const root = document.querySelector(".past-matches-root");
  if (!root) return;
  root.innerHTML = "";
  const main = el("main");
  const frag = document.createDocumentFragment();
  matches
    .filter((m) => m.status === "PLAYED")
    .forEach((m) => frag.appendChild(createMatchNode(m, false)));
  main.appendChild(frag);
  root.appendChild(main);
}

function renderScheduledMatches(matches) {
  const root = document.querySelector(".scheduled-matches-root");
  if (!root) return;
  root.innerHTML = "";
  const main = el("main");
  const frag = document.createDocumentFragment();
  // LIVE i SCHEDULED idu u scheduled tab
  matches
    .filter((m) => m.status === "SCHEDULED" || m.status === "LIVE")
    .forEach((m) => frag.appendChild(createMatchNode(m, true)));
  main.appendChild(frag);
  root.appendChild(main);
}

await loadMatches();
renderPastMatches(state.matches);
renderScheduledMatches(state.matches);

// DODAVANJE AKCIJA IGRACU ----------------------------------------------------------------------------------------
// tvoj postojeći selektor
const gamePlayers = document.querySelectorAll(".player-card");

// pomoćna funkcija: pronalazi status meča za dati player element
function getMatchStatusFromPlayer(playerElement) {
  // pretpostavka: struktura je:
  //  <div class="match-info-preview"> ... <span class="green">STATUS</span> </div>
  //  <div class="match-info"> ... <ul class="players-list"> <li class="player-card"> ... </li> ...
  // playerElement se nalazi unutar .match-info — idemo do .match-info pa do PREV sibling (.match-info-preview)
  const details = playerElement.closest(".match-info");
  if (!details) return null;
  const preview = details.previousElementSibling; // očekujemo da je .match-info-preview
  if (!preview) return null;
  const statusEl = preview.querySelector(".green");
  return statusEl ? statusEl.textContent.trim().toUpperCase() : null;
}

gamePlayers.forEach((playerElement) => {
  playerElement.addEventListener("click", () => {
    // PROVERA: da li je meč završen?
    const matchStatus = getMatchStatusFromPlayer(playerElement);
    if (matchStatus === "PLAYED") {
      // ne dozvoljavamo dodavanje akcije za završene mečeve
      // možeš umesto alert-a prikazati neku vizuelnu notifikaciju
      console.log("Match finished — cannot add actions.");
      return;
    }

    // ostali deo tvog originalnog koda (modal kreiranje, forma, itd.)
    const isSub = playerElement.classList.contains("substitute");
    const playerName =
      playerElement.querySelector(".player-name")?.textContent.trim() ||
      "Player";

    // SKUPIMO IGRACE IZ STARTNE POSTAVE — zbog SUBSTITUTION
    const startingPlayers = Array.from(
      playerElement
        .closest(".players")
        .querySelectorAll(".starting-lineup-block .player-card")
    ).map((p) => {
      const name = p.querySelector(".player-name").textContent.trim();
      const num = p.querySelector(".player-number").textContent.trim();
      return {
        label: `${num} ${name}`,
        value: name,
      };
    });

    // KREIRAMO OVERLAY + MINIMALNI MODAL
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
  <div class="team-modal">
    <button class="team-modal__close" aria-label="Close modal">&times;</button> 

    <h3 class="team-modal__title">${playerName} — Add action</h3>

    <form id="actionForm" class="team-modal__form">

      <select name="action" class="action-select" required>
        <option value="Goal">Goal</option>
        <option value="OwnGoal">OwnGoal</option>
        <option value="Penalty">Penalty</option>
        <option value="MissedPenalty">Missed penalty</option>
        <option value="YellowCard">Yellow card</option>
        <option value="RedCard">Red card</option>
        ${isSub ? '<option value="Substitution">Substitution</option>' : ""}
      </select>

      <input type="number" name="minute" class="minute-input" placeholder="Minute" />

      <select name="when" class="when-select">
        <option value="DuringMatch">During match</option>
        <option value="BeforeMatch">Before match</option>
        <option value="AfterMatch">After match</option>
      </select>

      <div id="reason-wrapper">
        <select name="reason" class="reason-select">
          <option>Rough start</option>
          <option>Preventing a promising attack</option>
          <option>Preventing obvious opportunity to obtain a goal</option>
          <option>Pausing the game</option>
          <option>Neglecting words or movements</option>
          <option>Frequent violation of the game rules</option>
          <option>Misconduct</option>
        </select>
      </div>

      ${
        isSub
          ? `
            <select name="sub_with" class="sub-with-select">
              ${startingPlayers
                .map((p) => `<option value="${p.value}">${p.label}</option>`)
                .join("")}
            </select>
          `
          : ""
      }

      <div id="desc-wrapper">
        <textarea name="desc" rows="3" class="description-input"
          placeholder="Description (optional)"></textarea>
      </div>

      <button type="submit" class="submit-button">Add action</button>
    </form>
  </div>
`;

    document.body.appendChild(overlay);

    const form = overlay.querySelector("#actionForm");
    const closeBtn = overlay.querySelector(".team-modal__close");

    const actionSelect = overlay.querySelector('select[name="action"]'); // padajuca lista za akcije
    const descWrapper = overlay.querySelector("#desc-wrapper");
    const reasonWrapper = overlay.querySelector("#reason-wrapper");
    const descTextarea = overlay.querySelector('textarea[name="desc"]'); // padajuca lista za opis

    function updateVisibility() {
      const value = actionSelect.value;

      const isCard = value === "YellowCard" || value === "RedCard";

      // opis i razlog samo za zuti/crveni
      descWrapper.style.display = isCard ? "block" : "none";
      reasonWrapper.style.display = isCard ? "block" : "none";

      form.elements["when"].style.display = isCard ? "block" : "none";

      // ako nije karton — očisti description
      if (!isCard) {
        descTextarea.value = "";
      }

      if (form.elements["sub_with"])
        form.elements["sub_with"].style.display =
          value === "Substitution" ? "block" : "none";
    }

    actionSelect.addEventListener("change", updateVisibility);

    // pozovi odmah da inicijalno podesi vidljivost
    updateVisibility();

    // ZATVARANJE
    const close = () => overlay.remove();
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);

    // SUBMIT
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
        text = `Yellow card (${minute}') — ${reason}`;
      else if (a === "RedCard") text = `Red card (${minute}') — ${reason}`;
      else if (a === "Substitution")
        text = `Substitution: on ${subWith} (${minute}')`;

      if (desc) text += ` — ${desc}`;

      const actionDiv = playerElement.querySelector(".player-action");

      if (actionDiv.textContent.trim() === "") {
        actionDiv.textContent = text;
      } else {
        actionDiv.textContent += "; " + text;
      }

      close();
    });
  });
});

// === Officials (isti princip) ===
const officialsActions = document.querySelectorAll(".officials-list");

officialsActions.forEach((official) => {
  official.addEventListener("click", function (e) {
    // ako se klik dešava u okviru match koji je PLAYED -> ne radimo ništa
    // pronalazimo match-info roditelja
    const matchInfo = official.closest(".match-info");
    const preview = matchInfo ? matchInfo.previousElementSibling : null;
    const status = preview
      ? (preview.querySelector(".green")?.textContent || "")
          .trim()
          .toUpperCase()
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
      const officialAct = official.querySelector(".official-action");
      if (officialAct) {
        if (officialAct.textContent.trim() === "")
          officialAct.textContent = text;
        else officialAct.textContent += `; ${text}`;
      } else {
        // ako nema, napravi i dodaj
        const newAct = document.createElement("div");
        newAct.className = "official-action";
        newAct.textContent = text;
        official.appendChild(newAct);
      }
      close();
    });
  });
});
