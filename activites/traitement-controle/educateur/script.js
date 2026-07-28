import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
  onValue,
  update,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import {
  balancedScenarioIds,
  SCENARIOS
} from "../scenarios.js";
import {
  FACILITATOR_CONTENT,
  FINAL_REFLEXES,
  KEY_MESSAGE
} from "../facilitator-content.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX6Y_ImG1YNEMY19pSSl4FxaHKqo72B3s",
  authDomain: "activites-procyclean.firebaseapp.com",
  databaseURL:
    "https://activites-procyclean-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "activites-procyclean",
  storageBucket: "activites-procyclean.firebasestorage.app",
  messagingSenderId: "900663423725",
  appId: "1:900663423725:web:bc51501dcf653bfd1052e4"
};

const ACTIVITY_ID = "traitement-controle";
const EDUCATOR_EMAIL = "prevention.dopage@ffc.fr";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const loadingPanel = document.querySelector("#loading-panel");
const loginPanel = document.querySelector("#login-panel");
const errorPanel = document.querySelector("#error-panel");
const dashboardContent = document.querySelector("#dashboard-content");
const loginForm = document.querySelector("#login-form");
const educatorCode = document.querySelector("#educator-code");
const loginButton = document.querySelector("#login-button");
const loginMessage = document.querySelector("#login-message");
const errorMessage = document.querySelector("#error-message");
const sessionCodeElement = document.querySelector("#session-code");
const waitingSessionCode = document.querySelector(
  "#waiting-session-code"
);
const connectionState = document.querySelector("#connection-state");
const participantCount = document.querySelector("#participant-count");
const participantCountLabel = document.querySelector(
  "#participant-count-label"
);
const sessionStatus = document.querySelector("#session-status");
const proposedMode = document.querySelector("#proposed-mode");
const waitingPanel = document.querySelector("#waiting-panel");
const closedPanel = document.querySelector("#closed-panel");
const participantsList = document.querySelector("#participants-list");
const presenceState = document.querySelector("#presence-state");
const lockModeButton = document.querySelector("#lock-mode-button");
const actionMessage = document.querySelector("#action-message");
const devicesState = document.querySelector("#devices-state");
const startPathwayButton = document.querySelector(
  "#start-pathway-button"
);
const pathwayState = document.querySelector("#pathway-state");
const confirmPreparationButton = document.querySelector(
  "#confirm-preparation-button"
);
const monitoringPanel = document.querySelector("#monitoring-panel");
const scenarioMetrics = document.querySelector("#scenario-metrics");
const startReviewButton = document.querySelector("#start-review-button");
const reviewActionMessage = document.querySelector("#review-action-message");
const reviewPanel = document.querySelector("#review-panel");
const finalPanel = document.querySelector("#final-panel");

let stopSessionListener = null;
let currentSession = null;
let actionInProgress = false;

