export const VIGILANCE_CHOICES = {
  continue: "Je le prends",
  vigilant: "Je dois être vigilant",
  stop: "Je ne prends rien et je demande conseil"
};

export const SITUATIONS = [
  {
    id: "parent-medicine", icon: "💊", title: "Un médicament donné par les parents d’une coéquipière",
    text: "Avant une course, tu ne te sens pas bien. Les parents d’une coéquipière te donnent un médicament qu’ils connaissent bien, mais tu ne l’as pas vérifié.",
    followUp: "Qui doit vérifier ce que contient ce médicament ?",
    followUpChoices: ["Les parents de ma coéquipière uniquement", "Moi, avec l’aide d’un adulte ou d’un professionnel", "Personne si le médicament vient de la maison"],
    recommended: "stop",
    explanation: "La confiance envers un parent ne remplace pas la vérification du médicament exact ni le conseil d’un professionnel.",
    objectiveLink: "Le sportif reste responsable de la substance retrouvée dans son organisme, même si le médicament a été donné avec une bonne intention."
  },
  {
    id: "teammate-supplement", icon: "🥤", title: "Le complément d’un coéquipier",
    text: "Un coéquipier te conseille un complément alimentaire qui lui donne, selon lui, beaucoup d’énergie.",
    followUp: "Qui influence principalement ta décision ?",
    followUpChoices: ["Le coéquipier", "Le fabricant uniquement", "Personne"],
    recommended: "stop",
    explanation: "Le témoignage d’un coéquipier ne garantit ni l’utilité ni l’absence de substance interdite.",
    objectiveLink: "Accepter le conseil d’un autre ne transfère pas la responsabilité de ce qui est consommé."
  },
  {
    id: "staff-drink", icon: "🚰", title: "La boisson préparée par l’encadrement",
    text: "Une personne de l’encadrement te tend une gourde déjà préparée sans t’expliquer ce qu’elle contient.",
    followUp: "Quel comportement est le plus responsable ?",
    followUpChoices: ["Boire par confiance", "Demander précisément ce que contient la gourde", "Attendre que les autres boivent"],
    recommended: "vigilant",
    explanation: "Il faut savoir précisément ce que l’on consomme, y compris lorsque le produit vient de l’encadrement.",
    objectiveLink: "L’origine de la boisson n’efface pas la responsabilité personnelle du sportif."
  },
  {
    id: "coach-advice", icon: "📣", title: "Le conseil de l’entraîneur",
    text: "Ton entraîneur te recommande un produit pour mieux récupérer et te dit que toute l’équipe l’utilise.",
    followUp: "Qui prend finalement la décision de consommer ?",
    followUpChoices: ["L’entraîneur", "L’équipe", "Moi, après avoir demandé un avis fiable"],
    recommended: "stop",
    explanation: "L’autorité ou l’expérience d’un entraîneur ne dispense pas de demander un avis compétent et de vérifier le produit.",
    objectiveLink: "Une consigne de l’entraîneur n’annule pas la responsabilité du sportif."
  },
  {
    id: "recovery-supplement", icon: "🥤", title: "Le complément alimentaire d’un coéquipier",
    text: "Après l’entraînement, un coéquipier te propose un complément alimentaire qu’il utilise pour mieux récupérer. Tu ne connais pas sa composition.",
    followUp: "Est-ce que ce complément alimentaire est sans risque ?",
    followUpChoices: [
      "Oui, puisqu’il l’utilise régulièrement.",
      "Oui, s’il affirme n’avoir jamais eu de problème.",
      "Non, car sa composition, son origine et les risques peuvent être inconnus."
    ],
    correctFollowUp: 2,
    recommended: "stop",
    explanation: "L’utilisation par un coéquipier ne garantit ni la sécurité du complément alimentaire ni l’absence de substance interdite. Il faut demander conseil et vérifier avant toute consommation.",
    objectiveLink: "Même lorsqu’un produit est conseillé par un coéquipier, le sportif reste responsable de ce qu’il consomme."
  },
  {
    id: "group-pressure", icon: "👥", title: "La pression du groupe",
    text: "Tous les membres du groupe prennent le même produit et se moquent de toi parce que tu hésites.",
    followUp: "Quel comportement est le plus responsable ?",
    followUpChoices: ["Faire comme le groupe", "Refuser provisoirement et demander conseil", "Prendre une demi-dose"],
    recommended: "stop",
    explanation: "La pression du groupe peut influencer une décision, mais il est responsable de s’arrêter lorsque le produit n’est pas vérifié.",
    objectiveLink: "Le fait que plusieurs personnes consomment un produit ne partage pas la responsabilité antidopage."
  }
];

export const FINAL_MESSAGE =
  "Les autres peuvent me conseiller ou influencer mes décisions, mais je dois rester vigilant face à ce que je consomme. Dans le cadre de l’antidopage, je suis responsable des substances retrouvées dans mon organisme, même si je n’avais pas l’intention de tricher.";
