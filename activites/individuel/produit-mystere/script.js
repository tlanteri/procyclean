const CLUES = [
  {
    id: "advertising-promises",
    label: "Promesses publicitaires",
    shortLabel: "Promesse de résultat",
    information: "Le produit promet une récupération très rapide et des résultats visibles dès les premiers jours.",
    question: "Cette promesse suffit-elle à prouver l’efficacité et la sécurité du produit ?",
    answers: [
      ["promise-proves-safety", "Oui"],
      ["promise-is-not-proof", "Non"],
      ["promise-uncertain", "Je ne sais pas encore"]
    ],
    expectedAnswerId: "promise-is-not-proof",
    expectedCategoryId: "warning",
    explanation: "Une promesse publicitaire n’est pas une preuve scientifique. Une promesse de résultat rapide ou exceptionnel constitue un signal d’alerte."
  },
  {
    id: "incomplete-composition",
    label: "Composition",
    shortLabel: "Liste de la composition",
    information: "La liste des ingrédients est incomplète. Certains sont regroupés sous l’expression « mélange exclusif ».",
    question: "Peut-on connaître précisément tout ce que contient le produit ?",
    answers: [
      ["composition-fully-known", "Oui"],
      ["composition-not-fully-known", "Non"],
      ["composition-not-important", "Ce n’est pas important"]
    ],
    expectedAnswerId: "composition-not-fully-known",
    expectedCategoryId: "warning",
    explanation: "Une composition incomplète empêche de vérifier précisément le contenu du produit. Cela constitue un signal d’alerte."
  },
  {
    id: "purchase-channel",
    label: "Lieu d’achat",
    shortLabel: "Vente sur un réseau social",
    information: "Le produit est vendu sur un réseau social par un influenceur. Le fabricant fournit peu d’informations et aucun contact clair.",
    question: "Ce mode d’achat est-il suffisamment rassurant ?",
    answers: [
      ["channel-trusted-because-athlete", "Oui, parce que l’influenceur est sportif"],
      ["seller-traceability-insufficient", "Non, la traçabilité du vendeur est insuffisante"],
      ["channel-trusted-if-cheaper", "Oui, si le produit est moins cher"]
    ],
    expectedAnswerId: "seller-traceability-insufficient",
    expectedCategoryId: "warning",
    explanation: "La recommandation d’un sportif ne garantit ni la qualité ni la conformité. Un vendeur ou un fabricant peu identifiable et un site peu traçable constituent des signaux d’alerte. À l’inverse, l’achat en pharmacie peut améliorer la traçabilité et permettre de demander conseil, mais il ne rend pas automatiquement le complément nécessaire ou sans risque."
  },
  {
    id: "natural-claim",
    label: "Mention « 100 % naturel »",
    shortLabel: "Mention « 100 % naturel »",
    information: "L’étiquette présente le produit comme « 100 % naturel ».",
    question: "Un produit naturel est-il forcément sans risque au regard de l’antidopage ?",
    answers: [
      ["natural-always-safe", "Oui"],
      ["natural-not-always-safe", "Non"],
      ["natural-safe-outside-competition", "Seulement hors compétition"]
    ],
    expectedAnswerId: "natural-not-always-safe",
    expectedCategoryId: "vigilance",
    explanation: "Le mot « naturel » ne garantit ni l’efficacité, ni la sécurité, ni l’absence de substance interdite."
  },
  {
    id: "laboratory-claim",
    label: "Mention « Testé en laboratoire »",
    shortLabel: "Testé en laboratoire",
    information: "L’emballage indique « Testé en laboratoire », sans préciser le laboratoire, les substances recherchées ni la méthode.",
    question: "Cette mention apporte-t-elle une garantie suffisante ?",
    answers: [
      ["lab-claim-sufficient", "Oui"],
      ["lab-claim-insufficient", "Non"],
      ["lab-claim-label-is-enough", "Oui, si elle est écrite sur l’emballage"]
    ],
    expectedAnswerId: "lab-claim-insufficient",
    expectedCategoryId: "vigilance",
    explanation: "Cette affirmation ne suffit pas. Il faut savoir quel laboratoire a réalisé l’analyse, ce qui a été recherché et si le résultat concerne précisément ce lot."
  },
  {
    id: "certification-standard",
    label: "Certification ou norme",
    shortLabel: "Norme de qualité",
    information: "Aucun logo de certification reconnue ni référence à la norme AFNOR NF EN 17444 n’apparaît.",
    question: "Quelle conclusion raisonnable tirer de cette absence ?",
    answers: [
      ["absence-means-automatically-banned", "Le produit est automatiquement interdit"],
      ["risk-control-insufficiently-documented", "Le niveau de maîtrise du risque est insuffisamment documenté"],
      ["absence-makes-no-difference", "Cela ne change rien"]
    ],
    expectedAnswerId: "risk-control-insufficiently-documented",
    expectedCategoryId: "vigilance",
    explanation: "Une norme reconnue comme la NF EN 17444 contribue à réduire le risque de présence de substances interdites, mais elle ne garantit pas un risque zéro."
  },
  {
    id: "batch-traceability",
    label: "Numéro de lot et traçabilité",
    shortLabel: "Numéro de lot",
    information: "Le pot porte le numéro de lot PMR-2407-B18 et indique une fabrication en juin 2026.",
    question: "Pourquoi ces informations sont-elles importantes ?",
    answers: [
      ["batch-identifies-product", "Elles permettent d’identifier et de conserver la trace du produit"],
      ["batch-for-store-only", "Elles servent uniquement au magasin"],
      ["batch-only-for-expiry", "Elles ne sont utiles que lorsque le produit est périmé"]
    ],
    expectedAnswerId: "batch-identifies-product",
    expectedCategoryId: "reassuring",
    explanation: "Le numéro de lot facilite la traçabilité et constitue une information utile pour évaluer le produit, sans garantir à lui seul sa sécurité."
  }
];

