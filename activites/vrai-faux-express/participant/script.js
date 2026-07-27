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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const loadingScreen = document.querySelector("#loading-screen");
const errorScreen = document.querySelector("#error-screen");
const waitingScreen = document.querySelector("#waiting-screen");
const nextStepScreen = document.querySelector("#next-step-screen");
const answerSavedScreen = document.querySelector(
  "#answer-saved-screen"
);
const correctionScreen = document.querySelector("#correction-screen");
const finalDefinitionScreen = document.querySelector(
  "#final-definition-screen"
);
const definitionSavedScreen = document.querySelector(
  "#definition-saved-screen"
);
const closedScreen = document.querySelector("#closed-screen");

const errorMessage = document.querySelector("#error-message");
const participantLabel = document.querySelector("#participant-label");
const displayedSessionCode = document.querySelector(
  "#displayed-session-code"
);
const questionProgress = document.querySelector("#question-progress");
const participantQuestionText = document.querySelector(
  "#participant-question-text"
);
const trueButton = document.querySelector("#true-button");
const falseButton = document.querySelector("#false-button");
const answerMessage = document.querySelector("#answer-message");
const savedAnswer = document.querySelector("#saved-answer");
const correctionProgress = document.querySelector(
  "#correction-progress"
);
const correctAnswerBadge = document.querySelector(
  "#correct-answer-badge"
);
const participantAnswer = document.querySelector(
  "#participant-answer"
);
const answerResult = document.querySelector("#answer-result");
const participantExplanation = document.querySelector(
  "#participant-explanation"
);
const finalDefinitionForm = document.querySelector(
  "#final-definition-form"
);
const finalDefinition = document.querySelector("#final-definition");
const definitionCharacterCount = document.querySelector(
  "#definition-character-count"
);
const submitDefinitionButton = document.querySelector(
  "#submit-definition-button"
);
const definitionMessage = document.querySelector(
  "#definition-message"
);

let currentUser = null;
let sessionCode = "";
let stopSessionListener = null;
let answerInProgress = false;
let pendingAnswer = null;
let definitionInProgress = false;
let currentSession = null;
let stateRefreshInProgress = false;

function showOnly(screen) {
  [
    loadingScreen,
    errorScreen,
    waitingScreen,
    nextStepScreen,
    answerSavedScreen,
    correctionScreen,
    finalDefinitionScreen,
    definitionSavedScreen,
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

async function registerParticipant() {
  const sessionReference = ref(
    database,
    `sessions/${sessionCode}`
  );

  const transactionResult = await runTransaction(
    sessionReference,
    (session) => {
      if (!session || !currentUser) {
        return session;
      }

      session.participants ||= {};
      const existingParticipant =
        session.participants[currentUser.uid];

      if (existingParticipant?.participantNumber) {
        return session;
      }

      const nextNumber = (session.nextParticipantNumber || 0) + 1;
      session.nextParticipantNumber = nextNumber;
      session.participants[currentUser.uid] = {
        ...existingParticipant,
        participantNumber: nextNumber,
        joinedAt: existingParticipant?.joinedAt || serverTimestamp(),
        status: "waiting"
      };

      return session;
    }
  );

  if (!transactionResult.committed) {
    throw new Error("Inscription du participant non enregistrée.");
  }

  return transactionResult.snapshot
    .val()
    .participants[currentUser.uid];
}

function renderParticipant(participant) {
  participantLabel.textContent =
    `Participant ${participant.participantNumber}`;
  displayedSessionCode.textContent = sessionCode;
}

function renderSession(session) {
  currentSession = session;
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

  if (session.status === "final-definition") {
    showOnly(
      participant?.finalDefinition
        ? definitionSavedScreen
        : finalDefinitionScreen
    );
    return;
  }

  const questionIndex = Number(session.currentQuestion) || 0;
  const questionId = `q${questionIndex + 1}`;
  const attempt = Number(session.currentQuestionAttempt) || 1;
  const serverAnswer = participant?.answers?.[questionId];
  const localAnswer =
    pendingAnswer?.questionId === questionId &&
    pendingAnswer?.attempt === attempt
      ? pendingAnswer
      : null;
  const existingAnswer = serverAnswer || localAnswer;

  if (serverAnswer?.attempt === attempt) {
    pendingAnswer = null;
    answerInProgress = false;
  }
  questionProgress.textContent =
    `Affirmation ${questionIndex + 1} sur 8`;
  participantQuestionText.textContent =
    session.questionText || "Affirmation en cours…";

  if (session.status === "correction" && session.correction) {
    const givenAnswer = existingAnswer?.answer;
    const goodAnswer = session.correction.correctAnswer;
    correctionProgress.textContent =
      `Affirmation ${questionIndex + 1} sur 8`;
    correctAnswerBadge.textContent = goodAnswer ? "Vrai" : "Faux";
    participantAnswer.textContent =
      givenAnswer === true
        ? "Vrai"
        : givenAnswer === false
          ? "Faux"
          : "Aucune réponse";
    const isCorrect = givenAnswer === goodAnswer;
    answerResult.textContent = isCorrect
      ? "Bonne réponse !"
      : givenAnswer === undefined
        ? "Tu n’avais pas répondu."
        : "Ce n’était pas la bonne réponse.";
    answerResult.className =
      `answer-result ${isCorrect ? "correct" : "incorrect"}`;
    participantExplanation.textContent =
      session.correction.explanation;
    showOnly(correctionScreen);
    return;
  }

  if (
    session.status === "question" &&
    existingAnswer?.attempt === attempt
  ) {
    savedAnswer.textContent =
      existingAnswer.answer === true ? "Vrai" : "Faux";
    showOnly(answerSavedScreen);
    return;
  }

  showOnly(nextStepScreen);
}

function submitAnswer(answer) {
  if (
    answerInProgress ||
    !currentUser ||
    !currentSession ||
    currentSession.status !== "question"
  ) {
    return;
  }

  const questionIndex =
    Number(currentSession.currentQuestion) || 0;
  const questionId = `q${questionIndex + 1}`;
  const attempt =
    Number(currentSession.currentQuestionAttempt) || 1;

  const existingAnswer =
    currentSession.participants?.[currentUser.uid]
      ?.answers?.[questionId];

  if (existingAnswer?.attempt === attempt) {
    savedAnswer.textContent =
      existingAnswer.answer ? "Vrai" : "Faux";
    showOnly(answerSavedScreen);
    return;
  }

  answerInProgress = true;
  pendingAnswer = {
    questionId,
    attempt,
    answer
  };
  savedAnswer.textContent = answer ? "Vrai" : "Faux";
  answerMessage.textContent = "";
  nextStepScreen.hidden = true;
  answerSavedScreen.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });

  const answerReference = ref(
    database,
    `sessions/${sessionCode}/participants/${currentUser.uid}/answers/${questionId}`
  );

  update(answerReference, {
      answer,
      attempt,
      answeredAt: serverTimestamp()
    })
    .catch((error) => {
    console.error("Enregistrement de la réponse impossible :", error);
    pendingAnswer = null;
    answerInProgress = false;
    answerMessage.textContent =
      error.message || "La réponse n’a pas pu être enregistrée.";
    trueButton.disabled = false;
    falseButton.disabled = false;
    showOnly(nextStepScreen);
  });
}

