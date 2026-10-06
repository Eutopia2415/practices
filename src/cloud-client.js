import {ConvexHttpClient} from 'convex/browser';
import {makeFunctionReference} from 'convex/server';
const config=window.PRACTICE_CLOUD_CONFIG||{};
const enabled=Boolean(config.enabled&&config.convexUrl);
const client=enabled?new ConvexHttpClient(config.convexUrl):null;
const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
let deviceToken;
try{deviceToken=localStorage.getItem('practice-room-device');if(!/^[a-f0-9]{64}$/.test(deviceToken||'')){deviceToken=randomToken();localStorage.setItem('practice-room-device',deviceToken);}}catch{deviceToken=randomToken();}
const pending=new Set();let latest;
const query=(name,args={})=>client.query(makeFunctionReference(name),args);
const mutation=(name,args={})=>client.mutation(makeFunctionReference(name),args);
function status(text){
  const panel=document.getElementById('panel');if(!panel)return;
  let el=panel.querySelector('.cloud-save-status');if(!el){el=document.createElement('p');el.className='cloud-save-status';el.setAttribute('role','status');el.style.cssText='font:14px/1.5 system-ui,sans-serif';const timing=panel.querySelector('.attempt-time');if(timing)timing.after(el);else panel.append(el);}el.textContent=text;
}
async function start(snapshot){
  latest=snapshot;if(!enabled||!snapshot.tracking)return;
  try{await mutation('grades:begin',{deviceToken,attemptKey:snapshot.tracking.id,quizPath:snapshot.quizPath});snapshot.tracking.cloudStarted=true;}
  catch{status('Offline — your answers are saved on this device.');}
}
async function submit(snapshot){
  latest=snapshot;if(!enabled||!snapshot.tracking)return;
  const key=snapshot.tracking.id;if(pending.has(key))return;pending.add(key);status('Saving result…');
  try{
    // Always begin idempotently: a cleared browser ID may no longer own the prior server attempt.
    await mutation('grades:begin',{deviceToken,attemptKey:key,quizPath:snapshot.quizPath});
    await mutation('grades:submit',{deviceToken,attemptKey:key,answers:snapshot.answers.map(({id,answer})=>({id,answer})),activeMs:snapshot.tracking.activeMs,partialTiming:snapshot.tracking.partial});
    status('Result saved. Identified by this browser’s device number.');
  }catch{
    status('Result not sent. Your answers are saved here.');const retry=document.createElement('button');retry.textContent='Retry saving';retry.type='button';retry.onclick=()=>submit(snapshot);document.querySelector('.cloud-save-status')?.append(' ',retry);
  }finally{pending.delete(key);}
}
window.PracticeCloud={enabled,query,mutation,randomToken,start,submit};
window.addEventListener('practice:submitted',e=>submit(e.detail));
window.addEventListener('online',()=>{if(latest?.tracking?.submittedAt)submit(latest);else if(latest)start(latest);});
