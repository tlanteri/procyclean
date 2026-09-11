// Les nouvelles séances utilisent directement les parcours individuels.
export const GROUP_VERSION = "solo-group-v1";
export const ACTIVITIES = {
  "podium-valeurs": "Le podium des valeurs",
  "vrai-faux-express": "Les bases du sport propre – Vrai/Faux express",
  "mission-controle": "La mission contrôle",
  "produit-mystere": "Le produit mystère",
  "traitement-controle": "Médicament : les bons réflexes",
  "responsabilite-objective": "À sa place, serais-tu vigilant ?",
  "droits-controle": "Mes droits pendant un contrôle",
  "labo-interdictions": "La liste des substances et méthodes interdites",
  "vrad-sanctions": "Les violations des règles antidopage et les sanctions",
  "aut-bon-parcours": "AUT : avant ou après ?",
  "onde-choc": "Les conséquences du dopage",
  "briser-silence": "Messages sous pression",
  "mission-localisation": "Mission localisation"
};

export function groupRoute(role, activity) {
  if (!Object.hasOwn(ACTIVITIES, activity)) return null;
  return `groupe/${role}.html?activity=${encodeURIComponent(activity)}`;
}

export function canJoin(session, uid) {
  return session.groupVersion === GROUP_VERSION &&
    Object.hasOwn(ACTIVITIES, session.activity) &&
    ["waiting", "activity", "paused", "review", "final"].includes(session.status) &&
    (!!session.participants?.[uid] ||
      (["waiting", "activity"].includes(session.status) && Object.keys(session.participants || {}).length < 30));
}

// Chaque appareil représente une personne ou une petite équipe.
export function reviewItems(participants = {}) {
  const items = new Map();
  for (const participant of Object.values(participants)) {
    for (const record of Object.values(participant.groupReport?.records || {})) {
      if (!record?.id || !record.prompt) continue;
      if (!items.has(record.id)) items.set(record.id, { ...record, responses: [] });
      items.get(record.id).responses.push({
        label: participant.label || `Appareil ${participant.participantNumber || ""}`,
        answer: record.answer,
        correct: record.correct
      });
    }
  }
  return [...items.values()].sort((a, b) => a.id.localeCompare(b.id, "fr", { numeric: true }));
}
