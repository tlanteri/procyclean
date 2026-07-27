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

const ACTIVITY_ID = "traitement-controle";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const loadingScreen = document.querySelector("#loading-screen");
const errorScreen = document.querySelector("#error-screen");
const waitingScreen = document.querySelector("#waiting-screen");
const readyScreen = document.querySelector("#ready-screen");
const closedScreen = document.querySelector("#closed-screen");
const errorMessage = document.querySelector("#error-message");
const displayedSessionCode = document.querySelector(
  "#displayed-session-code"
);
const connectionMessage = document.querySelector(
  "#connection-message"
);
const participantNumber = document.querySelector("#participant-number");
const readyTitle = document.querySelector("#ready-title");
const modeMessage = document.querySelector("#mode-message");
const groupMembers = document.querySelector("#group-members");
const claimDeviceButton = document.querySelector(
  "#claim-device-button"
);
const deviceMessage = document.querySelector("#device-message");
const readyInstruction = document.querySelector("#ready-instruction");
const situationScreen = document.querySelector("#situation-screen");
const answerSentScreen = document.querySelector("#answer-sent-screen");
const situationForm = document.querySelector("#situation-form");
const submitSituationButton = document.querySelector(
  "#submit-situation-button"
);
const situationMessage = document.querySelector("#situation-message");

let currentUser = null;
let stopSessionListener = null;
let currentSession = null;
let deviceClaimInProgress = false;
let answerSubmissionInProgress = false;

