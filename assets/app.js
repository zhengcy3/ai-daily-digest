/* AI博主日报 v5（定稿 C）· 共用逻辑 */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const qs=new URLSearchParams(location.search);
const J={};function load(n){if(!J[n])J[n]=fetch('data/'+n).then(r=>{if(r.status===404)return null;if(!r.ok)throw new Error(r.status);return r.json()}).catch(e=>{delete J[n];throw e});return J[n]}
const WD='日一二三四五六';const wd=d=>'周'+WD[new Date(d+'T00:00:00+08:00').getDay()];
const bj=t=>{const d=new Date(new Date(t).getTime()+8*3600e3);return `${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`};
const pts=s=>String(s||'').split('；').map(x=>x.replace(/。$/,'').trim()).filter(Boolean);
const take=b=>{const i=b.indexOf('启发：');return i>=0?[b.slice(i+3),b.slice(0,i)]:[b,'']};
const hl=(s,q)=>{s=esc(s);if(!q)return s;const r=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');return s.replace(r,m=>`<mark>${m}</mark>`)};
const ICON={sun:'<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
moon:'<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
arrow:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
chev:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
x:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
ext:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>'};
/* 导航 / 页脚 / 主题 */
function chrome(cur){
 const L=[['home','首页','index.html'],['archive','往期','archive.html'],['search','搜索','search.html'],['bloggers','博主','bloggers.html']];
 document.body.insertAdjacentHTML('afterbegin',`<a class="skip" href="#main">跳到正文</a><header class="nav"><div class="nav-in">
 <a class="brand" href="index.html" aria-label="AI博主日报 首页"><span class="brand-mark" aria-hidden="true">AI</span><span class="brand-name">博主日报</span></a>
 <nav class="nav-links" aria-label="主导航">${L.map(([k,t,h])=>`<a href="${h}"${k===cur?' aria-current="page"':''}>${t}</a>`).join('')}</nav>
 <button type="button" class="theme-toggle">${ICON.sun}${ICON.moon}</button></div></header>`);
 document.body.insertAdjacentHTML('beforeend',`<footer class="foot"><div class="foot-in">
 <div class="foot-brand"><span class="brand-mark" aria-hidden="true">AI</span><div><b>AI博主日报</b><p>每天汇总 100 位 AI 博主的一手观点，提炼成可执行的见解。</p></div></div>
 <nav class="foot-links" aria-label="页脚导航"><a href="index.html">最新一期</a><a href="archive.html">往期</a><a href="search.html">搜索</a><a href="bloggers.html">博主名录</a></nav>
 <p class="foot-note">数据窗口为北京时间 · 结论只基于帖子文字 · 原文版权归作者所有</p></div></footer>`);
 document.body.insertAdjacentHTML('beforeend',`<button type="button" class="to-top" aria-label="回到顶部" hidden><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>`);
 {const t=$('.to-top');const u=()=>{t.hidden=scrollY<innerHeight*1.5};addEventListener('scroll',u,{passive:true});u();t.onclick=()=>{scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});$('#main').focus({preventScroll:true})}}
 const H=document.documentElement,b=$('.theme-toggle');
 const sync=()=>{const l=H.dataset.theme==='light';b.setAttribute('aria-pressed',String(l));b.setAttribute('aria-label',l?'切换到深色模式':'切换到亮色模式');b.title=b.getAttribute('aria-label')};sync();
 b.onclick=()=>{H.dataset.theme=H.dataset.theme==='light'?'dark':'light';try{localStorage.setItem('aidd-theme',H.dataset.theme)}catch(e){}sync()};
}
const state=(t,x,acts='')=>`<div class="state" role="status"><h1>${t}</h1><p>${x}</p><div class="acts">${acts}</div></div>`;
/* 日历（H4：可切换月份） */
function cal(dates,cur){const base=(cur||dates.at(-1)||'').slice(0,7);return `<div class="cal" data-ym="${base}" data-cur="${cur}"></div>`}
function calDraw(el,dates){const S=new Set(dates),ym=el.dataset.ym,cur=el.dataset.cur;if(!ym)return;const [y,m]=ym.split('-').map(Number),first=new Date(Date.UTC(y,m-1,1)).getUTCDay(),n=new Date(Date.UTC(y,m,0)).getUTCDate();
 let h=`<div class="cal-h"><button type="button" class="icon-btn cal-p" aria-label="上个月">${ICON.chev}</button><b aria-live="polite">${y} 年 ${m} 月</b><button type="button" class="icon-btn cal-n" aria-label="下个月">${ICON.arrow}</button></div><div class="cal-g">${[...WD].map(w=>`<span class="cal-w" aria-hidden="true">${w}</span>`).join('')}${'<span></span>'.repeat(first)}`,any=0;
 for(let d=1;d<=n;d++){const ds=`${ym}-${String(d).padStart(2,'0')}`;if(S.has(ds)){any=1;h+=`<a class="cal-d on${ds===cur?' cur':''}" href="index.html?d=${ds}" aria-label="${ds} 这期">${d}</a>`}else h+=`<span class="cal-d" aria-disabled="true">${d}</span>`}
 el.innerHTML=h+'</div>'+(any?'':'<p class="meta cal-empty">本月无内容</p>')+`<p class="meta">共 ${dates.length} 期</p>`;
 const sh=k=>{const t=new Date(Date.UTC(y,m-1+k,1));el.dataset.ym=t.toISOString().slice(0,7);calDraw(el,dates)};
 el.querySelector('.cal-p').onclick=()=>sh(-1);el.querySelector('.cal-n').onclick=()=>sh(1)}
