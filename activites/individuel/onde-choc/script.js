import { SCENARIOS, LEVEL_SUMMARIES, FINAL_MESSAGE, OBJECTIVE_RESPONSIBILITY } from "../../onde-choc/content.js";

const $ = selector => document.querySelector(selector);
const screens = ["#selection", "#intro", "#activity", "#transition", "#completed", "#results"].map($);
let story = null, step = 0, answers = [];

function show(screen) {
  screens.forEach(item => { item.hidden = item !== screen; });
  scrollTo({ top: 0, behavior: "smooth" });
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function setPersistentStory() {
  $("#persistent-icon").textContent = story.icon;
  $("#persistent-name").textContent = `L’histoire de ${story.name}`;
  $("#persistent-text").textContent = story.story;
}
function renderStories() {
  const box = $("#stories");
  box.replaceChildren();
  SCENARIOS.forEach(item => {
    const button = element("button", "story-choice");
    button.type = "button";
    button.dataset.color = item.color;
    button.innerHTML = `<span>${item.icon}</span><strong>${item.name}</strong><small>${item.story}</small>`;
    button.onclick = () => choose(item);
    box.append(button);
  });
  show($("#selection"));
}
function choose(item) {
  story = item; step = 0; answers = [];
  $("#story-icon").textContent = item.icon;
  $("#story-name").textContent = `L’histoire de ${item.name}`;
  $("#story-text").textContent = item.story;
  $("#story-context").textContent = item.context;
  setPersistentStory();
  show($("#intro"));
}
function renderStep() {
  const current = story.stages[step];
  $("#step-label").textContent = `Étape ${step + 1} sur ${story.stages.length} · ${current.title}`;
  $("#bar").style.width = `${((step + 1) / story.stages.length) * 100}%`;
  $("#step-title").textContent = current.question;
  $("#instruction").textContent = current.instruction;
  $("#message").textContent = "";
  $("#validate").disabled = false;
  const fieldset = element("fieldset", "causal-options");
  fieldset.append(element("legend", null, "Plusieurs réponses peuvent être sélectionnées"));
  current.options.forEach(item => {
    const label = element("label", "option");
    const input = document.createElement("input");
    input.type = "checkbox"; input.name = "answer"; input.value = item.id;
    label.append(input, element("span", null, item.text));
    fieldset.append(label);
  });
  $("#step-content").replaceChildren(fieldset);
  show($("#activity"));
}

$("#step-form").addEventListener("submit", event => {
  event.preventDefault();
  const selected = new FormData(event.currentTarget).getAll("answer");
  if (!selected.length) {
    $("#message").textContent = "Sélectionne au moins une réponse.";
    return;
  }
  answers[step] = selected;
  $("#validate").disabled = true;
  show($("#transition"));
  setTimeout(() => {
    step += 1;
    if (step === story.stages.length) {
      $("#completed-title").textContent = "Ton onde de choc est terminée";
      $("#completed-text").textContent = "Tu as suivi les événements de la décision initiale jusqu’à leurs conséquences plus lointaines.";
      show($("#completed"));
    } else renderStep();
  }, 450);
});

function stageAssessment(stageIndex) {
  const current = story.stages[stageIndex];
  const selected = answers[stageIndex] || [];
  const isCorrect = current.options.every(item =>
    item.isPossible === selected.includes(item.id)
  );
  const options = current.options.map(item => {
    const isSelected = selected.includes(item.id);
    if (item.isPossible && isSelected) {
      return `<li class="answer-correct"><strong>✓ Bonne réponse :</strong> ${item.text}</li>`;
    }
    if (item.isPossible) {
      return `<li class="answer-missed"><strong>À retenir :</strong> ${item.text}<small>Cette conséquence était possible, mais tu ne l’as pas sélectionnée.</small></li>`;
    }
    if (isSelected) {
      return `<li class="answer-wrong"><strong>✗ Réponse incorrecte :</strong> ${item.text}<small>Cette proposition est une idée reçue.</small></li>`;
    }
    return `<li class="answer-correct"><strong>✓ Bien écarté :</strong> ${item.text}<small>Cette proposition était une idée reçue.</small></li>`;
  }).join("");
  return {
    isCorrect,
    html: `<p class="stage-verdict ${isCorrect ? "correct" : "review"}">${isCorrect ? "✓ Tout juste pour cette étape" : "À revoir pour cette étape"}</p><ul class="answer-review">${options}</ul>`
  };
}
function results() {
  const assessments = story.stages.map((_, index) => stageAssessment(index));
  const correctCount = assessments.filter(item => item.isCorrect).length;
  const overall = correctCount === story.stages.length
    ? "Bravo, toutes tes réponses sont justes."
    : `Tu as entièrement réussi ${correctCount} étape${correctCount > 1 ? "s" : ""} sur ${story.stages.length}. Regarde les corrections ci-dessous.`;
  $("#result-content").innerHTML = `<section class="result-card score-card"><h3>Ton résultat</h3><p>${overall}</p></section><section class="result-card causal-result"><h3>Correction détaillée</h3>${story.stages.map((item, index) => `<div class="result-level"><span>${index + 1}</span><div><p class="level-name">${item.title}</p>${assessments[index].html}<p class="level-explanation">${LEVEL_SUMMARIES[index]}</p></div></div>`).join("")}</section><section class="result-card rule-note"><h3>${OBJECTIVE_RESPONSIBILITY.title}</h3><p>${OBJECTIVE_RESPONSIBILITY.message}</p></section><section class="result-card"><h3>Intervenir avant l’onde de choc</h3><p>${story.prevention}</p></section>`;
  $("#final-message").textContent = FINAL_MESSAGE;
  show($("#results"));
}

$("#discover").onclick = renderStep;
$("#results-button").onclick = results;
$("#restart").onclick = renderStories;
renderStories();