function showOnly(screen) {
  [
    loadingScreen,
    errorScreen,
    waitingScreen,
    readyScreen,
    situationScreen,
    answerSentScreen,
    closedScreen
  ].forEach((currentScreen) => {
    currentScreen.hidden = currentScreen !== screen;
  });
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
    const stopListening = onAuthStateChanged(
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

function showError(message) {
  errorMessage.textContent = message;
  connectionMessage.textContent = "";
  stopSessionListener?.();
  showOnly(errorScreen);
}

function renderSession(session) {
  currentSession = session;
  if (session.status === "closed") {
    showOnly(closedScreen);
    return;
  }

  if (!session.participants?.[currentUser.uid]) {
    showError(
      "Ton inscription n’est pas disponible dans cette session. " +
      "Rejoins-la depuis la page des activités."
    );
    return;
  }

  const participant = session.participants[currentUser.uid];
  const group = session.groups?.[participant.groupId];
  const workUnit = session.participationMode === "group"
    ? group
    : participant;
  const canAnswer =
    session.participationMode !== "group" ||
    group?.activeDeviceParticipantId === currentUser.uid;

  if (session.status === "pathway") {
    if (!canAnswer) {
      readyTitle.textContent =
        `Parcours en cours sur le téléphone du groupe ${participant.groupNumber}`;
      modeMessage.textContent =
        "Reste avec ton groupe et participe à la discussion collective.";
      groupMembers.hidden = true;
      claimDeviceButton.hidden = true;
      deviceMessage.textContent = "";
      readyInstruction.textContent =
        "La réponse est saisie sur le téléphone choisi.";
      showOnly(readyScreen);
      return;
    }
    if (workUnit?.firstSituation?.submittedAt) {
      showOnly(answerSentScreen);
      return;
    }
    showOnly(situationScreen);
    return;
  }

  if (session.modeLocked && participant.participantNumber) {
    participantNumber.textContent = participant.participantNumber;
    if (session.participationMode === "group") {
      const group = session.groups?.[participant.groupId];
      readyTitle.textContent =
        `Tu es dans le groupe ${participant.groupNumber}`;
      modeMessage.textContent =
        "Retrouve les cyclistes qui portent le même numéro de groupe.";
      const memberNumbers = Object.keys(group?.members || {})
        .map((uid) =>
          session.participants?.[uid]?.participantNumber
        )
        .filter(Boolean)
        .sort((first, second) => first - second);
      groupMembers.hidden = false;
      groupMembers.textContent =
        `Votre groupe : ${memberNumbers.map(
          (number) => `Cycliste ${number}`
        ).join(" · ")}.`;
      const activeDeviceId = group?.activeDeviceParticipantId;
      claimDeviceButton.hidden = Boolean(activeDeviceId);
      claimDeviceButton.disabled = deviceClaimInProgress;
      if (activeDeviceId === currentUser.uid) {
        deviceMessage.textContent =
          "Ce téléphone a été choisi pour le parcours collectif.";
        readyInstruction.textContent =
          "Gardez ce téléphone avec le groupe et attendez le signal de l’éducateur.";
      } else if (activeDeviceId) {
        const activeNumber =
          session.participants?.[activeDeviceId]?.participantNumber;
        deviceMessage.textContent = activeNumber
          ? `Le téléphone du Cycliste ${activeNumber} a été choisi.`
          : "Un autre téléphone du groupe a été choisi.";
        readyInstruction.textContent =
          "Reste avec ton groupe et participe à la discussion.";
      } else {
        deviceMessage.textContent =
          "Choisissez ensemble le téléphone à utiliser.";
        readyInstruction.textContent =
          "Un seul téléphone doit être sélectionné par groupe.";
      }
    } else {
      groupMembers.hidden = true;
      claimDeviceButton.hidden = true;
      deviceMessage.textContent = "";
      readyTitle.textContent = "Mode individuel";
      modeMessage.textContent =
        "Tu réaliseras le parcours sur ton propre téléphone.";
    }
    showOnly(readyScreen);
    return;
  }

  connectionMessage.textContent =
    "Connexion en temps réel active. Attends les consignes de l’éducateur.";
  showOnly(waitingScreen);
}

async function submitFirstSituation(event) {
  event.preventDefault();
  if (answerSubmissionInProgress || !currentSession) return;
  const answer = new FormData(situationForm).get("first-answer");
  if (!answer) {
    situationMessage.textContent = "Choisis une réponse.";
    return;
  }
  const participant =
    currentSession.participants?.[currentUser.uid];
  const group = currentSession.groups?.[participant?.groupId];
  const collective =
    currentSession.participationMode === "group";
  if (
    collective &&
    group?.activeDeviceParticipantId !== currentUser.uid
  ) {
    situationMessage.textContent =
      "La réponse doit être validée sur le téléphone choisi.";
    return;
  }
  const unitPath = collective
    ? `groups/${group.id}`
    : `participants/${currentUser.uid}`;

  answerSubmissionInProgress = true;
  submitSituationButton.disabled = true;
  situationMessage.textContent = "Enregistrement…";
  try {
    await update(
      ref(
        database,
        `sessions/${readSessionCode()}/${unitPath}/firstSituation`
      ),
      {
        answer,
        submittedAt: serverTimestamp(),
        submittedBy: currentUser.uid
      }
    );
    showOnly(answerSentScreen);
  } catch (error) {
    console.error("Enregistrement de la réponse impossible :", error);
    situationMessage.textContent =
      "La réponse n’a pas pu être enregistrée. Réessaie.";
  } finally {
    answerSubmissionInProgress = false;
    submitSituationButton.disabled = false;
  }
}

async function claimActiveDevice() {
  if (
    deviceClaimInProgress ||
    !currentSession?.modeLocked ||
    currentSession.participationMode !== "group"
  ) {
    return;
  }
  const participant =
    currentSession.participants?.[currentUser.uid];
  const group = currentSession.groups?.[participant?.groupId];
  if (!group?.members?.[currentUser.uid]) return;

  deviceClaimInProgress = true;
  claimDeviceButton.disabled = true;
  deviceMessage.textContent = "Sélection en cours…";
  const deviceReference = ref(
    database,
    `sessions/${readSessionCode()}/groups/${group.id}/activeDeviceParticipantId`
  );

  try {
    const result = await runTransaction(
      deviceReference,
      (currentId) => currentId == null
        ? currentUser.uid
        : undefined
    );
    if (result.committed) {
      await update(
        ref(
          database,
          `sessions/${readSessionCode()}/groups/${group.id}`
        ),
        {
          status: "active-device-selected",
          activeDeviceClaimedAt: serverTimestamp()
        }
      );
    }
  } catch (error) {
    console.error("Choix du téléphone impossible :", error);
    deviceMessage.textContent =
      "Le téléphone n’a pas pu être enregistré. Réessaie.";
  } finally {
    deviceClaimInProgress = false;
    claimDeviceButton.disabled = false;
  }
}

function listenToSession(sessionCode) {
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
      showError(
        "La synchronisation avec la session a été interrompue."
      );
    }
  );
}

async function loadActivity() {
  showOnly(loadingScreen);
  const sessionCode = readSessionCode();
  displayedSessionCode.textContent = sessionCode || "—";

  if (sessionCode.length !== 6) {
    showError(
      "Le code de session est absent ou incorrect. Rejoins " +
      "l’activité depuis le portail."
    );
    return;
  }

  try {
    currentUser = await waitForAuthentication();
    const snapshot = await get(
      ref(database, `sessions/${sessionCode}`)
    );

    if (!snapshot.exists()) {
      showError("Cette session n’existe pas ou n’est plus disponible.");
      return;
    }

    const session = snapshot.val();
    if (session.activity !== ACTIVITY_ID) {
      showError("Ce code correspond à une autre activité.");
      return;
    }

    if (!session.participants?.[currentUser.uid]) {
      showError(
        "Ton inscription n’est pas disponible dans cette session. " +
        "Rejoins-la depuis la page des activités."
      );
      return;
    }

    listenToSession(sessionCode);
  } catch (error) {
    console.error("Connexion à l’activité impossible :", error);
    showError(
      "La connexion à l’activité a échoué. Vérifie ta connexion puis réessaie."
    );
  }
}

loadActivity();

claimDeviceButton.addEventListener("click", claimActiveDevice);
situationForm.addEventListener("submit", submitFirstSituation);
