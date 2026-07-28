const STEPS = [
  ["notification", "Notification au sportif", "01-notification.png", "Le sportif est informé de sa sélection et suit les consignes de l’agent."],
  ["control-station", "Accueil au poste de contrôle du dopage", "02-accueil-poste-controle.png", "L’identité et les informations utiles sont vérifiées."],
  ["collection-vessel", "Choix d’un gobelet de recueil", "03-choix-gobelet.png", "Le sportif choisit un gobelet encore scellé."],
  ["observation", "Observation de la miction par un ACD du même sexe", "04-observation-miction.png", "L’échantillon est produit sous observation directe."],
  ["minimum-volume", "90 ml d’urine minimum", "05-volume-urine.png", "Un volume d’au moins 90 ml est nécessaire."],
  ["sample-kit", "Choix d’un kit de prélèvement", "06-choix-kit.png", "Le sportif choisit un kit sécurisé avec les flacons A et B."],
  ["sample-distribution", "Répartition de l’échantillon", "07-repartition-echantillon.png", "L’échantillon est réparti dans les flacons A et B."],
  ["urine-density", "Mesure de la densité urinaire", "08-densite-urinaire.png", "La densité est contrôlée pour vérifier la qualité de l’échantillon."],
  ["form", "Observations sur le formulaire et signature", "09-formulaire-signature.png", "Le sportif relit, déclare les produits utilisés et peut ajouter une remarque."]
];
let order = STEPS.map((step, correctIndex) => ({ step, correctIndex }))
  .sort(() => Math.random() - 0.5);
if (order.every((entry, index) => entry.correctIndex === index)) order.reverse();
const rankingScreen = document.querySelector("#ranking-screen");
const correctionScreen = document.querySelector("#ranking-correction-screen");
const closedScreen = document.querySelector("#closed-screen");
const list = document.querySelector("#control-steps-list");
const imageRoot = "../../../assets/images/mission-controle/";

function showOnly(screen) {
  [rankingScreen, correctionScreen, closedScreen]
    .forEach((item) => item.hidden = item !== screen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function renderRanking() {
  list.replaceChildren();
  order.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "control-step";
    item.innerHTML = `
      <img class="control-step-image" src="${imageRoot}${entry.step[2]}" alt="">
      <strong class="control-step-label">${entry.step[1]}</strong>
      <div class="control-step-controls"></div>`;
    const controls = item.querySelector(".control-step-controls");
    [["Monter", -1], ["Descendre", 1]].forEach(([label, delta]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.disabled = index + delta < 0 || index + delta >= order.length;
      button.addEventListener("click", () => {
        [order[index], order[index + delta]] = [order[index + delta], order[index]];
        renderRanking();
      });
      controls.append(button);
    });
    list.append(item);
  });
}
function renderCorrection() {
  const score = order.filter((entry, index) => entry.correctIndex === index).length;
  document.querySelector("#personal-result-summary").textContent =
    `${score} étape${score > 1 ? "s" : ""} sur 9 bien placée${score > 1 ? "s" : ""}.`;
  const personal = document.querySelector("#personal-ranking-list");
  const correct = document.querySelector("#correct-procedure-list");
  personal.replaceChildren();
  correct.replaceChildren();
  order.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = `comparison-item ${entry.correctIndex === index ? "is-correct" : "is-misplaced"}`;
    item.innerHTML = `<img src="${imageRoot}${entry.step[2]}" alt=""><strong>${entry.step[1]}</strong><span>${entry.correctIndex === index ? "Bien placée" : `Position attendue : ${entry.correctIndex + 1}`}</span>`;
    personal.append(item);
  });
  STEPS.forEach((step, index) => {
    const item = document.createElement("li");
    item.className = "procedure-step";
    item.innerHTML = `<img src="${imageRoot}${step[2]}" alt=""><div><h3>${index + 1}. ${step[1]}</h3><p>${step[3]}</p></div>`;
    correct.append(item);
  });
  showOnly(correctionScreen);
}
document.querySelector("#validate-ranking-button").addEventListener("click", renderCorrection);
document.querySelector("#finish-mission").addEventListener("click", () => showOnly(closedScreen));
renderRanking();
document.documentElement.dataset.individualMissionReady = "true";
