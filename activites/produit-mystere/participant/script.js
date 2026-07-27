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
  push,
  set,
  update,
  onDisconnect,
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

const ACTIVITY_ID = "produit-mystere";
const CLUES = [
  {
    id: "advertising-promises",
    label: "Promesses publicitaires",
    shortLabel: "Promesse de résultat",
    information:
      "Le produit promet une récupération très rapide et des résultats visibles dès les premiers jours.",
    questions: [
      "Cette promesse suffit-elle à prouver l’efficacité et la sécurité du produit ?",
      "Une promesse de résultats très rapides constitue-t-elle une preuve suffisante ?",
      "Peut-on conclure que le produit est efficace et sûr grâce à cette seule promesse ?"
    ],
    answers: [
      { id: "promise-proves-safety", label: "Oui" },
      { id: "promise-is-not-proof", label: "Non" },
      { id: "promise-uncertain", label: "Je ne sais pas encore" }
    ]
  },
  {
    id: "incomplete-composition",
    label: "Composition",
    shortLabel: "Liste de la composition",
    information:
      "La liste des ingrédients est incomplète. Certains ingrédients sont regroupés sous l’expression « mélange exclusif ».",
    questions: [
      "Peut-on connaître précisément tout ce que contient le produit ?",
      "La formulation « mélange exclusif » permet-elle de vérifier tous les ingrédients ?",
      "Dispose-t-on ici d’une composition suffisamment précise ?"
    ],
    answers: [
      { id: "composition-fully-known", label: "Oui" },
      { id: "composition-not-fully-known", label: "Non" },
      { id: "composition-not-important", label: "Ce n’est pas important" }
    ]
  },
  {
    id: "purchase-channel",
    label: "Lieu d’achat",
    shortLabel: "Vente sur un réseau social",
    information:
      "Le produit est vendu sur un réseau social par un influenceur sportif. Le site du fabricant fournit peu d’informations et aucun contact clairement identifiable.",
    questions: [
      "Ce mode d’achat est-il rassurant ?",
      "La recommandation d’un influenceur suffit-elle à rendre ce circuit d’achat fiable ?",
      "Le vendeur et le circuit de distribution sont-ils suffisamment traçables ?"
    ],
    answers: [
      {
        id: "channel-trusted-because-athlete",
        label: "Oui, parce que l’influenceur est sportif"
      },
      {
        id: "seller-traceability-insufficient",
        label: "Non, la traçabilité du vendeur est insuffisante"
      },
      {
        id: "channel-trusted-if-cheaper",
        label: "Oui, si le produit est moins cher"
      }
    ]
  },
  {
    id: "natural-claim",
    label: "Mention « 100 % naturel »",
    shortLabel: "Mention « 100 % naturel »",
    information:
      "L’étiquette présente le produit comme « 100 % naturel ».",
    questions: [
      "Un produit naturel est-il forcément sans risque au regard de l’antidopage ?",
      "La mention « 100 % naturel » garantit-elle une utilisation sans risque pour un sportif ?",
      "Peut-on considérer ce complément comme sûr uniquement parce qu’il est présenté comme naturel ?"
    ],
    answers: [
      { id: "natural-always-safe", label: "Oui" },
      { id: "natural-not-always-safe", label: "Non" },
      {
        id: "natural-safe-outside-competition",
        label: "Seulement hors compétition"
      }
    ]
  },
  {
    id: "laboratory-claim",
    label: "Mention « Testé en laboratoire »",
    shortLabel: "Testé en laboratoire",
    information:
      "L’emballage porte la mention « Testé en laboratoire », sans préciser le laboratoire, les substances recherchées ni la méthode utilisée.",
    questions: [
      "Cette mention apporte-t-elle une garantie suffisante ?",
      "Une mention sans laboratoire ni méthode identifiés suffit-elle à rassurer ?",
      "Peut-on se fier à cette affirmation sans davantage de précisions ?"
    ],
    answers: [
      { id: "lab-claim-sufficient", label: "Oui" },
      { id: "lab-claim-insufficient", label: "Non" },
      {
        id: "lab-claim-label-is-enough",
        label: "Oui, si elle est écrite sur l’emballage"
      }
    ]
  },
  {
    id: "certification-standard",
    label: "Certification ou norme",
    shortLabel: "Norme de qualité",
    information:
      "Aucun logo de certification reconnue ni référence à la norme AFNOR NF EN 17444 n’apparaît sur l’emballage ou la fiche du produit.",
    questions: [
      "Que signifie cette absence ?",
      "Comment interpréter l’absence de certification ou de démarche reconnue ?",
      "Quelle conclusion raisonnable tirer de cette absence d’information ?"
    ],
    answers: [
      {
        id: "absence-means-automatically-banned",
        label: "Le produit est automatiquement interdit"
      },
      {
        id: "risk-control-insufficiently-documented",
        label: "Le niveau de maîtrise du risque est insuffisamment documenté"
      },
      {
        id: "absence-makes-no-difference",
        label: "Cela ne change rien"
      }
    ]
  },
  {
    id: "batch-traceability",
    label: "Numéro de lot et traçabilité",
    shortLabel: "Numéro de lot",
    information:
      "Le pot porte le numéro de lot PMR-2407-B18 et indique une date de fabrication en juin 2026.",
    questions: [
      "Pourquoi ces informations sont-elles importantes ?",
      "À quoi servent le numéro de lot et la date de fabrication ?",
      "Quel est l’intérêt principal de ces informations pour le sportif ?"
    ],
    answers: [
      {
        id: "batch-identifies-product",
        label: "Elles permettent d’identifier et de conserver la trace du produit utilisé"
      },
      {
        id: "batch-for-store-only",
        label: "Elles servent uniquement au magasin"
      },
      {
        id: "batch-only-for-expiry",
        label: "Elles ne sont utiles que lorsque le produit est périmé"
      }
    ]
  }
];

