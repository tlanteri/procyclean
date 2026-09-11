import { ACTIVITIES, GROUP_VERSION, canJoin, reviewItems } from '../catalogue.js';
import { SITUATIONS } from '../../responsabilite-objective/situations.js';
const result = window.testResults = {done:false, passed:[], errors:[]};
const frame = document.querySelector('#frame');
let latest, initial, initialized;
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
const assert = (condition, message) => {if(!condition)throw Error(message);};
async function wait(predicate, message, timeout=7000) { const until=Date.now()+timeout;while(Date.now()<until){if(predicate())return;await sleep(30);}throw Error(message); }
const doc = () => frame.contentDocument;
const el = selector => {const node=doc().querySelector(selector);assert(node,'Élément absent : '+selector);return node;};
const click = selector => {const node=el(selector);assert(!node.disabled,'Bouton désactivé : '+selector);node.click();};
const fill = selector => {const root=el(selector),names=new Set();root.querySelectorAll('input[type=radio]').forEach(input=>{if(!names.has(input.name)){input.checked=true;names.add(input.name);}});root.querySelectorAll('select').forEach(select=>select.selectedIndex=1);root.querySelectorAll('input[type=checkbox]').forEach(input=>input.checked=true);};
const submit = selector => el(selector).requestSubmit();
addEventListener('message',event=>{
  if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.channel!=='procyclean-group')return;
  const data=event.data;
  if(data.type==='ready')frame.contentWindow.postMessage({channel:'procyclean-group',type:'init',snapshot:initial},location.origin);
  if(data.type==='initialized')initialized=true;
  if(data.type==='report')latest=data.report;
  if(data.type==='error')result.errors.push(data.message);
});
async function load(id, snapshot=null) {
  latest=null;initial=snapshot;initialized=false;
  frame.src=`../../individuel/${id}/index.html?group=1&t=${Date.now()}`;
  await wait(()=>initialized&&latest,'Chargement/synchronisation : '+id);
}
async function resume(id) {await sleep(200);const before=latest;assert(before,'Rapport absent');await load(id,before.snapshot);assert(latest.progress>=before.progress-1,'Progression perdue après rechargement : '+id);assert(latest.records.length>=before.records.length,'Réponses perdues : '+id);}
function drag(source,target) {
  const win=frame.contentWindow,document=doc(),original=document.elementFromPoint;
  source.setPointerCapture=()=>{};
  document.elementFromPoint=()=>target;
  source.dispatchEvent(new win.PointerEvent('pointerdown',{bubbles:true,pointerId:1,button:0,clientX:100,clientY:200}));
  source.dispatchEvent(new win.PointerEvent('pointerup',{bubbles:true,pointerId:1,button:0,clientX:200,clientY:300}));
  document.elementFromPoint=original;
}
const scenarios = {
  'podium-valeurs': async()=>{for(let i=0;i<10;i++)drag(el('#value-bank [data-drag-value]'),el(`[data-slot-index="${i}"]`));click('#validate-ranking-button');await resume('podium-valeurs');el('#collective-rule').value='Respecter les autres et demander conseil';click('#submit-collective-button');},
  'mission-controle': async()=>{for(let i=0;i<9;i++)drag(el('#mission-choices [data-drag-step]'),el(`[data-slot-index="${i}"]`));click('#validate-ranking-button');await resume('mission-controle');click('#finish-mission');},
  'vrai-faux-express': async()=>{for(let i=0;i<8;i++){click(i%2?'#true-button':'#false-button');if(i===1)await resume('vrai-faux-express');click('#next-question-button');if(i===3)click('#start-round-two-button');}el('#sport-definition').value='Respecter sa santé et les règles';el('[name="reliable-source"]').checked=true;submit('#definition-form');},
  'produit-mystere': async()=>{click('#start-mission-button');fill('#need-form');submit('#need-form');click('#continue-to-inspection');for(let i=0;i<7;i++){doc().querySelectorAll('#clue-buttons [data-clue-id], #inspection-screen [data-clue-id]')[i].click();fill('#clue-form');submit('#clue-form');}await resume('produit-mystere');click('#open-ranking-button');for(let i=0;i<7;i++)doc().querySelectorAll('.ranking-card')[i].querySelector('button').click();click('#submit-investigation-button');click('#continue-to-decision');click('[data-decision-id]');click('#submit-final-decision-button');},
  'traitement-controle': async()=>{click('.story-choice');click('#start-story-button');for(let i=0;i<5;i++){fill('#situation-form');submit('#situation-form');await sleep(750);}click('#show-results-button');},
  'responsabilite-objective': async()=>{click('#start-button');for(let i=0;i<20&&el('#completed').hidden;i++){fill('#form');submit('#form');await sleep(650);}click('#results-button');click('#conclusion-button');},
  'droits-controle': async()=>{click('#start');for(let i=0;i<30;i++){fill('#answer-form');submit('#answer-form');click('#continue');if(!el('#final').hidden)break;}},
  'labo-interdictions': async()=>{click('#start');for(let i=0;i<40;i++){click('#answers button');click('#validate');click('#next');if(!el('#final').hidden)break;}click('#learn');click('#begin-medications');for(let i=0;i<20;i++){click('#medication-options button');click('#validate-medication');click('#next-medication');if(!el('#activity-final').hidden)break;}},
  'vrad-sanctions': async()=>{click('#start');for(let i=0;i<11;i++){click('#discover-choices button');click('#validate-discovery');click('#next-discovery');}click('#begin-classification');for(let i=0;i<11;i++)drag(el('#card-bank button'),el('[data-zone="athlete"]'));click('#validate-classification');click('#begin-sanctions');for(let i=0;i<11;i++){doc().querySelectorAll('[data-vrad]')[i].click();click('[data-sanction]');}click('#validate-sanctions');click('#finish');},
  'aut-bon-parcours': async()=>{for(let i=0;i<4;i++){fill('#step-content');click('#validate');click('#continue');}},
  'onde-choc': async()=>{const count=doc().querySelectorAll('#cards .drag-card').length;for(let i=0;i<count;i++){click('#cards .drag-card');click('.drop-zone');}submit('#quiz-form');},
  'briser-silence': async()=>{click('#start');const count=doc().querySelectorAll('.message-preview').length;for(let i=0;i<count;i++){click(`.message-preview[data-index="${i}"]`);click('.clue-message button');click('#interaction-action');click('[data-action]');click('#interaction-action');if(doc().querySelector('#prepare-report')){click('#prepare-report');click('[data-sim]');click('#interaction-action');fill('#interaction');click('#interaction-action');click('[data-sim]');click('#interaction-action');click('#finish-report');}else{fill('#interaction');click('#interaction-action');click('#finish-conversation');}}},
  'mission-localisation': async()=>{click('#start');for(let i=0;i<5;i++){fill('#mission-form');submit('#mission-form');if(el('#feedback').hidden)submit('#mission-form');assert(!el('#feedback').hidden,'Mission sans correction : '+i);click('#continue');}}
};

