const selectionScreen = document.querySelector("#activity-selection");
const runnerScreen = document.querySelector("#activity-runner");
const activityContent = document.querySelector("#activity-content");
const backButton = document.querySelector("#back-to-selection");

const VALUES = [
  "Respect", "Honnêteté", "Équité", "Santé", "Plaisir",
  "Excellence", "Solidarité", "Courage", "Persévérance", "Responsabilité"
];

const TRUE_FALSE_QUESTIONS = [
  {
    text: "Le sport propre, c’est seulement ne pas se doper.",
    answer: false,
    explanation: "Le sport propre repose aussi sur le respect des règles, de sa santé, des autres et des valeurs du sport."
  },
  {
    text: "Un sportif peut être sanctionné même s’il n’avait pas l’intention de se doper.",
    answer: true,
    explanation: "Le sportif est responsable des substances retrouvées dans son organisme, même sans intention de tricher."
  },
  {
    text: "Un complément alimentaire « naturel » est forcément sans danger au regard des règles antidopage.",
    answer: false,
    explanation: "Un produit naturel peut contenir une substance interdite ou être contaminé. Il faut demander conseil avant de le consommer."
  },
  {
    text: "Avant de prendre un médicament, un sportif doit vérifier s’il est autorisé.",
    answer: true,
    explanation: "Certains médicaments contiennent des substances interdites. Il faut toujours les vérifier et signaler sa pratique sportive."
  },
  {
    text: "Toutes les substances interdites le sont tout le temps et dans tous les sports.",
    answer: false,
    explanation: "Certaines sont interdites en permanence, d’autres seulement en compétition ou dans certains sports."
  },
  {
    text: "Un sportif peut être contrôlé en compétition et hors compétition, sans être prévenu à l’avance.",
    answer: true,
    explanation: "Un contrôle peut avoir lieu en compétition ou hors compétition, sans avertissement préalable."
  },
  {
    text: "Refuser un contrôle antidopage n’est pas une violation si on n’a rien pris.",
    answer: false,
    explanation: "Refuser, éviter ou ne pas se présenter à un contrôle peut constituer une violation des règles antidopage."
  },
  {
    text: "Pendant un contrôle, le sportif peut demander des renseignements et être accompagné.",
    answer: true,
    explanation: "Le sportif a des droits : il peut poser des questions et, selon les règles applicables, être accompagné."
  }
];

const CONTROL_STEPS = [
  ["Notification au sportif", "Le sportif est informé de sa sélection et suit les consignes de l’agent."],
  ["Accueil au poste de contrôle", "L’identité du sportif et les informations utiles sont vérifiées."],
  ["Choix d’un gobelet de recueil", "Le sportif choisit lui-même un gobelet encore scellé."],
  ["Observation de la miction", "L’échantillon est produit sous l’observation d’un agent du même sexe."],
  ["90 ml d’urine minimum", "Un volume d’au moins 90 ml est nécessaire."],
  ["Choix d’un kit de prélèvement", "Le sportif choisit un kit sécurisé comprenant les flacons A et B."],
  ["Répartition de l’échantillon", "L’échantillon est réparti dans les flacons A et B, puis leur fermeture est vérifiée."],
  ["Mesure de la densité urinaire", "La densité est mesurée pour vérifier que l’échantillon convient à l’analyse."],
  ["Formulaire, observations et signature", "Le sportif relit le formulaire, déclare les produits utilisés et peut ajouter une remarque."]
];

