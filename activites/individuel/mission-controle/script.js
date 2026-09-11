import { CONTROL_STEPS, analyzeRanking } from "../../mission-controle/content.js";

const rankingScreen = document.querySelector("#ranking-screen");
const correctionScreen = document.querySelector("#ranking-correction-screen");
const closedScreen = document.querySelector("#closed-screen");
const board = document.querySelector("#mission-timeline");
const bank = document.querySelector("#mission-choices");
const bankPanel = document.querySelector(".control-bank-panel");
const progress = document.querySelector("#mission-progress");
const progressLabel = document.querySelector("#mission-progress-label");
const prompt = document.querySelector("#mission-question-title");
const undoButton = document.querySelector("#undo-mission-button");
const validateButton = document.querySelector("#validate-ranking-button");
let positions = Array(CONTROL_STEPS.length).fill(null);
let history = [];
let drag = null;
const bankOrder = [...CONTROL_STEPS].sort(() => Math.random() - .5);

function showOnly(screen) {
  [rankingScreen, correctionScreen, closedScreen]
    .forEach((item) => item.hidden = item !== screen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextEmpty() {
  return positions.findIndex((value) => value === null);
}

function renderBoard() {
  const placed = positions.filter(Boolean).length;
  const active = nextEmpty();
  board.replaceChildren();
  positions.forEach((stepId, index) => {
    const step = CONTROL_STEPS.find((item) => item.id === stepId);
    const item = document.createElement("li");
    const slot = document.createElement("div");
    slot.className = "control-slot";
    slot.dataset.slotIndex = index;
    slot.classList.toggle("filled", Boolean(step));
    slot.classList.toggle("active", index === active);
    if (step) slot.dataset.dragStep = step.id;
    slot.innerHTML = step
      ? `<span class="control-slot-number">${index + 1}</span><img src="${step.image}" alt=""><strong>${step.label}</strong><small>Faire glisser</small>`
      : `<span class="control-slot-number">${index + 1}</span><strong>${index === active ? "Dépose une étape ici" : "Emplacement libre"}</strong>`;
    item.append(slot);
    board.append(item);
  });

  bank.replaceChildren();
  bankOrder.filter((step) => !positions.includes(step.id)).forEach((step) => {
    const card = document.createElement("div");
    card.className = "control-card";
    card.dataset.dragStep = step.id;
    card.innerHTML = `<img src="${step.image}" alt=""><strong>${step.label}</strong>`;
    bank.append(card);
  });
  progress.value = placed;
  progressLabel.textContent = `${placed} / ${CONTROL_STEPS.length}`;
  prompt.textContent = active < 0
    ? "Ton ordre est complet. Tu peux encore échanger les cartes."
    : "Fais glisser chaque carte vers la place de ton choix.";
  undoButton.disabled = history.length === 0;
  validateButton.disabled = placed !== CONTROL_STEPS.length;
}

function clearTarget() {
  document.querySelectorAll(".control-drop-target").forEach((item) =>
    item.classList.remove("control-drop-target"));
}

function movePreview(x, y) {
  if (!drag) return;
  drag.preview.style.transform = `translate3d(${x - drag.offsetX}px, ${y - drag.offsetY}px, 0)`;
}

function autoScroll() {
  if (!drag) return;
  if (drag.moved && drag.clientY < 85) window.scrollBy(0, -10);
  if (drag.moved && drag.clientY > innerHeight - 85) window.scrollBy(0, 10);
  drag.frame = requestAnimationFrame(autoScroll);
}

rankingScreen.addEventListener("pointerdown", (event) => {
  const source = event.target.closest("[data-drag-step]");
  if (!source || event.button > 0) return;
  const step = CONTROL_STEPS.find((item) => item.id === source.dataset.dragStep);
  const box = source.getBoundingClientRect();
  const preview = document.createElement("div");
  preview.className = "control-drag-preview";
  preview.innerHTML = `<img src="${step.image}" alt=""><strong>${step.label}</strong>`;
  preview.style.width = `${Math.min(box.width, 240)}px`;
  document.body.append(preview);
  drag = {
    pointerId: event.pointerId,
    stepId: step.id,
    sourceSlot: source.dataset.slotIndex === undefined ? null : Number(source.dataset.slotIndex),
    source, preview, clientY: event.clientY, moved: false,
    offsetX: Math.min(event.clientX - box.left, 90),
    offsetY: Math.min(event.clientY - box.top, 32)
  };
  source.classList.add("control-drag-source");
  source.setPointerCapture(event.pointerId);
  movePreview(event.clientX, event.clientY);
  drag.frame = requestAnimationFrame(autoScroll);
  event.preventDefault();
});

rankingScreen.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  drag.clientY = event.clientY;
  drag.moved = true;
  movePreview(event.clientX, event.clientY);
  clearTarget();
  document.elementFromPoint(event.clientX, event.clientY)
    ?.closest(".control-slot, .control-bank-panel")
    ?.classList.add("control-drop-target");
  event.preventDefault();
});

