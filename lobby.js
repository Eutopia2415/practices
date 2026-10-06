'use strict';
// Public student-facing activities only. Keep author banks and worked keys outside this catalog.
const activities = [
  {id:'wind',subject:'lit',title:'Ode to the West Wind',detail:'Poetry · Imagery, rhyme, speaker & themes',type:'Practice',file:'English/Ode to the West Wind.html'},
  {id:'autumn-custom',subject:'lit',title:'To Autumn · Custom practice',detail:'Poetry · Personification, tone & stanza shifts',type:'Practice',file:'English/To Autumn - Custom Practice.html'},
  {id:'autumn-hard',subject:'lit',title:'To Autumn · Medium-hard test',detail:'Poetry · Diction, syntax, structure & themes',type:'Assessment',file:'English/To Autumn - New Medium-Hard Test.html'},
  {id:'autumn-clean',subject:'lit',title:'To Autumn · Clean practice',detail:'Poetry · Figurative language, tone & structure',type:'Practice',file:'English/To Autumn - Clean Practice.html'},
  {id:'autumn-wild',subject:'lit',title:'To Autumn · Wildcard practice',detail:'Poetry · Imagery, tone & structure; bonus questions',type:'Practice',file:'English/To Autumn.html'},
  {id:'autumn-surprise',subject:'lit',title:'To Autumn · Surprise mock',detail:'Poetry · Imagery, tone & structure; bonus questions',type:'Assessment',file:'English/To Autumn - Surprise Mock.html'},
  {id:'business-unit1',subject:'business',title:'Unit 1 · Case-study practice',detail:'Unit 1 · Competition, PESTEL, innovation, ethics & operations',type:'Practice',file:'Business/AP Business Unit 1 Practice.html'},
  {id:'business-worksheet',subject:'business',title:'Unit 1 · Application worksheet',detail:'Unit 1 (1.1–1.3) · Value, markets, competition & PESTEL',type:'Practice',file:'Business/AP Business Unit 1 Worksheet 2026-09-24.html'}
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
  return `<article class="activity ${a.subject==='business'?'business-activity':''}"><span class="activity-icon" aria-hidden="true">${a.subject==='lit'?'Aa':'↗'}</span><div class="activity-copy"><h3><a href="${link(a)}" data-open="${a.id}">${a.title}</a></h3><p class="activity-meta">${a.detail}</p></div><span class="type-pill ${a.type.toLowerCase()}">${a.type}</span><button class="save" data-save="${a.id}" aria-label="${isSaved?'Unsave':'Save'} ${a.title}" aria-pressed="${isSaved}">${isSaved?'★':'☆'}</button><a class="open-link" href="${link(a)}" data-open="${a.id}" aria-label="Open ${a.title}">Open <span aria-hidden="true">↗</span></a></article>`;
}
function renderList() {
  const query = $('search').value.trim().toLowerCase();
  const results = activities.filter(a => (route==='lit'||route==='business'? a.subject===route:route==='saved'?saved.includes(a.id):true) && (type==='all'||a.type===type) && `${a.title} ${a.detail} ${subjectNames[a.subject]} ${a.type}`.toLowerCase().includes(query));
  $('activity-list').innerHTML = results.map(row).join('');
  $('activity-list').setAttribute('aria-busy','false');
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
    return `<div class="recent-item"><div><strong>${a.title}</strong><p class="activity-meta">${a.detail}</p></div><a class="open-link" href="${link(a)}" data-open="${a.id}" aria-label="Reopen ${a.title}">Reopen <span aria-hidden="true">↗</span></a></div>`;
  }).join('');
}
// sessionStorage survives refresh/navigation and resets when the tab is closed.
const loadedViews = new Set();
let refreshEntrancePending = performance.getEntriesByType('navigation')[0]?.type === 'reload';
let entranceTimer;
function finishEntrance() {
  clearTimeout(entranceTimer);
  $('main').classList.remove('entrance-loading');
  $('main').removeAttribute('aria-busy');
  $('main').inert = false;
  $('dashboard-loading-overlay')?.remove();
}
function showEntrance() {
  finishEntrance();
  const key = 'practice-room-loaded:dashboard:' + route;
  let seen = loadedViews.has(key);
  try { seen = seen || Boolean(sessionStorage.getItem(key)); } catch {}
  const forceEntrance = refreshEntrancePending;
  refreshEntrancePending = false;
  if (seen && !forceEntrance) return;
  loadedViews.add(key);
  try { sessionStorage.setItem(key, '1'); } catch {}
  const overlay = document.createElement('div');
  overlay.id = 'dashboard-loading-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  const row = '<div class="skeleton-row"><div class="skeleton skeleton-icon"></div><div class="skeleton-copy"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div></div></div>';
  overlay.innerHTML = route === 'home'
    ? '<div class="skeleton entrance-hero"></div><div class="entrance-cards"><div class="skeleton"></div><div class="skeleton"></div></div>'
    : '<div class="skeleton entrance-heading"></div>' + row.repeat(4);
  $('main').append(overlay);
  $('main').classList.add('entrance-loading');
  $('main').setAttribute('aria-busy','true');
  $('main').inert = true;
  entranceTimer = setTimeout(finishEntrance,850);
}
window.addEventListener('pageshow',event=>{if(event.persisted)finishEntrance();});
function renderRoute() {
  const requested = location.hash.slice(1);
  route = ['home','all','saved','lit','business'].includes(requested)?requested:'home';
  type='all'; $('search').value='';
  const titles={home:'Activity library',all:'Activity library',saved:'Saved activities',...subjectNames};
  $('breadcrumb').textContent=route==='home'?'Overview':titles[route];
  $('library-title').textContent=titles[route];
  $('library').hidden=route==='home';
  $('welcome').hidden=route!=='home'; $('subjects').hidden=route!=='home';
  document.body.classList.toggle('subject-view',route!=='home');
  document.querySelectorAll('[data-route]').forEach(a=>a.dataset.route===route?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  document.title=`${route==='home'?'Your AP classroom':titles[route]} · Practice Room`;
  renderList(); renderRecent(); showEntrance();
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