const CATEGORIES = [
  ["reassuring", "✓", "Information utile pour évaluer le produit"],
  ["vigilance", "⚠", "Information à vérifier"],
  ["warning", "!", "Signal d’alerte"]
];

const FINAL_DECISIONS = [
  ["follow-teammate", "Prendre le produit parce qu’un coéquipier l’utilise déjà."],
  ["reassuring-information", "Prendre le produit parce que plusieurs informations semblent rassurantes."],
  ["never-supplement", "Ne jamais utiliser de complément alimentaire, quelle que soit la situation."],
  ["assess-need-and-guarantees", "Ne pas le consommer pour le moment, demander à un professionnel d’évaluer son besoin et, si une utilisation est envisagée, choisir un produit présentant le plus de garanties possible."]
];

const REFLEXES = [
  ["Questionner mon intention", "Je me demande pourquoi je souhaite prendre un complément."],
  ["Faire évaluer mon besoin", "Je fais évaluer mon besoin par un professionnel compétent."],
  ["Privilégier l’alimentation", "Je privilégie une alimentation adaptée lorsque cela peut répondre au besoin."],
  ["Vérifier le produit", "Si un complément est envisagé, je vérifie sa composition, son origine et sa traçabilité."],
  ["Rechercher une norme", "Je privilégie un produit répondant à une norme reconnue."],
  ["Conserver les preuves", "Je conserve l’emballage, le numéro de lot, la facture et les informations concernant son utilisation."]
];

const screens = [...document.querySelectorAll(".screen")];
const clueButtons = document.querySelector("#clue-buttons");
const clueAnswers = document.querySelector("#clue-answers");
const rankingList = document.querySelector("#ranking-list");
const finalDecisionOptions = document.querySelector("#final-decision-options");
const prospectusViewer = document.querySelector("#prospectus-viewer");
const prospectusImage = document.querySelector("#prospectus-image");
const magnifierLens = document.querySelector("#magnifier-lens");
const inspectionZones = document.querySelector(
  "#inspection-screen .inspection-zones"
);

let state = createInitialState();
let activeClueId = "";
let selectedFinalDecisionId = "";
let prospectusViewIndex = 0;
let magnifierEnabled = false;
let magnification = 2;
let lensPosition = { x: 0.5, y: 0.5 };

function updateOverallProgress(value) {
  window.dispatchEvent(new CustomEvent("procyclean:activity-progress", {
    detail: { value }
  }));
}

function createInitialState() {
  return {
    inspectedClues: {},
    clueClassifications: {}
  };
}

function focusActivityElement(element) {
  const focus = () => {
    const bounds = element.getBoundingClientRect();
    const visibleHeight = Math.min(bounds.height, window.innerHeight - 32);
    const targetTop = Math.max(
      0,
      window.scrollY + bounds.top -
        (window.innerHeight - visibleHeight) / 2
    );
    window.scrollTo({ top: targetTop, behavior: "auto" });
  };
  requestAnimationFrame(() => {
    focus();
    requestAnimationFrame(focus);
  });
}

