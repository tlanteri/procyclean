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

const ACTIVITY_ID = "produit-mystere";
const EDUCATOR_EMAIL = "prevention.dopage@ffc.fr";
const GROUP_IDENTITIES = [
  ["Bleu", "Éclair", "⚡", "#1677d2"],
  ["Rouge", "Flamme", "🔥", "#d83b32"],
  ["Vert", "Feuille", "🍃", "#258a52"],
  ["Jaune", "Étoile", "★", "#d29a00"],
  ["Violet", "Lune", "☾", "#7c4dcc"],
  ["Orange", "Soleil", "☀", "#dc6b18"],
  ["Turquoise", "Vague", "≈", "#008b91"],
  ["Rose", "Cœur", "♥", "#c83e78"],
  ["Marron", "Montagne", "▲", "#80583d"],
  ["Gris", "Nuage", "☁", "#687583"]
].map(([colorName, symbolName, symbol, color], index) => ({
  id: `group-${index + 1}`,
  number: index + 1,
  colorName,
  symbolName,
  symbol,
  color
}));
const INVESTIGATION_CORRECTIONS = [
  {
    id: "advertising-promises",
    label: "Promesse de résultat",
    expectedAnswerId: "promise-is-not-proof",
    expectedCategoryId: "warning",
    expectedCategoryLabel: "Signal d’alerte",
    explanation:
      "Une promesse publicitaire n’est pas une preuve scientifique. Les résultats rapides ou extraordinaires doivent inciter à la vigilance."
  },
  {
    id: "incomplete-composition",
    label: "Liste de la composition",
    expectedAnswerId: "composition-not-fully-known",
    expectedCategoryId: "warning",
    expectedCategoryLabel: "Signal d’alerte",
    explanation:
      "Une composition incomplète empêche de vérifier précisément le contenu du produit. Cela constitue un signal d’alerte."
  },
  {
    id: "purchase-channel",
    label: "Vente sur un réseau social",
    expectedAnswerId: "seller-traceability-insufficient",
    expectedCategoryId: "warning",
    expectedCategoryLabel: "Signal d’alerte",
    explanation:
      "La recommandation d’un sportif ou d’un influenceur ne garantit ni la qualité ni la conformité du produit. Il faut vérifier le fabricant et le circuit de distribution."
  },
  {
    id: "natural-claim",
    label: "Mention « 100 % naturel »",
    expectedAnswerId: "natural-not-always-safe",
    expectedCategoryId: "vigilance",
    expectedCategoryLabel: "Vigilance",
    explanation:
      "Une substance naturelle peut être interdite, dangereuse ou mal indiquée sur l’étiquette. Le mot « naturel » ne garantit pas l’absence de risque."
  },
  {
    id: "laboratory-claim",
    label: "Testé en laboratoire",
    expectedAnswerId: "lab-claim-insufficient",
    expectedCategoryId: "vigilance",
    expectedCategoryLabel: "Vigilance",
    explanation:
      "Une mention générale liée à un laboratoire ne précise ni les substances recherchées ni la méthode utilisée. Elle ne constitue pas une garantie suffisante."
  },
  {
    id: "certification-standard",
    label: "Norme de qualité",
    expectedAnswerId: "risk-control-insufficiently-documented",
    expectedCategoryId: "vigilance",
    expectedCategoryLabel: "Vigilance",
    explanation:
      "L’absence de démarche reconnue apporte moins d’éléments pour réduire le risque. Une norme comme AFNOR NF EN 17444 contribue à limiter les risques, mais ne garantit jamais un risque nul."
  },
  {
    id: "batch-traceability",
    label: "Numéro de lot",
    expectedAnswerId: "batch-identifies-product",
    expectedCategoryId: "reassuring",
    expectedCategoryLabel: "Plutôt rassurant",
    explanation:
      "La présence d’un numéro de lot facilite la traçabilité du produit. C’est un élément plutôt rassurant, mais elle ne garantit pas à elle seule sa sécurité."
  }
];
const FINAL_DECISIONS = [
  {
    id: "follow-teammate",
    label:
      "Je le prends puisque mon coéquipier l’utilise sans problème."
  },
  {
    id: "test-small-amount",
    label: "Je le teste d’abord en petite quantité."
  },
  {
    id: "assess-need-and-guarantees",
    label:
      "Je vérifie si j’en ai réellement besoin avec un professionnel compétent et je recherche une solution présentant davantage de garanties."
  },
  {
    id: "use-outside-competition",
    label:
      "Je le prends uniquement pendant les périodes sans compétition."
  }
];
const EXPECTED_FINAL_DECISION_ID =
  "assess-need-and-guarantees";
