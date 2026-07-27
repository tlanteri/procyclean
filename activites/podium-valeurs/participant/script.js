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
  update,
  onValue,
  runTransaction,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";


/* =========================================================
   CONFIGURATION FIREBASE
   ========================================================= */

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);


/* =========================================================
   DONNÉES DE L’ACTIVITÉ
   ========================================================= */

const VALUES = [
  "Respect",
  "Honnêteté",
  "Équité",
  "Santé",
  "Plaisir",
  "Excellence",
  "Solidarité",
  "Courage",
  "Persévérance",
  "Responsabilité"
];

const ACTIVITY_ID = "podium-valeurs";


/* =========================================================
   ÉLÉMENTS DE LA PAGE
   ========================================================= */

const loadingScreen = document.querySelector("#loading-screen");
const errorScreen = document.querySelector("#error-screen");
const rankingScreen = document.querySelector("#ranking-screen");
const waitingScreen = document.querySelector("#waiting-screen");
const groupScreen = document.querySelector("#group-screen");
const collectiveScreen = document.querySelector("#collective-screen");
const collectiveDoneScreen = document.querySelector(
  "#collective-done-screen"
);
const endScreen = document.querySelector("#end-screen");

const errorMessage = document.querySelector("#error-message");
const participantName = document.querySelector("#participant-name");

const displayedSessionCode = document.querySelector(
  "#displayed-session-code"
);

const valuesList = document.querySelector("#values-list");

const validateRankingButton = document.querySelector(
  "#validate-ranking-button"
);


/* =========================================================
   ÉTAT DE LA PAGE
   ========================================================= */

let currentUser = null;
let sessionCode = "";
let submissionInProgress = false;
let assignedGroup = null;
let selectedCollectiveValues = [];
let stopSessionListener = null;


/* =========================================================
   AFFICHAGE DES ÉCRANS
   ========================================================= */

function showOnly(screen) {
  [
    loadingScreen,
    errorScreen,
    rankingScreen,
    waitingScreen,
    groupScreen,
    collectiveScreen,
    collectiveDoneScreen,
    endScreen
  ].forEach((currentScreen) => {
    currentScreen.hidden = currentScreen !== screen;
  });
}

function showError(message) {
  errorMessage.textContent = message;
  showOnly(errorScreen);
}

function showWaitingScreen() {
  showOnly(waitingScreen);
}

function showAssignedGroup(group) {
  assignedGroup = group;
  const editorUid =
    group.editorUid || Object.keys(group.members || {}).sort()[0];
  const isEditor = editorUid === currentUser.uid;
  document.querySelector("#group-badge").style.setProperty(
    "--group-color",
    group.color
  );
  document.querySelector("#group-symbol").textContent = group.symbol;
  document.querySelector("#group-title").textContent =
    `Groupe ${group.number} — ${group.colorName}`;
  document.querySelector("#group-symbol-name").textContent =
    group.symbolName;
  document.querySelector("#collective-group-label").textContent =
    `Groupe ${group.number} · ${group.symbol} ${group.symbolName}`;
  document.querySelector("#group-role-message").textContent = isEditor
    ? "Ton appareil a été désigné pour saisir le top 3 et la règle de votre groupe."
    : "Un autre appareil de ton groupe a été désigné pour la saisie. Participe à la discussion puis attends sa validation.";
  document.querySelector("#start-collective-button").hidden = !isEditor;
  showOnly(groupScreen);
}

function listenToSession() {
  stopSessionListener?.();
  stopSessionListener = onValue(
    ref(database, `sessions/${sessionCode}`),
    (snapshot) => {
      if (!snapshot.exists() || !currentUser) return;
      const session = snapshot.val();
      if (session.status === "closed") {
        showOnly(endScreen);
        return;
      }
      const participant = session.participants?.[currentUser.uid];
      const group = participant?.groupId
        ? session.groups?.[participant.groupId]
        : null;

      if (!group) return;
      assignedGroup = group;

      if (group.result) {
        showOnly(collectiveDoneScreen);
      } else if (
        waitingScreen.hidden === false ||
        groupScreen.hidden === false
      ) {
        showAssignedGroup(group);
      }
    }
  );
}

