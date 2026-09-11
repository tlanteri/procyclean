import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get, onValue, update, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { ACTIVITIES, GROUP_VERSION, canJoin, reviewItems } from "./catalogue.js";

const config = { apiKey: "AIzaSyCX6Y_ImG1YNEMY19pSSl4FxaHKqo72B3s", authDomain: "activites-procyclean.firebaseapp.com", databaseURL: "https://activites-procyclean-default-rtdb.europe-west1.firebasedatabase.app/", projectId: "activites-procyclean", storageBucket: "activites-procyclean.firebasestorage.app", messagingSenderId: "900663423725", appId: "1:900663423725:web:bc51501dcf653bfd1052e4" };
const app = initializeApp(config);
const auth = getAuth(app), database = getDatabase(app);
const $ = selector => document.querySelector(selector);
const educator = document.body.dataset.role === "educateur";
const params = new URLSearchParams(location.search);
const code = (params.get("session") || "").toUpperCase();
const activity = params.get("activity");
const EMAIL = "prevention.dopage@ffc.fr";
const frame = $("#activity-frame");
let session, user, stopSession, connected = false, frameLoaded = false, ready = false;
let pendingReport = null, saving = false, busy = false, generation = 0;
const statusLabels = { waiting: "Accueil des participants", activity: "Parcours en cours", paused: "Pause collective", review: "Mise en commun", final: "Bilan", closed: "Séance terminée" };
$("#title").textContent = ACTIVITIES[activity] || "Séance en groupe";
$("#code").textContent = code;

function fail(message) { $("#error").textContent = message; $("#error").hidden = false; }
function clearError() { $("#error").hidden = true; }
function send(type, extra = {}) { frame.contentWindow?.postMessage({ channel: "procyclean-group", type, ...extra }, location.origin); }
function localKey() { return `procyclean-group:${code}:${user.uid}`; }
function cachedReport() { try { return JSON.parse(localStorage.getItem(localKey()) || "null"); } catch { return null; } }
function latestReport() {
  const remote = session.participants?.[user.uid]?.groupReport;
  const local = cachedReport();
  return local && (!remote || local.clientUpdatedAt > remote.clientUpdatedAt) ? local : remote;
}

function renderPeople() {
  const people = Object.values(session.participants || {});
  const completed = people.filter(person => person.groupReport?.complete).length;
  $("#counts").textContent = `${people.length} appareil${people.length > 1 ? "s" : ""} · ${completed} parcours terminé${completed > 1 ? "s" : ""}`;
  $("#empty").hidden = people.length > 0;
  $("#participants").replaceChildren(...people.map(person => {
    const card = document.createElement("article"), title = document.createElement("strong"), info = document.createElement("p"), progress = document.createElement("progress");
    card.className = "participant";
    title.textContent = person.label || `Appareil ${person.participantNumber || ""}`;
    const report = person.groupReport;
    info.textContent = report?.complete ? "Parcours terminé" : `${Math.round(report?.progress || 0)} % du parcours`;
    progress.max = 100; progress.value = report?.progress || 0;
    progress.setAttribute("aria-label", `Progression de ${title.textContent}`);
    card.append(title, info, progress); return card;
  }));
}

function renderDiscussion() {
  const items = reviewItems(session.participants);
  const index = Math.min(Math.max(0, Number(session.reviewIndex) || 0), Math.max(0, items.length - 1));
  const item = items[index];
  $("#review-count").textContent = item ? `Échange ${index + 1} sur ${items.length}` : "Mise en commun";
  $("#review-prompt").textContent = item?.prompt || "Aucune réponse enregistrée pour le moment.";
  $("#distribution").replaceChildren();
  if (item) {
    const distribution = new Map();
    item.responses.forEach(response => {
      const key = response.answer || "Sans réponse";
      distribution.set(key, (distribution.get(key) || 0) + 1);
    });
    for (const [answer, count] of distribution) {
      const row = document.createElement("article"), total = document.createElement("strong"), wording = document.createElement("span");
      total.textContent = `${count} appareil${count > 1 ? "s" : ""} · ${Math.round(count / item.responses.length * 100)} %`;
      wording.textContent = answer; row.append(total, wording); $("#distribution").append(row);
    }
  }
  $("#review-controls").hidden = !educator || !item;
  $("#previous").disabled = index === 0 || busy;
  $("#next").disabled = index >= items.length - 1 || busy;
  $("#reveal").hidden = !!session.reviewRevealed;
  $("#correction").hidden = !item || !session.reviewRevealed;
  $("#expected").textContent = item?.expected || "Plusieurs choix peuvent se défendre : expliquez votre raisonnement.";
  $("#explanation").textContent = item?.explanation || "Comparez vos réponses et choisissez ensemble un réflexe à retenir.";
}