const calInit=ds=>$$('.cal').forEach(el=>calDraw(el,ds));
/* 帖子 */
function post(p,q=''){const kp=p.keypoints||[];return `<article class="post" id="post-${esc(p.id)}">
 <p class="post-c">${p.highlight?'<span class="pill">推荐</span>':''}${hl(p.conclusion||p.zh||p.text,q)}</p>
 ${kp.length?`<ul class="post-kp">${kp.slice(0,3).map(k=>`<li>${hl(k,q)}</li>`).join('')}</ul>`:''}
 <div class="post-m"><a href="bloggers.html#b-${esc(p.handle)}" class="who">${esc(p.name)}</a><span>@${esc(p.handle)}</span><span>${bj(p.time)}</span><span>${(p.likes||0).toLocaleString()} 赞</span><a class="src" href="${esc(p.url)}" target="_blank" rel="noopener">原文 ${ICON.ext}</a></div></article>`}
function related(x,P){const q=((x.match(/[A-Za-z][A-Za-z0-9.\- ]*[A-Za-z0-9]/)||[''])[0]).split(' ').slice(0,2).join(' ').trim();
 if(q.length>1)return 'search.html?q='+encodeURIComponent(q);
 const t=ORDER.find(o=>x.includes(o.replace('/开发','')));if(t)return '#topic-'+encodeURIComponent(t);
 const runs=x.match(/[\u4e00-\u9fff]{4,}/g)||[];for(const r of runs)for(let i=0;i+4<=r.length;i++){const k=r.slice(i,i+4),p=(P||[]).find(p=>(p.conclusion||'').includes(k));if(p)return '#post-'+encodeURIComponent(p.id)}
 return ''}
