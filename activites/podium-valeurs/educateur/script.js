import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getDatabase, ref, get, onValue, update, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX6Y_ImG1YNEMY19pSSl4FxaHKqo72B3s",
  authDomain: "activites-procyclean.firebaseapp.com",
  databaseURL: "https://activites-procyclean-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "activites-procyclean",
  storageBucket: "activites-procyclean.firebasestorage.app",
  messagingSenderId: "900663423725",
  appId: "1:900663423725:web:bc51501dcf653bfd1052e4"
};

const GROUP_IDENTITIES = [
  ["Bleu", "Éclair", "⚡", "#1677d2"],
  ["Rouge", "Flamme", "🔥", "#d83b32"],
  ["Vert", "Feuille", "🍃", "#258a52"],
  ["Jaune", "Étoile", "★", "#d29a00"],
  ["Violet", "Lune", "☾", "#7c4dcc"],
  ["Orange", "Soleil", "☀", "#dc6b18"],
  ["Turquoise", "Vague", "≈", "#008b91"],
  ["Rose", "Cœur", "♥", "#c83e78"],
  ["Marron", "Montagne", "▲", "#80583d"],
  ["Gris", "Nuage", "☁", "#687583"]
].map(([colorName, symbolName, symbol, color], index) => ({
  id: `group-${index + 1}`, number: index + 1,
  colorName, symbolName, symbol, color
}));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const FACILITATOR_EMAIL = "prevention.dopage@ffc.fr";
const code = (new URLSearchParams(location.search).get("session") || "")
  .toUpperCase().replace(/[^A-Z0-9]/g, "");

const $ = (selector) => document.querySelector(selector);
let currentSession = null;
let actionInProgress = false;

function showError(message) {
  $("#dashboard-content").hidden = true;
  $("#login-panel").hidden = true;
  $("#error-panel").hidden = false;
  $("#error-message").textContent = message;
}

function showLogin() {
  $("#dashboard-content").hidden = true;
  $("#error-panel").hidden = true;
  $("#login-panel").hidden = false;
  $("#connection-state").textContent = "Authentification requise";
}

function shuffled(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function balancedSizes(count) {
  const groupCount = Math.ceil(count / 3);
  if (!groupCount) return [];
  const base = Math.floor(count / groupCount);
  const extra = count % groupCount;
  return Array.from(
    { length: groupCount },
    (_, index) => base + (index < extra ? 1 : 0)
  );
}

function render(session) {
  currentSession = session;
  const participants = Object.entries(session.participants || {});
  const groups = Object.values(session.groups || {});
  const submitted = participants.filter(([, participant]) =>
    participant.status === "ranking-submitted" ||
    participant.status === "group-assigned" ||
    participant.status === "group-result-submitted"
  );

  $("#participant-count").textContent = participants.length;
  $("#ranking-count").textContent = submitted.length;
  $("#group-count").textContent = groups.length;
  $("#connection-state").textContent = "Mise à jour en direct";

  const groupsFormed = Boolean(session.groupsLocked);
  const sessionClosed = session.status === "closed";
  $("#form-groups-button").disabled =
    actionInProgress || groupsFormed || participants.length < 2 ||
    sessionClosed;
  $("#form-groups-button").textContent =
    groupsFormed ? "Groupes verrouillés" : "Former les groupes";
  $("#phase-description").textContent = sessionClosed
    ? "L’activité est clôturée. Le message de fin est affiché sur tous les appareils."
    : groupsFormed
      ? "Les participants se regroupent puis construisent leur top 3 collectif."
      : "Attendez les classements individuels, puis lancez la répartition.";
  $("#close-activity-button").hidden = !groupsFormed;
  $("#close-activity-button").disabled =
    actionInProgress || sessionClosed;
  $("#close-activity-button").textContent = sessionClosed
    ? "Activité clôturée"
    : "Clôturer l’activité";

  $("#groups-panel").hidden = !groupsFormed;
  $("#results-panel").hidden = !groupsFormed;
  renderGroups(groups);
  renderResults(groups);
}

function renderGroups(groups) {
  const grid = $("#groups-grid");
  grid.replaceChildren();
  groups.sort((a, b) => a.number - b.number).forEach((group) => {
    const card = document.createElement("article");
    card.className = "group-card";
    card.style.setProperty("--group-color", group.color);
    const memberCount = Object.keys(group.members || {}).length;
    card.innerHTML = `
      <div class="group-title">
        <span class="group-symbol" aria-hidden="true">${group.symbol}</span>
        <span>Groupe ${group.number} — ${group.colorName}</span>
      </div>
      <p>${group.symbolName} · ${memberCount} participant${memberCount > 1 ? "s" : ""}</p>
      <p><strong>1 appareil désigné pour la saisie collective</strong></p>
      <div class="member-dots" aria-label="${memberCount} participants">
        ${Array.from({ length: memberCount }, () => "<span></span>").join("")}
      </div>`;
    grid.append(card);
  });
}

function renderResults(groups) {
  const grid = $("#results-grid");
  grid.replaceChildren();
  groups.sort((a, b) => a.number - b.number).forEach((group) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.style.setProperty("--group-color", group.color);
    const result = group.result;
    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = `${group.symbol} Groupe ${group.number}`;
    card.append(title);

    if (result) {
      const list = document.createElement("ol");
      result.top3.forEach((value) => {
        const item = document.createElement("li");
        item.textContent = value;
        list.append(item);
      });
      const rule = document.createElement("p");
      rule.className = "rule";
      const label = document.createElement("strong");
      label.textContent = "Règle : ";
      rule.append(label, document.createTextNode(result.rule));
      card.append(list, rule);
    } else {
      const pending = document.createElement("p");
      pending.textContent = "Réponse collective en attente…";
      card.append(pending);
    }
    grid.append(card);
  });
}