function render(value) {
  session = value;
  $("#session").hidden = false; $("#login").hidden = true;
  $("#status").textContent = statusLabels[value.status] || value.status;
  $("#coach").hidden = !educator;
  $("#discussion").hidden = value.status !== "review";
  $("#final").hidden = !["final", "closed"].includes(value.status);
  $("#exercise").hidden = true; $("#waiting").hidden = true; $("#identity").hidden = true;
  if (educator) {
    renderPeople();
    const visibility = { start: ["waiting"], pause: ["activity"], resume: ["paused", "review"], review: ["activity", "paused"], finish: ["review"], close: ["waiting", "activity", "paused", "review", "final"] };
    for (const [id, statuses] of Object.entries(visibility)) { $("#" + id).hidden = !statuses.includes(value.status); $("#" + id).disabled = busy || !connected; }
    $("#start").disabled ||= !Object.keys(value.participants || {}).length;
  } else {
    const participant = value.participants?.[user.uid];
    const registered = !!participant;
    $("#identity").hidden = !registered || value.status !== "waiting";
    if (registered && value.status === "activity" && connected) {
      $("#exercise").hidden = false;
      if (!frameLoaded) {
        frameLoaded = true;
        frame.src = `../individuel/${activity}/index.html?group=1`;
        $("#save-status").textContent = "Chargement du parcours…";
      }
    } else if (registered && ["waiting", "paused", "activity"].includes(value.status)) {
      $("#waiting").hidden = false;
      $("#waiting-title").textContent = !connected ? "Connexion interrompue" : value.status === "paused" ? "Un temps d’échange ensemble" : "La séance va commencer";
      $("#waiting-message").textContent = !connected ? "Vos réponses sont conservées sur cet appareil. Le parcours reprendra après reconnexion." : value.status === "paused" ? "Écoutez les consignes de l’éducateur. Votre progression est conservée." : "L’éducateur lancera l’activité lorsque tout le monde sera prêt.";
    }
  }
  if (value.status === "review") renderDiscussion();
  if (["final", "closed"].includes(value.status)) {
    $("#final-title").textContent = value.status === "closed" ? "La séance est terminée" : "Le bilan de la séance";
    const people = Object.values(value.participants || {}), complete = people.filter(p => p.groupReport?.complete).length;
    $("#final-summary").textContent = `${complete} parcours terminé${complete > 1 ? "s" : ""} sur ${people.length} appareil${people.length > 1 ? "s" : ""}.`;
  }
}

async function change(values) {
  if (busy || !connected) return;
  busy = true; render(session); $("#action-message").textContent = "";
  try { await update(ref(database, `sessions/${code}`), values); }
  catch (error) { $("#action-message").textContent = /permission/i.test(error.code || error.message || "") ? "Le lancement ou la modification de la séance a été refusé par Firebase. Vérifiez les autorisations de cette séance." : "L’action n’a pas été enregistrée. Réessayez."; console.error(error); }
  finally { busy = false; render(session); }
}
$("#start").onclick = () => change({ status: "activity", activityStartedAt: serverTimestamp() });
$("#pause").onclick = () => change({ status: "paused" });
$("#resume").onclick = () => change({ status: "activity" });
$("#review").onclick = () => change({ status: "review", reviewIndex: 0, reviewRevealed: false });
$("#previous").onclick = () => change({ reviewIndex: Math.max(0, (session.reviewIndex || 0) - 1), reviewRevealed: false });
$("#next").onclick = () => change({ reviewIndex: Math.min(reviewItems(session.participants).length - 1, (session.reviewIndex || 0) + 1), reviewRevealed: false });
$("#reveal").onclick = () => change({ reviewRevealed: true });
$("#finish").onclick = () => change({ status: "final" });
$("#close").onclick = () => change({ status: "closed", closedAt: serverTimestamp() });

$("#identity-form").onsubmit = async event => {
  event.preventDefault();
  const label = $("#label").value.trim().slice(0, 40) || `Appareil ${session.participants?.[user.uid]?.participantNumber || ""}`;
  const button = event.currentTarget.querySelector("button"); button.disabled = true;
  try { await update(ref(database, `sessions/${code}/participants/${user.uid}`), { label }); clearError(); }
  catch (error) { fail("Votre nom n’a pas pu être enregistré. Réessayez."); console.error(error); }
  finally { button.disabled = false; }
};

