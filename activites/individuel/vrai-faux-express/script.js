const QUESTIONS = [
  ["Le sport propre, c’est seulement ne pas se doper.", false, "Le sport propre repose aussi sur la santé, le respect des règles, l’équité, l’intégrité et les valeurs du sport."],
  ["Respecter les règles uniquement lorsqu’un arbitre ou un entraîneur regarde suffit pour pratiquer un sport propre.", false, "Un comportement fondé sur les valeurs doit être adopté même lorsque personne ne regarde."],
  ["L’antidopage permet notamment de protéger la santé des sportifs et l’équité des compétitions.", true, "L’antidopage cherche à protéger les sportifs, les compétitions et les valeurs associées au sport propre."],
  ["Les sportifs ont eux aussi un rôle à jouer dans la protection du sport propre.", true, "Ils doivent notamment respecter les règles, vérifier ce qu’ils consomment, poser des questions et parler des situations préoccupantes."],
  ["L’AFLD est l’organisation nationale chargée de l’antidopage en France.", true, "L’Agence française de lutte contre le dopage agit notamment dans les domaines de l’éducation, de la prévention, des contrôles, des enquêtes et de l’application des règles antidopage."],
  ["L’AFLD réalise uniquement des contrôles antidopage.", false, "Les contrôles constituent une partie de son activité. L’AFLD informe, éduque, prévient, contrôle, recueille des signalements et participe à l’application des règles."],
  ["L’AMA contribue à établir les règles antidopage communes au niveau mondial.", true, "L’Agence mondiale antidopage élabore notamment le Code mondial antidopage et la Liste des substances et méthodes interdites."],
  ["Une information publiée sur les réseaux sociaux est aussi fiable qu’une information provenant d’une source officielle.", false, "Pour connaître une règle ou vérifier un produit, il faut utiliser les outils officiels de l’AFLD, de l’AMA ou de l’organisation compétente."]
];
let index = 0;
let score = 0;
let selectedAnswer = false;
const questionScreen = document.querySelector("#question-screen");
const correctionScreen = document.querySelector("#correction-screen");
const roundSummaryScreen = document.querySelector("#round-summary-screen");
const definitionScreen = document.querySelector("#final-definition-screen");
const closedScreen = document.querySelector("#closed-screen");

function updateOverallProgress(value) {
  window.dispatchEvent(new CustomEvent("procyclean:activity-progress", {
    detail: { value }
  }));
}

function showOnly(screen) {
  [questionScreen, correctionScreen, roundSummaryScreen, definitionScreen, closedScreen]
    .forEach((item) => item.hidden = item !== screen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function renderQuestion() {
  updateOverallProgress(index * 10 + 5);
  document.querySelector("#question-progress").textContent =
    `Manche ${index < 4 ? 1 : 2} · Question ${(index % 4) + 1} sur 4`;
  document.querySelector("#question-text").textContent = QUESTIONS[index][0];
  showOnly(questionScreen);
}
function answer(value) {
  selectedAnswer = value;
  const [, expected, explanation] = QUESTIONS[index];
  const correct = value === expected;
  updateOverallProgress((index + 1) * 10);
  if (correct) score += 1;
  document.querySelector("#correction-progress").textContent =
    `Manche ${index < 4 ? 1 : 2} · Correction ${(index % 4) + 1} sur 4`;
  document.querySelector("#correct-answer-badge").textContent =
    expected ? "Vrai" : "Faux";
  const result = document.querySelector("#answer-result");
  result.className = `answer-result ${correct ? "correct" : "incorrect"}`;
  result.textContent = correct ? "Bonne réponse !" : "Ce n’était pas la réponse attendue.";
  document.querySelector("#correction-explanation").textContent = explanation;
  document.querySelector("#next-question-button").textContent =
    index === QUESTIONS.length - 1 ? "Terminer le quiz" : index === 3 ? "Terminer la manche 1" : "Question suivante";
  showOnly(correctionScreen);
}
document.querySelector("#true-button").addEventListener("click", () => answer(true));
document.querySelector("#false-button").addEventListener("click", () => answer(false));
document.querySelector("#next-question-button").addEventListener("click", () => {
  index += 1;
  if (index === 4) {
    updateOverallProgress(40);
    showOnly(roundSummaryScreen);
  }
  else if (index < QUESTIONS.length) renderQuestion();
  else {
    updateOverallProgress(85);
    showOnly(definitionScreen);
  }
});
document.querySelector("#start-round-two-button").addEventListener("click", renderQuestion);
document.querySelector("#definition-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const definition = document.querySelector("#sport-definition").value.trim();
  if (!definition) return;
  const source = document.querySelector('[name="reliable-source"]:checked');
  const message = document.querySelector("#definition-message");
  if (!source) {
    message.textContent = "Choisis également la source que tu utiliserais.";
    return;
  }
  message.textContent = "";
  localStorage.setItem("procyclean-solo-sport-definition", definition);
  document.querySelector("#score-message").textContent =
    `Tu as obtenu ${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} sur ${QUESTIONS.length}.`;
  document.querySelector("#source-feedback").innerHTML = source.value === "afld"
    ? "<strong>Bonne source !</strong><p>Le site et les outils officiels de l’AFLD permettent de vérifier une information antidopage fiable en France.</p>"
    : "<strong>La source fiable à privilégier</strong><p>Pour vérifier une information antidopage en France, consulte le site ou un outil officiel de l’AFLD. Une rumeur, une publicité ou un conseil informel doit toujours être vérifié.</p>";
  updateOverallProgress(100);
  showOnly(closedScreen);
});
renderQuestion();
document.documentElement.dataset.individualTrueFalseReady = "true";