const PRODUCT_CLUES = [
  {
    title: "Promesse de résultat",
    info: "Le produit promet une récupération très rapide et des résultats visibles en quelques jours.",
    question: "Cette promesse suffit-elle à prouver son efficacité et sa sécurité ?",
    choices: ["Oui", "Non", "Je ne sais pas encore"],
    correct: 1,
    explanation: "Une promesse publicitaire n’est pas une preuve scientifique ni une garantie de sécurité."
  },
  {
    title: "Liste de la composition",
    info: "Certains ingrédients sont regroupés sous l’expression « mélange exclusif ».",
    question: "Peut-on connaître précisément tout ce que contient le produit ?",
    choices: ["Oui", "Non", "Ce n’est pas important"],
    correct: 1,
    explanation: "Une composition incomplète empêche d’évaluer correctement le produit et ses risques."
  },
  {
    title: "Vente sur un réseau social",
    info: "Le produit est vendu par un influenceur et le fabricant est difficilement identifiable.",
    question: "Ce circuit d’achat est-il suffisamment rassurant ?",
    choices: ["Oui, l’influenceur est sportif", "Non, la traçabilité est insuffisante", "Oui, si le prix est bas"],
    correct: 1,
    explanation: "Un vendeur et un fabricant clairement identifiables sont indispensables pour assurer la traçabilité."
  },
  {
    title: "Mention « 100 % naturel »",
    info: "L’étiquette met en avant une origine entièrement naturelle.",
    question: "Cette mention garantit-elle une utilisation sans risque ?",
    choices: ["Oui", "Non", "Seulement hors compétition"],
    correct: 1,
    explanation: "Naturel ne signifie ni sans danger, ni conforme aux règles antidopage."
  },
  {
    title: "Mention « Testé en laboratoire »",
    info: "Aucun laboratoire, aucune méthode et aucune substance recherchée ne sont précisés.",
    question: "Cette mention apporte-t-elle une garantie suffisante ?",
    choices: ["Oui", "Non", "Oui, puisqu’elle figure sur l’emballage"],
    correct: 1,
    explanation: "Sans information vérifiable sur le laboratoire et les analyses, cette mention est insuffisante."
  },
  {
    title: "Certification ou norme",
    info: "Aucune certification reconnue ni référence à la norme AFNOR NF EN 17444 n’apparaît.",
    question: "Quelle conclusion raisonnable faut-il tirer ?",
    choices: ["Le produit est automatiquement interdit", "La maîtrise du risque est mal documentée", "Cela ne change rien"],
    correct: 1,
    explanation: "L’absence de démarche reconnue ne prouve pas une interdiction, mais impose davantage de vigilance."
  },
  {
    title: "Numéro de lot",
    info: "Le pot comporte un numéro de lot et une date de fabrication.",
    question: "À quoi servent principalement ces informations ?",
    choices: ["À identifier et tracer le produit", "Uniquement au magasin", "Uniquement après péremption"],
    correct: 0,
    explanation: "Le numéro de lot permet d’identifier précisément le produit consommé et d’en conserver la trace."
  }
];

const MEDICINE_QUESTIONS = [
  {
    context: "Avant une course, un coéquipier te propose un médicament qu’il utilise souvent.",
    question: "Quel est ton premier bon réflexe ?",
    choices: ["Prendre une demi-dose", "Le prendre puisqu’il le tolère", "Consulter un professionnel et vérifier le médicament"],
    correct: 2,
    explanation: "Un médicament adapté à une personne ne l’est pas forcément pour une autre. Demande conseil et précise toujours que tu es sportif."
  },
  {
    context: "Un médecin envisage de te prescrire un traitement.",
    question: "Quelle information dois-tu lui donner immédiatement ?",
    choices: ["Ton prochain résultat sportif", "Que tu pratiques un sport soumis aux règles antidopage", "La marque de ton vélo"],
    correct: 1,
    explanation: "Le médecin doit connaître ta pratique sportive pour choisir un traitement adapté et vérifier son statut antidopage."
  },
  {
    context: "Tu trouves une boîte de médicament dans l’armoire familiale.",
    question: "Peux-tu la prendre si tes symptômes semblent correspondre ?",
    choices: ["Oui, si la boîte n’est pas périmée", "Non, il faut identifier le produit et demander conseil", "Oui, hors compétition"],
    correct: 1,
    explanation: "Ne prends jamais un médicament trouvé sans vérifier à qui il était destiné, son indication et son statut."
  },
  {
    context: "Une vérification indique qu’un médicament contient une substance interdite.",
    question: "Que dois-tu faire ?",
    choices: ["Arrêter seul tout traitement", "Demander au professionnel une solution adaptée et parler d’une éventuelle AUT", "Le prendre seulement à l’entraînement"],
    correct: 1,
    explanation: "Ta santé reste prioritaire. Le professionnel peut rechercher une alternative ou vérifier si une AUT est nécessaire."
  },
  {
    context: "Le traitement est nécessaire et autorisé.",
    question: "Quel dernier réflexe est utile ?",
    choices: ["Jeter l’ordonnance", "Conserver l’ordonnance et les justificatifs", "Partager le médicament avec un proche"],
    correct: 1,
    explanation: "Conserve les prescriptions, boîtes et justificatifs : ils assurent la traçabilité de ton traitement."
  }
];

