export const CONTROL_STEPS = [
  {
    id: "notification",
    label: "Notification au sportif",
    image: "../../../assets/images/mission-controle/01-notification.png",
    explanation: "Le sportif est informé de sa sélection pour un contrôle et suit les consignes de l’agent.",
    hint: "La procédure commence lorsque le sportif apprend qu’il a été sélectionné.",
    reflex: "Je reste avec l’agent et je demande des explications si nécessaire."
  },
  {
    id: "control-station",
    label: "Accueil au poste de contrôle du dopage",
    image: "../../../assets/images/mission-controle/02-accueil-poste-controle.png",
    explanation: "Le sportif rejoint le poste de contrôle, où son identité et les informations utiles sont vérifiées.",
    hint: "Après la notification, le sportif doit rejoindre le lieu où se déroule le contrôle.",
    reflex: "Je présente les informations demandées et je signale toute question."
  },
  {
    id: "collection-vessel",
    label: "Choix d’un gobelet de recueil",
    image: "../../../assets/images/mission-controle/03-choix-gobelet.png",
    explanation: "Le sportif choisit lui-même un gobelet de recueil encore scellé parmi le matériel proposé.",
    hint: "Avant de produire l’échantillon, il faut choisir le récipient qui servira à le recueillir.",
    reflex: "Je vérifie que le matériel que je choisis est intact et scellé."
  },
  {
    id: "observation",
    label: "Observation de la miction par un ACD du même sexe",
    image: "../../../assets/images/mission-controle/04-observation-miction.png",
    explanation: "L’échantillon est produit sous l’observation directe d’un agent de contrôle du dopage du même sexe.",
    hint: "Le gobelet est choisi : l’échantillon peut maintenant être produit selon la procédure prévue.",
    reflex: "Je respecte les consignes tout en demandant une explication si je ne comprends pas."
  },
  {
    id: "minimum-volume",
    label: "90 ml d’urine minimum",
    image: "../../../assets/images/mission-controle/05-volume-urine.png",
    explanation: "Un volume d’au moins 90 ml est nécessaire pour poursuivre normalement la procédure.",
    hint: "Avant de choisir les flacons, il faut vérifier que le volume recueilli est suffisant.",
    reflex: "Je vérifie avec l’agent que le volume nécessaire a été atteint."
  },
  {
    id: "sample-kit",
    label: "Choix d’un kit de prélèvement",
    image: "../../../assets/images/mission-controle/06-choix-kit.png",
    explanation: "Le sportif choisit un kit sécurisé comprenant les flacons A et B.",
    hint: "Le volume est suffisant : il faut maintenant choisir les flacons sécurisés.",
    reflex: "Je choisis un kit et je vérifie qu’il est intact."
  },
  {
    id: "sample-distribution",
    label: "Répartition de l’échantillon",
    image: "../../../assets/images/mission-controle/07-repartition-echantillon.png",
    explanation: "L’échantillon est réparti dans les flacons sécurisés A et B, puis leur fermeture est vérifiée.",
    hint: "Le kit A/B vient d’être choisi : l’échantillon doit maintenant être réparti entre ses flacons.",
    reflex: "Je contrôle les numéros et la fermeture des flacons A et B."
  },
  {
    id: "urine-density",
    label: "Mesure de la densité urinaire",
    image: "../../../assets/images/mission-controle/08-densite-urinaire.png",
    explanation: "La densité urinaire est mesurée afin de vérifier que l’échantillon convient à l’analyse.",
    hint: "Après la répartition, une mesure permet encore de vérifier la qualité de l’échantillon.",
    reflex: "Je reste attentif aux résultats et aux explications données."
  },
  {
    id: "form",
    label: "Observations sur le formulaire et signature",
    image: "../../../assets/images/mission-controle/09-formulaire-signature.png",
    explanation: "Avant de signer, le sportif relit le formulaire, déclare les produits utilisés et peut faire inscrire une remarque.",
    hint: "La dernière étape consiste à vérifier par écrit le déroulement du contrôle avant de signer.",
    reflex: "Je déclare mes médicaments et compléments, j’ajoute mes remarques et je relis avant de signer."
  }
];

export const CHAPTERS = [
  { title: "Entrer dans la procédure", range: "Étapes 1 à 3" },
  { title: "Produire l’échantillon", range: "Étapes 4 à 6" },
  { title: "Sécuriser et finaliser", range: "Étapes 7 à 9" }
];

export function analyzeRanking(ranking) {
  const expectedPositions = new Map(
    CONTROL_STEPS.map((step, index) => [step.id, index])
  );
  const sequence = (Array.isArray(ranking) ? ranking : [])
    .map((stepId) => expectedPositions.get(stepId));

  if (
    sequence.length !== CONTROL_STEPS.length ||
    sequence.some((position) => position === undefined) ||
    new Set(sequence).size !== CONTROL_STEPS.length
  ) {
    return { score: 0, errorCount: CONTROL_STEPS.length, errors: [] };
  }

  const lengths = Array(sequence.length).fill(1);
  const previous = Array(sequence.length).fill(-1);
  let bestEnd = 0;

  for (let index = 0; index < sequence.length; index += 1) {
    for (let candidate = 0; candidate < index; candidate += 1) {
      if (
        sequence[candidate] < sequence[index] &&
        lengths[candidate] + 1 >= lengths[index]
      ) {
        lengths[index] = lengths[candidate] + 1;
        previous[index] = candidate;
      }
    }
    if (lengths[index] >= lengths[bestEnd]) bestEnd = index;
  }

  const correctlySequencedIndexes = new Set();
  for (let cursor = bestEnd; cursor >= 0; cursor = previous[cursor]) {
    correctlySequencedIndexes.add(cursor);
    if (previous[cursor] === -1) break;
  }

  const errors = ranking.flatMap((stepId, actualIndex) => {
    if (correctlySequencedIndexes.has(actualIndex)) return [];
    const expectedIndex = expectedPositions.get(stepId);
    const step = CONTROL_STEPS[expectedIndex];
    return [{
      id: stepId,
      label: step.label,
      image: step.image,
      actualPosition: actualIndex + 1,
      expectedPosition: expectedIndex + 1
    }];
  });

  return {
    score: CONTROL_STEPS.length - errors.length,
    errorCount: errors.length,
    errors
  };
}
