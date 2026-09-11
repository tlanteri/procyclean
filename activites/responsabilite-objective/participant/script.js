import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get, onValue, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { SITUATIONS, VIGILANCE_CHOICES, FINAL_MESSAGE } from "../situations.js";

const config={apiKey:"AIzaSyCX6Y_ImG1YNEMY19pSSl4FxaHKqo72B3s",authDomain:"activites-procyclean.firebaseapp.com",databaseURL:"https://activites-procyclean-default-rtdb.europe-west1.firebasedatabase.app/",projectId:"activites-procyclean",storageBucket:"activites-procyclean.firebasestorage.app",messagingSenderId:"900663423725",appId:"1:900663423725:web:bc51501dcf653bfd1052e4"};
const auth=getAuth(initializeApp(config)), database=getDatabase();
const $=s=>document.querySelector(s);
const screens=["#loading","#error","#waiting","#situation","#transition","#completed","#closed"].map($);
let user, session, code, busy=false, transitionId=null;
let visibleScreen=null;
const activityFocusSpacer=document.createElement("div");
activityFocusSpacer.setAttribute("aria-hidden","true");
activityFocusSpacer.style.height="0";
document.body.append(activityFocusSpacer);
function focusActivityScreen(screen){const focus=()=>{const bounds=screen.getBoundingClientRect(),visibleHeight=Math.min(bounds.height,window.innerHeight-32),centeredTop=window.scrollY+bounds.top-(window.innerHeight-visibleHeight)/2,targetTop=Math.max(0,centeredTop),naturalMaximumTop=document.documentElement.scrollHeight-window.innerHeight-activityFocusSpacer.offsetHeight;activityFocusSpacer.style.height=`${Math.max(0,targetTop-naturalMaximumTop)}px`;window.scrollTo({top:targetTop,behavior:"auto"})};focus();requestAnimationFrame(focus)}
function showOnly(screen){const screenChanged=visibleScreen!==screen;if(screenChanged)activityFocusSpacer.style.height=`${window.innerHeight}px`;screens.forEach(item=>item.hidden=item!==screen);visibleScreen=screen;if(screenChanged)focusActivityScreen(screen)}
const sessionCode=()=>String(new URLSearchParams(location.search).get("session")||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);
function fail(message){$("#error-message").textContent=message;showOnly($("#error"))}
function authUser(){return new Promise((resolve,reject)=>{const stop=onAuthStateChanged(auth,async current=>{try{if(current?.isAnonymous){stop();resolve(current)}else{const credential=await signInAnonymously(auth);stop();resolve(credential.user)}}catch(error){stop();reject(error)}},reject)})}
async function register(){
  const result=await runTransaction(ref(database,`sessions/${code}/participants/${user.uid}`),current=>{
    const participant=current||{};
    return {...participant,joinedAt:participant.joinedAt||serverTimestamp(),status:participant.status||"waiting",answers:participant.answers||{}};
  });
  if(!result.committed)throw new Error("Inscription impossible");
}
function renderOptions(container,name,choices){
  container.replaceChildren();
  Object.entries(choices).forEach(([value,text])=>{const label=document.createElement("label");const input=document.createElement("input");input.type="radio";input.name=name;input.value=value;label.append(input,document.createTextNode(text));container.append(label)});
}
function render(value){
  session=value;const participant=value.participants?.[user.uid];
  if(!participant)return;
  $("#participant-label").textContent=`Participant ${participant.participantNumber||user.uid.slice(-6).toUpperCase()}`;
  if(value.status==="closed"){$("#final-message").textContent=FINAL_MESSAGE;showOnly($("#closed"));return}
  if(value.status==="waiting"){showOnly($("#waiting"));return}
  const answers=participant.answers||{};
  const index=SITUATIONS.findIndex(item=>!answers[item.id]);
  if(index<0){showOnly($("#completed"));return}
  if(value.status!=="activity"){showOnly($("#waiting"));return}
  const item=SITUATIONS[index];
  if(transitionId&&transitionId!==item.id){transitionId=null;showOnly($("#transition"));setTimeout(()=>render(session),650);return}
  $("#progress-label").textContent=`Situation ${index+1} sur ${SITUATIONS.length}`;
  $("#progress-bar").style.width=`${((index+1)/SITUATIONS.length)*100}%`;
  $("#situation-icon").textContent=item.icon;$("#situation-title").textContent=item.title;$("#situation-text").textContent=item.text;
  $("#follow-up-question").textContent=item.followUp;
  renderOptions($("#vigilance-options"),"vigilance",VIGILANCE_CHOICES);
  renderOptions($("#follow-up-options"),"followUp",Object.fromEntries(item.followUpChoices.map((text,i)=>[String(i),text])));
  $("#answer-message").textContent="";$("#submit-button").disabled=false;showOnly($("#situation"));
}
$("#answer-form").addEventListener("submit",async event=>{
  event.preventDefault();if(busy||session?.status!=="activity")return;
  const data=new FormData(event.currentTarget),vigilance=data.get("vigilance"),followUp=data.get("followUp");
  if(!vigilance||followUp===null){$("#answer-message").textContent="Réponds aux deux questions.";return}
  const participant=session.participants[user.uid], item=SITUATIONS.find(current=>!participant.answers?.[current.id]);
  if(!item)return;busy=true;$("#submit-button").disabled=true;
  try{
    const result=await runTransaction(ref(database,`sessions/${code}/participants/${user.uid}`),current=>{
      if(!current||current.answers?.[item.id])return;
      const answers={...(current.answers||{}),[item.id]:{vigilance,followUp:Number(followUp),answeredAt:Date.now()}};
      const complete=Object.keys(answers).length===SITUATIONS.length;
      return {...current,answers,status:complete?"completed":"in-progress",currentSituation:complete?SITUATIONS.length:Object.keys(answers).length,startedAt:current.startedAt||Date.now(),...(complete?{completedAt:Date.now()}:{})};
    });
    if(result.committed){transitionId=item.id;showOnly($("#transition"))}
  }catch(error){console.error(error);$("#answer-message").textContent="Enregistrement impossible. Réessaie.";$("#submit-button").disabled=false}
  finally{busy=false}
});
async function load(){
  code=sessionCode();if(code.length!==6){fail("Le code de session est absent ou incorrect.");return}
  let step="identification";
  try{
    user=await authUser();step="lecture de la séance";
    const snap=await get(ref(database,`sessions/${code}`));
    if(!snap.exists()||snap.val().activity!=="responsabilite-objective"){fail("Cette session n’est pas disponible.");return}
    if(snap.val().groupVersion==="solo-group-v1"){
      const destination=new URL("../../groupe/participant.html",location.href);
      destination.searchParams.set("activity","responsabilite-objective");destination.searchParams.set("session",code);
      location.replace(destination.href);return;
    }
    if(snap.val().status==="closed"){fail("Cette séance est terminée. Rejoins une nouvelle séance.");return}
    step="inscription du participant";await register();
    onValue(ref(database,`sessions/${code}`),snapshot=>snapshot.exists()?render(snapshot.val()):fail("Cette session n’est plus disponible."),error=>fail(`Synchronisation interrompue (${error.code||"connexion"}).`));
  }
  catch(error){console.error(error);fail(`Connexion impossible à l’étape « ${step} » (${error.code||error.message||"erreur inconnue"}).`)}
}
load();
