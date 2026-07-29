import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get, onValue, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { SITUATIONS, VIGILANCE_CHOICES, FINAL_MESSAGE } from "../situations.js";

const config={apiKey:"AIzaSyCX6Y_ImG1YNEMY19pSSl4FxaHKqo72B3s",authDomain:"activites-procyclean.firebaseapp.com",databaseURL:"https://activites-procyclean-default-rtdb.europe-west1.firebasedatabase.app/",projectId:"activites-procyclean",storageBucket:"activites-procyclean.firebasestorage.app",messagingSenderId:"900663423725",appId:"1:900663423725:web:bc51501dcf653bfd1052e4"};
const auth=getAuth(initializeApp(config)), database=getDatabase();
const $=s=>document.querySelector(s);
const screens=["#loading","#error","#waiting","#situation","#transition","#completed","#closed"].map($);
let user, session, code, busy=false, transitionId=null;
const showOnly=screen=>screens.forEach(item=>item.hidden=item!==screen);
const sessionCode=()=>String(new URLSearchParams(location.search).get("session")||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);
function fail(message){$("#error-message").textContent=message;showOnly($("#error"))}
function authUser(){return new Promise((resolve,reject)=>{const stop=onAuthStateChanged(auth,async current=>{try{if(current?.isAnonymous){stop();resolve(current)}else{const credential=await signInAnonymously(auth);stop();resolve(credential.user)}}catch(error){stop();reject(error)}},reject)})}
async function register(){
  const result=await runTransaction(ref(database,`sessions/${code}`),value=>{
    if(!value||value.activity!=="responsabilite-objective")return;
    value.participants||={};const old=value.participants[user.uid];
    if(old?.participantNumber)return value;
    const number=(value.nextParticipantNumber||0)+1;value.nextParticipantNumber=number;
    value.participants[user.uid]={...old,participantNumber:number,joinedAt:old?.joinedAt||serverTimestamp(),status:"waiting",answers:old?.answers||{}};
    return value;
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
  $("#participant-label").textContent=`Participant ${participant.participantNumber}`;
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
  try{user=await authUser();const snap=await get(ref(database,`sessions/${code}`));if(!snap.exists()||snap.val().activity!=="responsabilite-objective"){fail("Cette session n’est pas disponible.");return}await register();onValue(ref(database,`sessions/${code}`),snapshot=>snapshot.exists()?render(snapshot.val()):fail("Cette session n’est plus disponible."),()=>fail("Synchronisation interrompue."))}
  catch(error){console.error(error);fail("La connexion à l’activité a échoué.")}
}
load();
