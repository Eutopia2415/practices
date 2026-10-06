'use strict';
const $=id=>document.getElementById(id);
let version=0,token=null,isOwner=false,allowedSubjects=[];
const subjects={lit:{name:'AP Literature',cursor:null,busy:false,request:0},business:{name:'AP Business',cursor:null,busy:false,request:0}};
function time(ms){if(!Number.isFinite(ms))return '—';const s=Math.floor(ms/1000);return Math.floor(s/60)+'m '+String(s%60).padStart(2,'0')+'s';}
function cell(row,value){const td=document.createElement('td');td.textContent=value;row.append(td);return td;}
const query=(name,args={})=>PracticeCloud.query(name,{...args,token});
const mutation=(name,args={})=>PracticeCloud.mutation(name,{...args,token});
function clearPrivate(){version++;for(const key of Object.keys(subjects)){const state=subjects[key];state.cursor=null;state.busy=false;state.request++;$(key+'-section').hidden=true;$(key+'-results-body').replaceChildren();$(key+'-stats').replaceChildren();$(key+'-status').textContent='';$(key+'-load-more').hidden=true;$(key+'-section').removeAttribute('aria-busy');}$('viewer-list').replaceChildren();$('share-url').value='';$('new-link').hidden=true;$('attempt-detail').close();$('detail-content').replaceChildren();}
function lock(message='Open your private statistics link to view results.'){
 clearPrivate();token=null;isOwner=false;try{sessionStorage.removeItem('practice-room-viewer');}catch{}$('results').hidden=true;$('locked').hidden=false;$('lock').hidden=true;$('connection-status').textContent=message;
}
async function showDetail(id){const stamp=version;try{const result=await query('grades:detail',{id});if(stamp!==version)return;const box=$('detail-content');box.replaceChildren();const p=document.createElement('p');p.textContent=`${result.deviceLabel} · ${result.title}`;box.append(p);const list=document.createElement('ol');for(const answer of result.answers||[]){const li=document.createElement('li');li.textContent=`${answer.id} · ${answer.topic||'Question'} · ${answer.answer||'Unanswered'} · ${answer.correct?'Correct':'Incorrect'}`;list.append(li);}box.append(list);$('attempt-detail').showModal();}catch{lock('This private link is unavailable. Ask the owner for a new link.');}}
async function load(key,reset=false){
 const state=subjects[key];if(state.busy&&!reset)return;const stamp=version,request=++state.request;state.busy=true;
 const body=$(key+'-results-body'),status=$(key+'-status'),section=$(key+'-section');
 if(reset){state.cursor=null;body.replaceChildren();}status.textContent='Loading results…';section.setAttribute('aria-busy','true');
 try{const [data,stats]=await Promise.all([query('grades:list',{subject:state.name,paginationOpts:{numItems:50,cursor:state.cursor}}),query('grades:stats',{subject:state.name})]);if(stamp!==version||request!==state.request)return;
  const summary=$(key+'-stats');summary.replaceChildren();for(const [label,value] of [['Submissions',stats.submissions],['Devices',stats.devices],['Accuracy',stats.maximum?Math.round(stats.score/stats.maximum*100)+'%':'—'],['Average time',stats.submissions?time(stats.activeMs/stats.submissions):'—']]){const card=document.createElement('div');const strong=document.createElement('strong');strong.textContent=value;const small=document.createElement('span');small.textContent=label;card.append(strong,small);summary.append(card);}
  for(const result of data.page){const row=document.createElement('tr');cell(row,result.deviceLabel);const title=cell(row,'');const open=document.createElement('button');open.textContent=result.title;open.onclick=()=>showDetail(result._id);title.append(open);cell(row,`${result.score}/${result.maximum}${result.bonusMaximum?` · Bonus ${result.bonus}/${result.bonusMaximum}`:''}`);cell(row,time(result.activeMs)+(result.partialTiming?' (partial)':''));cell(row,new Date(result.submittedAt).toLocaleString());body.append(row);}
  state.cursor=data.continueCursor;$(key+'-load-more').hidden=data.isDone;status.textContent=body.children.length?'':'No submissions yet.';
 }catch{if(stamp===version&&request===state.request)lock('Statistics are unavailable. Check your connection or ask the owner for a new link.');}
 finally{if(stamp===version&&request===state.request){state.busy=false;section.removeAttribute('aria-busy');}}
}
async function refresh(){await Promise.all(Object.keys(subjects).filter(key=>allowedSubjects.includes(subjects[key].name)).map(key=>load(key,true)));}

async function sharing(){const stamp=version;try{const list=await query('grades:viewers');if(stamp!==version||!isOwner)return;$('viewer-list').replaceChildren();for(const item of list){const li=document.createElement('li');const span=document.createElement('span');span.textContent=item.label+' · '+item.subjects.join(' & ');const remove=document.createElement('button');remove.textContent='Revoke link';remove.onclick=async()=>{try{await mutation('grades:revoke',{id:item.id});$('share-url').value='';$('new-link').hidden=true;await sharing();}catch{$('sharing-status').textContent='Could not revoke link.';}};li.append(span,remove);$('viewer-list').append(li);}}catch{$('sharing-status').textContent='Unable to load shared links.';}}
async function init(){
 clearPrivate();const stamp=version;isOwner=false;allowedSubjects=[];$('results').hidden=true;$('sharing').hidden=true;
 const incoming=new URLSearchParams(location.hash.slice(1)).get('access');if(incoming)history.replaceState(null,'',location.pathname+location.search);
 try{token=incoming||sessionStorage.getItem('practice-room-viewer');}catch{token=incoming;}
 if(!PracticeCloud.enabled){lock('Statistics are not connected yet.');return;}if(!token){lock();return;}
 try{const access=await query('grades:me');if(stamp!==version)return;isOwner=access.owner;allowedSubjects=access.subjects;for(const key of Object.keys(subjects))$(key+'-section').hidden=!allowedSubjects.includes(subjects[key].name);try{sessionStorage.setItem('practice-room-viewer',token);}catch{}$('locked').hidden=true;$('results').hidden=false;$('lock').hidden=false;$('sharing').hidden=!isOwner;await refresh();if(isOwner)await sharing();}catch{if(stamp===version)lock('This private link is invalid or has been revoked.');}
}
$('lock').onclick=()=>lock();$('refresh-results').onclick=refresh;for(const key of Object.keys(subjects))$(key+'-load-more').onclick=()=>load(key);$('close-detail').onclick=()=>$('attempt-detail').close();
$('invite-form').onsubmit=async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;try{const viewerToken=PracticeCloud.randomToken();await mutation('grades:grant',{viewerToken,label:$('viewer-label').value,subjects:$('viewer-subject').value==='all'?['AP Literature','AP Business']:[$('viewer-subject').value]});$('share-url').value=new URL('gradebook.html',location.href).href+'#access='+viewerToken;$('new-link').hidden=false;$('viewer-label').value='';$('sharing-status').textContent='Link created for '+($('viewer-subject').value==='all'?'both subjects':$('viewer-subject').value)+'. Copy it now.';await sharing();}catch{$('sharing-status').textContent='Could not create share link.';}finally{button.disabled=false;}};
$('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText($('share-url').value);$('sharing-status').textContent='Link copied.';}catch{$('share-url').select();$('sharing-status').textContent='Copy the selected link.';}};
window.addEventListener('hashchange',init);
init();