function normalizeSessionCode(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

function readSessionCode() {
  const parameters = new URLSearchParams(window.location.search);
  return normalizeSessionCode(parameters.get("session"));
}

const sessionCode = readSessionCode();
sessionCodeElement.textContent = sessionCode || "—";
waitingSessionCode.textContent = sessionCode || "—";

function showOnly(panel) {
  [loadingPanel, loginPanel, errorPanel].forEach((currentPanel) => {
    currentPanel.hidden = currentPanel !== panel;
  });
  dashboardContent.hidden = panel !== null;
}

function showError(message) {
  errorMessage.textContent = message;
  connectionState.textContent = "Erreur";
  stopSessionListener?.();
  showOnly(errorPanel);
}

function showLogin() {
  connectionState.textContent = "Authentification requise";
  showOnly(loginPanel);
  educatorCode.focus();
}

function readableStatus(status) {
  const labels = {
    waiting: "En attente",
    grouping: "Préparation",
    "participation-ready": "Mode individuel prêt",
    "group-device-selection": "Choix des téléphones",
    pathway: "Parcours en cours",
    review: "Mise en commun",
    "final-recap": "Bilan final",
    correction: "Correction",
    "final-decision": "Décision finale",
    results: "Synthèse",
    closed: "Clôturée"
  };
  return labels[status] || "En attente";
}

function participantEntries(session) {
  return Object.entries(session.participants || {}).sort(
    ([uidA, participantA], [uidB, participantB]) => {
      const joinedA =
        typeof participantA.joinedAt === "number"
          ? participantA.joinedAt
          : Number.MAX_SAFE_INTEGER;
      const joinedB =
        typeof participantB.joinedAt === "number"
          ? participantB.joinedAt
          : Number.MAX_SAFE_INTEGER;
      return joinedA - joinedB || uidA.localeCompare(uidB);
    }
  );
}

function proposedParticipationMode(count) {
  return count <= 8 ? "individual" : "group";
}

function shuffled(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function balancedGroupSizes(count) {
  const groupCount = Math.floor(count / 3);
  if (!groupCount) return [];
  const base = Math.floor(count / groupCount);
  const extra = count % groupCount;
  return Array.from(
    { length: groupCount },
    (_, index) => base + (index >= groupCount - extra ? 1 : 0)
  );
}

function renderParticipants(entries, session) {
  participantsList.replaceChildren();
  entries.forEach(([uid, participant], index) => {
    const number = session.modeLocked
      ? participant.participantNumber
      : index + 1;
    const item = document.createElement("li");
    const badge = document.createElement("span");
    const label = document.createElement("span");
    badge.className = "participant-number";
    badge.textContent = number;
    label.textContent = `Cycliste ${number}`;
    item.append(badge, label);

    if (session.groupsPrepared && participant.groupNumber) {
      const group = document.createElement("span");
      group.className = "participant-group";
      group.textContent = `Groupe ${participant.groupNumber}`;
      item.append(group);
    }
    participantsList.append(item);
  });
}

function responseUnits(session) {
  return session.participationMode === "group"
    ? Object.values(session.groups || {})
    : participantEntries(session).map(([, participant]) => participant);
}

function unitsForScenario(session, scenarioId) {
  const legacyAliases = {
    "home-medicine": "ines",
    "doctor-visit": "lea",
    "parent-medicine": "yanis"
  };
  return responseUnits(session).filter(
    (unit) => (legacyAliases[unit.scenarioId] || unit.scenarioId) === scenarioId
  );
}

function renderScenarioMetrics(session) {
  scenarioMetrics.replaceChildren();
  SCENARIOS.forEach((scenario) => {
    const units = unitsForScenario(session, scenario.id);
    const started = units.filter((unit) => unit.startedAt).length;
    const completed = units.filter((unit) =>
      unit.status === "completed" || unit.completedAt
    ).length;
    const card = document.createElement("article");
    card.dataset.theme = scenario.theme;
    card.innerHTML = `
      <div class="metric-story"><span aria-hidden="true">${scenario.icon}</span>
        <div><strong>${scenario.character}</strong><small>${scenario.marker}</small></div>
      </div>
      <dl>
        <div><dt>Attribués</dt><dd>${units.length}</dd></div>
        <div><dt>Commencés</dt><dd>${started}</dd></div>
        <div><dt>Terminés</dt><dd>${completed}</dd></div>
      </dl>`;
    scenarioMetrics.append(card);
  });
}

function reviewState(session) {
  const state = session.review || {};
  return {
    scenarioIndex: Math.min(Number(state.scenarioIndex) || 0, 2),
    stepIndex: Math.min(Number(state.stepIndex) || 0, 4),
    revealed: Boolean(state.revealed)
  };
}

function renderReview(session) {
  const state = reviewState(session);
  const scenario = SCENARIOS[state.scenarioIndex];
  const step = scenario.steps[state.stepIndex];
  const counts = { A: 0, B: 0, C: 0 };
  unitsForScenario(session, scenario.id).forEach((unit) => {
    const choice = unit.answers?.[step.id]?.choiceId;
    if (counts[choice] != null) counts[choice] += 1;
  });
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  document.querySelector("#review-story-marker").textContent =
    `${scenario.icon} ${scenario.marker}`;
  document.querySelector("#review-story-title").textContent =
    `${scenario.character} — ${scenario.title}`;
  document.querySelector("#review-position").textContent =
    `Histoire ${state.scenarioIndex + 1}/3 · Étape ${state.stepIndex + 1}/5`;
  document.querySelector("#review-step-title").textContent = step.title;
  document.querySelector("#review-question").textContent = step.text;
  const breakdown = document.querySelector("#answer-breakdown");
  breakdown.replaceChildren();
  Object.entries(step.choices).forEach(([letter, text]) => {
    const percent = total ? Math.round((counts[letter] / total) * 100) : 0;
    const row = document.createElement("article");
    row.innerHTML = `
      <div class="breakdown-label"><strong>${letter}</strong><span>${text}</span></div>
      <div class="breakdown-result"><span>${counts[letter]} réponse${counts[letter] > 1 ? "s" : ""}</span><b>${percent} %</b></div>
      <div class="breakdown-bar"><span style="width:${percent}%"></span></div>`;
    breakdown.append(row);
  });
  const correction = FACILITATOR_CONTENT[scenario.id][state.stepIndex];
  document.querySelector("#recommended-panel").hidden = !state.revealed;
  document.querySelector("#recommended-answer").textContent =
    `Réponse recommandée : ${correction[0]}`;
  document.querySelector("#recommended-reflex").textContent = correction[1];
  document.querySelector("#reveal-answer-button").hidden = state.revealed;
  document.querySelector("#next-review-button").hidden = !state.revealed;
  document.querySelector("#next-review-button").textContent =
    state.scenarioIndex === 2 && state.stepIndex === 4
      ? "Ouvrir le bilan final" : "Étape suivante";
}

function renderFinal(session) {
  const count = Math.min(Number(session.finalReflexCount) || 0, 9);
  const list = document.querySelector("#final-reflexes");
  list.replaceChildren();
  FINAL_REFLEXES.slice(0, count).forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  });
  document.querySelector("#reveal-reflex-button").hidden = count >= 9;
  document.querySelector("#reveal-key-message-button").hidden =
    count < 9 || session.keyMessageRevealed;
  document.querySelector("#key-message-panel").hidden = !session.keyMessageRevealed;
  document.querySelector("#key-message").textContent = KEY_MESSAGE;
  document.querySelector("#close-activity-button").hidden =
    !session.keyMessageRevealed;
}