let cleanupCurrentActivity = () => {};

function showSelection() {
  cleanupCurrentActivity();
  cleanupCurrentActivity = () => {};
  activityContent.replaceChildren();
  runnerScreen.hidden = true;
  selectionScreen.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openActivity(renderer) {
  selectionScreen.hidden = true;
  runnerScreen.hidden = false;
  activityContent.replaceChildren();
  cleanupCurrentActivity = renderer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function createButton(label, className = "primary-button") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function renderPodium() {
  let selected = [];
  activityContent.innerHTML = `
    <p class="eyebrow">Activité individuelle</p>
    <h1>Le podium des valeurs</h1>
    <p class="intro">Choisis trois valeurs, dans l’ordre de leur importance pour ta pratique.</p>
    <p id="value-progress" class="progress">0 valeur sur 3 sélectionnée</p>
    <div id="values-grid" class="values-grid"></div>
    <div class="actions"><button id="validate-values" class="primary-button" disabled>Voir mon podium</button></div>
    <div id="podium-result"></div>`;
  const grid = activityContent.querySelector("#values-grid");
  const progress = activityContent.querySelector("#value-progress");
  const validate = activityContent.querySelector("#validate-values");
  const result = activityContent.querySelector("#podium-result");

  function refresh() {
    grid.replaceChildren();
    VALUES.forEach((value) => {
      const button = createButton(value, "value-button");
      const index = selected.indexOf(value);
      if (index >= 0) {
        button.classList.add("selected");
        button.textContent = `${index + 1}. ${value}`;
      }
      button.addEventListener("click", () => {
        if (index >= 0) selected = selected.filter((item) => item !== value);
        else if (selected.length < 3) selected.push(value);
        refresh();
      });
      grid.append(button);
    });
    progress.textContent = `${selected.length} valeur${selected.length > 1 ? "s" : ""} sur 3 sélectionnée${selected.length > 1 ? "s" : ""}`;
    validate.disabled = selected.length !== 3;
  }

  validate.addEventListener("click", () => {
    grid.hidden = true;
    progress.hidden = true;
    validate.parentElement.hidden = true;
    result.innerHTML = `
      <div class="podium">
        <div class="podium-place second"><span>2</span><strong>${selected[1]}</strong></div>
        <div class="podium-place first"><span>1</span><strong>${selected[0]}</strong></div>
        <div class="podium-place third"><span>3</span><strong>${selected[2]}</strong></div>
      </div>
      <div class="result-card">
        <h2>Ton podium est personnel</h2>
        <p>Il n’existe pas une seule bonne réponse. L’important est de savoir expliquer comment ces valeurs se traduisent dans tes choix, à l’entraînement comme en compétition.</p>
        <div class="actions"><button id="restart-podium" class="secondary-button">Recommencer</button></div>
      </div>`;
    result.querySelector("#restart-podium").addEventListener("click", () => openActivity(renderPodium));
  });
  refresh();
  return () => {};
}

function renderQuiz({ title, intro, questions, finalMessage }) {
  let index = 0;
  let score = 0;
  let locked = false;

  function renderQuestion() {
    locked = false;
    const item = questions[index];
    activityContent.innerHTML = `
      <p class="eyebrow">Activité individuelle</p>
      <h1>${title}</h1>
      <p class="progress">Question ${index + 1} sur ${questions.length}</p>
      <div class="question-card">
        ${item.context ? `<div class="scenario-box"><strong>Situation</strong><p>${item.context}</p></div>` : ""}
        <p class="question-text">${item.text || item.question}</p>
        <div id="answers" class="answer-list"></div>
        <div id="feedback"></div>
      </div>`;
    const answers = activityContent.querySelector("#answers");
    const labels = item.choices || ["Vrai", "Faux"];
    labels.forEach((label, choiceIndex) => {
      const button = createButton(label, "answer-button");
      button.addEventListener("click", () => answer(choiceIndex, button));
      answers.append(button);
    });
  }

  function answer(choiceIndex, selectedButton) {
    if (locked) return;
    locked = true;
    const item = questions[index];
    const correctIndex = item.choices ? item.correct : (item.answer ? 0 : 1);
    const isCorrect = choiceIndex === correctIndex;
    if (isCorrect) score += 1;
    [...activityContent.querySelectorAll(".answer-button")].forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === correctIndex) button.classList.add("correct");
      if (button === selectedButton && !isCorrect) button.classList.add("incorrect");
    });
    const feedback = activityContent.querySelector("#feedback");
    feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
    feedback.innerHTML = `<strong>${isCorrect ? "Bonne réponse !" : "À retenir"}</strong>${item.explanation}`;
    const actions = document.createElement("div");
    actions.className = "actions";
    const next = createButton(index === questions.length - 1 ? "Voir mon bilan" : "Question suivante");
    next.addEventListener("click", () => {
      index += 1;
      if (index < questions.length) renderQuestion();
      else renderResult();
    });
    actions.append(next);
    feedback.append(actions);
  }

  function renderResult() {
    const percentage = Math.round(score * 100 / questions.length);
    activityContent.innerHTML = `
      <p class="eyebrow">Activité terminée</p>
      <div class="result-card">
        <h1>${title}</h1>
        <div class="score">${score}/${questions.length}</div>
        <p>${finalMessage || "Tu as terminé le parcours et consulté toutes les corrections."}</p>
        <p><strong>${percentage >= 75 ? "Très bons réflexes !" : "Relis les explications pour consolider tes réflexes."}</strong></p>
        <div class="actions">
          <button id="retry-quiz" class="primary-button">Recommencer</button>
          <button id="other-activity" class="secondary-button">Choisir une autre activité</button>
        </div>
      </div>`;
    activityContent.querySelector("#retry-quiz").addEventListener("click", () =>
      openActivity(() => renderQuiz({ title, intro, questions, finalMessage }))
    );
    activityContent.querySelector("#other-activity").addEventListener("click", showSelection);
  }

  renderQuestion();
  return () => {};
}

