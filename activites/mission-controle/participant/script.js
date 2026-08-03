import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
  onValue,
  runTransaction,
  update,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

import { CONTROL_STEPS, CHAPTERS, analyzeRanking } from "../content.js";

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

const ACTIVITY_ID = "mission-controle";

const LEGACY_CONTROL_STEPS = [
  {
    id: "notification",
    label: "Notification au sportif",
    image: "../../../assets/images/mission-controle/01-notification.png",
    explanation:
      "Le sportif est informé qu’il a été sélectionné pour un contrôle et suit les consignes de l’agent de contrôle."
  },
  {
    id: "control-station",
    label: "Accueil au poste de contrôle du dopage",
    image:
      "../../../assets/images/mission-controle/02-accueil-poste-controle.png",
    explanation:
      "Le sportif se présente au poste de contrôle, où son identité et les informations utiles sont vérifiées."
  },
  {
    id: "collection-vessel",
    label: "Choix d’un gobelet de recueil",
    image: "../../../assets/images/mission-controle/03-choix-gobelet.png",
    explanation:
      "Le sportif choisit lui-même un gobelet de recueil encore scellé parmi le matériel proposé."
  },
  {
    id: "observation",
    label: "Observation de la miction par un ACD du même sexe",
    image:
      "../../../assets/images/mission-controle/04-observation-miction.png",
    explanation:
      "L’échantillon est produit sous l’observation directe d’un agent de contrôle du dopage du même sexe."
  },
  {
    id: "minimum-volume",
    label: "90 ml d’urine minimum",
    image: "../../../assets/images/mission-controle/05-volume-urine.png",
    explanation:
      "Un volume d’au moins 90 ml est nécessaire pour poursuivre normalement la procédure."
  },
  {
    id: "sample-kit",
    label: "Choix d’un kit de prélèvement",
    image: "../../../assets/images/mission-controle/06-choix-kit.png",
    explanation:
      "Le sportif choisit un kit de prélèvement sécurisé comprenant les flacons A et B."
  },
  {
    id: "sample-distribution",
    label: "Répartition de l’échantillon",
    image:
      "../../../assets/images/mission-controle/07-repartition-echantillon.png",
    explanation:
      "L’échantillon est réparti dans les deux flacons sécurisés A et B, puis leur fermeture est vérifiée."
  },
  {
    id: "urine-density",
    label: "Mesure de la densité urinaire",
    image: "../../../assets/images/mission-controle/08-densite-urinaire.png",
    explanation:
      "La densité urinaire est mesurée afin de vérifier que l’échantillon convient à l’analyse."
  },
  {
    id: "form",
    label: "Observations sur le formulaire et signature",
    image:
      "../../../assets/images/mission-controle/09-formulaire-signature.png",
    explanation:
      "Avant de signer, le sportif relit le formulaire, déclare les produits utilisés et peut faire inscrire une remarque."
  }
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const loadingScreen = document.querySelector("#loading-screen");
const errorScreen = document.querySelector("#error-screen");
const waitingScreen = document.querySelector("#waiting-screen");
const nextStepScreen = document.querySelector("#next-step-screen");
const rankingScreen = document.querySelector("#ranking-screen");
const rankingSubmittedScreen = document.querySelector(
  "#ranking-submitted-screen"
);
const rankingCorrectionScreen = document.querySelector(
  "#ranking-correction-screen"
);
const closedScreen = document.querySelector("#closed-screen");
const errorMessage = document.querySelector("#error-message");
const participantLabel = document.querySelector("#participant-label");
const displayedSessionCode = document.querySelector(
  "#displayed-session-code"
);
const controlStepsList = document.querySelector("#control-steps-list");
const rankingAnnouncement = document.querySelector(
  "#ranking-announcement"
);
const validateRankingButton = document.querySelector(
  "#validate-ranking-button"
);
const rankingMessage = document.querySelector("#ranking-message");
const personalResultSummary = document.querySelector(
  "#personal-result-summary"
);
const personalRankingList = document.querySelector(
  "#personal-ranking-list"
);
const correctProcedureList = document.querySelector(
  "#correct-procedure-list"
);
const missionTimeline = document.querySelector("#mission-timeline");
const missionChoices = document.querySelector("#mission-choices");
const missionFeedback = document.querySelector("#mission-feedback");
const missionQuestionTitle = document.querySelector("#mission-question-title");
const missionProgress = document.querySelector("#mission-progress");
const missionProgressLabel = document.querySelector("#mission-progress-label");
const chapterTitle = document.querySelector("#chapter-title");
const chapterRange = document.querySelector("#chapter-range");
const undoMissionButton = document.querySelector("#undo-mission-button");

let currentUser = null;
let sessionCode = "";
let stopSessionListener = null;
let draggedStep = null;
let pointerDraggedStep = null;
let submissionInProgress = false;
let missionIndex = 0;
let missionAttempts = {};
let missionInitialized = false;
let missionTransitioning = false;
let controlPositions = Array(CONTROL_STEPS.length).fill(null);
let controlHistory = [];
let controlBankOrder = [];
let controlDrag = null;

function showOnly(screen) {
  [
    loadingScreen,
    errorScreen,
    waitingScreen,
    nextStepScreen,
    rankingScreen,
    rankingSubmittedScreen,
    rankingCorrectionScreen,
    closedScreen
  ].forEach((currentScreen) => {
    currentScreen.hidden = currentScreen !== screen;
  });
}

function showError(message) {
  errorMessage.textContent = message;
  stopSessionListener?.();
  showOnly(errorScreen);
}

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

function waitForAuthentication() {
  return new Promise((resolve, reject) => {
    let stopListening = () => {};
    stopListening = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user?.isAnonymous) {
            stopListening();
            resolve(user);
            return;
          }
          const credential = await signInAnonymously(auth);
          stopListening();
          resolve(credential.user);
        } catch (error) {
          stopListening();
          reject(error);
        }
      },
      reject
    );
  });
}

