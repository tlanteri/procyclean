import {SITUATIONS,VIGILANCE_CHOICES,FINAL_MESSAGE} from "../../responsabilite-objective/situations.js";
const $=s=>document.querySelector(s),screens=["#intro","#situation","#transition","#completed","#results"].map($);
let index=0,answers={};
function showOnly(screen){screens.forEach(item=>item.hidden=item!==screen);scrollTo({top:0,behavior:"smooth"})}
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
$("#start-button").onclick=renderSituation;$("#results-button").onclick=renderResults;$("#restart-button").onclick=restart;
document.documentElement.dataset.individualResponsibilityReady="true";
