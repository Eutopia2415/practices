/* Active practice time: persists with the attempt, pauses off-tab, freezes on submit. */
(() => {
  'use strict';
  let adapter, current, previous = performance.now();
  const valid = value => value && typeof value.id === 'string' && Number.isFinite(value.activeMs) && value.activeMs >= 0;
  function ensure(state) {
    if (!state || state.submitted) return;
    if (!valid(state.tracking)) state.tracking = {
      id: crypto.randomUUID(), startedAt: new Date().toISOString(), activeMs: 0,
      partial: state.answers.some(Boolean), submittedAt: null
    };
  }
  function active() {
    return document.visibilityState === 'visible' && !document.documentElement.classList.contains('practice-loading');
  }
  let wasActive = active();
  function sync() {
    if (!adapter) return;
    const now = performance.now(), state = adapter.getState();
    if (current === state && valid(state.tracking) && !state.submitted && !state.tracking.submittedAt && wasActive) {
      // Ignore device sleep / suspended browser gaps, rather than charging hours to an attempt.
      const delta = now - previous;
      if (delta >= 0 && delta < 10000) state.tracking.activeMs += delta;
    }
    const changed = current !== state;
    ensure(state); current = state; previous = now; wasActive = active();
    if (changed && !state.submitted && window.PracticeCloud) {
      window.PracticeCloud.start(adapter.snapshot()).then(()=>adapter.save());
    }
  }
  function duration(ms) {
    const seconds = Math.floor(ms / 1000), hours = Math.floor(seconds / 3600);
    return (hours ? hours + 'h ' : '') + Math.floor(seconds % 3600 / 60) + 'm ' + String(seconds % 60).padStart(2,'0') + 's';
  }
  function showResult() {
    if (!adapter) return;
    const state = adapter.getState(), panel = document.getElementById('panel');
    if (!state.submitted || state.view !== 'results' || !panel || panel.querySelector('.attempt-time')) return;
    const result = document.createElement('p'); result.className = 'attempt-time';
    result.style.cssText = 'font:600 16px/1.5 system-ui,sans-serif;margin:12px 0;color:inherit';
    result.textContent = valid(state.tracking) && state.tracking.submittedAt
      ? `Time spent: ${duration(state.tracking.activeMs)}${state.tracking.partial ? ' (since tracking began)' : ''}`
      : 'Time spent: unavailable for this earlier attempt';
    const score = panel.querySelector('.score');
    if (score) score.after(result); else panel.append(result);
    if (valid(state.tracking) && state.tracking.submittedAt) {
      window.dispatchEvent(new CustomEvent('practice:submitted', {detail: adapter.snapshot()}));
    }
  }
  window.PracticeAttempts = {
    sync,
    finish(state) {
      sync(); ensure(state);
      if (valid(state.tracking) && !state.tracking.submittedAt) state.tracking.submittedAt = new Date().toISOString();
    },
    attach(options) {
      adapter = options; sync(); adapter.save(); showResult();
      new MutationObserver(showResult).observe(document.getElementById('panel'), {childList:true,subtree:true});
      setInterval(sync,1000);
      setInterval(()=>{sync(); if (!adapter.getState().submitted) adapter.save();},5000);
      document.addEventListener('visibilitychange',()=>{sync();adapter.save();});
      window.addEventListener('pagehide',()=>{sync();adapter.save();});
      window.addEventListener('pageshow',()=>{previous=performance.now();wasActive=active();});
    }
  };
})();
