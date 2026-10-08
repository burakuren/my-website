const smooth = window.matchMedia('(prefers-reduced-motion: no-preference)');

/** Scroll to the very top and hand keyboard focus back to the header prompt. */
export function scrollToTop() {
  // Focus first: moving focus mid-way would cancel the smooth scroll.
  document.querySelector<HTMLElement>('.site-header .prompt')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: smooth.matches ? 'smooth' : 'auto' });

  // Mobile browser toolbars sliding in can cut a smooth scroll short; finish
  // it, unless the reader took over by scrolling themselves.
  let interrupted = false;
  const interrupt = () => (interrupted = true);
  const opts = { once: true, passive: true };
  window.addEventListener('touchstart', interrupt, opts);
  window.addEventListener('wheel', interrupt, opts);
  window.addEventListener(
    'scrollend',
    () => {
      window.removeEventListener('touchstart', interrupt);
      window.removeEventListener('wheel', interrupt);
      if (!interrupted && window.scrollY > 0) window.scrollTo({ top: 0 });
    },
    { once: true },
  );
}