function renderMission() {
  let order = CONTROL_STEPS.map((step, index) => ({ step, original: index }))
    .sort(() => Math.random() - 0.5);
  if (order.every((entry, index) => entry.original === index)) order.reverse();

  activityContent.innerHTML = `
    <p class="eyebrow">Activité individuelle</p>
    <h1>La mission contrôle</h1>
    <p class="intro">Utilise les flèches pour remettre les neuf étapes dans l’ordre, puis affiche la correction.</p>
    <div id="ranking-list" class="ranking-list"></div>
    <div class="actions"><button id="validate-ranking" class="primary-button">Valider mon ordre</button></div>
    <div id="ranking-result"></div>`;
  const list = activityContent.querySelector("#ranking-list");

  function refresh() {
    list.replaceChildren();
    order.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "ranking-item";
      row.innerHTML = `<span class="ranking-number">${index + 1}</span><strong>${entry.step[0]}</strong><span class="ranking-controls"></span>`;
      const controls = row.querySelector(".ranking-controls");
      const up = createButton("↑");
      const down = createButton("↓");
      up.setAttribute("aria-label", `Monter ${entry.step[0]}`);
      down.setAttribute("aria-label", `Descendre ${entry.step[0]}`);
      up.disabled = index === 0;
      down.disabled = index === order.length - 1;
      up.addEventListener("click", () => {
        [order[index - 1], order[index]] = [order[index], order[index - 1]];
        refresh();
      });
      down.addEventListener("click", () => {
        [order[index], order[index + 1]] = [order[index + 1], order[index]];
        refresh();
      });
      controls.append(up, down);
      list.append(row);
    });
  }

  activityContent.querySelector("#validate-ranking").addEventListener("click", () => {
    const correct = order.reduce((count, entry, index) => count + (entry.original === index ? 1 : 0), 0);
    list.hidden = true;
    activityContent.querySelector("#validate-ranking").parentElement.hidden = true;
    const result = activityContent.querySelector("#ranking-result");
    result.innerHTML = `
      <div class="result-card">
        <h2>${correct === 9 ? "Procédure parfaitement ordonnée !" : `${correct} étape${correct > 1 ? "s" : ""} bien placée${correct > 1 ? "s" : ""} sur 9`}</h2>
        <p>Voici l’ordre complet et le rôle de chaque étape :</p>
        <ol class="correct-order">${CONTROL_STEPS.map(([label, explanation]) => `<li><strong>${label}</strong> — ${explanation}</li>`).join("")}</ol>
        <div class="actions"><button id="retry-mission" class="primary-button">Recommencer</button></div>
      </div>`;
    result.querySelector("#retry-mission").addEventListener("click", () => openActivity(renderMission));
  });
  refresh();
  return () => {};
}

