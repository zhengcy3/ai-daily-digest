nav('index');
const takeOf=b=>{const i=b.indexOf('启发：');return i>=0?b.slice(i+3):(b.split(/(?<=[。！？])/)[0])};
(async()=>{
  const m=$('#main');let idx;
  try{idx=await loadJSON('index.json')}catch(e){idx=undefined}
  if(idx===undefined){m.innerHTML=stateHTML({kind:'err',icon:'!',title:'加载失败',text:'期刊列表暂时无法读取，可能是网络问题。',acts:`<button class="btn btn-primary" onclick="location.href=location.pathname">重试</button>`});return}
  if(!idx||!idx.length){m.innerHTML=stateHTML({icon:'∅',title:'还没有任何一期',text:'第一期发布后会显示在这里。'});return}
  idx.sort((a,b)=>b.date.localeCompare(a.date));
  const latest=idx[0],dates=new Set(idx.map(x=>x.date));
  const L=await loadJSON(latest.date+'.json').catch(()=>null);
  const ins=(L&&L.insights)||[];
  m.innerHTML=`<div class="home-grid"><div>
  <section class="card hero" aria-labelledby="h-latest">
   <div class="hero-top"><span class="badge badge-new">最新一期</span><span class="meta">${wd(latest.date)} · ${latest.blogger_count} 位博主 · ${latest.post_count} 条帖子</span></div>
   <h1 id="h-latest" style="margin-top:8px">${latest.date}</h1>
   ${(()=>{const p=String(latest.summary||'').split('；').map(x=>x.trim()).filter(Boolean);return p.length>1?`<ul class="summary is-list tldr-list" id="sum">${p.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p class="summary" id="sum">${esc(latest.summary)}</p>`})()}
   <button class="btn-text btn" id="sumBtn" aria-controls="sum" aria-expanded="false">展开总结</button>
   ${ins.length?`<div class="kicker">学习海绵见解 · ${ins.length} 条</div><ol class="insight-list">${ins.map((x,i)=>`<li><a href="issue.html?d=${latest.date}#insight-${i+1}"><span class="num">${i+1}</span><span>${esc(x.title)}</span></a></li>`).join('')}</ol>`:''}
   <div class="hero-actions"><a class="btn btn-primary" href="issue.html?d=${latest.date}">阅读本期 →</a></div>
  </section>
  <section class="section only-m" aria-labelledby="h-jump"><div class="section-h"><h2 id="h-jump">按日期</h2></div><div class="strip" id="strip"></div>
   <form class="date-jump" id="djm"><label class="sr" for="dm">选择日期</label><input type="date" id="dm" min="${idx.at(-1).date}" max="${latest.date}" value="${latest.date}"><button class="btn">前往</button></form></section>
  <section class="section" aria-labelledby="h-arch"><div class="section-h"><h2 id="h-arch">往期</h2><span class="meta">共 ${idx.length} 期</span></div><div id="arch"></div></section>
  </div>
  <aside class="aside only-d"><section class="card" aria-labelledby="h-cal"><div class="cal-h"><button class="icon-btn" id="pm" aria-label="上个月">‹</button><h2 id="h-cal" style="font-size:16px" aria-live="polite"></h2><button class="icon-btn" id="nm" aria-label="下个月">›</button></div><div class="cal" id="cal"></div>
   <p class="meta" style="margin:8px 0 0">高亮日期有内容，可点击</p></section>
   <form class="card" role="search" action="search.html" style="margin-top:16px"><label for="hq" style="font-weight:600">搜索所有期</label><div class="date-jump"><input id="hq" name="q" type="search" placeholder="如 Claude、沙箱"><button class="btn btn-primary">搜索</button></div></form></aside></div>
  <p class="foot">每天汇总 AI 博主一手观点 · 学习海绵见解</p>`;
  const s=$('#sum'),sb=$('#sumBtn');
  if(s.scrollHeight<=s.clientHeight+2)sb.hidden=true;
  sb.onclick=()=>{const o=s.classList.toggle('open');sb.textContent=o?'收起':'展开总结';sb.setAttribute('aria-expanded',o)};
  // 14 天日期条
  const day=(d,k)=>{const t=new Date(d+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+k);return t.toISOString().slice(0,10)};
  let st='';for(let k=0;k<14;k++){const d=day(latest.date,-k),t=`<span>${wd(d).slice(1)}</span><b>${+d.slice(8)}</b>`;st+=dates.has(d)?`<a href="issue.html?d=${d}" aria-label="${d}">${t}</a>`:`<span aria-disabled="true" aria-label="${d} 无内容">${t}</span>`}
  $('#strip').innerHTML=st;
  $('#djm').onsubmit=e=>{e.preventDefault();location.href='issue.html?d='+$('#dm').value};
  // 月历
  let ym=latest.date.slice(0,7);
  const cal=()=>{const [y,mo]=ym.split('-').map(Number),first=new Date(Date.UTC(y,mo-1,1)).getUTCDay(),n=new Date(Date.UTC(y,mo,0)).getUTCDate();
    $('#h-cal').textContent=`${y} 年 ${mo} 月`;let h=[...WD].map(w=>`<div class="wd" aria-hidden="true">${w}</div>`).join('')+'<div></div>'.repeat(first),any=0;
    for(let i=1;i<=n;i++){const d=`${ym}-${String(i).padStart(2,'0')}`;if(dates.has(d)){any=1;h+=`<a class="d" href="issue.html?d=${d}" aria-label="${d} 有内容">${i}</a>`}else h+=`<span class="d" aria-disabled="true">${i}</span>`}
    if(!any)h+='<div class="cal-empty">本月无内容</div>';$('#cal').innerHTML=h};
  const sh=k=>{const [y,mo]=ym.split('-').map(Number),t=new Date(Date.UTC(y,mo-1+k,1));ym=t.toISOString().slice(0,7);cal()};
  $('#pm').onclick=()=>sh(-1);$('#nm').onclick=()=>sh(1);cal();
  // 往期列表：按月分组 + 懒加载要点
  let h='',cm='';
  idx.forEach(x=>{const mo=x.date.slice(0,7);if(mo!==cm){cm=mo;h+=`<h3 class="month-h">${mo.replace('-',' 年 ')} 月</h3>`}
    h+=`<a class="card issue-card" href="issue.html?d=${x.date}" data-d="${x.date}"><div class="row"><span class="date">${x.date} <span class="meta" style="font-weight:400">${wd(x.date)}</span></span><span class="meta">${x.blogger_count} 博主 · ${x.post_count} 帖</span></div><p class="sum">${esc(x.summary)}</p><div class="pts"><div class="skeleton" style="width:70%"></div><div class="skeleton" style="width:55%"></div></div></a>`});
  $('#arch').innerHTML=h;
  const io=new IntersectionObserver(es=>es.forEach(async e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const p=e.target.querySelector('.pts');
    try{const j=await loadJSON(e.target.dataset.d+'.json');const t=(j?.insights||[]).slice(0,3);p.innerHTML=t.length?`<ul>${t.map(i=>`<li>${esc(i.title)}</li>`).join('')}</ul>`:''}catch(_){p.innerHTML=''}}),{rootMargin:'300px'});
  document.querySelectorAll('.issue-card').forEach(c=>io.observe(c));
})();
