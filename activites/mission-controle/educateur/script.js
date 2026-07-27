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
const EDUCATOR_EMAIL = "prevention.dopage@ffc.fr";
const CONTROL_STEPS = [
  {
    id: "notification",
    label: "Notification au sportif",
    image: "../../../assets/images/mission-controle/01-notification.png"
  },
  {
    id: "control-station",
    label: "Accueil au poste de contrôle du dopage",
    image:
      "../../../assets/images/mission-controle/02-accueil-poste-controle.png"
  },
  {
    id: "collection-vessel",
    label: "Choix d’un gobelet de recueil",
    image: "../../../assets/images/mission-controle/03-choix-gobelet.png"
  },
  {
    id: "observation",
    label: "Observation de la miction par un ACD du même sexe",
    image:
      "../../../assets/images/mission-controle/04-observation-miction.png"
  },
  {
    id: "minimum-volume",
    label: "90 ml d’urine minimum",
    image: "../../../assets/images/mission-controle/05-volume-urine.png"
  },
  {
    id: "sample-kit",
    label: "Choix d’un kit de prélèvement",
    image: "../../../assets/images/mission-controle/06-choix-kit.png"
  },
  {
    id: "sample-distribution",
    label: "Répartition de l’échantillon",
    image:
      "../../../assets/images/mission-controle/07-repartition-echantillon.png"
  },
  {
    id: "urine-density",
    label: "Mesure de la densité urinaire",
    image: "../../../assets/images/mission-controle/08-densite-urinaire.png"
  },
  {
    id: "form",
    label: "Observations sur le formulaire et signature",
    image:
      "../../../assets/images/mission-controle/09-formulaire-signature.png"
  }
];

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
const readyCount = document.querySelector("#ready-count");
const sessionStatus = document.querySelector("#session-status");
const waitingPanel = document.querySelector(".waiting-panel");
const rankingPanel = document.querySelector("#ranking-panel");
const correctionPanel = document.querySelector("#correction-panel");
const closedPanel = document.querySelector("#closed-panel");
const startActivityButton = document.querySelector(
  "#start-activity-button"
);
const actionMessage = document.querySelector("#action-message");
const rankingResponseCount = document.querySelector(
  "#ranking-response-count"
);
const rankingResponseLabel = document.querySelector(
  "#ranking-response-label"
);
const rankingTotalCount = document.querySelector("#ranking-total-count");
const rankingProgress = document.querySelector("#ranking-progress");
const revealRankingButton = document.querySelector(
  "#reveal-ranking-button"
);
const rankingActionMessage = document.querySelector(
  "#ranking-action-message"
);
const correctionResponseCount = document.querySelector(
  "#correction-response-count"
);
const fullyCorrectCount = document.querySelector(
  "#fully-correct-count"
);
const difficultStepsList = document.querySelector(
  "#difficult-steps-list"
);
const procedureSummary = document.querySelector("#procedure-summary");
const closeActivityButton = document.querySelector(
  "#close-activity-button"
);
const closeMessage = document.querySelector("#close-message");

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
    ranking: "Classement",
    "ranking-correction": "Correction",
    scenario: "Situation",
    "scenario-correction": "Correction",
    results: "Synthèse",
    closed: "Clôturée"
  };
  return labels[status] || "En attente";
}

function hasValidRanking(participant) {
  return (
    participant.status === "ranking-submitted" &&
    Array.isArray(participant.controlRanking) &&
    participant.controlRanking.length === CONTROL_STEPS.length &&
    new Set(participant.controlRanking).size === CONTROL_STEPS.length
  );
}

