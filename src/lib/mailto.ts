/**
 * The email address never appears in the HTML or in any href. Base.astro
 * puts it base64-encoded on <body data-m>; links marked `data-mailto` point
 * at #contact and only become a mailto: when clicked (optional
 * `data-subject`). Without JS they scroll to the contact section.
 */
const encoded = document.body.dataset.m;
const mail = encoded ? atob(encoded) : '';

if (mail) {
  document.querySelectorAll<HTMLAnchorElement>('[data-mailto]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const subject = a.dataset.subject ? `?subject=${encodeURIComponent(a.dataset.subject)}` : '';
      window.location.href = `mailto:${mail}${subject}`;
    }),
  );

  // "Copy address" is only offered when the Clipboard API exists.
  const copyBtn = document.querySelector<HTMLButtonElement>('.copy-btn');
  const copyStatus = document.querySelector<HTMLElement>('.copy-status');
  if (copyBtn && copyStatus && navigator.clipboard) {
    copyBtn.hidden = false;
    let timer: number | undefined;
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(mail);
        copyStatus.textContent = 'Copied';
      } catch {
        copyStatus.textContent = 'Copy failed; select the address instead';
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => (copyStatus.textContent = ''), 2500);
    });
  }
}
