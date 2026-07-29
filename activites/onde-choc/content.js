const option = (id, text, correct = true, continues = false) => ({ id, text, correct, continues });
const stage = (level, question, instruction, options) => ({ level, question, instruction, options });

export const STORIES = [
  {
    id: "camille", icon: "💊", name: "Camille", color: "cyan",
    story: "Avant une compétition, Camille prend un médicament sans vérifier s’il est autorisé.",
    stages: [
      stage("Conséquences immédiates", "Que peut-il se passer après la prise de ce médicmants sans vérfication ?", "Plusieurs réponses sont possibles : la conséquence n’est pas automatique.", [
        option("allowed", "Le médicament est autorisé : il n’y a pas de conséquence du point vue réglementation autidopage."),
        option("side-effect", "Le médicament provoque un effet indésirable."),
        option("detected", "Le médicament contient une substance interdite qui est détectée lors d’un contrôle.", true, true),
        option("unknown", "Il est impossible de le savoir sans vérifier le médicament.")
      ]),
      stage("Conséquences disciplinaires", "Imagine maintenant qu’une substance interdite a bien été détectée.", "Que peut entraîner cette détection ?", [
        option("procedure", "Camille devra peut-être expliquer pourquoi elle a pris ce médicament."),
        option("cancelled", "Ses résultats peuvent être annulés."),
        option("suspended", "Une suspension peut être prononcée."),
        option("nothing", "Rien ne se passe puisqu’elle ne voulait pas tricher.", false)
      ]),
      stage("Conséquences sportives", "Quelles conséquences sportives peuvent découler d’une annulation ou d’une suspension ?", "Sélectionne toutes les conséquences qui pourraient alors apparaître.", [
        option("lose-result", "Perdre le résultat obtenu lors de la compétition."),
        option("miss-events", "Manquer des entraînements ou des compétitions."),
        option("lose-selection", "Perdre une sélection."),
        option("sport-project", "Voir son projet sportif fragilisé.")
      ]),
      stage("Conséquences personnelles", "Quelles autres conséquences peuvent apparaître ?", "Ces effets plus lointains dépendent de la situation de Camille.", [
        option("shame", "Ressentir de l’inquiétude ou de la honte."),
        option("trust", "Perdre la confiance de certaines personnes."),
        option("team", "S’éloigner temporairement de son équipe."),
        option("contract", "Fragiliser un contrat ou un partenariat, selon son niveau sportif.")
      ])
    ],
    prevention: "Avant de prendre un médicament, Camille peut demander conseil et vérifier le produit exact, sa voie d’administration et les conditions indiquées par l’outil officiel de l’AFLD."
  },
  {
    id: "sami", icon: "🥤", name: "Sami", color: "orange",
    story: "Un coéquipier conseille à Sami un complément alimentaire pour mieux récupérer. Sami le consomme sans vérifier sa composition ni son origine.",
    stages: [
      stage("Conséquences immédiates", "Que peut-il se passer après cette décision ?", "Plusieurs issues restent possibles tant que le complément n’a pas été évalué.", [
        option("no-effect", "Le complément ne provoque aucun effet notable."),
        option("side-effect", "Sami ressent un effet indésirable."),
        option("contamination", "Le complément contient une substance interdite non annoncée, détectée lors d’un contrôle.", true, true),
        option("unknown", "La recommandation du coéquipier ne permet pas de connaître avec certitude sa composition.")
      ]),
      stage("Conséquences disciplinaires", "Que peut entraîner la détection d’une substance non annoncée ?", "Même si l’étiquette ne la mentionnait pas, Sami doit répondre de ce qui est retrouvé dans son organisme.", [
        option("procedure", "Sami doit fournir des explications et les éléments concernant le complément."),
        option("cancelled", "Son résultat peut être annulé."),
        option("suspended", "Une suspension peut être prononcée."),
        option("manufacturer", "Seul le fabricant est concerné : Sami ne risque rien.", false)
      ]),
      stage("Conséquences sportives", "Que peuvent provoquer une annulation ou une suspension dans le parcours de Sami ?", "Relie la décision de départ à ses effets sportifs possibles.", [
        option("result", "Perdre le bénéfice d’un résultat obtenu."),
        option("recovery", "Interrompre son programme d’entraînement et de récupération."),
        option("selection", "Ne plus pouvoir participer à une sélection ou à une compétition."),
        option("goals", "Devoir revoir ses objectifs de saison.")
      ]),
      stage("Conséquences personnelles", "Quelles autres conséquences peuvent ensuite toucher Sami ?", "Elles ne sont possibles qu’après les événements précédents.", [
        option("guilt", "Se sentir inquiet ou coupable d’avoir fait confiance sans vérifier."),
        option("teammate", "Voir sa relation avec le coéquipier qui l’a conseillé se dégrader."),
        option("staff", "Devoir regagner la confiance de son encadrement."),
        option("support", "Perdre un soutien matériel ou financier, selon sa situation.")
      ])
    ],
    prevention: "Sami peut d’abord questionner l’utilité du complément, demander conseil et rechercher des garanties fiables sur sa composition et son origine."
  },
  {
    id: "lea", icon: "🩹", name: "Léa", color: "purple",
    story: "Blessée et inquiète de perdre sa place, Léa accepte une substance proposée pour continuer à s’entraîner.",
    stages: [
      stage("Conséquences immédiates", "Que peut-il se passer après cette décision ?", "La substance et la poursuite de l’entraînement peuvent produire plusieurs effets.", [
        option("mask", "La douleur est masquée et Léa continue à solliciter sa blessure."),
        option("worse", "Sa blessure ou son état de santé s’aggrave."),
        option("detected", "La substance est interdite et elle est détectée lors d’un contrôle.", true, true),
        option("safe", "Puisqu’elle veut seulement continuer à s’entraîner, la substance est sans risque.", false)
      ]),
      stage("Conséquences disciplinaires", "Si la substance interdite est détectée, que peut-il se passer ?", "L’objectif de rester dans l’équipe n’efface pas la procédure antidopage.", [
        option("procedure", "Léa doit expliquer l’usage de la substance dans le cadre d’une procédure."),
        option("cancelled", "Un résultat peut être annulé."),
        option("suspended", "Elle peut être suspendue."),
        option("injury-excuse", "Sa blessure suffit automatiquement à écarter toute violation.", false)
      ]),
      stage("Conséquences sportives", "Comment ces événements peuvent-ils affecter la place que Léa voulait préserver ?", "Observe le décalage entre son objectif initial et les effets possibles.", [
        option("training", "Elle doit interrompre l’entraînement pour se soigner ou pendant une suspension."),
        option("place", "Elle peut finalement perdre sa place dans l’équipe."),
        option("return", "Son retour à la compétition peut être retardé."),
        option("season", "Sa saison et sa progression peuvent être fragilisées.")
      ]),
      stage("Conséquences personnelles", "Quelles autres conséquences peuvent ensuite apparaître pour Léa ?", "Ces conséquences viennent après les effets médicaux, disciplinaires ou sportifs.", [
        option("pressure", "Ressentir davantage de peur, de honte ou de pression."),
        option("trust", "Avoir du mal à parler franchement avec son entraîneur ou ses proches."),
        option("team", "Se sentir mise à l’écart de son groupe."),
        option("studies", "Devoir réorganiser un projet scolaire ou professionnel lié à son parcours sportif.")
      ])
    ],
    prevention: "Léa peut faire évaluer sa blessure et parler de sa peur de perdre sa place à une personne de confiance et à un professionnel compétent."
  },
  {
    id: "hugo", icon: "🏁", name: "Hugo", color: "red",
    story: "Pour augmenter ses chances d’être sélectionné, Hugo décide d’utiliser une substance interdite.",
    stages: [
      stage("Conséquences immédiates", "Que peut-il se passer après cette décision ?", "Plusieurs effets peuvent coexister, même avant un éventuel contrôle.", [
        option("health", "La substance provoque des effets indésirables sur sa santé."),
        option("performance", "Ses performances peuvent être modifiées sans garantir sa sélection."),
        option("detected", "La substance est détectée lors d’un contrôle antidopage.", true, true),
        option("secret", "Si personne ne le voit la prendre, elle ne peut pas être détectée.", false)
      ]),
      stage("Conséquences disciplinaires", "Que peut entraîner la détection de la substance qu’Hugo savait interdite ?", "La détection ouvre une procédure qui peut aboutir à plusieurs décisions.", [
        option("procedure", "Hugo doit répondre aux questions et présenter ses observations."),
        option("cancelled", "Son résultat peut être annulé."),
        option("suspended", "Une suspension peut être prononcée."),
        option("selection-excuse", "La pression de la sélection annule automatiquement la violation.", false)
      ]),
      stage("Conséquences sportives", "Quelles conséquences peuvent alors toucher l’objectif de sélection d’Hugo ?", "Les effets sportifs découlent ici de la procédure et de ses décisions.", [
        option("result", "Perdre les résultats obtenus avec la substance."),
        option("ineligible", "Devenir indisponible pour la sélection pendant une suspension."),
        option("team", "Perdre sa place dans le collectif."),
        option("project", "Compromettre la suite de son projet sportif.")
      ]),
      stage("Conséquences personnelles", "Quelles autres conséquences peuvent ensuite apparaître autour d’Hugo ?", "Ces effets relationnels et matériels ne sont pas automatiques.", [
        option("fear", "Vivre avec la peur d’être découvert, puis avec la honte ou la culpabilité."),
        option("trust", "Perdre la confiance de coéquipiers, de l’entraîneur ou de sa famille."),
        option("club", "Fragiliser aussi l’image de son équipe ou de son club."),
        option("contract", "Perdre un partenariat ou une aide financière, selon son statut.")
      ])
    ],
    prevention: "Hugo peut refuser la substance, parler de la pression de sélection et chercher de l’aide auprès d’une personne de confiance."
  }
];

export const LEVEL_SUMMARIES = [
  "La décision crée d’abord plusieurs possibilités : aucune conséquence antidopage n’est certaine sans connaître le produit et la situation.",
  "Lorsqu’une substance interdite est détectée, une procédure s’ouvre. L’absence d’intention ne suffit pas, à elle seule, à écarter une violation.",
  "Une annulation ou une suspension peut ensuite affecter les résultats, la participation et le projet sportif.",
  "Des conséquences personnelles, relationnelles ou matérielles peuvent enfin apparaître, selon le contexte."
];

export const FINAL_MESSAGE = "Une onde de choc n’est pas une liste de conséquences automatiques. Elle relie une décision à des événements successifs : ce qui arrive immédiatement, une éventuelle procédure, ses effets sportifs, puis des effets personnels possibles. Vérifier, demander conseil et parler des pressions permet d’intervenir avant que cette chaîne ne commence.";