async function assignLateParticipant() {
  await runTransaction(
    ref(database, `sessions/${sessionCode}`),
    (session) => {
      if (!session || !session.groupsLocked || !currentUser) {
        return session;
      }

      const participant = session.participants?.[currentUser.uid];
      if (!participant || participant.groupId) return session;

      const groups = Object.values(session.groups || {}).sort((a, b) => {
        const difference =
          Object.keys(a.members || {}).length -
          Object.keys(b.members || {}).length;
        return difference || a.number - b.number;
      });
      const target = groups.find(
        (group) => Object.keys(group.members || {}).length < 3
      );

      if (!target) return session;
      session.groups[target.id].members ||= {};
      session.groups[target.id].members[currentUser.uid] = true;
      session.participants[currentUser.uid].groupId = target.id;
      session.participants[currentUser.uid].status = "group-assigned";
      return session;
    }
  );
}


/* =========================================================
   SESSION
   ========================================================= */

function normalizeSessionCode(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

function readSessionCode() {
  const parameters = new URLSearchParams(window.location.search);

  return normalizeSessionCode(
    parameters.get("session")
  );
}

function waitForAuthentication() {
  return new Promise((resolve, reject) => {
    let stopListening = () => {};

    stopListening = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
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

async function loadActivity() {
  showOnly(loadingScreen);

  sessionCode = readSessionCode();

  if (sessionCode.length !== 6) {
    showError(
      "Le code de session est absent ou incorrect. " +
      "Rejoins à nouveau l’activité depuis la page d’accueil."
    );

    return;
  }

  try {
    currentUser = await waitForAuthentication();

    const sessionSnapshot = await get(
      ref(database, `sessions/${sessionCode}`)
    );

    if (!sessionSnapshot.exists()) {
      showError(
        "Cette session n’existe pas ou n’est plus disponible."
      );

      return;
    }

    const session = sessionSnapshot.val();

    if (session.activity !== ACTIVITY_ID) {
      showError(
        "Ce code correspond à une autre activité."
      );

      return;
    }

    if (session.status === "closed") {
      participantName.textContent = "Participant";
      displayedSessionCode.textContent = sessionCode;
      listenToSession();
      showOnly(endScreen);
      return;
    }

    if (
      session.status !== "waiting" &&
      session.status !== "active" &&
      session.status !== "groups-formed"
    ) {
      showError(
        "Cette activité n’est pas accessible pour le moment."
      );

      return;
    }

    const participant =
      session.participants?.[currentUser.uid] ?? null;

    /*
     * Si le participant arrive directement avec un QR code,
     * il est automatiquement ajouté à la session.
     */

    if (!participant) {
      await update(
        ref(
          database,
          `sessions/${sessionCode}/participants/${currentUser.uid}`
        ),
        {
          joinedAt: serverTimestamp(),
          status: "connected"
        }
      );
    }

    participantName.textContent = "Participant";
    displayedSessionCode.textContent = sessionCode;
    listenToSession();

    if (session.groupsLocked && !participant?.groupId) {
      await assignLateParticipant();
    }

    /*
     * Si le classement a déjà été enregistré,
     * on affiche directement l’écran d’attente.
     */

    if (
      participant?.status === "ranking-submitted" &&
      Array.isArray(participant.ranking)
    ) {
      showWaitingScreen();
      return;
    }

    renderValues(VALUES);
    showOnly(rankingScreen);
  } catch (error) {
    console.error(
      "Chargement de l’activité impossible :",
      error
    );

    showError(
      "La connexion à l’activité a échoué. " +
      "Vérifie ta connexion Internet puis actualise la page."
    );
  }
}


/* =========================================================
   AFFICHAGE DES VALEURS
   ========================================================= */

function renderValues(values) {
  valuesList.replaceChildren();

  values.forEach((value) => {
    const item = document.createElement("li");

    item.textContent = value;
    item.dataset.value = value;
    item.draggable = true;
    item.tabIndex = 0;

    item.setAttribute(
      "aria-label",
      `${value}. Utilise les flèches haut et bas pour déplacer cette valeur.`
    );

    valuesList.append(item);
  });
}


/* =========================================================
   CLASSEMENT AU CLAVIER
   ========================================================= */

function moveItem(item, direction) {
  if (direction < 0) {
    const previousItem = item.previousElementSibling;

    if (previousItem) {
      valuesList.insertBefore(item, previousItem);
      item.focus();
    }
  } else {
    const nextItem = item.nextElementSibling;

    if (nextItem) {
      valuesList.insertBefore(nextItem, item);
      item.focus();
    }
  }
}

valuesList.addEventListener("keydown", (event) => {
  const item = event.target.closest("li");

  if (!item) {
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveItem(item, -1);
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveItem(item, 1);
  }
});


/* =========================================================
   GLISSER-DÉPOSER AVEC LA SOURIS
   ========================================================= */

let draggedItem = null;

valuesList.addEventListener("dragstart", (event) => {
  const item = event.target.closest("li");

  if (!item) {
    return;
  }

  draggedItem = item;
  item.classList.add("dragging");

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(
    "text/plain",
    item.dataset.value
  );
});

valuesList.addEventListener("dragover", (event) => {
  event.preventDefault();

  if (!draggedItem) {
    return;
  }

  const target = event.target.closest("li");

  if (!target || target === draggedItem) {
    return;
  }

  const targetBox = target.getBoundingClientRect();

  const insertAfter =
    event.clientY > targetBox.top + targetBox.height / 2;

  valuesList.insertBefore(
    draggedItem,
    insertAfter ? target.nextElementSibling : target
  );
});

valuesList.addEventListener("dragend", () => {
  draggedItem?.classList.remove("dragging");
  draggedItem = null;
});


/* =========================================================
   GLISSER-DÉPOSER SUR TÉLÉPHONE
   ========================================================= */

let pointerDraggedItem = null;
let activePointerId = null;

valuesList.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") {
    return;
  }

  const item = event.target.closest("li");

  if (!item) {
    return;
  }

  pointerDraggedItem = item;
  activePointerId = event.pointerId;

  item.classList.add("dragging");
  item.setPointerCapture(event.pointerId);

  event.preventDefault();
});

valuesList.addEventListener("pointermove", (event) => {
  if (
    !pointerDraggedItem ||
    event.pointerId !== activePointerId
  ) {
    return;
  }

  const elements = document.elementsFromPoint(
    event.clientX,
    event.clientY
  );

  const target = elements
    .map((element) => element.closest?.("li"))
    .find(
      (item) =>
        item &&
        item !== pointerDraggedItem
    );

  if (
    !target ||
    target.parentElement !== valuesList
  ) {
    return;
  }

  const targetBox = target.getBoundingClientRect();

  const insertAfter =
    event.clientY > targetBox.top + targetBox.height / 2;

  valuesList.insertBefore(
    pointerDraggedItem,
    insertAfter ? target.nextElementSibling : target
  );

  /*
   * Défilement automatique lorsque le participant
   * approche du haut ou du bas de l’écran.
   */

  const edgeDistance = 70;

  if (event.clientY < edgeDistance) {
    window.scrollBy({
      top: -12,
      behavior: "auto"
    });
  } else if (
    event.clientY > window.innerHeight - edgeDistance
  ) {
    window.scrollBy({
      top: 12,
      behavior: "auto"
    });
  }
});

function endPointerDrag(event) {
  if (
    !pointerDraggedItem ||
    event.pointerId !== activePointerId
  ) {
    return;
  }

  pointerDraggedItem.classList.remove("dragging");

  pointerDraggedItem = null;
  activePointerId = null;
}

valuesList.addEventListener(
  "pointerup",
  endPointerDrag
);

valuesList.addEventListener(
  "pointercancel",
  endPointerDrag
);


/* =========================================================
   RÉCUPÉRATION DU CLASSEMENT
   ========================================================= */

function getCurrentRanking() {
  return [
    ...valuesList.querySelectorAll("li")
  ].map((item) => item.dataset.value);
}


/* =========================================================
   ENREGISTREMENT DU CLASSEMENT
   ========================================================= */

async function submitRanking() {
  if (
    submissionInProgress ||
    !currentUser ||
    !sessionCode
  ) {
    return;
  }

  const ranking = getCurrentRanking();

  if (
    ranking.length !== VALUES.length ||
    new Set(ranking).size !== VALUES.length
  ) {
    showError(
      "Le classement est incomplet. " +
      "Actualise la page puis recommence."
    );

    return;
  }

  submissionInProgress = true;
  validateRankingButton.disabled = true;
  validateRankingButton.textContent = "Enregistrement…";

  try {
    const sessionSnapshot = await get(
      ref(database, `sessions/${sessionCode}`)
    );

    if (!sessionSnapshot.exists()) {
      throw new Error("Session introuvable.");
    }

    const session = sessionSnapshot.val();

    if (session.status === "closed") {
      showOnly(endScreen);
      return;
    }

    await update(
      ref(
        database,
        `sessions/${sessionCode}/participants/${currentUser.uid}`
      ),
      {
        ranking,
        top3: ranking.slice(0, 3),
        status: "ranking-submitted",
        rankingSubmittedAt: serverTimestamp()
      }
    );

    showWaitingScreen();
  } catch (error) {
    console.error(
      "Enregistrement du classement impossible :",
      error
    );

    window.alert(
      "Ton classement n’a pas pu être enregistré. " +
      "Vérifie ta connexion puis réessaie."
    );
  } finally {
    submissionInProgress = false;
    validateRankingButton.disabled = false;
    validateRankingButton.textContent =
      "Valider mon classement";
  }
}

validateRankingButton.addEventListener(
  "click",
  submitRanking
);


/* =========================================================
   DÉMARRAGE
   ========================================================= */

function renderCollectiveSelection() {
  const container = document.querySelector("#collective-values");
  const podium = document.querySelector("#collective-top3");
  container.replaceChildren();
  podium.replaceChildren();

  VALUES.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "value-choice";
    button.textContent = value;
    button.classList.toggle(
      "selected",
      selectedCollectiveValues.includes(value)
    );
    button.addEventListener("click", () => {
      const index = selectedCollectiveValues.indexOf(value);
      if (index >= 0) {
        selectedCollectiveValues.splice(index, 1);
      } else if (selectedCollectiveValues.length < 3) {
        selectedCollectiveValues.push(value);
      }
      renderCollectiveSelection();
    });
    container.append(button);
  });

  selectedCollectiveValues.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    podium.append(item);
  });
}