const ORDER=['模型发布','Agent/开发','企业应用','研究','产品工具','其他/闲聊','非AI'];
/* 首页 = 最新一期 */
async function home(){chrome('home');const m=$('#main');let IDX;
 try{IDX=await load('index.json')}catch(e){return m.innerHTML=state('加载失败','网络不稳定，请重试。','<button class="btn btn-pri" onclick="location.reload()">重试</button>')}
 const ds=IDX.map(x=>x.date).sort(),d=qs.get('d')||ds.at(-1);let D;
 try{D=/^\d{4}-\d{2}-\d{2}$/.test(d)?await load(d+'.json'):null}catch(e){return m.innerHTML=state('这期内容加载失败','可能是网络不稳定，数据本身没有问题。','<button class="btn btn-pri" onclick="location.reload()">重试</button><a class="btn" href="index.html">返回首页</a>')}
 if(!D){document.title=`未找到 ${d} · AI博主日报`;return m.innerHTML=state(`未找到 ${esc(d)} 这期`,`可能当天没有发布，或链接有误。最近一期是 ${ds.at(-1)||'—'}。`,`${ds.length?`<a class="btn btn-pri" href="index.html?d=${ds.at(-1)}">看最近一期（${ds.at(-1)}）</a>`:''}<a class="btn" href="archive.html">返回首页 · 按日历找</a>`)}
 document.title=`${d} · AI博主日报`;const i=ds.indexOf(d),prev=ds[i-1],next=ds[i+1],latest=d===ds.at(-1);
 if(!latest){$$('.nav-links a').forEach(a=>a.toggleAttribute('aria-current',a.getAttribute('href')==='archive.html'));$('.nav-links a[aria-current]').setAttribute('aria-current','page')}
 const P=D.posts||[],picks=P.filter(p=>p.highlight).sort((a,b)=>b.likes-a.likes),ins=D.insights||[],S=pts(D.summary);
 const groups=ORDER.map(t=>[t,P.filter(p=>p.topic===t).sort((a,b)=>(b.highlight?1:0)-(a.highlight?1:0)||b.likes-a.likes)]).filter(g=>g[1].length);
 const hero=`<section class="hero"><div class="wrap">
   <p class="kicker">${latest?'最新一期':'往期'} · ${wd(d)}</p>
   <h1 class="hero-t">${d.replace(/-/g,'.')}</h1>
   ${`<dl class="istats" aria-label="本期数据"><div><dt>期号</dt><dd>第 ${i+1} 期</dd></div><div><dt>帖子</dt><dd>${D.post_count}</dd></div><div><dt>发帖博主</dt><dd>${D.blogger_count}</dd></div><div><dt>见解</dt><dd>${ins.length}</dd></div></dl><p class="hero-sub">${esc(D.window)}</p>`}
   ${`<ol class="pts p1">${S.map((x,n)=>{const u=related(x,P);return `<li><span class="p1-n">0${n+1}</span><p>${esc(x)}</p>${u?`<a class="p1-more" href="${u}">查看相关帖子 ${ICON.arrow}</a>`:''}</li>`}).join('')}</ol>`}
   <div class="hero-acts"><a class="btn btn-pri" href="#insights">读今日见解 ${ICON.arrow}</a><a class="btn" href="#topics">按主题浏览</a><a class="btn" href="archive.html">往期</a>${ds.length>1?(prev?`<a class="btn" rel="prev" href="index.html?d=${prev}">上一期</a>`:'<span class="btn" aria-disabled="true">上一期</span>')+(next?`<a class="btn" rel="next" href="index.html?d=${next}">下一期</a>`:'<span class="btn" aria-disabled="true">下一期</span>'):''}</div></div></section>`;
 m.innerHTML=hero+`
 <section class="sec" id="insights" aria-labelledby="h-ins"><div class="wrap"><div class="sec-h"><p class="eyebrow">学习海绵见解</p><h2 id="h-ins">今天值得带走的 ${ins.length} 个判断</h2></div>
  <div class="ins-grid">${ins.map((x,n)=>{const[t,r]=take(x.body||'');return `<article class="ins" id="insight-${n+1}"><span class="ins-n">${String(n+1).padStart(2,'0')}</span><h3>${esc(x.title)}</h3><p class="ins-take"><b>启发</b>${esc(t)}</p>${r?`<details><summary>展开依据</summary><p>${esc(r)}</p></details>`:''}</article>`}).join('')}</div></div></section>
 ${picks.length?`<section class="sec sec-alt" aria-labelledby="h-pick"><div class="wrap"><div class="sec-h"><p class="eyebrow">编辑推荐</p><h2 id="h-pick">今日推荐 ${picks.length} 条</h2></div><div class="pick-grid">${picks.map(p=>post(p)).join('')}</div></div></section>`:''}
 <section class="sec" id="topics" aria-labelledby="h-topic"><div class="wrap"><div class="sec-h"><p class="eyebrow">全部帖子</p><h2 id="h-topic">按主题浏览 ${P.length} 条</h2></div>
  <div class="tabs" role="tablist" aria-label="主题">${groups.map(([t,v],n)=>`<button role="tab" class="tab" id="tab-${n}" aria-controls="topic-list" tabindex="${n===0?0:-1}" aria-selected="${n===0}" data-t="${esc(t)}">${esc(t)} <span>${v.length}</span></button>`).join('')}</div>
  <div id="topic-list" role="tabpanel" aria-labelledby="tab-0" tabindex="0"></div></div></section>
 <section class="sec sec-alt" aria-labelledby="h-arc"><div class="wrap arc-row"><div><p class="eyebrow">往期</p><h2 id="h-arc">翻看过去的每一天</h2><p class="lede">日历中高亮的日期都有内容。共 ${ds.length} 期。</p><a class="btn" href="archive.html">进入往期 ${ICON.arrow}</a></div>${cal(ds,d)}</div></section>
 ${(D.silent||[]).length?`<section class="sec"><div class="wrap"><details class="silent"><summary>本期未发帖的博主（${D.silent.length}）</summary><p class="meta">${D.silent.map(x=>esc(typeof x==='string'?x:(x.name||x.handle))).join('、')}</p></details></div></section>`:''}`;
 let show={};const renderT=t=>{const v=groups.find(g=>g[0]===t)[1],n=show[t]||6;$('#topic-list').innerHTML=`<div class="post-list">${v.slice(0,n).map(p=>post(p)).join('')}</div>${v.length>n?`<button class="btn more" data-more="${esc(t)}">再显示 ${Math.min(12,v.length-n)} 条（共 ${v.length} 条）</button>`:''}`};
 renderT(groups[0][0]);
 const selT=tb=>{$$('.tab').forEach(x=>{x.setAttribute('aria-selected',x===tb);x.tabIndex=x===tb?0:-1});$('#topic-list').setAttribute('aria-labelledby',tb.id);renderT(tb.dataset.t)};
 $('.tabs').addEventListener('keydown',e=>{const T=$$('.tab'),i=T.indexOf(document.activeElement);if(i<0)return;const k={ArrowRight:1,ArrowLeft:-1}[e.key];if(k){e.preventDefault();const n=T[(i+k+T.length)%T.length];n.focus();selT(n)}});
 m.addEventListener('click',e=>{const tb=e.target.closest('.tab'),mo=e.target.closest('[data-more]');if(tb){selT(tb)}if(mo){show[mo.dataset.more]=(show[mo.dataset.more]||6)+12;renderT(mo.dataset.more)}});
 calInit(ds);
 const goH=()=>{const h=decodeURIComponent(location.hash.slice(1));if(!h)return;let id=h;
  if(h.startsWith('post-')){const p=P.find(x=>'post-'+x.id===h);if(p){const tb=$$('.tab').find(x=>x.dataset.t===p.topic);show[p.topic]=groups.find(g=>g[0]===p.topic)[1].length;tb&&selT(tb)}}
  if(h.startsWith('topic-')){const tb=$$('.tab').find(x=>'topic-'+x.dataset.t===h);if(tb){selT(tb);id='topics'}}
  setTimeout(()=>{const el=document.getElementById(id);if(el){el.querySelector('details')?.setAttribute('open','');el.scrollIntoView({block:'start'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),2400)}},50)};
 goH();addEventListener('hashchange',goH)}