async function registerParticipant(session) {
  const existingParticipant =
    session.participants?.[currentUser.uid];

  if (existingParticipant?.participantNumber) {
    const hasSubmittedRanking =
      existingParticipant.status === "ranking-submitted" &&
      Array.isArray(existingParticipant.controlRanking) &&
      existingParticipant.controlRanking.length === CONTROL_STEPS.length;

    if (hasSubmittedRanking) {
      return existingParticipant;
    }

    await update(
      ref(
        database,
        `sessions/${sessionCode}/participants/${currentUser.uid}`
      ),
      { status: "ready" }
    );
    return {
      ...existingParticipant,
      status: "ready"
    };
  }

  const counterResult = await runTransaction(
    ref(database, `sessions/${sessionCode}/nextParticipantNumber`),
    (currentNumber) => (Number(currentNumber) || 0) + 1
  );

  if (!counterResult.committed) {
    throw new Error("Le numéro anonyme n’a pas pu être attribué.");
  }

  const participantNumber = counterResult.snapshot.val();
  const participant = {
    participantNumber,
    joinedAt: existingParticipant?.joinedAt || serverTimestamp(),
    status: "ready"
  };

  await update(
    ref(
      database,
      `sessions/${sessionCode}/participants/${currentUser.uid}`
    ),
    participant
  );

  return participant;
}

function renderParticipant(participant) {
  participantLabel.textContent =
    `Cycliste ${participant.participantNumber}`;
  displayedSessionCode.textContent = sessionCode;
}

