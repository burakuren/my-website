// Runs inline in <head>, before first paint: applies the stored theme and
// flags JS support. Kept here so astro.config.mjs can hash the exact same
// string for the Content-Security-Policy.
export const THEME_INIT = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')d.dataset.theme=t}catch(e){}})();`;
