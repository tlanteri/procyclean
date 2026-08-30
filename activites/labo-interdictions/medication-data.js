export const AFLD_URL="https://medicaments.afld.fr";
export const STATUS_OPTIONS=[
 {id:"allowed",label:"Autorisé"},
 {id:"competition",label:"Interdit en compétition"},
 {id:"permanent",label:"Interdit en permanence"},
 {id:"unknown",label:"Je ne sais pas"}
];
export const MEDICATION_EXERCISES=[
 {id:"doliprane-500",level:"RECHERCHE GUIDÉE",name:"DOLIPRANE 500 mg, comprimé",route:"orale",activeIngredient:"paracétamol",expected:"allowed",officialStatus:"Médicament autorisé",feedback:"Le résultat indique clairement « Médicament autorisé ». Tu as repéré le statut au bon endroit.",instruction:"Recherche exactement ce nom dans AFLD Médicaments, ouvre sa fiche puis repère la voie d’administration et le statut."},
 {id:"rhinadvil-rhume",level:"À TOI DE VÉRIFIER",name:"RHINADVIL RHUME IBUPROFENE/PSEUDOEPHEDRINE, comprimé enrobé",route:"orale",activeIngredient:"ibuprofène ; pseudoéphédrine (chlorhydrate de)",expected:"competition",officialStatus:"Médicament contenant une substance interdite en compétition",feedback:"Le résultat indique que ce médicament contient une substance interdite en compétition.",instruction:"Recherche ce deuxième médicament de manière autonome, ouvre sa fiche puis reviens sélectionner le statut affiché."}
];
export function medicationAnswerRecord(exercise,answer){return{medicationId:exercise.id,answer,expectedStatus:exercise.expected,correct:answer===exercise.expected}}