function renderSession(session) {
  currentSession = session;
  const participants = participantEntries(session);
  const numberOfParticipants = participants.length;
  const mode = session.modeLocked
    ? session.participationMode
    : proposedParticipationMode(numberOfParticipants);

  participantCount.textContent = numberOfParticipants;
  participantCountLabel.textContent =
    `participant${numberOfParticipants === 1 ? "" : "s"} inscrit${numberOfParticipants === 1 ? "" : "s"}`;
  sessionStatus.textContent = readableStatus(session.status);
  connectionState.textContent = "Mise à jour en direct";
  proposedMode.textContent = numberOfParticipants === 0
    ? "En attente des cyclistes"
    : mode === "individual"
      ? "Parcours individuel"
      : "Parcours en groupes d’environ 3";
  presenceState.textContent = numberOfParticipants
    ? `${numberOfParticipants} en ligne`
    : "Aucune connexion";
  renderParticipants(participants, session);
  const groups = Object.values(session.groups || {});
  const activeDeviceCount = groups.filter(
    (group) => group.activeDeviceParticipantId
  ).length;
  devicesState.hidden =
    !session.modeLocked || session.participationMode !== "group";
  devicesState.classList.toggle(
    "ready",
    groups.length > 0 && activeDeviceCount === groups.length
  );
  devicesState.textContent = activeDeviceCount === groups.length
    ? `Tous les téléphones sont prêts (${activeDeviceCount}/${groups.length}).`
    : `${activeDeviceCount} téléphone${activeDeviceCount > 1 ? "s" : ""} actif${activeDeviceCount > 1 ? "s" : ""} sur ${groups.length}.`;
  const devicesAreReady =
    mode === "individual" ||
    (groups.length > 0 && activeDeviceCount === groups.length);
  const pathwayStarted = [
    "pathway",
    "review",
    "final-recap"
  ].includes(session.status);
  startPathwayButton.hidden = !session.modeLocked;
  startPathwayButton.disabled =
    actionInProgress || pathwayStarted || !devicesAreReady;
  startPathwayButton.textContent = pathwayStarted
    ? "Parcours démarré"
    : "Démarrer le parcours";
  const units = mode === "group"
    ? groups
    : participants.map(([, participant]) => participant);
  const responseCount = units.filter(
    (unit) => unit.status === "completed" || unit.completedAt
  ).length;
  pathwayState.hidden = !pathwayStarted;
  pathwayState.classList.toggle(
    "ready",
    units.length > 0 && responseCount === units.length
  );
  pathwayState.textContent =
    `${responseCount} parcours terminé${responseCount > 1 ? "s" : ""} sur ${units.length}.`;
  lockModeButton.disabled =
    actionInProgress || session.modeLocked || numberOfParticipants === 0;
  lockModeButton.textContent = session.modeLocked
    ? "Mode verrouillé"
    : session.groupsPrepared
      ? "Relancer la répartition"
      : "Préparer la répartition";
  confirmPreparationButton.hidden =
    session.modeLocked || !session.groupsPrepared;
  confirmPreparationButton.disabled = actionInProgress;
  if (session.modeLocked) {
    actionMessage.textContent =
      "Les numéros et le mode de participation sont verrouillés.";
  }
  waitingPanel.hidden = ["review", "final-recap", "closed"].includes(session.status);
  closedPanel.hidden = session.status !== "closed";
  monitoringPanel.hidden = !["pathway", "review"].includes(session.status);
  reviewPanel.hidden = session.status !== "review";
  finalPanel.hidden = session.status !== "final-recap";
  if (!monitoringPanel.hidden) renderScenarioMetrics(session);
  startReviewButton.hidden = session.status !== "pathway";
  if (session.status === "review") renderReview(session);
  if (session.status === "final-recap") renderFinal(session);
}