/* 往期 */
async function archive(){chrome('archive');const m=$('#main');const IDX=(await load('index.json')).slice().sort((a,b)=>b.date.localeCompare(a.date));const ds=IDX.map(x=>x.date).sort();
 m.innerHTML=`<section class="page-h"><div class="wrap"><p class="eyebrow">往期</p><h1>全部 ${IDX.length} 期</h1><p class="lede">每天北京时间 13:45 截止，一期一天。点日期或卡片阅读。</p></div></section>
 <section class="sec"><div class="wrap arc-grid">${cal(ds,'')}<ol class="issue-list">${IDX.map((x,n)=>`<li><a class="issue" href="index.html?d=${x.date}"><span class="issue-d"><b>${x.date}</b><span class="meta">${wd(x.date)}${n===0?' · 最新':''}</span></span><span class="issue-s">${pts(x.summary).map(s=>`<span>${esc(s)}</span>`).join('')}</span><span class="issue-i" data-d="${x.date}"></span><span class="issue-m meta">${x.post_count} 帖 · ${x.blogger_count} 位博主</span></a></li>`).join('')}</ol></div></section>`
 calInit(ds);const qu=IDX.map(x=>x.date);const w=async()=>{while(qu.length){const d=qu.shift();try{const D=await load(d+'.json'),t=D&&(D.insights||[])[0]?.title,el=$(`.issue-i[data-d="${d}"]`);if(t&&el){el.innerHTML=`<span class="pill">见解</span>${esc(t)}`}}catch(e){}}};[1,2,3,4].forEach(w)}
