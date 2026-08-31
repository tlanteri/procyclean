export const VRADS = [
  {id:"presence",official:"Présence d’une substance interdite, de ses métabolites ou de ses marqueurs dans un échantillon fourni par un sportif",short:"Une substance retrouvée",scenario:"Après une course, l’analyse de l’échantillon d’un sportif révèle une substance interdite. Il affirme ne pas avoir voulu se doper.",who:"Sportif",whoId:"athlete",sanction:"En principe 2 ou 4 ans selon la substance, l’intention et les circonstances.",article:"Article 2.1"},
  {id:"use",official:"Usage ou tentative d’usage par un sportif d’une substance interdite ou d’une méthode interdite",short:"Utiliser ou essayer",scenario:"À l’entraînement, un sportif utilise une substance ou une méthode interdite. Aucun contrôle positif n’est nécessaire pour établir les faits.",who:"Sportif",whoId:"athlete",sanction:"En principe 2 ou 4 ans selon l’intention et les circonstances.",article:"Article 2.2"},
  {id:"evasion",official:"Se soustraire au prélèvement d’un échantillon, refuser le prélèvement d’un échantillon ou ne pas se soumettre au prélèvement d’un échantillon de la part d’un sportif",short:"Éviter un contrôle",scenario:"Un sportif est officiellement averti qu’il doit être contrôlé. Il quitte volontairement les lieux avant le prélèvement.",who:"Sportif",whoId:"athlete",sanction:"En principe 4 ans, avec des réductions possibles dans certaines situations.",article:"Article 2.3"},
  {id:"whereabouts",official:"Manquements aux obligations en matière de localisation de la part d’un sportif",short:"Trois manquements de localisation",scenario:"Un sportif du groupe cible cumule trois contrôles manqués ou défauts de transmission de ses informations en douze mois.",who:"Sportif du groupe cible",whoId:"athlete",sanction:"En principe 2 ans, avec une réduction possible jusqu’à 1 an.",article:"Article 2.4"},
  {id:"tampering",official:"Falsification ou tentative de falsification de tout élément du contrôle du dopage de la part d’un sportif ou d’une autre personne",short:"Truquer le contrôle",scenario:"Une personne tente de remplacer ou de modifier un échantillon déjà recueilli pendant la procédure de contrôle.",who:"Toute personne",whoId:"any_person",sanction:"En principe 4 ans, avec une modulation possible selon les circonstances.",article:"Article 2.5"},
  {id:"possession",official:"Possession d’une substance interdite ou d’une méthode interdite par un sportif ou un membre du personnel d’encadrement du sportif",short:"Détenir un produit ou une méthode",scenario:"Un entraîneur conserve dans le matériel de l’équipe un produit interdit destiné à un sportif, sans justification médicale valable.",who:"Sportif ou personnel d’encadrement",whoId:"athlete_or_pes",sanction:"En principe 2 ou 4 ans selon l’intention et les circonstances.",article:"Article 2.6"},
  {id:"trafficking",official:"Trafic ou tentative de trafic d’une substance interdite ou d’une méthode interdite par un sportif ou une autre personne",short:"Fournir ou vendre",scenario:"Une personne organise la vente et la distribution de produits interdits à plusieurs sportifs.",who:"Toute personne",whoId:"any_person",sanction:"De 4 ans jusqu’à l’interdiction à vie.",article:"Article 2.7"},
  {id:"administration",official:"Administration ou tentative d’administration par un sportif ou une autre personne à un sportif en compétition d’une substance interdite ou d’une méthode interdite, ou administration ou tentative d’administration à un sportif hors compétition d’une substance interdite ou d’une méthode interdite qui est interdite hors compétition",short:"Administrer à un sportif",scenario:"Un membre de l’encadrement administre une substance interdite à un sportif, sans traitement médical justifié.",who:"Toute personne",whoId:"any_person",sanction:"De 4 ans jusqu’à l’interdiction à vie.",article:"Article 2.8"},
  {id:"complicity",official:"Complicité ou tentative de complicité de la part d’un sportif ou d’une autre personne",short:"Aider à enfreindre les règles",scenario:"Un entraîneur aide volontairement à préparer et à dissimuler une violation, sans administrer lui-même de produit.",who:"Toute personne",whoId:"any_person",sanction:"De 2 ans jusqu’à l’interdiction à vie.",article:"Article 2.9"},
  {id:"association",official:"Association interdite de la part d’un sportif ou d’une autre personne",short:"Travailler avec une personne interdite",scenario:"Après avoir été officiellement averti, un sportif continue de recevoir des conseils sportifs d’un entraîneur suspendu.",who:"Sportif ou autre personne soumise aux règles",whoId:"athlete_or_other_person",sanction:"En principe 2 ans, avec une réduction possible jusqu’à 1 an.",article:"Article 2.10"},
  {id:"retaliation",official:"Actes commis par un sportif ou une autre personne pour décourager les signalements aux autorités ou actes de représailles à l’encontre de tels signalements",short:"Faire taire un signalement",scenario:"Un responsable menace un membre de l’équipe qui veut signaler de bonne foi une possible violation des règles antidopage.",who:"Toute personne",whoId:"any_person",sanction:"De 2 ans jusqu’à l’interdiction à vie.",article:"Article 2.11"}
];

// Grands titres proposés au participant. L'intitulé intégral du Code mondial
// reste disponible dans `official` et apparaît lors de la correction.
const DISPLAY_TITLES={
  presence:"Présence d’une substance interdite",
  use:"Usage ou tentative d’usage d’une substance ou méthode interdite",
  evasion:"Refus ou soustraction au prélèvement",
  whereabouts:"Manquements aux obligations de localisation",
  tampering:"Falsification ou tentative de falsification du contrôle",
  possession:"Possession d’une substance ou méthode interdite",
  trafficking:"Trafic ou tentative de trafic",
  administration:"Administration ou tentative d’administration d’une substance ou méthode interdite",
  complicity:"Complicité",
  association:"Association interdite avec une personne sanctionnée",
  retaliation:"Découragement ou représailles à l’encontre d’une personne qui signale un fait"
};
VRADS.forEach(item=>{item.short=DISPLAY_TITLES[item.id]});

export const ROUNDS = [["presence","use","possession"],["evasion","whereabouts","tampering"],["trafficking","administration","complicity"],["association","retaliation"]];
export const WHO_OPTIONS = [
  {id:"athlete",label:"Sportif"},{id:"athlete_or_pes",label:"Sportif ou personnel d’encadrement"},
  {id:"any_person",label:"Toute personne"},{id:"athlete_or_other_person",label:"Sportif ou autre personne soumise aux règles"}
];
export const byId=id=>VRADS.find(item=>item.id===id);
export const shuffled=items=>[...items].sort(()=>Math.random()-.5);
