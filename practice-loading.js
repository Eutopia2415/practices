// Brief entrance state requested for practice pages; quiz state is left untouched.
(() => {
  const sessionKey = 'practice-room-loaded:' + location.pathname;
  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
  } catch { /* Storage restrictions must not prevent the practice from opening. */ }
  document.documentElement.classList.add('practice-loading');
  const release = () => {
    document.documentElement.classList.remove('practice-loading');
    const panel = document.getElementById('panel');
    if (panel) { panel.inert = false; panel.removeAttribute('aria-busy'); }
    document.getElementById('practice-loading-overlay')?.remove();
  };
  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('panel');
    if (!panel) { release(); return; }
    panel.inert = true;
    panel.setAttribute('aria-busy', 'true');
    const overlay = document.createElement('div');
    overlay.id = 'practice-loading-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<div class="quiz-skeleton"><div class="skeleton skeleton-line short"></div><div class="skeleton skeleton-line long"></div><div class="skeleton skeleton-line"></div>' + '<div class="skeleton skeleton-choice"></div>'.repeat(4) + '</div>';
    panel.append(overlay);
    setTimeout(release, 850);
  }, {once:true});
  // Never leave a page blocked if another script prevents normal initialization.
  setTimeout(release, 4000);
  window.addEventListener('pageshow', event => { if (event.persisted) release(); });
})();
