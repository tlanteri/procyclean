const VALUES = [
  "Respect", "Honnêteté", "Équité", "Santé", "Plaisir",
  "Excellence", "Solidarité", "Courage", "Persévérance", "Responsabilité"
];
const rankingScreen = document.querySelector("#ranking-screen");
const podiumScreen = document.querySelector("#collective-screen");
const endScreen = document.querySelector("#end-screen");
const valuesList = document.querySelector("#values-list");
let draggedItem = null;
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
function addValue(value) {
  const item = document.createElement("li");
  item.dataset.value = value;
  item.draggable = true;
  item.tabIndex = 0;
  item.innerHTML = `<span>${value}</span><span aria-hidden="true">↕</span>`;
  item.setAttribute("aria-label", `${value}. Utilise les flèches haut et bas pour déplacer cette valeur.`);
  valuesList.append(item);
}
function moveItem(item, direction) {
  if (direction < 0 && item.previousElementSibling) {
    valuesList.insertBefore(item, item.previousElementSibling);
  } else if (direction > 0 && item.nextElementSibling) {
    valuesList.insertBefore(item.nextElementSibling, item);
  }
  item.focus();
}
valuesList.addEventListener("keydown", (event) => {
  const item = event.target.closest("li");
  if (!item || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  moveItem(item, event.key === "ArrowUp" ? -1 : 1);
});
valuesList.addEventListener("dragstart", (event) => {
  draggedItem = event.target.closest("li");
  draggedItem?.classList.add("dragging");
});
valuesList.addEventListener("dragover", (event) => {
  event.preventDefault();
  const target = event.target.closest("li");
  if (!draggedItem || !target || target === draggedItem) return;
  const after = event.clientY > target.getBoundingClientRect().top +
    target.getBoundingClientRect().height / 2;
  valuesList.insertBefore(draggedItem, after ? target.nextElementSibling : target);
});
valuesList.addEventListener("dragend", () => {
  draggedItem?.classList.remove("dragging");
  draggedItem = null;
});
document.querySelector("#validate-ranking-button").addEventListener("click", () => {
  selectedTop = [...valuesList.children].slice(0, 3)
    .map((item) => item.dataset.value);
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
    JSON.stringify([...valuesList.children].map((item) => item.dataset.value)));
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
shuffled(VALUES).forEach(addValue);
document.documentElement.dataset.individualPodiumReady = "true";
