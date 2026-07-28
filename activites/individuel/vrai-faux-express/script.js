const QUESTIONS = [
  ["Le sport propre, c’est seulement ne pas se doper.", false, "Le sport propre repose aussi sur le respect des règles, de sa santé, des autres et des valeurs du sport."],
  ["Un sportif peut être sanctionné même s’il n’avait pas l’intention de se doper.", true, "Le sportif est responsable des substances retrouvées dans son organisme, même sans intention de tricher."],
  ["Un complément alimentaire « naturel » est forcément sans danger au regard des règles antidopage.", false, "Un produit naturel peut contenir une substance interdite ou être contaminé. Il faut toujours demander conseil."],
  ["Avant de prendre un médicament, un sportif doit vérifier s’il est autorisé.", true, "Certains médicaments contiennent des substances interdites. Il faut demander conseil et les vérifier."],
  ["Toutes les substances interdites le sont tout le temps et dans tous les sports.", false, "Certaines sont interdites en permanence, d’autres uniquement en compétition ou dans certains sports."],
  ["Un sportif peut être contrôlé en compétition et hors compétition, sans être prévenu.", true, "Un contrôle peut avoir lieu en compétition ou hors compétition, sans avertissement préalable."],
  ["Refuser un contrôle antidopage n’est pas une violation si on n’a rien pris.", false, "Refuser, éviter ou ne pas se présenter à un contrôle peut constituer une violation."],
  ["Pendant un contrôle, le sportif peut demander des renseignements et être accompagné.", true, "Le sportif a des droits : il peut poser des questions et, selon les règles, être accompagné."]
];
let index = 0;
let score = 0;
let selectedAnswer = false;
const questionScreen = document.querySelector("#question-screen");
const correctionScreen = document.querySelector("#correction-screen");
const definitionScreen = document.querySelector("#final-definition-screen");
const closedScreen = document.querySelector("#closed-screen");

function showOnly(screen) {
  [questionScreen, correctionScreen, definitionScreen, closedScreen]
    .forEach((item) => item.hidden = item !== screen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function renderQuestion() {
  document.querySelector("#question-progress").textContent =
    `Question ${index + 1} sur ${QUESTIONS.length}`;
  document.querySelector("#question-text").textContent = QUESTIONS[index][0];
  showOnly(questionScreen);
}
function answer(value) {
  selectedAnswer = value;
  const [, expected, explanation] = QUESTIONS[index];
  const correct = value === expected;
  if (correct) score += 1;
  document.querySelector("#correction-progress").textContent =
    `Correction ${index + 1} sur ${QUESTIONS.length}`;
  document.querySelector("#correct-answer-badge").textContent =
    expected ? "Vrai" : "Faux";
  const result = document.querySelector("#answer-result");
  result.className = `answer-result ${correct ? "correct" : "incorrect"}`;
  result.textContent = correct ? "Bonne réponse !" : "Ce n’était pas la réponse attendue.";
  document.querySelector("#correction-explanation").textContent = explanation;
  document.querySelector("#next-question-button").textContent =
    index === QUESTIONS.length - 1 ? "Donner ma définition" : "Question suivante";
  showOnly(correctionScreen);
}
document.querySelector("#true-button").addEventListener("click", () => answer(true));
document.querySelector("#false-button").addEventListener("click", () => answer(false));
document.querySelector("#next-question-button").addEventListener("click", () => {
  index += 1;
  if (index < QUESTIONS.length) renderQuestion();
  else showOnly(definitionScreen);
});
document.querySelector("#definition-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const definition = document.querySelector("#sport-definition").value.trim();
  if (!definition) return;
  localStorage.setItem("procyclean-solo-sport-definition", definition);
  document.querySelector("#score-message").textContent =
    `Tu as obtenu ${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} sur ${QUESTIONS.length}.`;
  showOnly(closedScreen);
});
renderQuestion();
document.documentElement.dataset.individualTrueFalseReady = "true";
