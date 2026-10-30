import { el } from "./common-view.js";

// Forma za dodavanje dogadjaja na mecu (gol, karton, izmena...).
// Koriste je i modal sa dashboard-a i tabovi "Scheduled" / "Past" —
// jedna forma, jedna logika, svi dogadjaji idu u podatke.

const PLAYER_ACTIONS = [
  ["GOAL", "Goal"],
  ["OWN_GOAL", "Own goal"],
  ["PENALTY", "Penalty scored"],
  ["MISSED_PENALTY", "Missed penalty"],
  ["YELLOW_CARD", "Yellow card"],
  ["RED_CARD", "Red card"],
];

// Sluzbena lica tima (trener, fizioterapeut...) mogu dobiti samo karton.
const STAFF_ACTIONS = [
  ["YELLOW_CARD", "Yellow card"],
  ["RED_CARD", "Red card"],
];

const CARD_REASONS = [
  "Rough start",
  "Preventing a promising attack",
  "Preventing obvious opportunity to obtain a goal",
  "Pausing the game",
  "Neglecting words or movements",
  "Frequent violation of the game rules",
  "Misconduct",
];

// Karton moze biti dat i pre ili posle meca (tada minut nije obavezan).
const TIMINGS = [
  ["DURING_MATCH", "During match"],
  ["BEFORE_MATCH", "Before match"],
  ["AFTER_MATCH", "After match"],
];

const isCard = (type) => type === "YELLOW_CARD" || type === "RED_CARD";

// Pronalazi clana tima (igraca ili sluzbeno lice) u detaljima meca.
function findMember(matchDetails, memberId) {
  for (const side of ["home", "away"]) {
    const { starting, substitutes, officials } = matchDetails.players[side];
    const player = [...starting, ...substitutes].find((p) => p.id === memberId);
    if (player) return { side, member: player, kind: "PLAYER" };
    const official = officials.find((o) => o.id === memberId);
    if (official) return { side, member: official, kind: "STAFF" };
  }
  return null;
}

function addOption(select, value, label) {
  select.appendChild(el("option", { text: label ?? value, attrs: { value } }));
}

function field(labelText, control) {
  const wrap = el("div", { className: "form-field" });
  if (labelText) wrap.appendChild(el("label", { text: labelText }));
  wrap.appendChild(control);
  return wrap;
}

// onEventCreated(eventPayload) — poziva se sa gotovim dogadjajem za match-events.
export function openMatchActionForm(matchDetails, memberId, onEventCreated) {
  const found = findMember(matchDetails, memberId);
  if (!found) return;
  const { side, member, kind } = found;

  const teamId = side === "home" ? matchDetails.homeTeamId : matchDetails.awayTeamId;
  const { starting, substitutes } = matchDetails.players[side];
  // Izlaziti mogu samo igraci SVOG tima koji su trenutno na terenu.
  const playersOnPitch = [...starting, ...substitutes].filter((p) => p.state === "ON_PITCH");
  // Uci moze samo igrac sa klupe koji jos nije ulazio.
  const canSubstitute = kind === "PLAYER" && member.state === "BENCH" && playersOnPitch.length > 0;

  // ---------- polja ----------
  const actionSelect = el("select", { attrs: { name: "type" } });
  (kind === "PLAYER" ? PLAYER_ACTIONS : STAFF_ACTIONS).forEach(([v, l]) =>
    addOption(actionSelect, v, l)
  );
  if (canSubstitute) addOption(actionSelect, "SUBSTITUTION", "Substitution");

  const timingSelect = el("select", { attrs: { name: "timing" } });
  TIMINGS.forEach(([v, l]) => addOption(timingSelect, v, l));

  const minuteInput = el("input", {
    attrs: { type: "number", name: "minute", min: "0", max: "130", placeholder: "Minute" },
  });

  const reasonSelect = el("select", { attrs: { name: "reason" } });
  CARD_REASONS.forEach((r) => addOption(reasonSelect, r));

  const subOffSelect = el("select", { attrs: { name: "playerOutId" } });
  playersOnPitch.forEach((p) => addOption(subOffSelect, String(p.id), `${p.num} ${p.name}`));

  const noteInput = el("textarea", {
    className: "description-input",
    attrs: { name: "note", rows: "3", placeholder: "Description (optional)" },
  });

  const timingField = field("When:", timingSelect);
  const minuteField = field(null, minuteInput);
  const reasonField = field("Reason:", reasonSelect);
  const subOffField = field("Player going off:", subOffSelect);
  const noteField = field(null, noteInput);

  const form = el("form", { className: "team-modal__form" });
  [field(null, actionSelect), timingField, minuteField, reasonField, subOffField, noteField].forEach(
    (f) => form.appendChild(f)
  );
  form.appendChild(el("button", { className: "submit-button", text: "Add action", attrs: { type: "submit" } }));

  // Prikazuje samo polja koja imaju smisla za izabranu akciju.
  function updateVisibility() {
    const type = actionSelect.value;
    const card = isCard(type);
    const duringMatch = !card || timingSelect.value === "DURING_MATCH";

    timingField.hidden = !card;
    reasonField.hidden = !card;
    noteField.hidden = !card;
    subOffField.hidden = type !== "SUBSTITUTION";
    // Minut je obavezan za sve sto se desava tokom meca.
    minuteField.hidden = !duringMatch;
    minuteInput.required = duringMatch;
  }
  actionSelect.addEventListener("change", updateVisibility);
  timingSelect.addEventListener("change", updateVisibility);
  updateVisibility();

  // ---------- modal ----------
  const overlay = el("div", { className: "modal-overlay" });
  const modal = el("div", { className: "team-modal" });
  const closeBtn = el("button", {
    className: "team-modal__close",
    text: "×",
    attrs: { type: "button", "aria-label": "Close modal" },
  });
  modal.appendChild(closeBtn);
  modal.appendChild(el("h3", { className: "team-modal__title", text: `${member.name} — Add action` }));
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
    const type = actionSelect.value;

    const eventPayload = {
      matchId: matchDetails.id,
      teamId,
      type,
      minute: minuteField.hidden ? null : Number(minuteInput.value),
    };

    if (isCard(type)) {
      eventPayload.timing = timingSelect.value;
      eventPayload.reason = reasonSelect.value;
      const note = noteInput.value.trim();
      if (note) eventPayload.note = note;
    }

    if (type === "SUBSTITUTION") {
      // Kliknut je igrac sa klupe — on ULAZI, a izabrani igrac sa terena IZLAZI.
      eventPayload.playerInId = member.id;
      eventPayload.playerOutId = Number(subOffSelect.value);
    } else {
      // playerId = id clana tima (igrac ili sluzbeno lice)
      eventPayload.playerId = member.id;
    }

    close();
    onEventCreated(eventPayload);
  });
}