async function formGroups() {
  if (actionInProgress || !currentSession || currentSession.groupsLocked) return;
  const participants = Object.entries(currentSession.participants || {});
  if (participants.length < 2) {
    $("#action-message").textContent = "Il faut au moins deux participants.";
    return;
  }
  if (participants.length > 30) {
    $("#action-message").textContent = "La session dépasse la limite de 30 participants.";
    return;
  }
  const unfinished = participants.filter(([, p]) => !Array.isArray(p.ranking));
  if (unfinished.length) {
    const proceed = window.confirm(
      `${unfinished.length} participant(s) n’ont pas terminé leur classement. Former les groupes quand même ?`
    );
    if (!proceed) return;
  }

  actionInProgress = true;
  $("#form-groups-button").disabled = true;
  $("#action-message").textContent = "Répartition en cours…";
  try {
    const randomized = shuffled(participants.map(([uid]) => uid));
    const sizes = balancedSizes(randomized.length);
    const changes = {};
    let cursor = 0;
    sizes.forEach((size, index) => {
      const identity = GROUP_IDENTITIES[index];
      const memberIds = randomized.slice(cursor, cursor + size);
      cursor += size;
      const members = Object.fromEntries(memberIds.map((uid) => [uid, true]));
      changes[`groups/${identity.id}`] = {
        ...identity,
        members,
        editorUid: memberIds[0],
        status: "collective-work"
      };
      memberIds.forEach((uid) => {
        changes[`participants/${uid}/groupId`] = identity.id;
        changes[`participants/${uid}/status`] = "group-assigned";
      });
    });
    changes.groupsLocked = true;
    changes.status = "groups-formed";
    changes.groupsFormedAt = serverTimestamp();
    await update(ref(database, `sessions/${code}`), changes);
    $("#action-message").textContent = "Les groupes sont formés et verrouillés.";
  } catch (error) {
    console.error(error);
    $("#action-message").textContent = "La répartition n’a pas pu être enregistrée.";
  } finally {
    actionInProgress = false;
  }
}

$("#form-groups-button").addEventListener("click", formGroups);
$("#close-activity-button").addEventListener("click", async () => {
  if (
    actionInProgress ||
    !currentSession ||
    currentSession.status === "closed"
  ) {
    return;
  }

  const groups = Object.values(currentSession.groups || {});
  const unfinishedCount = groups.filter((group) => !group.result).length;
  const warning = unfinishedCount
    ? ` ${unfinishedCount} groupe(s) n’ont pas encore validé leur réponse.`
    : "";
  const confirmed = window.confirm(
    `Clôturer définitivement l’activité ?${warning}`
  );

  if (!confirmed) return;
  actionInProgress = true;
  $("#close-activity-button").disabled = true;
  $("#action-message").textContent = "Clôture en cours…";

  try {
    await update(ref(database, `sessions/${code}`), {
      status: "closed",
      closedAt: serverTimestamp()
    });
    $("#action-message").textContent =
      "L’activité est clôturée sur tous les appareils.";
  } catch (error) {
    console.error(error);
    $("#action-message").textContent =
      "La clôture n’a pas pu être enregistrée.";
  } finally {
    actionInProgress = false;
  }
});
$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const confidentialCode = $("#facilitator-code").value.trim();
  const button = $("#login-button");
  const message = $("#login-message");
  button.disabled = true;
  message.textContent = "Connexion en cours…";

  try {
    await signInWithEmailAndPassword(
      auth,
      FACILITATOR_EMAIL,
      confidentialCode
    );
    $("#login-form").reset();
    message.textContent = "";
  } catch (error) {
    console.error(error);
    message.textContent = "Le code confidentiel est incorrect.";
    $("#facilitator-code").select();
  } finally {
    button.disabled = false;
  }
});
$("#session-code").textContent = code || "—";

onAuthStateChanged(auth, async (user) => {
  if (!user || user.isAnonymous) {
    showLogin();
    return;
  }
  if (code.length !== 6) {
    showError("Le code de session est absent ou incorrect.");
    return;
  }
  const snapshot = await get(ref(database, `sessions/${code}`));
  if (!snapshot.exists() || snapshot.val().facilitatorId !== user.uid) {
    showError("Cette session n’existe pas ou ne vous appartient pas.");
    return;
  }
  $("#login-panel").hidden = true;
  $("#error-panel").hidden = true;
  $("#dashboard-content").hidden = false;
  onValue(ref(database, `sessions/${code}`), (sessionSnapshot) => {
    if (!sessionSnapshot.exists()) {
      showError("La session n’est plus disponible.");
      return;
    }
    render(sessionSnapshot.val());
  });
});
