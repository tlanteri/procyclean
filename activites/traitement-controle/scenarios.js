export const CONTENT_VERSION = 2;

export const SCENARIO_IDS = ["lea", "yanis", "ines"];

export const SCENARIOS = [
  {
    id: "lea",
    icon: "🩺",
    character: "Léa",
    marker: "Consultation",
    title: "Malade avec le temps de consulter",
    theme: "cyan",
    context:
      "Léa est une jeune cycliste. Depuis deux jours, elle tousse, a mal à la gorge et se sent fatiguée. Sa prochaine compétition est prévue dans une semaine. Elle a donc le temps de consulter un médecin.",
    steps: [
      {
        id: "lea-symptoms",
        title: "Les premiers symptômes",
        text: "Léa aimerait continuer à s’entraîner malgré ses symptômes. Que devrait-elle faire en premier ?",
        choices: {
          A: "Prendre un médicament disponible chez elle.",
          B: "Parler de ses symptômes à ses parents et prendre rendez-vous avec un médecin.",
          C: "Attendre la compétition pour voir si cela passe."
        }
      },
      {
        id: "lea-doctor",
        title: "Chez le médecin",
        text: "Le médecin demande à Léa quelles sont ses activités habituelles. Quelle information importante doit-elle lui donner ?",
        choices: {
          A: "Qu’elle pratique le cyclisme et participe à des compétitions.",
          B: "Uniquement le nombre d’entraînements qu’elle réalise chaque semaine.",
          C: "Rien de particulier : sa pratique sportive ne concerne pas le médecin."
        }
      },
      {
        id: "lea-prescription",
        title: "La prescription",
        text: "Le médecin prescrit un médicament à Léa. Elle possède maintenant une ordonnance. Que doit-elle faire ?",
        choices: {
          A: "Prendre directement le médicament puisqu’il a été prescrit.",
          B: "Refuser le traitement par peur d’un contrôle antidopage.",
          C: "Vérifier le médicament exact sur l’outil officiel de l’AFLD avec un adulte ou un professionnel."
        }
      },
      {
        id: "lea-result",
        title: "Le résultat de la recherche",
        text: "L’outil de l’AFLD indique que le statut dépend de la voie d’administration et de la période d’utilisation. Que doit vérifier Léa ?",
        choices: {
          A: "Seulement le nom de la marque.",
          B: "Le médicament exact, sa voie d’administration et son statut pendant la période concernée.",
          C: "Uniquement si le médicament est vendu en pharmacie."
        }
      },
      {
        id: "lea-aut",
        title: "Une AUT peut être nécessaire",
        text: "Le médicament est médicalement nécessaire, mais son utilisation peut nécessiter une autorisation d’usage à des fins thérapeutiques, appelée AUT. Que doit faire Léa ?",
        choices: {
          A: "Arrêter seule le traitement.",
          B: "Le prendre sans rien signaler puisqu’elle possède une ordonnance.",
          C: "Demander conseil sur la procédure d’AUT et conserver ses documents médicaux."
        }
      }
    ]
  },
  {
    id: "yanis",
    icon: "⏱️",
    character: "Yanis",
    marker: "Jour de course",
    title: "Situation urgente le jour d’une compétition",
    theme: "orange",
    context:
      "Yanis est un jeune cycliste. Il participe aujourd’hui à une compétition importante. Peu avant le départ, il ressent une douleur inhabituelle au genou et dispose de peu de temps pour réagir.",
    steps: [
      {
        id: "yanis-pain",
        title: "La douleur apparaît",
        text: "Yanis a peur de ne pas pouvoir prendre le départ. Quel doit être son premier réflexe ?",
        choices: {
          A: "Prendre rapidement un médicament avant que la douleur augmente.",
          B: "Prévenir un adulte responsable et demander l’avis d’un professionnel de santé.",
          C: "Ne rien dire pour ne pas risquer d’être retiré de la course."
        }
      },
      {
        id: "yanis-kit",
        title: "Un médicament est disponible",
        text: "Un médicament est disponible dans la trousse de secours. Yanis reconnaît la boîte, mais ignore le dosage exact. Que doit-il faire ?",
        choices: {
          A: "Le prendre puisqu’il connaît son nom.",
          B: "En prendre seulement la moitié.",
          C: "Identifier précisément le médicament et ne rien prendre avant d’avoir reçu un avis adapté."
        }
      },
      {
        id: "yanis-source",
        title: "Une vérification rapide",
        text: "Il reste peu de temps avant le départ. Quelle source faut-il utiliser pour vérifier le statut du médicament ?",
        choices: {
          A: "L’outil officiel de vérification des médicaments de l’AFLD.",
          B: "Le premier résultat trouvé sur un moteur de recherche.",
          C: "L’avis d’un autre cycliste ayant déjà pris ce médicament."
        }
      },
      {
        id: "yanis-doubt",
        title: "Un résultat difficile à comprendre",
        text: "Le résultat dépend de la substance, de la voie d’administration ou de certaines conditions. Yanis n’est pas certain de comprendre. Que doit-il faire ?",
        choices: {
          A: "Considérer le médicament comme autorisé puisqu’il apparaît dans les résultats.",
          B: "Demander l’aide d’un professionnel et ne pas le prendre tant que le doute persiste.",
          C: "Le prendre maintenant et vérifier après la compétition."
        }
      },
      {
        id: "yanis-decision",
        title: "La décision finale",
        text: "La douleur reste importante et Yanis ne dispose pas d’une réponse suffisamment sûre avant le départ. Quelle décision protège le mieux sa santé ?",
        choices: {
          A: "Prendre quand même le médicament pour essayer de participer.",
          B: "Ne pas prendre le médicament au hasard et reconsidérer sa participation avec les adultes et les professionnels présents.",
          C: "Demander le médicament d’un autre participant."
        }
      }
    ]
  },
  {
    id: "ines",
    icon: "🤝",
    character: "Inès",
    marker: "Médicament d’un camarade",
    title: "Un médicament proposé par un camarade",
    theme: "purple",
    context:
      "Après un entraînement, Inès a mal à la tête. Son ami Hugo sort un médicament de son sac et explique qu’il l’utilise souvent.",
    steps: [
      {
        id: "ines-offer",
        title: "La proposition",
        text: "Hugo propose un comprimé à Inès. Que devrait-elle faire ?",
        choices: {
          A: "Le prendre puisqu’Hugo connaît bien ce médicament.",
          B: "Refuser de le prendre sans l’avis d’un adulte ou d’un professionnel de santé.",
          C: "En prendre seulement une moitié."
        }
      },
      {
        id: "ines-otc",
        title: "Un médicament sans ordonnance",
        text: "Hugo précise que le médicament est vendu sans ordonnance. Cela signifie-t-il qu’Inès peut le prendre sans vérification ?",
        choices: {
          A: "Oui, un médicament sans ordonnance est toujours sans risque.",
          B: "Oui, à condition d’en prendre une petite quantité.",
          C: "Non, « sans ordonnance » ne signifie ni « adapté à tous » ni « autorisé dans le sport »."
        }
      },
      {
        id: "ines-old-check",
        title: "Une ancienne vérification",
        text: "Hugo affirme avoir vérifié ce médicament sur Internet plusieurs mois auparavant. Que doit penser Inès ?",
        choices: {
          A: "La vérification d’Hugo est suffisante pour tout le monde.",
          B: "Il faut vérifier de nouveau le médicament exact pour la personne et la situation concernées.",
          C: "Il suffit de vérifier que l’emballage n’a pas changé."
        }
      },
      {
        id: "ines-boxes",
        title: "Deux boîtes presque identiques",
        text: "Inès remarque que la boîte ressemble à un médicament qu’elle connaît, mais que le nom et le dosage sont légèrement différents. Que doit-elle faire ?",
        choices: {
          A: "Considérer qu’il s’agit du même médicament.",
          B: "Vérifier uniquement la marque.",
          C: "Identifier précisément le nom, le dosage, la composition et la voie d’administration."
        }
      },
      {
        id: "ines-persistent",
        title: "La douleur persiste",
        text: "Inès refuse le comprimé, mais son mal de tête ne passe pas. Quelle est la meilleure suite ?",
        choices: {
          A: "En parler à ses parents ou à un professionnel de santé et préciser qu’elle pratique un sport en compétition.",
          B: "Demander un autre médicament à un coéquipier.",
          C: "Prendre finalement celui d’Hugo."
        }
      }
    ]
  }
].map((scenario) => ({
  ...scenario,
  version: CONTENT_VERSION,
  stepIds: scenario.steps.map((step) => step.id)
}));

export function getScenario(scenarioId) {
  const legacyAliases = {
    "home-medicine": "ines",
    "doctor-visit": "lea",
    "parent-medicine": "yanis"
  };
  const resolvedId = legacyAliases[scenarioId] || scenarioId;
  return SCENARIOS.find((scenario) => scenario.id === resolvedId) || null;
}

export function balancedScenarioIds(unitCount, random = Math.random) {
  const offset = Math.floor(random() * SCENARIO_IDS.length);
  return Array.from(
    { length: unitCount },
    (_, index) => SCENARIO_IDS[(index + offset) % SCENARIO_IDS.length]
  );
}
