// Runs inline in <head>, before first paint: flags JS support so
// progressive-enhancement styles (e.g. the collapsed mobile nav) apply
// without a flash. Kept here so astro.config.mjs can hash the exact same
// string for the Content-Security-Policy.
export const HEAD_INIT = `document.documentElement.classList.add('js');`;
