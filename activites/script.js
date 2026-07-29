import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
  set,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";


/* Configuration Firebase */

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


/* Initialisation de Firebase */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);


/* Compte technique de l’éducateur */

const facilitatorEmail = "prevention.dopage@ffc.fr";


/*
 * Chemins des activités.
 *
 * Modifie ces chemins uniquement si les fichiers des activités
 * se trouvent dans d’autres dossiers.
 */

const activityRoutes = {
  "podium-valeurs": {
    participant:
      "podium-valeurs/participant/index.html",
    facilitator:
      "podium-valeurs/educateur/index.html"
  },
  "vrai-faux-express": {
    participant:
      "vrai-faux-express/participant/index.html",
    facilitator:
      "vrai-faux-express/educateur/index.html"
  },
  "mission-controle": {
    participant:
      "mission-controle/participant/index.html",
    facilitator:
      "mission-controle/educateur/index.html"
  },
  "produit-mystere": {
    participant:
      "produit-mystere/participant/index.html",
    facilitator:
      "produit-mystere/educateur/index.html"
  },
  "traitement-controle": {
    participant:
      "traitement-controle/participant/index.html",
    facilitator:
      "traitement-controle/educateur/index.html"
  },
  "responsabilite-objective": {
    participant:
      "responsabilite-objective/participant/index.html",
    facilitator:
      "responsabilite-objective/educateur/index.html"
  }
};


/* Éléments généraux de la page */

const modeSelection = document.querySelector("#mode-selection");

const participantButton = document.querySelector(
  "#participant-button"
);

const facilitatorButton = document.querySelector(
  "#facilitator-button"
);

const playerChoicePanel = document.querySelector(
  "#player-choice-panel"
);

const playerChoiceBackButton = document.querySelector(
  "#player-choice-back-button"
);

const joinActivityChoiceButton = document.querySelector(
  "#join-activity-choice-button"
);

const statusPanel = document.querySelector("#status-panel");
const statusMessage = document.querySelector("#status-message");


/* Éléments du parcours participant */

const participantPanel = document.querySelector(
  "#participant-panel"
);

const participantBackButton = document.querySelector(
  "#participant-back-button"
);

const participantForm = document.querySelector(
  "#participant-form"
);

const participantSessionCode = document.querySelector(
  "#participant-session-code"
);

const joinSessionButton = document.querySelector(
  "#join-session-button"
);

const participantError = document.querySelector(
  "#participant-error"
);


/* Éléments du choix de l’activité */

const activitySelectionPanel = document.querySelector(
  "#activity-selection-panel"
);

const activitySelectionBackButton = document.querySelector(
  "#activity-selection-back-button"
);

const activityCards = document.querySelectorAll(
  ".activity-card"
);


/* Éléments de connexion éducateur */

const facilitatorLoginPanel = document.querySelector(
  "#facilitator-login-panel"
);

const facilitatorLoginBackButton = document.querySelector(
  "#facilitator-login-back-button"
);

const facilitatorLoginForm = document.querySelector(
  "#facilitator-login-form"
);

const facilitatorSecretCode = document.querySelector(
  "#facilitator-secret-code"
);

const validateFacilitatorCodeButton = document.querySelector(
  "#validate-facilitator-code-button"
);

const facilitatorLoginError = document.querySelector(
  "#facilitator-login-error"
);

const selectedActivityLogin = document.querySelector(
  "#selected-activity-login"
);


/* Éléments de création de session */

const facilitatorPanel = document.querySelector(
  "#facilitator-panel"
);

const facilitatorBackButton = document.querySelector(
  "#facilitator-back-button"
);

const selectedActivitySession = document.querySelector(
  "#selected-activity-session"
);

const createSessionButton = document.querySelector(
  "#create-session-button"
);

const sessionCreated = document.querySelector(
  "#session-created"
);

const sessionCode = document.querySelector("#session-code");
const openFacilitatorDashboardButton = document.querySelector(
  "#open-facilitator-dashboard-button"
);


/* État actuel de l’application */

let currentUser = null;

let selectedActivityId = null;
let selectedActivityName = null;


/* Messages généraux */

function showStatus(message) {
  statusMessage.textContent = message;
  statusPanel.hidden = false;
}

function hideStatus() {
  statusMessage.textContent = "";
  statusPanel.hidden = true;
}


/* Erreur du formulaire participant */

function showParticipantError(message) {
  participantError.textContent = message;
  participantError.hidden = false;
}

function hideParticipantError() {
  participantError.textContent = "";
  participantError.hidden = true;
}


/* Erreur du formulaire éducateur */

