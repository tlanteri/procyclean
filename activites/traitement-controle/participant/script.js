import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getDatabase, ref, get, onValue, runTransaction, update, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { getScenario } from "../scenarios.js";
import { getWorkContext, getProgress } from "../pathway-engine.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX6Y_ImG1YNEMY19pSSl4FxaHKqo72B3s",
  authDomain: "activites-procyclean.firebaseapp.com",
  databaseURL: "https://activites-procyclean-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "activites-procyclean",
  storageBucket: "activites-procyclean.firebasestorage.app",
  messagingSenderId: "900663423725",
  appId: "1:900663423725:web:bc51501dcf653bfd1052e4"
};
const ACTIVITY_ID = "traitement-controle";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const $ = (selector) => document.querySelector(selector);
const screens = [
  "#loading-screen", "#error-screen", "#waiting-screen", "#ready-screen",
  "#intro-screen", "#situation-screen", "#transition-screen",
  "#completed-screen", "#closed-screen"
].map($);

let currentUser;
let currentSession;
let currentContext;
let stopSessionListener;
let submissionInProgress = false;
let transitionStepId = null;

function showOnly(screen) {
  screens.forEach((item) => { item.hidden = item !== screen; });
}
function normalizeSessionCode(value) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}
function readSessionCode() {
  return normalizeSessionCode(new URLSearchParams(location.search).get("session"));
}
function showError(message) {
  $("#error-message").textContent = message;
  stopSessionListener?.();
  showOnly($("#error-screen"));
}
function waitForAuthentication() {
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, async (user) => {
      try {
        if (user?.isAnonymous) { stop(); resolve(user); return; }
        const credential = await signInAnonymously(auth);
        stop(); resolve(credential.user);
      } catch (error) { stop(); reject(error); }
    }, reject);
  });
}
function unitReference(context) {
  return ref(database, `sessions/${readSessionCode()}/${context.path}`);
}
function renderReady(session, participant, context) {
  $("#participant-number").textContent = participant.participantNumber || "—";
  if (session.participationMode === "group") {
    const group = context?.unit;
    $("#ready-title").textContent = `Tu es dans le groupe ${participant.groupNumber}`;
    $("#mode-message").textContent =
      "Retrouve les cyclistes qui portent le même numéro de groupe.";
    const numbers = Object.keys(group?.members || {}).map(
      (uid) => session.participants?.[uid]?.participantNumber
    ).filter(Boolean).sort((a, b) => a - b);
    $("#group-members").hidden = false;
    $("#group-members").textContent =
      `Votre groupe : ${numbers.map((number) => `Cycliste ${number}`).join(" · ")}.`;
    const activeId = group?.activeDeviceParticipantId;
    $("#claim-device-button").hidden = Boolean(activeId);
    $("#claim-device-button").disabled = submissionInProgress;
    $("#device-message").textContent = activeId
      ? activeId === currentUser.uid
        ? "Ce téléphone a été choisi pour le parcours collectif."
        : "Un autre téléphone du groupe a été choisi."
      : "Choisissez ensemble le téléphone à utiliser.";
  } else {
    $("#ready-title").textContent = "Mode individuel";
    $("#mode-message").textContent = "Tu réaliseras le parcours sur ton téléphone.";
    $("#group-members").hidden = true;
    $("#claim-device-button").hidden = true;
    $("#device-message").textContent = "";
  }
  showOnly($("#ready-screen"));
}
function applyTheme(scenario) {
  ["#intro-screen", "#situation-screen"].forEach((selector) => {
    const screen = $(selector);
    screen.dataset.theme = scenario.theme;
  });
}
function renderIntro(scenario) {
  applyTheme(scenario);
  $("#story-icon").textContent = scenario.icon;
  $("#story-marker").textContent = scenario.marker;
  $("#story-title").textContent = scenario.title;
  $("#story-context").textContent = scenario.context;
  $("#intro-message").textContent = "";
  showOnly($("#intro-screen"));
}
function renderStep(scenario, progress) {
  const index = scenario.steps.findIndex((step) => step.id === progress.currentStepId);
  const step = scenario.steps[index];
  if (!step) return;
  applyTheme(scenario);
  $("#step-label").textContent = `Étape ${index + 1} sur ${scenario.steps.length}`;
  $("#story-character").textContent = `${scenario.icon} ${scenario.character}`;
  $("#progress-bar").style.width = `${((index + 1) / scenario.steps.length) * 100}%`;
  $("#step-title").textContent = step.title;
  $("#step-text").textContent = step.text;
  const options = $("#answer-options");
  options.replaceChildren();
  Object.entries(step.choices).forEach(([id, text]) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const letter = document.createElement("span");
    const wording = document.createElement("span");
    input.type = "radio"; input.name = "answer"; input.value = id;
    letter.className = "answer-letter"; letter.textContent = id;
    wording.textContent = text;
    label.append(input, letter, wording);
    options.append(label);
  });
  $("#situation-message").textContent = "";
  $("#submit-situation-button").disabled = false;
  showOnly($("#situation-screen"));
}
function renderSession(session) {
  currentSession = session;
  if (session.status === "closed") { showOnly($("#closed-screen")); return; }
  const participant = session.participants?.[currentUser.uid];
  if (!participant) {
    showError("Ton inscription n’est pas disponible dans cette session.");
    return;
  }
  currentContext = getWorkContext(session, currentUser.uid);
  if (!session.modeLocked || !currentContext?.scenarioId) {
    if (session.modeLocked) renderReady(session, participant, currentContext);
    else showOnly($("#waiting-screen"));
    return;
  }
  if (session.participationMode === "group" && !currentContext.canEdit) {
    $("#ready-title").textContent =
      `Parcours en cours sur le téléphone du groupe ${participant.groupNumber}`;
    $("#mode-message").textContent =
      "Reste avec ton groupe et participe à la discussion collective.";
    $("#group-members").hidden = true;
    $("#claim-device-button").hidden = true;
    $("#device-message").textContent = "";
    showOnly($("#ready-screen"));
    return;
  }
  const progress = getProgress(currentContext);
  if (progress?.isComplete || currentContext.unit.status === "completed") {
    showOnly($("#completed-screen")); return;
  }
  if (session.status !== "pathway") {
    renderReady(session, participant, currentContext);
    return;
  }
  if (!progress) { showError("L’histoire attribuée est indisponible."); return; }
  if (!currentContext.unit.startedAt) { renderIntro(progress.scenario); return; }
  if (transitionStepId && transitionStepId !== progress.currentStepId) {
    transitionStepId = progress.currentStepId;
    $("#transition-message").textContent =
      `Ton choix est enregistré. ${progress.scenario.character} poursuit son histoire…`;
    showOnly($("#transition-screen"));
    setTimeout(() => {
      if (currentSession?.status === "pathway") {
        transitionStepId = null;
        renderStep(progress.scenario, progress);
      }
    }, 850);
    return;
  }
  renderStep(progress.scenario, progress);
}
async function startStory() {
  if (submissionInProgress || !currentContext?.canEdit) return;
  submissionInProgress = true;
  $("#start-story-button").disabled = true;
  $("#intro-message").textContent = "Démarrage…";
  try {
    await runTransaction(unitReference(currentContext), (unit) => {
      if (!unit || unit.scenarioId !== currentContext.scenarioId) return;
      if (unit.startedAt) return unit;
      return {
        ...unit, sessionId: readSessionCode(), unitId: currentContext.id,
        participationMode: currentContext.collective ? "group" : "individual",
        currentStep: 1, currentStepId: getScenario(unit.scenarioId)?.stepIds[0],
        status: "in-progress", startedAt: Date.now()
      };
    });
  } catch (error) {
    console.error(error);
    $("#intro-message").textContent = "Le parcours n’a pas pu démarrer. Réessaie.";
  } finally {
    submissionInProgress = false;
    $("#start-story-button").disabled = false;
  }
}
async function submitAnswer(event) {
  event.preventDefault();
  if (submissionInProgress || !currentContext?.canEdit) return;
  const selected = new FormData(event.currentTarget).get("answer");
  if (!selected) { $("#situation-message").textContent = "Choisis une réponse."; return; }
  const progress = getProgress(currentContext);
  if (!progress?.currentStepId) return;
  const expectedStepId = progress.currentStepId;
  submissionInProgress = true;
  $("#submit-situation-button").disabled = true;
  $("#answer-options").querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });
  $("#situation-message").textContent = "Enregistrement…";
  try {
    const result = await runTransaction(unitReference(currentContext), (unit) => {
      if (!unit || unit.scenarioId !== currentContext.scenarioId) return;
      const scenario = getScenario(unit.scenarioId);
      const stepIndex = scenario?.stepIds.indexOf(expectedStepId);
      if (stepIndex < 0 || unit.answers?.[expectedStepId]) return;
      const answers = { ...(unit.answers || {}) };
      answers[expectedStepId] = {
        choiceId: selected, submittedBy: currentUser.uid, submittedAt: Date.now()
      };
      const nextStep = scenario.stepIds[stepIndex + 1] || null;
      return {
        ...unit, answers, currentStep: nextStep ? stepIndex + 2 : scenario.steps.length,
        currentStepId: nextStep, progress: answers ? Object.keys(answers).length / 5 : 0,
        status: nextStep ? "in-progress" : "completed",
        ...(nextStep ? {} : { completedAt: Date.now() })
      };
    });
    if (!result.committed) {
      $("#situation-message").textContent =
        "Cette étape est déjà enregistrée. Synchronisation…";
    } else {
      transitionStepId = expectedStepId;
      $("#transition-message").textContent =
        `Ton choix est enregistré. ${progress.scenario.character} poursuit son histoire…`;
      showOnly($("#transition-screen"));
    }
  } catch (error) {
    console.error(error);
    $("#situation-message").textContent =
      "La réponse n’a pas pu être enregistrée. Réessaie.";
  } finally {
    submissionInProgress = false;
  }
}
async function claimActiveDevice() {
  if (submissionInProgress || currentSession?.participationMode !== "group") return;
  const participant = currentSession.participants?.[currentUser.uid];
  const group = currentSession.groups?.[participant?.groupId];
  if (!group?.members?.[currentUser.uid]) return;
  submissionInProgress = true;
  try {
    await runTransaction(
      ref(database, `sessions/${readSessionCode()}/groups/${group.id}/activeDeviceParticipantId`),
      (currentId) => currentId == null ? currentUser.uid : undefined
    );
    await update(ref(database, `sessions/${readSessionCode()}/groups/${group.id}`), {
      activeDeviceClaimedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(error);
    $("#device-message").textContent = "Le téléphone n’a pas pu être sélectionné.";
  } finally { submissionInProgress = false; }
}
async function loadActivity() {
  const sessionCode = readSessionCode();
  $("#displayed-session-code").textContent = sessionCode || "—";
  if (sessionCode.length !== 6) {
    showError("Le code de session est absent ou incorrect."); return;
  }
  try {
    currentUser = await waitForAuthentication();
    const snapshot = await get(ref(database, `sessions/${sessionCode}`));
    if (!snapshot.exists() || snapshot.val().activity !== ACTIVITY_ID) {
      showError("Cette session n’existe pas ou correspond à une autre activité."); return;
    }
    stopSessionListener = onValue(
      ref(database, `sessions/${sessionCode}`),
      (value) => value.exists()
        ? renderSession(value.val())
        : showError("Cette session n’est plus disponible."),
      () => showError("La synchronisation avec la session a été interrompue.")
    );
  } catch (error) {
    console.error(error); showError("La connexion à l’activité a échoué.");
  }
}

$("#claim-device-button").addEventListener("click", claimActiveDevice);
$("#start-story-button").addEventListener("click", startStory);
$("#situation-form").addEventListener("submit", submitAnswer);
loadActivity();
