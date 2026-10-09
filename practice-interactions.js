/* Shared interaction polish. Assessment data and persistence belong to the page. */
(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const springs = new Map();
  const pressedPointers = new Map();
  let frame = 0;
  let previousTime = 0;

  function tick(time) {
    const dt = Math.min((time - previousTime) / 1000 || 1 / 60, 1 / 30);
    previousTime = time;
    for (const [element, spring] of springs) {
      if (!element.isConnected) { springs.delete(element); continue; }
      // Critically damped: retarget the current value and velocity without a jump.
      const acceleration = 400 * (spring.target - spring.value) - 40 * spring.velocity;
      spring.velocity += acceleration * dt;
      spring.value += spring.velocity * dt;
      element.style.scale = String(spring.value);
      if (Math.abs(spring.target - spring.value) < 0.0001 && Math.abs(spring.velocity) < 0.001) {
        element.style.scale = spring.target === 1 ? '' : String(spring.target);
        springs.delete(element);
      }
    }
    frame = springs.size ? requestAnimationFrame(tick) : 0;
  }
  function retarget(element, target) {
    if (reducedMotion.matches) { element.style.scale = ''; return; }
    let spring = springs.get(element);
    if (!spring) spring = { value: Number(element.style.scale) || 1, velocity: 0, target };
    spring.target = target;
    springs.set(element, spring);
    if (!frame) { previousTime = performance.now(); frame = requestAnimationFrame(tick); }
  }
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const element = event.target.closest('button:not(:disabled),.open-link,.primary-link,.subject-card,.quiz-dashboard-link,.dashboard-link');
    if (!element) return;
    pressedPointers.set(event.pointerId, element);
    retarget(element, element.matches('.choice,.option,.subject-card') ? 0.992 : 0.97);
  });
  function release(event) {
    const element = pressedPointers.get(event.pointerId);
    if (element) retarget(element, 1);
    pressedPointers.delete(event.pointerId);
  }
  document.addEventListener('pointerup', release);
  document.addEventListener('pointercancel', release);
  document.addEventListener('pointermove', event => {
    const element = pressedPointers.get(event.pointerId);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    retarget(element, inside ? (element.matches('.choice,.option,.subject-card') ? 0.992 : 0.97) : 1);
  });
  window.addEventListener('blur', () => {
    for (const element of pressedPointers.values()) retarget(element, 1);
    pressedPointers.clear();
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    cancelAnimationFrame(frame); frame = 0;
    for (const element of springs.keys()) element.style.scale = '';
    springs.clear();
  });

  const panel = document.getElementById('panel');
  if (!panel) return;
  panel.tabIndex = -1;
  const skip = document.createElement('a');
  skip.className = 'skip'; skip.href = '#panel'; skip.textContent = 'Skip to questions';
  skip.addEventListener('click', event => {
    event.preventDefault();
    document.getElementById('question-tab')?.click();
    panel.focus({preventScroll:true});
  });
  document.body.prepend(skip);

  panel.addEventListener('keydown', event => {
    const choice = event.target.closest('[data-choice]');
    if (!choice || choice.disabled || !['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(event.key)) return;
    const choices = [...panel.querySelectorAll('[data-choice]:not(:disabled)')];
    if (!choices.length) return;
    event.preventDefault();
    const index = choices.indexOf(choice);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 :
      (index + (['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1) + choices.length) % choices.length;
    choices[next].click();
    panel.querySelector(`[data-choice="${choices[next].dataset.choice}"]`)?.focus({preventScroll:true});
  });

  const footer = document.querySelector('footer');
  const progress = document.getElementById('progress');
  if (footer && progress) {
    progress.setAttribute('role', 'status');
    const updateProgress = () => {
      const counts = progress.textContent.match(/(\d+)\s+of\s+(\d+)/);
      if (counts) footer.style.setProperty('--answer-progress', `${Math.min(100, Number(counts[1]) / Math.max(1, Number(counts[2])) * 100)}%`);
    };
    updateProgress();
    new MutationObserver(updateProgress).observe(progress, {childList:true,characterData:true,subtree:true});
  }
  const header = document.querySelector('header');
  if (header && document.querySelector('.color-panel')) {
    const positionPanels = () => document.documentElement.style.setProperty('--panel-top', `${header.getBoundingClientRect().bottom + 8}px`);
    positionPanels();
    new ResizeObserver(positionPanels).observe(header);
  }
})();