function showLoginError(message) {
  facilitatorLoginError.textContent = message;
  facilitatorLoginError.hidden = false;
}

function hideLoginError() {
  facilitatorLoginError.textContent = "";
  facilitatorLoginError.hidden = true;
}


/* Vérification du compte éducateur */

function userIsFacilitator(user = currentUser) {
  if (!user || !user.email) {
    return false;
  }

  return user.email.toLowerCase() === facilitatorEmail.toLowerCase();
}


/* Navigation entre les panneaux */

function hideAllPanels() {
  modeSelection.hidden = true;
  playerChoicePanel.hidden = true;
  participantPanel.hidden = true;
  activitySelectionPanel.hidden = true;
  facilitatorLoginPanel.hidden = true;
  facilitatorPanel.hidden = true;
}

function showModeSelection() {
  hideAllPanels();

  modeSelection.hidden = false;
  sessionCreated.hidden = true;

  participantForm.reset();
  facilitatorLoginForm.reset();

  selectedActivityId = null;
  selectedActivityName = null;

  hideParticipantError();
  hideLoginError();
  hideStatus();
}

function showPlayerChoicePanel() {
  hideAllPanels();

  playerChoicePanel.hidden = false;

  hideParticipantError();
  hideStatus();
}

function showParticipantPanel() {
  hideAllPanels();

  participantPanel.hidden = false;
  participantForm.reset();

  hideParticipantError();
  hideStatus();

  participantSessionCode.focus();
}

function showActivitySelectionPanel() {
  hideAllPanels();

  activitySelectionPanel.hidden = false;
  sessionCreated.hidden = true;

  hideLoginError();
  hideStatus();
}

function showFacilitatorLoginPanel() {
  if (!selectedActivityId || !selectedActivityName) {
    showActivitySelectionPanel();
    return;
  }

  hideAllPanels();

  facilitatorLoginPanel.hidden = false;
  selectedActivityLogin.textContent = selectedActivityName;

  facilitatorLoginForm.reset();

  hideLoginError();
  hideStatus();

  facilitatorSecretCode.focus();
}

function showFacilitatorPanel() {
  if (!selectedActivityId || !selectedActivityName) {
    showActivitySelectionPanel();
    return;
  }

  hideAllPanels();

  facilitatorPanel.hidden = false;
  selectedActivitySession.textContent = selectedActivityName;

  sessionCreated.hidden = true;
  createSessionButton.textContent = "Créer une nouvelle session";

  hideLoginError();
  hideStatus();
}


/* Connexion anonyme des participants */

async function connectAnonymouslyIfNeeded() {
  if (auth.currentUser) {
    currentUser = auth.currentUser;
    return auth.currentUser;
  }

  try {
    const credential = await signInAnonymously(auth);

    currentUser = credential.user;

    return credential.user;
  } catch (error) {
    console.error(
      "Erreur de connexion anonyme :",
      error
    );

    showStatus(
      "La connexion aux activités est momentanément impossible."
    );

    return null;
  }
}


/* Formatage du code saisi par le participant */

function normalizeSessionCode(value) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}


/* Génération sécurisée d’un code de session */

function generateSessionCode() {
  const allowedCharacters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const randomValues = new Uint32Array(6);
  crypto.getRandomValues(randomValues);

  let code = "";

  for (let index = 0; index < randomValues.length; index += 1) {
    const characterIndex =
      randomValues[index] % allowedCharacters.length;

    code += allowedCharacters[characterIndex];
  }

  return code;
}


/* Vérification de la disponibilité du code */

async function generateUniqueSessionCode() {
  const maximumAttempts = 20;

  for (
    let attempt = 0;
    attempt < maximumAttempts;
    attempt += 1
  ) {
    const code = generateSessionCode();

    const sessionReference = ref(
      database,
      `sessions/${code}`
    );

    const sessionSnapshot = await get(sessionReference);

    if (!sessionSnapshot.exists()) {
      return code;
    }
  }

  throw new Error(
    "Impossible de générer un code de session disponible."
  );
}


/* Sélection d’une activité par l’éducateur */

function selectActivity(event) {
  const activityCard = event.currentTarget;

  selectedActivityId = activityCard.dataset.activityId;
  selectedActivityName = activityCard.dataset.activityName;

  if (!selectedActivityId || !selectedActivityName) {
    showStatus(
      "Cette activité n’est pas correctement configurée."
    );

    return;
  }

  if (userIsFacilitator()) {
    showFacilitatorPanel();
    return;
  }

  showFacilitatorLoginPanel();
}


/* Vérification du code confidentiel éducateur */

