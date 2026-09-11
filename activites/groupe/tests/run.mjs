import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { startServer, root } from './server.mjs';

const { server, origin } = await startServer();
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'procyclean-group-tests-'));
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'], { windowsHide:true, stdio:'ignore' });
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
let socket;
try {
  let port;
  for(let i=0;i<100;i++){try{port=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];if(port)break;}catch{}await sleep(100);}
  if(!port)throw Error('Le navigateur de test ne démarre pas.');
  const pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);
  await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
  const pending=new Map();let sequence=0;
  socket.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.id){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);msg.error?reject(Error(msg.error.message)):resolve(msg.result);}});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  await call('Page.enable');await call('Runtime.enable');
  await call('Page.navigate',{url:origin+'/activites/groupe/tests/journeys.html'});
  let result;
  for(let i=0;i<1800;i++){const response=await call('Runtime.evaluate',{expression:'window.testResults',returnByValue:true});result=response.result.value;if(result?.done)break;await sleep(100);}
  if(!result?.done)throw Error('Délai dépassé : '+JSON.stringify(result));
  console.log(JSON.stringify(result,null,2));
  if(result.errors.length)process.exitCode=1;
  await call('Browser.close');
} catch(error){console.error(error);process.exitCode=1;}
finally{
  socket?.close();browser.kill();server.close();
  // Ne supprimer que le profil temporaire créé pour cette exécution.
  if(path.dirname(path.resolve(profile))===path.resolve(os.tmpdir())&&path.basename(profile).startsWith('procyclean-group-tests-')) {
    try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200});}catch{}
  }
}