const SIX_REFLEXES = [
  {
    title: "Évaluer le besoin",
    text:
      "Je vérifie si le complément est réellement nécessaire."
  },
  {
    title: "Demander conseil",
    text:
      "J’en parle à un médecin, un pharmacien ou un professionnel compétent en nutrition du sport."
  },
  {
    title: "Vérifier la composition",
    text:
      "Je consulte la liste complète des ingrédients et je me méfie des formulations imprécises."
  },
  {
    title: "Choisir un circuit fiable",
    text:
      "J’évite les vendeurs difficiles à identifier et les achats fondés uniquement sur une recommandation en ligne."
  },
  {
    title: "Rechercher une démarche de réduction des risques",
    text:
      "Je privilégie un produit répondant à une démarche reconnue, comme la norme AFNOR NF EN 17444, sans considérer qu’elle garantit un risque nul."
  },
  {
    title: "Conserver une trace",
    text:
      "Je photographie l’étiquette et le numéro de lot, puis je conserve le contenant et la fin du produit."
  }
];
const FINAL_GUIDANCE = {
  main:
    "La meilleure décision est de vérifier d’abord si ce complément est réellement nécessaire avec un professionnel compétent. Si son utilisation est envisagée, il faut ensuite rechercher un produit offrant davantage d’informations et de garanties afin de limiter les risques.",
  responsibility:
    "Aucun complément alimentaire et aucune certification ne garantissent un risque zéro. Le sportif reste responsable des substances retrouvées dans son organisme.",
  takeHome:
    "Un complément alimentaire n’est jamais un produit anodin. Avant d’en consommer, je vérifie s’il est nécessaire, je demande conseil et je cherche à réduire les risques au maximum.",
  highlight: "Naturel ne veut pas dire sans risque."
};

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
const sessionStatus = document.querySelector("#session-status");
const waitingPanel = document.querySelector("#waiting-panel");
const closedPanel = document.querySelector("#closed-panel");
const formGroupsButton = document.querySelector(
  "#form-groups-button"
);
const launchActivityButton = document.querySelector(
  "#launch-activity-button"
);
const actionMessage = document.querySelector("#action-message");
const groupsPanel = document.querySelector("#groups-panel");
const groupsTitle = document.querySelector("#groups-title");
const groupsDescription = document.querySelector(
  "#groups-description"
);
const groupsGrid = document.querySelector("#groups-grid");
const startInvestigationButton = document.querySelector(
  "#start-investigation-button"
);
const investigationActionMessage = document.querySelector(
  "#investigation-action-message"
);
const revealInvestigationButton = document.querySelector(
  "#reveal-investigation-button"
);
const investigationResultsPanel = document.querySelector(
  "#investigation-results-panel"
);
const investigationResultsSummary = document.querySelector(
  "#investigation-results-summary"
);
const correctionSummaryGrid = document.querySelector(
  "#correction-summary-grid"
);
const warningSignalsSummary = document.querySelector(
  "#warning-signals-summary"
);
const launchFinalDecisionButton = document.querySelector(
  "#launch-final-decision-button"
);
const finalDecisionPanel = document.querySelector(
  "#final-decision-panel"
);
const finalDecisionSummary = document.querySelector(
  "#final-decision-summary"
);
const decisionDistributionGrid = document.querySelector(
  "#decision-distribution-grid"
);
const revealFinalGuidanceButton = document.querySelector(
  "#reveal-final-guidance-button"
);
const finalResultsPanel = document.querySelector(
  "#final-results-panel"
);
const showReflexesButton = document.querySelector(
  "#show-reflexes-button"
);
const closeActivityButton = document.querySelector(
  "#close-activity-button"
);
const reflexesOverlay = document.querySelector("#reflexes-overlay");
const closeReflexesButton = document.querySelector(
  "#close-reflexes-button"
);
const educatorReflexesGrid = document.querySelector(
  "#educator-reflexes-grid"
);

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