async function sessionTest() {
  frame.src='about:blank';await sleep(100);
  await fetch('/test-db',{method:'POST',body:JSON.stringify({key:'sessions',value:{ABC123:{activity:'aut-bon-parcours',activityName:ACTIVITIES['aut-bon-parcours'],groupVersion:GROUP_VERSION,facilitatorId:'teacher',status:'waiting'}}})});
  const coach=document.createElement('iframe'),participant=document.createElement('iframe');document.body.append(coach,participant);
  coach.src='../educateur.html?activity=aut-bon-parcours&session=ABC123';
  participant.src='../participant.html?activity=aut-bon-parcours&session=ABC123';
  await wait(()=>participant.contentDocument?.querySelector('#identity')?.hidden===false,'Inscription participant');
  const pd=()=>participant.contentDocument,cd=()=>coach.contentDocument;
  pd().querySelector('#label').value='<Équipe test>';pd().querySelector('#identity-form').requestSubmit();
  await wait(()=>cd()?.querySelector('#start')?.disabled===false,'Participant visible par éducateur');
  await wait(()=>cd().querySelector('.participant strong')?.textContent==='<Équipe test>','Nom facultatif enregistré');
  assert(cd().querySelector('.participant strong').textContent==='<Équipe test>','Le nom de l’équipe doit rester du texte');
  cd().querySelector('#start').click();
  await wait(()=>pd().querySelector('#activity-frame').hidden===false,'Lancement collectif');
  cd().querySelector('#pause').click();await wait(()=>pd().querySelector('#exercise').hidden,'Pause collective');
  cd().querySelector('#resume').click();await wait(()=>!pd().querySelector('#exercise').hidden,'Reprise collective');
  const exercise=pd().querySelector('#activity-frame').contentDocument;
  exercise.querySelector('input[type=radio]').checked=true;exercise.querySelector('#validate').click();
  await wait(()=>cd().querySelector('.participant progress').value>0,'Transmission des réponses');
  cd().querySelector('#review').click();await wait(()=>!pd().querySelector('#discussion').hidden,'Mise en commun');
  assert(pd().querySelector('#correction').hidden,'Correction révélée trop tôt');
  cd().querySelector('#reveal').click();await wait(()=>!pd().querySelector('#correction').hidden,'Révélation de la correction');
  assert(pd().querySelector('#distribution').textContent.includes('appareil'),'Répartition des réponses absente');
  cd().querySelector('#finish').click();await wait(()=>!pd().querySelector('#final').hidden,'Bilan collectif');
  cd().querySelector('#close').click();await wait(()=>pd().querySelector('#status').textContent==='Séance terminée','Clôture collective');
  coach.remove();participant.remove();
}

