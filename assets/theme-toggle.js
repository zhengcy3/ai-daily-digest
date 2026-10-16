/* 主题切换：默认深色，存 localStorage['aidd-theme']，不跟随系统 */
(function(){var K='aidd-theme',H=document.documentElement;
var SUN='<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
var MOON='<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
function sync(b){var light=H.dataset.theme==='light';b.setAttribute('aria-pressed',String(light));b.setAttribute('aria-label',light?'切换到深色模式':'切换到亮色模式');b.title=b.getAttribute('aria-label')}
function all(){document.querySelectorAll('.theme-toggle').forEach(sync)}
function mountIn(n){if(!n||n.querySelector('.theme-toggle'))return;
 var b=document.createElement('button');b.type='button';b.className='theme-toggle';b.innerHTML=SUN+MOON;sync(b);
 b.onclick=function(){var t=H.dataset.theme==='light'?'dark':'light';H.dataset.theme=t;try{localStorage.setItem(K,t)}catch(e){}all()};n.appendChild(b)}
window.aiddMountToggle=mountIn;
function mount(){mountIn(document.querySelector('.nav-in'));mountIn(document.querySelector('.tb-row'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();})();
