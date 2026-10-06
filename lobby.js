'use strict';
// Public student-facing activities only. Keep author banks and worked keys outside this catalog.
const activities = [
  {id:'wind',subject:'lit',title:'Ode to the West Wind',detail:'Percy Bysshe Shelley · Poetry & interpretation',type:'Practice',file:'English/Ode to the West Wind.html'},
  {id:'autumn-custom',subject:'lit',title:'To Autumn · Custom practice',detail:'John Keats · 15 questions · Untimed',type:'Practice',file:'English/To Autumn - Custom Practice.html'},
  {id:'autumn-hard',subject:'lit',title:'To Autumn · Medium-hard test',detail:'John Keats · 15 questions · Close reading',type:'Assessment',file:'English/To Autumn - New Medium-Hard Test.html'},
  {id:'autumn-clean',subject:'lit',title:'To Autumn · Clean practice',detail:'John Keats · 15 questions · Close reading',type:'Practice',file:'English/To Autumn - Clean Practice.html'},
  {id:'autumn-wild',subject:'lit',title:'To Autumn · Wildcard practice',detail:'John Keats · Poetry with bonus challenges',type:'Practice',file:'English/To Autumn.html'},
  {id:'autumn-surprise',subject:'lit',title:'To Autumn · Surprise mock',detail:'John Keats · Poetry assessment',type:'Assessment',file:'English/To Autumn - Surprise Mock.html'},
  {id:'business-unit1',subject:'business',title:'Unit 1 · Case-study practice',detail:'Businesses, competition & new ideas · 24 questions',type:'Practice',file:'Business/AP Business Unit 1 Practice.html'},
  {id:'business-worksheet',subject:'business',title:'Unit 1 · Application worksheet',detail:'Topics 1.1–1.3 · 18 questions · Untimed',type:'Practice',file:'Business/AP Business Unit 1 Worksheet 2026-09-24.html'}
];
const $ = id => document.getElementById(id);
const subjectNames = {lit:'AP Literature',business:'AP Business'};
const storageKey = 'practice-room-lobby-v1';
let saved = [], recent = [];
try {
  const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
  const ids = new Set(activities.map(a => a.id));
  saved = Array.isArray(state.saved) ? [...new Set(state.saved.filter(id => ids.has(id)))] : [];
  recent = Array.isArray(state.recent) ? [...new Set(state.recent.filter(id => ids.has(id)))].slice(0,3) : [];
} catch { /* The lobby remains usable when browser storage is unavailable. */ }
let type = 'all';
let route = 'home';
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify({saved,recent})); }
  catch { $('announcement').textContent = 'Browser storage is unavailable. Changes will last for this page visit only.'; }
}
function link(a) { return encodeURI(a.file); }
function row(a) {
  const isSaved = saved.includes(a.id);
  return `<article class="activity ${a.subject==='business'?'business-activity':''}"><span class="activity-icon" aria-hidden="true">${a.subject==='lit'?'Aa':'↗'}</span><div class="activity-copy"><p class="activity-subject">${subjectNames[a.subject]}</p><h3><a href="${link(a)}" data-open="${a.id}">${a.title}</a></h3><p class="activity-meta">${a.detail}</p></div><span class="type-pill ${a.type.toLowerCase()}">${a.type}</span><button class="save" data-save="${a.id}" aria-label="${isSaved?'Unsave':'Save'} ${a.title}" aria-pressed="${isSaved}">${isSaved?'★':'☆'}</button><a class="open-link" href="${link(a)}" data-open="${a.id}" aria-label="Open ${a.title}">Open <span aria-hidden="true">↗</span></a></article>`;
}
function renderList() {
  const query = $('search').value.trim().toLowerCase();
  const results = activities.filter(a => (route==='lit'||route==='business'? a.subject===route:route==='saved'?saved.includes(a.id):true) && (type==='all'||a.type===type) && `${a.title} ${a.detail} ${subjectNames[a.subject]} ${a.type}`.toLowerCase().includes(query));
  $('activity-list').innerHTML = results.map(row).join('');
  $('result-count').textContent = `${results.length} ${results.length===1?'activity':'activities'}`;
  $('empty').hidden = results.length > 0;
  const noSaved = route==='saved' && saved.length===0;
  $('empty-title').textContent = noSaved?'Keep a little inspiration here.':'No matching activities.';
  $('empty-copy').textContent = noSaved?'Select the star beside any activity to save it here. Saved activities stay in this browser.':'Try another search or activity type.';
  $('clear-filters').hidden = noSaved;
  document.querySelectorAll('[data-type]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.type===type)));
}
function renderRecent() {
  $('recent').hidden = route!=='home'||recent.length===0;
  $('recent-list').innerHTML = recent.map(id => {
    const a=activities.find(a=>a.id===id);
    return `<div class="recent-item"><div><strong>${a.title}</strong><p>${subjectNames[a.subject]} · Recently opened in this browser</p></div><a class="open-link" href="${link(a)}" data-open="${a.id}" aria-label="Reopen ${a.title}">Reopen <span aria-hidden="true">↗</span></a></div>`;
  }).join('');
}
function renderRoute() {
  const requested = location.hash.slice(1);
  route = ['home','all','saved','lit','business'].includes(requested)?requested:'home';
  type='all'; $('search').value='';
  const titles={home:'Activity library',all:'All activities',saved:'Saved activities',...subjectNames};
  const descriptions={home:'A place for every practice session.',all:'All your practice and assessments, in one place.',saved:'Your personal shortlist, saved in this browser.',lit:'Read closely. Explore language. Build your interpretation.',business:'Explore cases. Apply concepts. Make your argument.'};
  $('breadcrumb').textContent=route==='home'?'Overview':titles[route];
  $('library-title').textContent=titles[route]; $('library-description').textContent=descriptions[route];
  $('library-eyebrow').textContent=route==='lit'?'YOUR LITERATURE CLASSROOM':route==='business'?'YOUR BUSINESS CLASSROOM':'YOUR ACTIVITY LIBRARY';
  $('welcome').hidden=route!=='home'; $('subjects').hidden=route!=='home';
  document.body.classList.toggle('subject-view',route!=='home');
  document.querySelectorAll('[data-route]').forEach(a=>a.dataset.route===route?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  document.title=`${route==='home'?'Your AP classroom':titles[route]} · Practice Room`;
  renderList(); renderRecent();
}
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('main').focus();});
$('search').addEventListener('input',renderList);
document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{type=b.dataset.type;renderList();}));
$('clear-filters').addEventListener('click',()=>{type='all';$('search').value='';renderList();$('search').focus();});
document.addEventListener('click',e=>{
  const save=e.target.closest('[data-save]');
  if(save){const id=save.dataset.save; saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];persist();renderList();document.querySelector(`[data-save="${id}"]`)?.focus();$('announcement').textContent=saved.includes(id)?'Activity saved.':'Activity removed from saved activities.';}
  const open=e.target.closest('[data-open]');
  if(open){recent=[open.dataset.open,...recent.filter(id=>id!==open.dataset.open)].slice(0,3);persist();}
});
window.addEventListener('hashchange',()=>{renderRoute();window.scrollTo(0,0);$('main').focus({preventScroll:true});});
window.addEventListener('pageshow',renderRecent);
renderRoute();