/* 搜索：页内预览 */
async function search(){chrome('search');const m=$('#main');const IDX=await load('index.json');const ds=IDX.map(x=>x.date).sort().reverse();
 let q=qs.get('q')||'',topic=qs.get('topic')||'',sel=null,R=[];
 m.innerHTML=`<section class="page-h"><div class="wrap"><p class="eyebrow">搜索</p><h1>搜索全部 ${ds.length} 期</h1>
 <form class="sbar" role="search" id="sf"><label class="sr" for="sq">关键词</label><input id="sq" type="search" placeholder="试试 Claude、沙箱、Muse" value="${esc(q)}" autocomplete="off"><button class="btn btn-pri">搜索</button></form>
 <div class="chips" id="tchips">${['',...ORDER].map(t=>`<button type="button" class="chip" aria-pressed="${t===topic}" data-t="${esc(t)}">${t||'全部主题'}</button>`).join('')}</div></div></section>
 <section class="sec sec-tight"><div class="wrap sres"><div id="sl" aria-live="polite"></div><aside id="pv" class="pv" hidden></aside></div></section>`;
 const all=[];let done=0,started=null;
 const fetchAll=()=>started||(started=(async()=>{const qu=ds.slice();const w=async()=>{while(qu.length){const d=qu.shift();try{const D=await load(d+'.json');if(D){(D.insights||[]).forEach((x,n)=>all.push({k:'ins',d,n:n+1,id:`${d}-i${n+1}`,title:x.title,body:x.body||''}));(D.posts||[]).forEach(p=>all.push({k:'post',d,id:`${d}-${p.id}`,p}))}}catch(e){}done++;q&&run()}};await Promise.all([1,2,3,4].map(w))})());
 const prog=()=>done<ds.length?`<p class="meta" role="status">已搜索 ${done} / ${ds.length} 期…</p><div class="progress" role="progressbar" aria-label="搜索进度" aria-valuemin="0" aria-valuenow="${done}" aria-valuemax="${ds.length}"><i style="width:${ds.length?done/ds.length*100:0}%"></i></div>`:`<p class="meta">已搜索 ${done} / ${ds.length} 期</p>`;
 const txt=r=>r.k==='ins'?[r.title,r.body]:[r.p.conclusion,r.p.zh,r.p.text,r.p.name,r.p.handle,...(r.p.tags||[]),...(r.p.keypoints||[])];
 const PAGE=60;let lim=PAGE,lastQ=null;
 const li=r=>`<li class="r${r.k==='ins'?' r-ins':''}" data-id="${esc(r.id)}"><button type="button" class="r-btn" aria-expanded="false" aria-controls="pv">
   <span class="r-k">${r.k==='ins'?'见解':esc(r.p.topic)} · ${r.d}</span><span class="r-t">${hl(r.k==='ins'?r.title:(r.p.conclusion||r.p.zh),q)}</span><span class="r-m meta">${r.k==='ins'?'学习海绵见解 #'+r.n:esc(r.p.name)+' · '+(r.p.likes||0).toLocaleString()+' 赞'}</span></button></li>`;
 const grp=V=>{const g=[];V.forEach(r=>{(g.at(-1)?.[0]===r.d)?g.at(-1)[1].push(r):g.push([r.d,[r]])});return g.map(([d,v])=>`<section class="rgrp" aria-label="${d} 的结果"><h2 class="rgrp-h">${d} · ${wd(d)} <span class="meta">${v.length} 条</span></h2><ol class="rlist">${v.map(li).join('')}</ol></section>`).join('')};
 function run(){if(q)fetchAll();const qk=q+'\u0000'+topic;if(qk!==lastQ){lim=PAGE;lastQ=qk}const ql=q.toLowerCase();R=q?all.filter(r=>(r.k==='ins'||!topic||r.p.topic===topic)&&txt(r).some(v=>String(v||'').toLowerCase().includes(ql))):[];
  if(topic)R=R.filter(r=>r.k==='post');
  R.sort((a,b)=>b.d.localeCompare(a.d)||(a.k==='ins'?0:1)-(b.k==='ins'?0:1)||(a.k==='ins'?a.n-b.n:(b.p.likes||0)-(a.p.likes||0)));
  const u=new URLSearchParams();q&&u.set('q',q);topic&&u.set('topic',topic);history.replaceState(null,'',u.toString()?'?'+u:location.pathname);
  if(!q){$('#sl').innerHTML=`<div class="hint"><p class="lede">输入关键词，结果会在本页展开预览，不会跳走。</p><div class="chips">${['Claude','Muse','沙箱','subagent','Agent'].map(w=>`<button type="button" class="chip" data-w="${w}">${w}</button>`).join('')}</div></div>`;closePv();return}
  if(!R.length){$('#sl').innerHTML=prog()+(done<ds.length?'':`<div class="hint"><p class="lede">没有找到「${esc(q)}」。换个词，或清除主题筛选。</p></div>`);if(done>=ds.length)closePv();return}
  const keep=sel;$('#sl').innerHTML=prog()+`<p class="meta rcount">找到 <b>${R.length}</b> 条 · 点击任一条在本页预览</p>${grp(R.slice(0,lim))}${R.length>lim?`<button type="button" class="btn more-r" id="rmore">加载更多（还有 ${R.length-lim} 条）</button>`:''}`;if(keep){const b=$(`.r[data-id="${CSS.escape(keep)}"] .r-btn`);b&&b.setAttribute('aria-expanded','true')}}
 function detail(r){const where=r.k==='ins'?`index.html?d=${r.d}#insight-${r.n}`:`index.html?d=${r.d}#post-${r.p.id}`;
  if(r.k==='ins'){const[t,rs]=take(r.body);return `<p class="r-k">见解 · ${r.d}</p><h2 class="pv-t">${hl(r.title,q)}</h2><p class="ins-take"><b>启发</b>${hl(t,q)}</p><p class="pv-body">${hl(rs,q)}</p><div class="pv-acts"><a class="btn btn-quiet" href="${where}">在当期中查看 ${ICON.arrow}</a></div>`}
  const p=r.p;return `<p class="r-k">${esc(p.topic)} · ${r.d}</p><h2 class="pv-t">${hl(p.conclusion||p.zh,q)}</h2>${(p.keypoints||[]).length?`<ul class="post-kp">${p.keypoints.map(k=>`<li>${hl(k,q)}</li>`).join('')}</ul>`:''}
   ${p.zh&&p.en?`<p class="pv-body">${hl(p.zh,q)}</p>`:''}<p class="pv-body${p.en?' orig':''}" lang="${p.en?'en':'zh'}">${hl(p.text,q)}</p>
   <p class="meta">${esc(p.name)} @${esc(p.handle)} · ${bj(p.time)} · ${(p.likes||0).toLocaleString()} 赞</p>
   <div class="pv-acts"><a class="btn btn-quiet" href="${esc(p.url)}" target="_blank" rel="noopener">X 原文 ${ICON.ext}</a><a class="btn btn-quiet" href="${where}">在当期中查看 ${ICON.arrow}</a></div>`}
 let lastBtn=null;
 function closePv(){const pv=$('#pv');if(!pv)return;pv.hidden=true;document.body.classList.remove('pv-open');$$('.r-btn[aria-expanded=true]').forEach(b=>b.setAttribute('aria-expanded','false'));sel=null}
 function open(id,btn){const r=R.find(x=>x.id===id);if(!r)return;
  $$('.r-btn').forEach(b=>b.setAttribute('aria-expanded',b===btn));const pv=$('#pv');pv.hidden=false;pv.setAttribute('role','region');pv.setAttribute('aria-label','预览');
  pv.innerHTML=`<div class="pv-h"><span class="meta">预览</span><button type="button" class="icon-btn pv-x" aria-label="关闭预览">${ICON.x}</button></div><div class="pv-in">${detail(r)}</div>`;
  document.body.classList.add('pv-open');lastBtn=btn;$('.pv-x').focus({preventScroll:true});sel=id}
 m.addEventListener('click',e=>{const b=e.target.closest('.r-btn'),c=e.target.closest('#tchips .chip'),w=e.target.closest('[data-w]'),x=e.target.closest('.pv-x');
  if(b)open(b.parentElement.dataset.id,b);if(e.target.closest('#rmore')){const n=lim;lim+=PAGE;run();const f=$$('.r-btn')[n];f&&f.focus()}if(x){closePv();lastBtn?.focus()}
  if(c){topic=c.dataset.t;$$('#tchips .chip').forEach(z=>z.setAttribute('aria-pressed',z===c));run()}
  if(w){q=w.dataset.w;$('#sq').value=q;run()}});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&sel){closePv();lastBtn?.focus()}});
 $('#sf').onsubmit=e=>{e.preventDefault();q=$('#sq').value.trim();run()};let t;$('#sq').oninput=e=>{clearTimeout(t);t=setTimeout(()=>{q=e.target.value.trim();run()},250)};
 run();if(qs.get('open')){const b=$(`.r[data-id="${qs.get('open')}"] .r-btn`)||$('.r-btn');b&&open(b.parentElement.dataset.id,b)}}