function readableStatus(session) {
  if (session.status === "closed") return "Clôturée";
  if (session.status === "results") return "Résultats révélés";
  if (session.status === "final-decision") {
    return "Décision finale";
  }
  if (session.status === "investigation-correction") {
    return "Correction révélée";
  }
  if (session.status === "investigation") return "Enquête en cours";
  if (session.modeLocked) return "Activité lancée";
  if (session.groupsPrepared) return "Groupes prêts";
  return "En attente";
}

function connectedParticipantEntries(session) {
  return Object.entries(session.participants || {}).filter(
    ([, participant]) =>
      Object.keys(participant.connections || {}).length > 0
  );
}

function shuffled(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function balancedSizes(count) {
  const groupCount = Math.ceil(count / 3);
  if (!groupCount) return [];
  const base = Math.floor(count / groupCount);
  const extra = count % groupCount;
  return Array.from(
    { length: groupCount },
    (_, index) => base + (index < extra ? 1 : 0)
  );
}

function randomVariantSeed() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0];
}

function buildGroups(participantEntries) {
  const randomizedIds = shuffled(
    participantEntries.map(([uid]) => uid)
  );
  const sizes = balancedSizes(randomizedIds.length);
  let cursor = 0;

  return sizes.map((size, index) => {
    const identity = GROUP_IDENTITIES[index];
    const memberIds = randomizedIds.slice(cursor, cursor + size);
    cursor += size;
    return {
      ...identity,
      memberIds,
      members: Object.fromEntries(
        memberIds.map((uid) => [uid, true])
      ),
      variantSeed: randomVariantSeed(),
      status: "awaiting-active-device"
    };
  });
}

function renderGroups(groups) {
  groupsGrid.replaceChildren();
  [...groups]
    .sort((first, second) => first.number - second.number)
    .forEach((group) => {
      const memberNumbers = Object.keys(group.members || {})
        .map((uid) =>
          currentSession?.participants?.[uid]?.participantNumber
        )
        .filter(Boolean)
        .sort((first, second) => first - second);
      const activeParticipantNumber =
        currentSession?.participants?.[
          group.activeDeviceParticipantId
        ]?.participantNumber;
      const deviceStatus = currentSession?.modeLocked
        ? activeParticipantNumber
          ? `Téléphone actif : Participant ${activeParticipantNumber}`
          : "Téléphone actif : en attente"
        : "Téléphone à choisir après le lancement";
      const inspectedCount = Object.keys(
        group.inspectedClues || {}
      ).length;
      const investigationStatus = group.investigationSubmittedAt
        ? "Enquête validée"
        : inspectedCount
          ? `${inspectedCount} indice${inspectedCount > 1 ? "s" : ""} examiné${inspectedCount > 1 ? "s" : ""} sur 7`
          : "Enquête non commencée";
      const card = document.createElement("article");
      card.className = "group-card";
      card.style.setProperty("--group-color", group.color);
      card.innerHTML = `
        <div class="group-title">
          <span class="group-symbol" aria-hidden="true">${group.symbol}</span>
          <span>Groupe ${group.number} — ${group.colorName}</span>
        </div>
        <p>${group.symbolName} · ${memberNumbers.length} cycliste${memberNumbers.length > 1 ? "s" : ""}</p>
        <p class="member-list"><strong>${memberNumbers.map(
          (number) => `Participant ${number}`
        ).join(" · ")}</strong></p>
        <p class="device-status${activeParticipantNumber ? " is-ready" : ""}">
          ${deviceStatus}
        </p>
        ${["investigation", "investigation-correction"].includes(
          currentSession?.status
        ) ? `
          <p class="investigation-status${group.investigationSubmittedAt ? " is-ready" : ""}">
            ${investigationStatus}
          </p>` : ""}`;
      groupsGrid.append(card);
    });
}

function sameParticipants(preparedParticipants, connectedEntries) {
  const preparedIds = Object.keys(preparedParticipants || {}).sort();
  const connectedIds = connectedEntries
    .map(([uid]) => uid)
    .sort();
  return preparedIds.join("|") === connectedIds.join("|");
}