async function prepareParticipation() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.modeLocked
  ) {
    return;
  }

  const participants = participantEntries(currentSession);
  if (!participants.length) return;

  const mode = proposedParticipationMode(participants.length);
  const randomized = shuffled(participants);
  const groups = {};
  const changes = {
    participationMode: mode,
    participantCountAtPreparation: participants.length,
    preparedParticipants: Object.fromEntries(
      participants.map(([uid]) => [uid, true])
    ),
    groupsPrepared: true,
    groupsLocked: false,
    modeLocked: false,
    scenarioAssignmentLocked: false,
    groupsPreparedAt: serverTimestamp(),
    status: "grouping"
  };

  participants.forEach(([uid], index) => {
    changes[`participants/${uid}/participantNumber`] = index + 1;
    changes[`participants/${uid}/groupNumber`] = null;
    changes[`participants/${uid}/groupId`] = null;
    changes[`participants/${uid}/scenarioId`] = null;
    changes[`participants/${uid}/answers`] = null;
    changes[`participants/${uid}/currentStep`] = 0;
    changes[`participants/${uid}/currentStepId`] = null;
    changes[`participants/${uid}/startedAt`] = null;
    changes[`participants/${uid}/completedAt`] = null;
    changes[`participants/${uid}/status`] = "prepared";
  });

  if (mode === "individual") {
    const scenarioIds = balancedScenarioIds(randomized.length);
    randomized.forEach(([uid], index) => {
      changes[`participants/${uid}/scenarioId`] = scenarioIds[index];
      changes[`participants/${uid}/sessionId`] = sessionCode;
      changes[`participants/${uid}/unitId`] = uid;
      changes[`participants/${uid}/participationMode`] = "individual";
      changes[`participants/${uid}/scenarioVersion`] = 2;
      changes[`participants/${uid}/progress`] = 0;
    });
  } else {
    const sizes = balancedGroupSizes(randomized.length);
    const scenarioIds = balancedScenarioIds(sizes.length);
    let cursor = 0;
    sizes.forEach((size, index) => {
      const number = index + 1;
      const id = `group-${number}`;
      const members = randomized.slice(cursor, cursor + size);
      cursor += size;
      groups[id] = {
        id,
        number,
        colorName: [
          "Bleu", "Rouge", "Vert", "Jaune", "Violet",
          "Orange", "Turquoise", "Rose", "Marron", "Gris"
        ][index],
        symbol: ["⚡", "🔥", "🍃", "★", "☾", "☀", "≈", "♥", "▲", "☁"][index],
        color: [
          "#1677d2", "#d83b32", "#258a52", "#d29a00",
          "#7c4dcc", "#dc6b18", "#008b91", "#c83e78",
          "#80583d", "#687583"
        ][index],
        scenarioId: scenarioIds[index],
        sessionId: sessionCode,
        unitId: id,
        participationMode: "group",
        scenarioVersion: 2,
        currentStep: 0,
        currentStepId: null,
        progress: 0,
        answers: {},
        status: "awaiting-lock",
        members: Object.fromEntries(
          members.map(([uid]) => [uid, true])
        )
      };
      members.forEach(([uid]) => {
        changes[`participants/${uid}/groupNumber`] = number;
        changes[`participants/${uid}/groupId`] = id;
      });
    });
  }
  changes.groups = mode === "group" ? groups : null;

  actionInProgress = true;
  lockModeButton.disabled = true;
  actionMessage.textContent = "Préparation en cours…";

  try {
    await update(
      ref(database, `sessions/${sessionCode}`),
      changes
    );
  } catch (error) {
    console.error("Préparation impossible :", error);
    actionMessage.textContent =
      "La répartition n’a pas pu être préparée. Réessayez.";
  } finally {
    actionInProgress = false;
    if (currentSession) renderSession(currentSession);
  }
}