async function rightsLaunchTest() {
  await fetch('/test-db',{method:'POST',body:JSON.stringify({key:'sessions',value:{DRO123:{activity:'droits-controle',activityName:ACTIVITIES['droits-controle'],groupVersion:GROUP_VERSION,facilitatorId:'teacher',status:'waiting'}}})});
  const coach=document.createElement('iframe'),devices=[];
  document.body.append(coach);
  coach.src='../educateur.html?activity=droits-controle&session=DRO123';
  try {
    await wait(()=>coach.contentDocument?.querySelector('#session')?.hidden===false,'Chargement éducateur droits');
    assert(coach.contentDocument.querySelector('#start').disabled,'Lancement sans aucun participant');
    for(const uid of ['rights-one','rights-two']) {
      const device=document.createElement('iframe');devices.push(device);document.body.append(device);
      device.src='../participant.html?activity=droits-controle&session=DRO123&testUser='+uid;
      await wait(()=>device.contentDocument?.querySelector('#identity')?.hidden===false,'Inscription sans pseudonyme');
      assert(device.contentDocument.querySelector('#label').value==='','Le test doit rester sans pseudonyme');
      await wait(()=>coach.contentDocument.querySelectorAll('.participant').length===devices.length,'Appareil visible par éducateur');
    }
    await wait(()=>!coach.contentDocument.querySelector('#start').disabled,'Lancement avec deux appareils sans pseudonyme');
    coach.contentDocument.querySelector('#start').click();
    for(const device of devices) {
      await wait(()=>device.contentDocument.querySelector('#activity-frame').hidden===false,'Parcours droits démarré');
      const exercise=device.contentDocument.querySelector('#activity-frame').contentDocument;
      exercise.querySelector('#start').click();
      assert(!exercise.querySelector('#moment').hidden,'Première situation de contrôle affichée');
      exercise.querySelector('input[name="choice"]').checked=true;
      exercise.querySelector('#answer-form').requestSubmit();
      await wait(()=>!exercise.querySelector('#feedback').hidden,'Réponse acceptée');
      await sleep(350);
    }
    await wait(()=>[...coach.contentDocument.querySelectorAll('.participant progress')].every(progress=>progress.value>0),'Réponses des deux appareils transmises');
  } finally {coach.remove();devices.forEach(device=>device.remove());}
}

async function legacyResponsibilityTest() {
  const first=SITUATIONS[0].id,answer={vigilance:'vigilant',followUp:0,answeredAt:123};
  const value={activity:'responsabilite-objective',facilitatorId:'teacher',status:'waiting',participants:{returning:{joinedAt:123,status:'in-progress',answers:{[first]:answer}}}};
  const save=async sessions=>fetch('/test-db',{method:'POST',body:JSON.stringify({key:'sessions',value:sessions})});
  await save({RSP123:value});
  const devices=[];
  try {
    for(const uid of ['fresh','returning']) {
      const device=document.createElement('iframe');devices.push(device);document.body.append(device);
      device.src='../../responsabilite-objective/participant/index.html?session=RSP123&testUser='+uid;
      await wait(()=>device.contentDocument?.querySelector('#waiting')?.hidden===false||device.contentDocument?.querySelector('#error')?.hidden===false,'Connexion ancienne interface');
      assert(device.contentDocument.querySelector('#error').hidden,device.contentDocument.querySelector('#error-message').textContent);
    }
    const db=await(await fetch('/test-db')).json(),saved=db.sessions.RSP123;
    assert(saved.participants.fresh,'Inscription directe du nouvel appareil');
    assert(JSON.stringify(saved.participants.returning.answers[first])===JSON.stringify(answer),'Réponse conservée malgré le cache initial vide');
    assert(saved.participants.returning.status==='in-progress','Statut conservé à la reconnexion');
    assert(saved.nextParticipantNumber===undefined,'Aucune écriture dans le compteur global de séance');
    saved.status='activity';await save(db.sessions);
    for(const device of devices)await wait(()=>device.contentDocument.querySelector('#situation').hidden===false,'Lancement ancienne interface');
    assert(devices[1].contentDocument.querySelector('#progress-label').textContent.includes('2 sur'),'Reprise à la deuxième situation');
    const page=devices[0].contentDocument;
    page.querySelector('[name="vigilance"]').checked=true;page.querySelector('[name="followUp"]').checked=true;page.querySelector('#answer-form').requestSubmit();
    await wait(()=>page.querySelector('#progress-label').textContent.includes('2 sur'),'Réponse enregistrée avec les seuls droits du participant');
    // Les anciens liens doivent aussi reconnaître une nouvelle séance.
    await save({RSP123:{activity:'responsabilite-objective',facilitatorId:'teacher',status:'waiting',groupVersion:GROUP_VERSION}});
    for(const [index,role] of ['participant','educateur'].entries()) {
      devices[index].src='../../responsabilite-objective/'+role+'/index.html?session=RSP123';
      await wait(()=>devices[index].contentWindow.location.pathname==='/activites/groupe/'+role+'.html','Redirection du lien '+role);
    }
  } finally {devices.forEach(device=>device.remove());}
}

