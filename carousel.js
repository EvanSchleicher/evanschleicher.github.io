document.querySelectorAll('.photo-carousel').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('.slide')];
  const pauseButton = carousel.querySelector('[data-pause]');
  const count = carousel.querySelector('.slide-count');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let visible = false;
  let timer;
  const show = next => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    count.textContent = `${index + 1} / ${slides.length}`;
  };
  const schedule = () => {
    clearInterval(timer);
    pauseButton.textContent = paused ? 'Start rotation' : 'Pause rotation';
    if (!paused && !hovered && !focused && visible && !document.hidden) {
      timer = setInterval(() => show(index + 1), 5000);
    }
  };
  carousel.querySelector('[data-prev]').addEventListener('click', () => { show(index - 1); schedule(); });
  carousel.querySelector('[data-next]').addEventListener('click', () => { show(index + 1); schedule(); });
  pauseButton.addEventListener('click', () => { paused = !paused; schedule(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => { focused = carousel.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => { if (event.matches) paused = true; schedule(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.2 }).observe(carousel);
  schedule();
});
