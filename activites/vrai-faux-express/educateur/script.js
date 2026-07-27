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

const ACTIVITY_ID = "vrai-faux-express";
const FACILITATOR_EMAIL = "prevention.dopage@ffc.fr";

const QUESTIONS = [
  {
    text: "Le sport propre, c’est seulement ne pas se doper.",
    correctAnswer: false,
    explanation: "Le sport propre ne consiste pas seulement à éviter le dopage. Il repose aussi sur le respect des règles, de sa santé, des autres et des valeurs du sport."
  },
  {
    text: "Un sportif peut être sanctionné même s’il n’avait pas l’intention de se doper.",
    correctAnswer: true,
    explanation: "Le sportif est responsable des substances retrouvées dans son organisme. Une violation peut donc être constatée même sans intention de tricher."
  },
  {
    text: "Un complément alimentaire « naturel » est forcément sans danger au regard des règles antidopage.",
    correctAnswer: false,
    explanation: "Un produit présenté comme naturel peut contenir une substance interdite ou être contaminé. Il faut toujours demander conseil avant d’en consommer."
  },
  {
    text: "Avant de prendre un médicament, un sportif doit vérifier s’il est autorisé.",
    correctAnswer: true,
    explanation: "Certains médicaments peuvent contenir une substance interdite. Le sportif doit demander conseil et vérifier le médicament avant de le prendre."
  },
  {
    text: "Toutes les substances interdites le sont tout le temps et dans tous les sports.",
    correctAnswer: false,
    explanation: "Certaines substances sont interdites en permanence, d’autres uniquement en compétition ou dans certains sports."
  },
  {
    text: "Un sportif peut être contrôlé en compétition et hors compétition, sans être prévenu à l’avance.",
    correctAnswer: true,
    explanation: "Un contrôle antidopage peut être organisé en compétition ou hors compétition et peut avoir lieu sans avertissement préalable."
  },
  {
    text: "Refuser un contrôle antidopage n’est pas une violation si on n’a rien pris.",
    correctAnswer: false,
    explanation: "Refuser un contrôle, ne pas s’y présenter ou tenter de l’éviter peut constituer une violation des règles antidopage."
  },
  {
    text: "Pendant un contrôle, le sportif peut demander des renseignements sur la procédure et être accompagné.",
    correctAnswer: true,
    explanation: "Le sportif a des droits pendant le contrôle. Il peut notamment poser des questions sur la procédure et, selon les règles applicables, être accompagné."
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
const facilitatorCode = document.querySelector("#facilitator-code");
const loginButton = document.querySelector("#login-button");
const loginMessage = document.querySelector("#login-message");

const errorMessage = document.querySelector("#error-message");
const sessionCodeElement = document.querySelector("#session-code");
const waitingSessionCode = document.querySelector(
  "#waiting-session-code"
);
const connectionState = document.querySelector("#connection-state");
const participantCount = document.querySelector("#participant-count");
const sessionStatus = document.querySelector("#session-status");
const waitingPanel = document.querySelector(".waiting-panel");
const questionPanel = document.querySelector("#question-panel");
const questionNumber = document.querySelector("#question-number");
const questionText = document.querySelector("#question-text");
const startActivityButton = document.querySelector(
  "#start-activity-button"
);
const actionMessage = document.querySelector("#action-message");
const answerCount = document.querySelector("#answer-count");
const trueCount = document.querySelector("#true-count");
const falseCount = document.querySelector("#false-count");
const truePercentage = document.querySelector("#true-percentage");
const falsePercentage = document.querySelector("#false-percentage");
const correctionBox = document.querySelector("#correction-box");
const correctAnswer = document.querySelector("#correct-answer");
const correctionExplanation = document.querySelector(
  "#correction-explanation"
);
const revealAnswerButton = document.querySelector(
  "#reveal-answer-button"
);
const nextQuestionButton = document.querySelector(
  "#next-question-button"
);
const questionActionMessage = document.querySelector(
  "#question-action-message"
);
const startFinalDefinitionButton = document.querySelector(
  "#start-final-definition-button"
);
const finalDefinitionPanel = document.querySelector(
  "#final-definition-panel"
);
const definitionCount = document.querySelector("#definition-count");
const definitionsList = document.querySelector("#definitions-list");
const closeActivityButton = document.querySelector(
  "#close-activity-button"
);
const closeMessage = document.querySelector("#close-message");
const closedPanel = document.querySelector("#closed-panel");

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
  facilitatorCode.focus();
}

function readableStatus(status) {
  const labels = {
    waiting: "En attente",
    question: "Question en cours",
    correction: "Correction",
    "final-definition": "Formulation finale",
    results: "Résultats",
    closed: "Clôturée"
  };

  return labels[status] || "En attente";
}

function renderSession(session) {
  currentSession = session;
  const participants = Object.entries(
    session.participants || {}
  );
  const numberOfParticipants = participants.length;

  participantCount.textContent = numberOfParticipants;
  participantCount.nextElementSibling.textContent =
    `participant${numberOfParticipants > 1 ? "s" : ""} connecté${numberOfParticipants > 1 ? "s" : ""}`;
  sessionStatus.textContent = readableStatus(session.status);
  connectionState.textContent = "Mise à jour en direct";

  const questionIsVisible =
    session.status === "question" ||
    session.status === "correction";

  waitingPanel.hidden = session.status !== "waiting";
  questionPanel.hidden = !questionIsVisible;
  finalDefinitionPanel.hidden =
    session.status !== "final-definition";
  closedPanel.hidden = session.status !== "closed";

  if (questionIsVisible) {
    const index = Number(session.currentQuestion) || 0;
    questionNumber.textContent =
      `Affirmation ${index + 1} sur ${QUESTIONS.length}`;
    questionText.textContent =
      session.questionText || QUESTIONS[index]?.text || "";

    const questionId = `q${index + 1}`;
    const attempt = Number(session.currentQuestionAttempt) || 1;
    const answers = participants
      .map(([, participant]) => participant.answers?.[questionId])
      .filter((answer) => answer?.attempt === attempt);
    const numberOfTrueAnswers = answers.filter(
      (answer) => answer.answer === true
    ).length;
    const numberOfFalseAnswers = answers.filter(
      (answer) => answer.answer === false
    ).length;
    const total = answers.length;
    const trueRate = total
      ? Math.round((numberOfTrueAnswers / total) * 100)
      : 0;
    const falseRate = total ? 100 - trueRate : 0;

    answerCount.textContent = total;
    answerCount.nextElementSibling.textContent =
      `réponse${total > 1 ? "s" : ""} reçue${total > 1 ? "s" : ""}`;
    trueCount.textContent = numberOfTrueAnswers;
    falseCount.textContent = numberOfFalseAnswers;
    truePercentage.textContent = `${trueRate} %`;
    falsePercentage.textContent = `${falseRate} %`;

    const correctionIsVisible =
      session.status === "correction" && session.correction;
    correctionBox.hidden = !correctionIsVisible;
    revealAnswerButton.hidden = correctionIsVisible;
    nextQuestionButton.hidden =
      !correctionIsVisible || index >= QUESTIONS.length - 1;
    startFinalDefinitionButton.hidden =
      !correctionIsVisible || index < QUESTIONS.length - 1;

    if (correctionIsVisible) {
      correctAnswer.textContent =
        session.correction.correctAnswer ? "Vrai" : "Faux";
      correctionExplanation.textContent =
        session.correction.explanation;
    }
  }

  if (session.status === "final-definition") {
    const definitions = participants
      .map(([, participant]) => participant)
      .filter((participant) => participant.finalDefinition)
      .sort(
        (a, b) =>
          (a.participantNumber || 0) - (b.participantNumber || 0)
      );

    definitionCount.textContent =
      `${definitions.length} réponse${definitions.length > 1 ? "s" : ""} reçue${definitions.length > 1 ? "s" : ""}`;
    definitionsList.replaceChildren();

    if (!definitions.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent =
        "Aucune formulation reçue pour le moment.";
      definitionsList.append(emptyState);
    } else {
      definitions.forEach((participant) => {
        const card = document.createElement("article");
        card.className = "definition-card";
        const label = document.createElement("strong");
        label.textContent =
          `Participant ${participant.participantNumber || "—"}`;
        const text = document.createElement("p");
        text.textContent = participant.finalDefinition;
        card.append(label, text);
        definitionsList.append(card);
      });
    }
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

  actionInProgress = true;
  startActivityButton.disabled = true;
  startActivityButton.textContent = "Lancement…";
  actionMessage.textContent = "";

  try {
    await update(ref(database, `sessions/${sessionCode}`), {
      status: "question",
      currentQuestion: 0,
      currentQuestionAttempt: 1,
      questionText: QUESTIONS[0].text,
      questionStartedAt: serverTimestamp(),
      correction: null,
      startedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Lancement impossible :", error);
    actionMessage.textContent =
      "L’activité n’a pas pu être lancée. Réessayez.";
  } finally {
    actionInProgress = false;
    startActivityButton.disabled = false;
    startActivityButton.textContent = "Commencer l’activité";
  }
}

async function revealAnswer() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.status !== "question"
  ) {
    return;
  }

  const index = Number(currentSession.currentQuestion) || 0;
  const question = QUESTIONS[index];
  actionInProgress = true;
  revealAnswerButton.disabled = true;
  questionActionMessage.textContent = "Révélation en cours…";

  try {
    await update(ref(database, `sessions/${sessionCode}`), {
      status: "correction",
      correction: {
        questionId: `q${index + 1}`,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        revealedAt: serverTimestamp()
      }
    });
    questionActionMessage.textContent = "";
  } catch (error) {
    console.error("Révélation impossible :", error);
    questionActionMessage.textContent =
      "La correction n’a pas pu être affichée.";
  } finally {
    actionInProgress = false;
    revealAnswerButton.disabled = false;
  }
}

async function showNextQuestion() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.status !== "correction"
  ) {
    return;
  }

  const currentIndex = Number(currentSession.currentQuestion) || 0;
  const nextIndex = currentIndex + 1;
  if (nextIndex >= QUESTIONS.length) return;

  actionInProgress = true;
  nextQuestionButton.disabled = true;
  questionActionMessage.textContent = "Chargement de l’affirmation…";

  try {
    await update(ref(database, `sessions/${sessionCode}`), {
      status: "question",
      currentQuestion: nextIndex,
      currentQuestionAttempt: 1,
      questionText: QUESTIONS[nextIndex].text,
      questionStartedAt: serverTimestamp(),
      correction: null
    });
    questionActionMessage.textContent = "";
  } catch (error) {
    console.error("Passage à l’affirmation impossible :", error);
    questionActionMessage.textContent =
      "L’affirmation suivante n’a pas pu être chargée.";
  } finally {
    actionInProgress = false;
    nextQuestionButton.disabled = false;
  }
}