try {
  localStorage.setItem('procyclean-solo-values-rule','SOLO À CONSERVER');
  assert(Object.keys(ACTIVITIES).length===13,'Catalogue incomplet');
  assert(!canJoin({groupVersion:GROUP_VERSION,activity:'aut-bon-parcours',status:'closed'},'x'),'Session fermée accessible');
  assert(!canJoin({groupVersion:GROUP_VERSION,activity:'aut-bon-parcours',status:'review'},'x'),'Arrivée pendant la correction');
  const full={groupVersion:GROUP_VERSION,activity:'aut-bon-parcours',status:'activity',participants:Object.fromEntries(Array.from({length:30},(_,i)=>['p'+i,{}]))};
  assert(!canJoin(full,'nouveau')&&canJoin(full,'p0'),'Limite de participants et retour dans une séance complète');
  assert(reviewItems({a:{groupReport:{records:[{id:'q',prompt:'Question',answer:'A'}]}},b:{groupReport:{records:[{id:'q',prompt:'Question',answer:'B'}]}}})[0].responses.length===2,'Agrégation des réponses');
  result.passed.push('Catalogue et accès aux séances');
  for(const id of Object.keys(ACTIVITIES)) {
    try {
      await load(id);await scenarios[id]();await wait(()=>latest?.complete,'Fin du parcours : '+id);
      assert(latest.records.length>0,'Aucune réponse transmise : '+id);
      await resume(id);assert(latest.complete,'Fin perdue au rechargement : '+id);
      result.passed.push(id+' : réponses, fin et reprise');
    } catch(error) { result.errors.push(id+': '+error.message); }
    document.querySelector('#output').textContent=JSON.stringify(result,null,2);
  }
  assert(localStorage.getItem('procyclean-solo-values-rule')==='SOLO À CONSERVER','La séance groupe a écrasé une sauvegarde solo');
  result.passed.push('Sauvegardes solo isolées des séances groupe');
  localStorage.removeItem('procyclean-solo-values-rule');
  try{await sessionTest();result.passed.push('Séance éducateur/participant : inscription, lancement, pause, réponses, correction, bilan et clôture');}catch(error){result.errors.push('Séance : '+error.message);}
  try{await rightsLaunchTest();result.passed.push('Mes droits pendant un contrôle : lancement et réponses sur deux appareils sans pseudonyme');}catch(error){result.errors.push('Lancement droits : '+error.message);}
  try{await legacyResponsibilityTest();result.passed.push('À sa place : inscription avec droits limités, cache vide, reprise et redirection des anciens liens');}catch(error){result.errors.push('Connexion À sa place : '+error.message);}
  for(const path of ['mission-controle/interaction.test.html','aut-bon-parcours/journey.test.html','onde-choc/journey.test.html','produit-mystere/question-focus.test.html','responsabilite-objective/conclusion.test.html']) {
    try {
      frame.src='../../individuel/'+path;
      await wait(()=>{const output=frame.contentDocument?.querySelector('pre')?.textContent||'';return /✓|ÉCHEC|✗/.test(output);},'Test solo : '+path);
      const output=frame.contentDocument.querySelector('pre').textContent;
      assert(!/ÉCHEC|✗/.test(output),output);
      result.passed.push('Régression solo : '+path);
    } catch(error){result.errors.push(path+': '+error.message);}
  }
} catch(error) {result.errors.push(error.message);}
result.done=true;document.querySelector('#output').textContent=JSON.stringify(result,null,2);
