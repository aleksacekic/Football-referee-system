import { el, createGameStepButton } from "./common-view.js";
import { canEditMatch } from "../services/auth-service.js";

function buildResultBlock(matchDetails) {
  const result = el("div", { className: "result" });

  const leftLogo = el("div", { className: "team-logo-container" });
  leftLogo.appendChild(
    el("img", {
      className: "team-logo",
      attrs: { src: matchDetails.teams.home.logo, alt: matchDetails.teams.home.name },
    })
  );
  result.appendChild(leftLogo);
  result.appendChild(
    el("div", { className: "team-name team-name1", text: matchDetails.teams.home.name })
  );

  const scoreWrap = el("div", { className: "result-numbers-container" });
  const scoreEl = el("div", { className: "result-numbers", text: matchDetails.teams.score });
  scoreWrap.appendChild(scoreEl);
  result.appendChild(scoreWrap);

  result.appendChild(
    el("div", { className: "team-name team-name2", text: matchDetails.teams.away.name })
  );

  const rightLogo = el("div", { className: "team-logo-container" });
  rightLogo.appendChild(
    el("img", {
      className: "team-logo",
      attrs: { src: matchDetails.teams.away.logo, alt: matchDetails.teams.away.name },
    })
  );
  result.appendChild(rightLogo);

  return { result, scoreEl };
}

const PLAYER_STATE_CLASSES = {
  SUBBED_OUT: "player-card--subbed-out",
  SENT_OFF: "player-card--sent-off",
};

// Postavlja CSS klasu prema stanju igraca (zamenjen / iskljucen).
function applyPlayerState(card, state) {
  Object.values(PLAYER_STATE_CLASSES).forEach((c) => card.classList.remove(c));
  if (PLAYER_STATE_CLASSES[state]) card.classList.add(PLAYER_STATE_CLASSES[state]);
}

function buildPlayerCard(player, isSub, editable, onOpenActionForm) {
  const li = el("li", {
    className: isSub ? "player-card substitute" : "player-card",
    attrs: { "data-player-id": String(player.id) },
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
  const actionEl = el("div", { className: "player-action", text: player.action || "" });
  info.appendChild(actionEl);
  li.appendChild(info);

  if (editable) {
    li.style.cursor = "pointer";
    li.addEventListener("click", () => onOpenActionForm(player.id));
  }

  return li;
}

function buildPlayersSection(sidePlayers, editable, onOpenActionForm) {
  const wrapper = el("div", { className: "players" });

  const startSection = el("section", { className: "players-block" });
  startSection.appendChild(el("h5", { className: "players-block-title", text: "Starting lineup" }));
  const ulStart = el("ul", { className: "players-list" });
  (sidePlayers.starting || []).forEach((p) =>
    ulStart.appendChild(buildPlayerCard(p, false, editable, onOpenActionForm))
  );
  startSection.appendChild(ulStart);
  wrapper.appendChild(startSection);

  const subSection = el("section", { className: "players-block" });
  subSection.appendChild(el("h5", { className: "players-block-title", text: "Substitutes" }));
  const ulSubs = el("ul", { className: "players-list" });
  (sidePlayers.substitutes || []).forEach((p) =>
    ulSubs.appendChild(buildPlayerCard(p, true, editable, onOpenActionForm))
  );
  subSection.appendChild(ulSubs);
  wrapper.appendChild(subSection);

  const offSection = el("section", { className: "players-block" });
  offSection.appendChild(el("h5", { className: "players-block-title", text: "Team officials" }));
  const ulOff = el("ul", { className: "officials-list" });
  (sidePlayers.officials || []).forEach((o) => {
    const liOff = el("li", { className: "official-item" });
    liOff.appendChild(el("div", { className: "official-role", text: o.role || "Official" }));
    liOff.appendChild(el("div", { className: "official-name", text: o.name || "" }));
    ulOff.appendChild(liOff);
  });
  offSection.appendChild(ulOff);
  wrapper.appendChild(offSection);

  return wrapper;
}

// canEnter      — igrac je na klupi i jos nije ulazio, pa moze da udje (izmena)
// playersOnPitch — igraci njegovog tima koji su TRENUTNO na terenu (mogu da izadju)
function openPlayerActionForm(player, canEnter, playersOnPitch, onSubmit) {
  const isSub = canEnter && playersOnPitch.length > 0;
  const teammates = playersOnPitch;
  const overlay = el("div", { className: "modal-overlay" });
  const modal = el("div", { className: "team-modal" });

  const closeBtn = el("button", { className: "team-modal__close", text: "×" });
  const title = el("h3", { className: "team-modal__title", text: `${player.name} — Add action` });

  const form = el("form", { className: "team-modal__form" });

  function addOption(select, value, label) {
    const o = document.createElement("option");
    o.value = value;
    o.textContent = label ?? value;
    select.appendChild(o);
  }

  const actionSelect = document.createElement("select");
  addOption(actionSelect, "GOAL", "Goal");
  addOption(actionSelect, "OWN_GOAL", "Own goal");
  addOption(actionSelect, "PENALTY", "Penalty scored");
  addOption(actionSelect, "MISSED_PENALTY", "Missed penalty");
  addOption(actionSelect, "YELLOW_CARD", "Yellow card");
  addOption(actionSelect, "RED_CARD", "Red card");
  if (isSub) addOption(actionSelect, "SUBSTITUTION", "Substitution");

  const minuteInput = document.createElement("input");
  minuteInput.type = "number";
  minuteInput.placeholder = "Minute";

  const reasonWrapper = document.createElement("div");
  const reasonSelect = document.createElement("select");
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

  let subWithSelect = null;
  const subWithWrapper = document.createElement("div");
  if (isSub) {
    subWithWrapper.appendChild(el("label", { text: "Player going off:" }));
    subWithSelect = document.createElement("select");
    teammates.forEach((t) => addOption(subWithSelect, String(t.id), `${t.num} ${t.name}`));
    subWithWrapper.appendChild(subWithSelect);
  }

  form.appendChild(actionSelect);
  form.appendChild(minuteInput);
  form.appendChild(reasonWrapper);
  if (isSub) form.appendChild(subWithWrapper);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "submit-button";
  submitBtn.textContent = "Add action";
  form.appendChild(submitBtn);

  function updateVisibility() {
    const isCard = actionSelect.value === "YELLOW_CARD" || actionSelect.value === "RED_CARD";
    reasonWrapper.style.display = isCard ? "block" : "none";
    if (subWithWrapper) {
      subWithWrapper.style.display = actionSelect.value === "SUBSTITUTION" ? "block" : "none";
    }
  }
  actionSelect.addEventListener("change", updateVisibility);
  updateVisibility();

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(form);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    onSubmit({
      type: actionSelect.value,
      minute: Number(minuteInput.value) || 0,
      reason: reasonSelect.value,
      subWithId: subWithSelect ? Number(subWithSelect.value) : null,
    });
    close();
  });
}

