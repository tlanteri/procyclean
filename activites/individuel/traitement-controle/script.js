import { SCENARIOS } from "../../traitement-controle/scenarios.js";
import {
  FACILITATOR_CONTENT,
  KEY_MESSAGE
} from "../../traitement-controle/facilitator-content.js";

const $ = (selector) => document.querySelector(selector);
const screens = [
  "#story-selection-screen", "#intro-screen", "#situation-screen",
  "#transition-screen", "#completed-screen", "#results-screen"
].map($);
let scenario = null;
let stepIndex = 0;
let answers = {};
let transitionTimer = null;

function showOnly(screen) {
  screens.forEach((item) => { item.hidden = item !== screen; });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyTheme() {
  ["#intro-screen", "#situation-screen"].forEach((selector) => {
    $(selector).dataset.theme = scenario.theme;
  });
}

function renderStorySelection() {
  clearTimeout(transitionTimer);
  scenario = null;
  stepIndex = 0;
  answers = {};
  const container = $("#story-options");
  container.replaceChildren();
  SCENARIOS.forEach((story) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "story-choice";
    button.dataset.theme = story.theme;
    button.innerHTML = `
      <span class="choice-icon" aria-hidden="true">${story.icon}</span>
      <span><strong>${story.character}</strong><small>${story.marker}</small>
      <b>${story.title}</b></span>`;
    button.addEventListener("click", () => selectStory(story));
    container.append(button);
  });
  showOnly($("#story-selection-screen"));
}

function selectStory(story) {
  scenario = story;
  stepIndex = 0;
  answers = {};
  applyTheme();
  $("#story-icon").textContent = story.icon;
  $("#story-marker").textContent = story.marker;
  $("#story-title").textContent = story.title;
  $("#story-context").textContent = story.context;
  showOnly($("#intro-screen"));
}

function renderStep() {
  const step = scenario.steps[stepIndex];
  applyTheme();
  $("#step-label").textContent = `Étape ${stepIndex + 1} sur ${scenario.steps.length}`;
  $("#story-character").textContent = `${scenario.icon} ${scenario.character}`;
  $("#progress-bar").style.width =
    `${((stepIndex + 1) / scenario.steps.length) * 100}%`;
  $("#step-title").textContent = step.title;
  $("#step-text").textContent = step.text;
  $("#answer-message").textContent = "";
  const options = $("#answer-options");
  options.replaceChildren();
  Object.entries(step.choices).forEach(([letter, text]) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const badge = document.createElement("span");
    const wording = document.createElement("span");
    input.type = "radio";
    input.name = "answer";
    input.value = letter;
    badge.className = "answer-letter";
    badge.textContent = letter;
    wording.textContent = text;
    label.append(input, badge, wording);
    options.append(label);
  });
  $("#submit-answer-button").disabled = false;
  showOnly($("#situation-screen"));
}

function submitAnswer(event) {
  event.preventDefault();
  const button = $("#submit-answer-button");
  if (button.disabled) return;
  const selected = new FormData(event.currentTarget).get("answer");
  if (!selected) {
    $("#answer-message").textContent = "Choisis une réponse avant de continuer.";
    return;
  }
  button.disabled = true;
  $("#answer-options").querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });
  const currentStep = scenario.steps[stepIndex];
  if (answers[currentStep.id]) return;
  answers[currentStep.id] = selected;
  $("#transition-message").textContent =
    `Ton choix est enregistré. ${scenario.character} poursuit son histoire…`;
  showOnly($("#transition-screen"));
  transitionTimer = setTimeout(() => {
    stepIndex += 1;
    if (stepIndex === scenario.steps.length) {
      showOnly($("#completed-screen"));
    } else {
      renderStep();
    }
  }, 700);
}

function renderResults() {
  $("#results-title").textContent = `${scenario.character} — les cinq décisions`;
  const container = $("#personal-results");
  container.replaceChildren();
  scenario.steps.forEach((step, index) => {
    const selected = answers[step.id];
    const [recommended, reflex] = FACILITATOR_CONTENT[scenario.id][index];
    const article = document.createElement("article");
    article.className = selected === recommended ? "is-recommended" : "";
    article.innerHTML = `
      <div class="result-heading">
        <span>${index + 1}</span><h3>${step.title}</h3>
      </div>
      <p><strong>Ton choix : ${selected}</strong> — ${step.choices[selected]}</p>
      <p class="recommended-choice">Réponse recommandée : ${recommended}</p>
      <p class="reflex-text">${reflex}</p>`;
    container.append(article);
  });
  $("#key-message").textContent = KEY_MESSAGE;
  showOnly($("#results-screen"));
}

$("#start-story-button").addEventListener("click", renderStep);
$("#situation-form").addEventListener("submit", submitAnswer);
$("#show-results-button").addEventListener("click", renderResults);
document.querySelectorAll('[data-action="change-story"]').forEach((button) => {
  button.addEventListener("click", renderStorySelection);
});

renderStorySelection();
document.documentElement.dataset.individualTreatmentReady = "true";
