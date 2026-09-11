// Transport de test local : aucune lecture ni écriture dans le projet Firebase.
let store = {}, authUser;
export const initializeApp = () => ({});
export const getAuth = () => ({});
export const getDatabase = () => ({});
export const ref = (_, path) => path;
export const serverTimestamp = () => Date.now();
const parts = key => key.split('/');
const read = key => parts(key).reduce((value, part) => value?.[part], store);
function write(key, value) { const list=parts(key); let node=store; for(const part of list.slice(0,-1)) node=node[part]||={}; node[list.at(-1)]=value; }
async function pull() { store = await (await fetch('/test-db')).json(); }
async function push() { await fetch('/test-db', {method:'POST',body:JSON.stringify({key:'sessions',value:store.sessions})}); }
const snapshot = value => ({val:()=>structuredClone(value),exists:()=>value!==undefined&&value!==null});
export async function get(key) { await pull(); return snapshot(read(key)); }
function authorize(key) {
  if(authUser?.uid!=='teacher' && (!/^sessions\/[^/]+\/participants\//.test(key)||key.split('/')[3]!==authUser?.uid)) {
    throw Object.assign(new Error('PERMISSION_DENIED'),{code:'PERMISSION_DENIED'});
  }
}
const warmTransactions=new Set();
export async function update(key, value) { authorize(key);await pull(); write(key,{...read(key),...value}); await push(); }
export async function runTransaction(key, transform) {
  authorize(key);
  // Firebase peut appeler la fonction une première fois sans données en cache.
  if(!warmTransactions.has(key)) {warmTransactions.add(key);if(transform(null)===undefined)return{committed:false};}
  await pull(); const result=transform(structuredClone(read(key))); if(result===undefined)return {committed:false};write(key,result);await push();return{committed:true,snapshot:snapshot(result)};
}
export function onValue(key, callback) {
  if(key==='.info/connected'){queueMicrotask(()=>callback(snapshot(true)));return()=>{};}
  let stopped=false,last='';const tick=async()=>{await pull();if(stopped)return;const value=read(key),serialized=JSON.stringify(value);if(last!==serialized){last=serialized;callback(snapshot(value));}};
  tick();const timer=setInterval(tick,120);return()=>{stopped=true;clearInterval(timer);};
}
export function onAuthStateChanged(_, callback) { const educator=document.body.dataset.role==='educateur'||location.pathname.includes('/educateur/');authUser = {uid:educator?'teacher':new URLSearchParams(location.search).get('testUser')||'student',isAnonymous:!educator,email:'prevention.dopage@ffc.fr'};queueMicrotask(()=>callback(authUser));return()=>{}; }
export async function signInAnonymously() { return {user:authUser}; }
export async function signInWithEmailAndPassword() { return {user:authUser}; }
