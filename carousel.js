document.addEventListener('keydown', event => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && !lightbox.hidden && event.key === 'Escape') closeLightbox();
});

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.hidden = true;
  const opener = lightbox._opener;
  delete lightbox._opener;
  if (opener) opener.focus();
}

function openLightbox(link, caption) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.querySelector('img').src = link.href;
  lightbox.querySelector('img').alt = link.querySelector('img').alt;
  lightbox.querySelector('figcaption').textContent = caption || '';
  lightbox._opener = link;
  lightbox.hidden = false;
  lightbox.querySelector('.lightbox-close').focus();
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href$=".jpg"], a[href$=".png"]');
  if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
  const img = link.querySelector('img');
  if (!img) return;
  event.preventDefault();
  const figure = link.closest('figure');
  const caption = figure ? (figure.querySelector('figcaption')?.textContent || figure.dataset.caption || '') : '';
  openLightbox(link, caption);
});

document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeLightbox));

document.querySelectorAll('.photo-carousel').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('.slide')];
  const count = carousel.querySelector('.slide-count');
  const captionText = carousel.querySelector('.caption-text');
  let index = 0;
  let hovered = false;
  let focused = false;
  let visible = false;
  let timer;
  const show = next => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    count.textContent = `${index + 1} / ${slides.length}`;
    if (captionText) captionText.textContent = slides[index].dataset.caption || '';
  };
  const schedule = () => {
    clearInterval(timer);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hovered && !focused && visible && !document.hidden && !reducedMotion) {
      timer = setInterval(() => show(index + 1), 4000);
    }
  };
  carousel.querySelector('[data-prev]').addEventListener('click', () => { show(index - 1); schedule(); });
  carousel.querySelector('[data-next]').addEventListener('click', () => { show(index + 1); schedule(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => { focused = carousel.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.2 }).observe(carousel);
  schedule();
});