async function confirmPreparation() {
  if (
    actionInProgress ||
    !currentSession?.groupsPrepared ||
    currentSession.modeLocked
  ) return;
  const participants = participantEntries(currentSession);
  const prepared = Object.keys(
    currentSession.preparedParticipants || {}
  ).sort();
  const current = participants.map(([uid]) => uid).sort();
  if (
    prepared.length !== current.length ||
    prepared.some((uid, index) => uid !== current[index])
  ) {
    actionMessage.textContent =
      "La liste a changé. Relancez la répartition avant de valider.";
    return;
  }
  actionInProgress = true;
  confirmPreparationButton.disabled = true;
  try {
    await update(ref(database, `sessions/${sessionCode}`), {
      participantCountAtLaunch: participants.length,
      modeLocked: true,
      groupsLocked: true,
      scenarioAssignmentLocked: true,
      modeLockedAt: serverTimestamp(),
      status: currentSession.participationMode === "group"
        ? "group-device-selection"
        : "participation-ready"
    });
    actionMessage.textContent =
      "Le mode, les groupes et les scénarios sont verrouillés.";
  } catch (error) {
    console.error("Validation impossible :", error);
    actionMessage.textContent =
      "La préparation n’a pas pu être validée.";
  } finally {
    actionInProgress = false;
  }
}

async function startPathway() {
  if (
    actionInProgress ||
    !currentSession?.modeLocked ||
    ["pathway", "review", "final-recap", "correction", "final-decision", "results"].includes(
      currentSession.status
    )
  ) {
    return;
  }
  const groups = Object.values(currentSession.groups || {});
  if (
    currentSession.participationMode === "group" &&
    (
      !groups.length ||
      groups.some((group) => !group.activeDeviceParticipantId)
    )
  ) {
    actionMessage.textContent =
      "Un téléphone doit être choisi dans chaque groupe.";
    return;
  }

  actionInProgress = true;
  startPathwayButton.disabled = true;
  actionMessage.textContent = "Démarrage du parcours…";
  try {
    await update(
      ref(database, `sessions/${sessionCode}`),
      {
        status: "pathway",
        pathwayStep: "first-situation",
        pathwayStartedAt: serverTimestamp()
      }
    );
    actionMessage.textContent =
      "La première situation est affichée sur les téléphones actifs.";
  } catch (error) {
    console.error("Démarrage du parcours impossible :", error);
    actionMessage.textContent =
      "Le parcours n’a pas pu être démarré. Réessayez.";
  } finally {
    actionInProgress = false;
    if (currentSession) renderSession(currentSession);
  }
}

async function updateSession(values) {
  if (actionInProgress) return;
  actionInProgress = true;
  try {
    await update(ref(database, `sessions/${sessionCode}`), values);
  } catch (error) {
    console.error(error);
    reviewActionMessage.textContent = "L’action n’a pas pu être enregistrée.";
  } finally {
    actionInProgress = false;
  }
}

