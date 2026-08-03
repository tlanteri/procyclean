import {SITUATIONS,VIGILANCE_CHOICES,FINAL_MESSAGE} from "../../responsabilite-objective/situations.js";
const $=s=>document.querySelector(s),screens=["#intro","#situation","#transition","#completed","#results","#conclusion"].map($);
let index=0,answers={};
let visibleScreen=null;
const activityFocusSpacer=document.createElement("div");
activityFocusSpacer.setAttribute("aria-hidden","true");
activityFocusSpacer.style.height="0";
document.body.append(activityFocusSpacer);
function focusActivityScreen(screen){const focus=()=>{const bounds=screen.getBoundingClientRect(),visibleHeight=Math.min(bounds.height,window.innerHeight-32),centeredTop=window.scrollY+bounds.top-(window.innerHeight-visibleHeight)/2,targetTop=Math.max(0,centeredTop),naturalMaximumTop=document.documentElement.scrollHeight-window.innerHeight-activityFocusSpacer.offsetHeight;activityFocusSpacer.style.height=`${Math.max(0,targetTop-naturalMaximumTop)}px`;window.scrollTo({top:targetTop,behavior:"auto"})};focus();requestAnimationFrame(focus)}
function showOnly(screen){const screenChanged=visibleScreen!==screen;if(screenChanged)activityFocusSpacer.style.height=`${window.innerHeight}px`;screens.forEach(item=>item.hidden=item!==screen);visibleScreen=screen;if(screenChanged)focusActivityScreen(screen)}
function options(container,name,values){container.replaceChildren();Object.entries(values).forEach(([value,text])=>{const label=document.createElement("label"),input=document.createElement("input");input.type="radio";input.name=name;input.value=value;label.append(input,document.createTextNode(text));container.append(label)})}
function renderSituation(){const item=SITUATIONS[index];$("#progress-label").textContent=`Situation ${index+1} sur ${SITUATIONS.length}`;$("#progress-bar").style.width=`${(index+1)/SITUATIONS.length*100}%`;$("#icon").textContent=item.icon;$("#title").textContent=item.title;$("#text").textContent=item.text;$("#follow-up-question").textContent=item.followUp;options($("#vigilance-options"),"vigilance",VIGILANCE_CHOICES);options($("#follow-up-options"),"followUp",Object.fromEntries(item.followUpChoices.map((text,i)=>[i,text])));$("#message").textContent="";$("#submit-button").disabled=false;showOnly($("#situation"))}
$("#form").addEventListener("submit",event=>{event.preventDefault();const data=new FormData(event.currentTarget),vigilance=data.get("vigilance"),followUp=data.get("followUp");if(!vigilance||followUp===null){$("#message").textContent="Réponds aux deux questions.";return}$("#submit-button").disabled=true;const item=SITUATIONS[index];if(answers[item.id])return;answers[item.id]={vigilance,followUp:Number(followUp)};showOnly($("#transition"));setTimeout(()=>{index+=1;index===SITUATIONS.length?showOnly($("#completed")):renderSituation()},600)});
function vigilanceFeedback(choice,recommended){
  if(choice===recommended){
    return {className:"recommended",text:"Bon réflexe : ta décision correspond au niveau de prudence attendu dans cette situation."};
  }
  if(choice==="vigilant"&&recommended==="stop"){
    return {className:"almost-safe",text:"Tu as bien identifié qu’il fallait être vigilant. Dans cette situation, il faut aller plus loin : ne rien prendre et demander conseil avant toute consommation."};
  }
  if(choice==="stop"&&recommended==="vigilant"){
    return {className:"recommended",text:"Très bon réflexe de prudence : demander conseil et ne rien prendre permet de sécuriser la décision."};
  }
  return {className:"needs-care",text:"Cette situation demande davantage de prudence avant de consommer le produit."};
}
function renderResults(){const list=$("#result-list");list.replaceChildren();SITUATIONS.forEach((item,position)=>{const answer=answers[item.id],feedback=vigilanceFeedback(answer.vigilance,item.recommended),article=document.createElement("article"),expected=Number.isInteger(item.correctFollowUp)?`<p class="recommended-level">Réponse complémentaire attendue : ${String.fromCharCode(65+item.correctFollowUp)} — ${item.followUpChoices[item.correctFollowUp]}</p>`:"";article.className=feedback.className;article.innerHTML=`<div class="result-head"><span>${item.icon}</span><div><small>Situation ${position+1}</small><h3>${item.title}</h3></div></div><p><strong>Ton choix :</strong> ${VIGILANCE_CHOICES[answer.vigilance]}</p><p class="choice-feedback">${feedback.text}</p><p><strong>Réponse complémentaire :</strong> ${item.followUpChoices[answer.followUp]}</p><p class="recommended-level">Vigilance recommandée : ${VIGILANCE_CHOICES[item.recommended]}</p>${expected}<p>${item.explanation}</p><p class="objective-link">${item.objectiveLink}</p>`;list.append(article)});$("#final-message").textContent=FINAL_MESSAGE;showOnly($("#results"))}
function restart(){index=0;answers={};showOnly($("#intro"))}
$("#start-button").onclick=renderSituation;$("#results-button").onclick=renderResults;$("#conclusion-button").onclick=()=>showOnly($("#conclusion"));$("#restart-button").onclick=restart;
document.documentElement.dataset.individualResponsibilityReady="true";
