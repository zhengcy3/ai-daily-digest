/* 公共：数据加载、工具函数、导航 */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bj=t=>{const d=new Date(new Date(t).getTime()+8*3600e3);return `${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`};
const WD='日一二三四五六';
const wd=ds=>'周'+WD[new Date(ds+'T00:00:00Z').getUTCDay()];
const qs=new URLSearchParams(location.search);
const $=s=>document.querySelector(s);
const hl=(s,q)=>{s=esc(s);if(!q)return s;const re=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');return s.replace(re,m=>`<mark>${m}</mark>`)};
const ICON={search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 filter:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
 up:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>',
 chev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
 link:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'};
const __JSON_CACHE__=new Map();
async function loadJSON(name){
  if(__JSON_CACHE__.has(name))return __JSON_CACHE__.get(name);
  const p=(async()=>{
    const r=await fetch('data/'+name,{cache:'no-cache'});
    if(r.ok)return r.json();
    if(r.status===404)return null;
    throw new Error('load '+name+' '+r.status);
  })();
  __JSON_CACHE__.set(name,p);
  try{const v=await p;__JSON_CACHE__.set(name,v);return v;}
  catch(e){__JSON_CACHE__.delete(name);throw e;}
}
function nav(cur){
  const L=[['index','各期','index.html'],['search','搜索','search.html'],['bloggers','博主','bloggers.html']];
  const q=esc(qs.get('q')||'');
  document.body.insertAdjacentHTML('afterbegin',`<a class="skip" href="#main">跳到正文</a><header class="nav"><div class="nav-in">
  <a class="logo" href="index.html">AI<span>博主日报</span></a>
  <nav class="nav-links" aria-label="主导航">${L.map(([k,t,h])=>`<a href="${h}" class="${k==='search'?'hide-m':''}" ${k===cur?'aria-current="page"':''}>${t}</a>`).join('')}</nav>
  <form class="nav-search" action="search.html" role="search"><label class="sr" for="navq">全站搜索</label>
  <input id="navq" name="q" type="search" placeholder="搜索全部期，如 Claude" value="${cur==='search'?'':q}">
  <a class="icon-btn" href="search.html" aria-label="全站搜索">${ICON.search}</a></form></div></header>`);
  document.body.insertAdjacentHTML('beforeend',`<button class="totop" hidden aria-label="回到顶部">${ICON.up}</button>`);
  const tt=$('.totop');tt.onclick=()=>{scrollTo({top:0,behavior:'smooth'});$('#main')?.focus({preventScroll:true})};
  addEventListener('scroll',()=>{tt.hidden=scrollY<innerHeight*2},{passive:true});
}
function stateHTML({kind='',icon='?',title,text,acts=''}){return `<div class="state ${kind}" role="${kind==='err'?'alert':'status'}"><div class="ico" aria-hidden="true">${icon}</div><h1>${title}</h1><p>${text}</p><div class="acts">${acts}</div></div>`}
