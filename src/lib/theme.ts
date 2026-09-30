export const themeKey = "vibing:theme";
// Runs in the head before first paint; unavailable storage falls back to the OS.
export const themeBootstrap = `(function(){var d=matchMedia('(prefers-color-scheme: dark)').matches;try{var t=localStorage.getItem('${themeKey}');if(t==='light'||t==='dark')d=t==='dark'}catch(e){}document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'})()`;