function finishDrag(event, cancelled = false) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const current = drag;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const slot = target?.closest(".control-slot");
  const returnToBank = target?.closest(".control-bank-panel");
  cancelAnimationFrame(current.frame);
  current.source.classList.remove("control-drag-source");
  current.preview.remove();
  clearTarget();
  drag = null;
  if (cancelled) return;
  if (slot) {
    const targetIndex = Number(slot.dataset.slotIndex);
    if (targetIndex === current.sourceSlot) return;
    history.push([...positions]);
    if (current.sourceSlot === null) positions[targetIndex] = current.stepId;
    else [positions[targetIndex], positions[current.sourceSlot]] =
      [positions[current.sourceSlot], positions[targetIndex]];
  } else if (returnToBank && current.sourceSlot !== null) {
    history.push([...positions]);
    positions[current.sourceSlot] = null;
  } else return;
  renderBoard();
}

rankingScreen.addEventListener("pointerup", (event) => finishDrag(event));
rankingScreen.addEventListener("pointercancel", (event) => finishDrag(event, true));
undoButton.addEventListener("click", () => {
  const previous = history.pop();
  if (!previous) return;
  positions = previous;
  renderBoard();
});

function renderCorrection() {
  const analysis = analyzeRanking(positions);
  window.ProcycleanGroup?.record("procedure", "Dans quel ordre se déroule le contrôle ?", positions.map(id=>CONTROL_STEPS.find(x=>x.id===id)?.label||"").join(" → "), CONTROL_STEPS.map(x=>x.label).join(" → "), CONTROL_STEPS.map(x=>x.reflex).join(" "), analysis.errorCount===0);
  document.querySelector("#personal-result-summary").textContent = analysis.errorCount
    ? `${analysis.score} étapes sur 9 sont déjà dans la bonne séquence · ${analysis.errorCount} carte${analysis.errorCount > 1 ? "s" : ""} à repositionner.`
    : "9 étapes sur 9 dans la bonne séquence · aucune erreur de placement.";
  const placementFeedback = document.querySelector("#placement-feedback");
  placementFeedback.replaceChildren();
  placementFeedback.classList.toggle("perfect", analysis.errorCount === 0);
  const title = document.createElement("h3");
  title.textContent = analysis.errorCount ? "Tes erreurs de placement" : "Ordre entièrement correct";
  placementFeedback.append(title);
  if (!analysis.errorCount) {
    const message = document.createElement("p");
    message.textContent = "Toutes les cartes suivent la chronologie attendue.";
    placementFeedback.append(message);
  } else {
    const list = document.createElement("ul");
    analysis.errors.forEach((error) => {
      const item = document.createElement("li");
      item.innerHTML = `<img src="${error.image}" alt=""><div><strong>${error.label}</strong><span>Placée en ${error.actualPosition}, attendue en ${error.expectedPosition}</span></div>`;
      list.append(item);
    });
    placementFeedback.append(list);
  }
  const procedure = document.querySelector("#correct-procedure-list");
  procedure.replaceChildren();
  CONTROL_STEPS.forEach((step, index) => {
    const item = document.createElement("li");
    item.className = "procedure-step";
    item.innerHTML = `<img src="${step.image}" alt=""><div><h3>${index + 1}. ${step.label}</h3>
      <p>${step.explanation}</p><div class="procedure-reflex"><strong>Ton réflexe :</strong> ${step.reflex}</div></div>`;
    procedure.append(item);
  });
  (window.procycleanActivityStorage || localStorage).setItem("procyclean-solo-control-ranking", JSON.stringify(positions));
  showOnly(correctionScreen);
}

validateButton.addEventListener("click", renderCorrection);
document.querySelector("#finish-mission").addEventListener("click", () => showOnly(closedScreen));
renderBoard();
document.documentElement.dataset.individualMissionReady = "true";


// Synchronisation de ce même parcours lorsqu’il est ouvert dans une séance.
window.ProcycleanGroup?.register({
 snapshot:()=>({state:{positions,screen:[rankingScreen,correctionScreen,closedScreen].find(x=>!x.hidden)?.id},progress:!closedScreen.hidden?100:!correctionScreen.hidden?95:positions.filter(Boolean).length/CONTROL_STEPS.length*85,complete:!closedScreen.hidden}),
 restore:s=>{positions=s.positions;renderBoard();if(s.screen!=="ranking-screen")renderCorrection();if(s.screen==="closed-screen")showOnly(closedScreen);}
});