async function startFinalDefinition() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.status !== "correction" ||
    Number(currentSession.currentQuestion) !== QUESTIONS.length - 1
  ) {
    return;
  }

  actionInProgress = true;
  startFinalDefinitionButton.disabled = true;
  questionActionMessage.textContent =
    "Ouverture de la formulation finale…";

  try {
    await update(ref(database, `sessions/${sessionCode}`), {
      status: "final-definition",
      correction: null,
      finalDefinitionStartedAt: serverTimestamp()
    });
    questionActionMessage.textContent = "";
  } catch (error) {
    console.error("Ouverture de la formulation impossible :", error);
    questionActionMessage.textContent =
      "La formulation finale n’a pas pu être ouverte.";
  } finally {
    actionInProgress = false;
    startFinalDefinitionButton.disabled = false;
  }
}

async function closeActivity() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.status !== "final-definition"
  ) {
    return;
  }

  const participants = Object.values(
    currentSession.participants || {}
  );
  const missingDefinitions = participants.filter(
    (participant) => !participant.finalDefinition
  ).length;
  const warning = missingDefinitions
    ? ` ${missingDefinitions} participant(s) n’ont pas encore envoyé leur formulation.`
    : "";
  const confirmed = window.confirm(
    `Clôturer définitivement l’activité ?${warning}`
  );

  if (!confirmed) return;

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
    closeActivityButton.textContent = "Clôturer l’activité";
  } finally {
    actionInProgress = false;
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

  const confidentialCode = facilitatorCode.value.trim();
  loginButton.disabled = true;
  loginButton.textContent = "Connexion…";
  loginMessage.textContent = "";

  try {
    await signInWithEmailAndPassword(
      auth,
      FACILITATOR_EMAIL,
      confidentialCode
    );
    loginForm.reset();
  } catch (error) {
    console.error("Connexion éducateur refusée :", error);
    loginMessage.textContent = "Le code confidentiel est incorrect.";
    facilitatorCode.select();
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Se connecter";
  }
});

startActivityButton.addEventListener("click", startActivity);
revealAnswerButton.addEventListener("click", revealAnswer);
nextQuestionButton.addEventListener("click", showNextQuestion);
startFinalDefinitionButton.addEventListener(
  "click",
  startFinalDefinition
);
closeActivityButton.addEventListener("click", closeActivity);

onAuthStateChanged(auth, (user) => {
  if (!user || user.isAnonymous) {
    showLogin();
    return;
  }

  openDashboard(user);
});
