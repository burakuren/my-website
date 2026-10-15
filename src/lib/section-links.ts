/**
 * The link icons beside home-page section headings (SectionTitle.astro).
 * Without JS (or the Clipboard API) they are plain in-page links. With it, a
 * click puts the section URL in the address bar without jumping and copies
 * it, so a section can be shared in one step.
 */
if (navigator.clipboard) {
  document.querySelectorAll<HTMLAnchorElement>('.section-anchor').forEach((a) => {
    const status = a.nextElementSibling as HTMLElement | null;
    let timer: number | undefined;
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      history.replaceState(null, '', a.hash);
      let message = 'Link copied';
      try {
        await navigator.clipboard.writeText(a.href);
      } catch {
        message = 'Copy failed; the link is in the address bar';
      }
      a.classList.add('is-copied');
      if (status) status.textContent = message;
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        a.classList.remove('is-copied');
        if (status) status.textContent = '';
      }, 2000);
    });
  });
}
