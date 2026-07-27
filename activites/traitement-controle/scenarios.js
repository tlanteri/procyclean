export const CONTENT_VERSION = 1;

export const SCENARIO_IDS = [
  "home-medicine",
  "doctor-visit",
  "parent-medicine"
];

export const SCENARIOS = [
  {
    id: "home-medicine",
    icon: "🏠",
    title: "Le médicament trouvé à la maison",
    situation:
      "Tu as mal à la tête avant ton entraînement. Tu trouves une boîte de médicament dans l’armoire à pharmacie.",
    stepIds: [
      "home-first-choice",
      "home-identify-product",
      "home-source",
      "home-understand-result",
      "home-final-decision"
    ]
  },
  {
    id: "doctor-visit",
    icon: "🩺",
    title: "La consultation chez le médecin",
    situation:
      "Tu pratiques un sport et tu participes régulièrement à des compétitions. Pour un problème de santé, un médecin envisage de te prescrire un médicament.",
    stepIds: [
      "doctor-declare-sport",
      "doctor-understand-prescription",
      "doctor-compare-information",
      "doctor-necessary-treatment",
      "doctor-understand-tue",
      "doctor-keep-documents"
    ]
  },
  {
    id: "parent-medicine",
    icon: "👪",
    title: "Le médicament donné par les parents",
    situation:
      "Tu ne te sens pas bien. Tes parents cherchent à t’aider et te proposent un médicament qu’ils connaissent et qui se trouve à la maison.",
    stepIds: [
      "parent-first-choice",
      "parent-relative-medicine",
      "parent-no-prescription",
      "parent-similar-versions",
      "parent-current-check"
    ]
  }
].map((scenario) => ({
  ...scenario,
  version: CONTENT_VERSION
}));

export function getScenario(scenarioId) {
  return SCENARIOS.find((scenario) => scenario.id === scenarioId) || null;
}

export function balancedScenarioIds(unitCount, random = Math.random) {
  const offset = Math.floor(random() * SCENARIO_IDS.length);
  return Array.from(
    { length: unitCount },
    (_, index) => SCENARIO_IDS[(index + offset) % SCENARIO_IDS.length]
  );
}