async function validateFacilitatorCode(event) {
  event.preventDefault();

  const confidentialCode =
    facilitatorSecretCode.value.trim();

  if (!confidentialCode) {
    showLoginError(
      "Veuillez saisir le code confidentiel."
    );

    return;
  }

  validateFacilitatorCodeButton.disabled = true;
  validateFacilitatorCodeButton.textContent =
    "Vérification…";

  hideLoginError();
  hideStatus();

  try {
    /*
     * Si un participant anonyme est actuellement connecté,
     * signInWithEmailAndPassword remplace sa session par celle
     * du compte éducateur.
     */

    const credential = await signInWithEmailAndPassword(
      auth,
      facilitatorEmail,
      confidentialCode
    );

    currentUser = credential.user;

    facilitatorLoginForm.reset();
    showFacilitatorPanel();
  } catch (error) {
    console.error(
      "Accès éducateur refusé :",
      error
    );

    showLoginError(
      "Le code confidentiel est incorrect. Veuillez réessayer."
    );

    facilitatorSecretCode.select();
  } finally {
    validateFacilitatorCodeButton.disabled = false;
    validateFacilitatorCodeButton.textContent = "Valider";
  }
}


/* Création d’une session */

async function createSession() {
  if (!userIsFacilitator()) {
    showStatus(
      "Votre accès éducateur n’est plus actif. " +
      "Veuillez vous reconnecter."
    );

    showFacilitatorLoginPanel();
    return;
  }

  if (!selectedActivityId || !selectedActivityName) {
    showStatus(
      "Veuillez d’abord sélectionner une activité."
    );

    showActivitySelectionPanel();
    return;
  }

  createSessionButton.disabled = true;
  createSessionButton.textContent =
    "Création en cours…";

  sessionCreated.hidden = true;
  hideStatus();

  try {
    const code = await generateUniqueSessionCode();

    const sessionReference = ref(
      database,
      `sessions/${code}`
    );

    await set(sessionReference, {
      activity: selectedActivityId,
      activityName: selectedActivityName,
      facilitatorId: currentUser.uid,
      status: "waiting",
      createdAt: serverTimestamp()
    });

    sessionCode.textContent = code;
    sessionCreated.hidden = false;

    createSessionButton.textContent =
      "Créer une autre session";
  } catch (error) {
    console.error(
      "Erreur lors de la création de la session :",
      error
    );

    showStatus(
      "La session n’a pas pu être créée. " +
      "Vérifiez la connexion à Firebase."
    );

    createSessionButton.textContent =
      "Créer une nouvelle session";
  } finally {
    createSessionButton.disabled = false;
  }
}


/* Accès participant à une session */