function showOnly(screenId, { scrollTop = true } = {}) {
  screens.forEach((screen) => {
    screen.hidden = screen.id !== screenId;
  });
  if (scrollTop) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const screenProgress = {
    "mission-screen": 5,
    "need-screen": 10,
    "inspection-screen": 15,
    "clue-screen": 15,
    "ranking-screen": 58,
    "investigation-correction-screen": 75,
    "final-decision-screen": 85,
    "final-guidance-screen": 100
  };
  updateOverallProgress(screenProgress[screenId] || 5);
}

function answerLabel(clue, answerId) {
  return clue.answers.find(([id]) => id === answerId)?.[1] || "Non répondu";
}

function categoryLabel(categoryId) {
  return CATEGORIES.find(([id]) => id === categoryId)?.[2] || "Non classé";
}

function renderInspection({ focusZones = false } = {}) {
  const answeredCount = Object.values(state.inspectedClues)
    .filter((clue) => clue.answerId).length;
  document.querySelector("#inspection-progress").textContent =
    `${answeredCount} indice${answeredCount > 1 ? "s" : ""} examiné${answeredCount > 1 ? "s" : ""} sur 7`;
  clueButtons.replaceChildren();

  CLUES.forEach((clue, index) => {
    const saved = state.inspectedClues[clue.id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `clue-zone${saved?.answerId ? " is-complete" : ""}`;
    button.dataset.clueId = clue.id;
    button.innerHTML = `
      <span>${index + 1}</span>
      <strong>${clue.label}</strong>
      <small>${saved?.answerId ? "Réponse enregistrée ✓" : "À examiner"}</small>`;
    clueButtons.append(button);
  });

  document.querySelector("#open-ranking-button").disabled =
    answeredCount !== CLUES.length;
  document.querySelector("#inspection-message").textContent =
    answeredCount === CLUES.length
      ? "Les sept réponses sont enregistrées. Tu peux passer au classement."
      : `Réponses enregistrées : ${answeredCount} sur ${CLUES.length}.`;
  showOnly("inspection-screen", { scrollTop: !focusZones });
  updateOverallProgress(15 + (answeredCount / CLUES.length) * 40);
  if (focusZones) focusActivityElement(inspectionZones);
  requestAnimationFrame(updateMagnifier);
}

function renderClue(clueId) {
  const clue = CLUES.find((item) => item.id === clueId);
  if (!clue) return;
  activeClueId = clueId;
  const savedAnswer = state.inspectedClues[clueId]?.answerId || "";
  document.querySelector("#clue-number").textContent =
    `Indice ${CLUES.indexOf(clue) + 1} sur 7`;
  document.querySelector("#clue-title").textContent = clue.label;
  document.querySelector("#clue-information").textContent = clue.information;
  document.querySelector("#clue-question").textContent = clue.question;
  clueAnswers.replaceChildren();
  clue.answers.forEach(([id, labelText]) => {
    const label = document.createElement("label");
    label.className = "answer-option";
    label.innerHTML = `
      <input type="radio" name="clue-answer" value="${id}"
        ${savedAnswer === id ? "checked" : ""}>
      <span>${labelText}</span>`;
    clueAnswers.append(label);
  });
  document.querySelector("#clue-message").textContent = "";
  showOnly("clue-screen", { scrollTop: false });
  focusActivityElement(document.querySelector("#clue-form"));
}

function renderRanking({ focusClueId = "" } = {}) {
  const rankedCount = Object.keys(state.clueClassifications).length;
  rankingList.replaceChildren();
  CLUES.forEach((clue) => {
    const selected = state.clueClassifications[clue.id];
    const card = document.createElement("article");
    card.className = "ranking-card";
    card.dataset.clueId = clue.id;
    card.innerHTML = `
      <h3>${clue.shortLabel}</h3>
      <div class="category-buttons" role="group"
        aria-label="Classement de ${clue.shortLabel}">
        ${CATEGORIES.map(([id, symbol, label]) => `
          <button type="button" data-clue-id="${clue.id}"
            data-category-id="${id}"
            class="${selected === id ? "is-selected" : ""}"
            aria-pressed="${selected === id}">
            <span aria-hidden="true">${symbol}</span>${label}
          </button>`).join("")}
      </div>`;
    rankingList.append(card);
  });
  document.querySelector("#ranking-summary").textContent =
    rankedCount === CLUES.length
      ? `Synthèse · ${CATEGORIES.map(([id, symbol, label]) =>
        `${symbol} ${label} : ${Object.values(state.clueClassifications).filter((value) => value === id).length}`
      ).join(" · ")}`
      : `${rankedCount} indice${rankedCount > 1 ? "s" : ""} classé${rankedCount > 1 ? "s" : ""} sur 7`;
  document.querySelector("#submit-investigation-button").disabled =
    rankedCount !== CLUES.length;
  showOnly("ranking-screen", { scrollTop: !focusClueId });
  updateOverallProgress(58 + (rankedCount / CLUES.length) * 12);
  if (focusClueId) {
    const focusedCard = rankingList.querySelector(
      `.ranking-card[data-clue-id="${focusClueId}"]`
    );
    if (focusedCard) focusActivityElement(focusedCard);
  }
}

function appendCorrectionLine(card, label, value, coherent) {
  const line = document.createElement("p");
  line.innerHTML = `<strong>${label} : </strong>`;
  line.append(document.createTextNode(value));
  const status = document.createElement("span");
  status.className = coherent ? "coherent-result" : "review-result";
  status.textContent = coherent ? " ✓ Cohérent" : " ◇ À reconsidérer";
  line.append(status);
  card.append(line);
}

function renderCorrection() {
  CLUES.forEach((clue,i)=>window.ProcycleanGroup?.record("3-classement-"+i, clue.shortLabel+" : comment classer cet indice ?", categoryLabel(state.clueClassifications[clue.id]), categoryLabel(clue.expectedCategoryId), clue.explanation, state.clueClassifications[clue.id]===clue.expectedCategoryId));
  const list = document.querySelector("#investigation-correction-list");
  list.replaceChildren();
  CLUES.forEach((clue) => {
    const answerId = state.inspectedClues[clue.id]?.answerId;
    const categoryId = state.clueClassifications[clue.id];
    const card = document.createElement("article");
    card.className = "investigation-correction-card";
    const title = document.createElement("h3");
    title.textContent = clue.shortLabel;
    card.append(title);
    appendCorrectionLine(card, "Ta réponse", answerLabel(clue, answerId),
      answerId === clue.expectedAnswerId);
    appendCorrectionLine(card, "Ton classement", categoryLabel(categoryId),
      categoryId === clue.expectedCategoryId);
    const reminder = document.createElement("p");
    reminder.className = "expected-category";
    reminder.textContent = "À retenir !";
    const explanation = document.createElement("p");
    explanation.className = "correction-explanation";
    explanation.textContent = clue.explanation;
    card.append(reminder, explanation);
    list.append(card);
  });
  showOnly("investigation-correction-screen");
}

function renderFinalDecision() {
  finalDecisionOptions.replaceChildren();
  FINAL_DECISIONS.forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `final-decision-option${selectedFinalDecisionId === id ? " selected" : ""}`;
    button.dataset.decisionId = id;
    button.setAttribute("aria-pressed", String(selectedFinalDecisionId === id));
    button.textContent = label;
    finalDecisionOptions.append(button);
  });
  document.querySelector("#submit-final-decision-button").disabled =
    !selectedFinalDecisionId;
  showOnly("final-decision-screen");
}

