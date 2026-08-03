const VALUES = [
  "Respect", "Honnêteté", "Équité", "Santé", "Plaisir",
  "Excellence", "Solidarité", "Courage", "Persévérance", "Responsabilité"
];
const rankingScreen = document.querySelector("#ranking-screen");
const podiumScreen = document.querySelector("#collective-screen");
const endScreen = document.querySelector("#end-screen");
const valuesList = document.querySelector("#values-list");
const valueBank = document.querySelector("#value-bank");
const valueBankPanel = document.querySelector(".value-bank-panel");
const rankingPrompt = document.querySelector("#ranking-prompt");
const rankingProgress = document.querySelector("#ranking-progress");
const undoRankingButton = document.querySelector("#undo-ranking-button");
const validateRankingButton = document.querySelector("#validate-ranking-button");
let rankingPositions = Array(VALUES.length).fill(null);
let rankingHistory = [];
let activeRankingSlot = 0;
let bankValues = [];
let rankingDrag = null;
let selectedTop = [];

function showOnly(screen) {
  [rankingScreen, podiumScreen, endScreen]
    .forEach((item) => item.hidden = item !== screen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function shuffled(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
function saveRankingStep() {
  rankingHistory.push([...rankingPositions]);
}
function findNextEmptySlot() {
  return rankingPositions.findIndex((value) => value === null);
}
function renderRanking(values = bankValues) {
  if (values.length) bankValues = [...values];
  const placedCount = rankingPositions.filter(Boolean).length;
  const nextEmpty = findNextEmptySlot();
  if (nextEmpty >= 0 && rankingPositions[activeRankingSlot]) {
    activeRankingSlot = nextEmpty;
  }

  valuesList.replaceChildren();
  rankingPositions.forEach((value, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ranking-slot";
    button.dataset.slotIndex = index;
    button.classList.toggle("filled", Boolean(value));
    button.classList.toggle("active", index === activeRankingSlot && !value);
    if (value) button.dataset.dragValue = value;
    button.innerHTML = value
      ? `<span class="slot-value">${value}</span><span class="slot-hint">Faire glisser</span>`
      : `<span class="slot-placeholder">${index === activeRankingSlot ? "Dépose une valeur ici" : "Emplacement libre"}</span>`;
    button.setAttribute("aria-label", value
      ? `Position ${index + 1} : ${value}. Carte à faire glisser.`
      : `Position ${index + 1}, emplacement libre.`);
    item.append(button);
    valuesList.append(item);
  });

  valueBank.replaceChildren();
  bankValues.filter((value) => !rankingPositions.includes(value))
    .forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "value-card";
      button.dataset.value = value;
      button.dataset.dragValue = value;
      button.textContent = value;
      valueBank.append(button);
    });

  rankingProgress.textContent = `${placedCount} valeur${placedCount > 1 ? "s" : ""} sur ${VALUES.length} placée${placedCount > 1 ? "s" : ""}`;
  rankingPrompt.textContent = nextEmpty < 0
    ? "Ton classement est complet. Fais glisser les cartes pour les échanger."
    : `Fais glisser une valeur vers la position ${activeRankingSlot + 1}.`;
  undoRankingButton.disabled = rankingHistory.length === 0;
  validateRankingButton.disabled = placedCount !== VALUES.length;
}
function clearDropTarget() {
  document.querySelectorAll(".drop-target").forEach((element) => {
    element.classList.remove("drop-target");
  });
}
function moveDragPreview(clientX, clientY) {
  if (!rankingDrag) return;
  rankingDrag.preview.style.transform =
    `translate3d(${clientX - rankingDrag.offsetX}px, ${clientY - rankingDrag.offsetY}px, 0)`;
}
function autoScrollRankingDrag() {
  if (!rankingDrag) return;
  const edge = 85;
  if (rankingDrag.hasMoved && rankingDrag.clientY < edge) window.scrollBy(0, -10);
  if (rankingDrag.hasMoved && rankingDrag.clientY > window.innerHeight - edge) window.scrollBy(0, 10);
  rankingDrag.autoScrollFrame = requestAnimationFrame(autoScrollRankingDrag);
}
rankingScreen.addEventListener("pointerdown", (event) => {
  const source = event.target.closest("[data-drag-value]");
  if (!source || event.button > 0) return;
  const box = source.getBoundingClientRect();
  const preview = document.createElement("div");
  preview.className = "drag-preview";
  preview.textContent = source.dataset.dragValue;
  preview.style.width = `${Math.min(box.width, 220)}px`;
  document.body.append(preview);
  rankingDrag = {
    pointerId: event.pointerId,
    value: source.dataset.dragValue,
    sourceSlot: source.dataset.slotIndex === undefined
      ? null
      : Number(source.dataset.slotIndex),
    source,
    preview,
    clientY: event.clientY,
    hasMoved: false,
    offsetX: Math.min(event.clientX - box.left, 90),
    offsetY: Math.min(event.clientY - box.top, 28)
  };
  source.classList.add("drag-source");
  source.setPointerCapture(event.pointerId);
  moveDragPreview(event.clientX, event.clientY);
  rankingDrag.autoScrollFrame = requestAnimationFrame(autoScrollRankingDrag);
  event.preventDefault();
});
rankingScreen.addEventListener("pointermove", (event) => {
  if (!rankingDrag || event.pointerId !== rankingDrag.pointerId) return;
  rankingDrag.clientY = event.clientY;
  rankingDrag.hasMoved = true;
  moveDragPreview(event.clientX, event.clientY);
  clearDropTarget();
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const dropTarget = target?.closest(".ranking-slot, .value-bank-panel");
  dropTarget?.classList.add("drop-target");
  event.preventDefault();
});
function finishRankingDrag(event, cancelled = false) {
  if (!rankingDrag || event.pointerId !== rankingDrag.pointerId) return;
  const drag = rankingDrag;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const targetSlot = target?.closest(".ranking-slot");
  const targetBank = target?.closest(".value-bank-panel");
  cancelAnimationFrame(drag.autoScrollFrame);
  drag.source.classList.remove("drag-source");
  drag.preview.remove();
  clearDropTarget();
  rankingDrag = null;
  if (cancelled) return;
  if (targetSlot) {
    const targetIndex = Number(targetSlot.dataset.slotIndex);
    if (drag.sourceSlot !== targetIndex) {
      saveRankingStep();
      if (drag.sourceSlot === null) {
        rankingPositions[targetIndex] = drag.value;
      } else {
        [rankingPositions[targetIndex], rankingPositions[drag.sourceSlot]] =
          [rankingPositions[drag.sourceSlot], rankingPositions[targetIndex]];
      }
    }
  } else if (targetBank && drag.sourceSlot !== null) {
    saveRankingStep();
    rankingPositions[drag.sourceSlot] = null;
  } else {
    return;
  }
  activeRankingSlot = Math.max(findNextEmptySlot(), 0);
  renderRanking();
}
rankingScreen.addEventListener("pointerup", (event) => finishRankingDrag(event));
rankingScreen.addEventListener("pointercancel", (event) => finishRankingDrag(event, true));
undoRankingButton.addEventListener("click", () => {
  const previousRanking = rankingHistory.pop();
  if (!previousRanking) return;
  rankingPositions = previousRanking;
  activeRankingSlot = Math.max(findNextEmptySlot(), 0);
  renderRanking();
});
validateRankingButton.addEventListener("click", () => {
  if (rankingPositions.some((value) => !value)) return;
  selectedTop = rankingPositions.slice(0, 3);
  const options = document.querySelector("#collective-values");
  const podium = document.querySelector("#collective-top3");
  options.replaceChildren();
  podium.replaceChildren();
  selectedTop.forEach((value, index) => {
    const card = document.createElement("div");
    card.textContent = `${index + 1}. ${value}`;
    options.append(card);
    const item = document.createElement("li");
    item.textContent = value;
    podium.append(item);
  });
  localStorage.setItem("procyclean-solo-values-ranking",
    JSON.stringify(rankingPositions));
  showOnly(podiumScreen);
});
document.querySelector("#submit-collective-button").addEventListener("click", () => {
  const rule = document.querySelector("#collective-rule").value.trim();
  if (!rule) {
    document.querySelector("#collective-message").textContent =
      "Écris une règle concrète avant de valider.";
    return;
  }
  localStorage.setItem("procyclean-solo-values-rule", rule);
  const finalPodium = document.querySelector("#final-podium");
  finalPodium.replaceChildren();
  [1, 0, 2].forEach((valueIndex) => {
    const place = valueIndex + 1;
    const step = document.createElement("div");
    step.className = `podium-step podium-step-${place}`;
    step.innerHTML = `
      <strong class="podium-value">${selectedTop[valueIndex]}</strong>
      <span class="podium-number">${place}</span>`;
    finalPodium.append(step);
  });
  document.querySelector("#final-top-value").textContent = selectedTop[0];
  document.querySelector("#final-rule").textContent = rule;
  showOnly(endScreen);
});
renderRanking(shuffled(VALUES));
document.documentElement.dataset.individualPodiumReady = "true";