function renderProduct() {
  return renderQuiz({
    title: "Le produit mystère",
    intro: "Analyse chaque indice avant de décider.",
    questions: PRODUCT_CLUES.map((clue) => ({
      context: `${clue.title} — ${clue.info}`,
      question: clue.question,
      choices: clue.choices,
      correct: clue.correct,
      explanation: clue.explanation
    })).concat({
      context: "Tu as maintenant analysé tous les indices du produit.",
      question: "Quelle décision est la plus responsable ?",
      choices: [
        "Je le prends puisque d’autres sportifs l’utilisent",
        "Je le teste en petite quantité",
        "Je vérifie mon besoin, je demande conseil et je recherche des garanties",
        "Je le prends uniquement hors compétition"
      ],
      correct: 2,
      explanation: "La décision attendue est d’évaluer le besoin réel, de demander conseil et de rechercher des garanties fiables avant toute consommation."
    }),
    finalMessage: "Le bon réflexe : vérifier si le produit est réellement nécessaire, demander conseil et rechercher des garanties et une traçabilité fiables."
  });
}

const renderers = {
  podium: renderPodium,
  "vrai-faux": () => renderQuiz({
    title: "Vrai/Faux express",
    questions: TRUE_FALSE_QUESTIONS,
    finalMessage: "Tu as parcouru les huit affirmations essentielles du sport propre."
  }),
  mission: renderMission,
  produit: renderProduct,
  traitement: () => renderQuiz({
    title: "Médicament : les bons réflexes",
    questions: MEDICINE_QUESTIONS,
    finalMessage: "Avant tout médicament : demande conseil, signale ta pratique sportive, vérifie le produit et conserve tes justificatifs."
  })
};

document.querySelectorAll(".activity-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (card.dataset.activity === "produit") {
      window.location.href = "produit-mystere/index.html";
      return;
    }
    openActivity(renderers[card.dataset.activity]);
  });
});
backButton.addEventListener("click", showSelection);