function renderGuidance() {
  if(selectedFinalDecisionId)window.ProcycleanGroup?.record("4-decision", "Quelle décision prenez-vous pour ce produit ?", FINAL_DECISIONS.find(x=>x[0]===selectedFinalDecisionId)?.[1], FINAL_DECISIONS.find(x=>x[0]==="assess-need-and-guarantees")?.[1], "Demandez conseil et vérifiez le besoin avant toute consommation.", selectedFinalDecisionId==="assess-need-and-guarantees");
  const choiceIsExpected =
    selectedFinalDecisionId === "assess-need-and-guarantees";
  document.querySelector("#final-guidance-main").textContent =
    `${choiceIsExpected ? "Ta décision correspond à la conduite recommandée. " : "Ta décision mérite d’être reconsidérée. "}La bonne décision ne dépend pas uniquement de l’emballage. Elle commence par l’évaluation du besoin, puis par une discussion avec un professionnel. Si un complément est envisagé, il faut réduire les risques au maximum.`;
  document.querySelector("#final-guidance-responsibility").textContent =
    "Aucun complément alimentaire et aucune certification ne garantissent un risque zéro. Le sportif reste responsable des substances retrouvées dans son organisme.";
  document.querySelector("#final-take-home-message").textContent =
    "Avec les compléments alimentaires, le risque zéro n’existe pas. Le meilleur moyen de réduire ce risque est d’évaluer d’abord son besoin, de demander conseil et de vérifier précisément le produit.";
  document.querySelector("#final-highlight-message").textContent =
    "Naturel ne veut pas dire sans risque.";
  const grid = document.querySelector("#participant-reflexes-grid");
  grid.replaceChildren();
  REFLEXES.forEach(([titleText, body], index) => {
    const card = document.createElement("article");
    card.className = "reflex-card";
    card.innerHTML = `
      <span class="reflex-number">${index + 1}</span>
      <h4>${titleText}</h4>
      <p>${body}</p>`;
    grid.append(card);
  });
  showOnly("final-guidance-screen");
}