async function savePending() {
  if (saving || !pendingReport || !connected) return;
  saving = true;
  const report = pendingReport; pendingReport = null;
  $("#save-status").textContent = "Enregistrement des réponses…";
  try {
    await update(ref(database, `sessions/${code}/participants/${user.uid}`), { groupReport: report, status: report.complete ? "completed" : "in-progress" });
    $("#save-status").textContent = report.complete ? "Parcours terminé. Vos réponses sont transmises à l’éducateur." : "Réponses enregistrées";
  } catch (error) {
    pendingReport ||= report;
    $("#save-status").textContent = "Enregistrement en attente. Vos réponses sont conservées sur cet appareil.";
    console.error(error);
    saving = false; return;
  }
  saving = false; if (pendingReport) savePending();
}

addEventListener("message", event => {
  if (educator || event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.channel !== "procyclean-group") return;
  const data = event.data;
  if (data.type === "ready") { send("init", { snapshot: latestReport()?.snapshot || null }); }
  if (data.type === "initialized") { ready = true; frame.hidden = false; }
  if (data.type === "error") fail(data.message);
  if (data.type === "leave") location.href = "../index.html";
  if (data.type === "report" && ready && data.report && session) {
    const report = { ...data.report, clientUpdatedAt: Date.now() };
    try { localStorage.setItem(localKey(), JSON.stringify(report)); } catch { fail("La sauvegarde locale est indisponible. Gardez cette page ouverte jusqu’à la confirmation d’enregistrement."); }
    pendingReport = report; savePending();
  }
});

async function open(current) {
  const ownGeneration = ++generation;
  stopSession?.(); user = current;
  const sessionRef = ref(database, `sessions/${code}`), snapshot = await get(sessionRef);
  if (ownGeneration !== generation) return;
  const value = snapshot.val();
  if (!value || value.activity !== activity || value.groupVersion !== GROUP_VERSION) throw new Error("Cette séance n’est pas disponible.");
  if (educator) {
    if (value.facilitatorId !== current.uid) throw new Error("Cette séance appartient à un autre éducateur.");
  } else {
    if (!canJoin(value, current.uid) && value.status !== "closed") throw new Error("Cette séance n’accepte plus de nouveaux participants.");
    if (value.status !== "closed") {
      const registration = await runTransaction(ref(database, `sessions/${code}/participants/${current.uid}`), existing => {
        const participant = existing || {};
        return { ...participant, label: participant.label || `Appareil ${participant.participantNumber || current.uid.slice(-6).toUpperCase()}`, joinedAt: participant.joinedAt || serverTimestamp(), status: participant.status || "connected" };
      });
      if (!registration.committed) throw new Error("L’inscription n’a pas abouti. La séance a peut-être changé.");
    }
  }
  clearError();
  stopSession = onValue(sessionRef, snap => {
    if (!snap.exists()) { $("#session").hidden = true; fail("Cette séance n’existe plus."); return; }
    render(snap.val());
  }, error => { $("#session").hidden = true; fail("La synchronisation a été interrompue. Rechargez la page pour vous reconnecter."); console.error(error); });
}

$("#login-form").onsubmit = async event => {
  event.preventDefault();
  try { await signInWithEmailAndPassword(auth, EMAIL, $("#secret").value.trim()); $("#secret").value = ""; clearError(); }
  catch { fail("Le code confidentiel est incorrect ou la connexion est indisponible."); }
};

if (!/^[A-Z0-9]{6}$/.test(code) || !Object.hasOwn(ACTIVITIES, activity)) {
  fail("Le lien de séance est incomplet. Revenez aux activités et saisissez votre code.");
} else {
  onValue(ref(database, ".info/connected"), snapshot => {
    connected = snapshot.val() === true;
    $("#connection").textContent = connected ? "Connecté à la séance" : "Connexion en cours…";
    if (session) render(session);
    if (connected) savePending();
  });
  onAuthStateChanged(auth, current => {
    if (educator && (!current || current.isAnonymous)) { generation++; stopSession?.(); $("#login").hidden = false; $("#session").hidden = true; return; }
    if (!educator && (!current || !current.isAnonymous)) { signInAnonymously(auth).catch(() => fail("La connexion participant a échoué.")); return; }
    open(current).catch(error => fail(error.message || "Chargement impossible."));
  });
}
addEventListener("online", savePending);
const retryTimer = setInterval(savePending, 5000);
addEventListener("pagehide", () => { stopSession?.(); clearInterval(retryTimer); });