function createSeed(value) {
  let seed = 2166136261;
  for (const character of value) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function seededRandom(seed) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledSteps() {
  const steps = [...CONTROL_STEPS];
  const random = seededRandom(
    createSeed(`${sessionCode}:${currentUser.uid}`)
  );

  for (let index = steps.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [steps[index], steps[target]] = [steps[target], steps[index]];
  }

  const alreadyCorrect = steps.every(
    (step, index) => step.id === CONTROL_STEPS[index].id
  );
  if (alreadyCorrect) {
    steps.push(steps.shift());
  }

  return steps;
}

function announceStepPosition(item) {
  const cards = [...controlStepsList.children];
  const position = cards.indexOf(item) + 1;
  const label = item.querySelector(".control-step-label")?.textContent;
  rankingAnnouncement.textContent =
    `${label} est maintenant en position ${position} sur ${cards.length}.`;
}

function updateMoveButtons() {
  const cards = [...controlStepsList.children];
  cards.forEach((card, index) => {
    const moveUpButton = card.querySelector('[data-move="up"]');
    const moveDownButton = card.querySelector('[data-move="down"]');
    moveUpButton.disabled = index === 0;
    moveDownButton.disabled = index === cards.length - 1;
  });
}

function moveStep(item, direction) {
  if (direction === "up" && item.previousElementSibling) {
    controlStepsList.insertBefore(item, item.previousElementSibling);
  } else if (direction === "down" && item.nextElementSibling) {
    controlStepsList.insertBefore(item.nextElementSibling, item);
  } else {
    return;
  }

  updateMoveButtons();
  announceStepPosition(item);
  item.querySelector(`[data-move="${direction}"]`)?.focus();
}

function moveDraggedStep(clientX, clientY) {
  if (!pointerDraggedStep) return;

  const target = document
    .elementFromPoint(clientX, clientY)
    ?.closest(".control-step");

  if (!target || target === pointerDraggedStep) return;

  const targetBox = target.getBoundingClientRect();
  const insertAfter = clientY > targetBox.top + targetBox.height / 2;
  controlStepsList.insertBefore(
    pointerDraggedStep,
    insertAfter ? target.nextElementSibling : target
  );
  updateMoveButtons();
}

function finishPointerDrag(event) {
  if (!pointerDraggedStep) return;
  const item = pointerDraggedStep;
  item.classList.remove("is-dragging");
  if (item.hasPointerCapture?.(event.pointerId)) {
    item.releasePointerCapture(event.pointerId);
  }
  pointerDraggedStep = null;
  announceStepPosition(item);
}

function enableRankingInteractions() {
  controlStepsList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-move]");
    if (!button) return;
    moveStep(button.closest(".control-step"), button.dataset.move);
  });

  controlStepsList.addEventListener("dragstart", (event) => {
    const item = event.target.closest(".control-step");
    if (!item) return;
    draggedStep = item;
    item.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.dataset.stepId);
  });

  controlStepsList.addEventListener("dragover", (event) => {
    if (!draggedStep) return;
    event.preventDefault();
    const target = event.target.closest(".control-step");
    if (!target || target === draggedStep) return;
    const targetBox = target.getBoundingClientRect();
    const insertAfter =
      event.clientY > targetBox.top + targetBox.height / 2;
    controlStepsList.insertBefore(
      draggedStep,
      insertAfter ? target.nextElementSibling : target
    );
    updateMoveButtons();
  });

  controlStepsList.addEventListener("dragend", () => {
    if (!draggedStep) return;
    const item = draggedStep;
    item.classList.remove("is-dragging");
    draggedStep = null;
    updateMoveButtons();
    announceStepPosition(item);
  });

  controlStepsList.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".drag-handle");
    if (!handle || event.pointerType === "mouse") return;
    event.preventDefault();
    pointerDraggedStep = handle.closest(".control-step");
    pointerDraggedStep.classList.add("is-dragging");
    pointerDraggedStep.setPointerCapture(event.pointerId);
  });

  controlStepsList.addEventListener("pointermove", (event) => {
    if (!pointerDraggedStep) return;
    event.preventDefault();
    moveDraggedStep(event.clientX, event.clientY);
  });

  controlStepsList.addEventListener("pointerup", finishPointerDrag);
  controlStepsList.addEventListener("pointercancel", finishPointerDrag);
}