function setProspectusView(index) {
  prospectusViewIndex = index === 1 ? 1 : 0;
  prospectusImage.classList.toggle("show-back-view", prospectusViewIndex === 1);
  document.querySelector("#show-front-view").setAttribute(
    "aria-selected", String(prospectusViewIndex === 0));
  document.querySelector("#show-back-view").setAttribute(
    "aria-selected", String(prospectusViewIndex === 1));
  updateMagnifier();
}

function setMagnifierEnabled(enabled) {
  magnifierEnabled = Boolean(enabled);
  prospectusViewer.classList.toggle("magnifier-enabled", magnifierEnabled);
  const button = document.querySelector("#toggle-magnifier");
  button.setAttribute("aria-pressed", String(magnifierEnabled));
  button.textContent = magnifierEnabled ? "✓ Loupe activée" : "🔍 Activer la loupe";
  updateMagnifier();
}

function updateMagnifier() {
  const rectangle = prospectusViewer.getBoundingClientRect();
  if (!rectangle.width || !rectangle.height) return;
  const lensSize = magnifierLens.offsetWidth || 150;
  const x = lensPosition.x * rectangle.width;
  const y = lensPosition.y * rectangle.height;
  magnifierLens.style.left =
    `${Math.min(Math.max(x - lensSize / 2, 0), rectangle.width - lensSize)}px`;
  magnifierLens.style.top =
    `${Math.min(Math.max(y - lensSize / 2, 0), rectangle.height - lensSize)}px`;
  magnifierLens.style.backgroundImage = `url("${prospectusImage.src}")`;
  magnifierLens.style.backgroundSize =
    `${rectangle.width * 2 * magnification}px ${rectangle.height * magnification}px`;
  magnifierLens.style.backgroundPosition =
    `${lensSize / 2 - (prospectusViewIndex * rectangle.width + x) * magnification}px ${lensSize / 2 - y * magnification}px`;
  document.querySelector("#magnification-level").textContent =
    `Zoom ×${magnification.toFixed(1).replace(".0", "")}`;
}

function moveLens(event) {
  if (!magnifierEnabled) return;
  const rectangle = prospectusViewer.getBoundingClientRect();
  lensPosition = {
    x: Math.min(Math.max((event.clientX - rectangle.left) / rectangle.width, 0), 1),
    y: Math.min(Math.max((event.clientY - rectangle.top) / rectangle.height, 0), 1)
  };
  updateMagnifier();
}

