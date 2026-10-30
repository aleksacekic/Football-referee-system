import { el, createGameStepButton, applyPlayerState } from "./common-view.js";
import { openMatchActionForm } from "./match-action-form.js";
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

function buildPlayerCard(player, isSub, editable, onMemberClick) {
  const li = el("li", {
    className: isSub ? "player-card substitute" : "player-card",
    attrs: { "data-member-id": String(player.id) },
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

  if (editable) {
    li.style.cursor = "pointer";
    li.addEventListener("click", () => onMemberClick(player.id));
  }
  return li;
}

function buildOfficialItem(official, editable, onMemberClick) {
  const li = el("li", {
    className: "official-item",
    attrs: { "data-member-id": String(official.id) },
  });
  li.appendChild(el("div", { className: "official-role", text: official.role || "Official" }));
  li.appendChild(el("div", { className: "official-name", text: official.name || "" }));
  li.appendChild(el("div", { className: "official-action", text: official.action || "" }));

  if (editable) {
    li.style.cursor = "pointer";
    li.addEventListener("click", () => onMemberClick(official.id));
  }
  return li;
}

function buildPlayersSection(sidePlayers, editable, onMemberClick) {
  const wrapper = el("div", { className: "players" });

  const startSection = el("section", { className: "players-block" });
  startSection.appendChild(el("h5", { className: "players-block-title", text: "Starting lineup" }));
  const ulStart = el("ul", { className: "players-list" });
  sidePlayers.starting.forEach((p) =>
    ulStart.appendChild(buildPlayerCard(p, false, editable, onMemberClick))
  );
  startSection.appendChild(ulStart);
  wrapper.appendChild(startSection);

  const subSection = el("section", { className: "players-block" });
  subSection.appendChild(el("h5", { className: "players-block-title", text: "Substitutes" }));
  const ulSubs = el("ul", { className: "players-list" });
  sidePlayers.substitutes.forEach((p) =>
    ulSubs.appendChild(buildPlayerCard(p, true, editable, onMemberClick))
  );
  subSection.appendChild(ulSubs);
  wrapper.appendChild(subSection);

  const offSection = el("section", { className: "players-block" });
  offSection.appendChild(el("h5", { className: "players-block-title", text: "Team officials" }));
  const ulOff = el("ul", { className: "officials-list" });
  sidePlayers.officials.forEach((o) => ulOff.appendChild(buildOfficialItem(o, editable, onMemberClick)));
  offSection.appendChild(ulOff);
  wrapper.appendChild(offSection);

  return wrapper;
}

// Posle svakog dogadjaja akcije i stanje na SVIM karticama citamo iz podataka.
// Tako izmena upise "IN" kod igraca koji ulazi i "OUT" kod onog koji izlazi,
// a prikaz i podaci ne mogu da se razidju.
function refreshMemberCards(root, details) {
  const byId = new Map();
  ["home", "away"].forEach((side) => {
    const { starting, substitutes, officials } = details.players[side];
    [...starting, ...substitutes, ...officials].forEach((m) => byId.set(m.id, m));
  });

  root.querySelectorAll("[data-member-id]").forEach((card) => {
    const member = byId.get(Number(card.dataset.memberId));
    if (!member) return;
    const actionEl = card.querySelector(".player-action, .official-action");
    if (actionEl) actionEl.textContent = member.action;
    if (card.classList.contains("player-card")) applyPlayerState(card, member.state);
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

  const closeBtn = el("button", {
    className: "team-modal__close",
    text: "×",
    attrs: { type: "button", "aria-label": "Close modal" },
  });
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

  const homeLi = el("li");
  const homeBtn = el("button", { className: "nav-link-match active", text: "HOME" });
  homeLi.appendChild(homeBtn);

  const awayLi = el("li");
  const awayBtn = el("button", { className: "nav-link-match", text: "AWAY" });
  awayLi.appendChild(awayBtn);

  tabsUl.appendChild(homeLi);
  tabsUl.appendChild(awayLi);
  tabsWrap.appendChild(tabsUl);
  modal.appendChild(tabsWrap);

  // Uvek najsvezija verzija detalja meca — menja se posle svakog dogadjaja,
  // da bi lista "ko je na terenu" bila tacna i za sledecu izmenu.
  let current = matchDetails;

  function handleMemberClick(memberId) {
    openMatchActionForm(current, memberId, (eventPayload) => {
      const updated = onActionAdded(eventPayload);
      if (!updated) return;
      current = updated;
      refreshMemberCards(modal, updated);
      scoreEl.textContent = updated.teams.score;
    });
  }

  const homePanel = el("div", { className: "tab-panel active" });
  homePanel.appendChild(buildPlayersSection(matchDetails.players.home, editable, handleMemberClick));

  const awayPanel = el("div", { className: "tab-panel hidden" });
  awayPanel.appendChild(buildPlayersSection(matchDetails.players.away, editable, handleMemberClick));

  modal.appendChild(homePanel);
  modal.appendChild(awayPanel);

  function showSide(showHome) {
    homeBtn.classList.toggle("active", showHome);
    awayBtn.classList.toggle("active", !showHome);
    homePanel.classList.toggle("hidden", !showHome);
    homePanel.classList.toggle("active", showHome);
    awayPanel.classList.toggle("hidden", showHome);
    awayPanel.classList.toggle("active", !showHome);
  }
  homeBtn.addEventListener("click", () => showSide(true));
  awayBtn.addEventListener("click", () => showSide(false));

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