function renderLegacyRanking() {
  if (controlStepsList.children.length) return;
  shuffledSteps().forEach((step) => {
    const item = document.createElement("li");
    item.className = "control-step";
    item.dataset.stepId = step.id;
    item.draggable = true;

    const image = document.createElement("img");
    image.className = "control-step-image";
    image.src = step.image;
    image.alt = "";
    image.loading = "eager";

    const label = document.createElement("span");
    label.className = "control-step-label";
    label.textContent = step.label;

    const controls = document.createElement("div");
    controls.className = "control-step-controls";

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "drag-handle";
    dragHandle.setAttribute(
      "aria-label",
      `Faire glisser : ${step.label}`
    );
    dragHandle.innerHTML =
      '<span aria-hidden="true">↕</span><span>Déplacer</span>';

    const moveUpButton = document.createElement("button");
    moveUpButton.type = "button";
    moveUpButton.dataset.move = "up";
    moveUpButton.setAttribute("aria-label", `Monter : ${step.label}`);
    moveUpButton.textContent = "↑ Monter";

    const moveDownButton = document.createElement("button");
    moveDownButton.type = "button";
    moveDownButton.dataset.move = "down";
    moveDownButton.setAttribute(
      "aria-label",
      `Descendre : ${step.label}`
    );
    moveDownButton.textContent = "↓ Descendre";

    controls.append(dragHandle, moveUpButton, moveDownButton);
    item.append(image, label, controls);
    controlStepsList.append(item);
  });
  updateMoveButtons();
}

function getLegacyRanking() {
  return [...controlStepsList.children].map(
    (item) => item.dataset.stepId
  );
}

function createCorrectionCard(step, position, isCorrect) {
  const item = document.createElement("li");
  item.className =
    `comparison-item ${isCorrect ? "is-correct" : "is-misplaced"}`;

  const image = document.createElement("img");
  image.src = step.image;
  image.alt = "";

  const content = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = `${position}. ${step.label}`;
  const status = document.createElement("span");
  status.textContent = isCorrect ? "✓ Bien placée" : "↔ À repositionner";
  content.append(title, status);
  item.append(image, content);
  return item;
}