document.querySelector("#start-mission-button").addEventListener("click", () => showOnly("need-screen"));
document.querySelector("#need-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = new FormData(event.currentTarget).get("need-answer");
  if (!answer) {
    document.querySelector("#need-message").textContent =
      "Choisis une réponse avant de continuer.";
    return;
  }
  document.querySelector("#need-message").textContent = "";
  window.ProcycleanGroup?.record("1-besoin", "Quel est le premier réflexe avant d’utiliser un complément ?", window.ProcycleanGroup.formAnswers(event.currentTarget), "Commencer par évaluer le besoin avec un professionnel de santé.", "", answer==="need");
  document.querySelector("#need-feedback-title").textContent = answer === "need"
    ? "Bonne réponse : commencer par évaluer le besoin"
    : "Le premier réflexe : commencer par évaluer le besoin";
  document.querySelectorAll('[name="need-answer"]').forEach((input) => {
    input.disabled = true;
    input.closest("label").classList.toggle("is-correct", input.value === "need");
    input.closest("label").classList.toggle("is-wrong", input.checked && input.value !== "need");
  });
  document.querySelector("#validate-need-button").hidden = true;
  document.querySelector("#need-feedback").hidden = false;
  updateOverallProgress(14);
});
document.querySelector("#continue-to-inspection").addEventListener("click", renderInspection);
clueButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-clue-id]");
  if (button) renderClue(button.dataset.clueId);
});
document.querySelector("#back-to-product-button").addEventListener("click", renderInspection);
document.querySelector("#clue-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = new FormData(event.currentTarget).get("clue-answer");
  if (!answer) {
    document.querySelector("#clue-message").textContent =
      "Choisis une réponse avant de continuer.";
    return;
  }
  state.inspectedClues[activeClueId] = { answerId: String(answer) };
  const clue = CLUES.find(x=>x.id===activeClueId);
  window.ProcycleanGroup?.record("2-indice-"+CLUES.indexOf(clue), clue.question, answerLabel(clue,answer), answerLabel(clue,clue.expectedAnswerId), clue.explanation, answer===clue.expectedAnswerId);
  renderInspection({ focusZones: true });
});
document.querySelector("#open-ranking-button").addEventListener("click", renderRanking);
document.querySelector("#back-to-inspection-button").addEventListener("click", renderInspection);
rankingList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category-id]");
  if (!button) return;
  state.clueClassifications[button.dataset.clueId] = button.dataset.categoryId;
  renderRanking({ focusClueId: button.dataset.clueId });
});
document.querySelector("#submit-investigation-button").addEventListener("click", renderCorrection);
document.querySelector("#continue-to-decision").addEventListener("click", renderFinalDecision);
finalDecisionOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-decision-id]");
  if (!button) return;
  selectedFinalDecisionId = button.dataset.decisionId;
  renderFinalDecision();
});
document.querySelector("#submit-final-decision-button").addEventListener("click", renderGuidance);
document.querySelector("#restart-activity").addEventListener("click", () => {
  state = createInitialState();
  activeClueId = "";
  selectedFinalDecisionId = "";
  setMagnifierEnabled(false);
  setProspectusView(0);
  document.querySelector("#need-form").reset();
  document.querySelectorAll('[name="need-answer"]').forEach((input) => {
    input.disabled = false;
    input.closest("label").classList.remove("is-correct", "is-wrong");
  });
  document.querySelector("#validate-need-button").hidden = false;
  document.querySelector("#need-feedback").hidden = true;
  showOnly("mission-screen");
});
document.querySelector("#show-front-view").addEventListener("click", () => setProspectusView(0));
document.querySelector("#show-back-view").addEventListener("click", () => setProspectusView(1));
document.querySelector("#toggle-magnifier").addEventListener("click", () =>
  setMagnifierEnabled(!magnifierEnabled));
document.querySelector("#decrease-magnification").addEventListener("click", () => {
  magnification = Math.max(1.5, magnification - 0.5);
  updateMagnifier();
});
document.querySelector("#increase-magnification").addEventListener("click", () => {
  magnification = Math.min(3.5, magnification + 0.5);
  updateMagnifier();
});
prospectusViewer.addEventListener("pointerdown", moveLens);
prospectusViewer.addEventListener("pointermove", moveLens);
prospectusImage.addEventListener("load", updateMagnifier);
window.addEventListener("resize", updateMagnifier);
document.documentElement.dataset.individualProductReady = "true";


// Synchronisation de ce même parcours lorsqu’il est ouvert dans une séance.
window.ProcycleanGroup?.register({
 snapshot:()=>({state:{data:state,activeClueId,selectedFinalDecisionId,screen:screens.find(x=>!x.hidden)?.id},progress:!document.querySelector("#final-guidance-screen").hidden?100:Object.keys(state.inspectedClues).length/CLUES.length*50+Object.keys(state.clueClassifications).length/CLUES.length*35,complete:!document.querySelector("#final-guidance-screen").hidden}),
 restore:s=>{state=s.data;activeClueId=s.activeClueId;selectedFinalDecisionId=s.selectedFinalDecisionId;
 const renderers={"inspection-screen":renderInspection,"clue-screen":()=>renderClue(activeClueId),"ranking-screen":renderRanking,"investigation-correction-screen":renderCorrection,"final-decision-screen":renderFinalDecision,"final-guidance-screen":renderGuidance};
 if(renderers[s.screen])renderers[s.screen]();else showOnly(s.screen||"mission-screen");}
});