trueButton.addEventListener("click", () => submitAnswer(true));
falseButton.addEventListener("click", () => submitAnswer(false));

finalDefinition.addEventListener("input", () => {
  definitionCharacterCount.textContent =
    `${finalDefinition.value.length} / 300`;
  definitionMessage.textContent = "";
});

finalDefinitionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = finalDefinition.value.trim();
  if (text.length < 10) {
    definitionMessage.textContent =
      "Écris une phrase un peu plus complète.";
    finalDefinition.focus();
    return;
  }

  if (
    definitionInProgress ||
    !currentUser ||
    currentSession?.status !== "final-definition"
  ) {
    return;
  }

  definitionInProgress = true;
  submitDefinitionButton.disabled = true;
  submitDefinitionButton.textContent = "Envoi…";
  definitionMessage.textContent = "";

  try {
    const participantReference = ref(
      database,
      `sessions/${sessionCode}/participants/${currentUser.uid}`
    );
    const participant =
      currentSession.participants?.[currentUser.uid];

    if (!participant || participant.finalDefinition) {
      throw new Error("Une réponse a déjà été enregistrée.");
    }

    const writePromise = update(participantReference, {
      finalDefinition: text,
      finalDefinitionSubmittedAt: serverTimestamp(),
      status: "final-definition-submitted"
    });

    finalDefinitionForm.reset();
    definitionCharacterCount.textContent = "0 / 300";
    showOnly(definitionSavedScreen);
    await writePromise;
  } catch (error) {
    console.error("Envoi de la formulation impossible :", error);
    definitionMessage.textContent =
      error.message || "La réponse n’a pas pu être envoyée.";
    submitDefinitionButton.disabled = false;
  } finally {
    definitionInProgress = false;
    submitDefinitionButton.textContent = "Envoyer ma réponse";
  }
});

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

async function refreshSessionState() {
  if (
    stateRefreshInProgress ||
    answerInProgress ||
    definitionInProgress ||
    !currentUser ||
    sessionCode.length !== 6
  ) {
    return;
  }

  stateRefreshInProgress = true;

  try {
    const snapshot = await get(
      ref(database, `sessions/${sessionCode}`)
    );

    if (snapshot.exists()) {
      renderSession(snapshot.val());
    }
  } catch (error) {
    console.warn(
      "Actualisation automatique de l’état impossible :",
      error
    );
  } finally {
    stateRefreshInProgress = false;
  }
}

window.addEventListener("focus", refreshSessionState);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshSessionState();
  }
});

window.addEventListener("online", () => {
  listenToSession();
  refreshSessionState();
});

async function loadActivity() {
  showOnly(loadingScreen);
  sessionCode = readSessionCode();

  if (sessionCode.length !== 6) {
    showError(
      "Le code de session est absent ou incorrect. Rejoins à nouveau l’activité depuis la page d’accueil."
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

    const participant = await registerParticipant();
    renderParticipant(participant);
    listenToSession();
  } catch (error) {
    console.error("Connexion à l’activité impossible :", error);
    showError(
      "La connexion à l’activité a échoué. Vérifie ta connexion puis réessaie."
    );
  }
}

loadActivity();