async function joinSession(event) {
  event.preventDefault();

  const code = normalizeSessionCode(
    participantSessionCode.value
  );

  participantSessionCode.value = code;

  if (code.length !== 6) {
    showParticipantError(
      "Le code de session doit contenir 6 caractères."
    );

    participantSessionCode.focus();
    return;
  }

  joinSessionButton.disabled = true;
  joinSessionButton.textContent =
    "Connexion en cours…";

  hideParticipantError();
  hideStatus();

  try {
    if (!auth.currentUser || !auth.currentUser.isAnonymous) {
      await signOut(auth);
      await connectAnonymouslyIfNeeded();
    }

    const sessionReference = ref(
      database,
      `sessions/${code}`
    );

    const sessionSnapshot = await get(sessionReference);

    if (!sessionSnapshot.exists()) {
      showParticipantError(
        "Ce code ne correspond à aucune session."
      );

      participantSessionCode.select();
      return;
    }

    const session = sessionSnapshot.val();

    const participantCount = Object.keys(
      session.participants || {}
    ).length;

    if (
      participantCount >= 30 &&
      !session.participants?.[auth.currentUser.uid]
    ) {
      showParticipantError(
        "Cette session a atteint sa limite de 30 participants."
      );
      return;
    }

    const groupsAreFull =
      session.groupsLocked &&
      Object.values(session.groups || {}).every(
        (group) => Object.keys(group.members || {}).length >= 3
      );

    if (
      groupsAreFull &&
      !session.participants?.[auth.currentUser.uid]
    ) {
      showParticipantError(
        "Les groupes sont déjà complets. Adressez-vous à l’éducateur."
      );
      return;
    }

    if (session.status === "closed") {
      showParticipantError(
        "Cette session est terminée."
      );

      return;
    }

    const existingParticipant =
      session.participants?.[auth.currentUser.uid];
    const productMysteryIsLocked =
      session.activity === "produit-mystere" &&
      session.modeLocked;
    const treatmentControlIsLocked =
      session.activity === "traitement-controle" &&
      session.modeLocked;

    if (
      (productMysteryIsLocked || treatmentControlIsLocked) &&
      !existingParticipant
    ) {
      showParticipantError(
        "Le mode de participation est déjà verrouillé. " +
        "Adressez-vous à l’éducateur."
      );
      return;
    }

    const accessibleStatuses = [
      "waiting",
      "active",
      "groups-formed"
    ];

    if (
      session.activity === "produit-mystere"
    ) {
      accessibleStatuses.push("grouping");
      if (existingParticipant) {
        accessibleStatuses.push(
          "participation-ready",
          "group-device-selection",
          "investigation",
          "investigation-correction",
          "final-decision",
          "results"
        );
      }
    }

    if (
      session.activity === "traitement-controle" &&
      existingParticipant
    ) {
      accessibleStatuses.push(
        "participation-ready",
        "group-device-selection",
        "pathway"
      );
    }

    if (
      session.activity === "responsabilite-objective" &&
      existingParticipant
    ) {
      accessibleStatuses.push("activity", "review", "final");
    }

    if (!accessibleStatuses.includes(session.status)) {
      showParticipantError(
        "Cette session n’est pas accessible actuellement."
      );

      return;
    }

    const route = activityRoutes[session.activity];

    if (!route || !route.participant) {
      showParticipantError(
        "L’activité associée à cette session est indisponible."
      );

      return;
    }

    const participantReference = ref(
      database,
      `sessions/${code}/participants/${auth.currentUser.uid}`
    );

    if (!existingParticipant) {
      await set(participantReference, {
        joinedAt: serverTimestamp(),
        status: "connected"
      });
    }

    const destination = new URL(
      route.participant,
      window.location.href
    );

    destination.searchParams.set("session", code);

    window.location.href = destination.href;
  } catch (error) {
    console.error(
      "Erreur lors de l’accès à la session :",
      error
    );

    showParticipantError(
      "La session n’a pas pu être rejointe. " +
      "Veuillez réessayer."
    );
  } finally {
    joinSessionButton.disabled = false;
    joinSessionButton.textContent =
      "Rejoindre l’activité";
  }
}


/* Retour depuis l’espace éducateur */

async function leaveFacilitatorArea() {
  sessionCreated.hidden = true;

  try {
    if (auth.currentUser) {
      await signOut(auth);
    }

    await connectAnonymouslyIfNeeded();
  } catch (error) {
    console.error(
      "Erreur lors de la déconnexion :",
      error
    );
  }

  showActivitySelectionPanel();
}


/* Suivi de l’authentification Firebase */

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (!user) {
    await connectAnonymouslyIfNeeded();
  }
});


/* Formatage automatique du code participant */

participantSessionCode.addEventListener("input", () => {
  participantSessionCode.value = normalizeSessionCode(
    participantSessionCode.value
  );

  hideParticipantError();
});


/* Boutons de sélection du profil */

participantButton.addEventListener(
  "click",
  showPlayerChoicePanel
);

facilitatorButton.addEventListener(
  "click",
  showActivitySelectionPanel
);


/* Parcours participant */

playerChoiceBackButton.addEventListener(
  "click",
  showModeSelection
);

joinActivityChoiceButton.addEventListener(
  "click",
  showParticipantPanel
);

participantBackButton.addEventListener(
  "click",
  showPlayerChoicePanel
);

participantForm.addEventListener(
  "submit",
  joinSession
);


/* Choix de l’activité */

activitySelectionBackButton.addEventListener(
  "click",
  showModeSelection
);

activityCards.forEach((activityCard) => {
  activityCard.addEventListener(
    "click",
    selectActivity
  );
});


/* Parcours éducateur */

facilitatorLoginBackButton.addEventListener(
  "click",
  showActivitySelectionPanel
);

facilitatorLoginForm.addEventListener(
  "submit",
  validateFacilitatorCode
);

facilitatorBackButton.addEventListener(
  "click",
  leaveFacilitatorArea
);

createSessionButton.addEventListener(
  "click",
  createSession
);

openFacilitatorDashboardButton.addEventListener("click", () => {
  const code = sessionCode.textContent.trim();
  const route = activityRoutes[selectedActivityId];

  if (!code || !route?.facilitator) {
    showStatus("Le tableau de bord n’est pas disponible.");
    return;
  }

  const destination = new URL(
    route.facilitator,
    window.location.href
  );

  destination.searchParams.set("session", code);
  window.location.href = destination.href;
});