async function startReview() {
  await updateSession({
    status: "review",
    review: { scenarioIndex: 0, stepIndex: 0, revealed: false },
    reviewStartedAt: serverTimestamp()
  });
}

async function revealAnswer() {
  await updateSession({ "review/revealed": true });
}

async function nextReviewStep() {
  if (!currentSession || !reviewState(currentSession).revealed) return;
  const state = reviewState(currentSession);
  if (state.scenarioIndex === 2 && state.stepIndex === 4) {
    await updateSession({
      status: "final-recap",
      finalReflexCount: 0,
      keyMessageRevealed: false,
      finalRecapStartedAt: serverTimestamp()
    });
    return;
  }
  const nextStep = state.stepIndex === 4 ? 0 : state.stepIndex + 1;
  const nextScenario = state.stepIndex === 4
    ? state.scenarioIndex + 1 : state.scenarioIndex;
  await updateSession({
    "review/scenarioIndex": nextScenario,
    "review/stepIndex": nextStep,
    "review/revealed": false
  });
}

async function revealNextReflex() {
  const current = Math.min(Number(currentSession?.finalReflexCount) || 0, 9);
  if (current < 9) await updateSession({ finalReflexCount: current + 1 });
}

async function revealKeyMessage() {
  await updateSession({ keyMessageRevealed: true });
}

async function closeActivity() {
  await updateSession({ status: "closed", closedAt: serverTimestamp() });
}

async function openDashboard(user) {
  if (sessionCode.length !== 6) {
    showError("Le code de session est absent ou incorrect.");
    return;
  }

  try {
    const sessionReference = ref(
      database,
      `sessions/${sessionCode}`
    );
    const snapshot = await get(sessionReference);

    if (!snapshot.exists()) {
      showError("Cette session n’existe pas ou n’est plus disponible.");
      return;
    }

    const session = snapshot.val();
    if (session.activity !== ACTIVITY_ID) {
      showError("Ce code correspond à une autre activité.");
      return;
    }

    if (session.facilitatorId !== user.uid) {
      showError("Cette session ne vous appartient pas.");
      return;
    }

    showOnly(null);
    renderSession(session);
    stopSessionListener?.();
    stopSessionListener = onValue(
      sessionReference,
      (sessionSnapshot) => {
        if (!sessionSnapshot.exists()) {
          showError("La session n’est plus disponible.");
          return;
        }
        renderSession(sessionSnapshot.val());
      },
      () => {
        showError(
          "La synchronisation avec la session a été interrompue."
        );
      }
    );
  } catch (error) {
    console.error("Ouverture du tableau de bord impossible :", error);
    showError(
      "Le tableau de bord n’a pas pu être chargé. Vérifiez la connexion."
    );
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginButton.disabled = true;
  loginButton.textContent = "Connexion…";
  loginMessage.textContent = "";

  try {
    await signInWithEmailAndPassword(
      auth,
      EDUCATOR_EMAIL,
      educatorCode.value.trim()
    );
    loginForm.reset();
  } catch (error) {
    console.error("Connexion éducateur refusée :", error);
    loginMessage.textContent = "Le code confidentiel est incorrect.";
    educatorCode.select();
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Se connecter";
  }
});

lockModeButton.addEventListener("click", prepareParticipation);
confirmPreparationButton.addEventListener(
  "click",
  confirmPreparation
);
startPathwayButton.addEventListener("click", startPathway);
startReviewButton.addEventListener("click", startReview);
document.querySelector("#reveal-answer-button").addEventListener(
  "click", revealAnswer
);
document.querySelector("#next-review-button").addEventListener(
  "click", nextReviewStep
);
document.querySelector("#reveal-reflex-button").addEventListener(
  "click", revealNextReflex
);
document.querySelector("#reveal-key-message-button").addEventListener(
  "click", revealKeyMessage
);
document.querySelector("#close-activity-button").addEventListener(
  "click", closeActivity
);

onAuthStateChanged(auth, (user) => {
  if (!user || user.isAnonymous) {
    showLogin();
    return;
  }
  openDashboard(user);
});