function investigationUnits(session) {
  if (session.participationMode === "group") {
    return Object.values(session.groups || {});
  }
  return Object.keys(session.preparedParticipants || {})
    .map((uid) => session.participants?.[uid])
    .filter(Boolean);
}

function renderCorrectionSummary(session) {
  const units = investigationUnits(session);
  const submittedUnits = units.filter(
    (unit) => unit.investigationSubmittedAt
  );
  const unitLabel = session.participationMode === "group"
    ? "groupe"
    : "participant";

  investigationResultsSummary.textContent =
    `${submittedUnits.length} ${unitLabel}${submittedUnits.length === 1 ? "" : "s"} analysé${submittedUnits.length === 1 ? "" : "s"} sur ${units.length}. Les pourcentages utilisent les enquêtes reçues.`;
  correctionSummaryGrid.replaceChildren();

  INVESTIGATION_CORRECTIONS.forEach((correction) => {
    const classifications = submittedUnits
      .map((unit) =>
        unit.clueClassifications?.[correction.id]
      )
      .filter(Boolean);
    const coherentCount = classifications.filter(
      (categoryId) =>
        categoryId === correction.expectedCategoryId
    ).length;
    const percentage = classifications.length
      ? Math.round(
        (coherentCount / classifications.length) * 100
      )
      : 0;
    const distribution = {
      reassuring: 0,
      vigilance: 0,
      warning: 0
    };
    classifications.forEach((categoryId) => {
      if (categoryId in distribution) {
        distribution[categoryId] += 1;
      }
    });

    const card = document.createElement("article");
    card.className = "correction-summary-card";
    card.innerHTML = `
      <h3>${correction.label}</h3>
      <strong>${percentage} % de classements cohérents</strong>
      <p>Repère : ${correction.expectedCategoryLabel}</p>
      <div class="distribution-line">
        <span>✓ ${distribution.reassuring}</span>
        <span>⚠ ${distribution.vigilance}</span>
        <span>! ${distribution.warning}</span>
      </div>`;
    correctionSummaryGrid.append(card);
  });

  const warningIds = INVESTIGATION_CORRECTIONS
    .filter(
      (correction) =>
        correction.expectedCategoryId === "warning"
    )
    .map((correction) => correction.id);
  const allWarningsFound = submittedUnits.filter((unit) =>
    warningIds.every(
      (clueId) =>
        unit.clueClassifications?.[clueId] === "warning"
    )
  ).length;
  warningSignalsSummary.textContent =
    `${allWarningsFound} ${unitLabel}${allWarningsFound === 1 ? " a" : "s ont"} identifié tous les signaux d’alerte.`;
}

function renderFinalDecisionSummary(session) {
  const units = investigationUnits(session);
  const decisions = units
    .map((unit) => unit.finalDecisionId)
    .filter(Boolean);
  const unitLabel = session.participationMode === "group"
    ? "groupe"
    : "participant";
  const expectedCount = decisions.filter(
    (decisionId) =>
      decisionId === EXPECTED_FINAL_DECISION_ID
  ).length;
  const expectedPercentage = decisions.length
    ? Math.round((expectedCount / decisions.length) * 100)
    : 0;

  finalDecisionSummary.textContent =
    `${decisions.length} ${unitLabel}${decisions.length === 1 ? "" : "s"} sur ${units.length} ${decisions.length === 1 ? "a" : "ont"} répondu · ${expectedPercentage} % ont choisi la conduite attendue.`;
  decisionDistributionGrid.replaceChildren();

  FINAL_DECISIONS.forEach((decision) => {
    const count = decisions.filter(
      (decisionId) => decisionId === decision.id
    ).length;
    const percentage = decisions.length
      ? Math.round((count / decisions.length) * 100)
      : 0;
    const card = document.createElement("article");
    const countElement = document.createElement("strong");
    const labelElement = document.createElement("p");
    card.className = "decision-distribution-card";
    countElement.textContent =
      `${count} · ${percentage} %`;
    labelElement.textContent = decision.label;
    card.append(countElement, labelElement);
    decisionDistributionGrid.append(card);
  });
}