function renderCorrectionSummary(submittedParticipants) {
  correctionResponseCount.textContent = submittedParticipants.length;
  correctionResponseCount.nextElementSibling.textContent =
    `réponse${submittedParticipants.length === 1 ? "" : "s"} reçue${submittedParticipants.length === 1 ? "" : "s"}`;

  const entirelyCorrect = submittedParticipants.filter(
    (participant) =>
      participant.controlRanking.every(
        (stepId, index) => stepId === CONTROL_STEPS[index].id
      )
  ).length;
  fullyCorrectCount.textContent = entirelyCorrect;
  fullyCorrectCount.nextElementSibling.textContent =
    `ordre${entirelyCorrect === 1 ? "" : "s"} entièrement correct${entirelyCorrect === 1 ? "" : "s"}`;

  const stepResults = CONTROL_STEPS.map((step, index) => {
    const correctPlacements = submittedParticipants.filter(
      (participant) => participant.controlRanking[index] === step.id
    ).length;
    const percentage = submittedParticipants.length
      ? Math.round(correctPlacements * 100 / submittedParticipants.length)
      : 0;
    return { ...step, correctPlacements, percentage, index };
  });

  difficultStepsList.replaceChildren();
  const difficultSteps = [...stepResults]
    .sort((first, second) => first.percentage - second.percentage)
    .slice(0, 3);
  difficultSteps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = submittedParticipants.length
      ? `${step.label} — ${100 - step.percentage} % mal positionnée`
      : `${step.label} — aucune réponse reçue`;
    difficultStepsList.append(item);
  });

  procedureSummary.replaceChildren();
  stepResults.forEach((step) => {
    const item = document.createElement("li");
    const image = document.createElement("img");
    image.src = step.image;
    image.alt = "";
    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${step.index + 1}. ${step.label}`;
    const result = document.createElement("span");
    result.textContent =
      `${step.percentage} % à la bonne position ` +
      `(${step.correctPlacements}/${submittedParticipants.length})`;
    content.append(title, result);
    item.append(image, content);
    procedureSummary.append(item);
  });
}

function renderSession(session) {
  currentSession = session;
  const participants = Object.values(session.participants || {});
  const readyParticipants = participants.filter(
    (participant) =>
      participant.status === "ready" ||
      participant.status === "ranking-submitted"
  );
  const submittedParticipants = participants.filter(hasValidRanking);

  participantCount.textContent = participants.length;
  participantCount.nextElementSibling.textContent =
    `cycliste${participants.length > 1 ? "s" : ""} connecté${participants.length > 1 ? "s" : ""}`;

  readyCount.textContent = readyParticipants.length;
  readyCount.nextElementSibling.textContent =
    `cycliste${readyParticipants.length > 1 ? "s" : ""} prêt${readyParticipants.length > 1 ? "s" : ""}`;

  sessionStatus.textContent = readableStatus(session.status);
  connectionState.textContent = "Mise à jour en direct";

  waitingPanel.hidden = session.status !== "waiting";
  rankingPanel.hidden = session.status !== "ranking";
  correctionPanel.hidden = session.status !== "ranking-correction";
  closedPanel.hidden = session.status !== "closed";

  rankingResponseCount.textContent = submittedParticipants.length;
  rankingResponseLabel.textContent =
    submittedParticipants.length === 1 ? "réponse" : "réponses";
  rankingTotalCount.textContent = participants.length;
  rankingProgress.max = Math.max(participants.length, 1);
  rankingProgress.value = submittedParticipants.length;
  revealRankingButton.disabled =
    actionInProgress || session.status !== "ranking";
  closeActivityButton.disabled =
    actionInProgress || session.status !== "ranking-correction";

  if (session.status === "ranking-correction") {
    renderCorrectionSummary(submittedParticipants);
  }

  startActivityButton.disabled =
    actionInProgress ||
    session.status !== "waiting" ||
    readyParticipants.length === 0;
}

async function closeActivity() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.status !== "ranking-correction"
  ) {
    return;
  }

  actionInProgress = true;
  closeActivityButton.disabled = true;
  closeActivityButton.textContent = "Clôture…";
  closeMessage.textContent = "";

  try {
    await update(ref(database, `sessions/${sessionCode}`), {
      status: "closed",
      closedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Clôture impossible :", error);
    closeMessage.textContent =
      "L’activité n’a pas pu être clôturée. Réessayez.";
    closeActivityButton.disabled = false;
  } finally {
    actionInProgress = false;
    closeActivityButton.textContent = "Clôturer l’activité";
  }
}

async function revealRankingCorrection() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.status !== "ranking"
  ) {
    return;
  }

  const participants = Object.values(
    currentSession.participants || {}
  );
  const submittedCount = participants.filter(hasValidRanking).length;
  const missingCount = participants.length - submittedCount;

  if (
    missingCount > 0 &&
    !window.confirm(
      `${missingCount} cycliste${missingCount > 1 ? "s n’ont" : " n’a"} ` +
      "pas encore validé. Révéler quand même la correction ?"
    )
  ) {
    return;
  }

  actionInProgress = true;
  revealRankingButton.disabled = true;
  revealRankingButton.textContent = "Révélation…";
  rankingActionMessage.textContent = "";

  try {
    await update(ref(database, `sessions/${sessionCode}`), {
      status: "ranking-correction",
      rankingCorrectionRevealedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Révélation de la correction impossible :", error);
    rankingActionMessage.textContent =
      "La correction n’a pas pu être révélée. Réessayez.";
  } finally {
    actionInProgress = false;
    revealRankingButton.disabled =
      currentSession?.status !== "ranking";
    revealRankingButton.textContent =
      "Révéler la procédure correcte";
  }
}

async function startActivity() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.status !== "waiting"
  ) {
    return;
  }

  const readyParticipants = Object.values(
    currentSession.participants || {}
  ).filter((participant) => participant.status === "ready");

  if (!readyParticipants.length) {
    actionMessage.textContent =
      "Attendez qu’au moins un cycliste soit prêt.";
    return;
  }

  actionInProgress = true;
  startActivityButton.disabled = true;
  startActivityButton.textContent = "Lancement…";
  actionMessage.textContent = "";

  try {
    await update(ref(database, `sessions/${sessionCode}`), {
      status: "ranking",
      startedAt: serverTimestamp(),
      rankingStartedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Lancement impossible :", error);
    actionMessage.textContent =
      "L’activité n’a pas pu être lancée. Réessayez.";
  } finally {
    actionInProgress = false;
    startActivityButton.textContent = "Commencer l’activité";
  }
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
        showError("La synchronisation avec la session a été interrompue.");
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
  const confidentialCode = educatorCode.value.trim();
  loginButton.disabled = true;
  loginButton.textContent = "Connexion…";
  loginMessage.textContent = "";

  try {
    await signInWithEmailAndPassword(
      auth,
      EDUCATOR_EMAIL,
      confidentialCode
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

startActivityButton.addEventListener("click", startActivity);
revealRankingButton.addEventListener(
  "click",
  revealRankingCorrection
);
closeActivityButton.addEventListener("click", closeActivity);

onAuthStateChanged(auth, (user) => {
  if (!user || user.isAnonymous) {
    showLogin();
    return;
  }
  openDashboard(user);
});