document.querySelector("#start-collective-button").addEventListener(
  "click",
  () => {
    const editorUid =
      assignedGroup?.editorUid ||
      Object.keys(assignedGroup?.members || {}).sort()[0];
    if (editorUid !== currentUser?.uid) return;
    selectedCollectiveValues = [];
    renderCollectiveSelection();
    showOnly(collectiveScreen);
  }
);

document.querySelector("#submit-collective-button").addEventListener(
  "click",
  async () => {
    const message = document.querySelector("#collective-message");
    const rule = document.querySelector("#collective-rule").value.trim();

    if (selectedCollectiveValues.length !== 3) {
      message.textContent = "Choisissez exactement trois valeurs.";
      return;
    }
    if (rule.length < 10) {
      message.textContent =
        "Décrivez une règle concrète un peu plus précisément.";
      return;
    }
    if (!assignedGroup) return;

    const groupSnapshot = await get(
      ref(
        database,
        `sessions/${sessionCode}/groups/${assignedGroup.id}`
      )
    );
    const currentGroup = groupSnapshot.val();
    const editorUid =
      currentGroup?.editorUid ||
      Object.keys(currentGroup?.members || {}).sort()[0];

    if (editorUid !== currentUser.uid) {
      message.textContent =
        "Un autre appareil a été désigné pour enregistrer la réponse.";
      showAssignedGroup(currentGroup);
      return;
    }

    const button = document.querySelector(
      "#submit-collective-button"
    );
    button.disabled = true;
    message.textContent = "Enregistrement…";

    try {
      await update(
        ref(
          database,
          `sessions/${sessionCode}/groups/${assignedGroup.id}`
        ),
        {
          result: {
            top3: selectedCollectiveValues,
            rule,
            submittedBy: currentUser.uid,
            submittedAt: serverTimestamp()
          },
          status: "completed"
        }
      );
      showOnly(collectiveDoneScreen);
    } catch (error) {
      console.error(error);
      message.textContent = "L’enregistrement a échoué. Réessayez.";
      button.disabled = false;
    }
  }
);

loadActivity();