function renderEducatorReflexes() {
  educatorReflexesGrid.replaceChildren();
  SIX_REFLEXES.forEach((reflex, index) => {
    const card = document.createElement("article");
    const number = document.createElement("span");
    const title = document.createElement("h3");
    const text = document.createElement("p");
    number.textContent = index + 1;
    title.textContent = reflex.title;
    text.textContent = reflex.text;
    card.className = "reflex-card";
    number.className = "reflex-number";
    card.append(number, title, text);
    educatorReflexesGrid.append(card);
  });
}

function renderSession(session) {
  currentSession = session;
  const connectedParticipants =
    connectedParticipantEntries(session);
  const numberOfParticipants = connectedParticipants.length;
  const listIsCurrent = sameParticipants(
    session.preparedParticipants,
    connectedParticipants
  );

  participantCount.textContent = numberOfParticipants;
  participantCount.nextElementSibling.textContent =
    `participant${numberOfParticipants === 1 ? "" : "s"} connecté${numberOfParticipants === 1 ? "" : "s"}`;
  sessionStatus.textContent = readableStatus(session);
  connectionState.textContent = "Mise à jour en direct";
  waitingPanel.hidden = session.status === "closed";
  closedPanel.hidden = session.status !== "closed";

  formGroupsButton.disabled =
    actionInProgress ||
    session.modeLocked ||
    numberOfParticipants === 0;
  formGroupsButton.textContent = session.modeLocked
    ? "Groupes verrouillés"
    : session.groupsPrepared
      ? "Reconstituer les groupes"
      : "Constituer les groupes";

  launchActivityButton.disabled =
    actionInProgress ||
    session.modeLocked ||
    !session.groupsPrepared ||
    !listIsCurrent;
  launchActivityButton.textContent = session.modeLocked
    ? "Activité lancée"
    : "Lancer l’activité";

  const sessionGroups = Object.values(session.groups || {});
  const allGroupsHaveActiveDevice =
    session.participationMode !== "group" ||
    (
      sessionGroups.length > 0 &&
      sessionGroups.every(
        (group) => group.activeDeviceParticipantId
      )
    );
  const investigationInProgress =
    session.status === "investigation";
  const correctionAvailable = [
    "investigation-correction",
    "final-decision",
    "results"
  ].includes(session.status);
  const investigationRevealed = correctionAvailable;
  const investigationStarted = [
    "investigation",
    "investigation-correction",
    "final-decision",
    "results"
  ].includes(session.status);
  const units = investigationUnits(session);
  const submittedUnitCount = units.filter(
    (unit) => unit.investigationSubmittedAt
  ).length;
  const missingUnitCount = units.length - submittedUnitCount;
  startInvestigationButton.hidden = !session.modeLocked;
  startInvestigationButton.disabled =
    actionInProgress ||
    investigationStarted ||
    !allGroupsHaveActiveDevice;
  startInvestigationButton.textContent = investigationStarted
    ? "Enquête démarrée"
    : "Démarrer l’enquête";
  revealInvestigationButton.hidden =
    !investigationInProgress && !investigationRevealed;
  revealInvestigationButton.disabled =
    actionInProgress || investigationRevealed;
  revealInvestigationButton.textContent = investigationRevealed
    ? "Résultats révélés"
    : "Révéler les résultats";

  if (investigationRevealed) {
    investigationActionMessage.textContent =
      "La correction est affichée sur les téléphones.";
  } else if (investigationInProgress) {
    const unitLabel = session.participationMode === "group"
      ? "groupe"
      : "participant";
    investigationActionMessage.textContent =
      `${submittedUnitCount} ${unitLabel}${submittedUnitCount === 1 ? "" : "s"} sur ${units.length} ${submittedUnitCount === 1 ? "a" : "ont"} validé l’enquête.${missingUnitCount ? ` ${missingUnitCount} ${missingUnitCount === 1 ? "n’a" : "n’ont"} pas terminé.` : " Toutes les enquêtes sont reçues."}`;
  } else if (
    session.modeLocked &&
    !investigationStarted &&
    !allGroupsHaveActiveDevice
  ) {
    investigationActionMessage.textContent =
      "Attendez qu’un téléphone soit choisi dans chaque groupe.";
  } else if (
    session.modeLocked &&
    !investigationStarted &&
    allGroupsHaveActiveDevice
  ) {
    investigationActionMessage.textContent =
      "Tous les téléphones sont prêts. Vous pouvez démarrer l’enquête.";
  }

  groupsPanel.hidden =
    !session.groupsPrepared || session.status === "closed";
  investigationResultsPanel.hidden = !investigationRevealed;
  if (investigationRevealed) {
    renderCorrectionSummary(session);
  }
  launchFinalDecisionButton.disabled =
    actionInProgress ||
    session.status !== "investigation-correction";
  launchFinalDecisionButton.textContent =
    session.status === "investigation-correction"
      ? "Lancer la décision finale"
      : "Décision finale lancée";

  const finalDecisionAvailable = [
    "final-decision",
    "results"
  ].includes(session.status);
  finalDecisionPanel.hidden = !finalDecisionAvailable;
  if (finalDecisionAvailable) {
    renderFinalDecisionSummary(session);
  }
  revealFinalGuidanceButton.disabled =
    actionInProgress || session.status !== "final-decision";
  revealFinalGuidanceButton.textContent =
    session.status === "results"
      ? "Conduite révélée"
      : "Révéler la conduite à adopter";
  finalResultsPanel.hidden = session.status !== "results";
  closeActivityButton.disabled =
    actionInProgress || session.status !== "results";

  if (session.groupsPrepared) {
    const collectiveMode = session.participationMode === "group";
    const activeDeviceCount = sessionGroups.filter(
      (group) => group.activeDeviceParticipantId
    ).length;
    groupsTitle.textContent = collectiveMode
      ? session.modeLocked
        ? "Groupes verrouillés"
        : "Groupes constitués"
      : "Mode individuel";
    groupsDescription.textContent = collectiveMode
      ? session.modeLocked
        ? `${session.participantCountAtPreparation} cyclistes dans ${sessionGroups.length} groupes · ${activeDeviceCount} téléphone${activeDeviceCount > 1 ? "s" : ""} actif${activeDeviceCount > 1 ? "s" : ""} sur ${sessionGroups.length}.`
        : `${session.participantCountAtPreparation} cyclistes répartis dans ${sessionGroups.length} groupes.`
      : (() => {
        const participantId = Object.keys(
          session.preparedParticipants || {}
        )[0];
        const participant = session.participants?.[participantId];
        if (
          session.status !== "investigation" &&
          session.status !== "investigation-correction"
        ) {
          return "Un seul cycliste : l’activité sera réalisée individuellement.";
        }
        if (participant?.investigationSubmittedAt) {
          return "L’enquête individuelle a été validée.";
        }
        const inspectedCount = Object.keys(
          participant?.inspectedClues || {}
        ).length;
        return `Progression individuelle : ${inspectedCount} indice${inspectedCount > 1 ? "s" : ""} examiné${inspectedCount > 1 ? "s" : ""} sur 7.`;
      })();
    groupsGrid.hidden = !collectiveMode;
    renderGroups(sessionGroups);
  }

  if (
    session.groupsPrepared &&
    !session.modeLocked &&
    !listIsCurrent
  ) {
    actionMessage.textContent =
      "La liste des cyclistes a changé. Reconstituez les groupes avant de lancer.";
  }
}

