import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth,onAuthStateChanged,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase,ref,get,onValue,update,serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { SITUATIONS,VIGILANCE_CHOICES,FINAL_MESSAGE } from "../situations.js";
const config={apiKey:"AIzaSyCX6Y_ImG1YNEMY19pSSl4FxaHKqo72B3s",authDomain:"activites-procyclean.firebaseapp.com",databaseURL:"https://activites-procyclean-default-rtdb.europe-west1.firebasedatabase.app/",projectId:"activites-procyclean",storageBucket:"activites-procyclean.firebasestorage.app",messagingSenderId:"900663423725",appId:"1:900663423725:web:bc51501dcf653bfd1052e4"};
const auth=getAuth(initializeApp(config)),database=getDatabase(),$=s=>document.querySelector(s),EMAIL="prevention.dopage@ffc.fr";
let session,busy=false,code=String(new URLSearchParams(location.search).get("session")||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);
$("#session-code").textContent=$("#waiting-code").textContent=code||"—";
function showTop(panel){["#loading-panel","#login-panel","#error-panel"].forEach(id=>$(id).hidden=$(id)!==panel);$("#dashboard").hidden=panel!==null}
function units(){return Object.values(session?.participants||{})}
function stateLabel(status){return({waiting:"En attente",activity:"Parcours",review:"Mise en commun",final:"Bilan",closed:"Terminée"})[status]||status}
function distribution(item,field){const counts={};units().forEach(p=>{const value=p.answers?.[item.id]?.[field];if(value!==undefined)counts[value]=(counts[value]||0)+1});return counts}
function renderCards(container,labels,counts){
  container.replaceChildren();const total=Object.values(counts).reduce((a,b)=>a+b,0);
  Object.entries(labels).forEach(([key,label])=>{const count=counts[key]||0,percent=total?Math.round(count/total*100):0,card=document.createElement("article");card.innerHTML=`<span>${label}</span><strong>${count} · ${percent} %</strong><div class="result-bar"><span style="width:${percent}%"></span></div>`;container.append(card)});
}
function renderReview(){
  const index=Math.min(Number(session.reviewIndex)||0,SITUATIONS.length-1),item=SITUATIONS[index],revealed=Boolean(session.reviewRevealed);
  $("#review-progress").textContent=`Situation ${index+1} sur ${SITUATIONS.length}`;$("#review-title").textContent=item.title;$("#review-icon").textContent=item.icon;$("#review-text").textContent=item.text;
  renderCards($("#vigilance-results"),VIGILANCE_CHOICES,distribution(item,"vigilance"));
  $("#follow-up-title").textContent=item.followUp;
  renderCards($("#follow-up-results"),Object.fromEntries(item.followUpChoices.map((text,i)=>[i,text])),distribution(item,"followUp"));
  $("#correction").hidden=!revealed;$("#recommended").textContent=`Niveau recommandé : ${VIGILANCE_CHOICES[item.recommended]}${Number.isInteger(item.correctFollowUp)?` · Réponse complémentaire attendue : ${String.fromCharCode(65+item.correctFollowUp)}`:""}`;$("#explanation").textContent=item.explanation;$("#objective-link").textContent=`Lien avec la responsabilité objective : ${item.objectiveLink}`;
  $("#reveal-button").hidden=revealed;$("#next-button").hidden=!revealed;$("#next-button").textContent=index===SITUATIONS.length-1?"Afficher le message final":"Situation suivante";
}
function render(value){
  session=value;const participants=units(),completed=participants.filter(p=>p.status==="completed").length;
  $("#participant-count").textContent=participants.length;$("#completed-count").textContent=completed;$("#status").textContent=stateLabel(value.status);$("#connection-state").textContent="Mise à jour en direct";
  $("#waiting-panel").hidden=value.status!=="waiting";$("#monitor-panel").hidden=value.status!=="activity";$("#review-panel").hidden=value.status!=="review";$("#final-panel").hidden=value.status!=="final";$("#closed-panel").hidden=value.status!=="closed";
  $("#start-button").disabled=!participants.length||busy;$("#progress-message").textContent=`${completed} parcours terminé${completed>1?"s":""} sur ${participants.length}.`;$("#activity-progress").max=Math.max(participants.length,1);$("#activity-progress").value=completed;$("#final-message").textContent=FINAL_MESSAGE;
  if(value.status==="review")renderReview();
}
async function change(values){if(busy)return;busy=true;try{await update(ref(database,`sessions/${code}`),values)}catch(error){console.error(error);$("#action-message").textContent="L’action n’a pas pu être enregistrée."}finally{busy=false}}
$("#start-button").onclick=()=>change({status:"activity",activityStartedAt:serverTimestamp()});
$("#review-button").onclick=()=>change({status:"review",reviewIndex:0,reviewRevealed:false,reviewStartedAt:serverTimestamp()});
$("#reveal-button").onclick=()=>change({reviewRevealed:true});
$("#next-button").onclick=()=>{const index=Number(session.reviewIndex)||0;return index===SITUATIONS.length-1?change({status:"final",finalStartedAt:serverTimestamp()}):change({reviewIndex:index+1,reviewRevealed:false})};
$("#close-button").onclick=()=>change({status:"closed",closedAt:serverTimestamp()});
$("#login-form").addEventListener("submit",async event=>{event.preventDefault();try{await signInWithEmailAndPassword(auth,EMAIL,$("#code").value.trim())}catch(error){console.error(error);$("#login-message").textContent="Le code confidentiel est incorrect."}});
async function open(user){if(code.length!==6){$("#error-message").textContent="Code de session incorrect.";showTop($("#error-panel"));return}const sessionRef=ref(database,`sessions/${code}`),snap=await get(sessionRef);if(!snap.exists()||snap.val().activity!=="responsabilite-objective"||snap.val().facilitatorId!==user.uid){$("#error-message").textContent="Cette session n’est pas accessible.";showTop($("#error-panel"));return}showTop(null);render(snap.val());onValue(sessionRef,value=>value.exists()&&render(value.val()))}
onAuthStateChanged(auth,user=>{if(!user||user.isAnonymous){showTop($("#login-panel"));return}open(user).catch(error=>{console.error(error);$("#error-message").textContent="Chargement impossible.";showTop($("#error-panel"))})});