/* 博主：按分类分组，重点在前 */
async function bloggers(){chrome('bloggers');const m=$('#main');const BJ=await load('bloggers.json'),IDX=await load('index.json');const last=IDX.map(x=>x.date).sort().at(-1);const D=(last&&await load(last+'.json').catch(()=>null))||{};
 const likes={};(D.posts||[]).forEach(p=>likes[p.handle]=(likes[p.handle]||0)+(p.likes||0));
 const end=new Date(last+'T00:00:00Z'),win=new Set([...Array(14)].map((_,i)=>{const t=new Date(end);t.setUTCDate(t.getUTCDate()-i);return t.toISOString().slice(0,10)}));
 const d14=b=>{let dl=b.daily;if(typeof dl==='string'){try{dl=JSON.parse(dl)}catch(e){dl={}}}return Object.entries(dl||{}).reduce((s,[k,v])=>s+(win.has(k)?(+v||0):0),0)};
 const B=BJ.bloggers.map(b=>{const n=d14(b);return {...b,n14:n,lk:likes[b.handle]||0,score:n*1e7+(likes[b.handle]||0)}});
 const G=[...new Set(B.map(b=>b.group))].sort((a,b)=>'一二三四五六七八九十'.indexOf(a[0])-'一二三四五六七八九十'.indexOf(b[0]));
 const short=g=>g.replace(/^.、/,'').split('：')[0],desc=g=>g.split('：')[1]||'';
 let f=qs.get('q')||'',cur=qs.get('g')||'',open={};
 m.innerHTML=`<section class="page-h"><div class="wrap"><p class="eyebrow">博主名录</p><h1>${B.length} 位博主 · ${G.length} 个分类</h1><p class="lede">每个分类先列出重点博主：按近 14 天（截至最新一期）发帖数排序，相同时比最新一期获赞数，取前 3 位。其余可以展开查看。</p>
 <div class="bl-tools"><label class="sr" for="bq">筛选博主</label><input id="bq" type="search" placeholder="筛选姓名 / @handle / 简介" value="${esc(f)}"></div></div></section>
 <nav class="gnav" aria-label="博主分类"><div class="wrap gnav-in"><button type="button" class="chip" aria-pressed="${!cur}" data-g="">全部</button>${G.map(g=>`<button type="button" class="chip" aria-pressed="${g===cur}" data-g="${esc(g)}">${esc(short(g))}</button>`).join('')}</div></nav>
 <section class="sec sec-tight"><div class="wrap" id="bl"></div></section>`;
 const card=(b,key)=>`<article class="bc${key?' bc-key':''}" id="b-${esc(b.handle)}">${key?`<span class="pill">重点</span>`:''}<h3><a href="https://x.com/${esc(b.handle)}" target="_blank" rel="noopener">${esc(b.name)}</a></h3><p class="meta">@${esc(b.handle)}</p>
  ${key?`<p class="bc-bio">${esc(b.bio)}</p>`:''}<p class="bc-st"><span><b>${b.n14}</b> 帖 · 近 14 天</span><span><b>${b.total}</b> 帖累计</span><span><b>${b.days_active}</b> 天活跃</span>${b.last?`<a href="index.html?d=${b.last}">最近 ${b.last.slice(5)}</a>`:'<span class="warn">尚未发帖</span>'}</p></article>`;
 function render(){const fl=f.toLowerCase();const list=B.filter(b=>!fl||[b.name,b.handle,b.bio].some(v=>String(v).toLowerCase().includes(fl)));
  const gs=(cur?[cur]:G).map(g=>[g,list.filter(b=>b.group===g).sort((a,b)=>b.score-a.score)]).filter(x=>x[1].length);
  $('#bl').innerHTML=gs.length?gs.map(([g,v])=>{const key=v.slice(0,3).filter(b=>b.n14>0||f),rest=v.slice(key.length),o=open[g]||!!f;
   return `<section class="bg" aria-labelledby="g-${esc(g[0])}"><div class="bg-h"><div><h2 id="g-${esc(g[0])}">${esc(short(g))}</h2><p class="meta">${esc(desc(g))}</p></div><span class="meta">${v.length} 位</span></div>
   <div class="bc-key-grid">${key.map(b=>card(b,1)).join('')}</div>
   ${rest.length?`<div class="bc-rest"${o?'':' hidden'} id="r-${esc(g[0])}">${rest.map(b=>card(b,0)).join('')}</div><button type="button" class="btn more" data-g2="${esc(g)}" aria-expanded="${o}" aria-controls="r-${esc(g[0])}">${o?'收起':'展开其余 '+rest.length+' 位'}</button>`:''}</section>`}).join(''):`<div class="hint"><p class="lede">没有匹配「${esc(f)}」的博主。</p></div>`}
 render();
 m.addEventListener('click',e=>{const c=e.target.closest('.gnav .chip'),x=e.target.closest('[data-g2]');if(c){cur=c.dataset.g;$$('.gnav .chip').forEach(z=>z.setAttribute('aria-pressed',z===c));render()}if(x){open[x.dataset.g2]=x.getAttribute('aria-expanded')!=='true';render()}});
 let t;$('#bq').oninput=e=>{clearTimeout(t);t=setTimeout(()=>{f=e.target.value.trim();render()},200)};
 const h=location.hash.slice(1);if(h){const b=B.find(x=>'b-'+x.handle===h);if(b){open[b.group]=true;render();setTimeout(()=>{const el=document.getElementById(h);el&&(el.scrollIntoView({block:'center'}),el.classList.add('flash'))},50)}}}
({home,archive,search,bloggers})[document.body.dataset.page]();
