nav('index');
const ORDER=['模型发布','Agent/开发','企业应用','研究','产品工具','其他/闲聊','非AI'];
const LOW=new Set(['其他/闲聊','非AI']);
const takeSplit=b=>{const i=b.indexOf('启发：');if(i>=0)return[b.slice(i+3),b.slice(0,i)];const f=b.split(/(?<=[。！？])/);return[f[0],f.slice(1).join('')]};
let D,IDX,S={view:'topic',topic:'',tag:'',q:''},open={},full={};
const m=$('#main');
function readURL(){const p=new URLSearchParams(location.search);S={view:p.get('view')==='blogger'?'blogger':'topic',topic:p.get('topic')||'',tag:p.get('tag')||'',q:p.get('q')||''}}
function writeURL(push){const p=new URLSearchParams({d:D.date});if(S.view!=='topic')p.set('view',S.view);['topic','tag','q'].forEach(k=>S[k]&&p.set(k,S[k]));const u='?'+p.toString();if(u!==location.search)history[push?'pushState':'replaceState'](null,'',u)}
const active=()=>!!(S.topic||S.tag||S.q);
const match=p=>{if(S.topic&&p.topic!==S.topic)return false;if(S.tag&&!(p.tags||[]).includes(S.tag))return false;if(S.q){const q=S.q.toLowerCase();return[p.conclusion,p.zh,p.text,p.name,p.handle,...(p.tags||[]),...(p.keypoints||[])].some(v=>String(v||'').toLowerCase().includes(q))}return true};
const sortP=a=>a.slice().sort((x,y)=>(y.highlight?1:0)-(x.highlight?1:0)||(y.likes||0)-(x.likes||0));
function post(p){const q=S.q,kp=p.keypoints||[];
 return `<article class="post" id="post-${esc(p.id)}"><p class="concl">${p.highlight?'<span class="badge badge-pick" style="margin-right:6px">★ 推荐</span>':''}${hl(p.conclusion||p.zh||p.text,q)}</p>
 ${kp.length?`<ul class="kp">${kp.slice(0,3).map(k=>`<li>${hl(k,q)}</li>`).join('')}</ul>`:''}
 ${(p.zh||p.text)?`<details class="fold"><summary>${p.en?'译文 / 原文':'原文'}${kp.length>3?` · 另 ${kp.length-3} 条要点`:''}</summary>${kp.length>3?`<ul class="kp" style="margin-bottom:8px">${kp.slice(3).map(k=>`<li>${hl(k,q)}</li>`).join('')}</ul>`:''}${p.en&&p.zh?`<p class="body">${hl(p.zh,q)}</p>`:''}<p class="body ${p.en?'orig':''}" lang="${p.en?'en':'zh'}">${hl(p.text,q)}</p></details>`:''}
 <div class="post-meta"><a class="who" href="bloggers.html?q=${encodeURIComponent(p.handle)}">${hl(p.name,q)}</a><span>@${esc(p.handle)}</span><span>${bj(p.time)}</span><span aria-label="${p.likes||0} 赞">♥ ${p.likes||0}</span><a class="src" href="${esc(p.url)}" target="_blank" rel="noopener">原文 ↗</a></div>
 ${(p.tags||[]).length?`<div class="tags">${p.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>`:''}</article>`}
function tldr(s){const p=String(s).split('；').map(x=>x.trim()).filter(Boolean);return p.length>1?`<div class="tldr is-list"><b>一句话总结</b><ul class="tldr-list">${p.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:`<div class="tldr"><b>一句话总结</b>${esc(s)}</div>`}
function groups(list){const g=new Map();
 if(S.view==='topic'){ORDER.forEach(t=>g.set(t,[]));list.forEach(p=>{const t=ORDER.includes(p.topic)?p.topic:'其他/闲聊';g.get(t).push(p)})}
 else{list.forEach(p=>{g.has(p.handle)||g.set(p.handle,[]);g.get(p.handle).push(p)})}
 let arr=[...g].filter(([,v])=>v.length);if(S.view==='blogger')arr.sort((a,b)=>b[1].length-a[1].length);return arr}
const gid=k=>'g-'+encodeURIComponent(k).replace(/%/g,'');
function render(){
 const list=(D.posts||[]).filter(match),G=groups(list),act=active();
 const per=act?20:(S.view==='topic'?5:3);
 $('#count').innerHTML=act?`<span>共 <b>${list.length}</b> 条匹配</span><button class="btn btn-text" id="clr">清除筛选</button>`:`<span>共 ${D.posts.length} 条 · ${S.view==='blogger'?'按博主默认全部折叠':'闲聊与非 AI 默认收起'}</span>`;
 $('#clr')&&($('#clr').onclick=clearF);
 const fn=(S.topic?1:0)+(S.tag?1:0)+(S.view!=='topic'?1:0);$('#filterBtn').innerHTML=`${ICON.filter}筛选${fn?` <span class="badge">${fn}</span>`:''}`;
 $('#toc').innerHTML=G.map(([k,v])=>`<button type="button" class="chip" data-k="${esc(k)}">${esc(S.view==='topic'?k:v[0].name)} <span class="n">${v.length}</span></button>`).join('');
 if(!list.length){$('#list').innerHTML=`<div class="state" role="status"><div class="ico" aria-hidden="true">∅</div><h2>没有匹配的帖子</h2><p>换个关键词，或清除筛选查看全部 ${D.posts.length} 条。</p><div class="acts"><button class="btn btn-primary" onclick="clearF()">清除筛选</button></div></div>`;return}
 $('#list').innerHTML=G.map(([k,v],i)=>{const def=act?true:(S.view==='topic'?!LOW.has(k):false);const o=open[k]??def;const sh=full[k]?v.length:per;const ps=sortP(v);
  const title=S.view==='topic'?esc(k):`${esc(v[0].name)} <span class="meta">@${esc(k)}</span>`;
  return `<section class="group" id="${gid(k)}"><button class="group-h" aria-expanded="${o}" aria-controls="${gid(k)}-b" data-k="${esc(k)}"><h2>${title}</h2><span class="cnt">${v.length} 条</span><span class="chev">${ICON.chev}</span></button>
  <div class="group-body" id="${gid(k)}-b" ${o?'':'hidden'}>${o?ps.slice(0,sh).map(post).join('')+(v.length>sh?`<button class="btn more" data-more="${esc(k)}">显示全部 ${v.length} 条（还有 ${v.length-sh} 条）</button>`:''):''}${S.view==='blogger'&&o?`<a class="btn btn-text" href="bloggers.html?q=${encodeURIComponent(k)}">查看博主档案 →</a>`:''}</div></section>`}).join('');
}
function clearF(){S={view:S.view,topic:'',tag:'',q:''};$('#q').value='';writeURL(true);render()}
window.clearF=clearF;
function drawer(){const tags=[...new Set(D.posts.flatMap(p=>p.tags||[]))],tc={};D.posts.forEach(p=>(p.tags||[]).forEach(t=>tc[t]=(tc[t]||0)+1));tags.sort((a,b)=>tc[b]-tc[a]);
 const d=document.createElement('div');d.innerHTML=`<div class="drawer-mask"></div><div class="drawer" role="dialog" aria-modal="true" aria-labelledby="dh"><div class="drawer-h"><h2 id="dh" style="font-size:17px">筛选</h2><button class="icon-btn" id="dx" aria-label="关闭">✕</button></div>
 <h3>视图</h3><div class="seg" role="group"><button aria-pressed="${S.view==='topic'}" data-v="topic">按主题</button><button aria-pressed="${S.view==='blogger'}" data-v="blogger">按博主</button></div>
 <h3>主题</h3><div class="chips">${['',...ORDER].map(t=>`<button class="chip" aria-pressed="${S.topic===t}" data-t="${esc(t)}">${t||'全部'}</button>`).join('')}</div>
 <h3>标签</h3><div class="chips">${['',...tags].map(t=>`<button class="chip" aria-pressed="${S.tag===t}" data-g="${esc(t)}">${t?'#'+esc(t)+` <span class="n">${tc[t]}</span>`:'全部'}</button>`).join('')}</div>
 <div class="drawer-foot"><button class="btn" id="dr">重置</button><button class="btn btn-primary" id="dok">完成</button></div></div>`;
 document.body.appendChild(d);const last=document.activeElement,close=()=>{d.remove();removeEventListener('keydown',k);last?.focus()},k=e=>e.key==='Escape'&&close();addEventListener('keydown',k);
 d.querySelector('#dx').focus();
 d.onclick=e=>{const b=e.target.closest('button,.drawer-mask');if(!b)return;
  if(b.matches('.drawer-mask,#dx,#dok'))return close();
  if(b.id==='dr'){S={view:'topic',topic:'',tag:'',q:S.q}}
  if(b.dataset.v)S.view=b.dataset.v;if(b.dataset.t!==undefined)S.topic=b.dataset.t;if(b.dataset.g!==undefined)S.tag=b.dataset.g;
  open={};full={};writeURL(true);render();close();drawer()}}
function goHash(){const h=decodeURIComponent(location.hash.slice(1));if(!h)return;
 if(h.startsWith('post-')){const p=D.posts.find(x=>'post-'+x.id===h);if(!p)return;const k=S.view==='topic'?(ORDER.includes(p.topic)?p.topic:'其他/闲聊'):p.handle;open[k]=true;full[k]=true;render()}
 const el=document.getElementById(h);if(!el)return;el.querySelector('details')?.setAttribute('open','');el.scrollIntoView({block:'start'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),2400)}
(async()=>{
 const d=qs.get('d');
 try{IDX=await loadJSON('index.json')}catch(e){return fail()}
 const ds=(IDX||[]).map(x=>x.date).sort();
 if(!d){if(ds.length)return location.replace('issue.html?d='+ds.at(-1));return m.innerHTML=stateHTML({icon:'∅',title:'还没有任何一期',text:'第一期发布后会显示在这里。',acts:'<a class="btn" href="index.html">返回首页</a>'})}
 try{D=/^\d{4}-\d{2}-\d{2}$/.test(d)?await loadJSON(d+'.json'):null}catch(e){return fail()}
 if(!D){document.title='未找到 '+d+' · AI博主日报';return m.innerHTML=stateHTML({icon:'?',title:`未找到 ${esc(d)} 这期`,text:`可能当天没有发布，或链接有误。最近一期是 ${ds.at(-1)||'—'}。`,acts:`${ds.length?`<a class="btn btn-primary" href="issue.html?d=${ds.at(-1)}">看最近一期（${ds.at(-1)}）</a>`:''}<a class="btn" href="index.html">返回首页 · 按日历找</a>`})}
 D.posts=D.posts||[];readURL();document.title=`${D.date} · AI博主日报`;
 const i=ds.indexOf(D.date),prev=ds[i-1],next=ds[i+1],picks=sortP(D.posts.filter(p=>p.highlight)),ins=D.insights||[];
 m.innerHTML=`<header><p class="meta" style="margin:0">${wd(D.date)} · ${esc(D.window||'')}</p><div class="issue-head"><h1>${D.date}</h1><nav class="pager" aria-label="期间导航">${prev?`<a class="btn" href="issue.html?d=${prev}" rel="prev" aria-label="上一期 ${prev}">‹<span class="pl"> 上一期</span></a>`:'<span class="btn" aria-disabled="true">‹<span class="pl"> 上一期</span></span>'}${next?`<a class="btn" href="issue.html?d=${next}" rel="next" aria-label="下一期 ${next}"><span class="pl">下一期 </span>›</a>`:'<span class="btn" aria-disabled="true"><span class="pl">下一期 </span>›</span>'}</nav></div>
  <p class="meta" style="margin:2px 0 0">${D.blogger_count??'—'} 位博主发帖 · ${D.post_count??D.posts.length} 条帖子 · ${(D.silent||[]).length} 位未发帖</p></header>
 ${D.summary?tldr(D.summary):''}
 ${ins.length?`<section class="insights" aria-labelledby="h-ins"><div class="section-h"><h2 id="h-ins">学习海绵见解</h2><span class="meta">${ins.length} 条 · 先看启发</span></div><div class="ins-grid">${ins.map((x,n)=>{const[t,r]=takeSplit(x.body||'');return `<article class="ins" id="insight-${n+1}"><div class="ins-t"><span class="num">${n+1}</span><h3>${esc(x.title)}</h3><button class="icon-btn copy" data-copy="insight-${n+1}" aria-label="复制第 ${n+1} 条链接">${ICON.link}</button></div><p class="take">${esc(t)}</p>${r?`<details><summary>展开依据</summary><p>${esc(r)}</p></details>`:''}</article>`}).join('')}</div></section>`:''}
 ${picks.length?`<section class="section picks" aria-labelledby="h-pick"><div class="section-h"><h2 id="h-pick">★ 今日推荐</h2><span class="meta">${picks.length} 条</span></div>${picks.map(post).join('').replace(/id="post-/g,'id="pick-')}</section>`:''}
 <div class="toolbar" role="search"><div class="tb-row"><div class="search-in">${ICON.search}<label class="sr" for="q">在本期中搜索</label><input id="q" type="search" placeholder="在本期中搜索" value="${esc(S.q)}"></div><button class="btn" id="filterBtn" aria-haspopup="dialog"></button></div></div>
 <div class="result-bar" id="count" aria-live="polite"></div>
 <nav class="toc" id="toc" aria-label="分类目录"></nav>
 <div id="list"></div>
 ${(D.silent||[]).length?`<details class="fold fold-silent card"><summary>本期未发帖的博主（${D.silent.length}）</summary><p class="meta" style="margin:0">${D.silent.map(s=>esc(typeof s==='string'?s:(s.name||s.handle))).join('、')}</p></details>`:''}
 <p class="foot">数据窗口为北京时间 · 结论只基于帖子文字</p>`;
 render();window.aiddMountToggle&&aiddMountToggle(document.querySelector('.tb-row'));
 let t;$('#q').oninput=e=>{clearTimeout(t);t=setTimeout(()=>{S.q=e.target.value.trim();writeURL(false);render()},200)};
 $('#filterBtn').onclick=drawer;
 m.addEventListener('click',e=>{const g=e.target.closest('.group-h'),mo=e.target.closest('[data-more]'),c=e.target.closest('[data-copy]'),tc=e.target.closest('.toc .chip');
  if(g){const k=g.dataset.k;open[k]=g.getAttribute('aria-expanded')!=='true';render();document.getElementById(gid(k)).querySelector('.group-h').focus()}
  if(mo){full[mo.dataset.more]=true;render()}
  if(c){const u=location.href.split('#')[0]+'#'+c.dataset.copy;navigator.clipboard?.writeText(u);c.setAttribute('aria-label','已复制');c.innerHTML='✓'}
  if(tc){e.preventDefault();const k=tc.dataset.k;open[k]=true;render();document.getElementById(gid(k)).scrollIntoView({behavior:'smooth'})}});
 addEventListener('popstate',()=>{readURL();$('#q').value=S.q;render()});
 if((active()||S.view!=='topic')&&!location.hash)$('.toolbar').scrollIntoView();goHash();addEventListener('hashchange',goHash);
})();
function fail(){m.innerHTML=stateHTML({kind:'err',icon:'!',title:'这期内容加载失败',text:'可能是网络不稳定，数据本身没有问题。',acts:`<button class="btn btn-primary" onclick="location.reload()">重试</button><a class="btn" href="index.html">返回首页</a>`})}