async function startInvestigation() {
  if (
    actionInProgress ||
    !currentSession?.modeLocked ||
    currentSession.status === "investigation"
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
    investigationActionMessage.textContent =
      "Un téléphone doit être choisi dans chaque groupe.";
    return;
  }

  actionInProgress = true;
  startInvestigationButton.disabled = true;
  investigationActionMessage.textContent =
    "Ouverture de l’enquête…";

  try {
    await update(
      ref(database, `sessions/${sessionCode}`),
      {
        status: "investigation",
        investigationStartedAt: serverTimestamp()
      }
    );
    investigationActionMessage.textContent =
      "L’enquête est ouverte.";
  } catch (error) {
    console.error("Ouverture de l’enquête impossible :", error);
    investigationActionMessage.textContent =
      "L’enquête n’a pas pu être ouverte.";
  } finally {
    actionInProgress = false;
    if (currentSession) renderSession(currentSession);
  }
}

async function revealInvestigationResults() {
  if (
    actionInProgress ||
    currentSession?.status !== "investigation"
  ) {
    return;
  }

  actionInProgress = true;
  revealInvestigationButton.disabled = true;
  investigationActionMessage.textContent =
    "Publication de la correction…";

  try {
    const publishedCorrection = Object.fromEntries(
      INVESTIGATION_CORRECTIONS.map((correction) => [
        correction.id,
        {
          label: correction.label,
          expectedAnswerId: correction.expectedAnswerId,
          expectedCategoryId: correction.expectedCategoryId,
          expectedCategoryLabel:
            correction.expectedCategoryLabel,
          explanation: correction.explanation
        }
      ])
    );

    await update(
      ref(database, `sessions/${sessionCode}`),
      {
        status: "investigation-correction",
        correctionRevealed: true,
        correctionRevealedAt: serverTimestamp(),
        publishedInvestigationCorrection: publishedCorrection
      }
    );
    investigationActionMessage.textContent =
      "La correction est publiée.";
  } catch (error) {
    console.error("Publication de la correction impossible :", error);
    investigationActionMessage.textContent =
      "La correction n’a pas pu être publiée.";
    revealInvestigationButton.disabled = false;
  } finally {
    actionInProgress = false;
    if (currentSession) renderSession(currentSession);
  }
}

