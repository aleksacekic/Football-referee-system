import { el } from "./common-view.js";

const LEAGUES_ROOT = ".leagues-root";
const DEFAULT_LOGO = "/assets/images/team-1.jpg";

const COLUMNS = [
  { cls: "col-pos", text: "#" },
  { cls: "col-team", text: "Team" },
  { cls: "col-played", text: "M" },
  { cls: "col-w", text: "W" },
  { cls: "col-d", text: "D" },
  { cls: "col-l", text: "L" },
  { cls: "col-g", text: "G" },
  { cls: "col-gd", text: "GD" },
  { cls: "col-points", text: "Pts" },
];

function createTeamRow(team) {
  const tr = el("tr", {
    className: "team-table",
    attrs: { "data-team-id": String(team.teamId) },
  });

  tr.appendChild(el("td", { className: "col-pos", text: String(team.pos) }));

  const tdTeam = el("td", { className: "col-team" });
  const teamCell = el("div", { className: "team-cell" });
  teamCell.appendChild(
    el("img", {
      className: "team-logo-standings",
      attrs: { src: team.logo || DEFAULT_LOGO, alt: `Grb ${team.teamName}` },
    })
  );
  const meta = el("div", { className: "team-meta" });
  meta.appendChild(el("div", { className: "team-name-standings", text: team.teamName }));
  if (team.short) meta.appendChild(el("div", { className: "team-short", text: team.short }));
  teamCell.appendChild(meta);
  tdTeam.appendChild(teamCell);
  tr.appendChild(tdTeam);

  [
    ["col-played", team.played],
    ["col-w", team.w],
    ["col-d", team.d],
    ["col-l", team.l],
    ["col-g", team.g],
    ["col-gd", team.gd],
    ["col-points", team.points],
  ].forEach(([cls, value]) => tr.appendChild(el("td", { className: cls, text: String(value) })));

  return tr;
}

function createLeagueNode(league) {
  // wrapper koji sadrzi preview (naslov lige) + tabelu
  const wrapper = el("div", {
    className: "league-block",
    attrs: { "data-league-id": String(league.leagueId) },
  });

  const preview = el("div", { className: "league-preview", text: league.leagueName });
  const tableWrap = el("div", { className: "league-table" });

  const table = el("table", {
    className: "standings",
    attrs: { "aria-label": `League standings — ${league.leagueName}` },
  });
  // za screen readere
  table.appendChild(
    el("caption", { className: "visually-hidden", text: `Standings — ${league.leagueName}` })
  );

  const thead = el("thead");
  const headTr = el("tr");
  COLUMNS.forEach((c) =>
    headTr.appendChild(el("th", { className: c.cls, text: c.text, attrs: { scope: "col" } }))
  );
  thead.appendChild(headTr);
  table.appendChild(thead);

  const tbody = el("tbody");
  league.standings.forEach((team) => tbody.appendChild(createTeamRow(team)));
  table.appendChild(tbody);

  tableWrap.appendChild(table);
  wrapper.appendChild(preview);
  wrapper.appendChild(tableWrap);
  return wrapper;
}

// Otvara jednu ligu (accordion), a ostale zatvara. Ponovni klik zatvara otvorenu.
function toggleLeague(container, block) {
  const preview = block.querySelector(".league-preview");
  const table = block.querySelector(".league-table");
  const wasOpen = preview.classList.contains("opened");

  container.querySelectorAll(".league-preview").forEach((p) => p.classList.remove("opened"));
  container.querySelectorAll(".league-table").forEach((t) => t.classList.remove("active"));

  if (!wasOpen) {
    preview.classList.add("opened");
    table.classList.add("active");
  }
}

// callbacks.onTeamClick({ teamId, teamName, logo }) — klik na tim u tabeli
export function renderLeagues(leaguesData, { onTeamClick } = {}) {
  const container = document.querySelector(LEAGUES_ROOT);
  if (!container) return;

  // zapamti otvorenu ligu, da ostane otvorena posle ponovnog iscrtavanja
  const openLeagueId = container
    .querySelector(".league-preview.opened")
    ?.closest(".league-block")?.dataset.leagueId;

  container.innerHTML = "";
  leaguesData.forEach((league) => container.appendChild(createLeagueNode(league)));

  if (openLeagueId) {
    const block = container.querySelector(`.league-block[data-league-id="${openLeagueId}"]`);
    if (block) toggleLeague(container, block);
  }

  // Jedan listener na kontejneru — postavlja se samo prvi put
  // (renderLeagues se poziva ponovo pri svakom osvezavanju).
  if (container.dataset.listening) return;
  container.dataset.listening = "true";
  container.addEventListener("click", (e) => {
    const preview = e.target.closest(".league-preview");
    if (preview) {
      toggleLeague(container, preview.closest(".league-block"));
      return;
    }

    const row = e.target.closest(".team-table");
    if (row && container.onTeamClick) {
      container.onTeamClick({
        teamId: Number(row.dataset.teamId),
        teamName: row.querySelector(".team-name-standings").textContent.trim(),
        logo: row.querySelector(".team-logo-standings").getAttribute("src"),
      });
    }
  });
  container.onTeamClick = onTeamClick;
}

const OUTCOME_LABELS = { W: "W", D: "D", L: "L" };

// Modal sa poslednjim mecevima tima (podaci dolaze iz controller-a).
export function showTeamModal(team, recentMatches) {
  const overlay = el("div", { className: "modal-overlay" });
  const modal = el("div", { className: "team-modal" });

  const closeBtn = el("button", {
    className: "team-modal__close",
    text: "×",
    attrs: { type: "button", "aria-label": "Close modal" },
  });
  modal.appendChild(closeBtn);

  const header = el("div", { className: "team-modal__header" });
  header.appendChild(
    el("img", { className: "team-modal__logo", attrs: { src: team.logo, alt: team.teamName } })
  );
  header.appendChild(el("div", { className: "team-modal__title", text: team.teamName }));
  modal.appendChild(header);

  const body = el("div", { className: "team-modal__body" });
  const section = el("div", { className: "team-modal__section" });
  section.appendChild(el("strong", { text: "Recent matches" }));

  if (recentMatches.length === 0) {
    section.appendChild(el("div", { text: "No played matches yet." }));
  } else {
    recentMatches.forEach((m) =>
      section.appendChild(
        el("div", {
          text: `${m.date} vs ${m.opponent} (${m.venue}) — ${m.score} ${OUTCOME_LABELS[m.outcome]}`,
        })
      )
    );
  }
  body.appendChild(section);
  modal.appendChild(body);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);
}