// callbacks:
//   onActionAdded(eventPayload) -> vraca osvezene detalje meca
//   onGameStep(matchId)         -> START GAME / END 1st HALF / ... / LOCK
export function showMatchDetailsModal(matchDetails, { onActionAdded, onGameStep } = {}) {
  const overlay = el("div", { className: "modal-overlay" });
  const modal = el("div", {
    className: "team-modal",
    attrs: { style: "max-width:900px;width:95%;max-height:90vh;overflow-y:auto;position:relative;" },
  });

  const closeBtn = el("button", { className: "team-modal__close", text: "×" });
  modal.appendChild(closeBtn);

  modal.appendChild(
    el("h3", {
      className: "team-modal__title",
      text: `${matchDetails.teams.home.name} - ${matchDetails.teams.away.name}`,
    })
  );

  const { result, scoreEl } = buildResultBlock(matchDetails);
  modal.appendChild(result);

  const info = el("div", { className: "other-info" });
  info.appendChild(el("span", { text: `Status: ${matchDetails.status}` }));
  info.appendChild(el("span", { text: `Date: ${matchDetails.datetime}` }));
  info.appendChild(el("span", { text: `Round: ${matchDetails.round}` }));
  info.appendChild(el("span", { text: `Competition: ${matchDetails.competition}` }));
  info.appendChild(el("span", { text: `Stadium: ${matchDetails.stadium}` }));
  modal.appendChild(info);

  const refBox = el("div", { className: "referee-info" });
  (matchDetails.officials || []).forEach((o) => refBox.appendChild(el("span", { text: o })));
  modal.appendChild(refBox);

  const editable = canEditMatch(matchDetails);

  // TABOVI HOME / AWAY
  const tabsWrap = el("div", { className: "match-tabs" });
  const tabsUl = el("ul", { className: "nav match-tabs-list" });

  const homeLi = document.createElement("li");
  const homeBtn = el("button", { className: "nav-link-match active", text: "HOME" });
  homeLi.appendChild(homeBtn);

  const awayLi = document.createElement("li");
  const awayBtn = el("button", { className: "nav-link-match", text: "AWAY" });
  awayLi.appendChild(awayBtn);

  tabsUl.appendChild(homeLi);
  tabsUl.appendChild(awayLi);
  tabsWrap.appendChild(tabsUl);
  modal.appendChild(tabsWrap);

  // Uvek najsvezija verzija detalja meca — menja se posle svakog dogadjaja,
  // da bi lista "ko je na terenu" bila tacna i za sledecu izmenu.
  let current = matchDetails;

  const allPlayersOf = (details, side) => [
    ...details.players[side].starting,
    ...details.players[side].substitutes,
  ];

  // Kojoj strani ("home" / "away") pripada igrac i njegovi aktuelni podaci.
  function findPlayer(playerId) {
    for (const side of ["home", "away"]) {
      const player = allPlayersOf(current, side).find((p) => p.id === playerId);
      if (player) return { side, player };
    }
    return null;
  }

  // Posle svakog dogadjaja akcije i stanje na SVIM karticama citamo iz podataka.
  // Tako izmena upise "IN" kod igraca koji ulazi i "OUT" kod onog koji izlazi,
  // a prikaz i podaci ne mogu da se razidju.
  function refreshPlayerCards(updatedDetails) {
    const playerById = new Map();
    ["home", "away"].forEach((side) =>
      allPlayersOf(updatedDetails, side).forEach((p) => playerById.set(p.id, p))
    );

    modal.querySelectorAll(".player-card[data-player-id]").forEach((card) => {
      const player = playerById.get(Number(card.dataset.playerId));
      if (!player) return;
      const actionEl = card.querySelector(".player-action");
      if (actionEl) actionEl.textContent = player.action;
      applyPlayerState(card, player.state);
    });
  }

  function handleActionSubmit(playerId) {
    const found = findPlayer(playerId);
    if (!found) return;
    const { side, player } = found;

    const teamId = side === "home" ? current.homeTeamId : current.awayTeamId;
    // Izlaziti mogu samo igraci SVOG tima koji su trenutno na terenu
    // (starteri koji nisu zamenjeni + rezerve koje su vec usle).
    const playersOnPitch = allPlayersOf(current, side).filter((p) => p.state === "ON_PITCH");
    const canEnter = player.state === "BENCH";

    openPlayerActionForm(player, canEnter, playersOnPitch, (payload) => {
      const eventPayload = {
        matchId: matchDetails.id,
        teamId,
        type: payload.type,
        minute: payload.minute,
      };

      // Razlog ima smisla samo za kartone.
      if (payload.type === "YELLOW_CARD" || payload.type === "RED_CARD") {
        eventPayload.reason = payload.reason;
      }

      if (payload.type === "SUBSTITUTION") {
        // Kliknut je igrac sa klupe — on ULAZI, a izabrani starter IZLAZI.
        eventPayload.playerInId = player.id;
        eventPayload.playerOutId = payload.subWithId;
      } else {
        eventPayload.playerId = player.id;
      }

      const updated = onActionAdded(eventPayload);
      if (updated) {
        current = updated;
        refreshPlayerCards(updated);
        scoreEl.textContent = updated.teams.score;
      }
    });
  }

  const homePanel = el("div", { className: "tab-panel active" });
  homePanel.appendChild(buildPlayersSection(matchDetails.players.home, editable, handleActionSubmit));

  const awayPanel = el("div", { className: "tab-panel hidden" });
  awayPanel.appendChild(buildPlayersSection(matchDetails.players.away, editable, handleActionSubmit));

  modal.appendChild(homePanel);
  modal.appendChild(awayPanel);

  homeBtn.addEventListener("click", () => {
    homeBtn.classList.add("active");
    awayBtn.classList.remove("active");
    homePanel.classList.remove("hidden");
    homePanel.classList.add("active");
    awayPanel.classList.add("hidden");
    awayPanel.classList.remove("active");
  });
  awayBtn.addEventListener("click", () => {
    awayBtn.classList.add("active");
    homeBtn.classList.remove("active");
    awayPanel.classList.remove("hidden");
    awayPanel.classList.add("active");
    homePanel.classList.add("hidden");
    homePanel.classList.remove("active");
  });

  // Dugme za sledeci korak meca — isto kao u tabu "My scheduled matches".
  // Posle klika modal se zatvara, a controller osvezava sve prikaze.
  if (onGameStep) {
    const stepBtn = createGameStepButton(matchDetails, (matchId) => {
      overlay.remove();
      onGameStep(matchId);
    });
    if (stepBtn) modal.appendChild(stepBtn);
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);
}