async function launchFinalDecision() {
  if (
    actionInProgress ||
    currentSession?.status !== "investigation-correction"
  ) {
    return;
  }

  actionInProgress = true;
  launchFinalDecisionButton.disabled = true;

  try {
    await update(
      ref(database, `sessions/${sessionCode}`),
      {
        status: "final-decision",
        finalDecisionStartedAt: serverTimestamp()
      }
    );
  } catch (error) {
    console.error("Décision finale non lancée :", error);
    launchFinalDecisionButton.disabled = false;
  } finally {
    actionInProgress = false;
    if (currentSession) renderSession(currentSession);
  }
}

async function revealFinalGuidance() {
  if (
    actionInProgress ||
    currentSession?.status !== "final-decision"
  ) {
    return;
  }

  actionInProgress = true;
  revealFinalGuidanceButton.disabled = true;

  try {
    await update(
      ref(database, `sessions/${sessionCode}`),
      {
        status: "results",
        finalDecisionRevealed: true,
        finalDecisionRevealedAt: serverTimestamp(),
        publishedFinalGuidance: {
          ...FINAL_GUIDANCE,
          reflexes: SIX_REFLEXES
        }
      }
    );
  } catch (error) {
    console.error("Conduite non révélée :", error);
    revealFinalGuidanceButton.disabled = false;
  } finally {
    actionInProgress = false;
    if (currentSession) renderSession(currentSession);
  }
}

async function closeActivity() {
  if (
    actionInProgress ||
    currentSession?.status !== "results"
  ) {
    return;
  }

  actionInProgress = true;
  closeActivityButton.disabled = true;
  closeActivityButton.textContent = "Clôture en cours…";

  try {
    await update(
      ref(database, `sessions/${sessionCode}`),
      {
        status: "closed",
        closedAt: serverTimestamp(),
        takeHomeMessage: FINAL_GUIDANCE.takeHome
      }
    );
  } catch (error) {
    console.error("Clôture impossible :", error);
    closeActivityButton.disabled = false;
    closeActivityButton.textContent = "Clôturer l’activité";
  } finally {
    actionInProgress = false;
    if (currentSession) renderSession(currentSession);
  }
}