function renderLegacyRankingCorrection(participant) {
  const ranking = Array.isArray(participant?.controlRanking)
    ? participant.controlRanking
    : [];
  const stepsById = new Map(
    CONTROL_STEPS.map((step) => [step.id, step])
  );
  const correctCount = ranking.reduce(
    (count, stepId, index) =>
      count + Number(stepId === CONTROL_STEPS[index]?.id),
    0
  );

  const correctStepSuffix = correctCount === 1 ? "" : "s";
  personalResultSummary.textContent = ranking.length
    ? `${correctCount} étape${correctStepSuffix} sur 9 bien placée${correctStepSuffix}.`
    : "Aucune proposition n’a été enregistrée avant la correction.";

  personalRankingList.replaceChildren();
  ranking.forEach((stepId, index) => {
    const step = stepsById.get(stepId);
    if (!step) return;
    personalRankingList.append(
      createCorrectionCard(
        step,
        index + 1,
        stepId === CONTROL_STEPS[index].id
      )
    );
  });

  correctProcedureList.replaceChildren();
  CONTROL_STEPS.forEach((step, index) => {
    const item = document.createElement("li");
    item.className = "procedure-step";
    item.style.setProperty("--appearance-delay", `${index * 70}ms`);

    const image = document.createElement("img");
    image.src = step.image;
    image.alt = "";

    const content = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${step.label}`;
    const explanation = document.createElement("p");
    explanation.textContent = step.explanation;
    content.append(title, explanation);
    item.append(image, content);
    correctProcedureList.append(item);
  });
}

function missionStorageKey() {
  return `procyclean-mission:${sessionCode}:${currentUser?.uid || "participant"}`;
}

function saveMissionProgress() {
  localStorage.setItem(
    missionStorageKey(),
    JSON.stringify({ index: missionIndex, attempts: missionAttempts })
  );
}

function restoreMissionProgress() {
  if (missionInitialized) return;
  missionInitialized = true;
  try {
    const saved = JSON.parse(localStorage.getItem(missionStorageKey()));
    if (saved && Number.isInteger(saved.index)) {
      missionIndex = Math.min(Math.max(saved.index, 0), CONTROL_STEPS.length);
      missionAttempts = saved.attempts || {};
    }
  } catch {
    missionIndex = 0;
    missionAttempts = {};
  }
}

function missionCandidates(index) {
  const correct = CONTROL_STEPS[index];
  const futureSteps = CONTROL_STEPS.slice(index + 1);
  const random = seededRandom(createSeed(`${sessionCode}:${currentUser.uid}:${index}`));
  for (let cursor = futureSteps.length - 1; cursor > 0; cursor -= 1) {
    const target = Math.floor(random() * (cursor + 1));
    [futureSteps[cursor], futureSteps[target]] = [futureSteps[target], futureSteps[cursor]];
  }
  const candidates = [correct, ...futureSteps.slice(0, 2)];
  while (candidates.length < 3) {
    const earlier = CONTROL_STEPS.find((step) => !candidates.includes(step));
    if (!earlier) break;
    candidates.push(earlier);
  }
  return candidates.sort(() => random() - 0.5);
}

function renderMissionTimeline() {
  missionTimeline.replaceChildren();
  CONTROL_STEPS.slice(0, missionIndex).forEach((step, index) => {
    const item = document.createElement("li");
    item.className = "timeline-step completed";
    item.innerHTML = `
      <span class="timeline-number">${index + 1}</span>
      <img src="${step.image}" alt="">
      <strong>${step.label}</strong>`;
    missionTimeline.append(item);
  });
  if (missionIndex < CONTROL_STEPS.length) {
    const pending = document.createElement("li");
    pending.className = "timeline-step current";
    pending.innerHTML = `<span class="timeline-number">${missionIndex + 1}</span><strong>Prochaine étape ?</strong>`;
    missionTimeline.append(pending);
  }
}

function renderProgressiveRanking() {
  restoreMissionProgress();
  const chapterIndex = Math.min(Math.floor(missionIndex / 3), 2);
  const chapter = CHAPTERS[chapterIndex];
  chapterTitle.textContent = chapter.title;
  chapterRange.textContent = chapter.range;
  missionProgress.value = missionIndex;
  missionProgressLabel.textContent = `${missionIndex} / ${CONTROL_STEPS.length}`;
  renderMissionTimeline();
  missionChoices.replaceChildren();
  missionFeedback.replaceChildren();
  missionFeedback.className = "mission-feedback";

  if (missionIndex >= CONTROL_STEPS.length) {
    missionQuestionTitle.textContent = "Procédure reconstituée !";
    missionFeedback.classList.add("success");
    missionFeedback.innerHTML = `<strong>Mission accomplie.</strong><p>Relis ta frise puis enregistre ton parcours.</p>`;
    validateRankingButton.hidden = false;
    return;
  }

  validateRankingButton.hidden = true;
  const previousStep = CONTROL_STEPS[missionIndex - 1];
  missionQuestionTitle.textContent = previousStep
    ? `Après « ${previousStep.label} », que se passe-t-il ?`
    : "Comment commence la procédure ?";

  missionCandidates(missionIndex).forEach((step) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mission-choice";
    button.dataset.stepId = step.id;
    button.innerHTML = `<img src="${step.image}" alt=""><strong>${step.label}</strong>`;
    missionChoices.append(button);
  });
}

missionChoices.addEventListener("click", (event) => {
  const choice = event.target.closest("button[data-step-id]");
  if (!choice || missionTransitioning || missionIndex >= CONTROL_STEPS.length) return;
  const expected = CONTROL_STEPS[missionIndex];
  const selected = CONTROL_STEPS.find((step) => step.id === choice.dataset.stepId);
  missionAttempts[expected.id] ||= { errors: 0, choices: {} };

  if (selected.id !== expected.id) {
    missionAttempts[expected.id].errors += 1;
    missionAttempts[expected.id].choices[selected.id] =
      (missionAttempts[expected.id].choices[selected.id] || 0) + 1;
    choice.classList.add("incorrect");
    choice.disabled = true;
    missionFeedback.className = "mission-feedback error";
    missionFeedback.innerHTML = `<strong>Pas encore.</strong><p>${expected.hint}</p>`;
    saveMissionProgress();
    return;
  }

  missionTransitioning = true;
  choice.classList.add("correct");
  missionChoices.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  missionFeedback.className = "mission-feedback success";
  missionFeedback.innerHTML = `
    <strong>Bonne étape !</strong>
    <p>${expected.explanation}</p>
    <div class="reflex-card"><span>Ton réflexe</span>${expected.reflex}</div>
    <button type="button" class="continue-mission-button">Continuer</button>`;
  missionIndex += 1;
  saveMissionProgress();
});

missionFeedback.addEventListener("click", (event) => {
  if (!event.target.closest(".continue-mission-button")) return;
  missionTransitioning = false;
  renderRanking();
});

function nextControlSlot() {
  return controlPositions.findIndex((value) => value === null);
}

function renderRanking() {
  if (!controlBankOrder.length) controlBankOrder = shuffledSteps();
  const placed = controlPositions.filter(Boolean).length;
  const active = nextControlSlot();
  chapterRange.textContent = "Classement";
  chapterTitle.textContent = "Les étapes du contrôle";
  missionProgress.value = placed;
  missionProgressLabel.textContent = `${placed} / ${CONTROL_STEPS.length}`;
  missionQuestionTitle.textContent = active < 0
    ? "Ton ordre est complet. Tu peux encore échanger les cartes."
    : "Fais glisser chaque carte vers la place de ton choix.";
  missionFeedback.replaceChildren();

  missionTimeline.replaceChildren();
  controlPositions.forEach((stepId, index) => {
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
    missionTimeline.append(item);
  });

  missionChoices.replaceChildren();
  controlBankOrder.filter((step) => !controlPositions.includes(step.id))
    .forEach((step) => {
      const card = document.createElement("div");
      card.className = "control-card";
      card.dataset.dragStep = step.id;
      card.innerHTML = `<img src="${step.image}" alt=""><strong>${step.label}</strong>`;
      missionChoices.append(card);
    });
  undoMissionButton.disabled = controlHistory.length === 0;
  validateRankingButton.hidden = false;
  validateRankingButton.disabled = placed !== CONTROL_STEPS.length;
}

function clearControlTarget() {
  document.querySelectorAll(".control-drop-target").forEach((item) =>
    item.classList.remove("control-drop-target"));
}

function moveControlPreview(x, y) {
  if (!controlDrag) return;
  controlDrag.preview.style.transform =
    `translate3d(${x - controlDrag.offsetX}px, ${y - controlDrag.offsetY}px, 0)`;
}

function autoScrollControlDrag() {
  if (!controlDrag) return;
  if (controlDrag.moved && controlDrag.clientY < 85) window.scrollBy(0, -10);
  if (controlDrag.moved && controlDrag.clientY > innerHeight - 85) window.scrollBy(0, 10);
  controlDrag.frame = requestAnimationFrame(autoScrollControlDrag);
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
  controlDrag = {
    pointerId: event.pointerId,
    stepId: step.id,
    sourceSlot: source.dataset.slotIndex === undefined
      ? null
      : Number(source.dataset.slotIndex),
    source, preview, clientY: event.clientY, moved: false,
    offsetX: Math.min(event.clientX - box.left, 90),
    offsetY: Math.min(event.clientY - box.top, 32)
  };
  source.classList.add("control-drag-source");
  source.setPointerCapture(event.pointerId);
  moveControlPreview(event.clientX, event.clientY);
  controlDrag.frame = requestAnimationFrame(autoScrollControlDrag);
  event.preventDefault();
});

rankingScreen.addEventListener("pointermove", (event) => {
  if (!controlDrag || event.pointerId !== controlDrag.pointerId) return;
  controlDrag.clientY = event.clientY;
  controlDrag.moved = true;
  moveControlPreview(event.clientX, event.clientY);
  clearControlTarget();
  document.elementFromPoint(event.clientX, event.clientY)
    ?.closest(".control-slot, .control-bank-panel")
    ?.classList.add("control-drop-target");
  event.preventDefault();
});

function finishControlDrag(event, cancelled = false) {
  if (!controlDrag || event.pointerId !== controlDrag.pointerId) return;
  const current = controlDrag;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const slot = target?.closest(".control-slot");
  const returnToBank = target?.closest(".control-bank-panel");
  cancelAnimationFrame(current.frame);
  current.source.classList.remove("control-drag-source");
  current.preview.remove();
  clearControlTarget();
  controlDrag = null;
  if (cancelled) return;
  if (slot) {
    const targetIndex = Number(slot.dataset.slotIndex);
    if (targetIndex === current.sourceSlot) return;
    controlHistory.push([...controlPositions]);
    if (current.sourceSlot === null) controlPositions[targetIndex] = current.stepId;
    else [controlPositions[targetIndex], controlPositions[current.sourceSlot]] =
      [controlPositions[current.sourceSlot], controlPositions[targetIndex]];
  } else if (returnToBank && current.sourceSlot !== null) {
    controlHistory.push([...controlPositions]);
    controlPositions[current.sourceSlot] = null;
  } else return;
  renderRanking();
}

rankingScreen.addEventListener("pointerup", (event) => finishControlDrag(event));
rankingScreen.addEventListener("pointercancel", (event) => finishControlDrag(event, true));
undoMissionButton.addEventListener("click", () => {
  const previous = controlHistory.pop();
  if (!previous) return;
  controlPositions = previous;
  renderRanking();
});

function renderRankingCorrection(participant) {
  const ranking = participant?.controlRanking || [];
  const analysis = analyzeRanking(ranking);
  personalResultSummary.textContent = analysis.errorCount
    ? `${analysis.score} étapes sur 9 sont déjà dans la bonne séquence · ${analysis.errorCount} carte${analysis.errorCount > 1 ? "s" : ""} à repositionner.`
    : "9 étapes sur 9 dans la bonne séquence · aucune erreur de placement.";
  const placementFeedback = document.querySelector("#placement-feedback");
  placementFeedback.replaceChildren();
  placementFeedback.classList.toggle("perfect", analysis.errorCount === 0);
  const feedbackTitle = document.createElement("h3");
  feedbackTitle.textContent = analysis.errorCount
    ? "Tes erreurs de placement"
    : "Ordre entièrement correct";
  placementFeedback.append(feedbackTitle);
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
  correctProcedureList.replaceChildren();
  CONTROL_STEPS.forEach((step, index) => {
    const item = document.createElement("li");
    item.className = "procedure-step";
    item.innerHTML = `
      <img src="${step.image}" alt="">
      <div><h3>${index + 1}. ${step.label}</h3><p>${step.explanation}</p>
      <div class="procedure-reflex"><strong>Ton réflexe :</strong> ${step.reflex}</div></div>`;
    correctProcedureList.append(item);
  });
}

async function submitRanking() {
  if (submissionInProgress || !currentUser || !sessionCode) return;

  const ranking = [...controlPositions];
  const validStepIds = new Set(CONTROL_STEPS.map((step) => step.id));
  const isComplete =
    ranking.length === CONTROL_STEPS.length &&
    new Set(ranking).size === CONTROL_STEPS.length &&
    ranking.every((stepId) => validStepIds.has(stepId));

  if (!isComplete) {
    rankingMessage.textContent =
      "Le classement est incomplet. Actualise la page puis recommence.";
    return;
  }

  submissionInProgress = true;
  validateRankingButton.disabled = true;
  validateRankingButton.textContent = "Enregistrement…";
  rankingMessage.textContent = "";

  try {
    const sessionSnapshot = await get(
      ref(database, `sessions/${sessionCode}`)
    );

    if (!sessionSnapshot.exists()) {
      throw new Error("Session introuvable.");
    }

    const session = sessionSnapshot.val();
    const participant = session.participants?.[currentUser.uid];

    if (session.status === "closed") {
      showOnly(closedScreen);
      return;
    }

    if (participant?.status === "ranking-submitted") {
      showOnly(rankingSubmittedScreen);
      return;
    }

    if (session.status !== "ranking") {
      throw new Error("La phase de classement est terminée.");
    }

    await update(
      ref(
        database,
        `sessions/${sessionCode}/participants/${currentUser.uid}`
      ),
      {
        controlRanking: ranking,
        controlAttempts: null,
        firstTryCorrectCount: null,
        status: "ranking-submitted",
        controlRankingSubmittedAt: serverTimestamp()
      }
    );


    showOnly(rankingSubmittedScreen);
  } catch (error) {
    console.error("Enregistrement du classement impossible :", error);
    rankingMessage.textContent =
      "L’ordre n’a pas pu être enregistré. Vérifie ta connexion puis réessaie.";
  } finally {
    submissionInProgress = false;
    validateRankingButton.disabled = false;
    validateRankingButton.textContent = "Valider mon ordre";
  }
}

function renderSession(session) {
  const participant = session.participants?.[currentUser.uid];

  if (participant?.participantNumber) {
    renderParticipant(participant);
  }

  if (session.status === "closed") {
    showOnly(closedScreen);
    return;
  }

  if (session.status === "waiting") {
    showOnly(waitingScreen);
    return;
  }

  if (session.status === "ranking") {
    if (
      participant?.status === "ranking-submitted" &&
      Array.isArray(participant.controlRanking) &&
      participant.controlRanking.length === CONTROL_STEPS.length
    ) {
      showOnly(rankingSubmittedScreen);
      return;
    }

    renderProgressiveRanking();
    showOnly(rankingScreen);
    return;
  }

  if (session.status === "ranking-correction") {
    renderRankingCorrection(participant);
    showOnly(rankingCorrectionScreen);
    return;
  }

  showOnly(nextStepScreen);
}

function listenToSession() {
  stopSessionListener?.();
  stopSessionListener = onValue(
    ref(database, `sessions/${sessionCode}`),
    (snapshot) => {
      if (!snapshot.exists()) {
        showError("Cette session n’est plus disponible.");
        return;
      }
      renderSession(snapshot.val());
    },
    () => {
      showError("La synchronisation avec la session a été interrompue.");
    }
  );
}

async function loadActivity() {
  showOnly(loadingScreen);
  sessionCode = readSessionCode();

  if (sessionCode.length !== 6) {
    showError(
      "Le code de session est absent ou incorrect. Rejoins à nouveau l’activité depuis le portail."
    );
    return;
  }

  try {
    currentUser = await waitForAuthentication();
    const sessionSnapshot = await get(
      ref(database, `sessions/${sessionCode}`)
    );

    if (!sessionSnapshot.exists()) {
      showError("Cette session n’existe pas ou n’est plus disponible.");
      return;
    }

    const session = sessionSnapshot.val();

    if (session.activity !== ACTIVITY_ID) {
      showError("Ce code correspond à une autre activité.");
      return;
    }

    if (session.status === "closed") {
      showOnly(closedScreen);
      return;
    }

    const participant = await registerParticipant(session);
    renderParticipant(participant);
    listenToSession();
  } catch (error) {
    console.error("Connexion à l’activité impossible :", error);
    showError(
      "La connexion à l’activité a échoué. Vérifie ta connexion puis réessaie."
    );
  }
}

validateRankingButton.addEventListener("click", submitRanking);
loadActivity();