const CATEGORIES = [
  { id: "reassuring", label: "Plutôt rassurant", symbol: "✓" },
  { id: "vigilance", label: "Vigilance", symbol: "⚠" },
  { id: "warning", label: "Signal d’alerte", symbol: "!" }
];

const FINAL_DECISIONS = [
  {
    id: "follow-teammate",
    label: "Je le prends puisque d’autres sportifs l’utilisent."
  },
  {
    id: "test-small-amount",
    label: "Je le teste d’abord en petite quantité."
  },
  {
    id: "assess-need-and-guarantees",
    label:
      "Je vérifie si j’en ai réellement besoin et je recherche des garanties."
  },
  {
    id: "use-outside-competition",
    label: "Je le prends uniquement en dehors des compétitions."
  }
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const loadingScreen = document.querySelector("#loading-screen");
const errorScreen = document.querySelector("#error-screen");
const waitingScreen = document.querySelector("#waiting-screen");
const individualModeScreen = document.querySelector(
  "#individual-mode-screen"
);
const groupScreen = document.querySelector("#group-screen");
const activeDeviceScreen = document.querySelector(
  "#active-device-screen"
);
const secondaryDeviceScreen = document.querySelector(
  "#secondary-device-screen"
);
const missionScreen = document.querySelector("#mission-screen");
const inspectionScreen = document.querySelector(
  "#inspection-screen"
);
const clueScreen = document.querySelector("#clue-screen");
const rankingScreen = document.querySelector("#ranking-screen");
const submittedScreen = document.querySelector("#submitted-screen");
const investigationCorrectionScreen = document.querySelector(
  "#investigation-correction-screen"
);
const investigationCorrectionList = document.querySelector(
  "#investigation-correction-list"
);
const finalDecisionScreen = document.querySelector(
  "#final-decision-screen"
);
const finalDecisionQuestion = document.querySelector(
  "#final-decision-question"
);
const finalDecisionOptions = document.querySelector(
  "#final-decision-options"
);
const submitFinalDecisionButton = document.querySelector(
  "#submit-final-decision-button"
);
const finalDecisionMessage = document.querySelector(
  "#final-decision-message"
);
const decisionSubmittedScreen = document.querySelector(
  "#decision-submitted-screen"
);
const decisionSubmittedTitle = document.querySelector(
  "#decision-submitted-title"
);
const finalGuidanceScreen = document.querySelector(
  "#final-guidance-screen"
);
const finalGuidanceMain = document.querySelector(
  "#final-guidance-main"
);
const finalGuidanceResponsibility = document.querySelector(
  "#final-guidance-responsibility"
);
const participantReflexesGrid = document.querySelector(
  "#participant-reflexes-grid"
);
const finalTakeHomeMessage = document.querySelector(
  "#final-take-home-message"
);
const finalHighlightMessage = document.querySelector(
  "#final-highlight-message"
);
const closedScreen = document.querySelector("#closed-screen");
const closedTakeHomeMessage = document.querySelector(
  "#closed-take-home-message"
);
const errorMessage = document.querySelector("#error-message");
const displayedSessionCode = document.querySelector(
  "#displayed-session-code"
);
const participantLabel = document.querySelector("#participant-label");
const connectionMessage = document.querySelector("#connection-message");
const claimDeviceButton = document.querySelector(
  "#claim-device-button"
);
const claimDeviceMessage = document.querySelector(
  "#claim-device-message"
);
const groupNextStepMessage = document.querySelector(
  "#group-next-step-message"
);
const startMissionButton = document.querySelector(
  "#start-mission-button"
);
const inspectionProgress = document.querySelector(
  "#inspection-progress"
);
const clueButtons = document.querySelector("#clue-buttons");
const openRankingButton = document.querySelector(
  "#open-ranking-button"
);
const inspectionMessage = document.querySelector(
  "#inspection-message"
);
const prospectusViewer = document.querySelector(
  "#prospectus-viewer"
);
const prospectusImage = document.querySelector(
  "#prospectus-image"
);
const magnifierLens = document.querySelector("#magnifier-lens");
const showFrontViewButton = document.querySelector(
  "#show-front-view"
);
const showBackViewButton = document.querySelector(
  "#show-back-view"
);
const toggleMagnifierButton = document.querySelector(
  "#toggle-magnifier"
);
const decreaseMagnificationButton = document.querySelector(
  "#decrease-magnification"
);
const increaseMagnificationButton = document.querySelector(
  "#increase-magnification"
);
const magnificationLevel = document.querySelector(
  "#magnification-level"
);
const backToProductButton = document.querySelector(
  "#back-to-product-button"
);
const clueForm = document.querySelector("#clue-form");
const clueAnswers = document.querySelector("#clue-answers");
const clueMessage = document.querySelector("#clue-message");
const rankingList = document.querySelector("#ranking-list");
const rankingSummary = document.querySelector("#ranking-summary");
const submitInvestigationButton = document.querySelector(
  "#submit-investigation-button"
);
const backToInspectionButton = document.querySelector(
  "#back-to-inspection-button"
);
const rankingMessage = document.querySelector("#ranking-message");
const submittedTitle = document.querySelector("#submitted-title");

let currentUser = null;
let sessionCode = "";
let currentSession = null;
let stopSessionListener = null;
let stopConnectionListener = null;
let presenceConnectionReference = null;
let deviceClaimInProgress = false;
let currentView = "mission";
let activeClueId = null;
let answerSaveInProgress = false;
let submissionInProgress = false;
let selectedFinalDecisionId = "";
let finalDecisionSubmissionInProgress = false;
let prospectusViewIndex = 0;
let magnifierEnabled = false;
let magnification = 2;
let lensPosition = { x: 0.5, y: 0.5 };

function showOnly(screen) {
  [
    loadingScreen,
    errorScreen,
    waitingScreen,
    individualModeScreen,
    groupScreen,
    activeDeviceScreen,
    secondaryDeviceScreen,
    missionScreen,
    inspectionScreen,
    clueScreen,
    rankingScreen,
    submittedScreen,
    investigationCorrectionScreen,
    finalDecisionScreen,
    decisionSubmittedScreen,
    finalGuidanceScreen,
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
    return existingParticipant;
  }

  if (
    session.status !== "waiting" &&
    session.status !== "grouping"
  ) {
    throw new Error(
      "Cette activité a déjà commencé et n’accepte plus de nouvelle entrée."
    );
  }

  const otherParticipantCount = Object.keys(
    session.participants || {}
  ).filter((participantId) => participantId !== currentUser.uid).length;

  if (otherParticipantCount >= 30) {
    throw new Error(
      "Cette session a atteint sa limite de 30 participants."
    );
  }

  const counterResult = await runTransaction(
    ref(database, `sessions/${sessionCode}/nextParticipantNumber`),
    (currentNumber) => {
      const nextNumber = (Number(currentNumber) || 0) + 1;
      return nextNumber <= 30 ? nextNumber : undefined;
    }
  );

  if (!counterResult.committed) {
    throw new Error(
      "Cette session a atteint sa limite de 30 participants."
    );
  }

  const participant = {
    ...existingParticipant,
    participantNumber: counterResult.snapshot.val(),
    joinedAt: existingParticipant?.joinedAt || serverTimestamp(),
    status: "waiting"
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
    `Participant ${participant.participantNumber}`;
  displayedSessionCode.textContent = sessionCode;
}

function setupPresence() {
  stopConnectionListener?.();
  stopConnectionListener = onValue(
    ref(database, ".info/connected"),
    async (snapshot) => {
      if (snapshot.val() !== true || !currentUser) {
        connectionMessage.textContent =
          "Reconnexion à la session en cours…";
        return;
      }

      try {
        const connectionsReference = ref(
          database,
          `sessions/${sessionCode}/participants/${currentUser.uid}/connections`
        );
        presenceConnectionReference = push(connectionsReference);
        await onDisconnect(presenceConnectionReference).remove();
        await set(presenceConnectionReference, {
          connectedAt: serverTimestamp()
        });
        connectionMessage.textContent =
          "Connexion en temps réel active.";
      } catch (error) {
        console.error("Présence non enregistrée :", error);
        connectionMessage.textContent =
          "La présence en temps réel n’a pas pu être enregistrée.";
      }
    }
  );
}

function hashString(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(
      result ^ (result >>> 7),
      result | 61
    );
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function deterministicShuffle(values, seed, salt) {
  const copy = [...values];
  const random = seededRandom(
    (Number(seed) || 1) ^ hashString(salt)
  );
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function getWorkContext(session, participant) {
  if (session.participationMode === "group") {
    const group = session.groups?.[participant.groupId];
    return {
      work: group,
      path: `sessions/${sessionCode}/groups/${participant.groupId}`,
      canEdit: group?.activeDeviceParticipantId === currentUser.uid,
      collective: true
    };
  }

  return {
    work: participant,
    path: `sessions/${sessionCode}/participants/${currentUser.uid}`,
    canEdit: true,
    collective: false
  };
}

function orderedClues(work, salt = "inspection-order") {
  return deterministicShuffle(
    CLUES,
    work?.variantSeed,
    salt
  );
}

function selectedQuestion(clue, work) {
  const questionIndex = hashString(
    `${work?.variantSeed || 1}:${clue.id}:question`
  ) % clue.questions.length;
  return clue.questions[questionIndex];
}

function renderMission() {
  showOnly(missionScreen);
}

function updateMagnifier() {
  const rectangle = prospectusViewer.getBoundingClientRect();
  if (!rectangle.width || !rectangle.height) return;

  const lensSize = magnifierLens.offsetWidth || 150;
  const x = lensPosition.x * rectangle.width;
  const y = lensPosition.y * rectangle.height;
  const left = Math.min(
    Math.max(x - lensSize / 2, 0),
    rectangle.width - lensSize
  );
  const top = Math.min(
    Math.max(y - lensSize / 2, 0),
    rectangle.height - lensSize
  );
  const sourceX =
    (prospectusViewIndex * rectangle.width + x) * magnification;
  const sourceY = y * magnification;

  magnifierLens.style.left = `${left}px`;
  magnifierLens.style.top = `${top}px`;
  magnifierLens.style.backgroundImage =
    `url("${prospectusImage.src}")`;
  magnifierLens.style.backgroundSize =
    `${rectangle.width * 2 * magnification}px ${rectangle.height * magnification}px`;
  magnifierLens.style.backgroundPosition =
    `${lensSize / 2 - sourceX}px ${lensSize / 2 - sourceY}px`;
  magnificationLevel.textContent =
    `Zoom ×${magnification.toFixed(1).replace(".0", "")}`;
}

function setProspectusView(viewIndex) {
  prospectusViewIndex = viewIndex === 1 ? 1 : 0;
  prospectusImage.classList.toggle(
    "show-back-view",
    prospectusViewIndex === 1
  );
  showFrontViewButton.setAttribute(
    "aria-selected",
    String(prospectusViewIndex === 0)
  );
  showBackViewButton.setAttribute(
    "aria-selected",
    String(prospectusViewIndex === 1)
  );
  updateMagnifier();
}

function setMagnifierEnabled(enabled) {
  magnifierEnabled = Boolean(enabled);
  prospectusViewer.classList.toggle(
    "magnifier-enabled",
    magnifierEnabled
  );
  toggleMagnifierButton.setAttribute(
    "aria-pressed",
    String(magnifierEnabled)
  );
  toggleMagnifierButton.textContent = magnifierEnabled
    ? "✓ Loupe activée"
    : "🔍 Activer la loupe";
  updateMagnifier();
}

function moveLensFromPointer(event) {
  if (!magnifierEnabled) return;
  const rectangle = prospectusViewer.getBoundingClientRect();
  lensPosition = {
    x: Math.min(
      Math.max((event.clientX - rectangle.left) / rectangle.width, 0),
      1
    ),
    y: Math.min(
      Math.max((event.clientY - rectangle.top) / rectangle.height, 0),
      1
    )
  };
  updateMagnifier();
}

function changeMagnification(delta) {
  magnification = Math.min(
    Math.max(magnification + delta, 1.5),
    3.5
  );
  updateMagnifier();
}

function renderInspection(work) {
  const inspectedClues = work.inspectedClues || {};
  const inspectedCount = Object.keys(inspectedClues).filter(
    (clueId) => inspectedClues[clueId]?.inspectedAt
  ).length;
  const answeredCount = Object.values(inspectedClues).filter(
    (clue) => clue?.answerId
  ).length;

  inspectionProgress.textContent =
    `${inspectedCount} indice${inspectedCount > 1 ? "s" : ""} examiné${inspectedCount > 1 ? "s" : ""} sur 7`;
  clueButtons.replaceChildren();

  orderedClues(work).forEach((clue, index) => {
    const savedClue = inspectedClues[clue.id];
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      `clue-zone${savedClue?.answerId ? " is-complete" : ""}`;
    button.dataset.clueId = clue.id;
    button.innerHTML = `
      <span>${index + 1}</span>
      <strong>${clue.label}</strong>
      <small>${savedClue?.answerId ? "Réponse enregistrée ✓" : savedClue?.inspectedAt ? "À compléter" : "À examiner"}</small>`;
    clueButtons.append(button);
  });

  openRankingButton.disabled = answeredCount !== CLUES.length;
  inspectionMessage.textContent = answeredCount === CLUES.length
    ? "Les sept réponses sont enregistrées. Tu peux passer au classement."
    : `Réponses enregistrées : ${answeredCount} sur ${CLUES.length}.`;
  showOnly(inspectionScreen);
  requestAnimationFrame(updateMagnifier);
}

function renderClue(work, clueId) {
  const clue = CLUES.find((item) => item.id === clueId);
  if (!clue) {
    currentView = "inspection";
    renderInspection(work);
    return;
  }

  const savedAnswerId =
    work.inspectedClues?.[clue.id]?.answerId || "";
  const answerOrder = deterministicShuffle(
    clue.answers,
    work.variantSeed,
    `${clue.id}:answers`
  );

  document.querySelector("#clue-number").textContent =
    `Indice ${CLUES.findIndex((item) => item.id === clue.id) + 1} sur 7`;
  document.querySelector("#clue-title").textContent = clue.label;
  document.querySelector("#clue-information").textContent =
    clue.information;
  document.querySelector("#clue-question").textContent =
    selectedQuestion(clue, work);
  clueAnswers.replaceChildren();

  answerOrder.forEach((answer) => {
    const label = document.createElement("label");
    label.className = "answer-option";
    label.innerHTML = `
      <input type="radio" name="clue-answer"
        value="${answer.id}" ${savedAnswerId === answer.id ? "checked" : ""}>
      <span>${answer.label}</span>`;
    clueAnswers.append(label);
  });

  clueMessage.textContent = "";
  showOnly(clueScreen);
}

function renderRanking(work) {
  const classifications = work.clueClassifications || {};
  const rankedCount = Object.keys(classifications).filter(
    (clueId) => classifications[clueId]
  ).length;
  rankingList.replaceChildren();

  orderedClues(work, "ranking-order").forEach((clue) => {
    const selectedCategoryId = classifications[clue.id];
    const card = document.createElement("article");
    card.className = "ranking-card";
    card.innerHTML = `
      <h3>${clue.shortLabel}</h3>
      <div class="category-buttons" role="group"
        aria-label="Classement de ${clue.shortLabel}">
        ${CATEGORIES.map((category) => `
          <button type="button"
            data-clue-id="${clue.id}"
            data-category-id="${category.id}"
            class="${selectedCategoryId === category.id ? "is-selected" : ""}"
            aria-pressed="${selectedCategoryId === category.id}">
            <span aria-hidden="true">${category.symbol}</span>
            ${category.label}
          </button>
        `).join("")}
      </div>`;
    rankingList.append(card);
  });

  if (rankedCount === CLUES.length) {
    rankingSummary.textContent = `Synthèse · ${CATEGORIES.map(
      (category) => {
        const count = Object.values(classifications).filter(
          (categoryId) => categoryId === category.id
        ).length;
        return `${category.symbol} ${category.label} : ${count}`;
      }
    ).join(" · ")}`;
  } else {
    rankingSummary.textContent =
      `${rankedCount} indice${rankedCount > 1 ? "s" : ""} classé${rankedCount > 1 ? "s" : ""} sur 7`;
  }
  submitInvestigationButton.disabled =
    rankedCount !== CLUES.length || submissionInProgress;
  submitInvestigationButton.textContent = submissionInProgress
    ? "Validation en cours…"
    : "Valider mon enquête";
  showOnly(rankingScreen);
}

function renderSubmitted(collective) {
  submittedTitle.textContent = collective
    ? "L’enquête de votre groupe a bien été enregistrée"
    : "Ton enquête a bien été enregistrée";
  showOnly(submittedScreen);
}

function answerLabel(clue, answerId) {
  return clue.answers.find(
    (answer) => answer.id === answerId
  )?.label || "Non répondu";
}

function categoryLabel(categoryId) {
  return CATEGORIES.find(
    (category) => category.id === categoryId
  )?.label || "Non classé";
}

function appendCorrectionLine(container, label, value, coherent) {
  const line = document.createElement("p");
  const labelElement = document.createElement("strong");
  const statusElement = document.createElement("span");
  labelElement.textContent = `${label} : `;
  statusElement.textContent = coherent
    ? " ✓ Cohérent"
    : " ◇ À reconsidérer";
  statusElement.className = coherent
    ? "coherent-result"
    : "review-result";
  line.append(labelElement, value, statusElement);
  container.append(line);
}

function renderInvestigationCorrection(session, participant) {
  const context = getWorkContext(session, participant);
  if (!context.work || !context.canEdit) {
    if (context.collective) renderGroup(session, participant);
    return;
  }

  const corrections =
    session.publishedInvestigationCorrection || {};
  investigationCorrectionList.replaceChildren();

  CLUES.forEach((clue) => {
    const correction = corrections[clue.id];
    if (!correction) return;

    const savedAnswerId =
      context.work.inspectedClues?.[clue.id]?.answerId;
    const savedCategoryId =
      context.work.clueClassifications?.[clue.id];
    const card = document.createElement("article");
    const title = document.createElement("h3");
    const expectedCategory = document.createElement("p");
    const explanation = document.createElement("p");
    title.textContent = correction.label || clue.shortLabel;
    card.className = "investigation-correction-card";

    appendCorrectionLine(
      card,
      "Votre réponse",
      answerLabel(clue, savedAnswerId),
      savedAnswerId === correction.expectedAnswerId
    );
    appendCorrectionLine(
      card,
      "Votre classement",
      categoryLabel(savedCategoryId),
      savedCategoryId === correction.expectedCategoryId
    );

    expectedCategory.className = "expected-category";
    expectedCategory.textContent = "A retenir !";
    explanation.className = "correction-explanation";
    explanation.textContent = correction.explanation;
    card.prepend(title);
    card.append(expectedCategory, explanation);
    investigationCorrectionList.append(card);
  });

  showOnly(investigationCorrectionScreen);
}

function renderFinalDecision(session, participant) {
  const context = getWorkContext(session, participant);
  if (!context.work || !context.canEdit) {
    if (context.collective) renderGroup(session, participant);
    return;
  }

  if (context.work.finalDecisionId) {
    decisionSubmittedTitle.textContent = context.collective
      ? "La décision de votre groupe est enregistrée"
      : "Ta décision est enregistrée";
    showOnly(decisionSubmittedScreen);
    return;
  }

  finalDecisionQuestion.textContent = context.collective
    ? "Après votre enquête, que faites-vous avec POWER MAX RECOVERY ?"
    : "Après ton enquête, que fais-tu avec POWER MAX RECOVERY ?";
  finalDecisionOptions.replaceChildren();

  deterministicShuffle(
    FINAL_DECISIONS,
    context.work.variantSeed,
    "final-decisions"
  ).forEach((decision) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "final-decision-option";
    button.dataset.decisionId = decision.id;
    button.textContent = decision.label;
    const selected = selectedFinalDecisionId === decision.id;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    finalDecisionOptions.append(button);
  });

  submitFinalDecisionButton.disabled =
    !selectedFinalDecisionId ||
    finalDecisionSubmissionInProgress;
  submitFinalDecisionButton.textContent =
    finalDecisionSubmissionInProgress
      ? "Validation en cours…"
      : context.collective
        ? "Valider la décision du groupe"
        : "Valider ma décision";
  finalDecisionMessage.textContent = finalDecisionSubmissionInProgress
    ? "Enregistrement définitif…"
    : "";
  showOnly(finalDecisionScreen);
}

function renderFinalGuidance(session, participant) {
  const context = getWorkContext(session, participant);
  if (!context.work || !context.canEdit) {
    if (context.collective) renderGroup(session, participant);
    return;
  }

  const guidance = session.publishedFinalGuidance;
  if (!guidance) {
    renderFinalDecision(session, participant);
    return;
  }

  finalGuidanceMain.textContent = guidance.main || "";
  finalGuidanceResponsibility.textContent =
    guidance.responsibility || "";
  finalTakeHomeMessage.textContent = guidance.takeHome || "";
  finalHighlightMessage.textContent = guidance.highlight || "";
  participantReflexesGrid.replaceChildren();

  Object.values(guidance.reflexes || {}).forEach((reflex, index) => {
    const card = document.createElement("article");
    const number = document.createElement("span");
    const title = document.createElement("h4");
    const text = document.createElement("p");
    card.className = "reflex-card";
    number.className = "reflex-number";
    number.textContent = String(index + 1);
    title.textContent = reflex.title || "";
    text.textContent = reflex.text || "";
    card.append(number, title, text);
    participantReflexesGrid.append(card);
  });

  showOnly(finalGuidanceScreen);
}

function renderClosed(session) {
  if (session.takeHomeMessage) {
    closedTakeHomeMessage.textContent = session.takeHomeMessage;
  }
  showOnly(closedScreen);
}

function renderInvestigation(session, participant) {
  const context = getWorkContext(session, participant);
  if (!context.work || !context.canEdit) {
    if (context.collective) {
      renderGroup(session, participant);
    }
    return;
  }

  if (context.work.investigationSubmittedAt) {
    renderSubmitted(context.collective);
    return;
  }

  if (!context.work.investigationOpenedAt) {
    currentView = "mission";
    renderMission();
    return;
  }

  const savedStage = context.work.currentStage;
  if (savedStage === "clue" && context.work.currentClueId) {
    currentView = "clue";
    activeClueId = context.work.currentClueId;
    renderClue(context.work, context.work.currentClueId);
    return;
  }

  if (savedStage === "ranking" || currentView === "ranking") {
    currentView = "ranking";
    renderRanking(context.work);
    return;
  }

  currentView = "inspection";
  renderInspection(context.work);
}

function renderIndividualMode(participant) {
  document.querySelector("#individual-participant-label").textContent =
    `Participant ${participant.participantNumber} · Session ${sessionCode}`;
  showOnly(individualModeScreen);
}

function renderGroup(session, participant) {
  const group = session.groups?.[participant.groupId];
  if (!group) {
    connectionMessage.textContent =
      "La répartition de ton groupe est en cours…";
    showOnly(waitingScreen);
    return;
  }

  const memberNumbers = Object.keys(group.members || {})
    .map((uid) => session.participants?.[uid]?.participantNumber)
    .filter(Boolean)
    .sort((first, second) => first - second);
  const membersText = memberNumbers
    .map((number) => `Participant ${number}`)
    .join(" · ");

  document.querySelector("#group-badge").style.setProperty(
    "--group-color",
    group.color
  );
  document.querySelector("#group-symbol").textContent = group.symbol;
  document.querySelector("#group-title").textContent =
    `Groupe ${group.number} — ${group.colorName}`;
  document.querySelector("#group-symbol-name").textContent =
    group.symbolName;
  document.querySelector("#group-members").textContent =
    `Votre groupe : ${membersText}.`;

  const groupLabel =
    `Groupe ${group.number} — ${group.colorName} · ${group.symbol} ${group.symbolName}`;
  const activeDeviceParticipantId =
    group.activeDeviceParticipantId;

  if (session.modeLocked && activeDeviceParticipantId) {
    if (activeDeviceParticipantId === currentUser.uid) {
      document.querySelector("#active-device-group-label").textContent =
        groupLabel;
      showOnly(activeDeviceScreen);
      return;
    }

    const activeParticipantNumber =
      session.participants?.[activeDeviceParticipantId]
        ?.participantNumber;
    document.querySelector(
      "#secondary-device-group-label"
    ).textContent = groupLabel;
    document.querySelector("#secondary-device-message").textContent =
      activeParticipantNumber
        ? `Le téléphone du Participant ${activeParticipantNumber} a été retenu.`
        : "Un autre téléphone du groupe a été retenu.";
    showOnly(secondaryDeviceScreen);
    return;
  }

  claimDeviceButton.hidden = !session.modeLocked;
  claimDeviceButton.disabled = deviceClaimInProgress;
  claimDeviceButton.textContent = deviceClaimInProgress
    ? "Sélection en cours…"
    : "Utiliser ce téléphone pour l’enquête";
  claimDeviceMessage.textContent = "";
  groupNextStepMessage.textContent = session.modeLocked
    ? "Choisissez ensemble le téléphone qui sera utilisé pour toute l’enquête."
    : "Les groupes peuvent encore être modifiés. Attendez que l’éducateur lance l’activité.";
  showOnly(groupScreen);
}

function renderSession(session) {
  currentSession = session;
  if (session.status === "closed") {
    renderClosed(session);
    return;
  }

  const participant = session.participants?.[currentUser.uid];
  if (!participant) {
    showError("Ton inscription n’est plus disponible dans cette session.");
    return;
  }

  if (session.status === "investigation") {
    const context = getWorkContext(session, participant);
    if (context.canEdit) {
      renderInvestigation(session, participant);
    } else if (context.collective) {
      renderGroup(session, participant);
    }
    return;
  }

  if (session.status === "investigation-correction") {
    const context = getWorkContext(session, participant);
    if (context.canEdit) {
      renderInvestigationCorrection(session, participant);
    } else if (context.collective) {
      renderGroup(session, participant);
    }
    return;
  }

  if (session.status === "final-decision") {
    const context = getWorkContext(session, participant);
    if (context.canEdit) {
      renderFinalDecision(session, participant);
    } else if (context.collective) {
      renderGroup(session, participant);
    }
    return;
  }

  if (session.status === "results") {
    const context = getWorkContext(session, participant);
    if (context.canEdit) {
      renderFinalGuidance(session, participant);
    } else if (context.collective) {
      renderGroup(session, participant);
    }
    return;
  }

  if (session.groupsPrepared || session.modeLocked) {
    if (session.participationMode === "individual") {
      renderIndividualMode(participant);
      return;
    }
    if (session.participationMode === "group") {
      renderGroup(session, participant);
      return;
    }
  }

  connectionMessage.textContent = "Connexion en temps réel active.";
  showOnly(waitingScreen);
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

  if (!group?.members?.[currentUser.uid]) {
    claimDeviceMessage.textContent =
      "Ce téléphone n’est pas associé à ce groupe.";
    return;
  }

  deviceClaimInProgress = true;
  claimDeviceButton.disabled = true;
  claimDeviceButton.textContent = "Sélection en cours…";
  claimDeviceMessage.textContent =
    "Vérification avec les autres téléphones…";

  const activeDeviceReference = ref(
    database,
    `sessions/${sessionCode}/groups/${group.id}/activeDeviceParticipantId`
  );

  try {
    const result = await runTransaction(
      activeDeviceReference,
      (currentParticipantId) => {
        if (
          currentParticipantId == null ||
          currentParticipantId === currentUser.uid
        ) {
          return currentUser.uid;
        }
        return undefined;
      }
    );

    if (
      result.committed &&
      result.snapshot.val() === currentUser.uid
    ) {
      update(
        ref(
          database,
          `sessions/${sessionCode}/groups/${group.id}`
        ),
        {
          activeDeviceClaimedAt: serverTimestamp(),
          status: "active-device-selected"
        }
      ).catch((error) => {
        console.warn(
          "Métadonnées du téléphone non enregistrées :",
          error
        );
      });
      return;
    }

    claimDeviceMessage.textContent =
      "Un autre téléphone du groupe a été retenu.";
  } catch (error) {
    console.error("Choix du téléphone impossible :", error);
    claimDeviceMessage.textContent =
      "Le téléphone n’a pas pu être enregistré. Réessaie.";
  } finally {
    deviceClaimInProgress = false;
    claimDeviceButton.disabled = false;
    claimDeviceButton.textContent =
      "Utiliser ce téléphone pour l’enquête";
  }
}

function currentWorkContext() {
  const participant =
    currentSession?.participants?.[currentUser?.uid];
  if (!participant) return null;
  return getWorkContext(currentSession, participant);
}

async function startMission() {
  const context = currentWorkContext();
  if (!context?.canEdit || context.work.investigationSubmittedAt) {
    return;
  }

  startMissionButton.disabled = true;
  startMissionButton.textContent = "Ouverture…";
  currentView = "inspection";

  try {
    await update(ref(database, context.path), {
      investigationOpenedAt:
        context.work.investigationOpenedAt || serverTimestamp(),
      currentStage: "inspection",
      status: "investigation-started"
    });
  } catch (error) {
    console.error("Ouverture de la mission impossible :", error);
    startMissionButton.disabled = false;
    startMissionButton.textContent = "Commencer l’enquête";
  }
}

async function openClue(clueId) {
  const clue = CLUES.find((item) => item.id === clueId);
  const context = currentWorkContext();
  if (
    !clue ||
    !context?.canEdit ||
    context.work.investigationSubmittedAt
  ) {
    return;
  }

  activeClueId = clueId;
  currentView = "clue";
  renderClue(context.work, clueId);

  const savedClue = context.work.inspectedClues?.[clueId];
  try {
    await update(ref(database, context.path), {
      currentStage: "clue",
      currentClueId: clueId,
      [`inspectedClues/${clueId}/inspectedAt`]:
        savedClue?.inspectedAt || serverTimestamp()
    });
  } catch (error) {
    console.error("Ouverture de l’indice impossible :", error);
    clueMessage.textContent =
      "Cet indice n’a pas pu être synchronisé.";
  }
}

async function returnToInspection() {
  const context = currentWorkContext();
  if (!context?.canEdit) return;
  currentView = "inspection";
  activeClueId = null;

  try {
    await update(ref(database, context.path), {
      currentStage: "inspection",
      currentClueId: null
    });
  } catch (error) {
    console.error("Retour au produit non synchronisé :", error);
    renderInspection(context.work);
  }
}

async function saveClueAnswer(event) {
  event.preventDefault();
  if (answerSaveInProgress || !activeClueId) return;

  const context = currentWorkContext();
  const selectedAnswer = clueForm.querySelector(
    'input[name="clue-answer"]:checked'
  );

  if (!context?.canEdit || context.work.investigationSubmittedAt) {
    return;
  }
  if (!selectedAnswer) {
    clueMessage.textContent = "Choisis une réponse avant de continuer.";
    return;
  }

  answerSaveInProgress = true;
  document.querySelector("#save-clue-answer-button").disabled = true;
  clueMessage.textContent = "Enregistrement…";

  try {
    await update(ref(database, context.path), {
      [`inspectedClues/${activeClueId}/answerId`]:
        selectedAnswer.value,
      [`inspectedClues/${activeClueId}/answeredAt`]:
        serverTimestamp(),
      currentStage: "inspection",
      currentClueId: null
    });
    currentView = "inspection";
    activeClueId = null;
  } catch (error) {
    console.error("Réponse non enregistrée :", error);
    clueMessage.textContent =
      "La réponse n’a pas pu être enregistrée. Réessaie.";
  } finally {
    answerSaveInProgress = false;
    document.querySelector("#save-clue-answer-button").disabled = false;
  }
}

async function openRanking() {
  const context = currentWorkContext();
  if (!context?.canEdit || context.work.investigationSubmittedAt) {
    return;
  }
  const answeredCount = Object.values(
    context.work.inspectedClues || {}
  ).filter((clue) => clue?.answerId).length;
  if (answeredCount !== CLUES.length) {
    inspectionMessage.textContent =
      "Réponds aux sept indices avant de les classer.";
    return;
  }

  currentView = "ranking";
  try {
    await update(ref(database, context.path), {
      currentStage: "ranking",
      currentClueId: null
    });
  } catch (error) {
    console.error("Classement non ouvert :", error);
    renderRanking(context.work);
  }
}

async function chooseCategory(button) {
  const clueId = button.dataset.clueId;
  const categoryId = button.dataset.categoryId;
  const context = currentWorkContext();
  const validClue = CLUES.some((clue) => clue.id === clueId);
  const validCategory = CATEGORIES.some(
    (category) => category.id === categoryId
  );

  if (
    !context?.canEdit ||
    context.work.investigationSubmittedAt ||
    !validClue ||
    !validCategory
  ) {
    return;
  }

  rankingMessage.textContent = "Enregistrement du classement…";
  try {
    await set(
      ref(
        database,
        `${context.path}/clueClassifications/${clueId}`
      ),
      categoryId
    );
    rankingMessage.textContent = "";
  } catch (error) {
    console.error("Classement non enregistré :", error);
    rankingMessage.textContent =
      "Ce choix n’a pas pu être enregistré. Réessaie.";
  }
}

async function submitInvestigation() {
  if (submissionInProgress) return;
  const context = currentWorkContext();
  if (!context?.canEdit) return;

  const answeredCount = Object.values(
    context.work.inspectedClues || {}
  ).filter((clue) => clue?.answerId).length;
  const classifiedCount = Object.keys(
    context.work.clueClassifications || {}
  ).length;

  if (
    answeredCount !== CLUES.length ||
    classifiedCount !== CLUES.length
  ) {
    rankingMessage.textContent =
      "Les sept indices doivent être examinés et classés.";
    return;
  }

  submissionInProgress = true;
  submitInvestigationButton.disabled = true;
  submitInvestigationButton.textContent = "Validation en cours…";
  rankingMessage.textContent =
    "Enregistrement définitif de l’enquête…";

  try {
    const result = await runTransaction(
      ref(database, `${context.path}/investigationSubmittedAt`),
      (currentValue) =>
        currentValue == null ? serverTimestamp() : undefined
    );

    if (!result.committed) {
      const latestSnapshot = await get(
        ref(database, `${context.path}/investigationSubmittedAt`)
      );
      if (!latestSnapshot.exists()) {
        throw new Error("La validation atomique a été refusée.");
      }
    }

    await update(ref(database, context.path), {
      status: "investigation-submitted",
      currentStage: "submitted"
    });
  } catch (error) {
    console.error("Validation de l’enquête impossible :", error);
    rankingMessage.textContent =
      "L’enquête n’a pas pu être validée. Réessaie.";
    submissionInProgress = false;
    submitInvestigationButton.disabled = false;
    submitInvestigationButton.textContent = "Valider mon enquête";
  }
}

async function submitFinalDecision() {
  if (
    finalDecisionSubmissionInProgress ||
    !selectedFinalDecisionId
  ) {
    return;
  }

  const context = currentWorkContext();
  if (!context?.canEdit || context.work.finalDecisionId) return;

  finalDecisionSubmissionInProgress = true;
  submitFinalDecisionButton.disabled = true;
  submitFinalDecisionButton.textContent = "Validation en cours…";
  finalDecisionMessage.textContent = "Enregistrement définitif…";

  try {
    const result = await runTransaction(
      ref(database, `${context.path}/finalDecisionId`),
      (currentValue) =>
        currentValue == null
          ? selectedFinalDecisionId
          : undefined
    );

    if (!result.committed) {
      const latestSnapshot = await get(
        ref(database, `${context.path}/finalDecisionId`)
      );
      if (!latestSnapshot.exists()) {
        throw new Error("La validation atomique a été refusée.");
      }
    }

    await update(ref(database, context.path), {
      finalDecisionSubmittedAt: serverTimestamp(),
      status: "final-decision-submitted"
    });
  } catch (error) {
    console.error("Décision finale non enregistrée :", error);
    finalDecisionMessage.textContent =
      "La décision n’a pas pu être enregistrée. Réessaie.";
    finalDecisionSubmissionInProgress = false;
    submitFinalDecisionButton.disabled = false;
    submitFinalDecisionButton.textContent = context.collective
      ? "Valider la décision du groupe"
      : "Valider ma décision";
  }
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

claimDeviceButton.addEventListener("click", claimActiveDevice);
startMissionButton.addEventListener("click", startMission);
showFrontViewButton.addEventListener(
  "click",
  () => setProspectusView(0)
);
showBackViewButton.addEventListener(
  "click",
  () => setProspectusView(1)
);
toggleMagnifierButton.addEventListener("click", () => {
  setMagnifierEnabled(!magnifierEnabled);
});
decreaseMagnificationButton.addEventListener(
  "click",
  () => changeMagnification(-0.5)
);
increaseMagnificationButton.addEventListener(
  "click",
  () => changeMagnification(0.5)
);
prospectusViewer.addEventListener("pointerdown", (event) => {
  if (!magnifierEnabled) return;
  prospectusViewer.setPointerCapture?.(event.pointerId);
  moveLensFromPointer(event);
});
prospectusViewer.addEventListener("pointermove", (event) => {
  if (!magnifierEnabled) return;
  if (event.pointerType === "touch") event.preventDefault();
  moveLensFromPointer(event);
});
prospectusViewer.addEventListener("keydown", (event) => {
  if (!magnifierEnabled) return;
  const movement = 0.04;
  const movements = {
    ArrowLeft: [-movement, 0],
    ArrowRight: [movement, 0],
    ArrowUp: [0, -movement],
    ArrowDown: [0, movement]
  };

  if (movements[event.key]) {
    event.preventDefault();
    lensPosition = {
      x: Math.min(
        Math.max(lensPosition.x + movements[event.key][0], 0),
        1
      ),
      y: Math.min(
        Math.max(lensPosition.y + movements[event.key][1], 0),
        1
      )
    };
    updateMagnifier();
  } else if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    changeMagnification(0.5);
  } else if (event.key === "-") {
    event.preventDefault();
    changeMagnification(-0.5);
  }
});
prospectusImage.addEventListener("load", updateMagnifier);
window.addEventListener("resize", updateMagnifier);
clueButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-clue-id]");
  if (button) openClue(button.dataset.clueId);
});
backToProductButton.addEventListener("click", returnToInspection);
clueForm.addEventListener("submit", saveClueAnswer);
openRankingButton.addEventListener("click", openRanking);
backToInspectionButton.addEventListener("click", returnToInspection);
rankingList.addEventListener("click", (event) => {
  const button = event.target.closest(
    "button[data-clue-id][data-category-id]"
  );
  if (button) chooseCategory(button);
});
submitInvestigationButton.addEventListener(
  "click",
  submitInvestigation
);
finalDecisionOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-decision-id]");
  if (!button || finalDecisionSubmissionInProgress) return;
  selectedFinalDecisionId = button.dataset.decisionId;
  const participant =
    currentSession?.participants?.[currentUser?.uid];
  if (participant) {
    renderFinalDecision(currentSession, participant);
  }
});
submitFinalDecisionButton.addEventListener(
  "click",
  submitFinalDecision
);

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

    if (session.status === "closed") {
      renderClosed(session);
      return;
    }

    const participant = await registerParticipant(session);
    renderParticipant(participant);
    setupPresence();
    listenToSession();
  } catch (error) {
    console.error("Connexion à l’activité impossible :", error);
    showError(
      "La connexion à l’activité a échoué. Vérifie ta connexion puis réessaie."
    );
  }
}

loadActivity();
