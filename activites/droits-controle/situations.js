export const MOMENTS = [
  {
    id: "notification", phase: "Notification", type: "Responsabilité", image: "../../../assets/images/mission-controle/01-notification.png",
    title: "La notification", scene: "À l’arrivée, une escorte t’informe : « Tu as été sélectionné pour un contrôle antidopage. » Tu es fatigué et tu préférerais rentrer.",
    question: "Peux-tu refuser le contrôle simplement parce que tu es fatigué ?",
    choices: ["Oui, la fatigue suffit pour refuser", "Non, je dois me présenter et suivre la procédure"], correct: 1,
    feedback: "La notification t’engage dans la procédure. Tu dois te présenter immédiatement, sauf raison valable justifiant un retard.",
    reflex: "Je me présente au contrôle et je suis la procédure jusqu’à la fin."
  },
  {
    id: "delay", phase: "Avant le poste", type: "Droit", image: "../../../assets/images/mission-controle/01-notification.png",
    title: "La cérémonie protocolaire", scene: "La cérémonie du podium commence dans quelques minutes. L’escorte est toujours avec toi.",
    question: "Quel est le bon réflexe ?",
    choices: ["Disparaître quelques minutes et revenir ensuite", "Demander à l’escorte un délai pour participer à la cérémonie", "Renoncer obligatoirement à la cérémonie"], correct: 1,
    feedback: "Tu peux demander un délai pour une raison valable. Ce délai doit être accordé et tu restes sous surveillance.",
    reflex: "Je peux demander un délai pour une raison valable."
  },
  {
    id: "supervision", phase: "Avant le poste", type: "Responsabilité", image: "../../../assets/images/mission-controle/02-accueil-poste-controle.png",
    title: "Un passage aux vestiaires", scene: "Ta pièce d’identité est dans ton sac, aux vestiaires. Tu proposes de la récupérer seul et de retrouver l’escorte ensuite.",
    question: "Peux-tu partir seul ?",
    choices: ["Oui, si je reviens rapidement", "Non, je reste en présence de l’escorte"], correct: 1,
    feedback: "De la notification à la fin du prélèvement, tu dois demeurer en présence de l’escorte ou de la personne chargée du contrôle.",
    reflex: "Je reste en présence de l’escorte pendant toute la procédure."
  },
  {
    id: "information", phase: "Au poste", type: "Droit", image: "../../../assets/images/mission-controle/02-accueil-poste-controle.png",
    title: "Une consigne peu claire", scene: "Au poste de contrôle, l’agent décrit la suite avec des mots que tu ne comprends pas bien.",
    question: "Que peux-tu faire ?",
    choices: ["Faire semblant d’avoir compris", "Demander des renseignements et des explications", "Attendre la fin pour poser une question"], correct: 1,
    feedback: "Tu as le droit de demander des renseignements sur le processus de contrôle, à tout moment utile.",
    reflex: "Je peux demander des renseignements sur le contrôle."
  },
  {
    id: "representative", phase: "Au poste", type: "Droit", image: "../../../assets/images/mission-controle/03-choix-gobelet.png",
    title: "Être accompagné", scene: "Tu te sentirais plus serein avec un adulte de confiance à tes côtés pendant la procédure.",
    question: "Quelle demande peux-tu formuler ?",
    choices: ["Demander la présence d’un représentant", "Exiger que toute l’équipe entre dans le poste", "Quitter le poste pour chercher quelqu’un seul"], correct: 0,
    feedback: "Tu peux avoir un représentant et, si disponible, un interprète. Leur présence respecte les limites prévues par la procédure.",
    reflex: "Je peux avoir un représentant et, si disponible, un interprète."
  },
  {
    id: "sample", phase: "Prélèvement", type: "Responsabilité", image: "../../../assets/images/mission-controle/04-observation-miction.png",
    title: "Pendant le prélèvement", scene: "Une consigne te surprend pendant le prélèvement. Tu hésites entre interrompre le contrôle et demander une explication.",
    question: "Quel comportement adoptes-tu ?",
    choices: ["J’interromps seul la procédure", "Je suis les consignes et je demande une explication si nécessaire"], correct: 1,
    feedback: "Tu dois te conformer à la procédure de prélèvement. Si tu ne comprends pas, exerce aussi ton droit de poser une question.",
    reflex: "Je me conforme à la procédure de prélèvement."
  },
  {
    id: "declaration", phase: "Formulaire", type: "Responsabilité", image: "../../../assets/images/mission-controle/09-formulaire-signature.png",
    title: "Médicament et complément", scene: "Le formulaire te demande les produits utilisés récemment. Tu prends un médicament prescrit et un complément alimentaire.",
    question: "Que déclares-tu ?",
    choices: ["Le médicament seulement", "Le complément seulement", "Le médicament et le complément", "Rien, puisqu’ils ne sont pas secrets"], correct: 2,
    feedback: "Déclare les médicaments, compléments et autres produits concernés sur le formulaire, qu’ils soient prescrits ou non.",
    reflex: "Je déclare les médicaments et compléments utilisés."
  },
  {
    id: "comment", phase: "Formulaire", type: "Droit", image: "../../../assets/images/mission-controle/09-formulaire-signature.png",
    title: "Quelque chose ne va pas", scene: "Tu penses qu’une information ou une étape n’a pas été correctement prise en compte.",
    question: "Dois-tu garder cette remarque pour toi afin de finir plus vite ?",
    choices: ["Oui", "Non, je pose la question et je demande à consigner ma remarque"], correct: 1,
    feedback: "Tu peux poser une question et utiliser l’espace prévu pour faire inscrire une observation sur la procédure.",
    reflex: "Je peux poser une question et consigner une remarque sur la procédure."
  },
  {
    id: "signature", phase: "Fin du contrôle", type: "Responsabilité", image: "../../../assets/images/mission-controle/09-formulaire-signature.png",
    title: "Avant de signer", scene: "Le formulaire est rempli et on te le présente pour signature. Le contrôle touche à sa fin.",
    question: "Quel est ton dernier bon réflexe ?",
    choices: ["Signer immédiatement sans relire", "Vérifier les informations, signaler une erreur si besoin, puis signer"], correct: 1,
    feedback: "Lis le formulaire et vérifie son exactitude avant de signer. Fais corriger ou consigner ce qui doit l’être.",
    reflex: "Je vérifie les informations avant de terminer le contrôle."
  }
];

export const PHASES = ["Notification", "Avant le poste", "Au poste", "Prélèvement", "Formulaire", "Fin du contrôle"];
export const RIGHTS = MOMENTS.filter(item => item.type === "Droit").map(item => item.reflex);
export const RESPONSIBILITIES = MOMENTS.filter(item => item.type === "Responsabilité").map(item => item.reflex);
export const FINAL_MESSAGE = "Pendant un contrôle, tu as des droits mais aussi des responsabilités. Les connaître permet de vivre la procédure sereinement et de faire respecter les règles.";