async function formGroups() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.modeLocked
  ) {
    return;
  }

  const participants = connectedParticipantEntries(currentSession);
  if (!participants.length) {
    actionMessage.textContent =
      "Au moins un cycliste doit être connecté.";
    return;
  }

  const participationMode =
    participants.length >= 2 ? "group" : "individual";
  const groups = participationMode === "group"
    ? buildGroups(participants)
    : [];
  const changes = {
    participationMode,
    participantCountAtPreparation: participants.length,
    preparedParticipants: Object.fromEntries(
      participants.map(([uid]) => [uid, true])
    ),
    groupsPrepared: true,
    groupsLocked: false,
    modeLocked: false,
    status: "grouping",
    groupsPreparedAt: serverTimestamp(),
    groups: participationMode === "group"
      ? Object.fromEntries(
        groups.map((group) => {
          const { memberIds, ...storedGroup } = group;
          return [group.id, storedGroup];
        })
      )
      : null
  };

  Object.keys(currentSession.participants || {}).forEach((uid) => {
    changes[`participants/${uid}/groupId`] = null;
  });

  if (participationMode === "group") {
    groups.forEach((group) => {
      group.memberIds.forEach((uid) => {
        changes[`participants/${uid}/groupId`] = group.id;
        changes[`participants/${uid}/status`] = "group-assigned";
      });
    });
  } else {
    const [uid, participant] = participants[0];
    changes[`participants/${uid}/status`] = "individual-ready";
    changes[`participants/${uid}/variantSeed`] =
      participant.variantSeed || randomVariantSeed();
  }

  actionInProgress = true;
  formGroupsButton.disabled = true;
  launchActivityButton.disabled = true;
  actionMessage.textContent = "Constitution en cours…";

  try {
    await update(
      ref(database, `sessions/${sessionCode}`),
      changes
    );
    actionMessage.textContent = participationMode === "group"
      ? "Les groupes sont prêts. Vous pouvez relancer le tirage ou lancer l’activité."
      : "Le mode individuel est prêt. Vous pouvez lancer l’activité.";
  } catch (error) {
    console.error("Constitution des groupes impossible :", error);
    actionMessage.textContent =
      "La répartition n’a pas pu être enregistrée.";
  } finally {
    actionInProgress = false;
    renderSession(currentSession);
  }
}

async function launchActivity() {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.modeLocked ||
    !currentSession.groupsPrepared
  ) {
    return;
  }

  const connectedParticipants =
    connectedParticipantEntries(currentSession);
  if (!sameParticipants(
    currentSession.preparedParticipants,
    connectedParticipants
  )) {
    actionMessage.textContent =
      "La liste des cyclistes a changé. Reconstituez les groupes avant de lancer.";
    return;
  }

  actionInProgress = true;
  formGroupsButton.disabled = true;
  launchActivityButton.disabled = true;
  actionMessage.textContent = "Lancement en cours…";

  try {
    await update(
      ref(database, `sessions/${sessionCode}`),
      {
        participantCountAtLaunch: connectedParticipants.length,
        modeLocked: true,
        groupsLocked: true,
        activityLaunchedAt: serverTimestamp(),
        status: currentSession.participationMode === "group"
          ? "group-device-selection"
          : "participation-ready"
      }
    );
    actionMessage.textContent =
      "L’activité est lancée et la répartition est verrouillée.";
  } catch (error) {
    console.error("Lancement impossible :", error);
    actionMessage.textContent =
      "L’activité n’a pas pu être lancée.";
  } finally {
    actionInProgress = false;
    renderSession(currentSession);
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

formGroupsButton.addEventListener("click", formGroups);
launchActivityButton.addEventListener("click", launchActivity);
startInvestigationButton.addEventListener(
  "click",
  startInvestigation
);
revealInvestigationButton.addEventListener(
  "click",
  revealInvestigationResults
);
launchFinalDecisionButton.addEventListener(
  "click",
  launchFinalDecision
);
revealFinalGuidanceButton.addEventListener(
  "click",
  revealFinalGuidance
);
closeActivityButton.addEventListener("click", closeActivity);
showReflexesButton.addEventListener("click", () => {
  renderEducatorReflexes();
  reflexesOverlay.hidden = false;
  closeReflexesButton.focus();
});
closeReflexesButton.addEventListener("click", () => {
  reflexesOverlay.hidden = true;
  showReflexesButton.focus();
});
reflexesOverlay.addEventListener("click", (event) => {
  if (event.target === reflexesOverlay) {
    reflexesOverlay.hidden = true;
    showReflexesButton.focus();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !reflexesOverlay.hidden) {
    reflexesOverlay.hidden = true;
    showReflexesButton.focus();
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user || user.isAnonymous) {
    showLogin();
    return;
  }
  openDashboard(user);
});
